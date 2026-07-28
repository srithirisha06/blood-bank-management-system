import React, { useEffect, useState } from 'react';
import api from '../../services/api';
import { FaChartBar, FaDownload, FaFileAlt } from 'react-icons/fa';

const ReportsPage = () => {
  const [timeframe, setTimeframe] = useState('monthly');
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchReport();
  }, [timeframe]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/reports?timeframe=${timeframe}`);
      if (res.data.success) {
        setReport(res.data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 className="fw-bold brand-font text-dark mb-0">System Reports & Audit Aggregation</h3>
          <p className="text-muted small mb-0">Generate periodic blood bank operations reports</p>
        </div>
        <div className="d-flex gap-2">
          <select className="form-select w-auto" value={timeframe} onChange={(e) => setTimeframe(e.target.value)}>
            <option value="daily">Daily Report</option>
            <option value="weekly">Weekly Report</option>
            <option value="monthly">Monthly Report</option>
            <option value="annual">Annual Report</option>
          </select>
          <button className="btn btn-outline-danger d-flex align-items-center gap-2" onClick={handlePrint}>
            <FaDownload /> Print / Export PDF
          </button>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-5">Loading operations report...</div>
      ) : (
        <div className="card card-healthcare p-4 shadow-sm">
          <div className="d-flex align-items-center gap-3 border-bottom pb-3 mb-4">
            <span className="fs-1 text-danger"><FaFileAlt /></span>
            <div>
              <h4 className="fw-bold brand-font text-dark mb-0">
                {timeframe.toUpperCase()} BLOOD BANK OPERATIONS SUMMARY
              </h4>
              <small className="text-muted">Generated on {new Date().toLocaleDateString()}</small>
            </div>
          </div>

          <div className="row g-4 mb-4">
            <div className="col-md-3">
              <div className="p-3 bg-light rounded text-center border">
                <div className="text-muted small text-uppercase">Donations Collected</div>
                <h3 className="fw-bold text-danger my-1">{report?.summary?.totalDonationsCollected || 0}</h3>
                <small className="text-muted">{report?.summary?.totalDonationUnits || 0} Total Units</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3 bg-light rounded text-center border">
                <div className="text-muted small text-uppercase">Requests Received</div>
                <h3 className="fw-bold text-primary my-1">{report?.summary?.totalRequestsReceived || 0}</h3>
                <small className="text-muted">From Hospitals</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3 bg-light rounded text-center border">
                <div className="text-muted small text-uppercase">Approved Requests</div>
                <h3 className="fw-bold text-success my-1">{report?.summary?.approvedRequestsCount || 0}</h3>
                <small className="text-success">Fulfilled</small>
              </div>
            </div>

            <div className="col-md-3">
              <div className="p-3 bg-light rounded text-center border">
                <div className="text-muted small text-uppercase">Batches Added</div>
                <h3 className="fw-bold text-dark my-1">{report?.summary?.inventoryBatchesAdded || 0}</h3>
                <small className="text-muted">In Inventory</small>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ReportsPage;
