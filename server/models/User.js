const mongoose = require('mongoose');

const UserSchema = new mongoose.Schema({
  // Basic Info
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role:     { type: String, enum: ['rider', 'driver', 'admin'], default: 'rider' },
  
  // Driver Specific Fields (Optional for Riders)
  phone:       { type: String },
  vehicle:     { type: String }, // e.g., "Maruti 800"
  routes:      { type: [String], default: [] }, // e.g., ["Shillong", "Dawki"]
  rating:      { type: Number, default: 5.0 },
  isAvailable: { type: Boolean, default: false }, // The Green Dot

  isVerified:  { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', UserSchema);