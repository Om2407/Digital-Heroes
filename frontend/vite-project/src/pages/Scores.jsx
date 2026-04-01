import { useState, useEffect } from 'react'
import { useNavigate, Link } from 'react-router-dom'

export default function Dashboard() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [scores, setScores] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('user')
    const token = localStorage.getItem('token')
    if (!stored || !token) {
      navigate('/login')
      return
    }
    setUser(JSON.parse(stored))
    fetchScores(token)
  }, [])

  const fetchScores = async (token) => {
    try {
      const res = await fetch('http://localhost:5000/api/scores', {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json()
      if (res.ok) setScores(data.scores || [])
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    navigate('/')
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-24 pb-16 px-6">
      <div className="max-w-7xl mx-auto">

        {/* Header */}
        <div className="flex items-center justify-between mb-10">
          <div>
            <h1 className="text-3xl font-bold mb-1">
              Welcome back, <span className="text-emerald-400">{user?.name?.split(' ')[0]}</span> 👋
            </h1>
            <p className="text-white/50 text-sm">Here's your platform overview</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-sm text-white/40 hover:text-white transition px-4 py-2 border border-white/10 rounded-xl hover:border-white/20"
          >
            Logout
          </button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
          {[
            {
              label: 'Subscription',
              value: user?.subscription?.status === 'active' ? 'Active' : 'Inactive',
              sub: user?.subscription?.plan || 'No plan',
              icon: '💳',
              color: user?.subscription?.status === 'active' ? 'emerald' : 'red',
            },
            {
              label: 'Scores Entered',
              value: scores.length,
              sub: 'of 5 maximum',
              icon: '⛳',
              color: 'blue',
            },
            {
              label: 'Draws Entered',
              value: '3',
              sub: 'this year',
              icon: '🎰',
              color: 'purple',
            },
            {
              label: 'Total Winnings',
              value: '£0',
              sub: 'lifetime earnings',
              icon: '🏆',
              color: 'yellow',
            },
          ].map((stat) => (
            <div
              key={stat.label}
              className="bg-white/5 border border-white/10 rounded-2xl p-6 hover:border-white/20 transition"
            >
              <div className="text-3xl mb-3">{stat.icon}</div>
              <div className="text-2xl font-bold mb-1">{stat.value}</div>
              <div className="text-white/40 text-xs mb-1">{stat.sub}</div>
              <div className="text-white/60 text-sm font-medium">{stat.label}</div>
            </div>
          ))}
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

          {/* Scores Panel */}
          <div className="lg:col-span-2 bg-white/5 border border-white/10 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold">My Golf Scores</h2>
              <Link
                to="/scores"
                className="bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-sm px-4 py-2 rounded-xl transition"
              >
                + Add Score
              </Link>
            </div>

            {scores.length === 0 ? (
              <div className="text-center py-12">
                <div className="text-5xl mb-4">⛳</div>
                <p className="text-white/40 text-sm mb-4">No scores entered yet</p>
                <Link
                  to="/scores"
                  className="text-emerald-400 hover:text-emerald-300 text-sm underline underline-offset-4 transition"
                >
                  Enter your first score →
                </Link>
              </div>
            ) : (
              <div className="space-y-3">
                {scores.map((entry, i) => (
                  <div
                    key={i}
                    className="flex items-center justify-between bg-white/5 rounded-xl px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-emerald-500/20 rounded-full flex items-center justify-center text-emerald-400 font-bold text-sm">
                        {entry.score}
                      </div>
                      <div>
                        <div className="text-sm font-medium">Score: {entry.score}</div>
                        <div className="text-white/40 text-xs">
                          {new Date(entry.date).toLocaleDateString('en-GB')}
                        </div>
                      </div>
                    </div>
                    <div className="text-white/30 text-xs">#{i + 1}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Right Panel */}
          <div className="flex flex-col gap-6">

            {/* Subscription Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">Subscription</h2>
              <div className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-semibold mb-4 ${
                user?.subscription?.status === 'active'
                  ? 'bg-emerald-500/20 text-emerald-400'
                  : 'bg-red-500/20 text-red-400'
              }`}>
                <span className="w-2 h-2 rounded-full bg-current animate-pulse" />
                {user?.subscription?.status === 'active' ? 'Active' : 'Inactive'}
              </div>
              <div className="text-white/50 text-sm mb-1">
                Plan: <span className="text-white capitalize">{user?.subscription?.plan || 'None'}</span>
              </div>
              {user?.subscription?.renewalDate && (
                <div className="text-white/50 text-sm">
                  Renews: <span className="text-white">
                    {new Date(user.subscription.renewalDate).toLocaleDateString('en-GB')}
                  </span>
                </div>
              )}
              {user?.subscription?.status !== 'active' && (
                <Link
                  to="/signup"
                  className="mt-4 block text-center bg-emerald-500 hover:bg-emerald-400 text-black font-bold py-2 rounded-xl text-sm transition"
                >
                  Subscribe Now
                </Link>
              )}
            </div>

            {/* Charity Card */}
            <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-4">My Charity</h2>
              {user?.selectedCharity ? (
                <div>
                  <div className="text-white/60 text-sm mb-2">Supporting:</div>
                  <div className="text-emerald-400 font-semibold">{user.selectedCharity}</div>
                  <div className="mt-3 text-white/50 text-sm">
                    Contribution: <span className="text-white">{user.charityPercentage || 10}%</span>
                  </div>
                </div>
              ) : (
                <div className="text-center py-4">
                  <div className="text-3xl mb-3">❤️</div>
                  <p className="text-white/40 text-sm mb-3">No charity selected</p>
                  <Link
                    to="/charities"
                    className="text-emerald-400 hover:text-emerald-300 text-sm underline underline-offset-4 transition"
                  >
                    Choose a charity →
                  </Link>
                </div>
              )}
            </div>

            {/* Next Draw Card */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-2xl p-6">
              <h2 className="text-lg font-bold mb-2">Next Draw</h2>
              <p className="text-white/50 text-sm mb-4">Monthly draw coming up</p>
              <div className="flex gap-2 flex-wrap">
                {['?', '?', '?', '?', '?'].map((n, i) => (
                  <div
                    key={i}
                    className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-sm"
                  >
                    {n}
                  </div>
                ))}
              </div>
              <p className="text-white/30 text-xs mt-3">Draw runs on the 1st of each month</p>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}