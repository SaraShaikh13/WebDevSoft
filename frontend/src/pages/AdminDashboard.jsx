import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../context/AuthContext';
import './AdminDashboard.css';

const StatCard = ({ icon, label, value, color }) => (
  <div className="stat-card" style={{ '--card-color': color }}>
    <div className="stat-icon">{icon}</div>
    <div className="stat-info">
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [stats, setStats] = useState(null);
  const [recentUsers, setRecentUsers] = useState([]);
  const [popularCourses, setPopularCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/admin/stats').then(r => {
      setStats(r.data.stats);
      setRecentUsers(r.data.recentUsers || []);
      setPopularCourses(r.data.popularCourses || []);
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading-screen"><div className="spinner" /></div>;

  return (
    <div className="admin-page" style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="admin-header">
          <div>
            <h1>Admin Dashboard</h1>
            <p>Manage your platform content and users</p>
          </div>
          <div className="admin-quick-links">
            <Link to="/admin/courses" className="btn btn-primary btn-sm">+ Add Course</Link>
            <Link to="/admin/blogs" className="btn btn-outline btn-sm">+ Add Blog</Link>
          </div>
        </div>

        {/* Stat Cards */}
        <div className="stats-grid">
          <StatCard icon="👥" label="Total Users" value={stats?.users ?? '—'} color="#6c63ff" />
          <StatCard icon="📚" label="Total Courses" value={stats?.courses ?? '—'} color="#00d4a0" />
          <StatCard icon="🌐" label="Published" value={stats?.publishedCourses ?? '—'} color="#ff7b54" />
          <StatCard icon="📝" label="Tutorials" value={stats?.tutorials ?? '—'} color="#63b3ed" />
          <StatCard icon="✍" label="Blogs" value={stats?.blogs ?? '—'} color="#f6ad55" />
          <StatCard icon="🏷" label="Categories" value={stats?.categories ?? '—'} color="#b794f4" />
        </div>

        {/* Nav Cards */}
        <div className="admin-nav-grid">
          {[
            { to: '/admin/courses', icon: '📚', label: 'Manage Courses', desc: 'Create, edit, publish courses' },
            { to: '/admin/blogs', icon: '✍', label: 'Manage Blogs', desc: 'Write and manage blog posts' },
            { to: '/admin/users', icon: '👥', label: 'Manage Users', desc: 'View and manage user accounts' },
            { to: '/courses', icon: '👁', label: 'View Site', desc: 'See your platform live' },
          ].map(item => (
            <Link to={item.to} key={item.to} className="admin-nav-card">
              <span className="admin-nav-icon">{item.icon}</span>
              <div>
                <div className="admin-nav-label">{item.label}</div>
                <div className="admin-nav-desc">{item.desc}</div>
              </div>
              <svg className="admin-nav-arrow" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="m9 18 6-6-6-6"/></svg>
            </Link>
          ))}
        </div>

        <div className="admin-tables">
          {/* Recent Users */}
          <div className="admin-table-card">
            <div className="table-header">
              <h3>Recent Users</h3>
              <Link to="/admin/users" className="btn btn-outline btn-sm">View All</Link>
            </div>
            {recentUsers.length > 0 ? (
              <table className="admin-table">
                <thead><tr><th>User</th><th>Role</th><th>Joined</th></tr></thead>
                <tbody>
                  {recentUsers.map(u => (
                    <tr key={u._id}>
                      <td>
                        <div className="table-user">
                          <div className="avatar">{u.name?.charAt(0).toUpperCase()}</div>
                          <div>
                            <div className="user-n">{u.name}</div>
                            <div className="user-e">{u.email}</div>
                          </div>
                        </div>
                      </td>
                      <td><span className={`badge ${u.role === 'admin' ? 'badge-orange' : 'badge-accent'}`}>{u.role}</span></td>
                      <td className="text-muted">{new Date(u.createdAt).toLocaleDateString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="table-empty">No users yet.</p>}
          </div>

          {/* Popular Courses */}
          <div className="admin-table-card">
            <div className="table-header">
              <h3>Popular Courses</h3>
              <Link to="/admin/courses" className="btn btn-outline btn-sm">Manage</Link>
            </div>
            {popularCourses.length > 0 ? (
              <table className="admin-table">
                <thead><tr><th>Course</th><th>Level</th><th>Enrolled</th></tr></thead>
                <tbody>
                  {popularCourses.map(c => (
                    <tr key={c._id}>
                      <td><div className="course-title-cell">{c.title}</div></td>
                      <td><span className="badge badge-accent">{c.level}</span></td>
                      <td className="text-muted">{c.enrolledCount}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : <p className="table-empty">No courses yet.</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
