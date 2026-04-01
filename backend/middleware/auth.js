const jwt  = require('jsonwebtoken')
const User = require('../models/User')

// ── Verify JWT ──────────────────────────────────────────────────────────────
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'No token, authorisation denied.' })
  }

  try {
    const token   = authHeader.split(' ')[1]
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-password')
    if (!req.user) return res.status(401).json({ message: 'User not found.' })
    next()
  } catch {
    return res.status(401).json({ message: 'Token invalid or expired.' })
  }
}

// ── Admin only ───────────────────────────────────────────────────────────────
const adminOnly = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Admin access required.' })
  }
  next()
}

// ── Active subscriber only (per PRD §04) ────────────────────────────────────
const subscriberOnly = (req, res, next) => {
  if (req.user?.subscription?.status !== 'active') {
    return res.status(403).json({ message: 'Active subscription required.' })
  }
  next()
}

module.exports = { protect, adminOnly, subscriberOnly }