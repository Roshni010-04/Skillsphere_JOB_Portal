const mongoose = require('mongoose');

const gigSchema = new mongoose.Schema({
  title: { type: String, required: true, trim: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  subcategory: String,
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skills: [String],
  budget: {
    type: { type: String, enum: ['fixed', 'hourly'], default: 'fixed' },
    min: Number, max: Number,
    fixed: Number
  },
  duration: { type: String, enum: ['less_than_week','1_2_weeks','2_4_weeks','1_3_months','3_6_months','6_months_plus'] },
  experienceLevel: { type: String, enum: ['entry','intermediate','expert'] },
  location: {
  locationType: { type: String, enum: ['remote','onsite','hybrid'], default: 'remote' },
  city: String,
  state: String,
  country: String
},
  locationDetails: { city: String, country: String },
  attachments: [{ name: String, url: String, type: String }],
  milestones: [{
    title: String, description: String, amount: Number, deadline: Date, status: {
      type: String, enum: ['pending','in_progress','completed','approved'], default: 'pending'
    }
  }],
  status: { type: String, enum: ['open','in_progress','completed','cancelled','draft'], default: 'open' },
  visibility: { type: String, enum: ['public','private','invited'], default: 'public' },
  invitedFreelancers: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  assignedFreelancer: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  proposals: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Proposal' }],
  proposalCount: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  tags: [String],
  deadline: Date,
  isApproved: { type: Boolean, default: true },
  completionPercentage: { type: Number, default: 0 },
  progressLogs: [{ message: String, createdAt: { type: Date, default: Date.now }, by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' } }]
}, { timestamps: true });

gigSchema.index({ title: 'text', description: 'text', skills: 'text', tags: 'text' });
gigSchema.index({ 'locationDetails.city': 1, status: 1, category: 1 });

module.exports = mongoose.model('Gig', gigSchema);
