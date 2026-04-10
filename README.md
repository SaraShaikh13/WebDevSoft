# ⌨ WebDevSoft — Online Learning Platform

A full-stack coding education platform built with the MERN stack (MongoDB, Express, React, Node.js). Features courses, tutorials, blogs, user authentication, and a complete admin dashboard.

---

## 📁 Project Structure

```
webdevsoft/
├── backend/                  # Node.js + Express API
│   ├── models/
│   │   ├── User.js           # User model
│   │   ├── Course.js         # Course + Lesson models
│   │   └── Content.js        # Tutorial, Blog, Category models
│   ├── routes/
│   │   ├── auth.js           # Register, Login, Profile
│   │   ├── courses.js        # Course CRUD + Enrollment
│   │   ├── tutorials.js      # Tutorial CRUD
│   │   ├── blogs.js          # Blog CRUD
│   │   ├── categories.js     # Category management
│   │   ├── admin.js          # Admin stats + user management
│   │   └── users.js          # User dashboard data
│   ├── middleware/
│   │   └── auth.js           # JWT protect + adminOnly guards
│   ├── server.js             # Express app entry point
│   ├── seed.js               # Database seeder with sample data
│   ├── .env.example          # Environment variables template
│   └── package.json
│
└── frontend/                 # React.js App
    └── src/
        ├── context/
        │   └── AuthContext.jsx   # Auth state + API instance
        ├── components/
        │   ├── Navbar.jsx        # Responsive navigation
        │   ├── Footer.jsx        # Footer with links
        │   └── CourseCard.jsx    # Reusable course card
        ├── pages/
        │   ├── Home.jsx          # Landing page with hero + features
        │   ├── Courses.jsx       # Course listing with filters
        │   ├── CourseDetail.jsx  # Full course page + enrollment
        │   ├── Tutorials.jsx     # Tutorial listing
        │   ├── TutorialDetail.jsx
        │   ├── Blogs.jsx         # Blog listing
        │   ├── BlogDetail.jsx
        │   ├── Login.jsx         # Auth forms
        │   ├── Register.jsx
        │   ├── Dashboard.jsx     # User dashboard + progress
        │   ├── AdminDashboard.jsx # Admin overview + stats
        │   ├── AdminCourses.jsx  # Course CRUD management
        │   ├── AdminBlogs.jsx    # Blog CRUD management
        │   ├── AdminUsers.jsx    # User management
        │   └── NotFound.jsx
        ├── App.jsx               # Router + route guards
        └── index.css             # Global design system
```

---

## 🚀 Quick Start

### Prerequisites
- Node.js v18+
- MongoDB (local or MongoDB Atlas)
- Git

### 1. Clone & Install

```bash
git clone https://github.com/yourusername/webdevsoft.git
cd webdevsoft

# Install backend dependencies
cd backend && npm install

# Install frontend dependencies
cd ../frontend && npm install
```

### 2. Configure Environment

```bash
cd backend
cp .env.example .env
```

Edit `.env`:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/webdevsoft
JWT_SECRET=your_super_secret_jwt_key_change_this
JWT_EXPIRE=7d
NODE_ENV=development
```

### 3. Seed the Database

```bash
cd backend
node seed.js
```

This creates:
- ✅ 6 categories
- ✅ 4 published courses with lessons
- ✅ 3 tutorials with code snippets
- ✅ 3 blog posts
- ✅ Admin user: `admin@webdevsoft.com` / `admin123`
- ✅ Regular user: `user@webdevsoft.com` / `user123`

### 4. Run the App

**Terminal 1 — Backend:**
```bash
cd backend
npm run dev      # Uses nodemon for hot reload
```

**Terminal 2 — Frontend:**
```bash
cd frontend
npm start        # Starts on http://localhost:3000
```

Visit `http://localhost:3000` 🎉

---

## 🔐 Authentication

| Role  | Access |
|-------|--------|
| Guest | Browse courses, tutorials, blogs |
| User  | Enroll in courses, track progress, profile |
| Admin | Full CRUD for courses, blogs, user management |

**JWT Flow:**
1. User logs in → server returns JWT token
2. Token stored in `localStorage`
3. Sent as `Authorization: Bearer <token>` header on all protected requests
4. `protect` middleware verifies token on every protected route
5. `adminOnly` middleware checks `user.role === 'admin'`

---

## 📡 API Endpoints

### Auth
| Method | Endpoint | Access |
|--------|----------|--------|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |
| GET | `/api/auth/me` | Private |
| PUT | `/api/auth/update-profile` | Private |
| PUT | `/api/auth/change-password` | Private |

### Courses
| Method | Endpoint | Access |
|--------|----------|--------|
| GET | `/api/courses` | Public |
| GET | `/api/courses/featured` | Public |
| GET | `/api/courses/:slug` | Public |
| POST | `/api/courses/:id/enroll` | Private |
| POST | `/api/courses` | Admin |
| PUT | `/api/courses/:id` | Admin |
| DELETE | `/api/courses/:id` | Admin |

### Tutorials & Blogs
Similar CRUD pattern — GET routes are public, POST/PUT/DELETE require admin.

### Admin
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/admin/stats` | Dashboard stats |
| GET | `/api/admin/users` | All users |
| PUT | `/api/admin/users/:id` | Update user role/status |
| GET | `/api/admin/all-courses` | All courses (incl. unpublished) |

---

## 🎨 Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 18, React Router v6, Axios |
| Styling | Pure CSS with CSS Variables (dark theme) |
| Backend | Node.js, Express.js |
| Database | MongoDB with Mongoose ODM |
| Auth | JWT (jsonwebtoken) + bcryptjs |
| Validation | express-validator |
| Dev Tools | nodemon, morgan |

---

## 🌍 Deployment

### Backend (Railway / Render / Heroku)
1. Set environment variables on your platform
2. Use MongoDB Atlas for the cloud database
3. Deploy the `backend/` directory

### Frontend (Vercel / Netlify)
1. Update the API base URL in `AuthContext.jsx`
2. Deploy the `frontend/` directory
3. Set `REACT_APP_API_URL` if needed

### MongoDB Atlas Setup
1. Create a free cluster at [cloud.mongodb.com](https://cloud.mongodb.com)
2. Get your connection string
3. Replace `MONGODB_URI` in `.env`

---

## 🔧 Extending the Platform

### Add a New Course Lesson
Admin panel → Manage Courses → Edit course → Add lessons via the modal form.

### Create Categories
Use the `/api/categories` endpoint (admin) to create new learning categories.

### Add Features
- 💬 Comments/Reviews system
- 🔔 Email notifications (Nodemailer)
- 💳 Payments (Stripe)
- 📊 Advanced analytics
- 🔍 Full-text search (MongoDB Atlas Search)
- 📱 React Native mobile app

---

## 📝 License

MIT License — free to use and modify for personal and commercial projects.

---

Built with ❤ by the SARA · [Live Demo](#) · [Report Bug](#)
