import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <section className="min-h-screen flex flex-col items-center justify-center text-center px-6 pt-24 pb-16 relative overflow-hidden">
      
      {/* Background Glow */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-emerald-900/20 rounded-full blur-3xl pointer-events-none" />

      {/* Badge */}
      <div className="mb-6 inline-flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-4 py-1.5 text-sm text-emerald-400">
        <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse" />
        Play Golf. Win Prizes. Change Lives.
      </div>

      {/* Heading */}
      <h1 className="text-5xl md:text-7xl font-extrabold tracking-tight leading-tight max-w-4xl mb-6">
        Golf That
        <span className="text-emerald-400"> Gives Back</span>
      </h1>

      {/* Subheading */}
      <p className="text-white/60 text-lg md:text-xl max-w-2xl mb-10">
        Subscribe, enter your scores, compete in monthly draws, and support the charity of your choice — all in one platform built for golfers who care.
      </p>

      {/* CTAs */}
      <div className="flex flex-col sm:flex-row gap-4 items-center">
        <Link
          to="/signup"
          className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
        >
          Start Your Journey →
        </Link>
        
        <a
          href="#how-it-works"
          className="text-white/60 hover:text-white text-sm underline underline-offset-4 transition"
        >
          See how it works
        </a>
      </div>

      {/* Stats */}
      <div className="mt-20 grid grid-cols-3 gap-8 text-center max-w-lg w-full">
        {[
          { label: 'Monthly Prize Pool', value: '£10,000+' },
          { label: 'Charities Supported', value: '50+' },
          { label: 'Active Golfers', value: '2,400+' },
        ].map((stat) => (
          <div key={stat.label}>
            <div className="text-2xl md:text-3xl font-bold text-emerald-400">{stat.value}</div>
            <div className="text-white/50 text-xs mt-1">{stat.label}</div>
          </div>
        ))}
      </div>
    </section>
  )
}