import { useState, useEffect, useCallback } from 'react'
import { apiGet } from '../utils/api'

export function useFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFiles = useCallback(() => {
    setLoading(true)
    setError(null)
    apiGet('/api/files')
      .then((data) => {
        setFiles(data)
        setLoading(false)
      })
      .catch(() => {
        setError('Could not load files')
        setLoading(false)
      })
  }, [])

  useEffect(() => {
    // Standard fetch-on-mount; fetchFiles's own setLoading/setState calls are what this
    // rule is tracing through here.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchFiles()
  }, [fetchFiles])

  return { files, loading, error, refetch: fetchFiles }
}
