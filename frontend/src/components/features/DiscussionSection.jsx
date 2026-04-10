import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './DiscussionSection.css';

const TimeAgo = ({ date }) => {
  const diff = Date.now() - new Date(date);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
};

export default function DiscussionSection({ courseId }) {
  const { user } = useAuth();
  const [discussions, setDiscussions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ title: '', body: '', tags: '' });
  const [expanded, setExpanded] = useState(null);
  const [replyBody, setReplyBody] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [total, setTotal] = useState(0);

  const fetchDiscussions = async () => {
    try {
      const r = await api.get(`/discussions/course/${courseId}?limit=20`);
      setDiscussions(r.data.discussions || []);
      setTotal(r.data.total || 0);
    } catch {}
  };

  useEffect(() => { fetchDiscussions().finally(() => setLoading(false)); }, [courseId]);

  const handlePost = async (e) => {
    e.preventDefault();
    if (!form.title.trim() || !form.body.trim()) { toast.error('Please fill in all fields.'); return; }
    setSubmitting(true);
    try {
      const r = await api.post(`/discussions/course/${courseId}`, {
        title: form.title, body: form.body,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
      });
      setDiscussions(prev => [r.data.discussion, ...prev]);
      setTotal(t => t + 1);
      setForm({ title: '', body: '', tags: '' });
      setShowForm(false);
      toast.success('Question posted!');
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to post.'); }
    finally { setSubmitting(false); }
  };

  const handleReply = async (discId) => {
    const body = replyBody[discId];
    if (!body?.trim()) return;
    try {
      const r = await api.post(`/discussions/${discId}/reply`, { body });
      setDiscussions(prev => prev.map(d => d._id === discId ? r.data.discussion : d));
      setReplyBody(prev => ({ ...prev, [discId]: '' }));
      toast.success('Reply posted!');
    } catch { toast.error('Failed to reply.'); }
  };

  const handleUpvote = async (discId) => {
    if (!user) { toast.info('Login to upvote.'); return; }
    try {
      const r = await api.put(`/discussions/${discId}/upvote`);
      setDiscussions(prev => prev.map(d => d._id === discId ? { ...d, upvotes: Array(r.data.upvotes).fill(null) } : d));
    } catch {}
  };

  const handleResolve = async (discId) => {
    try {
      const r = await api.put(`/discussions/${discId}/resolve`);
      setDiscussions(prev => prev.map(d => d._id === discId ? { ...d, isResolved: r.data.isResolved } : d));
    } catch {}
  };

  return (
    <div className="discussion-section">
      <div className="disc-header">
        <div>
          <h2>Discussion Forum</h2>
          <p className="disc-subtitle">{total} question{total !== 1 ? 's' : ''} — ask anything about this course</p>
        </div>
        {user && (
          <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
            {showForm ? 'Cancel' : '+ Ask Question'}
          </button>
        )}
      </div>

      {showForm && (
        <form className="disc-form" onSubmit={handlePost}>
          <div className="form-group">
            <label className="form-label">Question Title *</label>
            <input className="form-control" placeholder="What do you want to ask?" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} maxLength={200} />
          </div>
          <div className="form-group">
            <label className="form-label">Details *</label>
            <textarea className="form-control" rows={4} placeholder="Provide context, code examples, or more details..."
              value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} />
          </div>
          <div className="form-group">
            <label className="form-label">Tags (comma-separated)</label>
            <input className="form-control" placeholder="javascript, async, promises" value={form.tags}
              onChange={e => setForm({ ...form, tags: e.target.value })} />
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Posting...' : 'Post Question'}
          </button>
        </form>
      )}

      {loading ? (
        <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
      ) : discussions.length === 0 ? (
        <div className="empty-state" style={{ padding: '40px 0' }}>
          <p>No discussions yet. Be the first to ask a question!</p>
        </div>
      ) : (
        <div className="disc-list">
          {discussions.map(d => (
            <div key={d._id} className={`disc-card ${d.isResolved ? 'resolved' : ''} ${d.isPinned ? 'pinned' : ''}`}>
              <div className="disc-left">
                <button className="upvote-btn" onClick={() => handleUpvote(d._id)}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 19V5m-7 7l7-7 7 7"/></svg>
                  <span>{d.upvotes?.length || 0}</span>
                </button>
                <div className="reply-count">
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  {d.replies?.length || 0}
                </div>
              </div>
              <div className="disc-main">
                <div className="disc-top">
                  {d.isPinned && <span className="pin-badge">📌 Pinned</span>}
                  {d.isResolved && <span className="resolved-badge">✓ Resolved</span>}
                  <div className="disc-tags">{d.tags?.map(t => <span key={t} className="disc-tag">{t}</span>)}</div>
                </div>
                <button className="disc-title" onClick={() => setExpanded(expanded === d._id ? null : d._id)}>
                  {d.title}
                </button>
                <div className="disc-meta">
                  <div className="disc-avatar">{d.user?.name?.charAt(0)}</div>
                  <span>{d.user?.name}</span>
                  {d.user?.role === 'admin' && <span className="instructor-tag">Instructor</span>}
                  <span className="disc-time"><TimeAgo date={d.createdAt} /></span>
                </div>

                {expanded === d._id && (
                  <div className="disc-expanded">
                    <p className="disc-body">{d.body}</p>
                    <div className="disc-actions">
                      {(user?._id === d.user?._id || user?.role === 'admin') && (
                        <button className="disc-action-btn" onClick={() => handleResolve(d._id)}>
                          {d.isResolved ? 'Mark Unresolved' : '✓ Mark Resolved'}
                        </button>
                      )}
                    </div>

                    {/* Replies */}
                    {d.replies?.length > 0 && (
                      <div className="replies-list">
                        {d.replies.map((reply, i) => (
                          <div key={i} className={`reply-card ${reply.isInstructor ? 'instructor-reply' : ''}`}>
                            <div className="reply-header">
                              <div className="disc-avatar small">{reply.user?.name?.charAt(0)}</div>
                              <span className="reply-author">{reply.user?.name}</span>
                              {reply.isInstructor && <span className="instructor-tag">Instructor</span>}
                              <span className="disc-time"><TimeAgo date={reply.createdAt} /></span>
                            </div>
                            <p className="reply-body">{reply.body}</p>
                          </div>
                        ))}
                      </div>
                    )}

                    {user && (
                      <div className="reply-input-row">
                        <div className="disc-avatar small">{user.name?.charAt(0)}</div>
                        <input className="form-control reply-input" placeholder="Write a reply..."
                          value={replyBody[d._id] || ''}
                          onChange={e => setReplyBody(prev => ({ ...prev, [d._id]: e.target.value }))}
                          onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleReply(d._id)} />
                        <button className="btn btn-primary btn-sm" onClick={() => handleReply(d._id)}>Reply</button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
