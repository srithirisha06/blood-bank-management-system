import React, { useEffect, useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import StatCard from '../../components/StatCard';
import { Link } from 'react-router-dom';
import { FaHospital, FaPlusCircle, FaHeartbeat, FaCheckCircle, FaClock } from 'react-icons/fa';
import api from '../../services/api';

const HospitalDashboard = () => {
  const { user, profileDetails } = useAuth();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
  }, []);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests');
      if (res.data.success) {
        setRequests(res.data.requests || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = requests.filter(r => r.status === 'Pending').length;
  const approvedCount = requests.filter(r => ['Approved', 'Allocated', 'Completed'].includes(r.status)).length;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">{profileDetails?.hospitalName || user?.name}</h3>
          <p className="text-muted small mb-0">Hospital Emergency Portal & Blood Request Desk</p>
        </div>
        <Link to="/hospital/request-blood" className="btn btn-blood-danger rounded-pill d-flex align-items-center gap-2">
          <FaPlusCircle /> Request Blood Unit
        </Link>
      </div>

      <div className="card card-healthcare p-4 mb-4 bg-white border-start border-4 border-primary">
        <h5 className="fw-bold text-dark mb-1"><FaHospital className="text-primary me-2" /> Hospital Account Info</h5>
        <p className="text-muted small mb-0">
          Registration No: <code>{profileDetails?.registrationNumber || 'HOSP-REG-2026'}</code> | Contact Person: {profileDetails?.contactPerson || 'Medical Director'}
        </p>
      </div>

      <div className="row g-3 mb-4">
        <div className="col-md-4">
          <StatCard title="Total Requests Placed" value={requests.length} icon={<FaHeartbeat />} color="primary" />
        </div>
        <div className="col-md-4">
          <StatCard title="Pending Review" value={pendingCount} icon={<FaClock />} color="warning" />
        </div>
        <div className="col-md-4">
          <StatCard title="Approved / Allocated" value={approvedCount} icon={<FaCheckCircle />} color="success" />
        </div>
      </div>
    </div>
  );
};

export default HospitalDashboard;
