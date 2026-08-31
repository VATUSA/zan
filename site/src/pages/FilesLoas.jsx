import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FilesTabs from '../components/FilesTabs'
import FileList from '../components/FileList'
import { useFiles } from '../hooks/useFiles'

function FilesLoas() {
  const { files, loading, refetch } = useFiles()
  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-10 py-16">
        <h1 className="text-4xl font-extrabold tracking-tight mb-2">Files</h1>
        <p className="text-muted mb-8">SOPs, LOAs, training materials, and policies.</p>
        <FilesTabs />
        <FileList category="LOAs" files={files} loading={loading} onChange={refetch} />
      </div>
      <Footer />
    </div>
  )
}

export default FilesLoas