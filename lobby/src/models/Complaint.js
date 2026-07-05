import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  userId: { type: String }, // Clerk user id when available
  name: { type: String, required: true },
  email: { type: String }, 
  role: { type: String, enum: ['rider', 'driver', 'guest'], default: 'guest' },
  topic: { type: String, required: true },
  message: { type: String, required: true },
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

export default mongoose.models.Complaint || mongoose.model('Complaint', ComplaintSchema);
