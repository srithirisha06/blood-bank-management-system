import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';
import { FaBoxes, FaExclamationTriangle } from 'react-icons/fa';

const StaffInventoryPage = () => {
  const [summary, setSummary] = useState({});
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInventory();
  }, []);

  const fetchInventory = async () => {
    try {
      setLoading(true);
      const res = await api.get('/inventory');
      if (res.data.success) {
        setSummary(res.data.summary || {});
        setInventory(res.data.inventory || []);
        setLowStock(res.data.lowStockGroups || []);
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
        <h3 className="fw-bold brand-font text-dark mb-0">Blood Stock Audit</h3>
        <p className="text-muted small mb-0">View current blood inventory levels across all blood groups</p>
      </div>

      {lowStock.length > 0 && (
        <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center mb-4 rounded-3">
          <FaExclamationTriangle className="fs-3 me-3 text-warning" />
          <div>
            <h6 className="fw-bold mb-0">Low Stock Alert</h6>
            <small>{lowStock.map(l => `${l.bloodGroup}: ${l.units} units`).join(' | ')}</small>
          </div>
        </div>
      )}

      {/* Blood Group Summary Cards */}
      <div className="row g-3 mb-4">
        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => {
          const count = summary[bg] || 0;
          const isLow = count < 5;
          return (
            <div key={bg} className="col-md-3 col-6">
              <div className={`card card-healthcare p-3 text-center border-start border-4 ${isLow ? 'border-danger' : 'border-success'}`}>
                <BloodBadge bloodGroup={bg} />
                <h3 className="fw-bold text-dark mt-2 mb-0">{count}</h3>
                <small className={isLow ? 'text-danger fw-bold' : 'text-success'}>
                  {isLow ? '⚠ Low Stock' : '✓ Adequate'}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Batch Table */}
      <div className="card card-healthcare overflow-hidden">
        <div className="card-header bg-white border-bottom p-3">
          <h5 className="fw-bold brand-font text-dark mb-0"><FaBoxes className="text-danger me-2" />Current Batch Inventory</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Batch Number</th>
                <th>Blood Group</th>
                <th>Available Units</th>
                <th>Collection Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="6" className="text-center py-4">Loading stock data...</td></tr>
              ) : inventory.length === 0 ? (
                <tr><td colSpan="6" className="text-center py-4 text-muted">No inventory batches available.</td></tr>
              ) : (
                inventory.map(item => {
                  const isExpiringSoon = new Date(item.expiryDate) < new Date(Date.now() + 3 * 24 * 60 * 60 * 1000);
                  return (
                    <tr key={item._id} className={isExpiringSoon ? 'table-warning' : ''}>
                      <td><code>{item.batchNumber}</code></td>
                      <td><BloodBadge bloodGroup={item.bloodGroup} /></td>
                      <td className="fw-bold">{item.units} Units</td>
                      <td>{new Date(item.collectionDate).toLocaleDateString()}</td>
                      <td className={isExpiringSoon ? 'text-danger fw-bold' : ''}>
                        {new Date(item.expiryDate).toLocaleDateString()}
                        {isExpiringSoon && ' ⚠ Expiring Soon!'}
                      </td>
                      <td>
                        <span className={`badge ${item.status === 'Available' ? 'bg-success' : item.status === 'Reserved' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                          {item.status}
                        </span>
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

export default StaffInventoryPage;
