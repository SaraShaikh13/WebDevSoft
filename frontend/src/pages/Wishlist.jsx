import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import CourseCard from '../components/CourseCard';
import { toast } from 'react-toastify';

export default function Wishlist() {
  const [wishlist, setWishlist] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/wishlist').then(r => setWishlist(r.data.wishlist || [])).catch(() => {}).finally(() => setLoading(false));
  }, []);

  const remove = async (courseId) => {
    try {
      await api.post(`/wishlist/${courseId}`);
      setWishlist(prev => prev.filter(c => c._id !== courseId));
      toast.success('Removed from wishlist.');
    } catch { toast.error('Failed.'); }
  };

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container">
        <div className="page-header">
          <h1>My Wishlist <span className="total-badge">{wishlist.length}</span></h1>
          <p>Courses you've saved for later</p>
        </div>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : wishlist.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
            <h3>Your Wishlist is Empty</h3>
            <p>Save courses you'd like to take later.</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Courses</Link>
          </div>
        ) : (
          <div className="grid-3">
            {wishlist.map(course => (
              <div key={course._id} style={{ position: 'relative' }}>
                <CourseCard course={course} />
                <button
                  onClick={() => remove(course._id)}
                  style={{ position: 'absolute', top: 52, right: 12, background: 'rgba(10,10,15,0.85)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: '0.72rem', color: '#fc8181', cursor: 'pointer', backdropFilter: 'blur(4px)' }}>
                  ✕ Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
