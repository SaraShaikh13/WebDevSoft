const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');

// GET /api/users/dashboard — user's enrolled courses & progress
router.get('/dashboard', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'enrolledCourses',
      select: 'title slug thumbnail level duration lessons category',
      populate: { path: 'category', select: 'name icon' },
    });
    res.json({ success: true, user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/users/complete-lesson
router.post('/complete-lesson', protect, async (req, res) => {
  try {
    const { lessonId } = req.body;
    const user = await User.findById(req.user._id);
    if (!user.completedLessons.includes(lessonId)) {
      user.completedLessons.push(lessonId);
      await user.save({ validateBeforeSave: false });
    }
    res.json({ success: true, completedLessons: user.completedLessons });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
