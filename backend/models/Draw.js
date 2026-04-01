const mongoose = require('mongoose')

const drawSchema = new mongoose.Schema(
  {
    month:  { type: Number, required: true }, // 1–12
    year:   { type: Number, required: true },

    // The 5 winning numbers drawn (values 1–45)
    winningNumbers: {
      type: [Number],
      validate: { validator: (a) => a.length === 5, message: 'Exactly 5 winning numbers required.' },
    },

    // Algorithm used for this draw
    drawMethod: { type: String, enum: ['random', 'algorithmic'], default: 'random' },

    // Status lifecycle
    status: {
      type: String,
      enum: ['pending', 'simulated', 'published'],
      default: 'pending',
    },

    // Prize pool for this draw (auto-calculated)
    prizePool: {
      total:        { type: Number, default: 0 },
      fiveMatch:    { type: Number, default: 0 }, // 40%
      fourMatch:    { type: Number, default: 0 }, // 35%
      threeMatch:   { type: Number, default: 0 }, // 25%
      jackpotCarryover: { type: Number, default: 0 }, // rolled from prev month
    },

    // Whether jackpot was claimed this draw
    jackpotClaimed: { type: Boolean, default: false },

    // Snapshot of active subscribers at draw time
    subscriberCount: { type: Number, default: 0 },

    publishedAt: { type: Date },
  },
  { timestamps: true }
)

// Compound unique index — one draw per month/year
drawSchema.index({ month: 1, year: 1 }, { unique: true })

module.exports = mongoose.model('Draw', drawSchema)