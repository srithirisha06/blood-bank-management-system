import React from 'react';
import { useToast } from '../../context/ToastContext';
import { FaCog, FaShieldAlt, FaSave } from 'react-icons/fa';

const SettingsPage = () => {
  const { addToast } = useToast();

  const handleSave = (e) => {
    e.preventDefault();
    addToast('System settings saved successfully!', 'success');
  };

  return (
    <div>
      <div className="mb-4">
        <h3 className="fw-bold brand-font text-dark mb-0">System Settings & Configuration</h3>
        <p className="text-muted small mb-0">Manage security thresholds, notifications, and shelf life parameters</p>
      </div>

      <div className="row g-4">
        <div className="col-lg-8">
          <div className="card card-healthcare p-4 shadow-sm">
            <form onSubmit={handleSave}>
              <h5 className="fw-bold brand-font text-dark mb-3"><FaCog className="text-danger me-2" /> General System Configuration</h5>
              <div className="mb-3">
                <label className="form-label fw-semibold">Blood Bank Name</label>
                <input type="text" className="form-control" defaultValue="Metropolis Central Blood Bank" />
              </div>
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Low Stock Threshold (Units)</label>
                  <input type="number" className="form-control" defaultValue="5" />
                </div>
                <div className="col-md-6">
                  <label className="form-label fw-semibold">Default Shelf Life (Days)</label>
                  <input type="number" className="form-control" defaultValue="35" />
                </div>
              </div>
              <div className="mb-3">
                <label className="form-label fw-semibold">Emergency Support Hotline</label>
                <input type="text" className="form-control" defaultValue="+1 800-BLOOD-FLOW" />
              </div>

              <h5 className="fw-bold brand-font text-dark mt-4 mb-3"><FaShieldAlt className="text-danger me-2" /> Security & Session Rules</h5>
              <div className="form-check form-switch mb-3">
                <input className="form-check-input" type="checkbox" id="flexSwitchJWT" defaultChecked />
                <label className="form-check-label fw-semibold" htmlFor="flexSwitchJWT">Require JWT Token Refresh Cookie</label>
              </div>
              <div className="form-check form-switch mb-4">
                <input className="form-check-input" type="checkbox" id="flexSwitchLab" defaultChecked />
                <label className="form-check-label fw-semibold" htmlFor="flexSwitchLab">Require Mandatory Lab Approval Before Stocking Units</label>
              </div>

              <button type="submit" className="btn btn-blood-danger d-flex align-items-center gap-2">
                <FaSave /> Save Configuration
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
