import { useState, useId, useMemo, useTransition, useCallback } from 'react'
import { Link } from 'react-router-dom'
import { api } from '~/utils/api'
import { Heading } from '~/Heading'
import { Loading } from '~/Loading'
import { NoResults } from '~/NoResults'
import { DataGrid, Row, Col } from '~/DataGrid'
import { RecentLessons } from '~/RecentLessons'
import { AppSidebar } from '~/AppSidebar'
import type { CourseWithLessons } from '~/utils/types'
import { useCourses } from './useCourses'

export function BrowseCourses() {
  const allCourses = useCourses()
  const [courses, setCourses] = useState(allCourses)

  const [minLessons, setMinLessons] = useState(0)
  const filterLessonsId = useId()
  const [pending, startTransition] = useTransition()

  function filterCourses(minLessons: number) {
    setMinLessons(minLessons)
    startTransition(() => {
      setCourses(allCourses?.filter((c) => c.lessons.length >= minLessons))
    })
  }

  const removeCourse = useCallback((courseId: number) => {
    api.courses.removeCourse(courseId).then(() => {
      // refetch()
    })
  }, [])

  return (
    <div className="flex flex-gap">
      <div className="card flex-1 spacing">
        <div className="flex-split">
          <div>
            <Heading>Courses</Heading>
            <div>
              Showing {courses?.length}
              {pending && '...'}
            </div>
          </div>
          <div>
            <label htmlFor={filterLessonsId} className="block text-small">
              Filter Lessons: At least {minLessons} lessons
            </label>

            <input
              id={filterLessonsId}
              type="range"
              className="block"
              style={{ width: '220px' }}
              min="0"
              max="5"
              step="any"
              defaultValue={0}
              onChange={(e) => filterCourses(parseInt(e.target.value))}
            />
          </div>
        </div>

        {Array.isArray(courses) && courses.length === 0 ? (
          <NoResults>
            <div className="spacing">
              <p>No Courses</p>
              <Link to="add" className="button">
                Add Course
              </Link>
            </div>
          </NoResults>
        ) : (
          <>
            {courses && <CourseList courses={courses} removeCourse={removeCourse} />}
            <footer>
              <Link to="add" className="button">
                Add Course
              </Link>
            </footer>
          </>
        )}
      </div>
      <AppSidebar>
        <RecentLessons />
      </AppSidebar>
    </div>
  )
}

type Props = {
  courses: CourseWithLessons[]
  removeCourse(id: number): void
}

const CourseList = memo(({ courses, removeCourse }: Props) => {
  return (
    <DataGrid>
      {courses?.map((course) => {
        return (
          <Row key={course.id}>
            <Col flex>
              <Link to={`${course.slug}`} className="text-large">
                <b>{course.name}</b>
              </Link>
            </Col>
            <Col width={150}>Lessons: {course.lessons.length}</Col>
            <Col>
              <button
                className="button button-small button-outline"
                onClick={() => removeCourse(course.id)}
              >
                Remove
              </button>
            </Col>
          </Row>
        )
      })}
    </DataGrid>
  )
})
