const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  text: { type: String, required: true },
  options: [{ type: String, required: true }],
  correctIndex: { type: Number, required: true },
  explanation: { type: String, default: '' },
});

const quizSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  lessonIndex: { type: Number, default: null }, // null = end-of-course quiz
  title: { type: String, required: true },
  description: { type: String, default: '' },
  questions: [questionSchema],
  passingScore: { type: Number, default: 70 }, // percentage
  timeLimit: { type: Number, default: 0 }, // minutes, 0 = unlimited
  isPublished: { type: Boolean, default: true },
}, { timestamps: true });

const quizAttemptSchema = new mongoose.Schema({
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [{ type: Number }], // selected option indices
  score: { type: Number, required: true }, // percentage
  passed: { type: Boolean, required: true },
  timeTaken: { type: Number, default: 0 }, // seconds
}, { timestamps: true });

module.exports = {
  Quiz: mongoose.model('Quiz', quizSchema),
  QuizAttempt: mongoose.model('QuizAttempt', quizAttemptSchema),
};
