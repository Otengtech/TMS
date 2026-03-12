import mongoose from 'mongoose';
import dotenv from "dotenv";

// Load env vars
dotenv.config();

// Cache the database connection
let cachedConnection = null;

const connectDB = async () => {
  // Check if MONGODB_URI exists
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI is not defined in environment variables');
    if (process.env.NODE_ENV === 'production') {
      throw new Error('MONGODB_URI is not defined');
    } else {
      process.exit(1);
    }
  }

  // If we're in a serverless environment (Vercel) and have a cached connection, use it
  if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
    if (cachedConnection) {
      console.log('Using cached database connection');
      return cachedConnection;
    }
  }

  try {
    console.log('Connecting to MongoDB...');
    
    // Mongoose 6+ doesn't need the deprecated options
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    
    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database: ${conn.connection.name}`);
    
    // Cache the connection for serverless
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      cachedConnection = conn;
    }
    
    return conn;
  } catch (error) {
    console.error(`Error connecting to MongoDB: ${error.message}`);
    
    // In production, throw the error instead of exiting
    if (process.env.VERCEL || process.env.NODE_ENV === 'production') {
      throw error;
    } else {
      process.exit(1);
    }
  }
};

export default connectDB;