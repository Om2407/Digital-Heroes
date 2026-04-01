const express = require('express')
const jwt     = require('jsonwebtoken')
const User    = require('../models/User')
const Charity = require('../models/Charity')
const { protect } = require('../middleware/auth')

const router = express.Router()

const signToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' })

// ── POST /api/auth/register ──────────────────────────────────────────────────
router.post('/register', async (req, res) => {
  try {
    const { name, email, password, charityId, contributionPercent } = req.body

    if (await User.findOne({ email }))
      return res.status(400).json({ message: 'Email already registered.' })

    // Validate charity if provided
    if (charityId && !(await Charity.findById(charityId)))
      return res.status(400).json({ message: 'Invalid charity selected.' })

    const user = await User.create({
      name,
      email,
      password,
      charity: {
        charityId,
        contributionPercent: contributionPercent || 10,
      },
    })

    // Increment charity subscriber count
    if (charityId) await Charity.findByIdAndUpdate(charityId, { $inc: { subscriberCount: 1 } })

    res.status(201).json({ token: signToken(user._id), user: sanitise(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/auth/login ─────────────────────────────────────────────────────
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body
    const user = await User.findOne({ email })

    if (!user || !(await user.matchPassword(password)))
      return res.status(401).json({ message: 'Invalid credentials.' })

    res.json({ token: signToken(user._id), user: sanitise(user) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/auth/me ─────────────────────────────────────────────────────────
router.get('/me', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select('-password')
      .populate('charity.charityId', 'name cause emoji')
    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PATCH /api/auth/charity ──────────────────────────────────────────────────
// Let user change charity selection or contribution %
router.patch('/charity', protect, async (req, res) => {
  try {
    const { charityId, contributionPercent } = req.body

    if (charityId && !(await Charity.findById(charityId)))
      return res.status(400).json({ message: 'Invalid charity.' })

    if (contributionPercent !== undefined && (contributionPercent < 10 || contributionPercent > 100))
      return res.status(400).json({ message: 'Contribution must be between 10% and 100%.' })

    const old = req.user.charity?.charityId?.toString()

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        $set: {
          ...(charityId           && { 'charity.charityId': charityId }),
          ...(contributionPercent && { 'charity.contributionPercent': contributionPercent }),
        },
      },
      { new: true }
    ).select('-password')

    // Update subscriber counts
    if (charityId && old && old !== charityId) {
      await Charity.findByIdAndUpdate(old,      { $inc: { subscriberCount: -1 } })
      await Charity.findByIdAndUpdate(charityId, { $inc: { subscriberCount:  1 } })
    }

    res.json(user)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PATCH /api/auth/profile ──────────────────────────────────────────────────
router.patch('/profile', protect, async (req, res) => {
  try {
    const { name, password } = req.body
    const user = await User.findById(req.user._id)

    if (name)     user.name     = name
    if (password) user.password = password   // pre-save hook re-hashes

    await user.save()
    res.json(sanitise(user))
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// Helper — strip sensitive fields
const sanitise = (user) => ({
  _id:          user._id,
  name:         user.name,
  email:        user.email,
  role:         user.role,
  subscription: user.subscription,
  charity:      user.charity,
  totalWon:     user.totalWon,
})

module.exports = router