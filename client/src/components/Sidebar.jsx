import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  FaTachometerAlt,
  FaUsers,
  FaUserFriends,
  FaHospital,
  FaBoxes,
  FaHandHoldingHeart,
  FaVials,
  FaCampground,
  FaChartBar,
  FaCog,
  FaHeartbeat,
  FaNotesMedical,
  FaPlusCircle,
  FaHistory
} from 'react-icons/fa';

const Sidebar = ({ showMobile }) => {
  const { user } = useAuth();
  const role = user?.role || 'donor';

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Dashboard', icon: <FaTachometerAlt /> },
    { to: '/admin/users', label: 'Users Management', icon: <FaUsers /> },
    { to: '/admin/donors', label: 'Donors List', icon: <FaUserFriends /> },
    { to: '/admin/hospitals', label: 'Hospitals', icon: <FaHospital /> },
    { to: '/admin/inventory', label: 'Blood Inventory', icon: <FaBoxes /> },
    { to: '/admin/donations', label: 'Donation History', icon: <FaHandHoldingHeart /> },
    { to: '/admin/testing', label: 'Blood Testing Lab', icon: <FaVials /> },
    { to: '/admin/requests', label: 'Blood Requests', icon: <FaHeartbeat /> },
    { to: '/admin/camps', label: 'Blood Camps', icon: <FaCampground /> },
    { to: '/admin/reports', label: 'Reports & Analytics', icon: <FaChartBar /> },
    { to: '/admin/settings', label: 'Settings', icon: <FaCog /> }
  ];

  const donorLinks = [
    { to: '/donor/dashboard', label: 'Overview', icon: <FaTachometerAlt /> },
    { to: '/donor/profile', label: 'My Donor Profile', icon: <FaUserFriends /> },
    { to: '/donor/donate', label: 'Schedule Donation', icon: <FaPlusCircle /> },
    { to: '/donor/history', label: 'Donation History', icon: <FaHistory /> },
    { to: '/donor/camps', label: 'Find Blood Camps', icon: <FaCampground /> }
  ];

  const hospitalLinks = [
    { to: '/hospital/dashboard', label: 'Overview', icon: <FaTachometerAlt /> },
    { to: '/hospital/request-blood', label: 'Request Blood Unit', icon: <FaPlusCircle /> },
    { to: '/hospital/history', label: 'Request History', icon: <FaHistory /> },
    { to: '/hospital/profile', label: 'Hospital Profile', icon: <FaHospital /> }
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Overview', icon: <FaTachometerAlt /> },
    { to: '/staff/donations', label: 'Donation Screening', icon: <FaHandHoldingHeart /> },
    { to: '/staff/testing', label: 'Lab Testing', icon: <FaVials /> },
    { to: '/staff/inventory', label: 'Stock Audit', icon: <FaBoxes /> }
  ];

  let links = donorLinks;
  if (role === 'super_admin' || role === 'admin') links = adminLinks;
  else if (role === 'hospital') links = hospitalLinks;
  else if (role === 'staff') links = staffLinks;

  return (
    <aside className={`app-sidebar ${showMobile ? 'show' : ''}`}>
      <div className="p-4 border-bottom border-secondary border-opacity-25 d-flex align-items-center gap-3">
        <span className="fs-3 text-danger">🩸</span>
        <div>
          <h5 className="fw-bold mb-0 text-white brand-font">LifeFlow</h5>
          <small className="text-secondary">Blood Bank Systems</small>
        </div>
      </div>

      <div className="py-3">
        <div className="px-4 text-uppercase fs-7 text-secondary fw-semibold mb-2" style={{ fontSize: '0.7rem' }}>
          Navigation Menu
        </div>
        <nav className="nav flex-column">
          {links.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
            >
              <span className="fs-5">{link.icon}</span>
              <span>{link.label}</span>
            </NavLink>
          ))}
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
