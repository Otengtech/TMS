// src/app.js
import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

// Routes
import authRoutes from '../routes/auth.routes.js';
import userRoutes from '../routes/user.routes.js';
import terminalRoutes from '../routes/terminal.routes.js';
import driverRoutes from '../routes/driver.routes.js';
import vehicleRoutes from '../routes/vehicle.routes.js';
import recordRoutes from '../routes/record.routes.js';

dotenv.config();
const app = express();

// Middleware
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/terminals', terminalRoutes);
app.use('/api/drivers', driverRoutes);
app.use('/api/vehicles', vehicleRoutes);
app.use('/api/records', recordRoutes);

// Health check
app.get('/health', (req, res) => {
  const dbState = mongoose.connection.readyState;
  const dbStatus = ['disconnected', 'connected', 'connecting', 'disconnecting'][dbState] || 'unknown';
  res.json({ success: true, database: dbStatus, time: new Date().toISOString() });
});

// Root
app.get('/', (req, res) => {
  res.json({ success: true, message: 'Terminal Management System API', environment: process.env.NODE_ENV || 'development' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ success: false, error: `Route ${req.originalUrl} not found` });
});

// Error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ success: false, error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong!' });
});

export default app;