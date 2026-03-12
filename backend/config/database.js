// config/database.js
import mongoose from 'mongoose';

let cached = null;

const connectDB = async () => {
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI is required');
  }

  // Return cached connection if exists
  if (cached) {
    return cached;
  }

  try {
    console.log('Connecting to MongoDB...');
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      // optional settings for serverless
      autoIndex: true,
      bufferCommands: false
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    cached = conn;
    return conn;
  } catch (error) {
    console.error('MongoDB connection error:', error);
    throw error; // don’t exit; throw to let serverless handle
  }
};

export default connectDB;