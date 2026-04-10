import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { api } from '../context/AuthContext';
import './Blogs.css';

const BlogCard = ({ blog }) => (
  <div className="blog-card card">
    <div className="blog-thumb">
      {blog.thumbnail ? <img src={blog.thumbnail} alt={blog.title} /> : <div className="blog-thumb-ph"><span>✍</span></div>}
      {blog.isFeatured && <span className="featured-tag">Featured</span>}
    </div>
    <div className="card-body">
      <div className="blog-cat">{blog.category?.icon} {blog.category?.name}</div>
      <h3 className="blog-title"><Link to={`/blogs/${blog.slug}`}>{blog.title}</Link></h3>
      <p className="blog-excerpt">{blog.excerpt || blog.content?.slice(0, 120)}...</p>
      <div className="blog-footer">
        <div className="blog-author">
          <div className="author-avatar">{blog.author?.charAt(0)}</div>
          <div>
            <div className="author-name">{blog.author}</div>
            <div className="author-date">{new Date(blog.createdAt).toLocaleDateString()} · {blog.readTime || 5} min read</div>
          </div>
        </div>
        <Link to={`/blogs/${blog.slug}`} className="btn btn-outline btn-sm">Read →</Link>
      </div>
    </div>
  </div>
);

export default function Blogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [pages, setPages] = useState(1);
  const [searchParams, setSearchParams] = useSearchParams();

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';

  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page, limit: 9 });
    if (search) params.set('search', search);
    if (category) params.set('category', category);

    Promise.all([api.get(`/blogs?${params}`), api.get('/categories')])
      .then(([br, catR]) => {
        setBlogs(br.data.blogs || []);
        setTotal(br.data.total || 0);
        setPages(br.data.pages || 1);
        setCategories(catR.data.categories || []);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, category]);

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
          <h1>Blog <span className="total-badge">{total}</span></h1>
          <p>Developer insights, tips, and tutorials</p>
        </div>

        <div className="filters-bar">
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
            <input type="text" placeholder="Search posts..." defaultValue={search} onKeyDown={e => e.key === 'Enter' && setParam('search', e.target.value)} className="search-input" />
          </div>
          <select className="form-control filter-select" value={category} onChange={e => setParam('category', e.target.value)}>
            <option value="">All Categories</option>
            {categories.map(c => <option key={c._id} value={c._id}>{c.icon} {c.name}</option>)}
          </select>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : blogs.length > 0 ? (
          <>
            <div className="grid-3">{blogs.map(b => <BlogCard key={b._id} blog={b} />)}</div>
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
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"/></svg>
            <h3>No Posts Found</h3>
            <p>Try adjusting your search or category filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
