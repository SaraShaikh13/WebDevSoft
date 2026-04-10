const mongoose = require('mongoose');

const lessonSchema = new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  videoUrl: { type: String, default: '' },
  duration: { type: Number, default: 0 }, // minutes
  order: { type: Number, required: true },
  isPreview: { type: Boolean, default: false },
});

const courseSchema = new mongoose.Schema(
  {
    title: { type: String, required: [true, 'Course title is required'], trim: true, maxlength: 120 },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, required: [true, 'Description is required'] },
    shortDescription: { type: String, maxlength: 300 },
    thumbnail: { type: String, default: '' },
    instructor: { type: String, required: true },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    price: { type: Number, default: 0 },
    isFree: { type: Boolean, default: true },
    tags: [{ type: String }],
    lessons: [lessonSchema],
    duration: { type: Number, default: 0 }, // total hours
    enrolledCount: { type: Number, default: 0 },
    rating: { type: Number, default: 0, min: 0, max: 5 },
    reviewCount: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    language: { type: String, default: 'English' },
    requirements: [{ type: String }],
    outcomes: [{ type: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

courseSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

module.exports = mongoose.model('Course', courseSchema);
