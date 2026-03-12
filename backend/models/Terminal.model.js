import mongoose from 'mongoose';

const terminalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide terminal name'],
    unique: true,
    trim: true
  },
  location: {
    type: String,
    required: [true, 'Please provide location']
  },
  capacity: {
    type: Number,
    required: [true, 'Please provide capacity'],
    min: [1, 'Capacity must be at least 1']
  },
  currentVehicles: {
    type: Number,
    default: 0,
    min: 0
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual populate for vehicles
terminalSchema.virtual('vehicles', {
  ref: 'Vehicle',
  localField: '_id',
  foreignField: 'terminalId',
  justOne: false
});

// Virtual populate for drivers
terminalSchema.virtual('drivers', {
  ref: 'Driver',
  localField: '_id',
  foreignField: 'terminalId',
  justOne: false
});

const Terminal = mongoose.model('Terminal', terminalSchema);
export default Terminal;