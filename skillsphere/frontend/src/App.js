import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Landing from './pages/Landing';
import { Login, Register } from './pages/Auth';
import GigMarketplace from './pages/GigMarketplace';
import GigDetail from './pages/GigDetail';
import PostGig from './pages/PostGig';
import Dashboard from './pages/Dashboard';
import Messages from './pages/Messages';
import AdminDashboard from './pages/Admin';
import { Profile, FreelancersList, Payments, SearchResults } from './pages/Pages';
import Settings from './pages/Settings';

const PrivateRoute = ({ children, roles }) => {
  const { user, loading } = useAuth();
  if (loading) return <div style={{ display:'flex',justifyContent:'center',alignItems:'center',height:'80vh' }}><div style={{ width:40,height:40,border:'3px solid #1e293b',borderTop:'3px solid #f97316',borderRadius:'50%',animation:'spin 0.7s linear infinite' }}/><style>{'@keyframes spin{to{transform:rotate(360deg)}}'}</style></div>;
  if (!user) return <Navigate to="/login" />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/dashboard" />;
  return children;
};

function AppRoutes() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/gigs" element={<GigMarketplace />} />
        <Route path="/gigs/:id" element={<GigDetail />} />
        <Route path="/freelancers" element={<FreelancersList />} />
        <Route path="/profile/:id" element={<Profile />} />
        <Route path="/search" element={<SearchResults />} />
        <Route path="/post-gig" element={<PrivateRoute roles={['client']}><PostGig /></PrivateRoute>} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/messages" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/messages/:userId" element={<PrivateRoute><Messages /></PrivateRoute>} />
        <Route path="/payments" element={<PrivateRoute><Payments /></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute roles={['admin']}><AdminDashboard /></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Settings /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Toaster position="top-right" toastOptions={{ style:{ background:'#1e293b',color:'#f1f5f9',border:'1px solid #334155',fontFamily:'DM Sans' }, success:{ iconTheme:{ primary:'#22c55e',secondary:'#1e293b' } }, error:{ iconTheme:{ primary:'#ef4444',secondary:'#1e293b' } } }} />
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
// Settings import handled via direct require in routes
