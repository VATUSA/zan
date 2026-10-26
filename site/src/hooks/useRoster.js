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
    // Standard fetch-on-mount; fetchRoster's own setLoading/setState calls are what this
    // rule is tracing through here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchRoster()
  }, [fetchRoster])

  return { roster, loading, error, refetch: fetchRoster }
}
