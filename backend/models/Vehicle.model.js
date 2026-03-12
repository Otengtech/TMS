import mongoose from 'mongoose';

const vehicleSchema = new mongoose.Schema({
  plateNumber: {
    type: String,
    required: [true, 'Please provide plate number'],
    unique: true,
    uppercase: true,
    trim: true
  },
  type: {
    type: String,
    required: [true, 'Please provide vehicle type'],
    enum: ['bus', 'taxi', 'truck', 'private']
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
  status: {
    type: String,
    enum: ['checked-in', 'checked-out'],
    default: 'checked-out'
  },
  checkInTime: {
    type: Date
  },
  checkOutTime: {
    type: Date
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

// Update terminal vehicle count when status changes - with error handling
vehicleSchema.post('save', async function(doc) {
  try {
    const Terminal = mongoose.model('Terminal');
    if (doc.status === 'checked-in') {
      await Terminal.findByIdAndUpdate(doc.terminalId, {
        $inc: { currentVehicles: 1 }
      });
    }
  } catch (error) {
    console.error('Error updating terminal count:', error);
  }
});

// Make sure to export the model
const Vehicle = mongoose.model('Vehicle', vehicleSchema);
export default Vehicle;