const mongoose = require('mongoose')
const bcrypt = require('bcryptjs')

const userSchema = new mongoose.Schema(
  {
    name:  { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 6 },
    role: { type: String, enum: ['subscriber', 'admin'], default: 'subscriber' },

    // Subscription
    subscription: {
      status:    { type: String, enum: ['active', 'inactive', 'cancelled', 'lapsed'], default: 'inactive' },
      plan:      { type: String, enum: ['monthly', 'yearly'] },
      stripeCustomerId:     { type: String },
      stripeSubscriptionId: { type: String },
      currentPeriodEnd:     { type: Date },
      renewalDate:          { type: Date },
    },

    // Charity preference
    charity: {
      charityId:           { type: mongoose.Schema.Types.ObjectId, ref: 'Charity' },
      contributionPercent: { type: Number, default: 10, min: 10, max: 100 }, // min 10% per PRD
    },

    // Winner stats
    totalWon: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next()
  this.password = await bcrypt.hash(this.password, 10)
  next()
})

// Compare password helper
userSchema.methods.matchPassword = function (plain) {
  return bcrypt.compare(plain, this.password)
}

module.exports = mongoose.model('User', userSchema)