import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Eye, EyeOff, Zap } from 'lucide-react';

const Logo = () => (
  <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center', marginBottom: 32 }}>
    <div style={{ width: 36, height: 36, background: 'linear-gradient(135deg,#f97316,#ea580c)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'Syne', fontWeight: 800, fontSize: 18 }}>S</div>
    <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 20, color: '#f1f5f9' }}>SkillSphere</span>
  </Link>
);

const AuthWrap = ({ children }) => (
  <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20, position: 'relative' }}>
    <div style={{ position: 'fixed', inset: 0, background: 'radial-gradient(ellipse 60% 50% at 50% 0%, rgba(249,115,22,0.1), transparent)', pointerEvents: 'none' }} />
    <div className="fade-in" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, padding: '36px 32px', width: '100%', maxWidth: 440, position: 'relative' }}>
      <Logo />
      {children}
    </div>
  </div>
);

export function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const user = await login(form.email, form.password);
      toast.success(`Welcome back, ${user.name}!`);
      navigate(user.role === 'admin' ? '/admin' : '/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthWrap>
      <h2 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>Welcome back</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 28 }}>Sign in to your account</p>
      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="••••••••" required style={{ paddingRight: 40 }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <Link to="/forgot-password" style={{ fontSize: 13, color: '#f97316', textDecoration: 'none' }}>Forgot password?</Link>
        </div>
        <button type="submit" disabled={loading} style={{ background: loading ? '#334155' : '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontFamily: 'DM Sans', marginTop: 4 }}>
          {loading ? 'Signing in...' : 'Sign In'}
        </button>
      </form>

      {/* Demo accounts */}
      <div style={{ marginTop: 20, padding: 14, background: 'rgba(249,115,22,0.05)', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 8 }}>
        <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700, marginBottom: 8 }}>DEMO ACCOUNTS</div>
        {[['client@demo.com','Demo Client'],['freelancer@demo.com','Demo Freelancer'],['admin@demo.com','Demo Admin']].map(([email, label]) => (
          <button key={email} onClick={() => setForm({ email, password: 'password123' })} style={{ display: 'block', background: 'transparent', border: 'none', color: '#94a3b8', cursor: 'pointer', fontSize: 12, padding: '2px 0' }}>
            👤 {label}: <span style={{ color: '#64748b' }}>{email}</span>
          </button>
        ))}
      </div>

      <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 20 }}>
        Don't have an account? <Link to="/register" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Sign up</Link>
      </p>
    </AuthWrap>
  );
}

export function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [params] = useSearchParams();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: params.get('role') || 'client' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password.length < 6) return toast.error('Password must be at least 6 characters');
    setLoading(true);
    try {
      const user = await register(form);
      toast.success(`Welcome to SkillSphere, ${user.name}!`);
      navigate('/dashboard');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally { setLoading(false); }
  };

  return (
    <AuthWrap>
      <h2 style={{ fontFamily: 'Syne', fontSize: 22, fontWeight: 700, textAlign: 'center', marginBottom: 6 }}>Create your account</h2>
      <p style={{ textAlign: 'center', color: '#64748b', fontSize: 14, marginBottom: 24 }}>Join the SkillSphere community</p>

      {/* Role Toggle */}
      <div style={{ display: 'flex', background: '#0f172a', borderRadius: 8, padding: 4, marginBottom: 24 }}>
        {[['client','I want to Hire'],['freelancer','I want to Work']].map(([role, label]) => (
          <button key={role} onClick={() => setForm({...form, role})} style={{ flex: 1, padding: '8px', borderRadius: 6, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans', background: form.role === role ? '#f97316' : 'transparent', color: form.role === role ? 'white' : '#64748b', transition: 'all 0.2s' }}>
            {label}
          </button>
        ))}
      </div>

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Full Name</label>
          <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} placeholder="John Doe" required />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Email</label>
          <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} placeholder="you@example.com" required />
        </div>
        <div>
          <label style={{ fontSize: 13, fontWeight: 500, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Password</label>
          <div style={{ position: 'relative' }}>
            <input type={showPass ? 'text' : 'password'} value={form.password} onChange={e => setForm({...form, password: e.target.value})} placeholder="Min. 6 characters" required style={{ paddingRight: 40 }} />
            <button type="button" onClick={() => setShowPass(!showPass)} style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer' }}>
              {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>
        <button type="submit" disabled={loading} style={{ background: loading ? '#334155' : '#f97316', color: 'white', border: 'none', borderRadius: 8, padding: '12px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer', fontSize: 15, fontFamily: 'DM Sans', marginTop: 4 }}>
          {loading ? 'Creating account...' : `Join as ${form.role === 'client' ? 'Client' : 'Freelancer'}`}
        </button>
      </form>
      <p style={{ textAlign: 'center', fontSize: 14, color: '#64748b', marginTop: 20 }}>
        Already have an account? <Link to="/login" style={{ color: '#f97316', textDecoration: 'none', fontWeight: 600 }}>Sign in</Link>
      </p>
    </AuthWrap>
  );
}
