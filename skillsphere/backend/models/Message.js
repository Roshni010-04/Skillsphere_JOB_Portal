const mongoose = require('mongoose');
const messageSchema = new mongoose.Schema({
  conversation: { type: String, required: true },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  receiver: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  type: { type: String, enum: ['text','file','image'], default: 'text' },
  fileUrl: String,
  fileName: String,
  isRead: { type: Boolean, default: false },
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig' }
}, { timestamps: true });

messageSchema.index({ conversation: 1, createdAt: -1 });
module.exports = mongoose.model('Message', messageSchema);
