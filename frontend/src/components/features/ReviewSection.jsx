import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './ReviewSection.css';

const StarRating = ({ value, onChange, readonly = false }) => (
  <div className="star-input">
    {[1,2,3,4,5].map(i => (
      <button key={i} type="button" className={`star-btn ${i <= value ? 'filled' : ''}`}
        onClick={() => !readonly && onChange && onChange(i)}
        style={{ cursor: readonly ? 'default' : 'pointer' }}>
        <svg width="20" height="20" viewBox="0 0 24 24" fill={i <= value ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.5">
          <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
        </svg>
      </button>
    ))}
  </div>
);

const ratingLabels = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

export default function ReviewSection({ courseId }) {
  const { user } = useAuth();
  const [reviews, setReviews] = useState([]);
  const [distribution, setDistribution] = useState([]);
  const [avgRating, setAvgRating] = useState(0);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ rating: 0, title: '', body: '' });
  const [submitting, setSubmitting] = useState(false);
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);

  const fetchReviews = async (p = 1) => {
    try {
      const r = await api.get(`/reviews/course/${courseId}?page=${p}&limit=8`);
      setReviews(p === 1 ? r.data.reviews : [...reviews, ...r.data.reviews]);
      setTotal(r.data.total);
      setPages(r.data.pages);
      if (r.data.distribution) {
        const dist = [5,4,3,2,1].map(star => {
          const found = r.data.distribution.find(d => d._id === star);
          return { star, count: found ? found.count : 0 };
        });
        setDistribution(dist);
        const totalR = dist.reduce((a, d) => a + d.count, 0);
        const avg = totalR > 0 ? dist.reduce((a, d) => a + d.star * d.count, 0) / totalR : 0;
        setAvgRating(Math.round(avg * 10) / 10);
      }
    } catch {}
  };

  useEffect(() => { fetchReviews(1).finally(() => setLoading(false)); }, [courseId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.rating) { toast.error('Please select a rating.'); return; }
    if (!form.body.trim()) { toast.error('Please write a review.'); return; }
    setSubmitting(true);
    try {
      const r = await api.post(`/reviews/course/${courseId}`, form);
      setReviews(prev => [r.data.review, ...prev]);
      setTotal(t => t + 1);
      setShowForm(false);
      setForm({ rating: 0, title: '', body: '' });
      toast.success('Review submitted!');
      fetchReviews(1);
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to submit.');
    } finally { setSubmitting(false); }
  };

  const toggleHelpful = async (id) => {
    if (!user) { toast.info('Login to mark reviews as helpful.'); return; }
    try {
      await api.put(`/reviews/${id}/helpful`);
      fetchReviews(1);
    } catch {}
  };

  const maxCount = distribution.length ? Math.max(...distribution.map(d => d.count), 1) : 1;

  return (
    <div className="review-section">
      <div className="review-header">
        <h2>Student Reviews</h2>
        {user && <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
          {showForm ? 'Cancel' : '+ Write a Review'}
        </button>}
      </div>

      {/* Summary */}
      {total > 0 && (
        <div className="review-summary">
          <div className="avg-block">
            <div className="avg-score">{avgRating}</div>
            <StarRating value={Math.round(avgRating)} readonly />
            <div className="avg-label">Course Rating</div>
          </div>
          <div className="dist-bars">
            {distribution.map(d => (
              <div key={d.star} className="dist-row">
                <div className="dist-bar-wrap">
                  <div className="dist-bar">
                    <div className="dist-fill" style={{ width: `${(d.count / maxCount) * 100}%` }} />
                  </div>
                </div>
                <div className="dist-stars">
                  <StarRating value={d.star} readonly />
                </div>
                <div className="dist-count">{d.count}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Write Review Form */}
      {showForm && (
        <form className="review-form" onSubmit={handleSubmit}>
          <h3>Your Review</h3>
          <div className="form-group">
            <label className="form-label">Rating *</label>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <StarRating value={form.rating} onChange={r => setForm({ ...form, rating: r })} />
              {form.rating > 0 && <span style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>{ratingLabels[form.rating]}</span>}
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-control" placeholder="Summarize your experience" value={form.title}
              onChange={e => setForm({ ...form, title: e.target.value })} maxLength={100} />
          </div>
          <div className="form-group">
            <label className="form-label">Review *</label>
            <textarea className="form-control" rows={4} placeholder="Share what you learned and what could be improved..."
              value={form.body} onChange={e => setForm({ ...form, body: e.target.value })} maxLength={1000} />
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: 4 }}>{form.body.length}/1000</div>
          </div>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Submitting...' : 'Submit Review'}
          </button>
        </form>
      )}

      {/* Reviews List */}
      {loading ? <div style={{ textAlign: 'center', padding: 32 }}><div className="spinner" style={{ margin: '0 auto' }} /></div> : (
        <>
          {reviews.length === 0 ? (
            <div className="empty-state" style={{ padding: '40px 0' }}>
              <p>No reviews yet. Be the first to review this course!</p>
            </div>
          ) : (
            <div className="reviews-list">
              {reviews.map(r => (
                <div key={r._id} className="review-card">
                  <div className="review-author">
                    <div className="reviewer-avatar">{r.user?.name?.charAt(0).toUpperCase()}</div>
                    <div>
                      <div className="reviewer-name">{r.user?.name}</div>
                      <div className="review-date">{new Date(r.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</div>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                      <StarRating value={r.rating} readonly />
                    </div>
                  </div>
                  {r.title && <div className="review-title">{r.title}</div>}
                  <p className="review-body">{r.body}</p>
                  <div className="review-helpful">
                    <button className="helpful-btn" onClick={() => toggleHelpful(r._id)}>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3H14z"/><path d="M7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"/></svg>
                      Helpful ({r.helpful?.length || 0})
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {page < pages && (
            <button className="btn btn-outline" style={{ width: '100%', marginTop: 16 }}
              onClick={() => { const np = page + 1; setPage(np); fetchReviews(np); }}>
              Load More Reviews
            </button>
          )}
        </>
      )}
    </div>
  );
}
