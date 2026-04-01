const steps = [
  {
    number: '01',
    title: 'Subscribe',
    desc: 'Choose a monthly or yearly plan. A portion of every subscription goes directly to your chosen charity.',
    icon: '🎯',
  },
  {
    number: '02',
    title: 'Enter Your Scores',
    desc: 'Log your last 5 Stableford golf scores. Your score history powers your draw entries.',
    icon: '⛳',
  },
  {
    number: '03',
    title: 'Enter the Draw',
    desc: 'Every month, a draw is run. Match 3, 4, or all 5 numbers to win prizes from the pool.',
    icon: '🎰',
  },
  {
    number: '04',
    title: 'Give Back',
    desc: 'Your subscription automatically contributes to your selected charity every month.',
    icon: '❤️',
  },
]

export default function HowItWorks() {
  return (
    <section id="how-it-works" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">How It Works</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            Four simple steps to play, win, and make a difference.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step) => (
            <div
              key={step.number}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/40 hover:bg-white/[0.08] transition-all group"
            >
              <div className="text-4xl mb-4">{step.icon}</div>
              <div className="text-emerald-400 text-sm font-mono mb-2">{step.number}</div>
              <h3 className="text-xl font-bold mb-2 group-hover:text-emerald-400 transition">{step.title}</h3>
              <p className="text-white/50 text-sm leading-relaxed">{step.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}