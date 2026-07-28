import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';

const RequestHistoryPage = () => {
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

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">Hospital Request History</h3>
        <p className="text-muted small mb-0">Track blood request approvals and allocation status</p>
      </div>

      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Patient Name</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Priority</th>
                <th>Required Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" className="text-center py-4">Loading request history...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="6" className="text-center py-4 text-muted">No requests submitted yet.</td>
                </tr>
              ) : (
                requests.map(r => (
                  <tr key={r._id}>
                    <td className="fw-semibold text-dark">{r.patientName}</td>
                    <td><BloodBadge bloodGroup={r.bloodGroup} /></td>
                    <td className="fw-bold text-danger">{r.units} Unit(s)</td>
                    <td><span className="badge bg-secondary">{r.priority}</span></td>
                    <td>{new Date(r.requiredDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${
                        r.status === 'Completed' ? 'bg-success' :
                        r.status === 'Allocated' ? 'bg-info text-dark' :
                        r.status === 'Approved' ? 'bg-primary' :
                        r.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {r.status}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default RequestHistoryPage;
