const mongoose = require('mongoose');
const crypto = require('crypto');

const certificateSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  credentialId: { type: String, unique: true },
  issuedAt: { type: Date, default: Date.now },
  completionDate: { type: Date, default: Date.now },
}, { timestamps: true });

certificateSchema.index({ user: 1, course: 1 }, { unique: true });

certificateSchema.pre('save', function (next) {
  if (!this.credentialId) {
    this.credentialId = 'WDS-' + crypto.randomBytes(6).toString('hex').toUpperCase();
  }
  next();
});

module.exports = mongoose.model('Certificate', certificateSchema);
