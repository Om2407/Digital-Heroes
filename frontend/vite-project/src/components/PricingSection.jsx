import { Link } from 'react-router-dom'

const plans = [
  {
    name: 'Monthly',
    price: '£9.99',
    period: '/month',
    features: [
      'Monthly draw entry',
      'Score tracking (5 scores)',
      'Charity contribution (min 10%)',
      'Winner prize pool access',
      'Full dashboard access',
    ],
    cta: 'Start Monthly',
    highlight: false,
  },
  {
    name: 'Yearly',
    price: '£89.99',
    period: '/year',
    badge: 'Save 25%',
    features: [
      'Everything in Monthly',
      '2 months free',
      'Priority draw entry',
      'Increased charity impact',
      'Exclusive yearly badge',
    ],
    cta: 'Start Yearly',
    highlight: true,
  },
]

export default function PricingSection() {
  return (
    <section id="pricing" className="py-24 px-6">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple Pricing</h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto">
            One subscription. Unlimited impact. Monthly draws every single month.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-8 border transition-all ${
                plan.highlight
                  ? 'bg-emerald-500/10 border-emerald-500/50 scale-105'
                  : 'bg-white/5 border-white/10 hover:border-white/20'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-emerald-500 text-black text-xs font-bold px-4 py-1 rounded-full">
                  {plan.badge}
                </div>
              )}

              <h3 className="text-2xl font-bold mb-2">{plan.name}</h3>
              <div className="flex items-end gap-1 mb-6">
                <span className="text-4xl font-extrabold text-emerald-400">{plan.price}</span>
                <span className="text-white/40 text-sm mb-1">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-8">
                {plan.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm text-white/70">
                    <span className="text-emerald-400 font-bold">✓</span>
                    {f}
                  </li>
                ))}
              </ul>

              <Link
                to="/signup"
                className={`block text-center font-bold py-3 rounded-full transition-all hover:scale-105 ${
                  plan.highlight
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-black'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {plan.cta}
              </Link>
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}