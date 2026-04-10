const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  course: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  title: { type: String, trim: true, maxlength: 100 },
  body: { type: String, required: true, maxlength: 1000 },
  helpful: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

reviewSchema.index({ course: 1, user: 1 }, { unique: true });

// Update course rating after save
reviewSchema.post('save', async function () {
  const Course = mongoose.model('Course');
  const stats = await mongoose.model('Review').aggregate([
    { $match: { course: this.course } },
    { $group: { _id: '$course', avg: { $avg: '$rating' }, count: { $sum: 1 } } }
  ]);
  if (stats.length > 0) {
    await Course.findByIdAndUpdate(this.course, {
      rating: Math.round(stats[0].avg * 10) / 10,
      reviewCount: stats[0].count,
    });
  }
});

module.exports = mongoose.model('Review', reviewSchema);
