import mongoose from 'mongoose';

const driverSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide driver name'],
    trim: true
  },
  phone: {
    type: String,
    required: [true, 'Please provide phone number'],
    unique: true
  },
  licenseNumber: {
    type: String,
    required: [true, 'Please provide license number'],
    unique: true
  },
  licenseExpiry: {
    type: Date,
    required: [true, 'Please provide license expiry date']
  },
  terminalId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Terminal',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Check if license is expired
driverSchema.methods.isLicenseExpired = function() {
  return new Date(this.licenseExpiry) < new Date();
};

const Driver = mongoose.model('Driver', driverSchema);
export default Driver;