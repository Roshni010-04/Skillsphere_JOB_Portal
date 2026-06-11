# SkillSphere — Windows Installation Guide

## Step 1: Install Backend

Open PowerShell in the `skillsphere\backend` folder:

```powershell
cd skillsphere\backend
npm install
copy .env.example .env
```

Then edit `.env` — at minimum set these two:
```
MONGODB_URI=mongodb://localhost:27017/skillsphere
JWT_SECRET=mysecretkey123changethis
```

Seed the database (creates demo accounts + sample gigs):
```powershell
node seed.js
```

Start the backend:
```powershell
node server.js
```
✅ Backend runs at **http://localhost:5000**

---

## Step 2: Install Frontend

Open a NEW PowerShell window in `skillsphere\frontend`:

```powershell
cd skillsphere\frontend
npm install --legacy-peer-deps
npm start
```
✅ Frontend opens at **http://localhost:3000**

---

## Demo Login Accounts

| Role       | Email                 | Password     |
|------------|-----------------------|--------------|
| Client     | client@demo.com       | password123  |
| Freelancer | freelancer@demo.com   | password123  |
| Freelancer | freelancer2@demo.com  | password123  |
| Admin      | admin@demo.com        | password123  |

---

## If you get npm errors on frontend:

```powershell
# Option 1 (recommended)
npm install --legacy-peer-deps

# Option 2 (if above fails)
npm install --force
```

## If MongoDB is not installed:
Download from https://www.mongodb.com/try/download/community
Or use MongoDB Atlas free cloud: https://mongodb.com/atlas
(Update MONGODB_URI in .env with your Atlas connection string)

## Packages actually used (no react-query, no redux needed):
- react-router-dom
- axios
- socket.io-client
- react-hot-toast
- recharts
- lucide-react
- date-fns
