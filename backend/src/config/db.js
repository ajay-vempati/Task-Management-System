import mongoose from 'mongoose'

export default async function connectDB() {
  const mongoUri = process.env.MONGODB_URI
  console.log(mongoUri);
  if (!mongoUri) {
    throw new Error('MONGODB_URI is not set')
  }

  // Mongoose v8 uses `strictQuery` by default behavior changes; keep simple here.
  await mongoose.connect(mongoUri)
}

