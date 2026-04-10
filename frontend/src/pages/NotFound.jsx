import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center', padding: '0 24px' }}>
      <div style={{ fontSize: '6rem', fontFamily: 'var(--mono)', fontWeight: 700, background: 'linear-gradient(135deg, var(--accent-light), var(--green))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</div>
      <h1 style={{ fontSize: '1.6rem', fontWeight: 700, margin: '16px 0 10px' }}>Page Not Found</h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 32, maxWidth: 400 }}>The page you're looking for doesn't exist. Maybe it moved, or you typed the URL wrong.</p>
      <div style={{ display: 'flex', gap: 12 }}>
        <Link to="/" className="btn btn-primary">Go Home</Link>
        <Link to="/courses" className="btn btn-outline">Browse Courses</Link>
      </div>
    </div>
  );
}
