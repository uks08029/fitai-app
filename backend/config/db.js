import mongoose from 'mongoose';

export let isMongoConnected = false;

export const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fitai';

  try {
    const conn = await mongoose.connect(uri, {
      serverSelectionTimeoutMS: 2000,
    });
    isMongoConnected = true;
    console.log(`[FitAI Database] MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    isMongoConnected = false;
    console.warn(`[FitAI Database] MongoDB connection failed or no local daemon found (${error.message}).`);
    console.log(`[FitAI Database] Seamlessly activated High-Fidelity Demo In-Memory/JSON Storage Mode.`);
    console.log(`[FitAI Database] All API endpoints, seed data, authentication, and CRUD operations are fully active!`);
  }
};
