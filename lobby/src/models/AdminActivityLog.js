import mongoose from 'mongoose';

const AdminActivityLogSchema = new mongoose.Schema({
  actor: { type: String, default: 'admin' },
  action: { type: String, required: true },
  targetType: { type: String, default: '' },
  targetId: { type: String, default: '' },
  targetLabel: { type: String, default: '' },
  summary: { type: String, required: true },
  metadata: { type: mongoose.Schema.Types.Mixed, default: {} },
  createdAt: { type: Date, default: Date.now, index: true },
});

export default mongoose.models.AdminActivityLog ||
  mongoose.model('AdminActivityLog', AdminActivityLogSchema);
