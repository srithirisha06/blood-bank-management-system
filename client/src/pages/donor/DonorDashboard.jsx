import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import BloodBadge from '../../components/BloodBadge';
import CompatibilityChecker from '../../components/CompatibilityChecker';
import StatCard from '../../components/StatCard';
import { Link } from 'react-router-dom';
import { FaHandHoldingHeart, FaCalendarCheck, FaUserCheck, FaPlusCircle } from 'react-icons/fa';
import api from '../../services/api';

const DonorDashboard = () => {
  const { user, profileDetails } = useAuth();
  const [historyCount, setHistoryCount] = useState(0);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await api.get('/donations');
      if (res.data.success) {
        setHistoryCount(res.data.totalDonations || 0);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const isEligible = profileDetails?.eligibility ?? true;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">Welcome back, {user?.name}!</h3>
          <p className="text-muted small mb-0">Donor Portal & Personal Health Overview</p>
        </div>
        <Link to="/donor/donate" className="btn btn-blood-danger rounded-pill d-flex align-items-center gap-2">
          <FaPlusCircle /> Schedule Donation
        </Link>
      </div>

      {/* Donor Info Card */}
      <div className="card card-healthcare p-4 mb-4 bg-white border-start border-4 border-danger">
        <div className="row align-items-center">
          <div className="col-md-8">
            <h5 className="fw-bold mb-1">
              My Blood Type: {profileDetails?.bloodGroup ? <BloodBadge bloodGroup={profileDetails.bloodGroup} /> : 'O+'}
            </h5>
            <p className="text-muted small mb-2">
              Weight: {profileDetails?.weight || 65} kg | Gender: {profileDetails?.gender || 'Male'}
            </p>
            <div className="d-flex gap-2">
              {isEligible ? (
                <span className="badge bg-success px-3 py-2">✓ Eligible to Donate Blood</span>
              ) : (
                <span className="badge bg-danger px-3 py-2">✗ Temporarily Ineligible (&lt;45kg weight)</span>
              )}
              <span className="badge bg-secondary px-3 py-2">
                Last Donation: {profileDetails?.lastDonationDate ? new Date(profileDetails.lastDonationDate).toLocaleDateString() : 'Never'}
              </span>
            </div>
          </div>
          <div className="col-md-4 text-end mt-3 mt-md-0">
            <Link to="/donor/profile" className="btn btn-outline-danger btn-sm rounded-pill">
              Edit My Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-6">
          <StatCard
            title="Total Donations Completed"
            value={`${historyCount} Times`}
            icon={<FaHandHoldingHeart />}
            color="danger"
          />
        </div>
        <div className="col-md-6">
          <StatCard
            title="Donor Status"
            value={isEligible ? 'Active & Ready' : 'Ineligible'}
            icon={<FaUserCheck />}
            color="success"
          />
        </div>
      </div>

      {/* Compatibility Checker */}
      <div className="mb-4">
        <CompatibilityChecker />
      </div>
    </div>
  );
};

export default DonorDashboard;
