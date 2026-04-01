const mongoose = require('mongoose')

const winnerSchema = new mongoose.Schema(
  {
    draw:  { type: mongoose.Schema.Types.ObjectId, ref: 'Draw', required: true },
    user:  { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },

    // Which tier they won
    matchType: { type: String, enum: ['5-match', '4-match', '3-match'], required: true },

    // Their scores that matched (snapshot at draw time)
    matchedNumbers: [Number],

    // Prize amount awarded (after splitting among tier winners)
    prizeAmount: { type: Number, required: true },

    // Verification
    verificationStatus: {
      type: String,
      enum: ['pending', 'approved', 'rejected'],
      default: 'pending',
    },
    proofUrl:    { type: String },  // uploaded screenshot URL
    reviewedBy:  { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    reviewedAt:  { type: Date },
    reviewNotes: { type: String },

    // Payment
    paymentStatus: { type: String, enum: ['pending', 'paid'], default: 'pending' },
    paidAt:        { type: Date },
  },
  { timestamps: true }
)

module.exports = mongoose.model('Winner', winnerSchema)