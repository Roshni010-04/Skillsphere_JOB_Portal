import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Zap, Shield, Star, TrendingUp, Users, Briefcase, ArrowRight, CheckCircle } from 'lucide-react';
import API from '../utils/api';
import { GigCard, FreelancerCard, StarRating } from '../components/UI';

const CATEGORIES = ['Web Development','Mobile Apps','UI/UX Design','Data Science','Digital Marketing','Content Writing','Video Editing','Cybersecurity'];

export default function Landing() {
  const [search, setSearch] = useState('');
  const [recentGigs, setRecentGigs] = useState([]);
  const [topFreelancers, setTopFreelancers] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    API.get('/gigs?limit=4&sort=-createdAt').then(r => setRecentGigs(r.data.gigs || [])).catch(() => {});
    API.get('/users/freelancers?limit=4').then(r => setTopFreelancers(r.data.freelancers || [])).catch(() => {});
  }, []);

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/gigs?search=${encodeURIComponent(search)}`);
  };

  return (
    <div>
      {/* HERO */}
      <section style={{ position: 'relative', overflow: 'hidden', padding: '80px 24px 100px', textAlign: 'center' }}>
        <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse 80% 50% at 50% -10%, rgba(249,115,22,0.15), transparent)', pointerEvents: 'none' }} />
        <div style={{ maxWidth: 720, margin: '0 auto', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 999, padding: '6px 16px', marginBottom: 24 }}>
            <Zap size={14} color="#f97316" />
            <span style={{ fontSize: 13, color: '#f97316', fontWeight: 600 }}>AI-Powered Hyperlocal Freelance Platform</span>
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 'clamp(36px,6vw,64px)', fontWeight: 800, lineHeight: 1.1, marginBottom: 20, background: 'linear-gradient(135deg,#f1f5f9 40%,#f97316)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Find the Perfect<br />Freelancer Near You
          </h1>
          <p style={{ fontSize: 18, color: '#94a3b8', marginBottom: 36, lineHeight: 1.6 }}>
            Connect with verified local professionals. AI-matched, milestone-based payments, real-time collaboration.
          </p>

          {/* Search Bar */}
          <form onSubmit={handleSearch} style={{ display: 'flex', gap: 0, maxWidth: 560, margin: '0 auto 48px', background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.4)' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, padding: '0 16px' }}>
              <Search size={18} color="#64748b" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search for any skill or service..." style={{ background: 'transparent', border: 'none', outline: 'none', flex: 1, fontSize: 15, color: '#f1f5f9', padding: '14px 0' }} />
            </div>
            <button type="submit" style={{ background: '#f97316', color: 'white', border: 'none', padding: '0 24px', fontWeight: 700, cursor: 'pointer', fontSize: 14, fontFamily: 'DM Sans' }}>Search</button>
          </form>

          {/* Stats */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 40, flexWrap: 'wrap' }}>
            {[['10,000+','Verified Freelancers'],['5,000+','Projects Completed'],['₹2Cr+','Paid Out'],['4.9★','Average Rating']].map(([val, label]) => (
              <div key={label} style={{ textAlign: 'center' }}>
                <div style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, color: '#f97316' }}>{val}</div>
                <div style={{ fontSize: 12, color: '#64748b' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section style={{ padding: '60px 24px', maxWidth: 1280, margin: '0 auto' }}>
        <h2 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700, marginBottom: 8, textAlign: 'center' }}>Browse by Category</h2>
        <p style={{ color: '#64748b', textAlign: 'center', marginBottom: 36 }}>Find experts across every field</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(140px,1fr))', gap: 12 }}>
          {CATEGORIES.map((cat, i) => {
            const icons = ['💻','📱','🎨','📊','📣','✍️','🎬','🔐'];
            return (
              <Link key={cat} to={`/gigs?category=${encodeURIComponent(cat)}`} style={{ textDecoration: 'none' }}>
                <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 16px', textAlign: 'center', cursor: 'pointer', transition: 'all 0.2s' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.background = 'rgba(249,115,22,0.05)'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.background = '#1e293b'; }}>
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{icons[i]}</div>
                  <div style={{ fontSize: 12, fontWeight: 600, color: '#f1f5f9' }}>{cat}</div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* RECENT GIGS */}
      {recentGigs.length > 0 && (
        <section style={{ padding: '60px 24px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700, margin: 0 }}>Latest Gigs</h2>
              <p style={{ color: '#64748b', margin: '4px 0 0' }}>Fresh opportunities posted today</p>
            </div>
            <Link to="/gigs" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f97316', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {recentGigs.map(gig => <GigCard key={gig._id} gig={gig} />)}
          </div>
        </section>
      )}

      {/* TOP FREELANCERS */}
      {topFreelancers.length > 0 && (
        <section style={{ padding: '60px 24px', maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 700, margin: 0 }}>Top Freelancers</h2>
              <p style={{ color: '#64748b', margin: '4px 0 0' }}>Verified professionals ready to work</p>
            </div>
            <Link to="/freelancers" style={{ display: 'flex', alignItems: 'center', gap: 6, color: '#f97316', textDecoration: 'none', fontWeight: 600, fontSize: 14 }}>
              View all <ArrowRight size={16} />
            </Link>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
            {topFreelancers.map(f => <FreelancerCard key={f._id} freelancer={f} />)}
          </div>
        </section>
      )}

      {/* HOW IT WORKS */}
      <section style={{ padding: '80px 24px', background: '#1e293b', borderTop: '1px solid #334155', borderBottom: '1px solid #334155' }}>
        <div style={{ maxWidth: 1000, margin: '0 auto', textAlign: 'center' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 32, fontWeight: 700, marginBottom: 8 }}>How SkillSphere Works</h2>
          <p style={{ color: '#64748b', marginBottom: 52, fontSize: 16 }}>Simple steps to get your project done</p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(200px,1fr))', gap: 32 }}>
            {[
              { step: '01', icon: '📝', title: 'Post Your Gig', desc: 'Describe your project, budget, and required skills in minutes' },
              { step: '02', icon: '🤖', title: 'AI Matches Experts', desc: 'Our AI engine finds the best local freelancers for your needs' },
              { step: '03', icon: '💬', title: 'Collaborate & Chat', desc: 'Communicate in real-time, share files, track milestones' },
              { step: '04', icon: '💰', title: 'Pay Securely', desc: 'Escrow payments protect both parties until work is approved' },
            ].map(({ step, icon, title, desc }) => (
              <div key={step}>
                <div style={{ fontSize: 36, marginBottom: 12 }}>{icon}</div>
                <div style={{ fontSize: 11, color: '#f97316', fontWeight: 700, letterSpacing: '2px', marginBottom: 8 }}>STEP {step}</div>
                <h3 style={{ fontFamily: 'Syne', fontSize: 16, fontWeight: 700, marginBottom: 8 }}>{title}</h3>
                <p style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6 }}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '80px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 600, margin: '0 auto' }}>
          <h2 style={{ fontFamily: 'Syne', fontSize: 36, fontWeight: 800, marginBottom: 16 }}>Ready to Get Started?</h2>
          <p style={{ color: '#94a3b8', fontSize: 16, marginBottom: 32 }}>Join thousands of clients and freelancers building India's biggest hyperlocal freelance network.</p>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link to="/register?role=client" style={{ padding: '14px 28px', background: '#f97316', color: 'white', textDecoration: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15 }}>Hire a Freelancer</Link>
            <Link to="/register?role=freelancer" style={{ padding: '14px 28px', border: '1px solid #f97316', color: '#f97316', textDecoration: 'none', borderRadius: 10, fontWeight: 700, fontSize: 15 }}>Start Freelancing</Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{ background: '#1e293b', borderTop: '1px solid #334155', padding: '40px 24px', textAlign: 'center' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 18, color: '#f97316', marginBottom: 8 }}>SkillSphere</div>
          <p style={{ color: '#475569', fontSize: 13 }}>© 2026 SkillSphere. Intelligent Freelance Ecosystem.</p>
        </div>
      </footer>
    </div>
  );
}
