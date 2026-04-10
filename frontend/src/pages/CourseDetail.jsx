import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';
import ReviewSection from '../components/features/ReviewSection';
import QuizSection from '../components/features/QuizSection';
import DiscussionSection from '../components/features/DiscussionSection';
import ProgressTracker from '../components/features/ProgressTracker';
import WishlistButton from '../components/features/WishlistButton';
import './CourseDetail.css';

const TABS = ['Overview', 'Progress', 'Quizzes', 'Discussions', 'Reviews'];

export default function CourseDetail() {
  const { slug } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled] = useState(false);
  const [expanded, setExpanded] = useState(null);
  const [activeTab, setActiveTab] = useState('Overview');
  const [completedLessons, setCompletedLessons] = useState([]);
  const [earnedCert, setEarnedCert] = useState(null);

  useEffect(() => {
    api.get(`/courses/${slug}`)
      .then(r => {
        setCourse(r.data.course);
        if (user) {
          setEnrolled(user.enrolledCourses?.includes(r.data.course._id));
        }
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [slug, user]);

  useEffect(() => {
    if (user) setCompletedLessons(user.completedLessons || []);
  }, [user]);

  const handleEnroll = async () => {
    if (!user) { toast.info('Please log in to enroll.'); return; }
    setEnrolling(true);
    try {
      await api.post(`/courses/${course._id}/enroll`);
      setEnrolled(true);
      toast.success('Successfully enrolled! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Enrollment failed.');
    } finally { setEnrolling(false); }
  };

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  if (!course) return (
    <div style={{ paddingTop: 120, textAlign: 'center' }}>
      <h2>Course not found</h2>
      <Link to="/courses" className="btn btn-primary" style={{ marginTop: 16 }}>Back to Courses</Link>
    </div>
  );

  const progress = course.lessons?.length
    ? Math.round((course.lessons.filter(l => completedLessons.includes(l._id)).length / course.lessons.length) * 100)
    : 0;

  return (
    <div className="course-detail" style={{ paddingTop: 80 }}>
      {/* Hero */}
      <div className="cd-hero">
        <div className="container">
          <div className="cd-hero-grid">
            <div className="cd-hero-info">
              <div className="cd-breadcrumb">
                <Link to="/courses">Courses</Link>
                {course.category && <> / <Link to={`/courses?category=${course.category._id}`}>{course.category.name}</Link></>}
              </div>
              <h1 className="cd-title">{course.title}</h1>
              <p className="cd-desc">{course.shortDescription || course.description?.slice(0, 200)}</p>
              <div className="cd-meta">
                <span className="badge badge-accent">{course.level}</span>
                <span className="cd-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                  {course.instructor}
                </span>
                {course.duration && <span className="cd-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  {course.duration}h
                </span>}
                <span className="cd-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/></svg>
                  {course.lessons?.length || 0} lessons
                </span>
                <span className="cd-meta-item">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
                  {course.enrolledCount} enrolled
                </span>
                {course.rating > 0 && (
                  <span className="cd-rating">
                    ★ {course.rating} ({course.reviewCount} reviews)
                  </span>
                )}
              </div>
            </div>

            {/* Enroll Card */}
            <div className="cd-enroll-card">
              {course.thumbnail && <img src={course.thumbnail} alt={course.title} className="cd-thumb" />}
              <div className="cd-price">{course.isFree ? <span className="price-free">FREE</span> : <span className="price-paid">${course.price}</span>}</div>

              {enrolled ? (
                <>
                  <div className="enrolled-badge">✓ Enrolled</div>
                  {course.lessons?.length > 0 && (
                    <div className="cd-progress-mini">
                      <div className="cd-prog-bar"><div className="cd-prog-fill" style={{ width: `${progress}%` }} /></div>
                      <span>{progress}% complete</span>
                    </div>
                  )}
                </>
              ) : (
                <button className="btn btn-primary btn-full btn-lg" onClick={handleEnroll} disabled={enrolling}>
                  {enrolling ? 'Enrolling...' : course.isFree ? 'Enroll for Free' : `Enroll — $${course.price}`}
                </button>
              )}

              <div style={{ marginTop: 10 }}>
                <WishlistButton courseId={course._id} size="md" />
              </div>

              {!user && <p className="cd-login-hint"><Link to="/login">Log in</Link> to enroll & track progress.</p>}

              <ul className="cd-includes">
                {course.duration && <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/></svg>
                  {course.duration} hours of content
                </li>}
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>
                  Access on all devices
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                  Certificate of completion
                </li>
                <li>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
                  Discussion forum access
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="cd-tabs-bar">
        <div className="container">
          <div className="cd-tabs">
            {TABS.map(tab => (
              <button key={tab} className={`cd-tab ${activeTab === tab ? 'active' : ''}`} onClick={() => setActiveTab(tab)}>
                {tab}
                {tab === 'Progress' && enrolled && <span className="tab-badge">{progress}%</span>}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tab Content */}
      <div className="container cd-body">
        <div className="cd-main">

          {/* OVERVIEW TAB */}
          {activeTab === 'Overview' && (
            <>
              {course.outcomes?.length > 0 && (
                <div className="cd-section">
                  <h2>What You'll Learn</h2>
                  <div className="outcomes-grid">
                    {course.outcomes.map((o, i) => (
                      <div key={i} className="outcome-item">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="var(--green)" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                        {o}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {course.requirements?.length > 0 && (
                <div className="cd-section">
                  <h2>Requirements</h2>
                  <ul className="req-list">{course.requirements.map((r, i) => <li key={i}>{r}</li>)}</ul>
                </div>
              )}

              {course.lessons?.length > 0 && (
                <div className="cd-section">
                  <h2>Curriculum <span className="lesson-count">({course.lessons.length} lessons)</span></h2>
                  <div className="lesson-list">
                    {course.lessons.map((lesson, i) => (
                      <div key={lesson._id || i} className="lesson-item" onClick={() => setExpanded(expanded === i ? null : i)}>
                        <div className="lesson-header">
                          <div className={`lesson-num ${completedLessons.includes(lesson._id) ? 'done' : ''}`}>
                            {completedLessons.includes(lesson._id)
                              ? <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                              : i + 1}
                          </div>
                          <div className="lesson-title">{lesson.title}</div>
                          <div className="lesson-meta">
                            {lesson.isPreview && <span className="badge badge-green">Preview</span>}
                            {lesson.duration && <span className="lesson-dur">{lesson.duration}min</span>}
                            <span className="lesson-toggle">{expanded === i ? '▲' : '▼'}</span>
                          </div>
                        </div>
                        {expanded === i && (
                          <div className="lesson-content">
                            <p>{lesson.content}</p>
                            {lesson.videoUrl && <a href={lesson.videoUrl} target="_blank" rel="noreferrer" className="btn btn-outline btn-sm" style={{ marginTop: 10 }}>▶ Watch Video</a>}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="cd-section">
                <h2>About This Course</h2>
                <p style={{ color: 'var(--text-secondary)', lineHeight: 1.8 }}>{course.description}</p>
              </div>
            </>
          )}

          {/* PROGRESS TAB */}
          {activeTab === 'Progress' && (
            <div>
              {enrolled ? (
                <>
                  {earnedCert && (
                    <div className="cert-earned-banner">
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
                      Certificate earned! <strong>{earnedCert.credentialId}</strong>
                      <Link to="/certificates" className="btn btn-sm btn-outline" style={{ marginLeft: 10 }}>View</Link>
                    </div>
                  )}
                  <ProgressTracker
                    course={course}
                    completedLessons={completedLessons}
                    onUpdate={setCompletedLessons}
                  />
                </>
              ) : (
                <div className="empty-state" style={{ padding: '40px 0' }}>
                  <p>Enroll in this course to track your progress.</p>
                  <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleEnroll}>Enroll Now</button>
                </div>
              )}
            </div>
          )}

          {/* QUIZZES TAB */}
          {activeTab === 'Quizzes' && (
            enrolled ? (
              <QuizSection courseId={course._id} onCertificateEarned={setEarnedCert} />
            ) : (
              <div className="empty-state" style={{ padding: '40px 0' }}>
                <p>Enroll to access quizzes and earn your certificate.</p>
                <button className="btn btn-primary" style={{ marginTop: 16 }} onClick={handleEnroll}>Enroll Now</button>
              </div>
            )
          )}

          {/* DISCUSSIONS TAB */}
          {activeTab === 'Discussions' && (
            <DiscussionSection courseId={course._id} />
          )}

          {/* REVIEWS TAB */}
          {activeTab === 'Reviews' && (
            <ReviewSection courseId={course._id} />
          )}
        </div>
      </div>
    </div>
  );
}
