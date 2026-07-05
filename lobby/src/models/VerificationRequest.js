import mongoose from 'mongoose';

const VerificationRequestSchema = new mongoose.Schema(
  {
    driverId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    clerkId: { type: String, required: true, index: true },
    driverName: { type: String, required: true },
    email: { type: String, default: '' },
    phone: { type: String, default: '' },
    vehicle: { type: String, default: '' },
    licenseUrl: { type: String, required: true },
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'superseded'],
      default: 'pending',
      index: true,
    },
    notes: { type: String, default: 'Uploaded for admin review' },
    reviewNotes: { type: String, default: '' },
    reviewedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

VerificationRequestSchema.index({ status: 1, createdAt: -1 });
VerificationRequestSchema.index({ clerkId: 1, createdAt: -1 });

export default mongoose.models.VerificationRequest ||
  mongoose.model('VerificationRequest', VerificationRequestSchema);
