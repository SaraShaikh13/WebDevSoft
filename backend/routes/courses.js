const express = require('express');
const router = express.Router();
const Course = require('../models/Course');
const { protect, adminOnly } = require('../middleware/auth');

// GET /api/courses — list all published
router.get('/', async (req, res) => {
  try {
    const { category, level, search, page = 1, limit = 12, sort = '-createdAt' } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (level) filter.level = level;
    if (search) filter.$or = [{ title: { $regex: search, $options: 'i' } }, { tags: { $in: [new RegExp(search, 'i')] } }];

    const total = await Course.countDocuments(filter);
    const courses = await Course.find(filter)
      .populate('category', 'name slug icon color')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, courses, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/featured
router.get('/featured', async (req, res) => {
  try {
    const courses = await Course.find({ isPublished: true }).populate('category', 'name slug icon color').sort('-enrolledCount').limit(6);
    res.json({ success: true, courses });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// GET /api/courses/:slug
router.get('/:slug', async (req, res) => {
  try {
    const course = await Course.findOne({ slug: req.params.slug, isPublished: true }).populate('category', 'name slug icon');
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });
    res.json({ success: true, course });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// POST /api/courses/:id/enroll
router.post('/:id/enroll', protect, async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) return res.status(404).json({ success: false, message: 'Course not found.' });

    const User = require('../models/User');
    const user = await User.findById(req.user._id);
    if (user.enrolledCourses.includes(course._id)) {
      return res.status(400).json({ success: false, message: 'Already enrolled.' });
    }
    user.enrolledCourses.push(course._id);
    course.enrolledCount += 1;
    await Promise.all([user.save({ validateBeforeSave: false }), course.save()]);
    res.json({ success: true, message: 'Enrolled successfully!' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// Admin: POST /api/courses
router.post('/', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: PUT /api/courses/:id
router.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const course = await Course.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ success: true, course });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

// Admin: DELETE /api/courses/:id
router.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Course.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Course deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = router;
