const mongoose = require('mongoose');
const dotenv = require('dotenv');
dotenv.config();

// Fallback if .env not configured
if (!process.env.MONGODB_URI) {
  process.env.MONGODB_URI = 'mongodb://localhost:27017/webdevsoft';
  console.log('⚠  No MONGODB_URI in .env — using default: mongodb://localhost:27017/webdevsoft');
}

const User = require('./models/User');
const Course = require('./models/Course');
const { Tutorial, Blog, Category } = require('./models/Content');

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}), Course.deleteMany({}),
      Tutorial.deleteMany({}), Blog.deleteMany({}), Category.deleteMany({})
    ]);
    console.log('🗑  Cleared existing data');

    // Categories
    const categories = await Category.insertMany([
      { name: 'JavaScript', slug: 'javascript', icon: '⚡', color: '#f7df1e', description: 'JS fundamentals & advanced topics' },
      { name: 'React.js', slug: 'reactjs', icon: '⚛', color: '#61dafb', description: 'Component-based UI development' },
      { name: 'Node.js', slug: 'nodejs', icon: '🟢', color: '#68a063', description: 'Server-side JavaScript' },
      { name: 'CSS & Design', slug: 'css-design', icon: '🎨', color: '#264de4', description: 'Styling and UI/UX fundamentals' },
      { name: 'Database', slug: 'database', icon: '🗄', color: '#4db33d', description: 'MongoDB, MySQL and more' },
      { name: 'DevOps', slug: 'devops', icon: '🔧', color: '#ff6b6b', description: 'Deployment, CI/CD, cloud' },
    ]);
    console.log(`✅ Seeded ${categories.length} categories`);

    // Admin User
    const admin = await User.create({
      name: 'Admin User', email: 'admin@webdevsoft.com',
      password: 'admin123', role: 'admin',
    });
    const regularUser = await User.create({
      name: 'John Student', email: 'user@webdevsoft.com',
      password: 'user123', role: 'user',
      bio: 'Learning web development one day at a time.',
    });
    console.log('✅ Seeded 2 users (admin + user)');

    // Courses
    const courses = await Course.insertMany([
      {
        title: 'Complete JavaScript Mastery', slug: 'complete-javascript-mastery-' + Date.now(),
        description: 'Master JavaScript from scratch — variables, functions, DOM, async/await, ES6+, and real-world projects. This comprehensive course takes you from zero to job-ready.',
        shortDescription: 'Go from zero to JS hero with this complete beginner-to-advanced course.',
        instructor: 'Sarah Johnson', category: categories[0]._id, level: 'Beginner',
        isFree: true, isPublished: true, duration: 42, enrolledCount: 1240, rating: 4.8, reviewCount: 384,
        tags: ['javascript', 'es6', 'dom', 'async'],
        requirements: ['Basic computer skills', 'No prior coding needed'],
        outcomes: ['Write clean JavaScript code', 'Understand ES6+ features', 'Build interactive web apps', 'Handle async operations'],
        lessons: [
          { title: 'Introduction to JavaScript', content: 'What is JS, history, and why learn it.', order: 1, isPreview: true, duration: 12 },
          { title: 'Variables & Data Types', content: 'let, const, var — types: string, number, boolean, object.', order: 2, isPreview: true, duration: 20 },
          { title: 'Functions & Scope', content: 'Function declarations, expressions, arrow functions, closures.', order: 3, duration: 25 },
          { title: 'DOM Manipulation', content: 'Selecting, modifying and creating HTML elements with JS.', order: 4, duration: 30 },
          { title: 'Async JavaScript', content: 'Promises, async/await, fetch API and error handling.', order: 5, duration: 35 },
        ],
        createdBy: admin._id,
      },
      {
        title: 'React.js for Beginners', slug: 'react-js-beginners-' + Date.now(),
        description: 'Learn React.js from scratch. Build real-world projects with hooks, state management, React Router and more. Perfect for JavaScript developers ready to learn the #1 frontend framework.',
        shortDescription: 'Build modern UIs with React hooks, context, and routing.',
        instructor: 'Mike Chen', category: categories[1]._id, level: 'Intermediate',
        isFree: false, price: 49, isPublished: true, duration: 28, enrolledCount: 876, rating: 4.9, reviewCount: 210,
        tags: ['react', 'hooks', 'jsx', 'frontend'],
        requirements: ['JavaScript fundamentals', 'Basic HTML & CSS', 'ES6+ knowledge'],
        outcomes: ['Build React apps from scratch', 'Master React hooks', 'Implement routing', 'Manage global state'],
        lessons: [
          { title: 'What is React?', content: 'React overview, virtual DOM, JSX syntax.', order: 1, isPreview: true, duration: 15 },
          { title: 'Components & Props', content: 'Functional components, props passing, children.', order: 2, duration: 22 },
          { title: 'State with useState', content: 'Managing state, re-renders, controlled inputs.', order: 3, duration: 28 },
          { title: 'Side Effects with useEffect', content: 'Data fetching, cleanup, dependency array.', order: 4, duration: 25 },
          { title: 'React Router', content: 'Client-side routing, nested routes, params.', order: 5, duration: 20 },
        ],
        createdBy: admin._id,
      },
      {
        title: 'Node.js & Express API Development', slug: 'nodejs-express-api-' + Date.now(),
        description: 'Build scalable REST APIs with Node.js, Express, and MongoDB. Learn authentication, middleware, error handling, and deploy your backend to the cloud.',
        shortDescription: 'Build production REST APIs with Node.js, Express & MongoDB.',
        instructor: 'Emily Rodriguez', category: categories[2]._id, level: 'Intermediate',
        isFree: false, price: 59, isPublished: true, duration: 35, enrolledCount: 654, rating: 4.7, reviewCount: 178,
        tags: ['nodejs', 'express', 'api', 'backend', 'mongodb'],
        requirements: ['JavaScript knowledge', 'Basic understanding of HTTP', 'Command line basics'],
        outcomes: ['Build REST APIs', 'Implement JWT auth', 'Connect to MongoDB', 'Deploy to cloud'],
        lessons: [
          { title: 'Node.js Fundamentals', content: 'Modules, npm, file system, event loop.', order: 1, isPreview: true, duration: 20 },
          { title: 'Express.js Setup', content: 'Routes, middleware, request/response lifecycle.', order: 2, duration: 25 },
          { title: 'MongoDB with Mongoose', content: 'Schema, models, CRUD operations, validation.', order: 3, duration: 30 },
          { title: 'Authentication with JWT', content: 'Register/login flow, tokens, protected routes.', order: 4, duration: 35 },
          { title: 'Error Handling & Deployment', content: 'Global error handler, 404 handling, deploy to Heroku/Render.', order: 5, duration: 25 },
        ],
        createdBy: admin._id,
      },
      {
        title: 'Modern CSS & Tailwind Mastery', slug: 'modern-css-tailwind-' + Date.now(),
        description: 'Master modern CSS including Flexbox, Grid, animations, and utility-first styling with Tailwind CSS. Build beautiful, responsive designs with confidence.',
        shortDescription: 'CSS Flexbox, Grid, animations, and Tailwind CSS from scratch.',
        instructor: 'Alex Thompson', category: categories[3]._id, level: 'Beginner',
        isFree: true, isPublished: true, duration: 20, enrolledCount: 2100, rating: 4.6, reviewCount: 420,
        tags: ['css', 'tailwind', 'flexbox', 'grid', 'responsive'],
        requirements: ['Basic HTML knowledge'],
        outcomes: ['Build responsive layouts', 'Master Flexbox & Grid', 'Create CSS animations', 'Use Tailwind CSS'],
        lessons: [
          { title: 'CSS Fundamentals Refresher', content: 'Box model, selectors, specificity, cascade.', order: 1, isPreview: true, duration: 18 },
          { title: 'Flexbox Deep Dive', content: 'Flex container, items, alignment, real layouts.', order: 2, duration: 22 },
          { title: 'CSS Grid', content: 'Grid container, rows, columns, template areas.', order: 3, duration: 25 },
          { title: 'Tailwind CSS Basics', content: 'Utility classes, responsive prefixes, customization.', order: 4, duration: 20 },
        ],
        createdBy: admin._id,
      },
    ]);
    console.log(`✅ Seeded ${courses.length} courses`);

    // Enroll user in first course
    regularUser.enrolledCourses.push(courses[0]._id);
    await regularUser.save({ validateBeforeSave: false });

    // Tutorials
    await Tutorial.insertMany([
      {
        title: 'Understanding JavaScript Closures', slug: 'understanding-javascript-closures-' + Date.now(),
        content: 'A closure is a function that retains access to its outer scope even after the outer function has returned.\n\nClosures are created every time a function is created in JavaScript. They are commonly used for data encapsulation, factory functions, and callbacks.\n\nExample use case: counter functions, module patterns, and event handlers all leverage closures.\n\nThe inner function "closes over" the variables in the outer scope, keeping them alive in memory.',
        excerpt: 'Understand one of JavaScript\'s most powerful and misunderstood features with clear examples.',
        category: categories[0]._id, difficulty: 'Intermediate', readTime: 8,
        isPublished: true, views: 1240,
        codeSnippets: [{ language: 'javascript', code: 'function counter() {\n  let count = 0;\n  return () => ++count;\n}\nconst inc = counter();\nconsole.log(inc()); // 1\nconsole.log(inc()); // 2', description: 'Basic closure example' }],
        tags: ['javascript', 'closures', 'scope'], createdBy: admin._id,
      },
      {
        title: 'React useEffect Hook Complete Guide', slug: 'react-useeffect-complete-guide-' + Date.now(),
        content: 'The useEffect hook lets you perform side effects in function components.\n\nSide effects include: data fetching, subscriptions, manually changing the DOM, and timers.\n\nThe dependency array controls when the effect runs. An empty array [] means "run once on mount". Returning a cleanup function prevents memory leaks.\n\nCommon patterns: fetch on mount, listen to state changes, cleanup timers and subscriptions.',
        excerpt: 'Master the useEffect hook with real-world patterns and avoid common pitfalls.',
        category: categories[1]._id, difficulty: 'Intermediate', readTime: 10,
        isPublished: true, views: 980,
        codeSnippets: [{ language: 'jsx', code: 'useEffect(() => {\n  fetchData(userId);\n  return () => cleanup();\n}, [userId]);', description: 'useEffect with cleanup' }],
        tags: ['react', 'hooks', 'useeffect'], createdBy: admin._id,
      },
      {
        title: 'Building REST APIs with Express', slug: 'building-rest-apis-express-' + Date.now(),
        content: 'REST stands for Representational State Transfer. RESTful APIs use HTTP methods to perform CRUD operations.\n\nExpress.js makes it easy to create REST APIs. You define routes, handle requests, and send responses.\n\nBest practices: use proper HTTP status codes, validate input, handle errors globally, and version your API.\n\nMiddleware is the key to Express: authentication, logging, body parsing are all middleware.',
        excerpt: 'Build professional REST APIs using Express.js with proper error handling and structure.',
        category: categories[2]._id, difficulty: 'Beginner', readTime: 12,
        isPublished: true, views: 756,
        codeSnippets: [{ language: 'javascript', code: 'router.get("/users", auth, async (req, res) => {\n  const users = await User.find();\n  res.json({ success: true, users });\n});', description: 'Protected route example' }],
        tags: ['nodejs', 'express', 'rest', 'api'], createdBy: admin._id,
      },
    ]);
    console.log('✅ Seeded 3 tutorials');

    // Blogs
    await Blog.insertMany([
      {
        title: '10 JavaScript Tips Every Developer Should Know in 2025',
        slug: 'javascript-tips-2025-' + Date.now(),
        content: 'JavaScript continues to evolve rapidly. Here are 10 tips that will make you a more productive developer in 2025.\n\n1. Use optional chaining (?.) to safely access nested properties without throwing errors.\n\n2. Nullish coalescing (??) provides default values only for null and undefined, not for falsy values like 0 or empty string.\n\n3. Array destructuring with default values makes your code more readable and defensive.\n\n4. Promise.allSettled() is perfect when you want to run multiple async operations and handle each result independently.\n\n5. WeakRef and FinalizationRegistry give you fine-grained control over garbage collection.\n\nThese patterns will keep your codebase clean and modern.',
        excerpt: 'Level up your JavaScript skills with these practical tips and modern patterns for 2025.',
        author: 'Sarah Johnson', category: categories[0]._id,
        tags: ['javascript', 'tips', 'es2025'], readTime: 6,
        isPublished: true, isFeatured: true, views: 3200, likes: 142,
        createdBy: admin._id,
      },
      {
        title: 'Why React is Still the Best Choice for Frontend in 2025',
        slug: 'why-react-2025-' + Date.now(),
        content: 'Despite the rise of Vue, Svelte, and other frameworks, React remains the dominant force in frontend development.\n\nThe ecosystem is unmatched. From Next.js for SSR, to React Native for mobile, to countless state management libraries — the options are vast.\n\nThe job market data is clear: React skills are in demand, with thousands of new job postings every week.\n\nReact 19 brings major improvements including automatic compiler optimizations, improved server components, and better concurrent features.\n\nFor teams, React\'s component model and unidirectional data flow make large applications maintainable.',
        excerpt: 'A data-driven look at why React continues to dominate the frontend landscape in 2025.',
        author: 'Mike Chen', category: categories[1]._id,
        tags: ['react', 'frontend', '2025'], readTime: 8,
        isPublished: true, views: 2100, likes: 89,
        createdBy: admin._id,
      },
      {
        title: 'MongoDB vs MySQL: Which Database Should You Choose?',
        slug: 'mongodb-vs-mysql-' + Date.now(),
        content: 'Choosing a database is one of the most important architectural decisions you\'ll make.\n\nMongoDB is a document database that stores data in flexible JSON-like documents. It excels at handling unstructured data, rapid prototyping, and horizontal scaling.\n\nMySQL is a relational database with a rigid schema, powerful JOIN operations, and ACID compliance. It excels at complex queries and data integrity.\n\nFor web apps with flexible data models and rapid iteration: choose MongoDB.\n\nFor financial systems, e-commerce, and complex reporting: choose MySQL.\n\nMany modern stacks use both — MongoDB for user content and MySQL for transactional data.',
        excerpt: 'Compare MongoDB and MySQL to make the right database choice for your next project.',
        author: 'Emily Rodriguez', category: categories[4]._id,
        tags: ['database', 'mongodb', 'mysql'], readTime: 7,
        isPublished: true, isFeatured: true, views: 1850, likes: 74,
        createdBy: admin._id,
      },
    ]);
    console.log('✅ Seeded 3 blog posts');

    await seedQuizzes(courses);
    console.log('\n🎉 Database seeded successfully!\n');
    console.log('Admin Login:   admin@webdevsoft.com / admin123');
    console.log('User Login:    user@webdevsoft.com  / user123\n');
    process.exit(0);
  } catch (err) {
    console.error('❌ Seeding error:', err.message);
    process.exit(1);
  }
};

seed();

// Seed quizzes after main seed
const { Quiz } = require('./models/Quiz');

const seedQuizzes = async (courses) => {
  await Quiz.deleteMany({});
  await Quiz.insertMany([
    {
      course: courses[0]._id,
      title: 'JavaScript Fundamentals Quiz',
      description: 'Test your knowledge of JavaScript basics',
      passingScore: 60,
      timeLimit: 10,
      isPublished: true,
      questions: [
        { text: 'Which keyword declares a block-scoped variable in JavaScript?', options: ['var', 'let', 'define', 'scope'], correctIndex: 1, explanation: '"let" is block-scoped, unlike "var" which is function-scoped.' },
        { text: 'What does the "===" operator check?', options: ['Value only', 'Type only', 'Value and type', 'Neither'], correctIndex: 2, explanation: '"===" checks both value and type (strict equality).' },
        { text: 'Which method adds an element to the end of an array?', options: ['push()', 'pop()', 'shift()', 'unshift()'], correctIndex: 0, explanation: 'push() adds one or more elements to the end of an array.' },
        { text: 'What is a closure in JavaScript?', options: ['A loop construct', 'A function with access to its outer scope', 'A type of object', 'An error handler'], correctIndex: 1, explanation: 'A closure is a function that retains access to variables from its outer scope.' },
        { text: 'Which built-in method returns the length of a string?', options: ['.size()', '.count()', '.length', '.len()'], correctIndex: 2, explanation: '.length is a property (not a method) that returns the string length.' },
      ]
    },
    {
      course: courses[1]._id,
      title: 'React.js Core Concepts Quiz',
      description: 'Check your understanding of React fundamentals',
      passingScore: 70,
      timeLimit: 8,
      isPublished: true,
      questions: [
        { text: 'What is JSX?', options: ['A database language', 'JavaScript XML — a syntax extension', 'A CSS preprocessor', 'A testing framework'], correctIndex: 1, explanation: 'JSX is a syntax extension for JavaScript that looks like HTML.' },
        { text: 'Which hook manages state in a functional component?', options: ['useEffect', 'useRef', 'useState', 'useContext'], correctIndex: 2, explanation: 'useState returns a state value and a setter function.' },
        { text: 'When does useEffect run with an empty dependency array []?', options: ['On every render', 'Only on mount', 'Only on unmount', 'Never'], correctIndex: 1, explanation: 'An empty array means the effect only runs once after the initial render.' },
        { text: 'What is the Virtual DOM?', options: ['A browser API', 'A lightweight copy of the real DOM', 'A database', 'A CSS engine'], correctIndex: 1, explanation: 'React uses a Virtual DOM to batch updates and minimize real DOM changes.' },
      ]
    },
  ]);
  console.log('✅ Seeded 2 quizzes');
};
