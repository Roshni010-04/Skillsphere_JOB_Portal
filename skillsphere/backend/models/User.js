const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: { type: String, enum: ['client', 'freelancer', 'admin'], default: 'client' },
  avatar: { type: String, default: '' },
  phone: String,
  location: {
    city: String, state: String, country: String,
    coordinates: { lat: Number, lng: Number }
  },
  bio: String,
  isVerified: { type: Boolean, default: false },
  isEmailVerified: { type: Boolean, default: false },
  isSuspended: { type: Boolean, default: false },
  verificationToken: String,
  resetPasswordToken: String,
  resetPasswordExpires: Date,
  twoFactorEnabled: { type: Boolean, default: false },
  twoFactorSecret: String,
  googleId: String,
  // Freelancer fields
  skills: [{ name: String, proficiency: { type: String, enum: ['beginner','intermediate','expert'] } }],
  portfolio: [{ title: String, description: String, image: String, link: String, tags: [String] }],
  certifications: [{ name: String, issuer: String, year: Number, url: String }],
  experience: [{ title: String, company: String, from: Date, to: Date, description: String }],
  hourlyRate: { type: Number, default: 0 },
  availability: { type: String, enum: ['available','busy','not_available'], default: 'available' },
  resumeUrl: String,
  // Stats
  totalEarnings: { type: Number, default: 0 },
  totalSpent: { type: Number, default: 0 },
  completedProjects: { type: Number, default: 0 },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  reputationScore: { type: Number, default: 0 },
  profileViews: { type: Number, default: 0 },
  // Notifications settings
  notifications: {
    email: { type: Boolean, default: true },
    push: { type: Boolean, default: true }
  }
}, { timestamps: true });

userSchema.pre('save', async function(next) {
  if (!this.isModified('password') || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

userSchema.methods.toPublicJSON = function() {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.resetPasswordToken;
  delete obj.twoFactorSecret;
  return obj;
};

module.exports = mongoose.model('User', userSchema);
