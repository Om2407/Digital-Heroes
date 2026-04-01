import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const location = useLocation()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10">
      <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2">
          <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
            <span className="text-black font-bold text-sm">G</span>
          </div>
          <span className="font-bold text-lg tracking-tight">GolfGives</span>
        </Link>

        {/* Desktop Links */}
        <div className="hidden md:flex items-center gap-8 text-sm text-white/70">
          <a href="/#how-it-works" className="hover:text-white transition">How It Works</a>
          <a href="/#charities" className="hover:text-white transition">Charities</a>
          <a href="/#pricing" className="hover:text-white transition">Pricing</a>
          <Link
            to="/charities"
            className={`hover:text-white transition ${isActive('/charities') ? 'text-emerald-400' : ''}`}
          >
            Browse Charities
          </Link>
        </div>

        {/* CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <Link
            to="/login"
            className="text-sm text-white/70 hover:text-white transition px-4 py-2"
          >
            Login
          </Link>
          <Link
            to="/signup"
            className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-5 py-2 rounded-full transition hover:scale-105"
          >
            Get Started
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpen(!open)}
          className="md:hidden text-white text-xl p-2"
        >
          {open ? '✕' : '☰'}
        </button>
      </div>

      {/* Mobile Menu */}
      {open && (
        <div className="md:hidden bg-[#111] border-t border-white/10 px-6 py-6 flex flex-col gap-5 text-sm">
          <a href="/#how-it-works" onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
            How It Works
          </a>
          <a href="/#charities" onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
            Charities
          </a>
          <a href="/#pricing" onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
            Pricing
          </a>
          <Link to="/charities" onClick={() => setOpen(false)} className="text-white/70 hover:text-white transition">
            Browse Charities
          </Link>
          <div className="flex flex-col gap-3 pt-2 border-t border-white/10">
            <Link
              to="/login"
              onClick={() => setOpen(false)}
              className="text-white/70 hover:text-white transition"
            >
              Login
            </Link>
            <Link
              to="/signup"
              onClick={() => setOpen(false)}
              className="bg-emerald-500 text-black font-semibold px-4 py-2 rounded-full text-center hover:bg-emerald-400 transition"
            >
              Get Started
            </Link>
          </div>
        </div>
      )}
    </nav>
  )
}