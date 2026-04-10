const express = require('express');
const router = express.Router();
const Discussion = require('../models/Discussion');
const { protect } = require('../middleware/auth');

// GET /api/discussions/course/:courseId
router.get('/course/:courseId', async (req, res) => {
  try {
    const { page = 1, limit = 15, sort = '-createdAt', tag } = req.query;
    const filter = { course: req.params.courseId };
    if (tag) filter.tags = tag;
    const total = await Discussion.countDocuments(filter);
    const discussions = await Discussion.find(filter)
      .populate('user', 'name avatar role')
      .populate('replies.user', 'name avatar role')
      .sort(sort)
      .skip((page - 1) * limit)
      .limit(Number(limit));
    res.json({ success: true, discussions, total, pages: Math.ceil(total / limit) });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/discussions/course/:courseId
router.post('/course/:courseId', protect, async (req, res) => {
  try {
    const disc = await Discussion.create({
      course: req.params.courseId,
      user: req.user._id,
      title: req.body.title,
      body: req.body.body,
      lessonIndex: req.body.lessonIndex || null,
      tags: req.body.tags || [],
    });
    await disc.populate('user', 'name avatar role');
    res.status(201).json({ success: true, discussion: disc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// POST /api/discussions/:id/reply
router.post('/:id/reply', protect, async (req, res) => {
  try {
    const disc = await Discussion.findById(req.params.id);
    if (!disc) return res.status(404).json({ success: false, message: 'Not found.' });
    disc.replies.push({ user: req.user._id, body: req.body.body, isInstructor: req.user.role === 'admin' });
    await disc.save();
    await disc.populate('user', 'name avatar role');
    await disc.populate('replies.user', 'name avatar role');
    res.json({ success: true, discussion: disc });
  } catch (err) { res.status(400).json({ success: false, message: err.message }); }
});

// PUT /api/discussions/:id/upvote
router.put('/:id/upvote', protect, async (req, res) => {
  try {
    const disc = await Discussion.findById(req.params.id);
    if (!disc) return res.status(404).json({ success: false, message: 'Not found.' });
    const idx = disc.upvotes.indexOf(req.user._id);
    if (idx === -1) disc.upvotes.push(req.user._id);
    else disc.upvotes.splice(idx, 1);
    await disc.save();
    res.json({ success: true, upvotes: disc.upvotes.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// PUT /api/discussions/:id/resolve
router.put('/:id/resolve', protect, async (req, res) => {
  try {
    const disc = await Discussion.findById(req.params.id);
    if (!disc) return res.status(404).json({ success: false, message: 'Not found.' });
    if (disc.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    disc.isResolved = !disc.isResolved;
    await disc.save();
    res.json({ success: true, isResolved: disc.isResolved });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// DELETE /api/discussions/:id
router.delete('/:id', protect, async (req, res) => {
  try {
    const disc = await Discussion.findById(req.params.id);
    if (!disc) return res.status(404).json({ success: false, message: 'Not found.' });
    if (disc.user.toString() !== req.user._id.toString() && req.user.role !== 'admin')
      return res.status(403).json({ success: false, message: 'Not authorized.' });
    await disc.deleteOne();
    res.json({ success: true, message: 'Deleted.' });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
