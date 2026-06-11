const mongoose = require('mongoose');
const proposalSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  coverLetter: { type: String, required: true },
  bidAmount: { type: Number, required: true },
  estimatedDuration: String,
  milestones: [{ title: String, amount: Number, deadline: Date, description: String }],
  attachments: [{ name: String, url: String }],
  status: { type: String, enum: ['pending','accepted','rejected','withdrawn','negotiating'], default: 'pending' },
  negotiationHistory: [{ message: String, amount: Number, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, createdAt: { type: Date, default: Date.now } }],
  isShortlisted: { type: Boolean, default: false }
}, { timestamps: true });

proposalSchema.index({ gig: 1, freelancer: 1 }, { unique: true });
module.exports = mongoose.model('Proposal', proposalSchema);
