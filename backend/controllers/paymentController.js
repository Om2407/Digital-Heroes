const Razorpay = require('razorpay')
const crypto = require('crypto')
const User = require('../models/User')

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
})

// ── POST /api/payment/create-order ───────────────────────────────────────────
// Create Razorpay order for subscription
exports.createOrder = async (req, res) => {
  try {
    const { plan } = req.body // 'monthly' or 'yearly'

    if (!plan || !['monthly', 'yearly'].includes(plan)) {
      return res.status(400).json({ message: 'Valid plan required: monthly or yearly' })
    }

    // Prices in paise (INR) — 1 GBP ≈ 100 INR for test
    const prices = {
      monthly: 99900,  // ₹999
      yearly: 899900,  // ₹8999
    }

    const order = await razorpay.orders.create({
      amount: prices[plan],
      currency: 'INR',
      receipt: `receipt_${req.user._id}_${Date.now()}`,
      notes: {
        userId: req.user._id.toString(),
        plan,
      },
    })

    res.json({
      orderId: order.id,
      amount: order.amount,
      currency: order.currency,
      plan,
      keyId: process.env.RAZORPAY_KEY_ID,
    })
  } catch (err) {
    console.error('Create order error:', err)
    res.status(500).json({ message: err.message })
  }
}

// ── POST /api/payment/verify ─────────────────────────────────────────────────
// Verify payment signature and activate subscription
exports.verifyPayment = async (req, res) => {
  try {
    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      plan,
    } = req.body

    // Verify signature
    const body = razorpay_order_id + '|' + razorpay_payment_id
    const expectedSignature = crypto
      .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET)
      .update(body)
      .digest('hex')

    if (expectedSignature !== razorpay_signature) {
      return res.status(400).json({ message: 'Payment verification failed.' })
    }

    // Activate subscription
    const renewalDate = new Date()
    if (plan === 'monthly') {
      renewalDate.setMonth(renewalDate.getMonth() + 1)
    } else {
      renewalDate.setFullYear(renewalDate.getFullYear() + 1)
    }

    const user = await User.findByIdAndUpdate(
      req.user._id,
      {
        subscription: {
          plan,
          status: 'active',
          renewalDate,
          razorpayOrderId: razorpay_order_id,
          razorpayPaymentId: razorpay_payment_id,
        },
      },
      { new: true }
    ).select('-password')

    res.json({
      message: 'Payment successful! Subscription activated.',
      user,
    })
  } catch (err) {
    console.error('Verify payment error:', err)
    res.status(500).json({ message: err.message })
  }
}

// ── GET /api/payment/status ──────────────────────────────────────────────────
// Get current subscription status
exports.getStatus = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('subscription name email')
    res.json(user.subscription || { status: 'inactive' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}

// ── POST /api/payment/cancel ─────────────────────────────────────────────────
// Cancel subscription
exports.cancelSubscription = async (req, res) => {
  try {
    await User.findByIdAndUpdate(req.user._id, {
      'subscription.status': 'cancelled',
    })
    res.json({ message: 'Subscription cancelled.' })
  } catch (err) {
    res.status(500).json({ message: err.message })
  }
}