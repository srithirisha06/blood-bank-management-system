import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';
import { useToast } from '../../context/ToastContext';
import { FaUserPlus, FaSearch, FaEye, FaTrash, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const DonorsPage = () => {
  const { addToast } = useToast();
  const [donors, setDonors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [bloodGroupFilter, setBloodGroupFilter] = useState('');
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [donorHistory, setDonorHistory] = useState([]);

  // Create Donor Modal
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [gender, setGender] = useState('Male');
  const [dob, setDob] = useState('1998-01-01');
  const [weight, setWeight] = useState(65);

  useEffect(() => {
    fetchDonors();
  }, [search, bloodGroupFilter]);

  const fetchDonors = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donors', {
        params: { search, bloodGroup: bloodGroupFilter }
      });
      if (res.data.success) {
        setDonors(res.data.donors);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = async (donor) => {
    try {
      setSelectedDonor(donor);
      const res = await api.get(`/donors/${donor._id}`);
      if (res.data.success) {
        setDonorHistory(res.data.history || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleCreateDonor = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/donors', {
        name,
        email,
        phone,
        bloodGroup,
        gender,
        dob,
        weight: Number(weight)
      });
      if (res.data.success) {
        addToast('Donor added successfully!', 'success');
        setShowCreateModal(false);
        fetchDonors();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to add donor', 'error');
    }
  };

  const handleDeleteDonor = async (id) => {
    if (!window.confirm('Are you sure you want to delete this donor?')) return;
    try {
      const res = await api.delete(`/donors/${id}`);
      if (res.data.success) {
        addToast('Donor removed successfully', 'success');
        fetchDonors();
      }
    } catch (error) {
      addToast('Failed to delete donor', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">Donor Registry</h3>
          <p className="text-muted small mb-0">Registered blood donors, eligibility status, and history</p>
        </div>
        <button className="btn btn-blood-danger d-flex align-items-center gap-2" onClick={() => setShowCreateModal(true)}>
          <FaUserPlus /> Register New Donor
        </button>
      </div>

      {/* Search & Filters */}
      <div className="card card-healthcare p-3 mb-4">
        <div className="row g-3">
          <div className="col-md-8">
            <div className="input-group">
              <span className="input-group-text bg-white"><FaSearch className="text-muted" /></span>
              <input
                type="text"
                className="form-control"
                placeholder="Search donor by name, email, or phone..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
          </div>
          <div className="col-md-4">
            <select className="form-select" value={bloodGroupFilter} onChange={(e) => setBloodGroupFilter(e.target.value)}>
              <option value="">All Blood Groups</option>
              {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                <option key={bg} value={bg}>{bg}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Donors Table */}
      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Blood Group</th>
                <th>Gender / Age</th>
                <th>Weight</th>
                <th>Phone</th>
                <th>Eligibility</th>
                <th>Last Donation</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Loading donors...</td>
                </tr>
              ) : donors.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No donors registered.</td>
                </tr>
              ) : (
                donors.map((d) => (
                  <tr key={d._id}>
                    <td className="fw-semibold text-dark">{d.userId?.name || 'N/A'}</td>
                    <td><BloodBadge bloodGroup={d.bloodGroup} /></td>
                    <td>{d.gender}, {d.age} yrs</td>
                    <td>{d.weight} kg</td>
                    <td>{d.phone}</td>
                    <td>
                      {d.eligibility ? (
                        <span className="badge bg-success d-inline-flex align-items-center gap-1"><FaCheckCircle /> Eligible</span>
                      ) : (
                        <span className="badge bg-danger d-inline-flex align-items-center gap-1"><FaTimesCircle /> Ineligible</span>
                      )}
                    </td>
                    <td>{d.lastDonationDate ? new Date(d.lastDonationDate).toLocaleDateString() : 'Never'}</td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-primary me-2" onClick={() => handleViewProfile(d)}>
                        <FaEye />
                      </button>
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteDonor(d._id)}>
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

      {/* View Profile Modal */}
      {selectedDonor && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content card-healthcare">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Donor Profile: {selectedDonor.userId?.name}</h5>
                <button type="button" className="btn-close" onClick={() => setSelectedDonor(null)}></button>
              </div>
              <div className="modal-body">
                <div className="row g-3 mb-4">
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Blood Group:</strong> <BloodBadge bloodGroup={selectedDonor.bloodGroup} /></p>
                    <p className="mb-1"><strong>Email:</strong> {selectedDonor.userId?.email}</p>
                    <p className="mb-1"><strong>Phone:</strong> {selectedDonor.phone}</p>
                  </div>
                  <div className="col-md-6">
                    <p className="mb-1"><strong>Age & Weight:</strong> {selectedDonor.age} yrs / {selectedDonor.weight} kg</p>
                    <p className="mb-1"><strong>Last Donation:</strong> {selectedDonor.lastDonationDate ? new Date(selectedDonor.lastDonationDate).toLocaleDateString() : 'None'}</p>
                  </div>
                </div>

                <h6 className="fw-bold border-bottom pb-2 mb-3">Past Donation Records</h6>
                {donorHistory.length === 0 ? (
                  <p className="text-muted small">No past donation records found for this donor.</p>
                ) : (
                  <ul className="list-group list-group-flush small">
                    {donorHistory.map(h => (
                      <li key={h._id} className="list-group-item d-flex justify-content-between">
                        <span>{new Date(h.donationDate).toLocaleDateString()} - {h.units} Unit(s) {h.bloodGroup}</span>
                        <span className={`badge ${h.status === 'Stored' ? 'bg-success' : 'bg-warning text-dark'}`}>{h.status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Donor Modal */}
      {showCreateModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-healthcare">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Register New Blood Donor</h5>
                <button type="button" className="btn-close" onClick={() => setShowCreateModal(false)}></button>
              </div>
              <form onSubmit={handleCreateDonor}>
                <div className="modal-body">
                  <div className="row g-2">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Name</label>
                      <input type="text" className="form-control" required value={name} onChange={e => setName(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Email</label>
                      <input type="email" className="form-control" required value={email} onChange={e => setEmail(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Phone</label>
                      <input type="text" className="form-control" required value={phone} onChange={e => setPhone(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Blood Group</label>
                      <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                          <option key={bg} value={bg}>{bg}</option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Gender</label>
                      <select className="form-select" value={gender} onChange={e => setGender(e.target.value)}>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Weight (kg)</label>
                      <input type="number" className="form-control" required value={weight} onChange={e => setWeight(e.target.value)} />
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Date of Birth</label>
                      <input type="date" className="form-control" required value={dob} onChange={e => setDob(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowCreateModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-blood-danger">Save Donor</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DonorsPage;
