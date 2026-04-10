import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { AuthProvider, useAuth } from './context/AuthContext';

import Navbar from './components/Navbar';
import Footer from './components/Footer';

import Home from './pages/Home';
import Courses from './pages/Courses';
import CourseDetail from './pages/CourseDetail';
import Tutorials from './pages/Tutorials';
import TutorialDetail from './pages/TutorialDetail';
import Blogs from './pages/Blogs';
import BlogDetail from './pages/BlogDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Login';
import Dashboard from './pages/Dashboard';
import Wishlist from './pages/Wishlist';
import Certificates from './pages/Certificates';
import AdminDashboard from './pages/AdminDashboard';
import AdminCourses from './pages/AdminCourses';
import AdminBlogs from './pages/AdminBlogs';
import AdminUsers from './pages/AdminUsers';
import NotFound from './pages/NotFound';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user ? children : <Navigate to="/login" />;
};

const AdminRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;
  return user?.role === 'admin' ? children : <Navigate to="/" />;
};

const AppRoutes = () => (
  <Router>
    <Navbar />
    <main>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/courses" element={<Courses />} />
        <Route path="/courses/:slug" element={<CourseDetail />} />
        <Route path="/tutorials" element={<Tutorials />} />
        <Route path="/tutorials/:slug" element={<TutorialDetail />} />
        <Route path="/blogs" element={<Blogs />} />
        <Route path="/blogs/:slug" element={<BlogDetail />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/wishlist" element={<PrivateRoute><Wishlist /></PrivateRoute>} />
        <Route path="/certificates" element={<PrivateRoute><Certificates /></PrivateRoute>} />
        <Route path="/admin" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
        <Route path="/admin/courses" element={<AdminRoute><AdminCourses /></AdminRoute>} />
        <Route path="/admin/blogs" element={<AdminRoute><AdminBlogs /></AdminRoute>} />
        <Route path="/admin/users" element={<AdminRoute><AdminUsers /></AdminRoute>} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </main>
    <Footer />
    <ToastContainer position="bottom-right" theme="dark" />
  </Router>
);

export default function App() {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
}
