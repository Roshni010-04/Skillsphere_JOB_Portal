import React, { useState, useEffect } from 'react';
import { useParams, Link, useSearchParams } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Badge, StarRating, FreelancerCard, GigCard, EmptyState, StatCard } from '../components/UI';
import toast from 'react-hot-toast';
import { MapPin, MessageSquare, Shield, Briefcase, Star, DollarSign, ExternalLink, CheckCircle } from 'lucide-react';

// ─── PROFILE PAGE ─────────────────────────────────────────────────────────────
export function Profile() {
  const { id } = useParams();
  const { user: me } = useAuth();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('about');
  const [reviewForm, setReviewForm] = useState({ rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    Promise.all([
      API.get(`/users/${id}`),
      API.get(`/reviews/user/${id}`)
    ]).then(([userRes, revRes]) => {
      setUser(userRes.data.user);
      setReviews(revRes.data.reviews || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [id]);

  const submitReview = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await API.post('/reviews', { ...reviewForm, revieweeId: id });
      toast.success('Review submitted!');
      const res = await API.get(`/reviews/user/${id}`);
      setReviews(res.data.reviews || []);
      setReviewForm({ rating: 5, comment: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSubmittingReview(false); }
  };

  if (loading) return <div style={{ padding: 40 }}><Spinner /></div>;
  if (!user) return <div style={{ textAlign: 'center', padding: 80 }}>User not found</div>;

  const fp = user.freelancerProfile || {};
  const isMe = me?._id === id;
  const isFreelancer = user.role === 'freelancer';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '320px 1fr', gap: 28 }}>
      {/* LEFT */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Profile Card */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24, textAlign: 'center' }}>
          <div style={{ position: 'relative', display: 'inline-block', marginBottom: 12 }}>
            <div style={{ width: 80, height: 80, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 32, fontWeight: 700, margin: '0 auto' }}>
              {user.avatar ? <img src={user.avatar} alt="" style={{ width: 80, height: 80, borderRadius: '50%', objectFit: 'cover' }} /> : user.name?.charAt(0)}
            </div>
            {fp.isVerifiedFreelancer && <div style={{ position: 'absolute', bottom: 0, right: 0, width: 22, height: 22, background: '#22c55e', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '2px solid #1e293b' }}><Shield size={12} color="white" /></div>}
          </div>
          <h2 style={{ fontFamily: 'Syne', fontSize: 20, fontWeight: 800, margin: '0 0 4px' }}>{user.name}</h2>
          {fp.title && <div style={{ color: '#64748b', fontSize: 14, marginBottom: 8 }}>{fp.title}</div>}
          <div style={{ marginBottom: 12 }}><StarRating rating={user.reputation?.averageRating || 0} size={14} count={user.reputation?.totalReviews} /></div>
          {user.location?.city && <div style={{ fontSize: 13, color: '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 4 }}><MapPin size={13} />{user.location.city}, {user.location.state}</div>}
          {isFreelancer && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
              <Badge color={fp.availability === 'available' ? 'green' : 'gray'}>{fp.availability}</Badge>
              {fp.verificationBadge !== 'none' && <Badge color="orange">⭐ {fp.verificationBadge}</Badge>}
            </div>
          )}
          {!isMe && me && (
            <Link to={`/messages/${user._id}`} style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, marginTop: 16, padding: '10px', background: '#f97316', color: 'white', textDecoration: 'none', borderRadius: 8, fontWeight: 600, fontSize: 14 }}>
              <MessageSquare size={15} /> Message
            </Link>
          )}
          {isMe && <Link to="/settings" style={{ display: 'block', marginTop: 12, padding: '8px', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', textDecoration: 'none', fontSize: 13, textAlign: 'center' }}>Edit Profile</Link>}
        </div>

        {/* Stats */}
        {isFreelancer && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
            {[
              ['💼', 'Jobs Completed', fp.completedJobs || 0],
              ['💰', 'Hourly Rate', fp.hourlyRate ? `₹${fp.hourlyRate}` : 'Flexible'],
              ['⏱️', 'Response Time', fp.responseTime || '24 hrs'],
              ['✅', 'Success Rate', `${fp.successRate || 0}%`],
            ].map(([icon, label, val]) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid #334155', fontSize: 13 }}>
                <span style={{ color: '#64748b' }}>{icon} {label}</span>
                <span style={{ fontWeight: 600, color: '#f1f5f9' }}>{val}</span>
              </div>
            ))}
          </div>
        )}

        {/* Skills */}
        {fp.skills?.length > 0 && (
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
            <h4 style={{ fontFamily: 'Syne', margin: '0 0 12px', fontSize: 14, fontWeight: 700 }}>Skills</h4>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {fp.skills.map(s => (
                <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '4px 10px', background: '#0f172a', border: '1px solid #334155', borderRadius: 999, fontSize: 12 }}>
                  {s.name}
                  {s.level === 'expert' && <span style={{ color: '#f97316', fontSize: 10 }}>★</span>}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* RIGHT */}
      <div>
        {/* Tabs */}
        <div style={{ display: 'flex', gap: 0, marginBottom: 24, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden', width: 'fit-content' }}>
          {['about', 'portfolio', 'reviews'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} style={{ padding: '10px 20px', border: 'none', background: activeTab === tab ? '#f97316' : 'transparent', color: activeTab === tab ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', fontFamily: 'DM Sans', transition: 'all 0.2s' }}>{tab}</button>
          ))}
        </div>

        {activeTab === 'about' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            {user.bio && <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
              <h3 style={{ fontFamily: 'Syne', margin: '0 0 12px', fontSize: 15, fontWeight: 700 }}>About</h3>
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: 14, margin: 0 }}>{user.bio}</p>
            </div>}
            {fp.experience?.length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Work Experience</h3>
                {fp.experience.map((e, i) => (
                  <div key={i} style={{ paddingLeft: 16, borderLeft: '2px solid #f97316', marginBottom: 16 }}>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{e.role}</div>
                    <div style={{ color: '#f97316', fontSize: 13 }}>{e.company}</div>
                    <div style={{ color: '#64748b', fontSize: 12 }}>{e.current ? 'Present' : new Date(e.to).getFullYear()} · {e.description}</div>
                  </div>
                ))}
              </div>
            )}
            {fp.certifications?.length > 0 && (
              <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
                <h3 style={{ fontFamily: 'Syne', margin: '0 0 16px', fontSize: 15, fontWeight: 700 }}>Certifications</h3>
                {fp.certifications.map((c, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                    <CheckCircle size={16} color="#22c55e" style={{ flexShrink: 0, marginTop: 2 }} />
                    <div><div style={{ fontWeight: 600, fontSize: 13 }}>{c.name}</div><div style={{ color: '#64748b', fontSize: 12 }}>{c.issuer} · {c.year}</div></div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'portfolio' && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(200px,1fr))', gap: 16 }}>
            {fp.portfolio?.length === 0 && <EmptyState icon="🎨" title="No portfolio items" desc="Portfolio items will appear here" />}
            {fp.portfolio?.map((p, i) => (
              <div key={i} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
                {p.imageUrl && <img src={p.imageUrl} alt={p.title} style={{ width: '100%', height: 140, objectFit: 'cover' }} />}
                <div style={{ padding: 12 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{p.title}</div>
                  {p.description && <div style={{ color: '#64748b', fontSize: 12, marginTop: 4 }}>{p.description}</div>}
                  {p.link && <a href={p.link} target="_blank" rel="noopener noreferrer" style={{ display: 'flex', alignItems: 'center', gap: 4, color: '#f97316', fontSize: 12, marginTop: 6, textDecoration: 'none' }}><ExternalLink size={11} /> View Project</a>}
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'reviews' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {me && me._id !== id && (
              <form onSubmit={submitReview} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
                <h4 style={{ fontFamily: 'Syne', margin: '0 0 12px', fontSize: 14 }}>Leave a Review</h4>
                <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
                  {[1,2,3,4,5].map(n => (
                    <button key={n} type="button" onClick={() => setReviewForm(f => ({...f, rating: n}))} style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 22, color: n <= reviewForm.rating ? '#f97316' : '#334155' }}>★</button>
                  ))}
                </div>
                <textarea value={reviewForm.comment} onChange={e => setReviewForm(f => ({...f, comment: e.target.value}))} placeholder="Share your experience..." rows={3} required style={{ resize: 'none', marginBottom: 10 }} />
                <button type="submit" disabled={submittingReview} style={{ padding: '8px 20px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
            )}
            {reviews.length === 0 ? <EmptyState icon="⭐" title="No reviews yet" desc="Reviews from completed projects will appear here" /> : reviews.map(r => (
              <div key={r._id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 10 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, flexShrink: 0 }}>{r.reviewer?.name?.charAt(0)}</div>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13 }}>{r.reviewer?.name}</div>
                    <StarRating rating={r.rating} size={13} showCount={false} />
                  </div>
                  <div style={{ marginLeft: 'auto', fontSize: 12, color: '#64748b' }}>{new Date(r.createdAt).toLocaleDateString()}</div>
                </div>
                <p style={{ color: '#94a3b8', fontSize: 13, margin: 0, lineHeight: 1.6 }}>{r.comment}</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FREELANCERS LIST ─────────────────────────────────────────────────────────
export function FreelancersList() {
  const [freelancers, setFreelancers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ skills: '', city: '', availability: '', minRating: '' });

  useEffect(() => {
    const q = new URLSearchParams(filters);
    Object.keys(filters).forEach(k => !filters[k] && q.delete(k));
    API.get(`/users/freelancers?${q}`).then(r => { setFreelancers(r.data.freelancers || []); setLoading(false); }).catch(() => setLoading(false));
  }, [filters]);

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Browse Freelancers</h1>
      <p style={{ color: '#64748b', marginBottom: 24, fontSize: 14 }}>Find verified professionals near you</p>
      <div style={{ display: 'flex', gap: 12, marginBottom: 28, flexWrap: 'wrap' }}>
        <input placeholder="Skills (e.g. React, Python)" value={filters.skills} onChange={e => setFilters(f => ({...f, skills: e.target.value}))} style={{ flex: 1, minWidth: 180 }} />
        <input placeholder="City" value={filters.city} onChange={e => setFilters(f => ({...f, city: e.target.value}))} style={{ width: 160 }} />
        <select value={filters.availability} onChange={e => setFilters(f => ({...f, availability: e.target.value}))} style={{ width: 'auto' }}>
          <option value="">Any Availability</option>
          <option value="available">Available Now</option>
          <option value="busy">Busy</option>
        </select>
        <select value={filters.minRating} onChange={e => setFilters(f => ({...f, minRating: e.target.value}))} style={{ width: 'auto' }}>
          <option value="">Any Rating</option>
          <option value="4">4+ Stars</option>
          <option value="4.5">4.5+ Stars</option>
        </select>
      </div>
      {loading ? <Spinner /> : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
          {freelancers.map(f => <FreelancerCard key={f._id} freelancer={f} />)}
          {freelancers.length === 0 && <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: '#64748b' }}>No freelancers found</div>}
        </div>
      )}
    </div>
  );
}

// ─── PAYMENTS PAGE ────────────────────────────────────────────────────────────
export function Payments() {
  const { user } = useAuth();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    API.get('/payments').then(r => { setPayments(r.data.payments || []); setLoading(false); }).catch(() => setLoading(false));
  }, []);

  const release = async (id) => {
    try { await API.put(`/payments/${id}/release`); toast.success('Payment released!'); const r = await API.get('/payments'); setPayments(r.data.payments || []); }
    catch { toast.error('Failed to release'); }
  };

  const statusColor = { pending: 'orange', captured: 'blue', in_escrow: 'blue', released: 'green', refunded: 'gray', failed: 'red' };
  const totalEarned = payments.filter(p => p.status === 'released' && p.freelancer?._id === user?._id).reduce((s, p) => s + (p.freelancerAmount || 0), 0);
  const totalSpent = payments.filter(p => p.client?._id === user?._id).reduce((s, p) => s + p.amount, 0);

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, marginBottom: 24 }}>Payments</h1>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28 }}>
        <StatCard label={user?.role === 'freelancer' ? 'Total Earned' : 'Total Spent'} value={`₹${(user?.role === 'freelancer' ? totalEarned : totalSpent).toLocaleString()}`} icon="💰" color="#22c55e" />
        <StatCard label="Transactions" value={payments.length} icon="📋" />
        <StatCard label="In Escrow" value={`₹${payments.filter(p => p.status === 'in_escrow').reduce((s,p) => s+p.amount,0).toLocaleString()}`} icon="🔒" color="#3b82f6" />
      </div>
      {loading ? <Spinner /> : (
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
          {payments.length === 0 ? (
            <EmptyState icon="💸" title="No payments yet" desc="Your payment history will appear here" />
          ) : payments.map(p => (
            <div key={p._id} style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', gap: 16, alignItems: 'center' }}>
              <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{p.gig?.title || 'Payment'}</div>
                <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                  {p.type} · {new Date(p.createdAt).toLocaleDateString()}
                  {p.milestone && ` · Milestone: ${p.milestone}`}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 700, fontSize: 16, color: '#f97316' }}>₹{p.amount?.toLocaleString()}</div>
                <Badge color={statusColor[p.status] || 'gray'}>{p.status}</Badge>
              </div>
              {user?.role === 'client' && p.status === 'in_escrow' && (
                <button onClick={() => release(p._id)} style={{ padding: '6px 14px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontSize: 12, fontWeight: 600, flexShrink: 0 }}>Release</button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── SEARCH RESULTS ───────────────────────────────────────────────────────────
export function SearchResults() {
  const [params] = useSearchParams();
  const q = params.get('q') || '';
  const [results, setResults] = useState({ gigs: [], freelancers: [] });
  const [loading, setLoading] = useState(false);
  const [tab, setTab] = useState('gigs');

  useEffect(() => {
    if (!q) return;
    setLoading(true);
    API.get(`/search?q=${encodeURIComponent(q)}`).then(r => { setResults(r.data.results || {}); setLoading(false); }).catch(() => setLoading(false));
  }, [q]);

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, marginBottom: 8 }}>Search results for "{q}"</h1>
      <div style={{ display: 'flex', gap: 0, marginBottom: 28, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, padding: 4, width: 'fit-content' }}>
        {[['gigs',`Gigs (${results.gigs?.length||0})`],['freelancers',`Freelancers (${results.freelancers?.length||0})`]].map(([t,l]) => (
          <button key={t} onClick={() => setTab(t)} style={{ padding: '8px 20px', border: 'none', borderRadius: 7, background: tab === t ? '#f97316' : 'transparent', color: tab === t ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 13, fontFamily: 'DM Sans' }}>{l}</button>
        ))}
      </div>
      {loading ? <Spinner /> : (
        <>
          {tab === 'gigs' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
              {(results.gigs || []).map(g => <GigCard key={g._id} gig={g} />)}
              {!results.gigs?.length && <EmptyState icon="🔍" title="No gigs found" desc={`No gigs matching "${q}"`} />}
            </div>
          )}
          {tab === 'freelancers' && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(260px,1fr))', gap: 20 }}>
              {(results.freelancers || []).map(f => <FreelancerCard key={f._id} freelancer={f} />)}
              {!results.freelancers?.length && <EmptyState icon="🔍" title="No freelancers found" desc={`No freelancers matching "${q}"`} />}
            </div>
          )}
        </>
      )}
    </div>
  );
}
