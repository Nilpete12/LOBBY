import mongoose from 'mongoose';

const PlatformSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, default: 'global', unique: true },
    maintenanceMode: { type: Boolean, default: false },
    registrationOpen: { type: Boolean, default: true },
    bookingOpen: { type: Boolean, default: true },
    supportOpen: { type: Boolean, default: true },
    notice: { type: String, default: '' },
  },
  { timestamps: true }
);

export default mongoose.models.PlatformSettings ||
  mongoose.model('PlatformSettings', PlatformSettingsSchema);
