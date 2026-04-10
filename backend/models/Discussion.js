const mongoose = require('mongoose');

const replySchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  body: { type: String, required: true, maxlength: 2000 },
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isInstructor: { type: Boolean, default: false },
}, { timestamps: true });

const discussionSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  title: { type: String, required: true, maxlength: 200 },
  body: { type: String, required: true, maxlength: 3000 },
  lessonIndex: { type: Number, default: null },
  replies: [replySchema],
  upvotes: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  isPinned: { type: Boolean, default: false },
  isResolved: { type: Boolean, default: false },
  views: { type: Number, default: 0 },
  tags: [{ type: String }],
}, { timestamps: true });

module.exports = mongoose.model('Discussion', discussionSchema);
