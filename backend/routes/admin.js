const express = require('express');
const router = express.Router();
const { protect, adminOnly } = require('../middleware/auth');
const User = require('../models/User');
const Course = require('../models/Course');
const { Tutorial, Blog, Category } = require('../models/Content');

// GET /api/admin/stats
router.get('/stats', protect, adminOnly, async (req, res) => {
  try {
    const [users, courses, tutorials, blogs, categories] = await Promise.all([
      User.countDocuments(),
      Course.countDocuments(),
      Tutorial.countDocuments(),
      Blog.countDocuments(),
      Category.countDocuments(),
    ]);
    const publishedCourses = await Course.countDocuments({ isPublished: true });
    const recentUsers = await User.find().sort('-createdAt').limit(5).select('name email createdAt role');
    const popularCourses = await Course.find({ isPublished: true }).sort('-enrolledCount').limit(5).populate('category', 'name');
    res.json({ success: true, stats: { users, courses, tutorials, blogs, categories, publishedCourses }, recentUsers, popularCourses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/admin/users
router.get('/users', protect, adminOnly, async (req, res) => {
  try {
    const { page = 1, limit = 20, search } = req.query;
    const filter = {};
    if (search) filter.$or = [{ name: { $regex: search, $options: 'i' } }, { email: { $regex: search, $options: 'i' } }];
    const total = await User.countDocuments(filter);
    const users = await User.find(filter).sort('-createdAt').skip((page - 1) * limit).limit(Number(limit));
    res.json({ success: true, users, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// PUT /api/admin/users/:id
router.put('/users/:id', protect, adminOnly, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, user });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// GET /api/admin/all-courses
router.get('/all-courses', protect, adminOnly, async (req, res) => {
  try {
    const courses = await Course.find().populate('category', 'name').sort('-createdAt');
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
