import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth, api } from '../context/AuthContext';
import { toast } from 'react-toastify';
import CourseCard from '../components/CourseCard';
import './Dashboard.css';

const TABS = ['courses', 'wishlist', 'certificates', 'activity'];
const TAB_LABELS = { courses: '📚 My Courses', wishlist: '♡ Wishlist', certificates: '🏆 Certificates', activity: '◎ Activity' };

export default function Dashboard() {
  const { user, updateProfile } = useAuth();
  const [dashData, setDashData] = useState(null);
  const [wishlist, setWishlist] = useState([]);
  const [certificates, setCertificates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editMode, setEditMode] = useState(false);
  const [profileForm, setProfileForm] = useState({ name: '', bio: '' });
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('courses');

  useEffect(() => {
    Promise.all([
      api.get('/users/dashboard'),
      api.get('/wishlist'),
      api.get('/certificates/my'),
    ]).then(([d, w, c]) => {
      setDashData(d.data.user);
      setProfileForm({ name: d.data.user.name, bio: d.data.user.bio || '' });
      setWishlist(w.data.wishlist || []);
      setCertificates(c.data.certificates || []);
    }).catch(() => {})
    .finally(() => setLoading(false));
  }, []);

  const handleProfileSave = async () => {
    setSaving(true);
    try {
      await updateProfile(profileForm);
      toast.success('Profile updated!');
      setEditMode(false);
    } catch { toast.error('Failed.'); }
    finally { setSaving(false); }
  };

  const removeWishlist = async (courseId) => {
    try {
      await api.post(`/wishlist/${courseId}`);
      setWishlist(prev => prev.filter(c => c._id !== courseId));
      toast.success('Removed from wishlist.');
    } catch {}
  };

  const getProgress = (course) => {
    if (!dashData?.completedLessons || !course.lessons?.length) return 0;
    const completed = course.lessons.filter(l => dashData.completedLessons.includes(l._id)).length;
    return Math.round((completed / course.lessons.length) * 100);
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  const enrolled = dashData?.enrolledCourses || [];

  return (
    <div className="dashboard-page" style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="dashboard-grid">

          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <div className="profile-card">
              <div className="profile-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
              {editMode ? (
                <div className="profile-edit">
                  <div className="form-group">
                    <label className="form-label">Name</label>
                    <input className="form-control" value={profileForm.name} onChange={e => setProfileForm({ ...profileForm, name: e.target.value })} />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Bio</label>
                    <textarea className="form-control" rows={3} value={profileForm.bio} onChange={e => setProfileForm({ ...profileForm, bio: e.target.value })} placeholder="Tell us about yourself..." />
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button className="btn btn-primary btn-sm" onClick={handleProfileSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                    <button className="btn btn-outline btn-sm" onClick={() => setEditMode(false)}>Cancel</button>
                  </div>
                </div>
              ) : (
                <>
                  <h2 className="profile-name">{user?.name}</h2>
                  <p className="profile-email">{user?.email}</p>
                  {user?.bio && <p className="profile-bio">{user.bio}</p>}
                  <button className="btn btn-outline btn-sm" style={{ marginTop: 14 }} onClick={() => setEditMode(true)}>Edit Profile</button>
                </>
              )}
            </div>

            <div className="sidebar-stats">
              <div className="sidebar-stat">
                <div className="sidebar-stat-val">{enrolled.length}</div>
                <div className="sidebar-stat-label">Enrolled</div>
              </div>
              <div className="sidebar-stat">
                <div className="sidebar-stat-val">{certificates.length}</div>
                <div className="sidebar-stat-label">Certs</div>
              </div>
              <div className="sidebar-stat">
                <div className="sidebar-stat-val">{wishlist.length}</div>
                <div className="sidebar-stat-label">Saved</div>
              </div>
            </div>

            <div className="sidebar-nav">
              {TABS.map(tab => (
                <button key={tab} className={`sidebar-nav-item ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                  {TAB_LABELS[tab]}
                </button>
              ))}
            </div>
          </aside>

          {/* Main */}
          <main className="dashboard-main">

            {/* MY COURSES */}
            {activeTab === 'courses' && (
              <>
                <div className="dash-section-header">
                  <h2>My Learning ({enrolled.length})</h2>
                  <Link to="/courses" className="btn btn-primary btn-sm">+ Enroll More</Link>
                </div>
                {enrolled.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>
                    <h3>No Courses Yet</h3>
                    <p>Explore our catalog and start learning today.</p>
                    <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Courses</Link>
                  </div>
                ) : (
                  <div className="enrolled-list">
                    {enrolled.map(course => {
                      const progress = getProgress(course);
                      return (
                        <div key={course._id} className="enrolled-card">
                          <div className="enrolled-thumb">
                            {course.thumbnail
                              ? <img src={course.thumbnail} alt={course.title} />
                              : <div className="thumb-placeholder small"><span>{course.category?.icon || '◈'}</span></div>}
                          </div>
                          <div className="enrolled-info">
                            <div className="enrolled-cat">{course.category?.icon} {course.category?.name}</div>
                            <h3 className="enrolled-title">{course.title}</h3>
                            <div className="enrolled-meta">
                              <span>{course.level}</span><span>·</span>
                              <span>{course.lessons?.length || 0} lessons</span><span>·</span>
                              <span>{course.duration || 0}h</span>
                            </div>
                            <div className="progress-bar-wrap">
                              <div className="progress-bar"><div className="progress-fill" style={{ width: `${progress}%` }} /></div>
                              <span className="progress-pct">{progress}%</span>
                            </div>
                          </div>
                          <Link to={`/courses/${course.slug}`} className="btn btn-outline btn-sm enrolled-btn">
                            {progress > 0 ? 'Continue →' : 'Start →'}
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {/* WISHLIST */}
            {activeTab === 'wishlist' && (
              <>
                <div className="dash-section-header">
                  <h2>Saved Courses ({wishlist.length})</h2>
                  <Link to="/courses" className="btn btn-outline btn-sm">Browse More</Link>
                </div>
                {wishlist.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                    <h3>Wishlist is Empty</h3>
                    <p>Save courses to come back to them later.</p>
                    <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Browse Courses</Link>
                  </div>
                ) : (
                  <div className="grid-2">
                    {wishlist.map(course => (
                      <div key={course._id} style={{ position: 'relative' }}>
                        <CourseCard course={course} />
                        <button onClick={() => removeWishlist(course._id)}
                          style={{ position: 'absolute', top: 52, right: 12, background: 'rgba(10,10,15,0.85)', border: '1px solid var(--border)', borderRadius: 8, padding: '4px 10px', fontSize: '0.72rem', color: '#fc8181', cursor: 'pointer' }}>
                          ✕ Remove
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* CERTIFICATES */}
            {activeTab === 'certificates' && (
              <>
                <div className="dash-section-header">
                  <h2>My Certificates ({certificates.length})</h2>
                  <Link to="/certificates" className="btn btn-outline btn-sm">View All</Link>
                </div>
                {certificates.length === 0 ? (
                  <div className="empty-state">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                    <h3>No Certificates Yet</h3>
                    <p>Complete a course and pass all quizzes to earn certificates.</p>
                    <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Start Learning</Link>
                  </div>
                ) : (
                  <div className="certs-list">
                    {certificates.map(cert => (
                      <div key={cert._id} className="cert-list-item">
                        <div className="cert-list-icon">
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="var(--accent-light)" strokeWidth="1.5"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                        </div>
                        <div className="cert-list-info">
                          <div className="cert-list-title">{cert.course?.title}</div>
                          <div className="cert-list-meta">
                            <span>Instructor: {cert.course?.instructor}</span>
                            <span>·</span>
                            <span>Issued: {new Date(cert.issuedAt).toLocaleDateString()}</span>
                          </div>
                          <div className="cert-list-id">ID: {cert.credentialId}</div>
                        </div>
                        <Link to="/certificates" className="btn btn-outline btn-sm">View →</Link>
                      </div>
                    ))}
                  </div>
                )}
              </>
            )}

            {/* ACTIVITY */}
            {activeTab === 'activity' && (
              <div>
                <h2 className="dash-section-title">Activity Overview</h2>
                <div className="activity-cards">
                  <div className="activity-card">
                    <div className="activity-icon">◎</div>
                    <div className="activity-label">Enrolled</div>
                    <div className="activity-val">{enrolled.length}</div>
                  </div>
                  <div className="activity-card">
                    <div className="activity-icon">✓</div>
                    <div className="activity-label">Lessons Done</div>
                    <div className="activity-val">{dashData?.completedLessons?.length || 0}</div>
                  </div>
                  <div className="activity-card">
                    <div className="activity-icon">◈</div>
                    <div className="activity-label">Completed</div>
                    <div className="activity-val">{enrolled.filter(c => getProgress(c) === 100).length}</div>
                  </div>
                  <div className="activity-card">
                    <div className="activity-icon">▲</div>
                    <div className="activity-label">Certificates</div>
                    <div className="activity-val">{certificates.length}</div>
                  </div>
                </div>
                <div className="activity-timeline">
                  <h3>Recent Enrollments</h3>
                  {enrolled.slice(0, 5).map(c => (
                    <div key={c._id} className="timeline-item">
                      <div className="timeline-dot" />
                      <div className="timeline-content">
                        <div className="timeline-title">{c.title}</div>
                        <div className="timeline-sub">{c.level} · {getProgress(c)}% complete</div>
                      </div>
                      <Link to={`/courses/${c.slug}`} className="btn btn-outline btn-sm">Go →</Link>
                    </div>
                  ))}
                  {enrolled.length === 0 && <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>No activity yet.</p>}
                </div>
              </div>
            )}

          </main>
        </div>
      </div>
    </div>
  );
}
