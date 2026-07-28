import React from 'react';

const StatCard = ({ title, value, icon, color = 'danger', subtitle }) => {
  return (
    <div className="card card-healthcare stat-card-gradient p-3 h-100">
      <div className="d-flex align-items-center justify-content-between">
        <div>
          <span className="text-muted text-uppercase fw-semibold small d-block mb-1">{title}</span>
          <h3 className="fw-bold mb-0 text-dark">{value}</h3>
          {subtitle && <small className="text-muted">{subtitle}</small>}
        </div>
        <div className={`rounded-circle p-3 bg-${color} bg-opacity-10 text-${color} fs-3 d-flex align-items-center justify-content-center`}>
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatCard;
