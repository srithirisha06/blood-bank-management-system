import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';

const DonationHistoryPage = () => {
  const [donations, setDonations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/donations');
      if (res.data.success) {
        setDonations(res.data.donations || []);
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
        <h3 className="fw-bold brand-font text-dark mb-0">My Donation History</h3>
        <p className="text-muted small mb-0">View all past blood donations and lab testing statuses</p>
      </div>

      <div className="card card-healthcare overflow-hidden">
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Donation Date</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Location / Camp</th>
                <th>Pipeline Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="5" className="text-center py-4">Loading history...</td>
                </tr>
              ) : donations.length === 0 ? (
                <tr>
                  <td colSpan="5" className="text-center py-4 text-muted">No donation history recorded yet.</td>
                </tr>
              ) : (
                donations.map(d => (
                  <tr key={d._id}>
                    <td>{new Date(d.donationDate).toLocaleDateString()}</td>
                    <td><BloodBadge bloodGroup={d.bloodGroup} /></td>
                    <td>{d.units} Unit(s)</td>
                    <td>{d.campId?.campName || 'Main Center'}</td>
                    <td>
                      <span className={`badge ${
                        d.status === 'Stored' ? 'bg-success' :
                        d.status === 'Testing' ? 'bg-info text-dark' :
                        d.status === 'Rejected' ? 'bg-danger' : 'bg-warning text-dark'
                      }`}>
                        {d.status}
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

export default DonationHistoryPage;
