import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import { Spinner, Badge, StarRating, Modal, FreelancerCard } from '../components/UI';
import toast from 'react-hot-toast';
import { MapPin, Clock, DollarSign, Users, Eye, Calendar, CheckCircle, Send, BookmarkCheck, Bookmark, MessageSquare, Zap } from 'lucide-react';

export default function GigDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [gig, setGig] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchScore, setMatchScore] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [showProposalModal, setShowProposalModal] = useState(false);
  const [saved, setSaved] = useState(false);
  const [activeTab, setActiveTab] = useState('details');
  const [proposal, setProposal] = useState({ coverLetter: '', bidAmount: '', estimatedDays: '' });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    API.get(`/gigs/${id}`).then(res => {
      setGig(res.data.gig);
      setMatchScore(res.data.matchScore);
      setLoading(false);
    }).catch(() => { toast.error('Gig not found'); navigate('/gigs'); });
  }, [id]);

  useEffect(() => {
    if (gig && user?.role === 'client' && gig.client?._id === user._id) {
      API.get(`/proposals/gig/${id}`).then(res => setProposals(res.data.proposals || [])).catch(() => {});
      API.get(`/gigs/${id}/matches`).then(res => setRecommendations(res.data.recommendations || [])).catch(() => {});
    }
  }, [gig, user]);

  const handleApply = async (e) => {
    e.preventDefault();
    if (!user) return navigate('/login');
    setSubmitting(true);
    try {
      await API.post(`/proposals/gig/${id}`, proposal);
      toast.success('Proposal submitted successfully!');
      setShowProposalModal(false);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to submit'); }
    finally { setSubmitting(false); }
  };

  const handleSave = async () => {
    if (!user) return navigate('/login');
    await API.post(`/users/save-gig/${id}`).catch(() => {});
    setSaved(!saved);
    toast.success(saved ? 'Removed from saved' : 'Saved!');
  };

  const handleProposalAction = async (proposalId, status) => {
    try {
      await API.put(`/proposals/${proposalId}/status`, { status });
      toast.success(`Proposal ${status}`);
      const res = await API.get(`/proposals/gig/${id}`);
      setProposals(res.data.proposals || []);
      if (status === 'accepted') { const r = await API.get(`/gigs/${id}`); setGig(r.data.gig); }
    } catch { toast.error('Action failed'); }
  };

  if (loading) return <div style={{ maxWidth: 1100, margin: '0 auto', padding: 32 }}><Spinner /></div>;
  if (!gig) return null;

  const isClient = user?._id === gig.client?._id;
  const isOpen = gig.status === 'open';
  const budget = gig.budget;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 320px', gap: 28 }}>
      {/* LEFT */}
      <div>
        {/* Header */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 28, marginBottom: 20 }}>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12, flexWrap: 'wrap' }}>
            <Badge color="blue">{gig.category}</Badge>
            <Badge color={gig.status === 'open' ? 'green' : 'gray'}>{gig.status}</Badge>
            {gig.isUrgent && <Badge color="red">🔥 Urgent</Badge>}
            {matchScore !== null && <Badge color="orange"><Zap size={11} /> {matchScore}% Match</Badge>}
          </div>
          <h1 style={{ fontFamily: 'Syne', fontSize: 24, fontWeight: 800, margin: '0 0 16px', lineHeight: 1.2 }}>{gig.title}</h1>
          <div style={{ display: 'flex', gap: 20, fontSize: 13, color: '#64748b', flexWrap: 'wrap' }}>
            {gig.location?.city && <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><MapPin size={13} />{gig.location.city}, {gig.location.state}</span>}
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Eye size={13} />{gig.views} views</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Users size={13} />{gig.applicants} applicants</span>
            <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}><Calendar size={13} />Posted {new Date(gig.createdAt).toLocaleDateString()}</span>
          </div>
        </div>

        {/* Tabs - show proposals tab for client */}
        {isClient && (
          <div style={{ display: 'flex', gap: 0, marginBottom: 20, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
            {[['details','Details'],['proposals',`Proposals (${proposals.length})`],['matches','AI Matches']].map(([tab, label]) => (
              <button key={tab} onClick={() => setActiveTab(tab)} style={{ flex: 1, padding: '10px', border: 'none', background: activeTab === tab ? '#f97316' : 'transparent', color: activeTab === tab ? 'white' : '#94a3b8', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, transition: 'all 0.2s' }}>{label}</button>
            ))}
          </div>
        )}

        {/* Tab content */}
        {activeTab === 'details' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Section title="Project Description">
              <p style={{ color: '#94a3b8', lineHeight: 1.7, fontSize: 14, margin: 0 }}>{gig.description}</p>
            </Section>

            {gig.skills?.length > 0 && (
              <Section title="Required Skills">
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {gig.skills.map(s => <Badge key={s} color="gray">{s}</Badge>)}
                </div>
              </Section>
            )}

            {gig.milestones?.length > 0 && (
              <Section title="Milestones">
                {gig.milestones.map((m, i) => (
                  <div key={i} style={{ display: 'flex', gap: 12, padding: '12px 0', borderBottom: '1px solid #334155' }}>
                    <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(249,115,22,0.1)', border: '1px solid #f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 700, color: '#f97316', flexShrink: 0 }}>{i+1}</div>
                    <div>
                      <div style={{ fontWeight: 600, fontSize: 14 }}>{m.title}</div>
                      {m.description && <div style={{ fontSize: 13, color: '#64748b', marginTop: 2 }}>{m.description}</div>}
                      <div style={{ fontSize: 13, color: '#f97316', marginTop: 4, fontWeight: 600 }}>₹{m.amount?.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </Section>
            )}
          </div>
        )}

        {/* Proposals Tab */}
        {activeTab === 'proposals' && isClient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {proposals.length === 0 ? <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No proposals yet</div> : proposals.map(p => (
              <div key={p._id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
                <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
                  <Link to={`/profile/${p.freelancer?._id}`}>
                    <div style={{ width: 44, height: 44, borderRadius: '50%', background: '#f97316', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{p.freelancer?.name?.charAt(0)}</div>
                  </Link>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <div>
                        <Link to={`/profile/${p.freelancer?._id}`} style={{ fontWeight: 700, color: '#f1f5f9', textDecoration: 'none' }}>{p.freelancer?.name}</Link>
                        <StarRating rating={p.freelancer?.reputation?.averageRating} size={12} count={p.freelancer?.reputation?.totalReviews} />
                      </div>
                      <div style={{ textAlign: 'right' }}>
                        <div style={{ fontSize: 18, fontWeight: 700, color: '#f97316' }}>₹{p.bidAmount?.toLocaleString()}</div>
                        <div style={{ fontSize: 12, color: '#64748b' }}>{p.estimatedDays} days</div>
                      </div>
                    </div>
                  </div>
                </div>
                <p style={{ fontSize: 13, color: '#94a3b8', lineHeight: 1.6, margin: '0 0 16px' }}>{p.coverLetter}</p>
                {p.status === 'pending' && gig.status === 'open' && (
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => handleProposalAction(p._id, 'accepted')} style={{ padding: '8px 16px', background: '#22c55e', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✓ Accept</button>
                    <button onClick={() => handleProposalAction(p._id, 'rejected')} style={{ padding: '8px 16px', background: 'transparent', color: '#ef4444', border: '1px solid #ef4444', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13 }}>✗ Reject</button>
                    <Link to={`/messages/${p.freelancer?._id}`} style={{ padding: '8px 16px', background: 'transparent', color: '#94a3b8', border: '1px solid #334155', borderRadius: 8, fontSize: 13, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 4 }}><MessageSquare size={13} /> Message</Link>
                  </div>
                )}
                {p.status !== 'pending' && <Badge color={p.status === 'accepted' ? 'green' : 'red'}>{p.status}</Badge>}
              </div>
            ))}
          </div>
        )}

        {/* AI Matches Tab */}
        {activeTab === 'matches' && isClient && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
              <Zap size={16} color="#f97316" />
              <span style={{ fontSize: 14, color: '#94a3b8' }}>AI-recommended freelancers based on skills, rating, and location</span>
            </div>
            {recommendations.map(({ freelancer, score }) => (
              <div key={freelancer._id} style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 16, display: 'flex', gap: 12, alignItems: 'center' }}>
                <div style={{ flex: 1 }}><FreelancerCard freelancer={freelancer} /></div>
                <div style={{ textAlign: 'center', flexShrink: 0 }}>
                  <div style={{ fontSize: 20, fontFamily: 'Syne', fontWeight: 800, color: score >= 70 ? '#22c55e' : '#f97316' }}>{score}%</div>
                  <div style={{ fontSize: 11, color: '#64748b' }}>match</div>
                  <Link to={`/messages/${freelancer._id}`} style={{ marginTop: 8, display: 'block', padding: '6px 12px', background: '#f97316', color: 'white', borderRadius: 6, textDecoration: 'none', fontSize: 12, fontWeight: 600 }}>Invite</Link>
                </div>
              </div>
            ))}
            {recommendations.length === 0 && <div style={{ textAlign: 'center', padding: 40, color: '#64748b' }}>No matches found</div>}
          </div>
        )}
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {/* Budget Card */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
          <div style={{ fontSize: 28, fontFamily: 'Syne', fontWeight: 800, color: '#f97316', marginBottom: 4 }}>
            {budget?.type === 'fixed' ? `₹${budget.min?.toLocaleString()} – ₹${budget.max?.toLocaleString()}` : `₹${budget?.min}/hr`}
          </div>
          <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>{budget?.type === 'fixed' ? 'Fixed Price' : 'Hourly Rate'}</div>

          {gig.duration && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94a3b8', fontSize: 13, marginBottom: 8 }}><Clock size={14} />{gig.duration.replace(/_/g,' ')}</div>}
          {gig.experienceLevel && <div style={{ fontSize: 13, color: '#94a3b8', marginBottom: 20 }}>Level: <span style={{ color: '#f1f5f9', fontWeight: 600, textTransform: 'capitalize' }}>{gig.experienceLevel}</span></div>}

          {!isClient && user?.role === 'freelancer' && isOpen && (
            <button onClick={() => setShowProposalModal(true)} style={{ width: '100%', padding: '12px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15, marginBottom: 10, fontFamily: 'DM Sans' }}>
              Submit Proposal
            </button>
          )}
          {!isClient && !user && (
            <Link to="/login" style={{ display: 'block', textAlign: 'center', padding: '12px', background: '#f97316', color: 'white', borderRadius: 8, fontWeight: 700, fontSize: 15, textDecoration: 'none', marginBottom: 10 }}>Login to Apply</Link>
          )}
          {isOpen && <button onClick={handleSave} style={{ width: '100%', padding: '10px', background: 'transparent', color: saved ? '#f97316' : '#94a3b8', border: `1px solid ${saved ? '#f97316' : '#334155'}`, borderRadius: 8, fontWeight: 600, cursor: 'pointer', fontSize: 13, display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center' }}>
            {saved ? <><BookmarkCheck size={15} /> Saved</> : <><Bookmark size={15} /> Save Gig</>}
          </button>}
        </div>

        {/* Client Card */}
        <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 20 }}>
          <div style={{ fontSize: 12, color: '#64748b', marginBottom: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>Posted by</div>
          <Link to={`/profile/${gig.client?._id}`} style={{ textDecoration: 'none', display: 'flex', gap: 10, alignItems: 'center', marginBottom: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'linear-gradient(135deg,#f97316,#ea580c)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: 18 }}>{gig.client?.name?.charAt(0)}</div>
            <div>
              <div style={{ fontWeight: 700, color: '#f1f5f9', fontSize: 14 }}>{gig.client?.name}</div>
              <StarRating rating={gig.client?.reputation?.averageRating} size={12} count={gig.client?.reputation?.totalReviews} />
            </div>
          </Link>
          {gig.client && user && !isClient && (
            <Link to={`/messages/${gig.client._id}`} style={{ display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'center', padding: '8px 12px', background: 'transparent', border: '1px solid #334155', borderRadius: 8, color: '#94a3b8', textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
              <MessageSquare size={13} /> Message Client
            </Link>
          )}
        </div>
      </div>

      {/* PROPOSAL MODAL */}
      <Modal open={showProposalModal} onClose={() => setShowProposalModal(false)} title="Submit Proposal" width={540}>
        <form onSubmit={handleApply} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div>
            <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Cover Letter *</label>
            <textarea value={proposal.coverLetter} onChange={e => setProposal({...proposal, coverLetter: e.target.value})} placeholder="Explain why you're the best fit for this project..." rows={5} required style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Bid Amount (₹) *</label>
              <input type="number" value={proposal.bidAmount} onChange={e => setProposal({...proposal, bidAmount: e.target.value})} placeholder="e.g. 15000" required />
            </div>
            <div>
              <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>Delivery (days) *</label>
              <input type="number" value={proposal.estimatedDays} onChange={e => setProposal({...proposal, estimatedDays: e.target.value})} placeholder="e.g. 14" required />
            </div>
          </div>
          <button type="submit" disabled={submitting} style={{ padding: '12px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, fontWeight: 700, cursor: 'pointer', fontSize: 15, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
            <Send size={16} />{submitting ? 'Submitting...' : 'Submit Proposal'}
          </button>
        </form>
      </Modal>
    </div>
  );
}

function Section({ title, children }) {
  return (
    <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 24 }}>
      <h3 style={{ fontFamily: 'Syne', fontSize: 15, fontWeight: 700, margin: '0 0 16px' }}>{title}</h3>
      {children}
    </div>
  );
}
