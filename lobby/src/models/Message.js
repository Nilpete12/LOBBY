import mongoose from 'mongoose';

const MessageSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  topic: String,
  message: String,
  date: { type: Date, default: Date.now }
});

export default mongoose.model('Message', MessageSchema);