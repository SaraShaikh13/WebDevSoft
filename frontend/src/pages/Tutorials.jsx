import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../context/AuthContext';
import './Courses.css';

const DIFFICULTIES = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const TutCard = ({ tut }) => (
  <div className="card" style={{ display: 'flex', flexDirection: 'column' }}>
    <div style={{ padding: '20px 20px 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
        <span className="badge badge-accent">{tut.difficulty}</span>
        <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)' }}>{tut.readTime || 5} min</span>
      </div>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: 8 }}>
        <Link to={`/tutorials/${tut.slug}`} style={{ transition: 'color 0.2s' }} onMouseEnter={e => e.target.style.color = 'var(--accent-light)'} onMouseLeave={e => e.target.style.color = 'inherit'}>{tut.title}</Link>
      </h3>
      <p style={{ fontSize: '0.84rem', color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 14 }}>{tut.excerpt || tut.content?.slice(0, 100)}...</p>
    </div>
    {tut.codeSnippets?.length > 0 && (
      <div style={{ margin: '0 20px 14px', background: 'var(--bg-secondary)', borderRadius: 8, padding: '10px 14px' }}>
        <code style={{ fontFamily: 'var(--mono)', fontSize: '0.78rem', color: 'var(--green)', display: 'block', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
          {tut.codeSnippets[0]?.code?.slice(0, 80)}...
        </code>
      </div>
    )}
    <div style={{ marginTop: 'auto', padding: '14px 20px', borderTop: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
      <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{tut.category?.icon} {tut.category?.name}</span>
      <Link to={`/tutorials/${tut.slug}`} className="btn btn-outline btn-sm">Read →</Link>
    </div>
  </div>
);

export default function Tutorials() {
  const [tutorials, setTutorials] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const difficulty = searchParams.get('difficulty') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (difficulty && difficulty !== 'All') params.set('difficulty', difficulty);

    Promise.all([api.get(`/tutorials?${params}`), api.get('/categories')])
      .then(([tr, catR]) => {
        setTutorials(tr.data.tutorials || []);
        setTotal(tr.data.total || 0);
        setPages(tr.data.pages || 1);
        setCategories(catR.data.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, category, difficulty]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="page-header">
          <h1>Tutorials <span className="total-badge">{total}</span></h1>
          <p>Step-by-step coding guides with code examples</p>
        </div>
        <div className="filters-bar">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search tutorials..." defaultValue={search} onKeyDown={e => e.key === 'Enter' && setParam('search', e.target.value)} className="search-input" />
          </div>
          <div className="filter-group">
            {DIFFICULTIES.map(d => (
              <button key={d} className={`filter-btn ${(difficulty || 'All') === d ? 'active' : ''}`} onClick={() => setParam('difficulty', d === 'All' ? '' : d)}>{d}</button>
            ))}
          </div>
          <select className="form-control filter-select" value={category} onChange={e => setParam('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : tutorials.length > 0 ? (
          <>
            <div className="grid-3">{tutorials.map(t => <TutCard key={t._id} tut={t} />)}</div>
            {pages > 1 && (
              <div className="pagination">
                {Array.from({ length: pages }, (_, i) => i + 1).map(p => (
                  <button key={p} className={`page-btn ${page === p ? 'active' : ''}`} onClick={() => setParam('page', p)}>{p}</button>
                ))}
              </div>
            )}
          </>
        ) : (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"/></svg>
            <h3>No Tutorials Found</h3>
            <p>Try adjusting your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
