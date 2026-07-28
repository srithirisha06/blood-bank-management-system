import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FaHospital, FaPlus, FaSearch, FaTrash, FaPhone, FaEnvelope } from 'react-icons/fa';

const HospitalsPage = () => {
  const { addToast } = useToast();
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [hospitalName, setHospitalName] = useState('');
  const [registrationNumber, setRegistrationNumber] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    fetchHospitals();
  }, [search]);

  const fetchHospitals = async () => {
    try {
      setLoading(true);
      const res = await api.get('/hospitals', { params: { search } });
      if (res.data.success) {
        setHospitals(res.data.hospitals);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateHospital = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/hospitals', {
        hospitalName,
        registrationNumber,
        contactPerson,
        phone,
        email,
        password: password || 'Hospital@123'
      });

      if (res.data.success) {
        addToast('Hospital registered successfully!', 'success');
        setShowModal(false);
        setHospitalName('');
        setRegistrationNumber('');
        setContactPerson('');
        setPhone('');
        setEmail('');
        fetchHospitals();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to register hospital', 'error');
    }
  };

  const handleDeleteHospital = async (id) => {
    if (!window.confirm('Delete this hospital account?')) return;
    try {
      const res = await api.delete(`/hospitals/${id}`);
      if (res.data.success) {
        addToast('Hospital deleted', 'success');
        fetchHospitals();
      }
    } catch (e) {
      addToast('Failed to delete hospital', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">Partner Hospitals</h3>
          <p className="text-muted small mb-0">Medical centers authorized to place emergency blood requests</p>
        </div>
        <button className="btn btn-blood-danger d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <FaPlus /> Register Hospital
        </button>
      </div>

      <div className="card card-healthcare p-3 mb-4">
        <div className="input-group">
          <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
          <input
            type="text"
            className="form-control"
            placeholder="Search hospital by name, reg number, or contact person..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Hospital Name</th>
                <th>Reg. Number</th>
                <th>Contact Person</th>
                <th>Phone</th>
                <th>Email</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading hospitals...</td>
                </tr>
              ) : hospitals.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No hospitals registered.</td>
                </tr>
              ) : (
                hospitals.map((h) => (
                  <tr key={h._id}>
                    <td className="fw-semibold text-dark">
                      <FaHospital className="text-primary me-2" /> {h.hospitalName}
                    </td>
                    <td><code>{h.registrationNumber}</code></td>
                    <td>{h.contactPerson}</td>
                    <td><FaPhone className="text-muted me-1 small" /> {h.phone}</td>
                    <td><FaEnvelope className="text-muted me-1 small" /> {h.email}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteHospital(h._id)}>
                        <FaTrash />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-healthcare">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Register Hospital Entity</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateHospital}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Hospital Name</label>
                    <input type="text" className="form-control" required value={hospitalName} onChange={e => setHospitalName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Registration Number</label>
                    <input type="text" className="form-control" required value={registrationNumber} onChange={e => setRegistrationNumber(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Contact Person</label>
                    <input type="text" className="form-control" required value={contactPerson} onChange={e => setContactPerson(e.target.value)} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <input type="text" className="form-control" required value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Portal Email</label>
                      <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-blood-danger">Register Hospital</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default HospitalsPage;
