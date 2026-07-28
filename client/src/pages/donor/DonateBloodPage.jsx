import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { FaHandHoldingHeart, FaCalendarAlt, FaCampground } from 'react-icons/fa';

const DonateBloodPage = () => {
  const { profileDetails } = useAuth();
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [camps, setCamps] = useState([]);
  const [selectedCamp, setSelectedCamp] = useState('');
  const [donationDate, setDonationDate] = useState(new Date().toISOString().split('T')[0]);
  const [units, setUnits] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      const res = await api.get('/camps');
      if (res.data.success) {
        setCamps(res.data.camps || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/donations', {
        units: Number(units),
        donationDate,
        campId: selectedCamp || null
      });

      if (res.data.success) {
        addToast('Blood donation registered! Staff will contact you for screening.', 'success');
        navigate('/donor/history');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to schedule donation', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">Schedule Blood Donation</h3>
        <p className="text-muted small mb-0">Register your pledge or select a nearby blood donation camp</p>
      </div>

      <div className="card card-healthcare p-4 max-w-2xl shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Your Blood Group</label>
            <input type="text" className="form-control" value={profileDetails?.bloodGroup || 'O+'} disabled />
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Pledged Units (350ml - 450ml per unit)</label>
            <select className="form-select" value={units} onChange={e => setUnits(e.target.value)}>
              <option value="1">1 Unit (Standard Collection)</option>
              <option value="2">2 Units (Double Red Cell Donation)</option>
            </select>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Preferred Donation Date</label>
            <input type="date" className="form-control" value={donationDate} onChange={e => setDonationDate(e.target.value)} required />
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Select Blood Camp (Optional)</label>
            <select className="form-select" value={selectedCamp} onChange={e => setSelectedCamp(e.target.value)}>
              <option value="">Blood Bank Main Center</option>
              {camps.map(c => (
                <option key={c._id} value={c._id}>
                  {c.campName} ({c.venue} - {new Date(c.date).toLocaleDateString()})
                </option>
              ))}
            </select>
          </div>

          <button type="submit" className="btn btn-blood-danger w-100 py-2" disabled={loading}>
            {loading ? 'Submitting Schedule...' : 'Confirm Donation Appointment'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonateBloodPage;
