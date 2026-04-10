import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';

export default function TutorialDetail() {
  const { slug } = useParams();
  const [tutorial, setTutorial] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/tutorials/${slug}`)
      .then(r => setTutorial(r.data.tutorial))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!tutorial) return (
    <div style={{ paddingTop: 120, textAlign: 'center' }}>
      <h2>Tutorial not found</h2>
      <Link to="/tutorials" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Tutorials</Link>
    </div>
  );

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container" style={{ maxWidth: 840 }}>
        <div style={{ marginBottom: 24 }}>
          <Link to="/tutorials" style={{ color: 'var(--accent-light)', fontSize: '0.88rem' }}>← Back to Tutorials</Link>
        </div>
        <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap' }}>
          {tutorial.category && <span className="badge badge-accent">{tutorial.category.icon} {tutorial.category.name}</span>}
          <span className="badge badge-green">{tutorial.difficulty}</span>
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center' }}>{tutorial.readTime || 5} min read · {tutorial.views} views</span>
        </div>
        <h1 style={{ fontSize: 'clamp(1.6rem, 4vw, 2.2rem)', fontWeight: 700, lineHeight: 1.25, marginBottom: 24 }}>{tutorial.title}</h1>
        <div style={{ color: 'var(--text-secondary)', lineHeight: 1.9, fontSize: '1rem' }}>
          {tutorial.content?.split('\n').map((p, i) => p ? <p key={i} style={{ marginBottom: 16 }}>{p}</p> : <br key={i} />)}
        </div>
        {tutorial.codeSnippets?.length > 0 && (
          <div style={{ marginTop: 32 }}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: 16 }}>Code Examples</h2>
            {tutorial.codeSnippets.map((s, i) => (
              <div key={i} style={{ marginBottom: 20 }}>
                {s.description && <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: 8 }}>{s.description}</p>}
                <div style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px' }}>
                  <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', fontFamily: 'var(--mono)', marginBottom: 8, textTransform: 'uppercase' }}>{s.language}</div>
                  <pre style={{ fontFamily: 'var(--mono)', fontSize: '0.88rem', color: 'var(--green)', overflow: 'auto', margin: 0 }}><code>{s.code}</code></pre>
                </div>
              </div>
            ))}
          </div>
        )}
        {tutorial.tags?.length > 0 && (
          <div style={{ marginTop: 32, paddingTop: 24, borderTop: '1px solid var(--border)' }}>
            {tutorial.tags.map(t => <span key={t} className="tag" style={{ marginRight: 6 }}>{t}</span>)}
          </div>
        )}
      </div>
    </div>
  );
}
