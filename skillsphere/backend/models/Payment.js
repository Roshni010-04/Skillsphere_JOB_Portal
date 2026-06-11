const mongoose = require('mongoose');
const paymentSchema = new mongoose.Schema({
  gig: { type: mongoose.Schema.Types.ObjectId, ref: 'Gig', required: true },
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  freelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  amount: { type: Number, required: true },
  platformFee: { type: Number, default: 0 },
  freelancerAmount: { type: Number },
  currency: { type: String, default: 'INR' },
  status: { type: String, enum: ['pending','escrow','released','refunded','disputed'], default: 'pending' },
  paymentMethod: { type: String, enum: ['razorpay','stripe','wallet'] },
  razorpayOrderId: String,
  razorpayPaymentId: String,
  stripePaymentIntentId: String,
  milestone: String,
  description: String,
  transactionId: String,
  refundId: String,
  refundReason: String,
  releasedAt: Date
}, { timestamps: true });

module.exports = mongoose.model('Payment', paymentSchema);
