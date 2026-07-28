import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { FaVials, FaHandHoldingHeart, FaBoxes, FaUserCheck } from 'react-icons/fa';
import api from '../../services/api';

const StaffDashboard = () => {
  const { user } = useAuth();
  const [donations, setDonations] = useState([]);
  const [tests, setTests] = useState([]);
  const [inventory, setInventory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [donRes, testRes, invRes] = await Promise.all([
        api.get('/donations'),
        api.get('/blood-tests'),
        api.get('/inventory')
      ]);
      if (donRes.data.success) setDonations(donRes.data.donations || []);
      if (testRes.data.success) setTests(testRes.data.bloodTests || []);
      if (invRes.data.success) setInventory(Object.values(invRes.data.summary || {}));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pendingScreening = donations.filter(d => d.status === 'Registered' || d.status === 'Screening').length;
  const pendingTests = donations.filter(d => d.status === 'Testing').length;
  const totalInventoryUnits = inventory.reduce((acc, u) => acc + u, 0);

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">Staff Operations Dashboard</h3>
          <p className="text-muted small mb-0">Welcome, {user?.name} | Blood Collection & Lab Screening Center</p>
        </div>
        <button className="btn btn-outline-danger btn-sm rounded-pill" onClick={fetchData}>
          🔄 Refresh
        </button>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Donors Awaiting Screening"
            value={pendingScreening}
            icon={<FaUserCheck />}
            color="warning"
            subtitle="Registered / Screening"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Samples In Lab Testing"
            value={pendingTests}
            icon={<FaVials />}
            color="info"
            subtitle="Pending Lab Results"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Total Tests Conducted"
            value={tests.length}
            icon={<FaHandHoldingHeart />}
            color="success"
          />
        </div>
        <div className="col-md-3 col-sm-6">
          <StatCard
            title="Available Blood Units"
            value={`${totalInventoryUnits} Units`}
            icon={<FaBoxes />}
            color="danger"
          />
        </div>
      </div>

      {/* Recent Activity Table */}
      <div className="card card-healthcare p-4">
        <h5 className="fw-bold brand-font text-dark mb-3">Recent Donation Pipeline Activity</h5>
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Blood Group</th>
                <th>Donation Date</th>
                <th>Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="4" className="text-center py-4">Loading...</td></tr>
              ) : donations.slice(0, 8).map(d => (
                <tr key={d._id}>
                  <td className="fw-semibold text-dark">{d.donorId?.userId?.name || 'Unknown Donor'}</td>
                  <td><span className="badge bg-danger">{d.bloodGroup}</span></td>
                  <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                  <td>
                    <span className={`badge ${d.status === 'Stored' ? 'bg-success' : d.status === 'Testing' ? 'bg-info text-dark' : d.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'}`}>
                      {d.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDashboard;
