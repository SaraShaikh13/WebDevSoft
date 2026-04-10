import React from 'react';
import { Link } from 'react-router-dom';
import './CourseCard.css';

const levelColor = { Beginner: 'badge-green', Intermediate: 'badge-accent', Advanced: 'badge-orange' };

const StarIcon = ({ filled }) => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="2">
    <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26"/>
  </svg>
);

const UserIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/>
  </svg>
);

const ClockIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="10"/><polyline points="12,6 12,12 16,14"/>
  </svg>
);

const BookIcon = () => (
  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
  </svg>
);

export default function CourseCard({ course }) {
  const rating = Math.round(course.rating || 0);
  return (
    <div className="course-card card">
      <div className="course-thumb">
        {course.thumbnail
          ? <img src={course.thumbnail} alt={course.title} />
          : <div className="thumb-placeholder"><span>{course.category?.icon || '◈'}</span></div>
        }
        <span className={`badge ${levelColor[course.level] || 'badge-accent'} level-badge`}>{course.level}</span>
        {course.isFree && <span className="free-tag">FREE</span>}
      </div>
      <div className="card-body">
        {course.category && (
          <div className="course-cat">{course.category.icon} {course.category.name}</div>
        )}
        <h3 className="course-title">
          <Link to={`/courses/${course.slug}`}>{course.title}</Link>
        </h3>
        <p className="course-desc">{course.shortDescription || course.description?.slice(0, 100)}...</p>
        <div className="course-meta">
          <span className="meta-item"><UserIcon /> {course.instructor}</span>
          {course.duration && <span className="meta-item"><ClockIcon /> {course.duration}h</span>}
          {course.lessons && <span className="meta-item"><BookIcon /> {course.lessons.length} lessons</span>}
        </div>
        <div className="course-footer">
          <div className="course-rating">
            {[1,2,3,4,5].map(i => (
              <span key={i} style={{ color: i <= rating ? '#f59e0b' : 'var(--border-light)' }}>
                <StarIcon filled={i <= rating} />
              </span>
            ))}
            <span className="rating-count">({course.reviewCount || 0})</span>
          </div>
          <Link to={`/courses/${course.slug}`} className="btn btn-primary btn-sm">Enroll</Link>
        </div>
      </div>
    </div>
  );
}
