import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './AdminCourses.css';

const empty = { title: '', description: '', shortDescription: '', instructor: '', category: '', level: 'Beginner', isFree: true, price: 0, duration: 0, isPublished: false, tags: '', requirements: '', outcomes: '' };

export default function AdminCourses() {
  const [courses, setCourses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(empty);
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    Promise.all([api.get('/admin/all-courses'), api.get('/categories')])
      .then(([cr, catR]) => { setCourses(cr.data.courses || []); setCategories(catR.data.categories || []); })
      .catch(() => toast.error('Failed to load data.'))
      .finally(() => setFetching(false));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        ...form,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        requirements: form.requirements.split('\n').filter(Boolean),
        outcomes: form.outcomes.split('\n').filter(Boolean),
      };
      if (editId) {
        const r = await api.put(`/courses/${editId}`, payload);
        setCourses(prev => prev.map(c => c._id === editId ? r.data.course : c));
        toast.success('Course updated!');
      } else {
        const r = await api.post('/courses', payload);
        setCourses(prev => [r.data.course, ...prev]);
        toast.success('Course created!');
      }
      setShowForm(false); setForm(empty); setEditId(null);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Operation failed.');
    } finally { setLoading(false); }
  };

  const handleEdit = (c) => {
    setForm({ ...c, tags: (c.tags || []).join(', '), requirements: (c.requirements || []).join('\n'), outcomes: (c.outcomes || []).join('\n'), category: c.category?._id || c.category });
    setEditId(c._id); setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this course?')) return;
    try {
      await api.delete(`/courses/${id}`);
      setCourses(prev => prev.filter(c => c._id !== id));
      toast.success('Course deleted.');
    } catch { toast.error('Delete failed.'); }
  };

  const togglePublish = async (c) => {
    try {
      const r = await api.put(`/courses/${c._id}`, { isPublished: !c.isPublished });
      setCourses(prev => prev.map(x => x._id === c._id ? r.data.course : x));
      toast.success(r.data.course.isPublished ? 'Course published!' : 'Course unpublished.');
    } catch { toast.error('Failed.'); }
  };

  const filtered = courses.filter(c => c.title?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="admin-page" style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="admin-header">
          <div><h1>Manage Courses</h1><p>{courses.length} total courses</p></div>
          <button className="btn btn-primary" onClick={() => { setForm(empty); setEditId(null); setShowForm(true); }}>+ New Course</button>
        </div>

        {/* Search */}
        <div className="admin-search">
          <input className="form-control" placeholder="Search courses..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {/* Form Modal */}
        {showForm && (
          <div className="modal-overlay" onClick={e => e.target === e.currentTarget && setShowForm(false)}>
            <div className="modal-box">
              <div className="modal-header">
                <h2>{editId ? 'Edit Course' : 'New Course'}</h2>
                <button className="modal-close" onClick={() => setShowForm(false)}>✕</button>
              </div>
              <form onSubmit={handleSubmit} className="modal-form">
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Course Title *</label>
                    <input className="form-control" required value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} placeholder="e.g. Complete React Developer Course" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Instructor *</label>
                    <input className="form-control" required value={form.instructor} onChange={e => setForm({ ...form, instructor: e.target.value })} placeholder="Instructor name" />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Short Description</label>
                  <input className="form-control" value={form.shortDescription} onChange={e => setForm({ ...form, shortDescription: e.target.value })} placeholder="One-liner description" maxLength={300} />
                </div>
                <div className="form-group">
                  <label className="form-label">Full Description *</label>
                  <textarea className="form-control" rows={4} required value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Detailed course description..." />
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
                    <label className="form-label">Level</label>
                    <select className="form-control" value={form.level} onChange={e => setForm({ ...form, level: e.target.value })}>
                      {['Beginner', 'Intermediate', 'Advanced'].map(l => <option key={l}>{l}</option>)}
                    </select>
                  </div>
                </div>
                <div className="form-row">
                  <div className="form-group">
                    <label className="form-label">Tags (comma-separated)</label>
                    <input className="form-control" value={form.tags} onChange={e => setForm({ ...form, tags: e.target.value })} placeholder="react, javascript, hooks" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Duration (hours)</label>
                    <input className="form-control" type="number" value={form.duration} onChange={e => setForm({ ...form, duration: e.target.value })} />
                  </div>
                </div>
                <div className="form-group">
                  <label className="form-label">Requirements (one per line)</label>
                  <textarea className="form-control" rows={3} value={form.requirements} onChange={e => setForm({ ...form, requirements: e.target.value })} placeholder="Basic JavaScript knowledge&#10;HTML & CSS fundamentals" />
                </div>
                <div className="form-group">
                  <label className="form-label">Learning Outcomes (one per line)</label>
                  <textarea className="form-control" rows={3} value={form.outcomes} onChange={e => setForm({ ...form, outcomes: e.target.value })} placeholder="Build full React applications&#10;Understand component architecture" />
                </div>
                <div className="form-row form-row-checks">
                  <label className="check-label">
                    <input type="checkbox" checked={form.isFree} onChange={e => setForm({ ...form, isFree: e.target.checked })} />
                    Free Course
                  </label>
                  <label className="check-label">
                    <input type="checkbox" checked={form.isPublished} onChange={e => setForm({ ...form, isPublished: e.target.checked })} />
                    Publish Immediately
                  </label>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-outline" onClick={() => setShowForm(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : editId ? 'Update Course' : 'Create Course'}</button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Table */}
        {fetching ? <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead><tr><th>Course</th><th>Category</th><th>Level</th><th>Status</th><th>Enrolled</th><th>Actions</th></tr></thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="table-empty">No courses found.</td></tr>}
                {filtered.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div className="course-info">
                        <div className="course-name">{c.title}</div>
                        <div className="course-instructor">{c.instructor}</div>
                      </div>
                    </td>
                    <td>{c.category?.name || '—'}</td>
                    <td><span className="badge badge-accent">{c.level}</span></td>
                    <td>
                      <button className={`status-toggle ${c.isPublished ? 'published' : 'draft'}`} onClick={() => togglePublish(c)}>
                        {c.isPublished ? '✓ Published' : '○ Draft'}
                      </button>
                    </td>
                    <td className="text-muted">{c.enrolledCount || 0}</td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => handleEdit(c)}>Edit</button>
                        <button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}>Del</button>
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
