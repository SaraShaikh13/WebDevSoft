const express = require('express');
const router = express.Router();
const Certificate = require('../models/Certificate');
const { protect } = require('../middleware/auth');

// GET /api/certificates/my — user's certificates
router.get('/my', protect, async (req, res) => {
  try {
    const certs = await Certificate.find({ user: req.user._id })
      .populate('course', 'title instructor duration thumbnail category')
      .populate('user', 'name email')
      .sort('-issuedAt');
    res.json({ success: true, certificates: certs });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

// GET /api/certificates/verify/:credentialId — public verify
router.get('/verify/:credentialId', async (req, res) => {
  try {
    const cert = await Certificate.findOne({ credentialId: req.params.credentialId })
      .populate('course', 'title instructor duration')
      .populate('user', 'name');
    if (!cert) return res.status(404).json({ success: false, message: 'Certificate not found or invalid.' });
    res.json({ success: true, certificate: cert, valid: true });
  } catch (err) { res.status(500).json({ success: false, message: err.message }); }
});

module.exports = router;
