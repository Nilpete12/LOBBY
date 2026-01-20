const mongoose = require('mongoose');

const MessageSchema = new mongoose.Schema({
  firstName: String,
  lastName: String,
  email: String,
  topic: String,
  message: String,
  date: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Message', MessageSchema);