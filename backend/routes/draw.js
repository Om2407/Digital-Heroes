const express = require('express')
const Draw    = require('../models/Draw')
const Score   = require('../models/Score')
const Winner  = require('../models/Winner')
const User    = require('../models/User')
const { protect, adminOnly, subscriberOnly } = require('../middleware/auth')

const router = express.Router()

// ────────────────────────────────────────────────────────────────────────────
// PRIZE POOL CONSTANTS (PRD §07)
// ────────────────────────────────────────────────────────────────────────────
const PRIZE_SHARE = { fiveMatch: 0.40, fourMatch: 0.35, threeMatch: 0.25 }

// Revenue per plan (adjust to match Stripe prices)
const PLAN_PRICE = { monthly: 9.99, yearly: 99.99 / 12 } // monthly equivalent

// % of subscription that goes to prize pool (rest goes to charity + ops)
// Adjust as needed; keeping 50% to prize pool as a placeholder
const PRIZE_POOL_RATE = 0.50

// ────────────────────────────────────────────────────────────────────────────
// DRAW ENGINE HELPERS
// ────────────────────────────────────────────────────────────────────────────

/**
 * Random draw — picks 5 unique numbers from 1–45
 */
function randomDraw() {
  const pool = []
  while (pool.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!pool.includes(n)) pool.push(n)
  }
  return pool
}

/**
 * Algorithmic draw — weighted by frequency of scores across all active subscribers.
 * Rare scores get higher weight (makes winning harder/easier to tune).
 * @param {'most'|'least'} bias
 */
async function algorithmicDraw(bias = 'least') {
  // Aggregate all scores from active subscribers
  const activeUsers = await User.find({ 'subscription.status': 'active' }).select('_id')
  const userIds = activeUsers.map((u) => u._id)

  const scoreRecords = await Score.find({ user: { $in: userIds } })

  // Count frequency of each value 1–45
  const freq = Array(46).fill(0)
  scoreRecords.forEach((rec) => rec.scores.forEach((s) => freq[s.value]++))

  // Build weighted pool — higher weight = more likely
  const weightedPool = []
  for (let v = 1; v <= 45; v++) {
    const weight = bias === 'most'
      ? (freq[v] + 1)          // more common = more likely
      : (1 / (freq[v] + 1))   // less common = more likely (default)

    // Scale to integer weight (multiply by 100)
    const scaledWeight = Math.round(weight * 100)
    for (let w = 0; w < scaledWeight; w++) weightedPool.push(v)
  }

  // Sample 5 unique numbers
  const picked = []
  const shuffled = weightedPool.sort(() => Math.random() - 0.5)
  for (const n of shuffled) {
    if (!picked.includes(n)) picked.push(n)
    if (picked.length === 5) break
  }

  // Fallback to random if algorithm fails to find 5
  while (picked.length < 5) {
    const n = Math.floor(Math.random() * 45) + 1
    if (!picked.includes(n)) picked.push(n)
  }

  return picked
}

/**
 * Calculate prize pool for a draw based on active subscriber count
 */
async function calculatePrizePool(carryover = 0) {
  const subscribers = await User.find({ 'subscription.status': 'active' }).select('subscription')
  let poolTotal = 0

  subscribers.forEach((u) => {
    const monthlyRevenue = u.subscription.plan === 'yearly'
      ? PLAN_PRICE.yearly
      : PLAN_PRICE.monthly
    poolTotal += monthlyRevenue * PRIZE_POOL_RATE
  })

  poolTotal += carryover // jackpot rollover

  return {
    total:      poolTotal,
    fiveMatch:  poolTotal * PRIZE_SHARE.fiveMatch,
    fourMatch:  poolTotal * PRIZE_SHARE.fourMatch,
    threeMatch: poolTotal * PRIZE_SHARE.threeMatch,
    subscriberCount: subscribers.length,
  }
}

/**
 * Find all winners for a draw's winning numbers
 */
async function findWinners(draw) {
  const activeUsers = await User.find({ 'subscription.status': 'active' }).select('_id')
  const userIds = activeUsers.map((u) => u._id)
  const scoreRecords = await Score.find({ user: { $in: userIds } })

  const winnersByTier = { '5-match': [], '4-match': [], '3-match': [] }
  const winning = new Set(draw.winningNumbers)

  scoreRecords.forEach((rec) => {
    const userScoreValues = [...new Set(rec.scores.map((s) => s.value))]
    const matched = userScoreValues.filter((v) => winning.has(v))

    if (matched.length >= 5) winnersByTier['5-match'].push({ userId: rec.user, matched })
    else if (matched.length === 4) winnersByTier['4-match'].push({ userId: rec.user, matched })
    else if (matched.length === 3) winnersByTier['3-match'].push({ userId: rec.user, matched })
  })

  return winnersByTier
}

// ────────────────────────────────────────────────────────────────────────────
// ROUTES
// ────────────────────────────────────────────────────────────────────────────

// ── GET /api/draw ─────────────────────────────────────────────────────────────
// Public — list published draws
router.get('/', async (req, res) => {
  try {
    const draws = await Draw.find({ status: 'published' })
      .sort({ year: -1, month: -1 })
      .limit(12)
    res.json(draws)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/draw/latest ──────────────────────────────────────────────────────
// Public — most recent published draw + winners
router.get('/latest', async (req, res) => {
  try {
    const draw = await Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 })
    if (!draw) return res.status(404).json({ message: 'No published draw yet.' })

    const winners = await Winner.find({ draw: draw._id })
      .populate('user', 'name')
      .select('matchType prizeAmount verificationStatus paymentStatus')

    res.json({ draw, winners })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/draw/my-entries — subscriber's draw participation ────────────────
router.get('/my-entries', protect, subscriberOnly, async (req, res) => {
  try {
    const wins = await Winner.find({ user: req.user._id })
      .populate('draw', 'month year winningNumbers status')
      .sort({ createdAt: -1 })
    res.json(wins)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/draw/simulate — admin only ─────────────────────────────────────
router.post('/simulate', protect, adminOnly, async (req, res) => {
  try {
    const { month, year, drawMethod = 'random', algoBlias = 'least' } = req.body

    const numbers = drawMethod === 'algorithmic'
      ? await algorithmicDraw(algoBlias)
      : randomDraw()

    const pool = await calculatePrizePool()

    // Return simulation result WITHOUT saving to DB yet
    const winnersByTier = await findWinners({ winningNumbers: numbers })

    res.json({
      simulated:      true,
      month,
      year,
      drawMethod,
      winningNumbers: numbers,
      prizePool:      pool,
      winnerCounts: {
        fiveMatch:  winnersByTier['5-match'].length,
        fourMatch:  winnersByTier['4-match'].length,
        threeMatch: winnersByTier['3-match'].length,
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/draw/run — admin only — official draw ───────────────────────────
router.post('/run', protect, adminOnly, async (req, res) => {
  try {
    const { month, year, drawMethod = 'random', algoBlias = 'least' } = req.body

    // Check for existing draw this month
    const existing = await Draw.findOne({ month, year })
    if (existing && existing.status === 'published')
      return res.status(400).json({ message: 'Draw for this month already published.' })

    // Get jackpot carryover from previous month's unpublished jackpot
    const prevDraw = await Draw.findOne({ status: 'published' }).sort({ year: -1, month: -1 })
    const carryover = (prevDraw && !prevDraw.jackpotClaimed)
      ? prevDraw.prizePool.fiveMatch
      : 0

    const numbers = drawMethod === 'algorithmic'
      ? await algorithmicDraw(algoBlias)
      : randomDraw()

    const pool = await calculatePrizePool(carryover)
    const winnersByTier = await findWinners({ winningNumbers: numbers })

    // Save draw (status = simulated, admin must publish separately)
    const draw = await Draw.findOneAndUpdate(
      { month, year },
      {
        winningNumbers: numbers,
        drawMethod,
        prizePool: { ...pool, jackpotCarryover: carryover },
        subscriberCount: pool.subscriberCount,
        jackpotClaimed: winnersByTier['5-match'].length > 0,
        status: 'simulated',
      },
      { upsert: true, new: true }
    )

    // Save winners
    const tierMap = {
      '5-match': pool.fiveMatch,
      '4-match': pool.fourMatch,
      '3-match': pool.threeMatch,
    }

    for (const [tier, winners] of Object.entries(winnersByTier)) {
      if (!winners.length) continue
      const splitAmount = tierMap[tier] / winners.length

      await Winner.insertMany(
        winners.map((w) => ({
          draw:           draw._id,
          user:           w.userId,
          matchType:      tier,
          matchedNumbers: w.matched,
          prizeAmount:    splitAmount,
        }))
      )
    }

    res.json({
      draw,
      winnerCounts: {
        fiveMatch:  winnersByTier['5-match'].length,
        fourMatch:  winnersByTier['4-match'].length,
        threeMatch: winnersByTier['3-match'].length,
      },
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PATCH /api/draw/:id/publish — admin only ─────────────────────────────────
router.patch('/:id/publish', protect, adminOnly, async (req, res) => {
  try {
    const draw = await Draw.findByIdAndUpdate(
      req.params.id,
      { status: 'published', publishedAt: new Date() },
      { new: true }
    )
    if (!draw) return res.status(404).json({ message: 'Draw not found.' })
    res.json(draw)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router