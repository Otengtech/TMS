import mongoose from 'mongoose';

const recordSchema = new mongoose.Schema({
  vehicleId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Vehicle',
    required: true
  },
  driverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Driver',
    required: true
  },
  terminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    required: true
  },
  action: {
    type: String,
    enum: ['check-in', 'check-out'],
    required: true
  },
  notes: {
    type: String,
    trim: true,
    default: ''
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }
}, {
  timestamps: true
});

// Index for faster queries
recordSchema.index({ terminalId: 1, createdAt: -1 });
recordSchema.index({ vehicleId: 1, createdAt: -1 });

const Record = mongoose.model('Record', recordSchema);
export default Record;