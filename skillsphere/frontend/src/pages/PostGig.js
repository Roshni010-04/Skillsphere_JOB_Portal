import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import API from '../utils/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { Plus, Trash2, ChevronRight } from 'lucide-react';

const CATEGORIES = ['Web Development','Mobile Apps','UI/UX Design','Data Science','Digital Marketing','Content Writing','Video Editing','Cybersecurity','Cloud & DevOps','Blockchain','AI & ML','Consulting'];
const DURATIONS = ['less_than_week','1_2_weeks','2_4_weeks','1_3_months','3_6_months','6_months_plus'];

export default function PostGig() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    title: '', description: '', category: '', skills: [], experienceLevel: 'intermediate',
    budget: { type: 'fixed', min: '', max: '', currency: 'INR' },
    duration: '2_4_weeks', isUrgent: false,
    location: { type: 'remote', city: '', state: '', country: 'India' },
    milestones: [], tags: [],
  });

  if (!user || user.role !== 'client') {
    return <div style={{ textAlign: 'center', padding: 80, color: '#64748b' }}>Only clients can post gigs. <a href="/register?role=client" style={{ color: '#f97316' }}>Register as client</a></div>;
  }

  const set = (path, val) => {
    setForm(prev => {
      const next = { ...prev };
      const keys = path.split('.');
      let obj = next;
      for (let i = 0; i < keys.length - 1; i++) { obj[keys[i]] = { ...obj[keys[i]] }; obj = obj[keys[i]]; }
      obj[keys[keys.length - 1]] = val;
      return next;
    });
  };

  const addSkill = (e) => {
    if ((e.key === 'Enter' || e.key === ',') && skillInput.trim()) {
      e.preventDefault();
      const s = skillInput.trim().replace(',','');
      if (!form.skills.includes(s)) setForm(f => ({ ...f, skills: [...f.skills, s] }));
      setSkillInput('');
    }
  };

  const addMilestone = () => setForm(f => ({ ...f, milestones: [...f.milestones, { title: '', description: '', amount: '' }] }));
  const removeMilestone = (i) => setForm(f => ({ ...f, milestones: f.milestones.filter((_, idx) => idx !== i) }));
  const updateMilestone = (i, key, val) => setForm(f => {
    const ms = [...f.milestones];
    ms[i] = { ...ms[i], [key]: val };
    return { ...f, milestones: ms };
  });

  const handleSubmit = async () => {
    if (!form.title || !form.description || !form.category) return toast.error('Fill required fields');
    if (!form.budget.min) return toast.error('Enter budget');
    setLoading(true);
    try {
      const res = await API.post('/gigs', form);
      toast.success('Gig posted successfully!');
      navigate(`/gigs/${res.data.gig._id}`);
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post gig'); }
    finally { setLoading(false); }
  };

  const stepLabels = ['Basic Info', 'Details & Budget', 'Milestones'];

  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '40px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 28, fontWeight: 800, marginBottom: 8 }}>Post a Gig</h1>
      <p style={{ color: '#64748b', marginBottom: 32, fontSize: 14 }}>Find the perfect freelancer for your project</p>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 36, background: '#1e293b', border: '1px solid #334155', borderRadius: 10, overflow: 'hidden' }}>
        {stepLabels.map((label, i) => {
          const s = i + 1;
          const active = step === s;
          const done = step > s;
          return (
            <button key={s} onClick={() => s < step && setStep(s)} style={{ flex: 1, padding: '12px 8px', border: 'none', background: active ? '#f97316' : done ? 'rgba(249,115,22,0.1)' : 'transparent', color: active ? 'white' : done ? '#f97316' : '#64748b', cursor: s < step ? 'pointer' : 'default', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <span style={{ width: 20, height: 20, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.2)' : done ? '#f97316' : '#334155', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 700 }}>{done ? '✓' : s}</span>
              {label}
            </button>
          );
        })}
      </div>

      <div className="fade-in" style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 32 }}>

        {/* STEP 1 */}
        {step === 1 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Gig Title *" hint="Be specific and clear">
              <input value={form.title} onChange={e => set('title', e.target.value)} placeholder="e.g. Build a React.js E-commerce Website with Stripe Integration" />
            </Field>
            <Field label="Description *" hint="Describe the project in detail (min 100 chars)">
              <textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Explain what needs to be done, deliverables expected, any specific requirements..." rows={6} style={{ resize: 'vertical' }} />
              <div style={{ textAlign: 'right', fontSize: 12, color: form.description.length < 100 ? '#ef4444' : '#64748b', marginTop: 4 }}>{form.description.length} chars</div>
            </Field>
            <Field label="Category *">
              <select value={form.category} onChange={e => set('category', e.target.value)}>
                <option value="">Select category...</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </Field>
            <Field label="Required Skills">
              <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                {form.skills.map(s => (
                  <span key={s} style={{ display: 'inline-flex', alignItems: 'center', gap: 4, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 999, padding: '3px 10px', fontSize: 12, color: '#f97316' }}>
                    {s}<button onClick={() => setForm(f => ({ ...f, skills: f.skills.filter(x => x !== s) }))} style={{ background: 'transparent', border: 'none', color: '#f97316', cursor: 'pointer', padding: 0, lineHeight: 1, marginLeft: 2 }}>×</button>
                  </span>
                ))}
              </div>
              <input value={skillInput} onChange={e => setSkillInput(e.target.value)} onKeyDown={addSkill} placeholder="Type a skill and press Enter (e.g. React, Node.js)" />
              <div style={{ fontSize: 11, color: '#475569', marginTop: 4 }}>Press Enter or comma to add</div>
            </Field>
          </div>
        )}

        {/* STEP 2 */}
        {step === 2 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <Field label="Budget Type">
              <div style={{ display: 'flex', gap: 0, background: '#0f172a', borderRadius: 8, padding: 4 }}>
                {['fixed','hourly'].map(t => (
                  <button key={t} onClick={() => set('budget.type', t)} style={{ flex: 1, padding: '8px', border: 'none', borderRadius: 6, background: form.budget.type === t ? '#f97316' : 'transparent', color: form.budget.type === t ? 'white' : '#64748b', cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', fontFamily: 'DM Sans' }}>{t}</button>
                ))}
              </div>
            </Field>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <Field label={form.budget.type === 'fixed' ? 'Min Budget (₹) *' : 'Min Hourly Rate (₹) *'}>
                <input type="number" value={form.budget.min} onChange={e => set('budget.min', e.target.value)} placeholder="e.g. 5000" />
              </Field>
              {form.budget.type === 'fixed' && (
                <Field label="Max Budget (₹) *">
                  <input type="number" value={form.budget.max} onChange={e => set('budget.max', e.target.value)} placeholder="e.g. 20000" />
                </Field>
              )}
            </div>
            <Field label="Experience Level">
              <div style={{ display: 'flex', gap: 8 }}>
                {['beginner','intermediate','expert'].map(l => (
                  <button key={l} onClick={() => set('experienceLevel', l)} style={{ flex: 1, padding: '10px', border: `1px solid ${form.experienceLevel === l ? '#f97316' : '#334155'}`, background: form.experienceLevel === l ? 'rgba(249,115,22,0.1)' : 'transparent', color: form.experienceLevel === l ? '#f97316' : '#94a3b8', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', fontFamily: 'DM Sans' }}>{l}</button>
                ))}
              </div>
            </Field>
            <Field label="Project Duration">
              <select value={form.duration} onChange={e => set('duration', e.target.value)}>
                {DURATIONS.map(d => <option key={d} value={d}>{d.replace(/_/g,' ')}</option>)}
              </select>
            </Field>
            <Field label="Work Type">
              <div style={{ display: 'flex', gap: 8 }}>
                {['remote','onsite','hybrid'].map(t => (
                  <button key={t} onClick={() => set('location.type', t)} style={{ flex: 1, padding: '10px', border: `1px solid ${form.location.type === t ? '#f97316' : '#334155'}`, background: form.location.type === t ? 'rgba(249,115,22,0.1)' : 'transparent', color: form.location.type === t ? '#f97316' : '#94a3b8', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontSize: 13, textTransform: 'capitalize', fontFamily: 'DM Sans' }}>{t}</button>
                ))}
              </div>
            </Field>
            {form.location.type !== 'remote' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="City"><input value={form.location.city} onChange={e => set('location.city', e.target.value)} placeholder="e.g. Mumbai" /></Field>
                <Field label="State"><input value={form.location.state} onChange={e => set('location.state', e.target.value)} placeholder="e.g. Maharashtra" /></Field>
              </div>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <input type="checkbox" id="urgent" checked={form.isUrgent} onChange={e => set('isUrgent', e.target.checked)} style={{ width: 'auto', accentColor: '#f97316' }} />
              <label htmlFor="urgent" style={{ fontSize: 14, color: '#94a3b8', cursor: 'pointer' }}>🔥 Mark as Urgent (attracts faster responses)</label>
            </div>
          </div>
        )}

        {/* STEP 3 */}
        {step === 3 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <div>
                  <h3 style={{ fontFamily: 'Syne', margin: 0, fontSize: 16, fontWeight: 700 }}>Milestones (Optional)</h3>
                  <p style={{ color: '#64748b', fontSize: 13, margin: '4px 0 0' }}>Break your project into payment milestones</p>
                </div>
                <button onClick={addMilestone} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', color: '#f97316', borderRadius: 8, cursor: 'pointer', fontSize: 13, fontWeight: 600 }}>
                  <Plus size={14} /> Add Milestone
                </button>
              </div>
              {form.milestones.map((m, i) => (
                <div key={i} style={{ background: '#0f172a', border: '1px solid #334155', borderRadius: 10, padding: 16, marginBottom: 12 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
                    <span style={{ fontWeight: 600, fontSize: 13, color: '#f97316' }}>Milestone {i+1}</span>
                    <button onClick={() => removeMilestone(i)} style={{ background: 'transparent', border: 'none', color: '#ef4444', cursor: 'pointer' }}><Trash2 size={14} /></button>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    <input value={m.title} onChange={e => updateMilestone(i,'title',e.target.value)} placeholder="Milestone title" />
                    <input value={m.description} onChange={e => updateMilestone(i,'description',e.target.value)} placeholder="Description (optional)" />
                    <input type="number" value={m.amount} onChange={e => updateMilestone(i,'amount',e.target.value)} placeholder="Payment amount (₹)" />
                  </div>
                </div>
              ))}
              {form.milestones.length === 0 && (
                <div style={{ textAlign: 'center', padding: '32px', border: '2px dashed #334155', borderRadius: 10, color: '#475569', fontSize: 14 }}>
                  No milestones added. Click "Add Milestone" to define payment stages.
                </div>
              )}
            </div>

            {/* Summary */}
            <div style={{ background: '#0f172a', border: '1px solid rgba(249,115,22,0.2)', borderRadius: 10, padding: 20 }}>
              <h4 style={{ fontFamily: 'Syne', margin: '0 0 12px', color: '#f97316', fontSize: 14 }}>Gig Summary</h4>
              {[
                ['Title', form.title || '—'],
                ['Category', form.category || '—'],
                ['Budget', form.budget.min ? `₹${form.budget.min}${form.budget.type === 'fixed' && form.budget.max ? ` – ₹${form.budget.max}` : (form.budget.type === 'hourly' ? '/hr' : '')}` : '—'],
                ['Duration', form.duration.replace(/_/g,' ')],
                ['Skills', form.skills.join(', ') || 'None'],
                ['Milestones', form.milestones.length],
              ].map(([k,v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, padding: '4px 0', borderBottom: '1px solid #1e293b' }}>
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span style={{ color: '#f1f5f9', fontWeight: 500, maxWidth: '60%', textAlign: 'right' }}>{String(v)}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 28, paddingTop: 20, borderTop: '1px solid #334155' }}>
          {step > 1 ? (
            <button onClick={() => setStep(s => s-1)} style={{ padding: '10px 24px', background: 'transparent', border: '1px solid #334155', color: '#94a3b8', borderRadius: 8, cursor: 'pointer', fontWeight: 600, fontFamily: 'DM Sans' }}>← Back</button>
          ) : <div />}
          {step < 3 ? (
            <button onClick={() => setStep(s => s+1)} style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '10px 24px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans' }}>
              Next <ChevronRight size={16} />
            </button>
          ) : (
            <button onClick={handleSubmit} disabled={loading} style={{ padding: '10px 28px', background: loading ? '#334155' : '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontFamily: 'DM Sans', fontSize: 15 }}>
              {loading ? 'Posting...' : '🚀 Post Gig'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, hint, children }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label}{hint && <span style={{ color: '#475569', fontWeight: 400, marginLeft: 8 }}>{hint}</span>}</label>
      {children}
    </div>
  );
}
