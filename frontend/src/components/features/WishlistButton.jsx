import React, { useState, useEffect } from 'react';
import { useAuth, api } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './WishlistButton.css';

export default function WishlistButton({ courseId, size = 'md' }) {
  const { user } = useAuth();
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.wishlist) setSaved(user.wishlist.includes(courseId));
  }, [user, courseId]);

  const toggle = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { toast.info('Please log in to save courses.'); return; }
    setLoading(true);
    try {
      const r = await api.post(`/wishlist/${courseId}`);
      setSaved(r.data.added);
      toast.success(r.data.added ? 'Saved to wishlist!' : 'Removed from wishlist.');
    } catch { toast.error('Failed to update wishlist.'); }
    finally { setLoading(false); }
  };

  return (
    <button
      className={`wishlist-btn ${saved ? 'saved' : ''} wishlist-${size}`}
      onClick={toggle} disabled={loading}
      title={saved ? 'Remove from wishlist' : 'Save to wishlist'}>
      <svg width="18" height="18" viewBox="0 0 24 24"
        fill={saved ? 'currentColor' : 'none'}
        stroke="currentColor" strokeWidth="2">
        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
      </svg>
      {size !== 'icon' && <span>{saved ? 'Saved' : 'Save'}</span>}
    </button>
  );
}
