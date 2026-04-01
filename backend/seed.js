require('dotenv').config()
const mongoose = require('mongoose')
const Charity = require('./models/Charity')

const charities = [
  { name: "Cancer Research UK", cause: "Health", description: "Fighting cancer through research and innovation.", isActive: true, isFeatured: true },
  { name: "WWF", cause: "Environment", description: "Protecting wildlife and natural habitats worldwide.", isActive: true },
  { name: "Golf Foundation", cause: "Sports", description: "Making golf accessible to young people across the UK.", isActive: true },
  { name: "RSPCA", cause: "Animals", description: "Preventing cruelty and promoting kindness to animals.", isActive: true },
  { name: "Oxfam", cause: "Community", description: "Fighting poverty and inequality around the world.", isActive: true },
  { name: "British Heart Foundation", cause: "Health", description: "Funding research into heart and circulatory diseases.", isActive: true },
]

mongoose.connect(process.env.MONGO_URI).then(async () => {
  await Charity.deleteMany({})
  await Charity.insertMany(charities)
  console.log('✓ Charities seeded!')
  process.exit(0)
}).catch(err => { console.error(err); process.exit(1) })