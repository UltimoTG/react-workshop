import React, { useEffect, useState } from 'react'
import { saveClapsToDatabase } from './utils'

export const ClapButton = () => {
  const [claps, setClaps] = useState(0)
  const [queueClaps, setQueueClaps] = useState(0)

  function clap() {
    setQueueClaps(queueClaps + 1)
  }

  useEffect(() => {
    if (queueClaps > 0) {
      const timeoutId = setTimeout(() => {
        saveClapsToDatabase(queueClaps).then((latestClaps) => {
          // When this promise resolves, it gives you the most recent latest
          // claps from the database
          setQueueClaps(0)
          setClaps(latestClaps)
        })
      }, 1000)
      return () => clearTimeout(timeoutId)
    }
  }, [queueClaps])

  return (
    <div className="text-center spacing">
      <button onClick={clap} className="button">
        Clap
      </button>
      <hr />
      <div className="horizontal-spacing">
        <span>Queue Claps: {queueClaps}</span>
        <span>Claps: {claps}</span>
      </div>
    </div>
  )
}
