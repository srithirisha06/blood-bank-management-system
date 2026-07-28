import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Public Pages
import Home from '../pages/Home';
import About from '../pages/About';
import Contact from '../pages/Contact';
import Login from '../pages/Login';
import Register from '../pages/Register';
import NotFound from '../pages/NotFound';

// Admin Pages
import AdminDashboard from '../pages/admin/AdminDashboard';
import UsersPage from '../pages/admin/UsersPage';
import DonorsPage from '../pages/admin/DonorsPage';
import HospitalsPage from '../pages/admin/HospitalsPage';
import InventoryPage from '../pages/admin/InventoryPage';
import RequestsPage from '../pages/admin/RequestsPage';
import DonationsPage from '../pages/admin/DonationsPage';
import BloodTestingPage from '../pages/admin/BloodTestingPage';
import CampsPage from '../pages/admin/CampsPage';
import ReportsPage from '../pages/admin/ReportsPage';
import SettingsPage from '../pages/admin/SettingsPage';

// Donor Pages
import DonorDashboard from '../pages/donor/DonorDashboard';
import DonorProfilePage from '../pages/donor/DonorProfilePage';
import DonateBloodPage from '../pages/donor/DonateBloodPage';
import DonationHistoryPage from '../pages/donor/DonationHistoryPage';
import DonorCampsPage from '../pages/donor/DonorCampsPage';

// Hospital Pages
import HospitalDashboard from '../pages/hospital/HospitalDashboard';
import RequestBloodPage from '../pages/hospital/RequestBloodPage';
import RequestHistoryPage from '../pages/hospital/RequestHistoryPage';
import HospitalProfilePage from '../pages/hospital/HospitalProfilePage';

// Staff Pages
import StaffDashboard from '../pages/staff/StaffDashboard';
import StaffDonationCollectionPage from '../pages/staff/StaffDonationCollectionPage';
import StaffTestingPage from '../pages/staff/StaffTestingPage';
import StaffInventoryPage from '../pages/staff/StaffInventoryPage';

// Layout & Guard
import Layout from '../components/Layout';
import ProtectedRoute from '../components/ProtectedRoute';

const AppRoutes = () => {
  const { user } = useAuth();

  const getDefaultDashboard = () => {
    if (!user) return '/login';
    if (user.role === 'donor') return '/donor/dashboard';
    if (user.role === 'hospital') return '/hospital/dashboard';
    if (user.role === 'staff') return '/staff/dashboard';
    return '/admin/dashboard';
  };

  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<Home />} />
      <Route path="/about" element={<About />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/login" element={user ? <Navigate to={getDefaultDashboard()} replace /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to={getDefaultDashboard()} replace /> : <Register />} />

      {/* Admin & Super Admin Routes */}
      <Route element={<ProtectedRoute allowedRoles={['super_admin', 'admin']} />}>
        <Route element={<Layout />}>
          <Route path="/admin/dashboard" element={<AdminDashboard />} />
          <Route path="/admin/users" element={<UsersPage />} />
          <Route path="/admin/donors" element={<DonorsPage />} />
          <Route path="/admin/hospitals" element={<HospitalsPage />} />
          <Route path="/admin/inventory" element={<InventoryPage />} />
          <Route path="/admin/requests" element={<RequestsPage />} />
          <Route path="/admin/donations" element={<DonationsPage />} />
          <Route path="/admin/testing" element={<BloodTestingPage />} />
          <Route path="/admin/camps" element={<CampsPage />} />
          <Route path="/admin/reports" element={<ReportsPage />} />
          <Route path="/admin/settings" element={<SettingsPage />} />
        </Route>
      </Route>

      {/* Staff Routes */}
      <Route element={<ProtectedRoute allowedRoles={['staff', 'super_admin', 'admin']} />}>
        <Route element={<Layout />}>
          <Route path="/staff/dashboard" element={<StaffDashboard />} />
          <Route path="/staff/donations" element={<StaffDonationCollectionPage />} />
          <Route path="/staff/testing" element={<StaffTestingPage />} />
          <Route path="/staff/inventory" element={<StaffInventoryPage />} />
        </Route>
      </Route>

      {/* Donor Routes */}
      <Route element={<ProtectedRoute allowedRoles={['donor', 'super_admin', 'admin']} />}>
        <Route element={<Layout />}>
          <Route path="/donor/dashboard" element={<DonorDashboard />} />
          <Route path="/donor/profile" element={<DonorProfilePage />} />
          <Route path="/donor/donate" element={<DonateBloodPage />} />
          <Route path="/donor/history" element={<DonationHistoryPage />} />
          <Route path="/donor/camps" element={<DonorCampsPage />} />
        </Route>
      </Route>

      {/* Hospital Routes */}
      <Route element={<ProtectedRoute allowedRoles={['hospital', 'super_admin', 'admin']} />}>
        <Route element={<Layout />}>
          <Route path="/hospital/dashboard" element={<HospitalDashboard />} />
          <Route path="/hospital/request-blood" element={<RequestBloodPage />} />
          <Route path="/hospital/history" element={<RequestHistoryPage />} />
          <Route path="/hospital/profile" element={<HospitalProfilePage />} />
        </Route>
      </Route>

      {/* Fallback */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  );
};

export default AppRoutes;
