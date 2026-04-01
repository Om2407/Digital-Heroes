const express = require('express')
const User    = require('../models/User')
const Score   = require('../models/Score')
const Charity = require('../models/Charity')
const Draw    = require('../models/Draw')
const Winner  = require('../models/Winner')
const { protect, adminOnly } = require('../middleware/auth')

const router = express.Router()

// All admin routes require auth + admin role
router.use(protect, adminOnly)

// ═══════════════════════════════════════════════════════════════════════════
// USER MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// List users with pagination & search
router.get('/users', async (req, res) => {
  try {
    const { search, status, page = 1, limit = 20 } = req.query
    const query = { role: 'subscriber' }

    if (search) query.$or = [
      { name:  { $regex: search, $options: 'i' } },
      { email: { $regex: search, $options: 'i' } },
    ]
    if (status) query['subscription.status'] = status

    const skip = (Number(page) - 1) * Number(limit)
    const [users, total] = await Promise.all([
      User.find(query).select('-password')
        .populate('charity.charityId', 'name')
        .sort({ createdAt: -1 })
        .skip(skip).limit(Number(limit)),
      User.countDocuments(query),
    ])

    res.json({ users, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Get single user
router.get('/users/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password')
      .populate('charity.charityId', 'name cause')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit user profile & subscription
router.patch('/users/:id', async (req, res) => {
  try {
    const allowed = ['name', 'email', 'subscription']
    const updates = {}
    allowed.forEach((k) => { if (req.body[k] !== undefined) updates[k] = req.body[k] })

    const user = await User.findByIdAndUpdate(req.params.id, { $set: updates }, { new: true })
      .select('-password')
    if (!user) return res.status(404).json({ message: 'User not found.' })
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Edit a user's golf scores (admin override)
router.patch('/users/:id/scores', async (req, res) => {
  try {
    const { scores } = req.body  // full replacement array
    if (!Array.isArray(scores)) return res.status(400).json({ message: 'scores must be an array.' })

    const invalid = scores.some((s) => s.value < 1 || s.value > 45)
    if (invalid) return res.status(400).json({ message: 'All score values must be 1–45.' })

    const record = await Score.findOneAndUpdate(
      { user: req.params.id },
      { scores: scores.slice(0, 5) }, // enforce max 5
      { upsert: true, new: true }
    )
    res.json(record)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// CHARITY MANAGEMENT
// ═══════════════════════════════════════════════════════════════════════════

// Create charity
router.post('/charities', async (req, res) => {
  try {
    const charity = await Charity.create(req.body)
    res.status(201).json(charity)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Update charity
router.patch('/charities/:id', async (req, res) => {
  try {
    const charity = await Charity.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!charity) return res.status(404).json({ message: 'Charity not found.' })
    res.json(charity)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Soft-delete charity
router.delete('/charities/:id', async (req, res) => {
  try {
    await Charity.findByIdAndUpdate(req.params.id, { isActive: false })
    res.json({ message: 'Charity deactivated.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Set featured charity
router.patch('/charities/:id/feature', async (req, res) => {
  try {
    // Unfeature all others first
    await Charity.updateMany({}, { isFeatured: false })
    const charity = await Charity.findByIdAndUpdate(req.params.id, { isFeatured: true }, { new: true })
    res.json(charity)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// WINNER VERIFICATION
// ═══════════════════════════════════════════════════════════════════════════

// List winners — with filter by status
router.get('/winners', async (req, res) => {
  try {
    const { verificationStatus, paymentStatus, drawId, page = 1, limit = 20 } = req.query
    const query = {}

    if (verificationStatus) query.verificationStatus = verificationStatus
    if (paymentStatus)      query.paymentStatus = paymentStatus
    if (drawId)             query.draw = drawId

    const skip = (Number(page) - 1) * Number(limit)
    const [winners, total] = await Promise.all([
      Winner.find(query)
        .populate('user', 'name email')
        .populate('draw', 'month year winningNumbers')
        .sort({ createdAt: -1 })
        .skip(skip).limit(Number(limit)),
      Winner.countDocuments(query),
    ])

    res.json({ winners, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Approve / reject winner verification
router.patch('/winners/:id/verify', async (req, res) => {
  try {
    const { status, notes } = req.body
    if (!['approved', 'rejected'].includes(status))
      return res.status(400).json({ message: 'Status must be approved or rejected.' })

    const winner = await Winner.findByIdAndUpdate(
      req.params.id,
      {
        verificationStatus: status,
        reviewedBy:  req.user._id,
        reviewedAt:  new Date(),
        reviewNotes: notes,
      },
      { new: true }
    )
    if (!winner) return res.status(404).json({ message: 'Winner not found.' })
    res.json(winner)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Mark payout as paid
router.patch('/winners/:id/pay', async (req, res) => {
  try {
    const winner = await Winner.findById(req.params.id)
    if (!winner) return res.status(404).json({ message: 'Winner not found.' })
    if (winner.verificationStatus !== 'approved')
      return res.status(400).json({ message: 'Winner must be approved before paying.' })

    winner.paymentStatus = 'paid'
    winner.paidAt = new Date()
    await winner.save()

    // Update user's totalWon
    await User.findByIdAndUpdate(winner.user, { $inc: { totalWon: winner.prizeAmount } })

    res.json(winner)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/admin/winners/:id/proof — subscriber uploads proof ──────────────
// (admin route because admin reviews it; subscriber uploads via their own auth)
router.patch('/winners/:id/proof', protect, async (req, res) => {
  try {
    const { proofUrl } = req.body
    if (!proofUrl) return res.status(400).json({ message: 'proofUrl is required.' })

    const winner = await Winner.findById(req.params.id)
    if (!winner) return res.status(404).json({ message: 'Winner not found.' })

    // Allow owner or admin
    const isOwner = winner.user.toString() === req.user._id.toString()
    if (!isOwner && req.user.role !== 'admin')
      return res.status(403).json({ message: 'Not authorised.' })

    winner.proofUrl = proofUrl
    winner.verificationStatus = 'pending'
    await winner.save()

    res.json(winner)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ═══════════════════════════════════════════════════════════════════════════
// REPORTS & ANALYTICS  (PRD §11)
// ═══════════════════════════════════════════════════════════════════════════

router.get('/analytics', async (req, res) => {
  try {
    const [
      totalUsers,
      activeSubscribers,
      totalDraws,
      draws,
      charityTotals,
      totalPaidOut,
    ] = await Promise.all([
      User.countDocuments({ role: 'subscriber' }),
      User.countDocuments({ 'subscription.status': 'active' }),
      Draw.countDocuments({ status: 'published' }),
      Draw.find({ status: 'published' }).sort({ year: -1, month: -1 }).limit(6),
      Charity.find({ isActive: true }).select('name totalRaised subscriberCount').sort({ totalRaised: -1 }),
      Winner.aggregate([
        { $match: { paymentStatus: 'paid' } },
        { $group: { _id: null, total: { $sum: '$prizeAmount' } } },
      ]),
    ])

    // Total prize pool across all draws
    const totalPrizePool = draws.reduce((acc, d) => acc + d.prizePool.total, 0)

    res.json({
      totalUsers,
      activeSubscribers,
      totalDraws,
      totalPrizePool,
      totalPaidOut: totalPaidOut[0]?.total || 0,
      charityTotals,
      recentDraws: draws,
    })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router