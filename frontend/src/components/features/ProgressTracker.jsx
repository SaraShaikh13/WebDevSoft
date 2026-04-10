import React, { useState } from 'react';
import { api } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './ProgressTracker.css';

export default function ProgressTracker({ course, completedLessons = [], onUpdate }) {
  const [completing, setCompleting] = useState(null);

  if (!course?.lessons?.length) return null;

  const completed = course.lessons.filter(l => completedLessons.includes(l._id));
  const progress = Math.round((completed.length / course.lessons.length) * 100);
  const isComplete = progress === 100;

  const toggleLesson = async (lessonId) => {
    setCompleting(lessonId);
    try {
      const r = await api.post('/users/complete-lesson', { lessonId });
      onUpdate && onUpdate(r.data.completedLessons);
    } catch { toast.error('Failed to update progress.'); }
    finally { setCompleting(null); }
  };

  return (
    <div className="progress-tracker">
      <div className="pt-header">
        <div className="pt-title">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="9 11 12 14 22 4"/><path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"/>
          </svg>
          Your Progress
        </div>
        <div className="pt-pct">{progress}%</div>
      </div>

      <div className="pt-bar-wrap">
        <div className="pt-bar">
          <div className="pt-fill" style={{ width: `${progress}%` }} />
        </div>
      </div>

      <div className="pt-stats">
        <span>{completed.length} / {course.lessons.length} lessons</span>
        {isComplete && <span className="pt-complete-badge">✓ Complete!</span>}
      </div>

      <div className="pt-lessons">
        {course.lessons.map((lesson, i) => {
          const done = completedLessons.includes(lesson._id);
          return (
            <div key={lesson._id || i} className={`pt-lesson ${done ? 'done' : ''}`}>
              <button
                className={`pt-check ${done ? 'checked' : ''}`}
                onClick={() => toggleLesson(lesson._id)}
                disabled={completing === lesson._id}
                title={done ? 'Mark incomplete' : 'Mark complete'}>
                {completing === lesson._id ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" className="spin"><path d="M21 12a9 9 0 1 1-6.219-8.56"/></svg>
                ) : done ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="20,6 9,17 4,12"/></svg>
                ) : null}
              </button>
              <div className="pt-lesson-info">
                <div className="pt-lesson-num">{i + 1}</div>
                <div className={`pt-lesson-title ${done ? 'done-title' : ''}`}>{lesson.title}</div>
                {lesson.duration && <div className="pt-lesson-dur">{lesson.duration}m</div>}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
