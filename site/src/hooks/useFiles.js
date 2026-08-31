import { useState, useEffect, useCallback } from 'react'

export function useFiles() {
  const [files, setFiles] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  const fetchFiles = useCallback(() => {
    setLoading(true)
    fetch('http://localhost:4000/api/files', { credentials: 'include' })
      .then((res) => res.json())
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