import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../utils/api'

export function useRoster() {
  const [roster, setRoster] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchRoster = useCallback(() => {
    setLoading(true)
    setError(null)
    apiGet('/api/roster')
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
