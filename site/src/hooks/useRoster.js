import { useState, useEffect, useCallback } from 'react'
import { API_URL } from '../config'

export function useRoster() {
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRoster = useCallback(() => {
    setLoading(true)
    fetch(`${API_URL}/api/roster`, { credentials: 'include' })
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