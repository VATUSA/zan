import Navbar from '../components/Navbar'
import Footer from '../components/Footer'
import FilesTabs from '../components/FilesTabs'

function FilesSops() {
  return (
    <div className="min-h-screen bg-navy text-ink font-mulish">
      <Navbar />
      <div className="max-w-[900px] mx-auto px-6 sm:px-10 py-10 sm:py-16">
        <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight mb-2">Files</h1>
        <p className="text-muted mb-8">SOPs, LOAs, training materials, policies, and resources.</p>
        <FilesTabs />
        <p className="text-2xl sm:text-3xl font-bold break-words">
          For SOPs, see{' '}
          <a
            href="https://sops.zanartcc.org/"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold hover:text-goldLight underline"
          >
            sops.zanartcc.org
          </a>
        </p>
      </div>
      <Footer />
    </div>
  )
}

export default FilesSops
