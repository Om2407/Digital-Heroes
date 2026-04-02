import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'

export default function Signup() {
  const navigate = useNavigate()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    plan: 'monthly',
    charityPercentage: 10,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value })
  }

  const handleStep1 = (e) => {
    e.preventDefault()
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match')
      return
    }
    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters')
      return
    }
    setError('')
    setStep(2)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('http://localhost:5000/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      const data = await res.json()

      if (!res.ok) {
        setError(data.message || 'Registration failed')
        return
      }

      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
      navigate('/pricing')
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-6 pt-24 pb-16 relative">

      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative">

        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 bg-emerald-500 rounded-full flex items-center justify-center">
              <span className="text-black font-bold">G</span>
            </div>
            <span className="font-bold text-xl">GolfGives</span>
          </Link>
          <h1 className="text-3xl font-bold mb-2">Create your account</h1>
          <p className="text-white/50 text-sm">Join thousands of golfers making a difference</p>
        </div>

        {/* Step Indicator */}
        <div className="flex items-center justify-center gap-3 mb-8">
          {[1, 2].map((s) => (
            <div key={s} className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all ${
                step >= s
                  ? 'bg-emerald-500 text-black'
                  : 'bg-white/10 text-white/40'
              }`}>
                {step > s ? '✓' : s}
              </div>
              {s < 2 && (
                <div className={`w-16 h-px transition-all ${
                  step > s ? 'bg-emerald-500' : 'bg-white/10'
                }`} />
              )}
            </div>
          ))}
        </div>

        {/* Form Card */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-8">

          {/* Error */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl px-4 py-3 text-red-400 text-sm mb-6">
              {error}
            </div>
          )}

          {/* Step 1 — Account Details */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-5">
              <h2 className="text-lg font-semibold mb-4">Account Details</h2>

              {/* Name */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required
                  placeholder="John Smith"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition text-sm"
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  placeholder="you@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition text-sm"
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Password</label>
                <input
                  type="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  required
                  placeholder="Min. 6 characters"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition text-sm"
                />
              </div>

              {/* Confirm Password */}
              <div>
                <label className="block text-sm text-white/60 mb-2">Confirm Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  required
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-white/30 focus:outline-none focus:border-emerald-500/50 transition text-sm"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-3 rounded-xl transition-all hover:scale-[1.02] mt-2"
              >
                Continue →
              </button>
            </form>
          )}

          {/* Step 2 — Plan Selection */}
          {step === 2 && (
            <form onSubmit={handleSubmit} className="space-y-5">
              <h2 className="text-lg font-semibold mb-4">Choose Your Plan</h2>

              {/* Plan Selection */}
              <div className="grid grid-cols-2 gap-4">
                {[
                  { value: 'monthly', label: 'Monthly', price: '£9.99/mo' },
                  { value: 'yearly', label: 'Yearly', price: '£89.99/yr', badge: 'Save 25%' },
                ].map((plan) => (
                  <label
                    key={plan.value}
                    className={`relative cursor-pointer rounded-xl border p-4 transition-all ${
                      formData.plan === plan.value
                        ? 'border-emerald-500 bg-emerald-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <input
                      type="radio"
                      name="plan"
                      value={plan.value}
                      checked={formData.plan === plan.value}
                      onChange={handleChange}
                      className="hidden"
                    />
                    {plan.badge && (
                      <span className="absolute -top-2 -right-2 bg-emerald-500 text-black text-xs font-bold px-2 py-0.5 rounded-full">
                        {plan.badge}
                      </span>
                    )}
                    <div className="font-semibold text-sm mb-1">{plan.label}</div>
                    <div className="text-emerald-400 font-bold">{plan.price}</div>
                  </label>
                ))}
              </div>

              {/* Charity Percentage */}
              <div>
                <label className="block text-sm text-white/60 mb-2">
                  Charity Contribution: <span className="text-emerald-400 font-bold">{formData.charityPercentage}%</span>
                </label>
                <input
                  type="range"
                  name="charityPercentage"
                  min="10"
                  max="50"
                  value={formData.charityPercentage}
                  onChange={handleChange}
                  className="w-full accent-emerald-500"
                />
                <div className="flex justify-between text-xs text-white/30 mt-1">
                  <span>10% (min)</span>
                  <span>50%</span>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 mt-2">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-xl transition-all"
                >
                  ← Back
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-black font-bold py-3 rounded-xl transition-all hover:scale-[1.02]"
                >
                  {loading ? 'Creating...' : 'Create Account'}
                </button>
              </div>
            </form>
          )}

          {/* Login Link */}
          <p className="text-center text-sm text-white/50 mt-6">
            Already have an account?{' '}
            <Link to="/login" className="text-emerald-400 hover:text-emerald-300 font-semibold transition">
              Sign in
            </Link>
          </p>
        </div>

        {/* Back to home */}
        <p className="text-center mt-6 text-sm text-white/30">
          <Link to="/" className="hover:text-white transition">← Back to home</Link>
        </p>
      </div>
    </div>
  )
}