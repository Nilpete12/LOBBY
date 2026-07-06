import mongoose from 'mongoose';

const AnalyticsSchema = new mongoose.Schema({
  type: {
    type: String,
    enum: ['profile_view', 'call_click', 'whatsapp_click'],
    required: true,
  },
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  riderId:  { type: String },
  timestamp: { type: Date, default: Date.now }
});

AnalyticsSchema.index({ driverId: 1, type: 1, timestamp: -1 });
AnalyticsSchema.index({ riderId: 1, timestamp: -1 });

export default mongoose.models.Analytics || mongoose.model('Analytics', AnalyticsSchema);
