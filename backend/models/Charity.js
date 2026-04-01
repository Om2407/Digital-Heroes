const mongoose = require('mongoose')

const eventSchema = new mongoose.Schema({
  title:       { type: String, required: true },
  description: { type: String },
  date:        { type: Date, required: true },
  location:    { type: String },
})

const charitySchema = new mongoose.Schema(
  {
    name:        { type: String, required: true, trim: true },
    cause:       { type: String, required: true }, // e.g. 'Medical Research'
    description: { type: String },
    emoji:       { type: String },               // matches frontend data
    images:      [{ type: String }],             // image URLs
    isFeatured:  { type: Boolean, default: false },
    isActive:    { type: Boolean, default: true },

    // Upcoming golf days / events per PRD §08
    events: [eventSchema],

    // Running total raised — updated whenever a payout is marked
    totalRaised: { type: Number, default: 0 },

    // Number of subscribers who selected this charity
    subscriberCount: { type: Number, default: 0 },
  },
  { timestamps: true }
)

// Text index for search
charitySchema.index({ name: 'text', cause: 'text', description: 'text' })

module.exports = mongoose.model('Charity', charitySchema)