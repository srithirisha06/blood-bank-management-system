import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';
import { useToast } from '../../context/ToastContext';
import { FaHandHoldingHeart, FaVials, FaCheck } from 'react-icons/fa';

const DonationsPage = () => {
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
        setDonations(res.data.donations);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      const res = await api.put(`/donations/${id}/status`, { status });
      if (res.data.success) {
        addToast(`Donation status updated to ${status}`, 'success');
        fetchDonations();
      }
    } catch (e) {
      addToast('Failed to update status', 'error');
    }
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">Donation Collections & Workflow</h3>
        <p className="text-muted small mb-0">Track donor collection pipeline from registration through lab storage</p>
      </div>

      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Donor Name</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Donation Date</th>
                <th>Staff Responsible</th>
                <th>Workflow Status</th>
                <th className="text-end">Update Progress</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">Loading donation records...</td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No donation records found.</td>
                </tr>
              ) : (
                donations.map((d) => (
                  <tr key={d._id}>
                    <td className="fw-semibold text-dark">{d.donorId?.userId?.name || 'Unknown Donor'}</td>
                    <td><BloodBadge bloodGroup={d.bloodGroup} /></td>
                    <td>{d.units} Unit(s)</td>
                    <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                    <td>{d.staffId?.name || 'Unassigned'}</td>
                    <td>
                      <span className={`badge ${
                        d.status === 'Stored' ? 'bg-success' :
                        d.status === 'Testing' ? 'bg-info text-dark' :
                        d.status === 'Collected' ? 'bg-primary' :
                        d.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {d.status}
                      </span>
                    </td>
                    <td className="text-end">
                      {d.status === 'Registered' && (
                        <button className="btn btn-sm btn-outline-primary me-1" onClick={() => handleUpdateStatus(d._id, 'Screening')}>
                          Start Screening
                        </button>
                      )}
                      {d.status === 'Screening' && (
                        <button className="btn btn-sm btn-primary me-1" onClick={() => handleUpdateStatus(d._id, 'Collected')}>
                          Mark Collected
                        </button>
                      )}
                      {d.status === 'Collected' && (
                        <button className="btn btn-sm btn-info me-1" onClick={() => handleUpdateStatus(d._id, 'Testing')}>
                          Send to Lab Test
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

export default DonationsPage;
