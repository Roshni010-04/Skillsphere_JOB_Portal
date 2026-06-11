/**
 * SkillSphere Database Seeder
 * Run: node seed.js
 * Creates demo users, gigs, proposals for testing
 */

require('dotenv').config({ path: require('path').join(__dirname, '.env') });
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/skillsphere';

// Inline schemas to avoid circular deps in seed
const userSchema = new mongoose.Schema({
  name: String, email: { type: String, unique: true }, password: String,
  role: { type: String, default: 'client' }, bio: String, isVerified: { type: Boolean, default: true },
  isActive: { type: Boolean, default: true }, isSuspended: { type: Boolean, default: false },
  location: { city: String, state: String, country: String },
  reputation: { score: Number, averageRating: Number, totalReviews: Number },
  analytics: { profileViews: Number, gigApplications: Number },
  freelancerProfile: {
    title: String, hourlyRate: Number, availability: String,
    skills: [{ name: String, level: String }],
    completedJobs: Number, successRate: Number, totalEarnings: Number,
    isVerifiedFreelancer: Boolean, verificationBadge: String,
    portfolio: [{ title: String, description: String, link: String }],
    experience: [{ company: String, role: String, current: Boolean, description: String }],
    certifications: [{ name: String, issuer: String, year: Number }],
  },
  savedGigs: [],
}, { timestamps: true });

const gigSchema = new mongoose.Schema({
  client: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  title: String, description: String, category: String, skills: [String],
  budget: { type: { type: String }, min: Number, max: Number, currency: String },
  duration: String, experienceLevel: String,
  location: { type: { type: String }, city: String, state: String, country: String },
  status: { type: String, default: 'open' },
  views: { type: Number, default: 0 }, applicants: { type: Number, default: 0 },
  isUrgent: Boolean, isFeatured: Boolean, milestones: [], tags: [],
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);
const Gig = mongoose.models.Gig || mongoose.model('Gig', gigSchema);

const hashPw = async (pw) => bcrypt.hash(pw, 12);

const DEMO_USERS = [
  {
    name: 'Rahul Sharma', email: 'client@demo.com', role: 'client',
    bio: 'Tech entrepreneur building the next big SaaS product. Passionate about great UI/UX.',
    location: { city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    reputation: { score: 85, averageRating: 4.7, totalReviews: 12 },
    analytics: { profileViews: 230, gigApplications: 0 },
  },
  {
    name: 'Priya Patel', email: 'freelancer@demo.com', role: 'freelancer',
    bio: 'Full-stack MERN developer with 5+ years of experience. Specializing in React, Node.js, and MongoDB. Love building scalable products.',
    location: { city: 'Bangalore', state: 'Karnataka', country: 'India' },
    reputation: { score: 94, averageRating: 4.9, totalReviews: 47 },
    analytics: { profileViews: 1240, gigApplications: 89 },
    freelancerProfile: {
      title: 'Senior Full-Stack MERN Developer', hourlyRate: 2500, availability: 'available',
      skills: [
        { name: 'React.js', level: 'expert' }, { name: 'Node.js', level: 'expert' },
        { name: 'MongoDB', level: 'expert' }, { name: 'TypeScript', level: 'intermediate' },
        { name: 'AWS', level: 'intermediate' }, { name: 'GraphQL', level: 'intermediate' },
        { name: 'Docker', level: 'beginner' }, { name: 'Next.js', level: 'expert' },
      ],
      completedJobs: 67, successRate: 98, totalEarnings: 850000,
      isVerifiedFreelancer: true, verificationBadge: 'gold',
      portfolio: [
        { title: 'E-commerce Platform', description: 'Built a full-stack ecommerce site with Stripe integration, admin panel, and inventory management', link: 'https://github.com' },
        { title: 'Real-time Chat App', description: 'Socket.IO based chat with video calling using WebRTC', link: 'https://github.com' },
        { title: 'SaaS Dashboard', description: 'Analytics dashboard for a B2B SaaS startup with role-based access control', link: 'https://github.com' },
      ],
      experience: [
        { company: 'TechCorp India', role: 'Senior Developer', current: true, description: 'Leading frontend team of 5, architecting React applications for 50k+ users' },
        { company: 'StartupXYZ', role: 'Full-Stack Developer', current: false, description: 'Built MVP from scratch using MERN stack, grew to 10k users in 3 months' },
      ],
      certifications: [
        { name: 'AWS Certified Developer', issuer: 'Amazon Web Services', year: 2023 },
        { name: 'MongoDB Certified Developer', issuer: 'MongoDB Inc.', year: 2022 },
      ],
    },
  },
  {
    name: 'Arjun Nair', email: 'freelancer2@demo.com', role: 'freelancer',
    bio: 'UI/UX Designer & React developer. Crafting beautiful, accessible interfaces since 2018.',
    location: { city: 'Pune', state: 'Maharashtra', country: 'India' },
    reputation: { score: 88, averageRating: 4.6, totalReviews: 28 },
    analytics: { profileViews: 760, gigApplications: 45 },
    freelancerProfile: {
      title: 'UI/UX Designer & Frontend Developer', hourlyRate: 1800, availability: 'available',
      skills: [
        { name: 'Figma', level: 'expert' }, { name: 'React.js', level: 'expert' },
        { name: 'Tailwind CSS', level: 'expert' }, { name: 'Adobe XD', level: 'intermediate' },
        { name: 'Framer Motion', level: 'intermediate' },
      ],
      completedJobs: 34, successRate: 95, totalEarnings: 420000,
      isVerifiedFreelancer: true, verificationBadge: 'silver',
    },
  },
  {
    name: 'Sneha Kulkarni', email: 'freelancer3@demo.com', role: 'freelancer',
    bio: 'Data scientist and ML engineer. Python expert with experience in NLP, computer vision, and predictive analytics.',
    location: { city: 'Hyderabad', state: 'Telangana', country: 'India' },
    reputation: { score: 91, averageRating: 4.8, totalReviews: 19 },
    analytics: { profileViews: 520, gigApplications: 32 },
    freelancerProfile: {
      title: 'Data Scientist & ML Engineer', hourlyRate: 3000, availability: 'busy',
      skills: [
        { name: 'Python', level: 'expert' }, { name: 'TensorFlow', level: 'expert' },
        { name: 'PyTorch', level: 'intermediate' }, { name: 'scikit-learn', level: 'expert' },
        { name: 'SQL', level: 'expert' }, { name: 'Power BI', level: 'intermediate' },
      ],
      completedJobs: 23, successRate: 96, totalEarnings: 520000,
      isVerifiedFreelancer: false, verificationBadge: 'none',
    },
  },
  {
    name: 'Admin User', email: 'admin@demo.com', role: 'admin',
    bio: 'Platform administrator',
    location: { city: 'Delhi', state: 'Delhi', country: 'India' },
    reputation: { score: 100, averageRating: 5, totalReviews: 0 },
    analytics: { profileViews: 0, gigApplications: 0 },
  },
];

const makeGigs = (clientId) => [
  {
    client: clientId, title: 'Build a Full-Stack E-Commerce Website with React & Node.js',
    description: 'We need an experienced MERN stack developer to build a complete e-commerce platform for our fashion brand. The project includes a customer-facing storefront, admin dashboard, product management, order tracking, and Razorpay payment integration. The platform should be mobile-responsive, SEO-optimized, and able to handle 10,000+ products.\n\nKey deliverables:\n- Customer storefront with search, filters, cart, wishlist\n- Secure checkout with Razorpay\n- Admin dashboard for orders, inventory, analytics\n- REST API with JWT auth\n- Deployment on AWS/Vercel',
    category: 'Web Development', skills: ['React.js', 'Node.js', 'MongoDB', 'Razorpay', 'AWS', 'Tailwind CSS'],
    budget: { type: 'fixed', min: 40000, max: 80000, currency: 'INR' },
    duration: '2_4_weeks', experienceLevel: 'expert',
    location: { type: 'remote', city: 'Mumbai', state: 'Maharashtra', country: 'India' },
    isUrgent: true, isFeatured: true, views: 234, applicants: 18,
    milestones: [
      { title: 'Backend API & Auth', description: 'REST API, JWT auth, product & order models', amount: 20000, status: 'pending' },
      { title: 'Frontend Storefront', description: 'React UI with all pages, cart, checkout flow', amount: 35000, status: 'pending' },
      { title: 'Admin Dashboard & Deployment', description: 'Admin panel, final testing, deployment', amount: 25000, status: 'pending' },
    ],
  },
  {
    client: clientId, title: 'Design a Modern SaaS Dashboard UI/UX in Figma',
    description: 'Looking for a talented UI/UX designer to create a comprehensive design system and dashboard UI for our B2B analytics SaaS product. You will design the full user journey from onboarding to core product features.\n\nDeliverables:\n- Complete Figma design file with component library\n- 15+ screen designs (desktop + mobile)\n- Interactive prototype\n- Design system with typography, colors, spacing\n- Handoff-ready specs for developers',
    category: 'UI/UX Design', skills: ['Figma', 'UI Design', 'UX Research', 'Prototyping', 'Design Systems'],
    budget: { type: 'fixed', min: 25000, max: 45000, currency: 'INR' },
    duration: '1_2_weeks', experienceLevel: 'expert',
    location: { type: 'remote', city: '', state: '', country: 'India' },
    isUrgent: false, isFeatured: false, views: 189, applicants: 12,
  },
  {
    client: clientId, title: 'Develop a React Native Mobile App for Food Delivery',
    description: 'We are building a hyperlocal food delivery app for Tier-2 cities in India. Need a skilled React Native developer to build the customer app (iOS & Android) with real-time order tracking, payment integration, and restaurant browsing.\n\nFeatures needed:\n- User auth (OTP-based)\n- Restaurant & menu browsing\n- Cart & checkout with UPI/card payment\n- Real-time order tracking with Google Maps\n- Push notifications\n- Order history & rating',
    category: 'Mobile Apps', skills: ['React Native', 'Node.js', 'Firebase', 'Google Maps API', 'Redux'],
    budget: { type: 'fixed', min: 60000, max: 120000, currency: 'INR' },
    duration: '1_3_months', experienceLevel: 'expert',
    location: { type: 'remote', city: '', state: '', country: 'India' },
    isUrgent: false, isFeatured: true, views: 412, applicants: 27,
  },
  {
    client: clientId, title: 'Data Analysis & ML Model for Customer Churn Prediction',
    description: 'Our SaaS company needs a data scientist to build a machine learning model to predict customer churn. We have 2 years of historical usage data in CSV format. The model should identify at-risk customers so our sales team can proactively retain them.\n\nScope:\n- Exploratory Data Analysis (EDA)\n- Feature engineering\n- Train multiple ML models (logistic regression, random forest, XGBoost)\n- Model evaluation & selection\n- Deploy as a simple API endpoint\n- Dashboard with key insights in Power BI',
    category: 'Data Science', skills: ['Python', 'scikit-learn', 'XGBoost', 'Pandas', 'Power BI', 'FastAPI'],
    budget: { type: 'fixed', min: 35000, max: 60000, currency: 'INR' },
    duration: '2_4_weeks', experienceLevel: 'expert',
    location: { type: 'remote', city: '', state: '', country: 'India' },
    isUrgent: true, isFeatured: false, views: 98, applicants: 8,
  },
  {
    client: clientId, title: 'Set Up CI/CD Pipeline & DevOps Infrastructure on AWS',
    description: 'Need a DevOps engineer to set up complete CI/CD pipeline and cloud infrastructure for our Node.js microservices application. Currently everything runs on a single server and we need to migrate to a scalable cloud architecture.',
    category: 'Cloud & DevOps', skills: ['AWS', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'Nginx'],
    budget: { type: 'hourly', min: 2000, max: 2000, currency: 'INR' },
    duration: '1_2_weeks', experienceLevel: 'expert',
    location: { type: 'remote', city: '', state: '', country: 'India' },
    isUrgent: false, isFeatured: false, views: 67, applicants: 5,
  },
  {
    client: clientId, title: 'Write SEO-Optimized Blog Content for Tech Startup (10 Articles)',
    description: 'We are a B2B SaaS company looking for a skilled content writer who understands both technology and SEO to write 10 high-quality blog articles per month. Topics will be around project management, team productivity, and SaaS industry trends.',
    category: 'Content Writing', skills: ['Content Writing', 'SEO', 'SaaS', 'Blogging', 'Research'],
    budget: { type: 'fixed', min: 15000, max: 25000, currency: 'INR' },
    duration: '1_3_months', experienceLevel: 'intermediate',
    location: { type: 'remote', city: '', state: '', country: 'India' },
    isUrgent: false, isFeatured: false, views: 54, applicants: 21,
  },
];

async function seed() {
  try {
    console.log('🔗 Connecting to MongoDB...');
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected!');

    // Clear existing data
    await User.deleteMany({});
    await Gig.deleteMany({});
    console.log('🗑️  Cleared existing data');

    // Create users
    const hashedPw = await hashPw('password123');
    const createdUsers = [];
    for (const userData of DEMO_USERS) {
      const user = await User.create({ ...userData, password: hashedPw });
      createdUsers.push(user);
      console.log(`✅ Created ${userData.role}: ${userData.email}`);
    }

    const client = createdUsers.find(u => u.role === 'client');
    const gigs = makeGigs(client._id);
    for (const gigData of gigs) {
      await Gig.create(gigData);
    }
    console.log(`✅ Created ${gigs.length} gigs`);

    console.log('\n🎉 Seeding complete!\n');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('  DEMO ACCOUNTS (password: password123)');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    DEMO_USERS.forEach(u => console.log(`  ${u.role.padEnd(12)} → ${u.email}`));
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('❌ Seed error:', err.message);
    process.exit(1);
  }
}

seed();
