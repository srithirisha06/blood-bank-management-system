import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaCampground, FaMapMarkerAlt, FaCalendarAlt, FaClock } from 'react-icons/fa';

const DonorCampsPage = () => {
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/camps');
      if (res.data.success) {
        setCamps(res.data.camps || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">Upcoming Blood Donation Camps</h3>
        <p className="text-muted small mb-0">Join community blood drives near your area</p>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-5">Loading blood camps...</div>
        ) : camps.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No blood camps scheduled currently.</div>
        ) : (
          camps.map((c) => (
            <div key={c._id} className="col-md-6 col-lg-4">
              <div className="card card-healthcare p-4 h-100">
                <div className="fs-2 text-danger mb-2"><FaCampground /></div>
                <h5 className="fw-bold text-dark">{c.campName}</h5>
                <p className="text-muted small mb-2"><FaMapMarkerAlt className="text-danger me-1" /> {c.venue}</p>
                <p className="text-secondary small mb-1"><FaCalendarAlt className="me-1" /> {new Date(c.date).toLocaleDateString()}</p>
                <p className="text-secondary small mb-3"><FaClock className="me-1" /> {c.time}</p>
                <p className="small text-muted mb-0">Organized by {c.organizer}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default DonorCampsPage;
