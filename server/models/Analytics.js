const mongoose = require('mongoose');

const AnalyticsSchema = new mongoose.Schema({
  type: { type: String, required: true }, // e.g., 'call_click'
  driverId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  timestamp: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Analytics', AnalyticsSchema);