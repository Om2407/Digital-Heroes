import HeroSection from '../components/HeroSection'
import HowItWorks from '../components/HowItWorks'
import CharitySection from '../components/CharitySection'
import PricingSection from '../components/PricingSection'

export default function Home() {
  return (
    <main>
      <HeroSection />
      <HowItWorks />
      <CharitySection />
      <PricingSection />

      {/* Draw Section */}
      <section id="draw" className="py-24 px-6 bg-white/[0.02]">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Monthly <span className="text-emerald-400">Prize Draw</span>
          </h2>
          <p className="text-white/50 text-lg max-w-xl mx-auto mb-12">
            Every month, 5 numbers are drawn. Match them with your golf scores to win your share of the prize pool.
          </p>

          {/* Draw Example */}
          <div className="flex items-center justify-center gap-4 mb-12 flex-wrap">
            {[12, 27, 8, 35, 19].map((num, i) => (
              <div
                key={i}
                className="w-16 h-16 rounded-full bg-emerald-500/20 border-2 border-emerald-500/50 flex items-center justify-center text-emerald-400 font-bold text-xl"
              >
                {num}
              </div>
            ))}
          </div>

          {/* Prize Tiers */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-3xl mx-auto mb-12">
            {[
              { match: '5 Numbers', share: '40%', label: 'Jackpot', color: 'emerald' },
              { match: '4 Numbers', share: '35%', label: 'Major Prize', color: 'blue' },
              { match: '3 Numbers', share: '25%', label: 'Prize', color: 'purple' },
            ].map((tier) => (
              <div
                key={tier.match}
                className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-emerald-500/30 transition"
              >
                <div className="text-3xl font-bold text-emerald-400 mb-1">{tier.share}</div>
                <div className="text-white font-semibold mb-1">{tier.label}</div>
                <div className="text-white/40 text-sm">Match {tier.match}</div>
              </div>
            ))}
          </div>

          <a
            href="/signup"
            className="inline-block bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
          >
            Join the Next Draw →
          </a>
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-24 px-6">
        <div className="max-w-4xl mx-auto bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-12 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent pointer-events-none" />
          <h2 className="text-4xl md:text-5xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-white/60 text-lg max-w-xl mx-auto mb-8">
            Join thousands of golfers who are winning prizes and changing lives every single month.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/signup"
              className="bg-emerald-500 hover:bg-emerald-400 text-black font-bold px-8 py-4 rounded-full text-lg transition-all hover:scale-105"
            >
              Get Started Today
            </a>
            <a
              href="/charities"
              className="bg-white/10 hover:bg-white/20 text-white font-bold px-8 py-4 rounded-full text-lg transition-all"
            >
              Browse Charities
            </a>
          </div>
        </div>
      </section>
    </main>
  )
}