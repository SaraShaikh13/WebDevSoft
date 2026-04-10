import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';

export default function BlogDetail() {
  const { slug } = useParams();
  const [blog, setBlog] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/blogs/${slug}`)
      .then(r => setBlog(r.data.blog))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!blog) return <div style={{ paddingTop: 120, textAlign: 'center' }}><h2>Post not found</h2><Link to="/blogs" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Blog</Link></div>;

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 800 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/blogs" style={{ color: 'var(--accent-light)', fontSize: '0.88rem' }}>← Back to Blog</Link>
        </div>
        {blog.category && <div style={{ marginBottom: 12 }}><span className="badge badge-accent">{blog.category.icon} {blog.category.name}</span></div>}
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.4rem)', fontWeight: 700, lineHeight: 1.25, marginBottom: 20 }}>{blog.title}</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 32, paddingBottom: 20, borderBottom: '1px solid var(--border)' }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), var(--green))', display: 'grid', placeItems: 'center', fontWeight: 700, color: '#fff' }}>{blog.author?.charAt(0)}</div>
          <div>
            <div style={{ fontWeight: 600 }}>{blog.author}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{new Date(blog.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })} · {blog.readTime || 5} min read · {blog.views} views</div>
          </div>
        </div>
        {blog.thumbnail && <img src={blog.thumbnail} alt={blog.title} style={{ width: '100%', borderRadius: 12, marginBottom: 32, aspectRatio: '16/9', objectFit: 'cover' }} />}
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '1rem' }}>
          {blog.content?.split('\n').map((p, i) => p ? <p key={i} style={{ marginBottom: 16 }}>{p}</p> : <br key={i} />)}
        </div>
        {blog.tags?.length > 0 && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            {blog.tags.map(t => <span key={t} className="tag" style={{ marginRight: 6 }}>{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
