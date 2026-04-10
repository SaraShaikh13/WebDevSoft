import React, { useState, useEffect } from 'react';
import { api } from '../context/AuthContext';
import { toast } from 'react-toastify';
import './AdminCourses.css';

export default function AdminUsers() {
  const [users, setUsers] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [search, setSearch] = useState('');
  const [total, setTotal] = useState(0);

  useEffect(() => {
    api.get('/admin/users?limit=50')
      .then(r => { setUsers(r.data.users || []); setTotal(r.data.total || 0); })
      .catch(() => toast.error('Failed to load users.'))
      .finally(() => setFetching(false));
  }, []);

  const toggleRole = async (user) => {
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    if (!window.confirm(`Change ${user.name}'s role to ${newRole}?`)) return;
    try {
      const r = await api.put(`/admin/users/${user._id}`, { role: newRole });
      setUsers(prev => prev.map(u => u._id === user._id ? r.data.user : u));
      toast.success(`Role updated to ${newRole}.`);
    } catch { toast.error('Failed to update role.'); }
  };

  const toggleActive = async (user) => {
    try {
      const r = await api.put(`/admin/users/${user._id}`, { isActive: !user.isActive });
      setUsers(prev => prev.map(u => u._id === user._id ? r.data.user : u));
      toast.success(r.data.user.isActive ? 'User activated.' : 'User deactivated.');
    } catch { toast.error('Failed.'); }
  };

  const filtered = users.filter(u =>
    u.name?.toLowerCase().includes(search.toLowerCase()) ||
    u.email?.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="admin-page" style={{ paddingTop: 90 }}>
      <div className="container">
        <div className="admin-header">
          <div><h1>Manage Users</h1><p>{total} total registered users</p></div>
        </div>

        <div className="admin-search">
          <input className="form-control" placeholder="Search by name or email..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>

        {fetching ? (
          <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner" style={{ margin: '0 auto' }} /></div>
        ) : (
          <div className="admin-table-card">
            <table className="admin-table">
              <thead>
                <tr><th>User</th><th>Role</th><th>Enrolled</th><th>Status</th><th>Joined</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filtered.length === 0 && <tr><td colSpan={6} className="table-empty">No users found.</td></tr>}
                {filtered.map(u => (
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
                    <td>
                      <span className={`badge ${u.role === 'admin' ? 'badge-orange' : 'badge-accent'}`}>{u.role}</span>
                    </td>
                    <td className="text-muted">{u.enrolledCourses?.length || 0} courses</td>
                    <td>
                      <span className={`badge ${u.isActive ? 'badge-green' : 'badge-orange'}`}>
                        {u.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td className="text-muted" style={{ fontSize: '0.82rem' }}>
                      {new Date(u.createdAt).toLocaleDateString()}
                    </td>
                    <td>
                      <div className="action-btns">
                        <button className="btn btn-outline btn-sm" onClick={() => toggleRole(u)}>
                          {u.role === 'admin' ? '→ User' : '→ Admin'}
                        </button>
                        <button
                          className={`btn btn-sm ${u.isActive ? 'btn-danger' : 'btn-outline'}`}
                          onClick={() => toggleActive(u)}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
