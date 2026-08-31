import { useState, useEffect, useCallback } from 'react'

export function useRoster() {
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRoster = useCallback(() => {
    setLoading(true)
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

  useEffect(() => {
    fetchRoster()
  }, [fetchRoster])

  return { roster, loading, error, refetch: fetchRoster }
}