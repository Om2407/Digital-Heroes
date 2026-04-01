const express = require('express')
const Score   = require('../models/Score')
const { protect, subscriberOnly } = require('../middleware/auth')

const router = express.Router()

// All score routes require active subscription (PRD §04)
router.use(protect, subscriberOnly)

// ── GET /api/scores ──────────────────────────────────────────────────────────
// Returns user's scores newest → oldest
router.get('/', async (req, res) => {
  try {
    const record = await Score.findOne({ user: req.user._id })
    if (!record) return res.json([])

    // Sort newest first before returning
    const sorted = [...record.scores].sort((a, b) => new Date(b.date) - new Date(a.date))
    res.json(sorted)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── POST /api/scores ─────────────────────────────────────────────────────────
// Add a new score — replaces oldest when > 5 exist (PRD §05)
router.post('/', async (req, res) => {
  try {
    const { value, date } = req.body

    if (!value || value < 1 || value > 45)
      return res.status(400).json({ message: 'Score must be between 1 and 45 (Stableford).' })
    if (!date)
      return res.status(400).json({ message: 'Score date is required.' })

    let record = await Score.findOne({ user: req.user._id })

    if (!record) {
      // First score entry for this user
      record = new Score({ user: req.user._id, scores: [] })
    }

    // Add new score
    record.scores.push({ value, date: new Date(date) })

    // Rolling window — keep only latest 5 (remove oldest by date)
    if (record.scores.length > 5) {
      record.scores.sort((a, b) => new Date(b.date) - new Date(a.date))
      record.scores = record.scores.slice(0, 5)
    }

    await record.save()

    // Return sorted newest first
    const sorted = [...record.scores].sort((a, b) => new Date(b.date) - new Date(a.date))
    res.status(201).json(sorted)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── PATCH /api/scores/:scoreId ───────────────────────────────────────────────
// Edit a specific score entry
router.patch('/:scoreId', async (req, res) => {
  try {
    const { value, date } = req.body
    const record = await Score.findOne({ user: req.user._id })
    if (!record) return res.status(404).json({ message: 'No scores found.' })

    const entry = record.scores.id(req.params.scoreId)
    if (!entry) return res.status(404).json({ message: 'Score not found.' })

    if (value !== undefined) {
      if (value < 1 || value > 45)
        return res.status(400).json({ message: 'Score must be between 1 and 45.' })
      entry.value = value
    }
    if (date) entry.date = new Date(date)

    await record.save()

    const sorted = [...record.scores].sort((a, b) => new Date(b.date) - new Date(a.date))
    res.json(sorted)
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

// ── DELETE /api/scores/:scoreId ──────────────────────────────────────────────
router.delete('/:scoreId', async (req, res) => {
  try {
    const record = await Score.findOne({ user: req.user._id })
    if (!record) return res.status(404).json({ message: 'No scores found.' })

    record.scores = record.scores.filter((s) => s._id.toString() !== req.params.scoreId)
    await record.save()

    res.json({ message: 'Score deleted.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
})

module.exports = router