# 🌐 SkillSphere — Intelligent Hyperlocal Freelance Ecosystem

> A full-stack MERN platform connecting clients with freelancers via AI-powered matching, milestone payments, real-time chat, and a complete admin ecosystem.

---

## 📁 Project Structure

```
skillsphere/
├── backend/                    # Express.js + MongoDB API
│   ├── server.js               # Entry point (Express + Socket.IO)
│   ├── seed.js                 # Database seeder (demo data)
│   ├── .env.example            # Environment variables template
│   ├── models/
│   │   ├── User.js             # Multi-role user model
│   │   ├── Gig.js              # Gig + milestones model
│   │   ├── Proposal.js         # Proposal + negotiation
│   │   ├── Message.js          # Chat messages
│   │   ├── Payment.js          # Escrow payments
│   │   ├── Dispute.js          # Dispute resolution
│   │   ├── Notification.js     # Real-time notifications
│   │   └── Review.js           # Weighted review system
│   ├── controllers/
│   │   ├── authController.js   # Register, login, verify, reset
│   │   ├── gigController.js    # Gig CRUD + AI matching
│   │   ├── proposalController.js
│   │   └── controllers.js      # All other controllers
│   ├── routes/                 # Express routers (all 10 modules)
│   ├── middleware/
│   │   └── auth.js             # JWT + RBAC middleware
│   └── utils/
│       ├── email.js            # Nodemailer email utility
│       └── socket.js           # Socket.IO event handlers
│
└── frontend/                   # React.js SPA
    ├── public/index.html       # Tailwind CDN + Google Fonts
    └── src/
        ├── App.js              # Router + auth guards
        ├── index.js
        ├── context/
        │   └── AuthContext.js  # Global auth state
        ├── utils/
        │   └── api.js          # Axios instance + interceptors
        ├── components/
        │   ├── Navbar.js       # Sticky nav + notifications
        │   └── UI.js           # GigCard, FreelancerCard, Modal, etc.
        └── pages/
            ├── Landing.js      # Hero + categories + featured
            ├── Auth.js         # Login + Register
            ├── GigMarketplace.js # Browse + filter gigs
            ├── GigDetail.js    # Gig detail + proposal submit
            ├── PostGig.js      # 3-step gig creation wizard
            ├── Dashboard.js    # Client/Freelancer dashboard
            ├── Messages.js     # Real-time Socket.IO chat
            ├── Admin.js        # Admin control panel
            ├── Settings.js     # Profile + security settings
            └── Pages.js        # Profile, Freelancers, Payments, Search
```

---

## 🚀 Quick Setup

### Prerequisites
- Node.js 18+
- MongoDB (local or Atlas)
- npm or yarn

---

### 1. Clone & Install Backend

```bash
cd skillsphere/backend
npm install
cp .env.example .env
```

Edit `.env` with your values:
```env
MONGODB_URI=mongodb://localhost:27017/skillsphere
JWT_SECRET=your_super_secret_key_here
CLIENT_URL=http://localhost:3000
EMAIL_USER=your_gmail@gmail.com
EMAIL_PASS=your_app_password
```

### 2. Seed Demo Data

```bash
node seed.js
```

This creates:
| Role       | Email                    | Password     |
|------------|--------------------------|--------------|
| Client     | client@demo.com          | password123  |
| Freelancer | freelancer@demo.com      | password123  |
| Freelancer | freelancer2@demo.com     | password123  |
| Freelancer | freelancer3@demo.com     | password123  |
| Admin      | admin@demo.com           | password123  |

### 3. Start Backend

```bash
node server.js
# Server runs on http://localhost:5000
```

---

### 4. Install & Start Frontend

```bash
cd skillsphere/frontend
npm install
npm start
# App runs on http://localhost:3000
```

---

## 🌐 All Pages & Routes

| Route | Page | Auth |
|-------|------|------|
| `/` | Landing page | Public |
| `/login` | Login | Public |
| `/register` | Register (client/freelancer) | Public |
| `/gigs` | Gig marketplace + filters | Public |
| `/gigs/:id` | Gig detail + apply | Public |
| `/post-gig` | Post a gig (3-step wizard) | Client |
| `/freelancers` | Browse freelancers | Public |
| `/profile/:id` | User profile + portfolio | Public |
| `/search?q=...` | Search results | Public |
| `/dashboard` | Client/Freelancer dashboard | Auth |
| `/messages` | Real-time chat | Auth |
| `/messages/:userId` | Direct message | Auth |
| `/payments` | Payment history | Auth |
| `/settings` | Profile & security settings | Auth |
| `/admin` | Admin control panel | Admin |

---

## 🔌 API Endpoints

### Auth
```
POST   /api/auth/register
POST   /api/auth/login
GET    /api/auth/me
GET    /api/auth/verify-email/:token
POST   /api/auth/forgot-password
PUT    /api/auth/reset-password/:token
PUT    /api/auth/change-password
```

### Gigs
```
GET    /api/gigs                    # Browse (filters: category, skills, budget, location, search)
POST   /api/gigs                    # Create (client only)
GET    /api/gigs/my                 # My gigs
GET    /api/gigs/:id                # Detail + AI match score
PUT    /api/gigs/:id                # Update
DELETE /api/gigs/:id                # Delete
GET    /api/gigs/:id/matches        # AI recommended freelancers
PUT    /api/gigs/:id/milestones/:milestoneId  # Update milestone
```

### Proposals
```
POST   /api/proposals/gig/:gigId    # Submit proposal (freelancer)
GET    /api/proposals/gig/:gigId    # Get proposals (client)
GET    /api/proposals/my            # My proposals (freelancer)
PUT    /api/proposals/:id/status    # Accept/reject (client)
```

### Messages
```
GET    /api/messages/conversations  # All conversations
GET    /api/messages/:userId        # Messages with user
POST   /api/messages/:userId        # Send message
```

### Payments
```
POST   /api/payments                # Create payment/escrow
GET    /api/payments                # Payment history
PUT    /api/payments/:id/release    # Release escrow (client)
```

### Reviews
```
POST   /api/reviews                 # Submit review
GET    /api/reviews/user/:userId    # User's reviews
```

### Notifications
```
GET    /api/notifications           # Get notifications
PUT    /api/notifications/mark-read # Mark all as read
```

### Admin
```
GET    /api/admin/dashboard         # Platform stats
GET    /api/admin/users             # All users (search/filter)
PUT    /api/admin/users/:id/suspend # Suspend/unsuspend
PUT    /api/admin/users/:id/verify  # Verify freelancer
GET    /api/admin/disputes          # All disputes
PUT    /api/admin/disputes/:id/resolve # Resolve dispute
```

### Search
```
GET    /api/search?q=react&type=all # Search gigs + freelancers
```

---

## ✨ Features Implemented

### 🔐 Auth System
- JWT-based authentication
- Role-based access (Client / Freelancer / Admin)
- Email verification on register
- Forgot/reset password via email token
- Secure password hashing (bcrypt)

### 🤖 AI Job Matching
- Skill similarity scoring (Jaccard-style overlap)
- Expert bonus weighting
- Reputation & completion rate scoring
- Returns top 10 ranked freelancers per gig

### 💼 Gig Marketplace
- Full-text search (MongoDB text index)
- Filters: category, skills, budget, duration, experience, location
- Sort by: newest, views, budget
- Save/bookmark gigs
- Urgent & featured flags
- Applicant count, view count

### 📋 Proposals
- Cover letter + bid amount + delivery time
- Milestone-based proposals
- Client can accept/reject
- Auto-reject other proposals on acceptance
- Status: pending → shortlisted → accepted/rejected

### 💬 Real-Time Chat
- Socket.IO powered messaging
- Typing indicators
- Message read receipts
- Conversation list with search

### 💰 Payments
- Escrow payment creation
- Manual release by client
- Platform fee calculation (10%)
- Transaction history
- Earnings tracking for freelancers

### ⭐ Reputation System
- Weighted average rating (1-5 stars)
- Breakdown: communication, quality, expertise
- Reputation score (0-100)
- Review fraud flag support

### 🛡️ Admin Panel
- Platform stats dashboard
- User management (suspend/verify)
- Freelancer verification badges
- Dispute resolution
- Revenue & fee tracking

### 🔔 Notifications
- Real-time Socket.IO notifications
- Types: new gig, proposal update, payment, review, system
- Mark all as read
- Notification dropdown in nav

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | React.js, React Router v6, Recharts, Socket.IO client |
| Styling | Tailwind CSS (CDN), Custom CSS, Google Fonts (Syne + DM Sans) |
| Backend | Node.js, Express.js |
| Database | MongoDB + Mongoose |
| Auth | JWT + bcryptjs |
| Real-time | Socket.IO |
| Email | Nodemailer |
| State | React Context API |
| HTTP | Axios |

---

## 📦 Optional Enhancements

```bash
# Add Redis for caching (optional)
npm install redis ioredis

# Add Razorpay for real payments
npm install razorpay

# Add Cloudinary for file uploads
npm install cloudinary multer-storage-cloudinary

# Add rate limiting (already installed)
# helmet + express-rate-limit already configured
```

---

## 🔧 Environment Variables Reference

```env
# Server
PORT=5000
MONGODB_URI=mongodb://localhost:27017/skillsphere
JWT_SECRET=change_this_in_production_min_32_chars
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000

# Email (Gmail)
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=your@gmail.com
EMAIL_PASS=your_16_char_app_password

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=xxxxx
CLOUDINARY_API_KEY=xxxxx
CLOUDINARY_API_SECRET=xxxxx

# Razorpay (for real payments)
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
```

---

## 📝 License
MIT © SkillSphere 2024
