import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import API from '../utils/api';
import toast from 'react-hot-toast';
import { Plus, Trash2, Save, User, Lock, Bell, Briefcase } from 'lucide-react';

const SKILL_LEVELS = ['beginner', 'intermediate', 'expert'];

export default function Settings() {
  const { user, updateUser } = useAuth();
  const [activeTab, setActiveTab] = useState('profile');
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [skillLevel, setSkillLevel] = useState('intermediate');

  const [profile, setProfile] = useState({
    name: user?.name || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    location: { city: user?.location?.city || '', state: user?.location?.state || '', country: user?.location?.country || 'India' },
    freelancerProfile: {
      title: user?.freelancerProfile?.title || '',
      hourlyRate: user?.freelancerProfile?.hourlyRate || '',
      availability: user?.freelancerProfile?.availability || 'available',
      responseTime: user?.freelancerProfile?.responseTime || '24 hours',
      skills: user?.freelancerProfile?.skills || [],
      languages: user?.freelancerProfile?.languages || [],
    }
  });

  const [passwords, setPasswords] = useState({ currentPassword: '', newPassword: '', confirm: '' });

  const saveProfile = async () => {
    setSaving(true);
    try {
      const res = await API.put('/users/profile', profile);
      updateUser(res.data.user);
      toast.success('Profile updated!');
    } catch (err) { toast.error(err.response?.data?.message || 'Update failed'); }
    finally { setSaving(false); }
  };

  const changePassword = async () => {
    if (passwords.newPassword !== passwords.confirm) return toast.error('Passwords do not match');
    if (passwords.newPassword.length < 6) return toast.error('Min 6 characters');
    setSaving(true);
    try {
      await API.put('/auth/change-password', { currentPassword: passwords.currentPassword, newPassword: passwords.newPassword });
      toast.success('Password changed!');
      setPasswords({ currentPassword: '', newPassword: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.message || 'Failed'); }
    finally { setSaving(false); }
  };

  const addSkill = () => {
    if (!skillInput.trim()) return;
    const exists = profile.freelancerProfile.skills.find(s => s.name.toLowerCase() === skillInput.toLowerCase());
    if (exists) return toast.error('Skill already added');
    setProfile(p => ({ ...p, freelancerProfile: { ...p.freelancerProfile, skills: [...p.freelancerProfile.skills, { name: skillInput.trim(), level: skillLevel }] } }));
    setSkillInput('');
  };

  const removeSkill = (name) => setProfile(p => ({ ...p, freelancerProfile: { ...p.freelancerProfile, skills: p.freelancerProfile.skills.filter(s => s.name !== name) } }));

  const tabs = [
    { id: 'profile', label: 'Profile', icon: <User size={15} /> },
    { id: 'security', label: 'Security', icon: <Lock size={15} /> },
    ...(user?.role === 'freelancer' ? [{ id: 'freelancer', label: 'Freelancer', icon: <Briefcase size={15} /> }] : []),
  ];

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px' }}>
      <h1 style={{ fontFamily: 'Syne', fontSize: 26, fontWeight: 800, marginBottom: 28 }}>Account Settings</h1>

      <div style={{ display: 'flex', gap: 24 }}>
        {/* Sidebar */}
        <div style={{ width: 200, flexShrink: 0 }}>
          <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, overflow: 'hidden' }}>
            {tabs.map(({ id, label, icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 10, width: '100%', padding: '12px 16px', border: 'none', background: activeTab === id ? 'rgba(249,115,22,0.1)' : 'transparent', color: activeTab === id ? '#f97316' : '#94a3b8', cursor: 'pointer', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 14, borderLeft: activeTab === id ? '3px solid #f97316' : '3px solid transparent', textAlign: 'left' }}>
                {icon} {label}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div style={{ flex: 1 }}>
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontFamily: 'Syne', margin: 0, fontSize: 16, fontWeight: 700 }}>Personal Information</h3>

              <Field label="Full Name">
                <input value={profile.name} onChange={e => setProfile(p => ({ ...p, name: e.target.value }))} placeholder="Your full name" />
              </Field>

              <Field label="Bio / About Me">
                <textarea value={profile.bio} onChange={e => setProfile(p => ({ ...p, bio: e.target.value }))} placeholder="Tell clients about yourself..." rows={4} style={{ resize: 'vertical' }} />
              </Field>

              <Field label="Phone Number">
                <input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="+91 9876543210" />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="City">
                  <input value={profile.location.city} onChange={e => setProfile(p => ({ ...p, location: { ...p.location, city: e.target.value } }))} placeholder="Mumbai" />
                </Field>
                <Field label="State">
                  <input value={profile.location.state} onChange={e => setProfile(p => ({ ...p, location: { ...p.location, state: e.target.value } }))} placeholder="Maharashtra" />
                </Field>
              </div>

              <button onClick={saveProfile} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, width: 'fit-content', fontFamily: 'DM Sans' }}>
                <Save size={15} />{saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontFamily: 'Syne', margin: 0, fontSize: 16, fontWeight: 700 }}>Change Password</h3>

              <Field label="Current Password">
                <input type="password" value={passwords.currentPassword} onChange={e => setPasswords(p => ({ ...p, currentPassword: e.target.value }))} placeholder="••••••••" />
              </Field>
              <Field label="New Password">
                <input type="password" value={passwords.newPassword} onChange={e => setPasswords(p => ({ ...p, newPassword: e.target.value }))} placeholder="Min. 6 characters" />
              </Field>
              <Field label="Confirm New Password">
                <input type="password" value={passwords.confirm} onChange={e => setPasswords(p => ({ ...p, confirm: e.target.value }))} placeholder="Repeat new password" />
              </Field>

              <button onClick={changePassword} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, width: 'fit-content', fontFamily: 'DM Sans' }}>
                <Lock size={15} />{saving ? 'Updating...' : 'Update Password'}
              </button>

              <div style={{ marginTop: 12, padding: 16, background: '#0f172a', borderRadius: 8, border: '1px solid #334155' }}>
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 8, color: '#f97316' }}>Account Info</div>
                <div style={{ fontSize: 13, color: '#64748b' }}>Email: <span style={{ color: '#f1f5f9' }}>{user?.email}</span></div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Role: <span style={{ color: '#f1f5f9', textTransform: 'capitalize' }}>{user?.role}</span></div>
                <div style={{ fontSize: 13, color: '#64748b', marginTop: 4 }}>Member since: <span style={{ color: '#f1f5f9' }}>{user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : '—'}</span></div>
              </div>
            </div>
          )}

          {/* FREELANCER TAB */}
          {activeTab === 'freelancer' && user?.role === 'freelancer' && (
            <div style={{ background: '#1e293b', border: '1px solid #334155', borderRadius: 12, padding: 28, display: 'flex', flexDirection: 'column', gap: 18 }}>
              <h3 style={{ fontFamily: 'Syne', margin: 0, fontSize: 16, fontWeight: 700 }}>Freelancer Profile</h3>

              <Field label="Professional Title">
                <input value={profile.freelancerProfile.title} onChange={e => setProfile(p => ({ ...p, freelancerProfile: { ...p.freelancerProfile, title: e.target.value } }))} placeholder="e.g. Full-Stack React Developer" />
              </Field>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <Field label="Hourly Rate (₹)">
                  <input type="number" value={profile.freelancerProfile.hourlyRate} onChange={e => setProfile(p => ({ ...p, freelancerProfile: { ...p.freelancerProfile, hourlyRate: e.target.value } }))} placeholder="e.g. 1500" />
                </Field>
                <Field label="Availability">
                  <select value={profile.freelancerProfile.availability} onChange={e => setProfile(p => ({ ...p, freelancerProfile: { ...p.freelancerProfile, availability: e.target.value } }))}>
                    <option value="available">Available</option>
                    <option value="busy">Busy</option>
                    <option value="unavailable">Unavailable</option>
                  </select>
                </Field>
              </div>

              <Field label="Response Time">
                <select value={profile.freelancerProfile.responseTime} onChange={e => setProfile(p => ({ ...p, freelancerProfile: { ...p.freelancerProfile, responseTime: e.target.value } }))}>
                  <option value="1 hour">Within 1 hour</option>
                  <option value="few hours">Within a few hours</option>
                  <option value="24 hours">Within 24 hours</option>
                  <option value="2-3 days">2-3 days</option>
                </select>
              </Field>

              <Field label="Skills">
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 8 }}>
                  {profile.freelancerProfile.skills.map(s => (
                    <span key={s.name} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: '#0f172a', border: '1px solid #334155', borderRadius: 999, padding: '4px 10px', fontSize: 12 }}>
                      {s.name}
                      <span style={{ fontSize: 10, color: '#f97316', textTransform: 'capitalize' }}>{s.level}</span>
                      <button onClick={() => removeSkill(s.name)} style={{ background: 'transparent', border: 'none', color: '#64748b', cursor: 'pointer', padding: 0, lineHeight: 1 }}>×</button>
                    </span>
                  ))}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input value={skillInput} onChange={e => setSkillInput(e.target.value)} placeholder="Skill name" onKeyDown={e => e.key === 'Enter' && addSkill()} style={{ flex: 1 }} />
                  <select value={skillLevel} onChange={e => setSkillLevel(e.target.value)} style={{ width: 'auto' }}>
                    {SKILL_LEVELS.map(l => <option key={l} value={l}>{l}</option>)}
                  </select>
                  <button onClick={addSkill} style={{ padding: '0 14px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>
                    <Plus size={15} />
                  </button>
                </div>
              </Field>

              <button onClick={saveProfile} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '11px 22px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 700, fontSize: 14, width: 'fit-content', fontFamily: 'DM Sans' }}>
                <Save size={15} />{saving ? 'Saving...' : 'Save Freelancer Profile'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div>
      <label style={{ fontSize: 13, fontWeight: 600, color: '#94a3b8', display: 'block', marginBottom: 6 }}>{label}</label>
      {children}
    </div>
  );
}
