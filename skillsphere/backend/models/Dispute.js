const mongoose = require('mongoose');
const disputeSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  payment: { type: mongoose.Schema.Types.ObjectId, ref: 'Payment' },
  raisedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  against: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reason: { type: String, required: true },
  description: { type: String, required: true },
  evidence: [{ name: String, url: String, uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }],
  status: { type: String, enum: ['open','under_review','resolved','closed'], default: 'open' },
  resolution: String,
  resolvedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  adminNotes: String,
  messages: [{ text: String, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }]
}, { timestamps: true });

module.exports = mongoose.model('Dispute', disputeSchema);
