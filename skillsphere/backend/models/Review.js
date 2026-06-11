const mongoose = require('mongoose');
const reviewSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  reviewer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  reviewee: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  comment: { type: String, required: true },
  aspects: {
    communication: { type: Number, min: 1, max: 5 },
    quality: { type: Number, min: 1, max: 5 },
    timeliness: { type: Number, min: 1, max: 5 },
    professionalism: { type: Number, min: 1, max: 5 }
  },
  isVerified: { type: Boolean, default: true },
  isFlagged: { type: Boolean, default: false },
  response: { text: String, createdAt: Date }
}, { timestamps: true });

reviewSchema.index({ gig: 1, reviewer: 1 }, { unique: true });
module.exports = mongoose.model('Review', reviewSchema);
