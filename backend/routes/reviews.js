const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const { protect } = require('../middleware/auth');

// GET /api/reviews/course/:courseId
router.get('/course/:courseId', async (req, res) => {
  try {
    const { page = 1, limit = 10, sort = '-createdAt' } = req.query;
    const reviews = await Review.find({ course: req.params.courseId })
      .populate('user', 'name avatar')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    const total = await Review.countDocuments({ course: req.params.courseId });

    // Rating distribution
    const dist = await Review.aggregate([
      { $match: { course: require('mongoose').Types.ObjectId(req.params.courseId) } },
      { $group: { _id: '$rating', count: { $sum: 1 } } },
      { $sort: { _id: -1 } }
    ]);

    res.json({ success: true, reviews, total, pages: Math.ceil(total / limit), distribution: dist });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/reviews/course/:courseId
router.post('/course/:courseId', protect, async (req, res) => {
  try {
    const existing = await Review.findOne({ course: req.params.courseId, user: req.user._id });
    if (existing) return res.status(400).json({ success: false, message: 'You already reviewed this course.' });

    const review = await Review.create({
      course: req.params.courseId,
      user: req.user._id,
      rating: req.body.rating,
      title: req.body.title,
      body: req.body.body,
    });
    await review.populate('user', 'name avatar');
    res.status(201).json({ success: true, review });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT /api/reviews/:id/helpful
router.put('/:id/helpful', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
    const idx = review.helpful.indexOf(req.user._id);
    if (idx === -1) review.helpful.push(req.user._id);
    else review.helpful.splice(idx, 1);
    await review.save();
    res.json({ success: true, helpfulCount: review.helpful.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/reviews/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);
    if (!review) return res.status(404).json({ success: false, message: 'Not found.' });
    if (review.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    await review.deleteOne();
    res.json({ success: true, message: 'Review deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
