import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  // Basic Info
  fullName: { type: String, required: true },
  email:    { type: String, required: true, unique: true },
  clerkId: { type: String, unique: true, sparse: true }, // Clerk ID for authentication
  role:     { type: String, enum: ['rider', 'driver', 'admin'], default: 'rider' },
  
  // Driver Specific Fields (Optional for Riders)
  phone:       { type: String },
  vehicle:     { type: String }, // e.g., "Maruti 800"
  routes:      { type: [String], default: [] }, // e.g., ["Shillong", "Dawki"]
  rating:      { type: Number, default: 5.0 },
  isAvailable: { type: Boolean, default: false }, // The Green Dot
  isVerified:  { type: Boolean, default: false },
  
  profilePic: { type: String, default: "" }, // URL from Cloudinary
  carPic:     { type: String, default: "" }, // URL from Cloudinary
  licenseUrl: { type: String, default: '' },
  verificationStatus: { type: String, default: 'Pending' }, // 'Pending', 'Approved', 'Rejected'
  aiNotes: { type: String, default: '' },
  
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.User || mongoose.model('User', UserSchema);
