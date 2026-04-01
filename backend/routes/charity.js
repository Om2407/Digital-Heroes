const express = require('express')
const Charity = require('../models/Charity')
const { protect } = require('../middleware/auth')

const router = express.Router()

// ── GET /api/charity ─────────────────────────────────────────────────────────
// Public — list all active charities with search & filter
router.get('/', async (req, res) => {
  try {
    const { search, cause, featured, page = 1, limit = 12 } = req.query
    const query = { isActive: true }

    if (search)   query.$text = { $search: search }
    if (cause)    query.cause = { $regex: cause, $options: 'i' }
    if (featured) query.isFeatured = featured === 'true'

    const skip = (Number(page) - 1) * Number(limit)

    const [charities, total] = await Promise.all([
      Charity.find(query)
        .select('name cause emoji description images totalRaised subscriberCount isFeatured')
        .sort({ isFeatured: -1, totalRaised: -1 })
        .skip(skip)
        .limit(Number(limit)),
      Charity.countDocuments(query),
    ])

    res.json({ charities, total, page: Number(page), pages: Math.ceil(total / Number(limit)) })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/charity/featured ────────────────────────────────────────────────
// Public — featured charity for homepage spotlight (PRD §08)
router.get('/featured', async (req, res) => {
  try {
    const charity = await Charity.findOne({ isFeatured: true, isActive: true })
    if (!charity) return res.status(404).json({ message: 'No featured charity.' })
    res.json(charity)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── GET /api/charity/:id ─────────────────────────────────────────────────────
// Public — individual charity profile
router.get('/:id', async (req, res) => {
  try {
    const charity = await Charity.findById(req.params.id)
    if (!charity || !charity.isActive)
      return res.status(404).json({ message: 'Charity not found.' })
    res.json(charity)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/charity/:id/donate ─────────────────────────────────────────────
// Authenticated — independent donation (not tied to gameplay, PRD §08)
router.post('/:id/donate', protect, async (req, res) => {
  try {
    const { amount } = req.body
    if (!amount || amount <= 0)
      return res.status(400).json({ message: 'Valid donation amount required.' })

    const charity = await Charity.findById(req.params.id)
    if (!charity || !charity.isActive)
      return res.status(404).json({ message: 'Charity not found.' })

    // TODO: process Stripe payment for donation here
    // On success, update totalRaised
    charity.totalRaised += amount
    await charity.save()

    res.json({ message: 'Donation recorded.', totalRaised: charity.totalRaised })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router