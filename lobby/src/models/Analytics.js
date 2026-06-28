import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'call_click'
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  riderId:  { type: String },
  timestamp: { type: Date, default: Date.now }
});

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
