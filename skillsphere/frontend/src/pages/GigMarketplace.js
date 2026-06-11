import React, { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import API from '../utils/api';
import { GigCard, Spinner, EmptyState, Badge } from '../components/UI';
import { Filter, X, ChevronDown } from 'lucide-react';

const CATEGORIES = ['Web Development','Mobile Apps','UI/UX Design','Data Science','Digital Marketing','Content Writing','Video Editing','Cybersecurity','Cloud & DevOps','Blockchain','AI & ML','Consulting'];
const DURATIONS = [['less_than_week','< 1 Week'],['1_2_weeks','1–2 Weeks'],['2_4_weeks','2–4 Weeks'],['1_3_months','1–3 Months'],['3_6_months','3–6 Months'],['6_months_plus','6+ Months']];
const EXP_LEVELS = [['beginner','Beginner'],['intermediate','Intermediate'],['expert','Expert']];

export default function GigMarketplace() {
  const [params, setParams] = useSearchParams();
  const [gigs, setGigs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [filters, setFilters] = useState({
    search: params.get('search') || '',
    category: params.get('category') || '',
    experienceLevel: '',
    duration: '',
    budgetMin: '',
    budgetMax: '',
    location: '',
    sort: '-createdAt',
  });

  const fetchGigs = useCallback(async () => {
    setLoading(true);
    try {
      const q = new URLSearchParams({ ...filters, page, limit: 12 });
      Object.keys(filters).forEach(k => !filters[k] && q.delete(k));
      const res = await API.get(`/gigs?${q}`);
      setGigs(res.data.gigs || []);
      setTotal(res.data.total || 0);
      setPages(res.data.pages || 1);
    } catch { setGigs([]); } finally { setLoading(false); }
  }, [filters, page]);

  useEffect(() => { fetchGigs(); }, [fetchGigs]);

  const setFilter = (key, val) => {
    setFilters(f => ({ ...f, [key]: val }));
    setPage(1);
  };

  const clearFilters = () => { setFilters({ search:'',category:'',experienceLevel:'',duration:'',budgetMin:'',budgetMax:'',location:'',sort:'-createdAt' }); setPage(1); };

  const activeFiltersCount = Object.entries(filters).filter(([k,v]) => v && k !== 'sort').length;

  return (
    <div style={{ maxWidth: 1280, margin: '0 auto', padding: '32px 24px', display: 'flex', gap: 28 }}>
      {/* SIDEBAR FILTERS */}
      <aside style={{ width: showFilters ? 260 : 0, flexShrink: 0, overflow: 'hidden', transition: 'width 0.2s' }}>
        <div style={{ width: 260 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 16 }}>Filters {activeFiltersCount > 0 && <span style={{ color: '#f97316' }}>({activeFiltersCount})</span>}</span>
            {activeFiltersCount > 0 && <button onClick={clearFilters} style={{ background: 'transparent', border: 'none', color: '#f97316', cursor: 'pointer', fontSize: 12, fontWeight: 600 }}>Clear all</button>}
          </div>

          <FilterSection title="Category">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
              {CATEGORIES.map(cat => (
                <button key={cat} onClick={() => setFilter('category', filters.category === cat ? '' : cat)}
                  style={{ background: filters.category === cat ? 'rgba(249,115,22,0.1)' : 'transparent', border: 'none', color: filters.category === cat ? '#f97316' : '#94a3b8', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'DM Sans' }}>
                  {cat}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Experience Level">
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {EXP_LEVELS.map(([val,label]) => (
                <button key={val} onClick={() => setFilter('experienceLevel', filters.experienceLevel === val ? '' : val)}
                  style={{ padding: '4px 12px', borderRadius: 999, border: `1px solid ${filters.experienceLevel === val ? '#f97316' : '#334155'}`, background: filters.experienceLevel === val ? 'rgba(249,115,22,0.1)' : 'transparent', color: filters.experienceLevel === val ? '#f97316' : '#94a3b8', cursor: 'pointer', fontSize: 12, fontFamily: 'DM Sans' }}>
                  {label}
                </button>
              ))}
            </div>
          </FilterSection>

          <FilterSection title="Duration">
            {DURATIONS.map(([val, label]) => (
              <button key={val} onClick={() => setFilter('duration', filters.duration === val ? '' : val)}
                style={{ display: 'block', width: '100%', background: filters.duration === val ? 'rgba(249,115,22,0.1)' : 'transparent', border: 'none', color: filters.duration === val ? '#f97316' : '#94a3b8', padding: '6px 10px', borderRadius: 6, cursor: 'pointer', textAlign: 'left', fontSize: 13, fontFamily: 'DM Sans' }}>
                {label}
              </button>
            ))}
          </FilterSection>

          <FilterSection title="Budget Range (₹)">
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <input type="number" placeholder="Min" value={filters.budgetMin} onChange={e => setFilter('budgetMin', e.target.value)} style={{ width: '100%' }} />
              <span style={{ color: '#475569', flexShrink: 0 }}>–</span>
              <input type="number" placeholder="Max" value={filters.budgetMax} onChange={e => setFilter('budgetMax', e.target.value)} style={{ width: '100%' }} />
            </div>
          </FilterSection>

          <FilterSection title="Location">
            <input placeholder="City name..." value={filters.location} onChange={e => setFilter('location', e.target.value)} />
          </FilterSection>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div style={{ flex: 1, minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center', marginBottom: 24, flexWrap: 'wrap' }}>
          <button onClick={() => setShowFilters(!showFilters)} style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#1e293b', border: '1px solid #334155', borderRadius: 8, padding: '8px 14px', color: '#94a3b8', cursor: 'pointer', fontSize: 14 }}>
            <Filter size={15} /> {showFilters ? 'Hide' : 'Show'} Filters
          </button>
          <input value={filters.search} onChange={e => setFilter('search', e.target.value)} placeholder="Search gigs..." style={{ flex: 1, minWidth: 200 }} />
          <select value={filters.sort} onChange={e => setFilter('sort', e.target.value)} style={{ width: 'auto' }}>
            <option value="-createdAt">Newest First</option>
            <option value="-views">Most Viewed</option>
            <option value="budget.min">Budget: Low to High</option>
            <option value="-budget.max">Budget: High to Low</option>
          </select>
        </div>

        {/* Active Filter Chips */}
        {activeFiltersCount > 0 && (
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {filters.category && <FilterChip label={filters.category} onRemove={() => setFilter('category', '')} />}
            {filters.experienceLevel && <FilterChip label={filters.experienceLevel} onRemove={() => setFilter('experienceLevel', '')} />}
            {filters.duration && <FilterChip label={filters.duration.replace(/_/g,' ')} onRemove={() => setFilter('duration', '')} />}
            {filters.location && <FilterChip label={`📍 ${filters.location}`} onRemove={() => setFilter('location', '')} />}
          </div>
        )}

        <div style={{ fontSize: 13, color: '#64748b', marginBottom: 20 }}>
          {loading ? 'Loading...' : `${total.toLocaleString()} gigs found`}
        </div>

        {loading ? <Spinner /> : gigs.length === 0 ? (
          <EmptyState icon="🔍" title="No gigs found" desc="Try adjusting your filters or search terms" action={<button onClick={clearFilters} style={{ padding: '10px 20px', background: '#f97316', color: 'white', border: 'none', borderRadius: 8, cursor: 'pointer', fontWeight: 600 }}>Clear Filters</button>} />
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(300px,1fr))', gap: 20 }}>
            {gigs.map(gig => <GigCard key={gig._id} gig={gig} />)}
          </div>
        )}

        {/* Pagination */}
        {pages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 32 }}>
            {Array.from({ length: Math.min(pages, 10) }, (_, i) => i + 1).map(p => (
              <button key={p} onClick={() => setPage(p)} style={{ width: 36, height: 36, borderRadius: 8, border: `1px solid ${p === page ? '#f97316' : '#334155'}`, background: p === page ? '#f97316' : 'transparent', color: p === page ? 'white' : '#94a3b8', cursor: 'pointer', fontSize: 13, fontFamily: 'DM Sans' }}>{p}</button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function FilterSection({ title, children }) {
  const [open, setOpen] = useState(true);
  return (
    <div style={{ marginBottom: 20, borderBottom: '1px solid #1e293b', paddingBottom: 20 }}>
      <button onClick={() => setOpen(!open)} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'transparent', border: 'none', color: '#f1f5f9', cursor: 'pointer', marginBottom: open ? 12 : 0, fontFamily: 'Syne', fontWeight: 600, fontSize: 13 }}>
        {title} <ChevronDown size={14} style={{ transform: open ? 'rotate(180deg)' : 'none', transition: '0.2s' }} />
      </button>
      {open && children}
    </div>
  );
}

function FilterChip({ label, onRemove }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'rgba(249,115,22,0.1)', border: '1px solid rgba(249,115,22,0.3)', borderRadius: 999, padding: '4px 10px', fontSize: 12, color: '#f97316' }}>
      {label}
      <button onClick={onRemove} style={{ background: 'transparent', border: 'none', color: '#f97316', cursor: 'pointer', padding: 0, lineHeight: 1 }}><X size={12} /></button>
    </span>
  );
}
