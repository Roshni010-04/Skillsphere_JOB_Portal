import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { StatCard, Badge, StarRating, Spinner } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { Briefcase, DollarSign, Star, Users, Plus, Eye, MessageSquare, Clock } from 'lucide-react';

export default function Dashboard() {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [gigs, setGigs] = useState([]);
  const [proposals, setProposals] = useState([]);
  const [payments, setPayments] = useState([]);
  const [notifications, setNotifications] = useState([]);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [gigsRes, notifRes, paymentsRes] = await Promise.all([
          API.get('/gigs/my'),
          API.get('/notifications'),
          API.get('/payments'),
        ]);
        setGigs(gigsRes.data.gigs || []);
        setNotifications(notifRes.data.notifications?.slice(0, 5) || []);
        setPayments(paymentsRes.data.payments || []);
        if (user?.role === 'freelancer') {
          const propRes = await API.get('/proposals/my');
          setProposals(propRes.data.proposals || []);
        }
      } catch (e) { console.error(e); }
      finally { setLoading(false); }
    };
    fetchAll();
  }, [user]);

  if (loading) return <div style={{ padding: 40 }}><Spinner /></div>;

  const totalEarnings = payments.filter(p => p.status === 'released' && p.freelancer?._id === user?._id).reduce((s, p) => s + (p.freelancerAmount || 0), 0);
  const totalSpent = payments.filter(p => p.client?._id === user?._id).reduce((s, p) => s + (p.amount || 0), 0);
  const activeGigs = gigs.filter(g => ['open','in_progress'].includes(g.status));
  const completedGigs = gigs.filter(g => g.status === 'completed');

  // Chart data
  const monthlyData = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(); d.setMonth(d.getMonth() - 5 + i);
    const month = d.toLocaleString('default', { month: 'short' });
    const monthPayments = payments.filter(p => new Date(p.createdAt).getMonth() === d.getMonth() && new Date(p.createdAt).getFullYear() === d.getFullYear());
    return { month, amount: monthPayments.reduce((s, p) => s + (p.amount || 0), 0) };
  });

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, margin: 0 }}>
            Welcome back, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p style={{ color: '#64748b', margin: '6px 0 0', fontSize: 14 }}>
            {user?.role === 'freelancer' ? `${user?.freelancerProfile?.title || 'Freelancer'} · ` : 'Client · '}
            {new Date().toLocaleDateString('en-IN', { weekday: 'long', month: 'long', day: 'numeric' })}
          </p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          {user?.role === 'client' && (
            <Link to="/post-gig" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#f97316', color: 'white', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
              <Plus size={16} /> Post Gig
            </Link>
          )}
          {user?.role === 'freelancer' && (
            <Link to="/gigs" style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 18px', background: '#f97316', color: 'white', textDecoration: 'none', borderRadius: 8, fontWeight: 700, fontSize: 14 }}>
              <Briefcase size={16} /> Browse Gigs
            </Link>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 16, marginBottom: 32 }}>
        {user?.role === 'freelancer' ? (
          <>
            <StatCard label="Total Earnings" value={`₹${totalEarnings.toLocaleString()}`} icon="💰" color="#22c55e" />
            <StatCard label="Proposals Sent" value={proposals.length} sub={`${proposals.filter(p => p.status === 'accepted').length} accepted`} icon="📤" />
            <StatCard label="Profile Views" value={user?.analytics?.profileViews || 0} icon="👁️" />
            <StatCard label="Avg Rating" value={(user?.reputation?.averageRating || 0).toFixed(1)} sub={`${user?.reputation?.totalReviews || 0} reviews`} icon="⭐" color="#f97316" />
          </>
        ) : (
          <>
            <StatCard label="Active Gigs" value={activeGigs.length} icon="🚀" color="#f97316" />
            <StatCard label="Total Spent" value={`₹${totalSpent.toLocaleString()}`} icon="💸" color="#22c55e" />
            <StatCard label="Completed Projects" value={completedGigs.length} icon="✅" />
            <StatCard label="Total Gigs Posted" value={gigs.length} icon="📋" />
          </>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 24 }}>
        {/* LEFT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Earnings Chart */}
          {payments.length > 0 && (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne', margin: '0 0 20px', fontSize: 15, fontWeight: 700 }}>
                {user?.role === 'freelancer' ? 'Earnings' : 'Spending'} — Last 6 Months
              </h3>
              <ResponsiveContainer width="100%" height={180}>
                <BarChart data={monthlyData}>
                  <XAxis dataKey="month" tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748b', fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={v => `₹${v > 999 ? (v/1000).toFixed(0)+'k' : v}`} />
                  <Tooltip contentStyle={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 8, color: '#f1f5f9' }} formatter={v => [`₹${v.toLocaleString()}`, '']} />
                  <Bar dataKey="amount" fill="#f97316" radius={[4,4,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Gigs / Proposals */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
              <h3 style={{ fontFamily: 'Syne', margin: 0, fontSize: 15, fontWeight: 700 }}>
                {user?.role === 'client' ? 'My Gigs' : 'My Proposals'}
              </h3>
              <Link to={user?.role === 'client' ? '/my-gigs' : '/my-proposals'} style={{ fontSize: 13, color: '#f97316', textDecoration: 'none' }}>View all →</Link>
            </div>
            {(user?.role === 'client' ? gigs : proposals).length === 0 ? (
              <div style={{ textAlign: 'center', padding: 32, color: '#64748b', fontSize: 14 }}>
                {user?.role === 'client' ? 'No gigs yet. ' : 'No proposals yet. '}
                <Link to={user?.role === 'client' ? '/post-gig' : '/gigs'} style={{ color: '#f97316' }}>
                  {user?.role === 'client' ? 'Post your first gig →' : 'Browse gigs →'}
                </Link>
              </div>
            ) : (
              (user?.role === 'client' ? gigs.slice(0,5) : proposals.slice(0,5)).map(item => (
                <DashboardRow key={item._id} item={item} role={user.role} />
              ))
            )}
          </div>
        </div>

        {/* RIGHT */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          {/* Profile Completion */}
          {user?.role === 'freelancer' && (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
              <h4 style={{ fontFamily: 'Syne', margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Profile Completion</h4>
              {[
                ['Basic Info', !!(user.name && user.email && user.bio)],
                ['Skills Added', (user.freelancerProfile?.skills?.length || 0) > 0],
                ['Hourly Rate Set', !!user.freelancerProfile?.hourlyRate],
                ['Portfolio Items', (user.freelancerProfile?.portfolio?.length || 0) > 0],
                ['Profile Photo', !!user.avatar],
              ].map(([label, done]) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8, fontSize: 13 }}>
                  <div style={{ width: 18, height: 18, borderRadius: '50%', background: done ? '#22c55e' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10 }}>{done ? '✓' : ''}</div>
                  <span style={{ color: done ? '#f1f5f9' : '#64748b' }}>{label}</span>
                </div>
              ))}
              <Link to="/settings" style={{ display: 'block', textAlign: 'center', marginTop: 12, padding: '8px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, color: '#f97316', textDecoration: 'none', fontSize: 13, fontWeight: 600 }}>Complete Profile</Link>
            </div>
          )}

          {/* Recent Notifications */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h4 style={{ fontFamily: 'Syne', margin: 0, fontSize: 14, fontWeight: 700 }}>Recent Activity</h4>
            </div>
            {notifications.length === 0 ? (
              <div style={{ textAlign: 'center', padding: '20px 0', color: '#475569', fontSize: 13 }}>No recent activity</div>
            ) : notifications.map(n => (
              <div key={n._id} style={{ padding: '10px 0', borderBottom: '1px solid #0f172a' }}>
                <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, color: n.isRead ? '#94a3b8' : '#f1f5f9' }}>{n.title}</div>
                <div style={{ fontSize: 11, color: '#475569' }}>{new Date(n.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </div>

          {/* Quick Actions */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
            <h4 style={{ fontFamily: 'Syne', margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Quick Actions</h4>
            {[
              { icon: <MessageSquare size={15} />, label: 'Messages', to: '/messages' },
              { icon: <DollarSign size={15} />, label: 'Payments', to: '/payments' },
              { icon: <Eye size={15} />, label: 'My Profile', to: `/profile/${user?._id}` },
            ].map(({ icon, label, to }) => (
              <Link key={to} to={to} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px', borderRadius: 8, color: '#94a3b8', textDecoration: 'none', fontSize: 14, marginBottom: 4, transition: 'all 0.15s' }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(249,115,22,0.1)'; e.currentTarget.style.color = '#f97316'; }}
                onMouseLeave={e => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = '#94a3b8'; }}>
                {icon} {label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardRow({ item, role }) {
  const isGig = role === 'client';
  const statusColors = { open: 'green', in_progress: 'blue', completed: 'gray', pending: 'orange', accepted: 'green', rejected: 'red', cancelled: 'red' };
  const status = isGig ? item.status : item.status;
  return (
    <Link to={isGig ? `/gigs/${item._id}` : `/gigs/${item.gig?._id}`} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #0f172a', textDecoration: 'none' }}>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#f1f5f9', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{isGig ? item.title : item.gig?.title}</div>
        <div style={{ fontSize: 11, color: '#64748b' }}>{isGig ? `${item.applicants || 0} applicants` : `Bid: ₹${item.bidAmount?.toLocaleString()}`}</div>
      </div>
      <Badge color={statusColors[status] || 'gray'}>{status}</Badge>
    </Link>
  );
}
