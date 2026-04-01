const charities = [
  { name: 'Cancer Research UK', cause: 'Medical Research', raised: '£24,300', emoji: '🎗️' },
  { name: 'Mental Health Foundation', cause: 'Mental Wellness', raised: '£18,750', emoji: '🧠' },
  { name: 'British Heart Foundation', cause: 'Heart Disease', raised: '£31,200', emoji: '❤️' },
  { name: 'Macmillan Cancer Support', cause: 'Cancer Support', raised: '£15,600', emoji: '🌿' },
]

export default function CharitySection() {
  return (
    <section id="charities" className="py-24 px-6 bg-white/[0.02]">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Your Game,{' '}
            <span className="text-emerald-400">Their Future</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Every subscription contributes to real charities making real impact. You choose where your money goes.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
          {charities.map((charity) => (
            <div
              key={charity.name}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 text-center hover:border-emerald-500/40 transition-all group"
            >
              <div className="text-5xl mb-4">{charity.emoji}</div>
              <h3 className="font-bold text-lg mb-1 group-hover:text-emerald-400 transition">{charity.name}</h3>
              <p className="text-white/40 text-sm mb-4">{charity.cause}</p>
              <div className="bg-emerald-500/10 rounded-full px-3 py-1 text-emerald-400 text-sm font-semibold">
                {charity.raised} raised
              </div>
            </div>
          ))}
        </div>

        <div className="text-center">
          <a href="/charities" className="text-emerald-400 hover:text-emerald-300 text-sm underline underline-offset-4 transition">
            View all 50+ charities →
          </a>
        </div>
      </div>
    </section>
  )
}