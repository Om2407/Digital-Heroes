const mongoose = require('mongoose')

// Each individual score entry
const scoreEntrySchema = new mongoose.Schema({
  value: { type: Number, required: true, min: 1, max: 45 }, // Stableford range per PRD
  date:  { type: Date,   required: true },
})

// One document per user — holds up to 5 scores
const scoreSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },

    // Max 5 scores, ordered newest → oldest (enforced in route logic)
    scores: {
      type: [scoreEntrySchema],
      validate: {
        validator: (arr) => arr.length <= 5,
        message: 'A user can store at most 5 scores.',
      },
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Score', scoreSchema)