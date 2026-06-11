import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { StatCard, Badge, Spinner } from '../components/UI';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { Users, Briefcase, DollarSign, AlertTriangle, CheckCircle, XCircle, Eye } from 'lucide-react';

export default function AdminDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [disputes, setDisputes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    if (!user || user.role !== 'admin') { navigate('/'); return; }
    const fetchAll = async () => {
      try {
        const [dashRes, usersRes, disputesRes] = await Promise.all([
          API.get('/admin/dashboard'),
          API.get('/admin/users?limit=50'),
          API.get('/admin/disputes'),
        ]);
        setStats(dashRes.data.stats);
        setUsers(usersRes.data.users || []);
        setDisputes(disputesRes.data.disputes || []);
      } catch {} finally { setLoading(false); }
    };
    fetchAll();
  }, [user]);

  const suspendUser = async (id, suspend) => {
    await API.put(`/admin/users/${id}/suspend`, { suspend });
    setUsers(prev => prev.map(u => u._id === id ? { ...u, isSuspended: suspend } : u));
  };

  const verifyFreelancer = async (id) => {
    await API.put(`/admin/users/${id}/verify`);
    setUsers(prev => prev.map(u => u._id === id ? { ...u, freelancerProfile: { ...u.freelancerProfile, isVerifiedFreelancer: true } } : u));
  };

  const resolveDispute = async (id, status) => {
    await API.put(`/admin/disputes/${id}/resolve`, { status, resolution: 'Admin resolved' });
    setDisputes(prev => prev.map(d => d._id === id ? { ...d, status } : d));
  };

  if (loading) return <div style={{ padding: 40 }}><Spinner /></div>;

  const filteredUsers = users.filter(u => {
    const matchesSearch = !search || u.name?.toLowerCase().includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchesRole = !roleFilter || u.role === roleFilter;
    return matchesSearch && matchesRole;
  });

  const tabs = ['overview', 'users', 'disputes'];

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
        <div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, margin: 0 }}>Admin Dashboard</h1>
          <p style={{ color: '#64748b', margin: '4px 0 0', fontSize: 14 }}>Platform control center</p>
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 8, padding: '6px 14px' }}>
          <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', animation: 'pulse 1.5s infinite' }} />
          <span style={{ fontSize: 13, color: '#f97316', fontWeight: 600 }}>System Online</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {tabs.map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: activeTab === tab ? '#f97316' : 'transparent', color: activeTab === tab ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', fontFamily: 'DM Sans', transition: 'all 0.2s' }}>
            {tab}
          </button>
        ))}
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            <StatCard label="Total Users" value={stats?.totalUsers?.toLocaleString() || 0} icon="👥" />
            <StatCard label="Total Gigs" value={stats?.totalGigs?.toLocaleString() || 0} icon="💼" />
            <StatCard label="Platform Revenue" value={`₹${(stats?.platformFees || 0).toLocaleString()}`} icon="💰" color="#22c55e" />
            <StatCard label="Open Disputes" value={stats?.openDisputes || 0} icon="⚠️" color={stats?.openDisputes > 5 ? '#ef4444' : '#f97316'} />
            <StatCard label="Active Freelancers" value={stats?.activeFreelancers?.toLocaleString() || 0} icon="🧑‍💻" />
            <StatCard label="Total Volume" value={`₹${(stats?.totalRevenue || 0).toLocaleString()}`} icon="📈" color="#3b82f6" />
          </div>

          {/* Recent Users */}
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
            <h3 style={{ fontFamily: 'Syne', margin: '0 0 20px', fontSize: 16, fontWeight: 700 }}>Recently Joined Users</h3>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: '#64748b', borderBottom: '1px solid #334155' }}>
                  {['Name', 'Email', 'Role', 'Status', 'Joined'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600 }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {(stats?.recentUsers || users.slice(0,8)).map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td style={{ padding: '10px 12px', fontWeight: 500 }}>{u.name}</td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{u.email}</td>
                    <td style={{ padding: '10px 12px' }}><Badge color={u.role === 'admin' ? 'orange' : u.role === 'freelancer' ? 'blue' : 'gray'}>{u.role}</Badge></td>
                    <td style={{ padding: '10px 12px' }}><Badge color={u.isSuspended ? 'red' : u.isVerified ? 'green' : 'gray'}>{u.isSuspended ? 'Suspended' : u.isVerified ? 'Verified' : 'Pending'}</Badge></td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* USERS TAB */}
      {activeTab === 'users' && (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <div style={{ display: 'flex', gap: 12, marginBottom: 20, flexWrap: 'wrap' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search by name or email..." style={{ flex: 1, minWidth: 200 }} />
            <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ width: 'auto' }}>
              <option value="">All Roles</option>
              <option value="client">Client</option>
              <option value="freelancer">Freelancer</option>
              <option value="admin">Admin</option>
            </select>
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 12 }}>{filteredUsers.length} users</div>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ color: '#64748b', borderBottom: '1px solid #334155' }}>
                  {['User', 'Role', 'Status', 'Verified', 'Joined', 'Actions'].map(h => <th key={h} style={{ textAlign: 'left', padding: '8px 12px', fontWeight: 600, whiteSpace: 'nowrap' }}>{h}</th>)}
                </tr>
              </thead>
              <tbody>
                {filteredUsers.map(u => (
                  <tr key={u._id} style={{ borderBottom: '1px solid #0f172a' }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600 }}>{u.name}</div>
                      <div style={{ color: '#64748b', fontSize: 12 }}>{u.email}</div>
                    </td>
                    <td style={{ padding: '10px 12px' }}><Badge color={u.role === 'admin' ? 'orange' : u.role === 'freelancer' ? 'blue' : 'gray'}>{u.role}</Badge></td>
                    <td style={{ padding: '10px 12px' }}><Badge color={u.isSuspended ? 'red' : 'green'}>{u.isSuspended ? 'Suspended' : 'Active'}</Badge></td>
                    <td style={{ padding: '10px 12px' }}><Badge color={u.isVerified ? 'green' : 'gray'}>{u.isVerified ? '✓ Yes' : 'No'}</Badge></td>
                    <td style={{ padding: '10px 12px', color: '#64748b' }}>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        <button onClick={() => suspendUser(u._id, !u.isSuspended)} style={{ padding: '4px 10px', border: 'none', borderRadius: 6, background: u.isSuspended ? 'rgba(34,197,94,0.15)' : 'rgba(239,68,68,0.15)', color: u.isSuspended ? '#22c55e' : '#ef4444', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>
                          {u.isSuspended ? 'Unsuspend' : 'Suspend'}
                        </button>
                        {u.role === 'freelancer' && !u.freelancerProfile?.isVerifiedFreelancer && (
                          <button onClick={() => verifyFreelancer(u._id)} style={{ padding: '4px 10px', border: 'none', borderRadius: 6, background: 'rgba(249,115,22,0.15)', color: '#f97316', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Verify</button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DISPUTES TAB */}
      {activeTab === 'disputes' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {disputes.length === 0 ? (
            <div style={{ textAlign: 'center', padding: 60, color: '#64748b', background: '#1e293b', border: '1px solid #334155', borderRadius: 12 }}>
              <div style={{ fontSize: 40, marginBottom: 12 }}>✅</div>
              <div style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 600 }}>No open disputes</div>
            </div>
          ) : disputes.map(d => (
            <div key={d._id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 4 }}>Gig: {d.gig?.title}</div>
                  <div style={{ fontSize: 12, color: '#64748b' }}>Raised by: <span style={{ color: '#f1f5f9' }}>{d.raisedBy?.name}</span> · Against: <span style={{ color: '#f1f5f9' }}>{d.against?.name}</span></div>
                </div>
                <Badge color={d.status === 'open' ? 'red' : d.status === 'under_review' ? 'orange' : 'green'}>{d.status.replace('_',' ')}</Badge>
              </div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 12 }}><strong>Reason:</strong> {d.reason}</div>
              <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 16 }}>{d.description}</div>
              {d.status === 'open' && (
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => resolveDispute(d._id, 'resolved_client')} style={{ padding: '6px 14px', background: 'rgba(34,197,94,0.15)', color: '#22c55e', border: '1px solid #22c55e', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Resolve for Client</button>
                  <button onClick={() => resolveDispute(d._id, 'resolved_freelancer')} style={{ padding: '6px 14px', background: 'rgba(59,130,246,0.15)', color: '#3b82f6', border: '1px solid #3b82f6', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Resolve for Freelancer</button>
                  <button onClick={() => resolveDispute(d._id, 'closed')} style={{ padding: '6px 14px', background: 'transparent', color: '#64748b', border: '1px solid #334155', borderRadius: 8, cursor: 'pointer', fontSize: 12 }}>Close</button>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
