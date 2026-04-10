const mongoose = require('mongoose');

// ─── Tutorial ────────────────────────────────────────────────────────────────
const tutorialSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 300 },
    thumbnail: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String }],
    difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
    readTime: { type: Number, default: 5 },
    views: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    codeSnippets: [{ language: String, code: String, description: String }],
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

tutorialSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

// ─── Blog ─────────────────────────────────────────────────────────────────────
const blogSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    content: { type: String, required: true },
    excerpt: { type: String, maxlength: 400 },
    thumbnail: { type: String, default: '' },
    author: { type: String, required: true },
    authorAvatar: { type: String, default: '' },
    category: { type: mongoose.Schema.Types.ObjectId, ref: 'Category', required: true },
    tags: [{ type: String }],
    readTime: { type: Number, default: 5 },
    views: { type: Number, default: 0 },
    likes: { type: Number, default: 0 },
    isPublished: { type: Boolean, default: false },
    isFeatured: { type: Boolean, default: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

blogSchema.pre('save', function (next) {
  if (this.isModified('title')) {
    this.slug = this.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now();
  }
  next();
});

// ─── Category ─────────────────────────────────────────────────────────────────
const categorySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true, lowercase: true },
    description: { type: String, default: '' },
    icon: { type: String, default: '📚' },
    color: { type: String, default: '#4F46E5' },
    type: { type: String, enum: ['course', 'tutorial', 'blog', 'all'], default: 'all' },
    courseCount: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = this.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
  }
  next();
});

module.exports = {
  Tutorial: mongoose.model('Tutorial', tutorialSchema),
  Blog: mongoose.model('Blog', blogSchema),
  Category: mongoose.model('Category', categorySchema),
};
