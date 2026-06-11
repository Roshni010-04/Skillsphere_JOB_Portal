import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import { Bell, Search, Menu, X, ChevronDown, LogOut, User, Settings, LayoutDashboard, Briefcase, MessageSquare } from 'lucide-react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [unread, setUnread] = useState(0);
  const [search, setSearch] = useState('');

  useEffect(() => {
    if (user) {
      API.get('/notifications').then(r => {
        setNotifications(r.data.notifications?.slice(0, 8) || []);
        setUnread(r.data.notifications?.filter(n => !n.isRead).length || 0);
      }).catch(() => {});
    }
  }, [user, location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const markRead = () => {
    API.put('/notifications/mark-read').catch(() => {});
    setUnread(0);
    setNotifOpen(false);
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (search.trim()) { navigate(`/search?q=${encodeURIComponent(search)}`); setSearch(''); }
  };

  return (
    <nav style={{ background: 'rgba(15,23,42,0.95)', backdropFilter: 'blur(12px)', borderBottom: '1px solid #1e293b', position: 'sticky', top: 0, zIndex: 100 }}>
      <div style={{ maxWidth: 1280, margin: '0 auto', padding: '0 24px', display: 'flex', alignItems: 'center', height: 64, gap: 20 }}>
        {/* Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 32, height: 32, background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 16 }}>S</div>
          <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#f1f5f9' }}>SkillSphere</span>
        </Link>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ flex: 1, maxWidth: 400, display: 'flex', alignItems: 'center', background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '6px 12px', gap: 8 }}>
          <Search size={16} color="#64748b" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search gigs, freelancers..." style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: 14, color: '#f1f5f9', padding: 0, width: 'auto' }} />
        </form>

        {/* Nav Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link to="/gigs" style={{ color: '#94a3b8', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500 }} className="nav-link">Browse Gigs</Link>
          <Link to="/freelancers" style={{ color: '#94a3b8', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 14, fontWeight: 500 }} className="nav-link">Freelancers</Link>
          {user?.role === 'client' && (
            <Link to="/post-gig" style={{ color: '#f97316', textDecoration: 'none', padding: '6px 12px', borderRadius: 6, fontSize: 14, fontWeight: 600, border: '1px solid #f97316' }}>Post a Gig</Link>
          )}
        </div>

        <div style={{ flex: 1 }} />

        {user ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            {/* Notifications */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setNotifOpen(!notifOpen)} style={{ background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', position: 'relative', padding: 6 }}>
                <Bell size={20} />
                {unread > 0 && <span style={{ position: 'absolute', top: 0, right: 0, background: '#f97316', color: 'white', fontSize: 10, fontWeight: 700, borderRadius: '50%', width: 16, height: 16, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>{unread}</span>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', right: 0, top: 40, width: 320, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 200 }}>
                  <div style={{ padding: '12px 16px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontWeight: 600 }}>Notifications</span>
                    <button onClick={markRead} style={{ background: 'transparent', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: 12 }}>Mark all read</button>
                  </div>
                  <div style={{ maxHeight: 320, overflowY: 'auto' }}>
                    {notifications.length === 0 ? (
                      <div style={{ padding: 24, textAlign: 'center', color: '#64748b', fontSize: 14 }}>No notifications</div>
                    ) : notifications.map(n => (
                      <div key={n._id} onClick={() => { setNotifOpen(false); if (n.link) navigate(n.link); }} style={{ padding: '12px 16px', borderBottom: '1px solid #0f172a', cursor: 'pointer', background: n.isRead ? 'transparent' : 'rgba(249,115,22,0.05)' }}>
                        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{n.title}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{n.message}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Messages */}
            <Link to="/messages" style={{ color: '#94a3b8', padding: 6 }}><MessageSquare size={20} /></Link>

            {/* User Menu */}
            <div style={{ position: 'relative' }}>
              <button onClick={() => setUserMenuOpen(!userMenuOpen)} style={{ display: 'flex', alignItems: 'center', gap: 8, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '6px 12px', cursor: 'pointer', color: '#f1f5f9' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
                  {user.avatar ? <img src={user.avatar} alt="" style={{ width: 28, height: 28, borderRadius: '50%', objectFit: 'cover' }} /> : user.name?.charAt(0).toUpperCase()}
                </div>
                <span style={{ fontSize: 13, fontWeight: 500, maxWidth: 100, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user.name}</span>
                <ChevronDown size={14} color="#64748b" />
              </button>
              {userMenuOpen && (
                <div style={{ position: 'absolute', right: 0, top: 44, width: 200, background: '#1e293b', border: '1px solid #334155', borderRadius: 12, boxShadow: '0 20px 40px rgba(0,0,0,0.4)', zIndex: 200 }}>
                  {[
                    { icon: LayoutDashboard, label: 'Dashboard', to: '/dashboard' },
                    { icon: User, label: 'My Profile', to: `/profile/${user._id}` },
                    { icon: Briefcase, label: user.role === 'client' ? 'My Gigs' : 'My Proposals', to: user.role === 'client' ? '/my-gigs' : '/my-proposals' },
                    { icon: Settings, label: 'Settings', to: '/settings' },
                  ].map(({ icon: Icon, label, to }) => (
                    <Link key={to} to={to} onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', color: '#94a3b8', textDecoration: 'none', fontSize: 14 }}>
                      <Icon size={15} /> {label}
                    </Link>
                  ))}
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setUserMenuOpen(false)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', color: '#f97316', textDecoration: 'none', fontSize: 14 }}>
                      <Settings size={15} /> Admin Panel
                    </Link>
                  )}
                  <div style={{ borderTop: '1px solid #334155', margin: '4px 0' }} />
                  <button onClick={handleLogout} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', color: '#ef4444', background: 'transparent', border: 'none', cursor: 'pointer', width: '100%', fontSize: 14 }}>
                    <LogOut size={15} /> Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', gap: 8 }}>
            <Link to="/login" style={{ padding: '8px 16px', borderRadius: 8, border: '1px solid #334155', color: '#f1f5f9', textDecoration: 'none', fontSize: 14, fontWeight: 500 }}>Login</Link>
            <Link to="/register" style={{ padding: '8px 16px', borderRadius: 8, background: '#f97316', color: 'white', textDecoration: 'none', fontSize: 14, fontWeight: 600 }}>Get Started</Link>
          </div>
        )}
      </div>
    </nav>
  );
}
