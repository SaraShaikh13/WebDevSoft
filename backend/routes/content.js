const express = require('express');
const tutRouter = express.Router();
const blogRouter = express.Router();
const { Tutorial, Blog } = require('../models/Content');
const { protect, adminOnly } = require('../middleware/auth');

// ─── TUTORIALS ────────────────────────────────────────────────────────────────
tutRouter.get('/', async (req, res) => {
  try {
    const { category, difficulty, search, page = 1, limit = 9 } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (difficulty) filter.difficulty = difficulty;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Tutorial.countDocuments(filter);
    const tutorials = await Tutorial.find(filter)
      .populate('category', 'name slug icon color')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, tutorials, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

tutRouter.get('/:slug', async (req, res) => {
  try {
    const tutorial = await Tutorial.findOne({ slug: req.params.slug, isPublished: true }).populate('category', 'name slug');
    if (!tutorial) return res.status(404).json({ success: false, message: 'Tutorial not found.' });
    tutorial.views += 1;
    await tutorial.save();
    res.json({ success: true, tutorial });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

tutRouter.post('/', protect, adminOnly, async (req, res) => {
  try {
    const tut = await Tutorial.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, tutorial: tut });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

tutRouter.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const tut = await Tutorial.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, tutorial: tut });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

tutRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Tutorial.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Tutorial deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

// ─── BLOGS ────────────────────────────────────────────────────────────────────
blogRouter.get('/', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 9, featured } = req.query;
    const filter = { isPublished: true };
    if (category) filter.category = category;
    if (featured) filter.isFeatured = true;
    if (search) filter.title = { $regex: search, $options: 'i' };

    const total = await Blog.countDocuments(filter);
    const blogs = await Blog.find(filter)
      .populate('category', 'name slug icon color')
      .sort('-createdAt')
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ success: true, blogs, total, pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

blogRouter.get('/:slug', async (req, res) => {
  try {
    const blog = await Blog.findOne({ slug: req.params.slug, isPublished: true }).populate('category', 'name slug');
    if (!blog) return res.status(404).json({ success: false, message: 'Blog not found.' });
    blog.views += 1;
    await blog.save();
    res.json({ success: true, blog });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

blogRouter.post('/', protect, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.create({ ...req.body, createdBy: req.user._id });
    res.status(201).json({ success: true, blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

blogRouter.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const blog = await Blog.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, blog });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

blogRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Blog.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Blog deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = { tutRouter, blogRouter };
