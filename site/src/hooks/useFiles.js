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
    fetchFiles()
  }, [fetchFiles])

  return { files, loading, error, refetch: fetchFiles }
}
