import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import './Courses.css';

const LEVELS = ['All', 'Beginner', 'Intermediate', 'Advanced'];

export default function Courses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const level = searchParams.get('level') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    if (search) params.set('search', search);
    if (category) params.set('category', category);
    if (level && level !== 'All') params.set('level', level);

    Promise.all([
      api.get(`/courses?${params}`),
      api.get('/categories'),
    ]).then(([cr, catR]) => {
      setCourses(cr.data.courses || []);
      setTotal(cr.data.total || 0);
      setPages(cr.data.pages || 1);
      setCategories(catR.data.categories || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [page, search, category, level]);

  const setParam = (key, val) => {
    const p = new URLSearchParams(searchParams);
    if (val) p.set(key, val); else p.delete(key);
    p.delete('page');
    setSearchParams(p);
  };

  return (
    <div className="courses-page" style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="page-header">
          <h1>All Courses <span className="total-badge">{total}</span></h1>
          <p>Structured learning paths for every skill level</p>
        </div>

        {/* Filters */}
        <div className="filters-bar">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input
              type="text" placeholder="Search courses..."
              defaultValue={search}
              onKeyDown={e => e.key === 'Enter' && setParam('search', e.target.value)}
              className="search-input"
            />
          </div>
          <div className="filter-group">
            {LEVELS.map(l => (
              <button
                key={l}
                className={`filter-btn ${(level || 'All') === l ? 'active' : ''}`}
                onClick={() => setParam('level', l === 'All' ? '' : l)}
              >{l}</button>
            ))}
          </div>
          <select className="form-control filter-select" value={category} onChange={e => setParam('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '80px' }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : courses.length > 0 ? (
          <>
            <div className="grid-3">{courses.map(c => <CourseCard key={c._id} course={c} />)}</div>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
            <h3>No Courses Found</h3>
            <p>Try adjusting your filters or search term.</p>
          </div>
        )}
      </div>
    </div>
  );
}
