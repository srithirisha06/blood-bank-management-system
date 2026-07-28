import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';
import { useToast } from '../../context/ToastContext';
import { FaHandHoldingHeart, FaArrowRight } from 'react-icons/fa';

const StaffDonationCollectionPage = () => {
  const { addToast } = useToast();
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDonations();
  }, []);

  const fetchDonations = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations');
      if (res.data.success) {
        // Show only active pipeline (not stored/rejected)
        const active = (res.data.donations || []).filter(d => !['Stored', 'Rejected'].includes(d.status));
        setDonations(active);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleProgress = async (id, nextStatus) => {
    try {
      const res = await api.put(`/donations/${id}/status`, { status: nextStatus });
      if (res.data.success) {
        addToast(`Donation moved to ${nextStatus}`, 'success');
        fetchDonations();
      }
    } catch (e) {
      addToast('Failed to update status', 'error');
    }
  };

  const handleReject = async (id) => {
    const reason = window.prompt('Rejection reason (e.g. deferred, low Hb):');
    if (!reason) return;
    try {
      const res = await api.put(`/donations/${id}/status`, { status: 'Rejected', rejectionReason: reason });
      if (res.data.success) {
        addToast('Donor deferred from current cycle', 'warning');
        fetchDonations();
      }
    } catch (e) {
      addToast('Failed to reject', 'error');
    }
  };

  const getNextStatus = (current) => {
    const flow = { Registered: 'Screening', Screening: 'Collected', Collected: 'Testing' };
    return flow[current] || null;
  };

  const getNextLabel = (current) => {
    const labels = { Registered: 'Start Screening', Screening: 'Mark Blood Collected', Collected: 'Send to Lab Testing' };
    return labels[current] || null;
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">Donor Screening & Collection Queue</h3>
        <p className="text-muted small mb-0">Move donors through the collection pipeline: Registered → Screening → Collected → Testing</p>
      </div>

      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Donor</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Date</th>
                <th>Camp</th>
                <th>Current Status</th>
                <th className="text-end">Pipeline Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" className="text-center py-4">Loading donation queue...</td></tr>
              ) : donations.length === 0 ? (
                <tr><td colSpan="7" className="text-center py-4 text-muted">No active donations in the pipeline.</td></tr>
              ) : (
                donations.map(d => {
                  const next = getNextStatus(d.status);
                  const label = getNextLabel(d.status);
                  return (
                    <tr key={d._id}>
                      <td className="fw-semibold text-dark">{d.donorId?.userId?.name || 'Unknown'}</td>
                      <td><BloodBadge bloodGroup={d.bloodGroup} /></td>
                      <td>{d.units} Unit(s)</td>
                      <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                      <td>{d.campId?.campName || 'Main Center'}</td>
                      <td>
                        <span className="badge bg-warning text-dark">{d.status}</span>
                      </td>
                      <td className="text-end">
                        {next && (
                          <button
                            className="btn btn-sm btn-primary me-2 d-inline-flex align-items-center gap-1"
                            onClick={() => handleProgress(d._id, next)}
                          >
                            {label} <FaArrowRight />
                          </button>
                        )}
                        {d.status !== 'Rejected' && (
                          <button
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleReject(d._id)}
                          >
                            Defer Donor
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default StaffDonationCollectionPage;
