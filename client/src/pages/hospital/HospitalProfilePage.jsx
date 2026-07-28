import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import api from '../../services/api';
import { FaHospital, FaSave } from 'react-icons/fa';

const HospitalProfilePage = () => {
  const { user, profileDetails, refetchProfile } = useAuth();
  const { addToast } = useToast();

  const [hospitalName, setHospitalName] = useState(profileDetails?.hospitalName || user?.name || '');
  const [contactPerson, setContactPerson] = useState(profileDetails?.contactPerson || '');
  const [phone, setPhone] = useState(profileDetails?.phone || '');
  const [loading, setLoading] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!profileDetails?._id) return;
    try {
      setLoading(true);
      const res = await api.put(`/hospitals/${profileDetails._id}`, {
        hospitalName,
        contactPerson,
        phone
      });

      if (res.data.success) {
        addToast('Hospital profile updated successfully!', 'success');
        refetchProfile();
      }
    } catch (e) {
      addToast('Failed to update hospital profile', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">Hospital Entity Profile</h3>
        <p className="text-muted small mb-0">Manage hospital registration and authorized contact person</p>
      </div>

      <div className="card card-healthcare p-4 max-w-2xl shadow-sm">
        <form onSubmit={handleSave}>
          <div className="d-flex align-items-center gap-3 mb-4 border-bottom pb-3">
            <FaHospital className="text-primary fs-1" />
            <div>
              <h5 className="fw-bold mb-0">{profileDetails?.hospitalName || user?.name}</h5>
              <small className="text-muted">Reg No: {profileDetails?.registrationNumber}</small>
            </div>
          </div>

          <div className="mb-3">
            <label className="form-label fw-semibold">Hospital Name</label>
            <input type="text" className="form-control" value={hospitalName} onChange={e => setHospitalName(e.target.value)} required />
          </div>

          <div className="row g-3 mb-4">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Authorized Contact Person</label>
              <input type="text" className="form-control" value={contactPerson} onChange={e => setContactPerson(e.target.value)} required />
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Emergency Phone Hotline</label>
              <input type="text" className="form-control" value={phone} onChange={e => setPhone(e.target.value)} required />
            </div>
          </div>

          <button type="submit" className="btn btn-blood-danger d-flex align-items-center gap-2" disabled={loading}>
            <FaSave /> {loading ? 'Saving...' : 'Update Hospital Profile'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default HospitalProfilePage;
