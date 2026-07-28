import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';
import { useToast } from '../../context/ToastContext';
import { FaHeartbeat, FaCheck, FaTimes, FaBoxOpen } from 'react-icons/fa';

const RequestsPage = () => {
  const { addToast } = useToast();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');

  useEffect(() => {
    fetchRequests();
  }, [statusFilter]);

  const fetchRequests = async () => {
    try {
      setLoading(true);
      const res = await api.get('/requests', { params: { status: statusFilter } });
      if (res.data.success) {
        setRequests(res.data.requests);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status, rejectionReason = '') => {
    try {
      const res = await api.put(`/requests/${id}/status`, { status, rejectionReason });
      if (res.data.success) {
        addToast(`Request marked as ${status}!`, 'success');
        fetchRequests();
      }
    } catch (error) {
      addToast(error.response?.data?.message || `Failed to set status to ${status}`, 'error');
    }
  };

  const getPriorityBadge = (priority) => {
    if (priority === 'Emergency') return <span className="badge bg-danger">Emergency</span>;
    if (priority === 'Urgent') return <span className="badge bg-warning text-dark">Urgent</span>;
    return <span className="badge bg-secondary">Normal</span>;
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">Hospital Blood Requests</h3>
          <p className="text-muted small mb-0">Review emergency blood requests, approve, and allocate inventory units</p>
        </div>
        <select className="form-select w-auto" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="Pending">Pending</option>
          <option value="Approved">Approved</option>
          <option value="Allocated">Allocated</option>
          <option value="Completed">Completed</option>
          <option value="Rejected">Rejected</option>
        </select>
      </div>

      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Hospital</th>
                <th>Patient Name</th>
                <th>Blood Group</th>
                <th>Units Required</th>
                <th>Priority</th>
                <th>Required Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="8" className="text-center py-4">Loading requests...</td>
                </tr>
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan="8" className="text-center py-4 text-muted">No blood requests found.</td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r._id}>
                    <td className="fw-semibold text-dark">{r.hospitalId?.hospitalName || 'Unknown Hospital'}</td>
                    <td>{r.patientName}</td>
                    <td><BloodBadge bloodGroup={r.bloodGroup} /></td>
                    <td className="fw-bold text-danger">{r.units} Unit(s)</td>
                    <td>{getPriorityBadge(r.priority)}</td>
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
                    <td className="text-end">
                      {r.status === 'Pending' && (
                        <>
                          <button
                            className="btn btn-sm btn-success me-1"
                            title="Approve Request"
                            onClick={() => handleUpdateStatus(r._id, 'Approved')}
                          >
                            <FaCheck /> Approve
                          </button>
                          <button
                            className="btn btn-sm btn-outline-danger"
                            title="Reject Request"
                            onClick={() => {
                              const reason = window.prompt('Enter rejection reason:');
                              if (reason) handleUpdateStatus(r._id, 'Rejected', reason);
                            }}
                          >
                            <FaTimes /> Reject
                          </button>
                        </>
                      )}

                      {r.status === 'Approved' && (
                        <button
                          className="btn btn-sm btn-warning text-dark me-1"
                          title="Allocate Inventory Stock"
                          onClick={() => handleUpdateStatus(r._id, 'Allocated')}
                        >
                          <FaBoxOpen /> Allocate Stock
                        </button>
                      )}

                      {r.status === 'Allocated' && (
                        <button
                          className="btn btn-sm btn-success"
                          title="Mark Request Completed"
                          onClick={() => handleUpdateStatus(r._id, 'Completed')}
                        >
                          <FaCheck /> Complete
                        </button>
                      )}
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

export default RequestsPage;
