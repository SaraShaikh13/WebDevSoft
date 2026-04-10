const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const morgan = require('morgan');
const dotenv = require('dotenv');

dotenv.config();
if (!process.env.MONGODB_URI) process.env.MONGODB_URI = 'mongodb://localhost:27017/webdevsoft';
if (!process.env.JWT_SECRET) process.env.JWT_SECRET = 'webdevsoft_default_secret_change_in_production';

const app = express();
app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(morgan('dev'));

// Core routes
app.use('/api/auth', require('./routes/auth'));
app.use('/api/courses', require('./routes/courses'));
app.use('/api/tutorials', require('./routes/tutorials'));
app.use('/api/blogs', require('./routes/blogs'));
app.use('/api/categories', require('./routes/categories'));
app.use('/api/admin', require('./routes/admin'));
app.use('/api/users', require('./routes/users'));

// New feature routes
app.use('/api/reviews', require('./routes/reviews'));
app.use('/api/quizzes', require('./routes/quizzes'));
app.use('/api/discussions', require('./routes/discussions'));
app.use('/api/wishlist', require('./routes/wishlist'));
app.use('/api/certificates', require('./routes/certificates'));

app.get('/api/health', (req, res) => res.json({ status: 'OK', message: 'WebDevSoft API Running' }));

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(err.status || 500).json({ success: false, message: err.message || 'Internal Server Error' });
});
app.use((req, res) => res.status(404).json({ success: false, message: 'Route not found' }));

mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ MongoDB Connected');
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
  })
  .catch(err => { console.error('❌ MongoDB error:', err.message); process.exit(1); });
