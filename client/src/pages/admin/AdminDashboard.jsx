import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import StatCard from '../../components/StatCard';
import BloodBadge from '../../components/BloodBadge';
import {
  FaUserFriends,
  FaHospital,
  FaBoxes,
  FaExclamationTriangle,
  FaHeartbeat,
  FaCalendarCheck,
  FaCampground
} from 'react-icons/fa';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
  ArcElement
} from 'chart.js';
import { Bar, Doughnut } from 'react-chartjs-2';

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend, ArcElement);

const AdminDashboard = () => {
  const [stats, setStats] = useState(null);
  const [charts, setCharts] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const res = await api.get('/dashboard/stats');
      if (res.data.success) {
        setStats(res.data.stats);
        setCharts(res.data.charts);
      }
    } catch (error) {
      console.error('Failed to load dashboard statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="d-flex justify-content-center py-5">
        <div className="spinner-border text-danger" role="status">
          <span className="visually-hidden">Loading Dashboard...</span>
        </div>
      </div>
    );
  }

  // Doughnut Chart Data for Blood Inventory Distribution
  const doughnutData = {
    labels: ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
    datasets: [
      {
        data: charts ? Object.values(charts.bloodGroupDistribution) : [],
        backgroundColor: [
          '#E53935', '#C2185B', '#FB8C00', '#F57C00',
          '#8E24AA', '#512DA8', '#43A047', '#1976D2'
        ],
        borderWidth: 1
      }
    ]
  };

  // Bar Chart Data for Monthly Donation & Request Trends
  const barData = {
    labels: charts ? charts.monthlyDonations.map(m => m.month) : [],
    datasets: [
      {
        label: 'Donations Collected',
        data: charts ? charts.monthlyDonations.map(m => m.count) : [],
        backgroundColor: 'rgba(211, 47, 47, 0.85)'
      },
      {
        label: 'Hospital Requests',
        data: charts ? charts.monthlyRequests.map(m => m.count) : [],
        backgroundColor: 'rgba(30, 136, 229, 0.85)'
      }
    ]
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">System Analytics Dashboard</h3>
          <p className="text-muted small mb-0">Real-time blood stock & emergency request overview</p>
        </div>
        <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={fetchStats}>
          🔄 Refresh Metrics
        </button>
      </div>

      {/* Metrics Row */}
      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Total Donors"
            value={stats?.totalDonors || 0}
            icon={<FaUserFriends />}
            color="danger"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Registered Hospitals"
            value={stats?.totalHospitals || 0}
            icon={<FaHospital />}
            color="primary"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Available Blood Units"
            value={`${stats?.totalBloodUnits || 0} ML`}
            icon={<FaBoxes />}
            color="success"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Pending Requests"
            value={stats?.pendingRequests || 0}
            icon={<FaHeartbeat />}
            color="warning"
            subtitle="Requires Admin Action"
          />
        </div>
      </div>

      {/* Low Stock Alerts Banner */}
      {stats?.lowStockCount > 0 && (
        <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center mb-4 rounded-3 p-3">
          <FaExclamationTriangle className="fs-3 me-3 text-warning" />
          <div>
            <h6 className="fw-bold mb-0">Low Stock Alert!</h6>
            <small className="text-dark">
              {stats.lowStockCount} blood group(s) have fewer than 5 units available in inventory. Please organize donation camps or contact donors.
            </small>
          </div>
        </div>
      )}

      {/* Charts Row */}
      <div className="row g-4 mb-4">
        <div className="col-lg-5">
          <div className="card card-healthcare p-4 h-100">
            <h5 className="fw-bold brand-font text-dark mb-3">Inventory Distribution</h5>
            <div className="d-flex justify-content-center py-2" style={{ maxHeight: '280px' }}>
              <Doughnut data={doughnutData} options={{ maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
        <div className="col-lg-7">
          <div className="card card-healthcare p-4 h-100">
            <h5 className="fw-bold brand-font text-dark mb-3">Monthly Activity Trends</h5>
            <div style={{ minHeight: '260px' }}>
              <Bar data={barData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Quick Summary Grid */}
      <div className="row g-3">
        <div className="col-md-4">
          <div className="card card-healthcare p-3 text-center">
            <div className="text-muted small text-uppercase">Today's Donations</div>
            <h4 className="fw-bold text-danger my-1">{stats?.todaysDonations || 0}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-healthcare p-3 text-center">
            <div className="text-muted small text-uppercase">Approved Requests</div>
            <h4 className="fw-bold text-success my-1">{stats?.approvedRequests || 0}</h4>
          </div>
        </div>
        <div className="col-md-4">
          <div className="card card-healthcare p-3 text-center">
            <div className="text-muted small text-uppercase">Active Camps</div>
            <h4 className="fw-bold text-primary my-1">{stats?.totalCamps || 0}</h4>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
