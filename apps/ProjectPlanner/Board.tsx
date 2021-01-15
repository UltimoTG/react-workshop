import React, { useState, useEffect } from 'react'
import { useParams } from 'react-router-dom'
import { DragDropContext } from 'react-beautiful-dnd'
import { TaskGroup } from 'ProjectPlanner/TaskGroup'
import { Heading } from 'ProjectPlanner/Heading'
import api from 'ProjectPlanner/api'
import {
  TaskGroup as TaskGroupType,
  Board as BoardType,
  Task as TaskType,
} from 'ProjectPlanner/types'
import './Board.scss'

// https://www.freecodecamp.org/news/how-to-add-drag-and-drop-in-react-with-react-beautiful-dnd/

type BoardContextType = {
  getTask: (taskId: number) => TaskType | undefined
  updateTask: (taskId: number, task: TaskType) => void
  addTask: (taskGroupId: number) => void
  removeTask: (taskId: number) => void
}

export const BoardContext = React.createContext<BoardContextType>(null!)

export const Board: React.FC = () => {
  const boardId = parseInt(useParams<{ boardId: string }>().boardId)
  const [board, setBoard] = useState<BoardType | null>(null)
  const [tasks, setTasks] = useState<TaskType[] | null>(null)
  const taskGroups = board?.taskGroups

  useEffect(() => {
    let isCurrent = true
    api.boards.getBoard(boardId).then((board: BoardType) => {
      if (isCurrent) setBoard(board)
    })
    return () => {
      isCurrent = false
    }
  }, [boardId])

  useEffect(() => {
    let isCurrent = true
    api.boards.getTasks(boardId).then((tasks: TaskType[]) => {
      if (isCurrent) setTasks(tasks)
    })
    return () => {
      isCurrent = false
    }
  }, [boardId])

  function onDragEnd(result: any) {
    if (!result.destination || !board || !taskGroups) return
    const toIndex: number = result.destination.index
    const fromIndex: number = result.source.index
    const fromListId = parseInt(result.source.droppableId)
    const toListId = parseInt(result.destination.droppableId)
    const newTaskGroups = shuffleArray(taskGroups, fromListId, fromIndex, toListId, toIndex)

    setBoard({
      ...board,
      taskGroups: newTaskGroups,
    })

    api.boards.updateBoard(boardId, {
      ...board,
      taskGroups: newTaskGroups,
    })
  }

  const context: BoardContextType = {
    getTask: (taskId) => {
      return tasks?.find((t) => t.id === taskId)
    },
    updateTask: (taskId, task) => {
      api.boards.updateTask(taskId, task).then(() => {
        if (!tasks) return
        const i = tasks.findIndex((t) => t.id === taskId)
        setTasks([...tasks.slice(0, i), task, ...tasks.slice(i, tasks.length)])
      })
    },
    addTask: async (taskGroupId) => {
      if (!board || !taskGroups) return

      // Add Task
      const task: TaskType = await api.boards.addTask(boardId)
      setTasks(tasks!.concat([task]))

      // Add to Task Group
      const newTaskGroups = taskGroups.map((taskGroup) => {
        return taskGroup.taskGroupId !== taskGroupId
          ? taskGroup
          : { ...taskGroup, taskIds: taskGroup.taskIds.concat([task.id]) }
      })

      api.boards
        .updateBoard(boardId, {
          ...board,
          taskGroups: newTaskGroups,
        })
        .then(() => {
          setBoard({
            ...board,
            taskGroups: newTaskGroups,
          })
        })
    },
    removeTask: async (taskId) => {
      if (!board || !tasks || !taskGroups) return

      // Remove Task
      await api.boards.removeTask(taskId)
      setTasks(tasks.filter((task) => task.id !== taskId))

      // Remove Task from Group
      const newTaskGroups = taskGroups.map((taskGroup) => {
        return { ...taskGroup, taskIds: taskGroup.taskIds.filter((id) => id !== taskId) }
      })

      api.boards
        .updateBoard(boardId, {
          ...board,
          taskGroups: newTaskGroups,
        })
        .then(() => {
          setBoard({
            ...board,
            taskGroups: newTaskGroups,
          })
        })
    },
  }

  return (
    <DragDropContext onDragEnd={onDragEnd}>
      <BoardContext.Provider value={context}>
        <div className="board spacing">
          <Heading>Board Name</Heading>

          <div className="board-scroll-area">
            {taskGroups &&
              tasks &&
              taskGroups.map((taskGroup) => {
                return (
                  <div className="task-group-wrap" key={taskGroup.taskGroupId}>
                    <TaskGroup
                      taskGroupId={taskGroup.taskGroupId}
                      name={taskGroup.name}
                      taskIds={taskGroup.taskIds}
                      tasks={tasks}
                    />
                  </div>
                )
              })}
          </div>
        </div>
      </BoardContext.Provider>
    </DragDropContext>
  )
}

/**
 * Utils
 */

function shuffleArray(
  taskGroups: TaskGroupType[],
  fromListId: number,
  fromIndex: number,
  toListId: number,
  toIndex: number
): TaskGroupType[] {
  return taskGroups.map((taskGroup) => {
    const isTo = taskGroup.taskGroupId === toListId
    const isFrom = taskGroup.taskGroupId === fromListId
    const taskIds = [...taskGroup.taskIds]

    // Moving to and from same array
    if (isTo && isFrom) {
      taskIds.splice(toIndex, 0, taskIds.splice(fromIndex, 1)[0])
      return { ...taskGroup, taskIds }

      // Move to different array
    } else {
      if (isTo) {
        const fromItemId = taskGroups.find((l) => l.taskGroupId === fromListId)?.taskIds[fromIndex]
        if (fromItemId) {
          return {
            ...taskGroup,
            taskIds: [
              ...taskIds.slice(0, toIndex),
              fromItemId,
              ...taskIds.slice(toIndex, taskIds.length),
            ],
          }
        }
      } else if (isFrom) {
        return {
          ...taskGroup,
          taskIds: taskIds.filter((id) => id !== taskIds[fromIndex]),
        }
      }
    }

    return taskGroup
  })
}
