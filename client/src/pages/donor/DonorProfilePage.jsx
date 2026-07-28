import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';
import { FaUserCircle, FaSave } from 'react-icons/fa';

const DonorProfilePage = () => {
  const { user, profileDetails, refetchProfile } = useAuth();
  const { addToast } = useToast();

  const [bloodGroup, setBloodGroup] = useState(profileDetails?.bloodGroup || 'O+');
  const [gender, setGender] = useState(profileDetails?.gender || 'Male');
  const [weight, setWeight] = useState(profileDetails?.weight || 65);
  const [phone, setPhone] = useState(profileDetails?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (!profileDetails?._id) return;
    try {
      setLoading(true);
      const res = await api.put(`/donors/${profileDetails._id}`, {
        bloodGroup,
        gender,
        weight: Number(weight),
        phone
      });

      if (res.data.success) {
        addToast('Donor profile updated!', 'success');
        refetchProfile();
      }
    } catch (error) {
      addToast('Failed to update profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">Donor Medical Profile</h3>
        <p className="text-muted small mb-0">Keep your health and contact information updated</p>
      </div>

      <div className="card card-healthcare p-4 max-w-2xl shadow-sm">
        <form onSubmit={handleUpdate}>
          <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
            <FaUserCircle className="text-danger fs-1" />
            <div>
              <h5 className="fw-bold mb-0">{user?.name}</h5>
              <small className="text-muted">{user?.email}</small>
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Blood Group</label>
              <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Gender</label>
              <select className="form-select" value={gender} onChange={e => setGender(e.target.value)}>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
              </select>
            </div>
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Body Weight (kg)</label>
              <input type="number" className="form-control" value={weight} onChange={e => setWeight(e.target.value)} required />
              <small className="text-muted">Min 45kg required for donation</small>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Contact Phone Number</label>
              <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-blood-danger d-flex align-items-center gap-2" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : 'Save Profile Changes'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default DonorProfilePage;
