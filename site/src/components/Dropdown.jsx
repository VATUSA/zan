import { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'

// variant="badge" drops the pill styling and chevron so a custom label (the account badge)
// can be the whole button.
function Dropdown({ label, children, variant }) {
  const [open, setOpen] = useState(false)
  const ref = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        setOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className={
          variant === 'badge'
            ? 'flex items-center ml-2 rounded-xl hover:opacity-90 focus-visible:outline focus-visible:outline-2 focus-visible:outline-gold'
            : 'flex items-center gap-1.5 px-3.5 py-2 rounded-full text-muted hover:text-ink hover:bg-white/[0.07] text-[14.5px] font-semibold'
        }
      >
        {label}
        {variant !== 'badge' && (
          <svg
            className={`w-3.5 h-3.5 transition-transform ${open ? 'rotate-180' : ''}`}
            viewBox="0 0 12 8"
            fill="none"
          >
            <path d="M1 1.5L6 6.5L11 1.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        )}
      </button>

      {open && (
        <div className="absolute top-full right-0 mt-2 min-w-[200px] rounded-2xl bg-[#0A1330] border border-white/10 shadow-xl py-2 z-50">
          {children}
        </div>
      )}
    </div>
  )
}

export function DropdownItem({ to, onClick, children }) {
  const className = 'block px-4 py-2.5 text-sm font-semibold text-muted2 hover:text-ink hover:bg-white/[0.06]'

  if (onClick) {
    return (
      <button onClick={onClick} className={`w-full text-left ${className}`}>
        {children}
      </button>
    )
  }

  return (
    <Link to={to} className={className}>
      {children}
    </Link>
  )
}

export default Dropdown