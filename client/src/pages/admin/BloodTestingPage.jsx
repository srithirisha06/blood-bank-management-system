import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';
import { useToast } from '../../context/ToastContext';
import { FaVials, FaCheckCircle, FaTimesCircle, FaPlus } from 'react-icons/fa';

const BloodTestingPage = () => {
  const { addToast } = useToast();
  const [tests, setTests] = useState([]);
  const [pendingDonations, setPendingDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Lab Test Modal State
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
      const res = await api.get('/blood-tests');
      if (res.data.success) {
        setTests(res.data.bloodTests || []);
      }

      // Fetch collected/testing donations for modal selection
      const donRes = await api.get('/donations?status=Testing');
      if (donRes.data.success) {
        setPendingDonations(donRes.data.donations || []);
        if (donRes.data.donations.length > 0) {
          setDonationId(donRes.data.donations[0]._id);
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleRecordTest = async (e) => {
    e.preventDefault();
    if (!donationId) {
      addToast('No donation selected for lab testing', 'warning');
      return;
    }

    try {
      const res = await api.post('/blood-tests', {
        donationId,
        hiv,
        hepatitisB,
        hepatitisC,
        malaria,
        syphilis,
        hemoglobin: Number(hemoglobin),
        bloodPressure,
        remarks
      });

      if (res.data.success) {
        const isApproved = res.data.donationStatus === 'Stored';
        addToast(
          isApproved
            ? 'Lab test APPROVED! Blood batch added to Inventory.'
            : 'Lab test REJECTED due to safety flags.',
          isApproved ? 'success' : 'warning'
        );
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
          <h3 className="fw-bold brand-font text-dark mb-0">Laboratory Screening & Safety Testing</h3>
          <p className="text-muted small mb-0">Infectious disease screening (HIV, Hep B/C, Malaria, Syphilis, Hb count)</p>
        </div>
        <button
          className="btn btn-blood-danger d-flex align-items-center gap-2"
          onClick={() => setShowModal(true)}
        >
          <FaPlus /> Record New Lab Test
        </button>
      </div>

      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Donation ID / Donor</th>
                <th>Blood Group</th>
                <th>HIV / Hep B / Hep C</th>
                <th>Malaria / Syphilis</th>
                <th>Hb Level</th>
                <th>BP</th>
                <th>Lab Status</th>
                <th>Tested By</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Loading lab test results...</td>
                </tr>
              ) : tests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No lab test records found.</td>
                </tr>
              ) : (
                tests.map((t) => (
                  <tr key={t._id}>
                    <td>
                      <div className="fw-semibold text-dark">{t.donationId?.donorId?.userId?.name || 'Sample Donor'}</div>
                      <small className="text-muted">ID: {t.donationId?._id.slice(-6)}</small>
                    </td>
                    <td><BloodBadge bloodGroup={t.donationId?.bloodGroup} /></td>
                    <td>
                      <small className="d-block">HIV: <span className={t.hiv === 'Negative' ? 'text-success fw-bold' : 'text-danger fw-bold'}>{t.hiv}</span></small>
                      <small className="d-block">HepB: {t.hepatitisB} | HepC: {t.hepatitisC}</small>
                    </td>
                    <td>
                      <small className="d-block">Malaria: {t.malaria}</small>
                      <small className="d-block">Syphilis: {t.syphilis}</small>
                    </td>
                    <td className="fw-bold">{t.hemoglobin} g/dL</td>
                    <td>{t.bloodPressure}</td>
                    <td>
                      {t.status === 'Approved' ? (
                        <span className="badge bg-success d-inline-flex align-items-center gap-1"><FaCheckCircle /> Approved</span>
                      ) : (
                        <span className="badge bg-danger d-inline-flex align-items-center gap-1"><FaTimesCircle /> Rejected</span>
                      )}
                    </td>
                    <td>{t.testedBy?.name || 'Lab Staff'}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Lab Test Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content card-healthcare">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Record Laboratory Test Results</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleRecordTest}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Select Collected Blood Sample</label>
                    <select className="form-select" value={donationId} onChange={e => setDonationId(e.target.value)} required>
                      {pendingDonations.length === 0 ? (
                        <option value="">No samples pending lab testing</option>
                      ) : (
                        pendingDonations.map(pd => (
                          <option key={pd._id} value={pd._id}>
                            {pd.donorId?.userId?.name || 'Donor'} ({pd.bloodGroup}) - Collected {new Date(pd.donationDate).toLocaleDateString()}
                          </option>
                        ))
                      )}
                    </select>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">HIV Status</label>
                      <select className="form-select" value={hiv} onChange={e => setHiv(e.target.value)}>
                        <option value="Negative">Negative (Pass)</option>
                        <option value="Positive">Positive (Fail)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Hepatitis B</label>
                      <select className="form-select" value={hepatitisB} onChange={e => setHepatitisB(e.target.value)}>
                        <option value="Negative">Negative (Pass)</option>
                        <option value="Positive">Positive (Fail)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Hepatitis C</label>
                      <select className="form-select" value={hepatitisC} onChange={e => setHepatitisC(e.target.value)}>
                        <option value="Negative">Negative (Pass)</option>
                        <option value="Positive">Positive (Fail)</option>
                      </select>
                    </div>
                  </div>

                  <div className="row g-3 mb-3">
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Malaria Test</label>
                      <select className="form-select" value={malaria} onChange={e => setMalaria(e.target.value)}>
                        <option value="Negative">Negative (Pass)</option>
                        <option value="Positive">Positive (Fail)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Syphilis Test</label>
                      <select className="form-select" value={syphilis} onChange={e => setSyphilis(e.target.value)}>
                        <option value="Negative">Negative (Pass)</option>
                        <option value="Positive">Positive (Fail)</option>
                      </select>
                    </div>
                    <div className="col-md-4">
                      <label className="form-label fw-semibold">Hemoglobin (g/dL)</label>
                      <input type="number" step="0.1" className="form-control" value={hemoglobin} onChange={e => setHemoglobin(e.target.value)} required />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label fw-semibold">Remarks / Lab Notes</label>
                    <textarea className="form-control" rows="2" value={remarks} onChange={e => setRemarks(e.target.value)} placeholder="Lab observations..."></textarea>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-blood-danger">Submit Test & Update Inventory</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BloodTestingPage;
