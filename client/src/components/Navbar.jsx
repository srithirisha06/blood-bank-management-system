import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FaBell, FaUserCircle, FaSignOutAlt, FaBars, FaTint } from 'react-icons/fa';
import api from '../services/api';

const Navbar = ({ onToggleSidebar }) => {
  const { user, logoutUser } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (user) {
      fetchNotifications();
    }
  }, [user]);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications');
      if (res.data.success) {
        setNotifications(res.data.notifications);
        setUnreadCount(res.data.unreadCount);
      }
    } catch (e) {
      // console.error(e);
    }
  };

  const handleLogout = async () => {
    await logoutUser();
    navigate('/login');
  };

  const getRoleBadgeColor = (role) => {
    switch (role) {
      case 'super_admin': return 'bg-danger';
      case 'admin': return 'bg-warning text-dark';
      case 'staff': return 'bg-info text-dark';
      case 'hospital': return 'bg-primary';
      case 'donor': return 'bg-success';
      default: return 'bg-secondary';
    }
  };

  return (
    <nav className="navbar navbar-expand navbar-light bg-white border-bottom px-4 py-2 sticky-top shadow-sm">
      <div className="d-flex align-items-center me-auto">
        <button className="btn btn-light d-lg-none me-3" onClick={onToggleSidebar}>
          <FaBars />
        </button>
        <div className="d-flex align-items-center gap-2">
          <span className="fs-4 text-danger"><FaTint /></span>
          <span className="fw-bold brand-font fs-5 text-dark">LifeFlow <span className="text-muted fs-6 fw-normal">Portal</span></span>
        </div>
      </div>

      <div className="d-flex align-items-center gap-3">
        {/* Role Badge */}
        {user && (
          <span className={`badge ${getRoleBadgeColor(user.role)} text-uppercase px-3 py-2 rounded-pill`}>
            {user.role.replace('_', ' ')}
          </span>
        )}

        {/* Notifications Dropdown */}
        <div className="dropdown">
          <button className="btn btn-light position-relative rounded-circle p-2" type="button" data-bs-toggle="dropdown">
            <FaBell className="text-secondary fs-5" />
            {unreadCount > 0 && (
              <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
                {unreadCount}
              </span>
            )}
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow p-2" style={{ width: '320px', maxHeight: '400px', overflowY: 'auto' }}>
            <li className="dropdown-header fw-bold text-dark d-flex justify-content-between">
              <span>Notifications</span>
              <span className="badge bg-danger rounded-pill">{unreadCount} New</span>
            </li>
            <li><hr className="dropdown-divider" /></li>
            {notifications.length === 0 ? (
              <li className="p-3 text-center text-muted small">No notifications</li>
            ) : (
              notifications.map((n) => (
                <li key={n._id} className="p-2 border-bottom small">
                  <div className="fw-semibold text-dark">{n.title}</div>
                  <div className="text-muted">{n.message}</div>
                  <small className="text-secondary" style={{ fontSize: '0.75rem' }}>
                    {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </small>
                </li>
              ))
            )}
          </ul>
        </div>

        {/* User Profile Dropdown */}
        <div className="dropdown">
          <button className="btn btn-light dropdown-toggle d-flex align-items-center gap-2 rounded-pill px-3 py-1 border" type="button" data-bs-toggle="dropdown">
            <FaUserCircle className="text-danger fs-4" />
            <span className="fw-semibold small d-none d-md-inline text-dark">{user?.name}</span>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow">
            <li className="dropdown-header">Logged in as <strong>{user?.email}</strong></li>
            <li><hr className="dropdown-divider" /></li>
            <li>
              <button className="dropdown-item text-danger d-flex align-items-center gap-2" onClick={handleLogout}>
                <FaSignOutAlt /> Logout
              </button>
            </li>
          </ul>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
