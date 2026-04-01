const express = require('express')
const { protect } = require('../middleware/auth')
const {
  createOrder,
  verifyPayment,
  getStatus,
  cancelSubscription,
} = require('../controllers/paymentController')

const router = express.Router()

// All routes protected — login required
router.post('/create-order', protect, createOrder)
router.post('/verify', protect, verifyPayment)
router.get('/status', protect, getStatus)
router.post('/cancel', protect, cancelSubscription)

module.exports = router