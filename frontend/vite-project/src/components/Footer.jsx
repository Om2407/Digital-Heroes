import { Link } from 'react-router-dom'

const footerLinks = {
  Platform: [
    { label: 'How It Works', href: '/#how-it-works' },
    { label: 'Pricing', href: '/#pricing' },
    { label: 'Monthly Draw', href: '/#draw' },
  ],
  Charities: [
    { label: 'Browse Charities', href: '/charities' },
    { label: 'Featured Causes', href: '/charities' },
    { label: 'Donate Directly', href: '/charities' },
  ],
  Account: [
    { label: 'Login', href: '/login' },
    { label: 'Sign Up', href: '/signup' },
    { label: 'Dashboard', href: '/dashboard' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0a0a0a] pt-16 pb-8 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Top Section */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">

          {/* Brand */}
          <div className="col-span-1">
            <Link to="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-emerald-500 rounded-full flex items-center justify-center">
                <span className="text-black font-bold text-sm">G</span>
              </div>
              <span className="font-bold text-lg">GolfGives</span>
            </Link>
            <p className="text-white/40 text-sm leading-relaxed">
              Play golf. Win prizes. Support the causes that matter most to you.
            </p>

            {/* Social Links */}
            <div className="flex gap-3 mt-6">
              {['𝕏', 'in', 'f'].map((icon) => (
                <a
                  key={icon}
                  href="#"
                  className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-white/50 hover:text-white hover:border-emerald-500/50 transition text-xs"
                >
                  {icon}
                </a>
              ))}
            </div>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="text-sm font-semibold text-white mb-4">{category}</h4>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.label}>
                    <Link
                      to={link.href}
                      className="text-white/40 text-sm hover:text-emerald-400 transition"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Divider */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <p className="text-white/30 text-sm">
            © 2026 GolfGives. All rights reserved.
          </p>
          <div className="flex gap-6 text-sm text-white/30">
            <a href="#" className="hover:text-white transition">Privacy Policy</a>
            <a href="#" className="hover:text-white transition">Terms of Service</a>
            <a href="#" className="hover:text-white transition">Cookie Policy</a>
          </div>
        </div>

      </div>
    </footer>
  )
}