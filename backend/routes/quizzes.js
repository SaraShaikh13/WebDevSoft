const express = require('express');
const router = express.Router();
const { Quiz, QuizAttempt } = require('../models/Quiz');
const Certificate = require('../models/Certificate');
const User = require('../models/User');
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/quizzes/course/:courseId — get all quizzes for a course
router.get('/course/:courseId', protect, async (req, res) => {
  try {
    const quizzes = await Quiz.find({ course: req.params.courseId, isPublished: true }).select('-questions.correctIndex -questions.explanation');
    // Attach user attempts
    const attempts = await QuizAttempt.find({ user: req.user._id, quiz: { $in: quizzes.map(q => q._id) } }).sort('-createdAt');
    const attemptMap = {};
    attempts.forEach(a => { if (!attemptMap[a.quiz.toString()]) attemptMap[a.quiz.toString()] = a; });
    const result = quizzes.map(q => ({ ...q.toObject(), attempt: attemptMap[q._id.toString()] || null }));
    res.json({ success: true, quizzes: result });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/quizzes/:id — get quiz with answers (for taking)
router.get('/:id', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course', 'title');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });
    // Hide correct answers
    const safe = quiz.toObject();
    safe.questions = safe.questions.map(q => ({ ...q, correctIndex: undefined, explanation: undefined }));
    res.json({ success: true, quiz: safe });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/quizzes/:id/submit
router.post('/:id/submit', protect, async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id).populate('course');
    if (!quiz) return res.status(404).json({ success: false, message: 'Quiz not found.' });

    const { answers, timeTaken } = req.body;
    let correct = 0;
    const results = quiz.questions.map((q, i) => {
      const isCorrect = answers[i] === q.correctIndex;
      if (isCorrect) correct++;
      return { isCorrect, correctIndex: q.correctIndex, explanation: q.explanation, selected: answers[i] };
    });

    const score = Math.round((correct / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;

    const attempt = await QuizAttempt.create({
      quiz: quiz._id, user: req.user._id,
      answers, score, passed, timeTaken: timeTaken || 0,
    });

    // Check if all quizzes passed → issue certificate
    let certificate = null;
    if (passed) {
      const allQuizzes = await Quiz.find({ course: quiz.course._id, isPublished: true });
      const allAttempts = await QuizAttempt.find({ user: req.user._id, quiz: { $in: allQuizzes.map(q => q._id) }, passed: true });
      const passedIds = new Set(allAttempts.map(a => a.quiz.toString()));
      const allPassed = allQuizzes.every(q => passedIds.has(q._id.toString()));

      // Check lesson progress
      const user = await User.findById(req.user._id);
      const enrolled = user.enrolledCourses.map(id => id.toString()).includes(quiz.course._id.toString());

      if (allPassed && enrolled) {
        try {
          certificate = await Certificate.findOneAndUpdate(
            { user: req.user._id, course: quiz.course._id },
            { user: req.user._id, course: quiz.course._id },
            { upsert: true, new: true }
          ).populate('course', 'title instructor');
        } catch (e) { /* already exists */ }
      }
    }

    res.json({ success: true, score, passed, correct, total: quiz.questions.length, results, attempt, certificate });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// Admin: POST /api/quizzes — create quiz
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.create(req.body);
    res.status(201).json({ success: true, quiz });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// Admin: PUT /api/quizzes/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const quiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, quiz });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// Admin: DELETE /api/quizzes/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Quiz.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Quiz deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
