import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import './Certificates.css';

const CertificateCard = ({ cert, onPrint }) => (
  <div className="cert-card">
    <div className="cert-ribbon">Certificate of Completion</div>
    <div className="cert-body">
      <div className="cert-logo">
        <svg width="36" height="36" viewBox="0 0 32 32" fill="none">
          <rect width="32" height="32" rx="9" fill="url(#cg1)"/>
          <path d="M8 12l5 4-5 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
          <path d="M15 20h9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
          <defs><linearGradient id="cg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
            <stop stopColor="#6c63ff"/><stop offset="1" stopColor="#00d4a0"/>
          </linearGradient></defs>
        </svg>
        <span className="cert-brand">WebDevSoft</span>
      </div>
      <p className="cert-presented">This certifies that</p>
      <div className="cert-name">{cert.user?.name}</div>
      <p className="cert-text">has successfully completed the course</p>
      <div className="cert-course">{cert.course?.title}</div>
      <div className="cert-instructor">Instructor: {cert.course?.instructor}</div>
      <div className="cert-meta">
        <div className="cert-meta-item">
          <div className="cert-meta-label">Issued</div>
          <div className="cert-meta-val">{new Date(cert.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
        </div>
        <div className="cert-meta-divider" />
        <div className="cert-meta-item">
          <div className="cert-meta-label">Credential ID</div>
          <div className="cert-meta-val cert-id">{cert.credentialId}</div>
        </div>
        {cert.course?.duration && (
          <>
            <div className="cert-meta-divider" />
            <div className="cert-meta-item">
              <div className="cert-meta-label">Duration</div>
              <div className="cert-meta-val">{cert.course.duration} hours</div>
            </div>
          </>
        )}
      </div>
      <div className="cert-verify">
        Verify at: webdevsoft.com/verify/{cert.credentialId}
      </div>
    </div>
    <div className="cert-actions">
      <button className="btn btn-primary btn-sm" onClick={() => onPrint(cert)}>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="6,9 6,2 18,2 18,9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg>
        Print / Download
      </button>
      <Link to={`/courses`} className="btn btn-outline btn-sm">Browse More</Link>
    </div>
  </div>
);

// Printable version
const PrintableCert = React.forwardRef(({ cert }, ref) => (
  <div ref={ref} className="cert-printable">
    <div className="cp-border">
      <div className="cp-inner">
        <div className="cp-header">
          <div className="cp-logo-row">
            <svg width="48" height="48" viewBox="0 0 32 32" fill="none">
              <rect width="32" height="32" rx="9" fill="url(#pg1)"/>
              <path d="M8 12l5 4-5 4" stroke="#fff" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M15 20h9" stroke="#fff" strokeWidth="2.2" strokeLinecap="round"/>
              <defs><linearGradient id="pg1" x1="0" y1="0" x2="32" y2="32" gradientUnits="userSpaceOnUse">
                <stop stopColor="#6c63ff"/><stop offset="1" stopColor="#00d4a0"/>
              </linearGradient></defs>
            </svg>
            <span className="cp-brand">WebDevSoft</span>
          </div>
          <div className="cp-title">Certificate of Completion</div>
        </div>
        <div className="cp-body">
          <div className="cp-presented">This is to certify that</div>
          <div className="cp-name">{cert?.user?.name}</div>
          <div className="cp-subtext">has successfully completed the course</div>
          <div className="cp-course">{cert?.course?.title}</div>
          <div className="cp-instructor">Taught by {cert?.course?.instructor}</div>
        </div>
        <div className="cp-footer">
          <div className="cp-footer-left">
            <div className="cp-sig-line" />
            <div className="cp-sig-label">WebDevSoft</div>
          </div>
          <div className="cp-footer-center">
            <div className="cp-seal">✦</div>
          </div>
          <div className="cp-footer-right">
            <div className="cp-date">{new Date(cert?.issuedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
            <div className="cp-cred">ID: {cert?.credentialId}</div>
          </div>
        </div>
      </div>
    </div>
  </div>
));

export default function Certificates() {
  const { user } = useAuth();
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [printing, setPrinting] = useState(null);
  const printRef = useRef();

  useEffect(() => {
    api.get('/certificates/my')
      .then(r => setCerts(r.data.certificates || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handlePrint = (cert) => {
    setPrinting(cert);
    setTimeout(() => { window.print(); }, 300);
  };

  return (
    <div style={{ paddingTop: 90, paddingBottom: 80 }}>
      <div className="container">
        <div className="page-header">
          <h1>My Certificates <span className="total-badge">{certs.length}</span></h1>
          <p>Your earned certificates of completion</p>
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: 80 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : certs.length === 0 ? (
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/>
            </svg>
            <h3>No Certificates Yet</h3>
            <p>Complete a course and pass all quizzes to earn your first certificate!</p>
            <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Start Learning</Link>
          </div>
        ) : (
          <div className="certs-grid">
            {certs.map(cert => (
              <CertificateCard key={cert._id} cert={cert} onPrint={handlePrint} />
            ))}
          </div>
        )}

        {/* Verify section */}
        <div className="verify-section">
          <h2>Verify a Certificate</h2>
          <p>Enter a credential ID to verify its authenticity</p>
          <VerifyForm />
        </div>
      </div>

      {/* Hidden printable version */}
      {printing && (
        <div className="print-only">
          <PrintableCert ref={printRef} cert={printing} />
        </div>
      )}
    </div>
  );
}

function VerifyForm() {
  const [credId, setCredId] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const verify = async (e) => {
    e.preventDefault();
    if (!credId.trim()) return;
    setLoading(true); setError(''); setResult(null);
    try {
      const r = await api.get(`/certificates/verify/${credId.trim()}`);
      setResult(r.data.certificate);
    } catch { setError('Certificate not found. Please check the ID and try again.'); }
    finally { setLoading(false); }
  };

  return (
    <div className="verify-form-wrap">
      <form onSubmit={verify} className="verify-form">
        <input className="form-control" placeholder="e.g. WDS-A1B2C3D4E5F6"
          value={credId} onChange={e => setCredId(e.target.value.toUpperCase())} />
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Verifying...' : 'Verify'}
        </button>
      </form>
      {error && <div className="alert alert-error" style={{ marginTop: 12 }}>{error}</div>}
      {result && (
        <div className="verify-result">
          <div className="verify-valid">✓ Valid Certificate</div>
          <div className="verify-details">
            <div><strong>{result.user?.name}</strong> completed <strong>{result.course?.title}</strong></div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.82rem', marginTop: 4 }}>
              Issued: {new Date(result.issuedAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
