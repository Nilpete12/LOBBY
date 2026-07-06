import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  userId: { type: String }, // Clerk user id when available
  name: { type: String, required: true },
  email: { type: String }, 
  role: { type: String, enum: ['rider', 'driver', 'guest'], default: 'guest' },
  topic: { type: String, required: true },
  message: { type: String, required: true },
  reportType: {
    type: String,
    enum: ['general', 'driver_report'],
    default: 'general'
  },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  driverName: { type: String, default: '' },
  status: {
    type: String,
    enum: ['pending', 'in_review', 'waiting_for_user', 'resolved'],
    default: 'pending'
  },
  internalNotes: [{
    note: { type: String },
    createdAt: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now }
});

ComplaintSchema.index({ status: 1, createdAt: -1 });
ComplaintSchema.index({ userId: 1, createdAt: -1 });
ComplaintSchema.index({ reportType: 1, status: 1, createdAt: -1 });
ComplaintSchema.index({ driverId: 1, createdAt: -1 });

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
