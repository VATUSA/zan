import { useState } from 'react'
import { useAuth } from '../context/AuthContext'
import { hasMinimumRole } from '../utils/roles'

function FileList({ category, files, loading, onChange }) {
  const { user } = useAuth()
  const isSeniorStaff = hasMinimumRole(user?.zanRole, 'TA')

  const [title, setTitle] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [uploadError, setUploadError] = useState(null)

  const categoryFiles = files.filter((f) => f.category === category)

  const uploadFile = async (e) => {
    e.preventDefault()
    if (!selectedFile || !title.trim()) return

    setUploading(true)
    setUploadError(null)

    const formData = new FormData()
    formData.append('file', selectedFile)
    formData.append('title', title.trim())
    formData.append('category', category)

    const response = await fetch('http://localhost:4000/api/files', {
      method: 'POST',
      credentials: 'include',
      body: formData,
    })

    setUploading(false)

    if (!response.ok) {
      const data = await response.json()
      setUploadError(data.error || 'Upload failed')
      return
    }

    setTitle('')
    setSelectedFile(null)
    e.target.reset()
    onChange()
  }

  const deleteFile = async (id) => {
    await fetch(`http://localhost:4000/api/files/${id}`, {
      method: 'DELETE',
      credentials: 'include',
    })
    onChange()
  }

  return (
    <div>
      {isSeniorStaff && (
        <form
          onSubmit={uploadFile}
          className="rounded-2xl bg-gold/[0.06] border border-gold/20 p-6 mb-10"
        >
          <h2 className="font-bold text-lg mb-4">Upload to {category}</h2>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-muted2 mb-1.5">Title</label>
            <input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Anchorage Center SOP"
              className="w-full rounded-lg bg-white/[0.04] border border-white/10 px-3 py-2.5 text-ink placeholder:text-muted3"
            />
          </div>
          <div className="mb-4">
            <label className="block text-sm font-semibold text-muted2 mb-1.5">File</label>
            <input
              type="file"
              onChange={(e) => setSelectedFile(e.target.files[0])}
              className="text-sm text-muted2"
            />
          </div>
          {uploadError && <p className="text-sm text-red-400 mb-3">{uploadError}</p>}
          <button
            type="submit"
            disabled={uploading || !selectedFile || !title.trim()}
            className="px-6 py-2.5 rounded-lg bg-gold hover:bg-goldLight disabled:bg-white/10 disabled:text-muted3 disabled:cursor-not-allowed text-navy font-bold text-sm"
          >
            {uploading ? 'Uploading...' : 'Upload'}
          </button>
        </form>
      )}

      {loading && <p className="text-muted2">Loading files...</p>}

      {!loading && categoryFiles.length === 0 && (
        <p className="text-muted2">No files in this category yet.</p>
      )}

      {!loading && categoryFiles.length > 0 && (
        <div className="rounded-2xl border border-white/10 overflow-hidden divide-y divide-white/10">
          {categoryFiles.map((f) => (
            <div key={f.id} className="flex items-center justify-between px-5 py-3.5 bg-white/[0.02]">
              <div>
                <div className="font-semibold text-sm">{f.title}</div>
                <div className="text-xs text-muted3 mt-0.5">
                  {f.original_name}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <a
                  href={`http://localhost:4000/api/files/${f.id}/download`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-1.5 rounded-lg bg-gold/15 text-gold hover:bg-gold/25 text-sm font-bold"
                >
                  View
                </a>
                {isSeniorStaff && (
                  <button
                    onClick={() => deleteFile(f.id)}
                    className="text-red-400 hover:text-red-300 text-xs font-bold"
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}

export default FileList