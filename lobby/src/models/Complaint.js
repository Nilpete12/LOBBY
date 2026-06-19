import mongoose from 'mongoose';

const ComplaintSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional (if logged in)
  name: { type: String, required: true },
  email: { type: String }, 
  role: { type: String, enum: ['rider', 'driver', 'guest'], default: 'guest' },
  topic: { type: String, required: true },
  message: { type: String, required: true },
  status: { type: String, enum: ['pending', 'resolved'], default: 'pending' },
  createdAt: { type: Date, default: Date.now }
});

export default mongoose.model('Complaint', ComplaintSchema);