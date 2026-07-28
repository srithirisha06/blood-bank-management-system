import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FaUserPlus, FaSearch, FaTrash, FaUserShield } from 'react-icons/fa';

const UsersPage = () => {
  const { addToast } = useToast();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('staff');

  useEffect(() => {
    fetchUsers();
  }, [search, roleFilter]);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/users', {
        params: { search, role: roleFilter }
      });
      if (res.data.success) {
        setUsers(res.data.users);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateUser = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/users', { name, email, password, role });
      if (res.data.success) {
        addToast('User created successfully!', 'success');
        setShowModal(false);
        setName('');
        setEmail('');
        setPassword('');
        fetchUsers();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to create user', 'error');
    }
  };

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;
    try {
      const res = await api.delete(`/users/${id}`);
      if (res.data.success) {
        addToast('User deleted successfully', 'success');
        fetchUsers();
      }
    } catch (error) {
      addToast('Failed to delete user', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">System Users Directory</h3>
          <p className="text-muted small mb-0">Manage RBAC user credentials, staff, and admins</p>
        </div>
        <button className="btn btn-blood-danger d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <FaUserPlus /> Add New User
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="card card-healthcare p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search user by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)}>
              <option value="">All Roles</option>
              <option value="super_admin">Super Admin</option>
              <option value="admin">Admin</option>
              <option value="staff">Staff</option>
              <option value="hospital">Hospital</option>
              <option value="donor">Donor</option>
            </select>
          </div>
        </div>
      </div>

      {/* Users Table */}
      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>User Name</th>
                <th>Email Address</th>
                <th>Assigned Role</th>
                <th>Status</th>
                <th>Created Date</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading users...</td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No users found.</td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u._id}>
                    <td className="fw-semibold text-dark">{u.name}</td>
                    <td>{u.email}</td>
                    <td>
                      <span className="badge bg-secondary text-uppercase">{u.role.replace('_', ' ')}</span>
                    </td>
                    <td>
                      <span className={`badge ${u.active ? 'bg-success' : 'bg-danger'}`}>
                        {u.active ? 'Active' : 'Disabled'}
                      </span>
                    </td>
                    <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                    <td className="text-end">
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDeleteUser(u._id)}
                      >
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Create User Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-healthcare">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Create New User Account</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateUser}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Full Name</label>
                    <input type="text" className="form-control" required value={name} onChange={(e) => setName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Email Address</label>
                    <input type="email" className="form-control" required value={email} onChange={(e) => setEmail(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Password</label>
                    <input type="password" className="form-control" required value={password} onChange={(e) => setPassword(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Role</label>
                    <select className="form-select" value={role} onChange={(e) => setRole(e.target.value)}>
                      <option value="admin">Blood Bank Admin</option>
                      <option value="staff">Lab Staff</option>
                      <option value="hospital">Hospital</option>
                      <option value="donor">Donor</option>
                    </select>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-blood-danger">Create User</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UsersPage;
