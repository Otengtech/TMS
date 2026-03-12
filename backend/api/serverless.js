// api/serverless.js
import app from '../src/app.js';
import connectDB from '../config/database.js';

export default async function handler(req, res) {
  try {
    // Connect to MongoDB once
    await connectDB();

    // Call the Express app
    app(req, res);
  } catch (err) {
    console.error('Serverless function error:', err);
    res.status(500).json({ success: false, error: 'Database connection failed' });
  }
}