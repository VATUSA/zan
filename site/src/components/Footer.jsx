import { Link } from 'react-router-dom'

function Footer() {
  return (
    <footer className="px-6 sm:px-10 pt-12 sm:pt-14 pb-11 border-t border-white/[0.14]">
      <div className="max-w-[1180px] mx-auto flex gap-8 flex-wrap items-start">
        <div className="max-w-[38ch]">
          <div className="flex items-center gap-3">
            <img src="/ZAN-ARTCC-logo.png" alt="" className="w-9 h-9" />
            <span className="font-extrabold text-[15px] tracking-tight">Anchorage ARTCC</span>
          </div>
          <p className="mt-4 text-[13.5px] text-muted3 leading-relaxed">
            A volunteer facility on the VATSIM network. Not affiliated with the FAA. Not for real-world navigation.
          </p>
        </div>
        <div className="flex gap-x-6 gap-y-2 flex-wrap sm:ml-auto text-sm font-semibold">
          <Link to="/roster" className="text-muted2 hover:text-ink">Roster</Link>
          <a href="https://skyvector.com/airport/PANC/Ted-Stevens-Anchorage-International-Airport" target="_blank" rel="noopener noreferrer" className="text-muted2 hover:text-ink">Charts</a>
          <span className="text-muted3 cursor-default">Discord</span>
          <a href="https://www.vatusa.net" target="_blank" rel="noopener noreferrer" className="text-muted2 hover:text-ink">VATUSA</a>
        </div>
      </div>
      <div className="max-w-[1180px] mx-auto mt-9 text-xs font-semibold text-[#4E5A7A]">
        © 2026 Anchorage ARTCC
      </div>
    </footer>
  )
}

export default Footer