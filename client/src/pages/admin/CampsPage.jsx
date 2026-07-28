import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { FaCampground, FaPlus, FaMapMarkerAlt, FaCalendarAlt, FaClock, FaTrash } from 'react-icons/fa';

const CampsPage = () => {
  const { addToast } = useToast();
  const [camps, setCamps] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [showModal, setShowModal] = useState(false);
  const [campName, setCampName] = useState('');
  const [venue, setVenue] = useState('');
  const [organizer, setOrganizer] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('09:00 AM - 04:00 PM');
  const [capacity, setCapacity] = useState(150);
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchCamps();
  }, []);

  const fetchCamps = async () => {
    try {
      setLoading(true);
      const res = await api.get('/camps');
      if (res.data.success) {
        setCamps(res.data.camps || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateCamp = async (e) => {
    e.preventDefault();
    try {
      const res = await api.post('/camps', {
        campName,
        venue,
        organizer,
        date,
        time,
        capacity: Number(capacity),
        description
      });

      if (res.data.success) {
        addToast('Blood donation camp scheduled!', 'success');
        setShowModal(false);
        setCampName('');
        setVenue('');
        setOrganizer('');
        fetchCamps();
      }
    } catch (e) {
      addToast('Failed to schedule camp', 'error');
    }
  };

  const handleDeleteCamp = async (id) => {
    if (!window.confirm('Cancel and remove this blood camp?')) return;
    try {
      const res = await api.delete(`/camps/${id}`);
      if (res.data.success) {
        addToast('Camp removed', 'success');
        fetchCamps();
      }
    } catch (e) {
      addToast('Failed to remove camp', 'error');
    }
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">Blood Donation Camps</h3>
          <p className="text-muted small mb-0">Organize community blood drives and mobile collection centers</p>
        </div>
        <button className="btn btn-blood-danger d-flex align-items-center gap-2" onClick={() => setShowModal(true)}>
          <FaPlus /> Schedule New Camp
        </button>
      </div>

      <div className="row g-4">
        {loading ? (
          <div className="col-12 text-center py-5">Loading blood camps...</div>
        ) : camps.length === 0 ? (
          <div className="col-12 text-center py-5 text-muted">No blood camps scheduled.</div>
        ) : (
          camps.map((camp) => (
            <div key={camp._id} className="col-md-6 col-lg-4">
              <div className="card card-healthcare p-4 h-100 position-relative">
                <span className="badge bg-primary position-absolute top-0 end-0 m-3">{camp.status}</span>
                <div className="fs-2 text-danger mb-2"><FaCampground /></div>
                <h5 className="fw-bold text-dark">{camp.campName}</h5>
                <p className="text-muted small mb-2"><FaMapMarkerAlt className="text-danger me-1" /> {camp.venue}</p>
                <p className="text-secondary small mb-1"><FaCalendarAlt className="me-1" /> {new Date(camp.date).toLocaleDateString()}</p>
                <p className="text-secondary small mb-2"><FaClock className="me-1" /> {camp.time}</p>
                <p className="small text-dark mb-3"><strong>Organizer:</strong> {camp.organizer}</p>
                <div className="mt-auto d-flex justify-content-between align-items-center pt-2 border-top">
                  <small className="text-muted">Capacity: {camp.capacity} Donors</small>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => handleDeleteCamp(camp._id)}>
                    <FaTrash /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showModal && (
        <div className="modal d-block bg-dark bg-opacity-50" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content card-healthcare">
              <div className="modal-header border-bottom">
                <h5 className="modal-title fw-bold">Schedule Blood Drive Camp</h5>
                <button type="button" className="btn-close" onClick={() => setShowModal(false)}></button>
              </div>
              <form onSubmit={handleCreateCamp}>
                <div className="modal-body">
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Camp Title</label>
                    <input type="text" className="form-control" required value={campName} onChange={e => setCampName(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Venue / Address</label>
                    <input type="text" className="form-control" required value={venue} onChange={e => setVenue(e.target.value)} />
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-semibold">Organizer Details</label>
                    <input type="text" className="form-control" required value={organizer} onChange={e => setOrganizer(e.target.value)} />
                  </div>
                  <div className="row g-2 mb-3">
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Date</label>
                      <input type="date" className="form-control" required value={date} onChange={e => setDate(e.target.value)} />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-semibold">Time Slot</label>
                      <input type="text" className="form-control" required value={time} onChange={e => setTime(e.target.value)} />
                    </div>
                  </div>
                </div>
                <div className="modal-footer border-top">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-blood-danger">Publish Camp</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CampsPage;
