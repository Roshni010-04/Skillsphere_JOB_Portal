import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Clock, DollarSign, Star, Users, Eye, Bookmark, BookmarkCheck, Shield, Zap } from 'lucide-react';

// ─── STAR RATING ───────────────────────────────────────────
export function StarRating({ rating = 0, size = 14, count, showCount = true }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4 }}>
      {[1,2,3,4,5].map(i => (
        <Star key={i} size={size} fill={i <= Math.round(rating) ? '#f97316' : 'none'} color={i <= Math.round(rating) ? '#f97316' : '#475569'} />
      ))}
      {showCount && <span style={{ fontSize: size, color: '#94a3b8', marginLeft: 2 }}>{rating?.toFixed(1)}{count !== undefined && ` (${count})`}</span>}
    </span>
  );
}

// ─── SPINNER ───────────────────────────────────────────────
export function Spinner({ size = 32 }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
      <div style={{ width: size, height: size, border: `3px solid #1e293b`, borderTop: `3px solid #f97316`, borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ─── BADGE ─────────────────────────────────────────────────
export function Badge({ children, color = 'orange' }) {
  const colors = {
    orange: { bg: 'rgba(249,115,22,0.15)', text: '#f97316' },
    green: { bg: 'rgba(34,197,94,0.15)', text: '#22c55e' },
    blue: { bg: 'rgba(59,130,246,0.15)', text: '#3b82f6' },
    red: { bg: 'rgba(239,68,68,0.15)', text: '#ef4444' },
    purple: { bg: 'rgba(168,85,247,0.15)', text: '#a855f7' },
    gray: { bg: '#334155', text: '#94a3b8' },
  };
  const c = colors[color] || colors.orange;
  return <span style={{ display: 'inline-flex', alignItems: 'center', padding: '2px 10px', borderRadius: 999, fontSize: 11, fontWeight: 600, background: c.bg, color: c.text }}>{children}</span>;
}

// ─── GIG CARD ──────────────────────────────────────────────
export function GigCard({ gig, onSave, saved }) {
  const budget = gig.budget;
  const budgetText = budget?.type === 'fixed'
    ? `₹${budget.min?.toLocaleString()} – ₹${budget.max?.toLocaleString()}`
    : `₹${budget?.min}/hr`;

  return (
    <div className="fade-in" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20, display: 'flex', flexDirection: 'column', gap: 12, transition: 'all 0.2s', cursor: 'pointer' }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}>

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
            <Badge color="blue">{gig.category}</Badge>
            {gig.isUrgent && <Badge color="red">🔥 Urgent</Badge>}
            {gig.isFeatured && <Badge color="orange">⭐ Featured</Badge>}
          </div>
          <Link to={`/gigs/${gig._id}`} style={{ textDecoration: 'none' }}>
            <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, color: '#f1f5f9', margin: 0, lineHeight: 1.3 }}>{gig.title}</h3>
          </Link>
        </div>
        {onSave && (
          <button onClick={() => onSave(gig._id)} style={{ background: 'transparent', border: 'none', color: saved ? '#f97316' : '#475569', cursor: 'pointer', padding: 4 }}>
            {saved ? <BookmarkCheck size={18} /> : <Bookmark size={18} />}
          </button>
        )}
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: '#94a3b8', margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
        {gig.description}
      </p>

      {/* Skills */}
      {gig.skills?.length > 0 && (
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {gig.skills.slice(0, 4).map(s => <Badge key={s} color="gray">{s}</Badge>)}
          {gig.skills.length > 4 && <Badge color="gray">+{gig.skills.length - 4}</Badge>}
        </div>
      )}

      {/* Meta */}
      <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#64748b', flexWrap: 'wrap' }}>
        {gig.location?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{gig.location.city}</span>}
        {gig.duration && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Clock size={12} />{gig.duration.replace(/_/g, ' ')}</span>}
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={12} />{gig.views || 0} views</span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={12} />{gig.applicants || 0} applicants</span>
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: 8, borderTop: '1px solid #334155' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700 }}>
            {gig.client?.name?.charAt(0) || 'C'}
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 500 }}>{gig.client?.name || 'Client'}</div>
            <StarRating rating={gig.client?.reputation?.averageRating || 0} size={10} showCount={false} />
          </div>
        </div>
        <div style={{ textAlign: 'right' }}>
          <div style={{ fontSize: 14, fontWeight: 700, color: '#f97316' }}>{budgetText}</div>
          <div style={{ fontSize: 11, color: '#64748b' }}>{budget?.type}</div>
        </div>
      </div>
    </div>
  );
}

// ─── FREELANCER CARD ───────────────────────────────────────
export function FreelancerCard({ freelancer }) {
  const fp = freelancer.freelancerProfile || {};
  return (
    <Link to={`/profile/${freelancer._id}`} style={{ textDecoration: 'none' }}>
      <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20, transition: 'all 0.2s' }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#f97316'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = '#334155'; e.currentTarget.style.transform = 'translateY(0)'; }}>
        {/* Avatar + Info */}
        <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
          <div style={{ width: 52, height: 52, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20, fontWeight: 700, flexShrink: 0, position: 'relative' }}>
            {freelancer.avatar ? <img src={freelancer.avatar} alt="" style={{ width: 52, height: 52, borderRadius: '50%', objectFit: 'cover' }} /> : freelancer.name?.charAt(0)}
            {fp.isVerifiedFreelancer && <Shield size={14} color="#22c55e" style={{ position: 'absolute', bottom: 0, right: 0, background: '#1e293b', borderRadius: '50%', padding: 1 }} />}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14, color: '#f1f5f9' }}>{freelancer.name}</span>
              {fp.availability === 'available' && <Badge color="green">Available</Badge>}
            </div>
            <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>{fp.title || 'Freelancer'}</div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginTop: 4 }}>
              <StarRating rating={freelancer.reputation?.averageRating || 0} size={12} count={freelancer.reputation?.totalReviews} />
            </div>
          </div>
        </div>

        {/* Skills */}
        {fp.skills?.length > 0 && (
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {fp.skills.slice(0, 5).map(s => <Badge key={s.name} color="gray">{s.name}</Badge>)}
          </div>
        )}

        {/* Stats */}
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, color: '#64748b', paddingTop: 12, borderTop: '1px solid #334155' }}>
          <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Zap size={12} />{fp.completedJobs || 0} jobs done</span>
          {freelancer.location?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={12} />{freelancer.location.city}</span>}
          <span style={{ color: '#f97316', fontWeight: 600 }}>{fp.hourlyRate ? `₹${fp.hourlyRate}/hr` : 'Negotiate'}</span>
        </div>
      </div>
    </Link>
  );
}

// ─── MODAL ─────────────────────────────────────────────────
export function Modal({ open, onClose, title, children, width = 500 }) {
  if (!open) return null;
  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
      onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="fade-in" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 16, width: '100%', maxWidth: width, maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 style={{ margin: 0, fontFamily: 'Syne', fontSize: 16, fontWeight: 700 }}>{title}</h3>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', fontSize: 20, lineHeight: 1 }}>×</button>
        </div>
        <div style={{ padding: 20 }}>{children}</div>
      </div>
    </div>
  );
}

// ─── EMPTY STATE ───────────────────────────────────────────
export function EmptyState({ icon, title, desc, action }) {
  return (
    <div style={{ textAlign: 'center', padding: '60px 20px' }}>
      <div style={{ fontSize: 48, marginBottom: 12 }}>{icon}</div>
      <h3 style={{ fontFamily: 'Syne', fontSize: 18, marginBottom: 8 }}>{title}</h3>
      <p style={{ color: '#64748b', marginBottom: 20, fontSize: 14 }}>{desc}</p>
      {action}
    </div>
  );
}

// ─── STAT CARD ─────────────────────────────────────────────
export function StatCard({ label, value, sub, icon, color = '#f97316' }) {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: '20px 24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 8, textTransform: 'uppercase', letterSpacing: '0.5px' }}>{label}</div>
          <div style={{ fontSize: 28, fontFamily: 'Syne', fontWeight: 800, color }}>{value}</div>
          {sub && <div style={{ fontSize: 12, color: '#64748b', marginTop: 4 }}>{sub}</div>}
        </div>
        {icon && <div style={{ fontSize: 28, opacity: 0.7 }}>{icon}</div>}
      </div>
    </div>
  );
}
