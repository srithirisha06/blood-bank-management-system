import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import BloodBadge from '../../components/BloodBadge';
import { useToast } from '../../context/ToastContext';
import { FaBoxes, FaPlus, FaExclamationTriangle, FaTrash } from 'react-icons/fa';

const InventoryPage = () => {
  const { addToast } = useToast();
  const [summary, setSummary] = useState({});
  const [inventory, setInventory] = useState([]);
  const [lowStock, setLowStock] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal State
  const [showModal, setShowModal] = useState(false);
  const [bloodGroup, setBloodGroup] = useState('O+');
  const [units, setUnits] = useState(5);
  const [collectionDate, setCollectionDate] = useState(new Date().toISOString().split('T')[0]);

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
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleAddBatch = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/inventory', {
        bloodGroup,
        units: Number(units),
        collectionDate
      });
      if (res.data.success) {
        addToast('Blood batch added to inventory stock!', 'success');
        setShowModal(false);
        fetchInventory();
      }
    } catch (error) {
      addToast('Failed to add batch', 'error');
    }
  };

  const handleDeleteItem = async (id) => {
    if (!window.confirm('Remove this batch from inventory?')) return;
    try {
      const res = await api.delete(`/inventory/${id}`);
      if (res.data.success) {
        addToast('Batch removed from inventory', 'success');
        fetchInventory();
      }
    } catch (e) {
      addToast('Failed to remove batch', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">Blood Inventory Control</h3>
          <p className="text-muted small mb-0">Real-time blood component availability and batch tracking</p>
        </div>
        <button className="btn btn-blood-danger d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <FaPlus /> Add Blood Batch
        </button>
      </div>

      {/* Low Stock Banner */}
      {lowStock.length > 0 && (
        <div className="alert alert-warning border-0 shadow-sm d-flex align-items-center mb-4 rounded-3 p-3">
          <FaExclamationTriangle className="fs-3 me-3 text-warning" />
          <div>
            <h6 className="fw-bold mb-0">Low Stock Warning</h6>
            <small className="text-dark">
              The following blood groups have low available stock: {lowStock.map(l => `${l.bloodGroup} (${l.units} Units)`).join(', ')}
            </small>
          </div>
        </div>
      )}

      {/* Stock Overview Cards Grid */}
      <div className="row g-3 mb-4">
        {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map((bg) => {
          const count = summary[bg] || 0;
          const isLow = count < 5;
          return (
            <div key={bg} className="col-md-3 col-6">
              <div className={`card card-healthcare p-3 text-center border-start border-4 ${isLow ? 'border-danger bg-danger bg-opacity-10' : 'border-success'}`}>
                <BloodBadge bloodGroup={bg} />
                <h3 className="fw-bold text-dark mt-2 mb-0">{count} <small className="fs-6 fw-normal text-muted">Units</small></h3>
                <small className={isLow ? 'text-danger fw-bold' : 'text-muted'}>
                  {isLow ? 'Low Stock' : 'Optimal'}
                </small>
              </div>
            </div>
          );
        })}
      </div>

      {/* Detailed Batches Table */}
      <div className="card card-healthcare overflow-hidden">
        <div className="card-header bg-white border-bottom p-3">
          <h5 className="fw-bold brand-font text-dark mb-0">Active Blood Batches</h5>
        </div>
        <div className="table-responsive">
          <table className="table table-custom mb-0">
            <thead>
              <tr>
                <th>Batch Number</th>
                <th>Blood Group</th>
                <th>Units</th>
                <th>Collection Date</th>
                <th>Expiry Date</th>
                <th>Status</th>
                <th className="text-end">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" className="text-center py-4">Loading batches...</td>
                </tr>
              ) : inventory.length === 0 ? (
                <tr>
                  <td colSpan="7" className="text-center py-4 text-muted">No inventory batches recorded.</td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item._id}>
                    <td><code>{item.batchNumber}</code></td>
                    <td><BloodBadge bloodGroup={item.bloodGroup} /></td>
                    <td className="fw-bold text-dark">{item.units} Units</td>
                    <td>{new Date(item.collectionDate).toLocaleDateString()}</td>
                    <td>{new Date(item.expiryDate).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${item.status === 'Available' ? 'bg-success' : item.status === 'Reserved' ? 'bg-warning text-dark' : 'bg-danger'}`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="text-end">
                      <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteItem(item._id)}>
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

      {/* Add Batch Modal */}
      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-healthcare">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Add Blood Batch to Inventory</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleAddBatch}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Blood Group</label>
                    <select className="form-select" value={bloodGroup} onChange={(e) => setBloodGroup(e.target.value)}>
                      {['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'].map(bg => (
                        <option key={bg} value={bg}>{bg}</option>
                      ))}
                    </select>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Units (350ml - 450ml units)</label>
                    <input type="number" className="form-control" required min="1" max="100" value={units} onChange={(e) => setUnits(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Collection Date</label>
                    <input type="date" className="form-control" required value={collectionDate} onChange={(e) => setCollectionDate(e.target.value)} />
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-blood-danger">Add to Stock</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default InventoryPage;
