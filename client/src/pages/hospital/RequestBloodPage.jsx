import React, { useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { useNavigate } from 'react-router-dom';
import { FaHeartbeat, FaExclamationTriangle } from 'react-icons/fa';

const RequestBloodPage = () => {
  const { addToast } = useToast();
  const navigate = useNavigate();

  const [patientName, setPatientName] = useState('');
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [units, setUnits] = useState(2);
  const [priority, setPriority] = useState('Urgent');
  const [requiredDate, setRequiredDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      const res = await api.post('/requests', {
        patientName,
        bloodGroup,
        units: Number(units),
        priority,
        requiredDate,
        reason
      });

      if (res.data.success) {
        addToast('Emergency blood request submitted! Admins notified.', 'success');
        navigate('/hospital/history');
      }
    } catch (error) {
      addToast(error.response?.data?.message || 'Failed to submit request', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">Submit Hospital Blood Request</h3>
        <p className="text-muted small mb-0">Request urgent or emergency blood units from central inventory</p>
      </div>

      <div className="card card-healthcare p-4 max-w-2xl shadow-sm">
        <form onSubmit={handleSubmit}>
          <div className="mb-3">
            <label className="form-label fw-semibold">Patient Name</label>
            <input
              type="text"
              className="form-control"
              placeholder="Full patient name"
              value={patientName}
              onChange={e => setPatientName(e.target.value)}
              required
            />
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Blood Group Required</label>
              <select className="form-select" value={bloodGroup} onChange={e => setBloodGroup(e.target.value)}>
                {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                  <option key={bg} value={bg}>{bg}</option>
                ))}
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Units Required</label>
              <input
                type="number"
                className="form-control"
                min="1"
                max="50"
                value={units}
                onChange={e => setUnits(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="row g-3 mb-3">
            <div className="col-md-6">
              <label className="form-label fw-semibold">Request Priority</label>
              <select className="form-select" value={priority} onChange={e => setPriority(e.target.value)}>
                <option value="Normal">Normal (Elective Surgery)</option>
                <option value="Urgent">Urgent (Within 24 Hours)</option>
                <option value="Emergency">Emergency (Immediate Dispatch)</option>
              </select>
            </div>

            <div className="col-md-6">
              <label className="form-label fw-semibold">Required By Date</label>
              <input
                type="date"
                className="form-control"
                value={requiredDate}
                onChange={e => setRequiredDate(e.target.value)}
                required
              />
            </div>
          </div>

          <div className="mb-4">
            <label className="form-label fw-semibold">Medical Reason / Notes</label>
            <textarea
              className="form-control"
              rows="3"
              placeholder="Trauma support, surgical procedure, anemia treatment..."
              value={reason}
              onChange={e => setReason(e.target.value)}
            ></textarea>
          </div>

          <button type="submit" className="btn btn-blood-danger w-100 py-2" disabled={loading}>
            {loading ? 'Submitting Request...' : 'Dispatch Blood Request'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RequestBloodPage;
