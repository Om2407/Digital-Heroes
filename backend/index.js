const express = require('express')
const mongoose = require('mongoose')
const cors = require('cors')
const dotenv = require('dotenv')
dotenv.config()

const app = express()

// Middleware
app.use(cors({
  origin: ["http://localhost:5173", "http://localhost:3000"],
  credentials: true,
}))
app.use(express.json())

// Routes
app.use('/api/auth',    require('./routes/auth'))
app.use('/api/scores',  require('./routes/scores'))
app.use('/api/charity', require('./routes/charity'))
app.use('/api/draw',    require('./routes/draw'))
app.use('/api/admin',   require('./routes/admin'))
app.use('/api/payment', require('./routes/payment'))

// Health check
app.get('/api/health', (req, res) => res.json({ status: 'ok' }))

// Connect DB & start server
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log('MongoDB connected')
    app.listen(process.env.PORT || 5000, () =>
      console.log(`Server running on port ${process.env.PORT || 5000}`)
    )
  })
  .catch((err) => {
    console.error('DB connection error:', err)
    process.exit(1)
  })