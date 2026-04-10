const express = require('express');
const router = express.Router();
const User = require('../models/User');
const { protect } = require('../middleware/auth');

// GET /api/wishlist
router.get('/', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate({
      path: 'wishlist',
      populate: { path: 'category', select: 'name icon color' }
    });
    res.json({ success: true, wishlist: user.wishlist || [] });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// POST /api/wishlist/:courseId — toggle
router.post('/:courseId', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id);
    const idx = user.wishlist.findIndex(id => id.toString() === req.params.courseId);
    let added;
    if (idx === -1) { user.wishlist.push(req.params.courseId); added = true; }
    else { user.wishlist.splice(idx, 1); added = false; }
    await user.save({ validateBeforeSave: false });
    res.json({ success: true, added, wishlistCount: user.wishlist.length });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
