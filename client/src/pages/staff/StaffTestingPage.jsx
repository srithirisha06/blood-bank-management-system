import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import BloodBadge from '../../components/BloodBadge';
import { FaVials, FaPlus, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';

const StaffTestingPage = () => {
  const { addToast } = useToast();
  const [tests, setTests] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lab form state
  const [showModal, setShowModal] = useState(false);
  const [donationId, setDonationId] = useState('');
  const [hiv, setHiv] = useState('Negative');
  const [hepatitisB, setHepatitisB] = useState('Negative');
  const [hepatitisC, setHepatitisC] = useState('Negative');
  const [malaria, setMalaria] = useState('Negative');
  const [syphilis, setSyphilis] = useState('Negative');
  const [hemoglobin, setHemoglobin] = useState(13.5);
  const [bloodPressure, setBloodPressure] = useState('120/80');
  const [remarks, setRemarks] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [testRes, donRes] = await Promise.all([
        api.get('/blood-tests'),
        api.get('/donations?status=Testing')
      ]);
      if (testRes.data.success) setTests(testRes.data.bloodTests || []);
      if (donRes.data.success) {
        const pending = donRes.data.donations || [];
        setPendingDonations(pending);
        if (pending.length > 0) setDonationId(pending[0]._id);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitTest = async (e) => {
    e.preventDefault();
    if (!donationId) {
      addToast('No donation sample selected', 'warning');
      return;
    }
    try {
      const res = await api.post('/blood-tests', {
        donationId, hiv, hepatitisB, hepatitisC,
        malaria, syphilis,
        hemoglobin: Number(hemoglobin),
        bloodPressure, remarks
      });
      if (res.data.success) {
        const passed = res.data.donationStatus === 'Stored';
        addToast(passed ? '✅ Sample APPROVED — inventory updated!' : '❌ Sample REJECTED — flagged for disposal', passed ? 'success' : 'error');
        setShowModal(false);
        fetchData();
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit test results', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">Blood Lab Testing Panel</h3>
          <p className="text-muted small mb-0">Enter HIV, Hep B/C, Malaria, Syphilis, and Hemoglobin screening results</p>
        </div>
        <button className="btn btn-blood-danger d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <FaPlus /> Enter Lab Results
        </button>
      </div>

      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Blood Group</th>
                <th>HIV / Hep B / Hep C</th>
                <th>Malaria / Syphilis</th>
                <th>Hb (g/dL)</th>
                <th>BP</th>
                <th>Lab Verdict</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading lab records...</td></tr>
              ) : tests.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No lab test records yet.</td></tr>
              ) : (
                tests.map(t => (
                  <tr key={t._id}>
                    <td className="fw-semibold">{t.donationId?.donorId?.userId?.name || 'Unknown'}</td>
                    <td><BloodBadge bloodGroup={t.donationId?.bloodGroup} /></td>
                    <td>
                      <small className="d-block">HIV: <span className={t.hiv === 'Negative' ? 'text-success fw-bold' : 'text-danger fw-bold'}>{t.hiv}</span></small>
                      <small>HepB: {t.hepatitisB} | HepC: {t.hepatitisC}</small>
                    </td>
                    <td>
                      <small className="d-block">Malaria: {t.malaria}</small>
                      <small>Syphilis: {t.syphilis}</small>
                    </td>
                    <td className="fw-bold">{t.hemoglobin}</td>
                    <td>{t.bloodPressure}</td>
                    <td>
                      {t.status === 'Approved'
                        ? <span className="badge bg-success"><FaCheckCircle className="me-1" />Approved</span>
                        : <span className="badge bg-danger"><FaTimesCircle className="me-1" />Rejected</span>
                      }
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Lab Results Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content card-healthcare">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold"><FaVials className="text-danger me-2" />Enter Laboratory Test Results</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleSubmitTest}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Blood Donation Sample (Testing Queue)</label>
                    <select className="form-select" value={donationId} onChange={e => setDonationId(e.target.value)} required>
                      {pendingDonations.length === 0
                        ? <option value="">No samples in testing queue</option>
                        : pendingDonations.map(d => (
                          <option key={d._id} value={d._id}>
                            {d.donorId?.userId?.name || 'Donor'} — {d.bloodGroup} — {new Date(d.donationDate).toLocaleDateString()}
                          </option>
                        ))}
                    </select>
                  </div>
                  <div className="row g-3 mb-3">
                    {[
                      { label: 'HIV Test', val: hiv, set: setHiv },
                      { label: 'Hepatitis B', val: hepatitisB, set: setHepatitisB },
                      { label: 'Hepatitis C', val: hepatitisC, set: setHepatitisC },
                      { label: 'Malaria', val: malaria, set: setMalaria },
                      { label: 'Syphilis', val: syphilis, set: setSyphilis },
                    ].map(({ label, val, set }) => (
                      <div className="col-md-4" key={label}>
                        <label className="form-label fw-semibold">{label}</label>
                        <select className="form-select" value={val} onChange={e => set(e.target.value)}>
                          <option value="Negative">Negative ✓ (Pass)</option>
                          <option value="Positive">Positive ✗ (Fail)</option>
                        </select>
                      </div>
                    ))}
                  </div>
                  <div className="row g-3 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Hemoglobin (g/dL)</label>
                      <input type="number" step="0.1" min="0" max="25" className="form-control" value={hemoglobin} onChange={e => setHemoglobin(e.target.value)} required />
                      <small className="text-muted">Minimum 12.5 g/dL required for approval</small>
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Blood Pressure (mmHg)</label>
                      <input type="text" className="form-control" value={bloodPressure} onChange={e => setBloodPressure(e.target.value)} placeholder="120/80" required />
                    </div>
                  </div>
                  <div className="mb-2">
                    <label className="form-label fw-semibold">Lab Remarks</label>
                    <textarea className="form-control" rows="2" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Any additional laboratory observations..."></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-blood-danger">Submit & Auto-Update Inventory</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default StaffTestingPage;
