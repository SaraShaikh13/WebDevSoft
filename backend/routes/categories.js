// routes/categories.js
const express = require('express');
const catRouter = express.Router();
const { Category } = require('../models/Content');
const { protect, adminOnly } = require('../middleware/auth');

catRouter.get('/', async (req, res) => {
  try {
    const categories = await Category.find({ isActive: true }).sort('name');
    res.json({ success: true, categories });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

catRouter.post('/', protect, adminOnly, async (req, res) => {
  try {
    const cat = await Category.create(req.body);
    res.status(201).json({ success: true, category: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

catRouter.put('/:id', protect, adminOnly, async (req, res) => {
  try {
    const cat = await Category.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json({ success: true, category: cat });
  } catch (err) {
    res.status(400).json({ success: false, message: err.message });
  }
});

catRouter.delete('/:id', protect, adminOnly, async (req, res) => {
  try {
    await Category.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Category deleted.' });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

module.exports = catRouter;
