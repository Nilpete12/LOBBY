import mongoose from 'mongoose';

const BookingSchema = new mongoose.Schema({
  riderId: { 
    type: String, 
    required: true 
  },
  riderName: { 
    type: String, 
    required: true 
  },
  riderPhone: { 
    type: String,
    required: true
  },
  driverId: { 
    type: String, 
    default: null 
  },
  pickupLocation: {
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    address: { type: String, default: 'Kohima Area' }
  },
  locationUpdatedAt: {
    type: Date,
    default: Date.now
  },
  destination: { 
    type: String, 
    required: true 
  },
  status: {
    type: String,
    enum: ['pending', 'accepted', 'completed', 'cancelled'],
    default: 'pending'
  },
  acceptedAt: {
    type: Date,
    default: null
  },
  createdAt: { 
    type: Date, 
    default: Date.now 
  }
}, { timestamps: true });

BookingSchema.index({ status: 1, createdAt: -1 });
BookingSchema.index({ riderId: 1, createdAt: -1 });
BookingSchema.index({ driverId: 1, createdAt: -1 });

// Prevent Mongoose from recompiling the model if it already exists
export default mongoose.models.Booking || mongoose.model('Booking', BookingSchema);
