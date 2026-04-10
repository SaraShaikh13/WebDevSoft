import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './AdminCourses.css';

const empty = { title: '', content: '', excerpt: '', author: '', category: '', tags: '', isFeatured: false, isPublished: false };

export default function AdminBlogs() {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api.get('/blogs?limit=100'), api.get('/categories')])
      .then(([br, catR]) => {
        setBlogs(br.data.blogs || []);
        setCategories(catR.data.categories || []);
      })
      .catch(() => toast.error('Failed to load data.'))
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = { ...form, tags: form.tags.split(',').map(t => t.trim()).filter(Boolean) };
      if (editId) {
        const r = await api.put(`/blogs/${editId}`, payload);
        setBlogs(prev => prev.map(b => b._id === editId ? r.data.blog : b));
        toast.success('Blog updated!');
      } else {
        const r = await api.post('/blogs', payload);
        setBlogs(prev => [r.data.blog, ...prev]);
        toast.success('Blog created!');
      }
      setShowForm(false); setForm(empty); setEditId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally { setLoading(false); }
  };

  const handleEdit = (b) => {
    setForm({ ...b, tags: (b.tags || []).join(', '), category: b.category?._id || b.category });
    setEditId(b._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this blog post?')) return;
    try {
      await api.delete(`/blogs/${id}`);
      setBlogs(prev => prev.filter(b => b._id !== id));
      toast.success('Blog deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  const togglePublish = async (b) => {
    try {
      const r = await api.put(`/blogs/${b._id}`, { isPublished: !b.isPublished });
      setBlogs(prev => prev.map(x => x._id === b._id ? r.data.blog : x));
      toast.success(r.data.blog.isPublished ? 'Published!' : 'Unpublished.');
    } catch { toast.error('Failed.'); }
  };

  const filtered = blogs.filter(b => b.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-page" style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="admin-header">
          <div><h1>Manage Blogs</h1><p>{blogs.length} total blog posts</p></div>
          <button className="btn btn-primary" onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}>+ New Blog</button>
        </div>

        <div className="admin-search">
          <input className="form-control" placeholder="Search blogs..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {showForm && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="modal-box">
              <div className="modal-header">
                <h2>{editId ? 'Edit Blog Post' : 'New Blog Post'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Title *</label>
                    <input className="form-control" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="Blog post title" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Author *</label>
                    <input className="form-control" required value={form.author} onChange={e => setForm({ ...form, author: e.target.value })} placeholder="Author name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Excerpt</label>
                  <input className="form-control" value={form.excerpt} onChange={e => setForm({ ...form, excerpt: e.target.value })} placeholder="Short summary of the post" maxLength={400} />
                </div>
                <div className="form-group">
                  <label className="form-label">Content *</label>
                  <textarea className="form-control" rows={8} required value={form.content} onChange={e => setForm({ ...form, content: e.target.value })} placeholder="Write your blog post content here..." />
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Category *</label>
                    <select className="form-control" required value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                      <option value="">Select category</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input className="form-control" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, tips, tutorial" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Thumbnail URL</label>
                  <input className="form-control" value={form.thumbnail || ''} onChange={e => setForm({ ...form, thumbnail: e.target.value })} placeholder="https://example.com/image.jpg" />
                </div>
                <div className="form-row form-row-checks">
                  <label className="check-label">
                    <input type="checkbox" checked={form.isFeatured} onChange={e => setForm({ ...form, isFeatured: e.target.checked })} />
                    Featured Post
                  </label>
                  <label className="check-label">
                    <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
                    Publish Now
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editId ? 'Update Post' : 'Create Post'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {fetching ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr><th>Title</th><th>Author</th><th>Category</th><th>Status</th><th>Views</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="table-empty">No blog posts found.</td></tr>}
                {filtered.map(b => (
                  <tr key={b._id}>
                    <td>
                      <div className="course-info">
                        <div className="course-name">{b.title}</div>
                        {b.isFeatured && <span className="badge badge-orange" style={{ fontSize: '0.65rem' }}>Featured</span>}
                      </div>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.85rem' }}>{b.author}</td>
                    <td>{b.category?.name || '—'}</td>
                    <td>
                      <button className={`status-toggle ${b.isPublished ? 'published' : 'draft'}`} onClick={() => togglePublish(b)}>
                        {b.isPublished ? '✓ Published' : '○ Draft'}
                      </button>
                    </td>
                    <td className="text-muted">{b.views || 0}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(b)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(b._id)}>Del</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
