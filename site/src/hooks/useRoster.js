import { useState, useEffect } from 'react'

export function useRoster() {
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetch('http://localhost:4000/api/roster')
      .then((res) => res.json())
      .then((data) => {
        setRoster(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load roster')
        setLoading(false)
      })
  }, [])

  return { roster, loading, error }
}