import React, { useState, useEffect, useRef } from 'react';
import { api } from '../../context/AuthContext';
import { toast } from 'react-toastify';
import './QuizSection.css';

export default function QuizSection({ courseId, onCertificateEarned }) {
  const [quizzes, setQuizzes] = useState([]);
  const [activeQuiz, setActiveQuiz] = useState(null);
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [timeLeft, setTimeLeft] = useState(null);
  const [started, setStarted] = useState(false);
  const timerRef = useRef(null);
  const startTimeRef = useRef(null);

  useEffect(() => {
    api.get(`/quizzes/course/${courseId}`)
      .then(r => setQuizzes(r.data.quizzes || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseId]);

  const startQuiz = async (quiz) => {
    try {
      const r = await api.get(`/quizzes/${quiz._id}`);
      setActiveQuiz(r.data.quiz);
      setQuestions(r.data.quiz.questions);
      setAnswers({});
      setResult(null);
      setStarted(true);
      startTimeRef.current = Date.now();
      if (r.data.quiz.timeLimit > 0) {
        setTimeLeft(r.data.quiz.timeLimit * 60);
        timerRef.current = setInterval(() => {
          setTimeLeft(t => {
            if (t <= 1) { clearInterval(timerRef.current); handleSubmit(r.data.quiz, {}); return 0; }
            return t - 1;
          });
        }, 1000);
      }
    } catch { toast.error('Failed to load quiz.'); }
  };

  const handleSubmit = async (quiz = activeQuiz, ans = answers) => {
    if (timerRef.current) clearInterval(timerRef.current);
    const timeTaken = Math.round((Date.now() - startTimeRef.current) / 1000);
    const answerArray = (quiz?.questions || questions).map((_, i) => ans[i] !== undefined ? ans[i] : -1);
    setSubmitting(true);
    try {
      const r = await api.post(`/quizzes/${(quiz || activeQuiz)._id}/submit`, { answers: answerArray, timeTaken });
      setResult(r.data);
      setStarted(false);
      if (r.data.certificate) { onCertificateEarned && onCertificateEarned(r.data.certificate); toast.success('🏆 Certificate earned!'); }
      // Refresh quiz list
      const updated = await api.get(`/quizzes/course/${courseId}`);
      setQuizzes(updated.data.quizzes || []);
    } catch (err) { toast.error(err.response?.data?.message || 'Submit failed.'); }
    finally { setSubmitting(false); }
  };

  const formatTime = (s) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`;
  const answered = Object.keys(answers).length;

  if (loading) return <div style={{ textAlign: 'center', padding: 24 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>;
  if (!quizzes.length) return null;

  return (
    <div className="quiz-section">
      <h2 className="quiz-section-title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
        Quizzes & Assessments
      </h2>

      {!started && !result && (
        <div className="quiz-list">
          {quizzes.map(q => (
            <div key={q._id} className="quiz-card">
              <div className="quiz-info">
                <div className="quiz-name">{q.title}</div>
                <div className="quiz-meta">
                  <span>{q.questions?.length || 0} questions</span>
                  {q.timeLimit > 0 && <span>· {q.timeLimit} min</span>}
                  <span>· Pass: {q.passingScore}%</span>
                </div>
                {q.attempt && (
                  <div className={`quiz-attempt-badge ${q.attempt.passed ? 'passed' : 'failed'}`}>
                    {q.attempt.passed ? '✓ Passed' : '✗ Failed'} — {q.attempt.score}%
                  </div>
                )}
              </div>
              <button className={`btn btn-sm ${q.attempt?.passed ? 'btn-outline' : 'btn-primary'}`} onClick={() => startQuiz(q)}>
                {q.attempt ? 'Retake' : 'Start Quiz'}
              </button>
            </div>
          ))}
        </div>
      )}

      {started && activeQuiz && (
        <div className="quiz-player">
          <div className="quiz-player-header">
            <div>
              <div className="quiz-player-title">{activeQuiz.title}</div>
              <div className="quiz-progress-text">{answered}/{questions.length} answered</div>
            </div>
            {timeLeft !== null && (
              <div className={`quiz-timer ${timeLeft < 60 ? 'urgent' : ''}`}>{formatTime(timeLeft)}</div>
            )}
          </div>
          <div className="quiz-progress-bar">
            <div className="quiz-progress-fill" style={{ width: `${(answered/questions.length)*100}%` }} />
          </div>
          <div className="questions-list">
            {questions.map((q, qi) => (
              <div key={qi} className="question-card">
                <div className="question-num">Q{qi + 1}</div>
                <div className="question-text">{q.text}</div>
                <div className="options-list">
                  {q.options.map((opt, oi) => (
                    <button key={oi}
                      className={`option-btn ${answers[qi] === oi ? 'selected' : ''}`}
                      onClick={() => setAnswers({ ...answers, [qi]: oi })}>
                      <span className="option-letter">{String.fromCharCode(65 + oi)}</span>
                      <span>{opt}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="quiz-submit-row">
            <span className="quiz-submit-hint">{questions.length - answered} question{questions.length - answered !== 1 ? 's' : ''} unanswered</span>
            <button className="btn btn-primary" onClick={() => handleSubmit()} disabled={submitting || answered === 0}>
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          </div>
        </div>
      )}

      {result && (
        <div className={`quiz-result ${result.passed ? 'result-pass' : 'result-fail'}`}>
          <div className="result-icon">{result.passed ? '🏆' : '◎'}</div>
          <div className="result-score">{result.score}%</div>
          <div className="result-label">{result.passed ? 'Congratulations! You passed!' : 'Keep practicing!'}</div>
          <div className="result-stats">
            <span>{result.correct}/{result.total} correct</span>
            <span>·</span>
            <span>Passing score: {activeQuiz?.passingScore}%</span>
          </div>
          {result.certificate && (
            <div className="cert-earned">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="8" r="6"/><path d="M15.477 12.89L17 22l-5-3-5 3 1.523-9.11"/></svg>
              Certificate earned! ID: <strong>{result.certificate.credentialId}</strong>
            </div>
          )}
          <div className="result-answers">
            {result.results?.map((r, i) => (
              <div key={i} className={`answer-row ${r.isCorrect ? 'correct' : 'wrong'}`}>
                <span className="answer-num">Q{i+1}</span>
                <span>{r.isCorrect ? '✓ Correct' : `✗ Wrong — correct: ${String.fromCharCode(65 + r.correctIndex)}`}</span>
                {r.explanation && <span className="answer-explanation">· {r.explanation}</span>}
              </div>
            ))}
          </div>
          <button className="btn btn-outline" style={{ marginTop: 16 }} onClick={() => { setResult(null); setStarted(false); setActiveQuiz(null); }}>
            Back to Quizzes
          </button>
        </div>
      )}
    </div>
  );
}
