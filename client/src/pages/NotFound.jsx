import React from 'react';
import { Link } from 'react-router-dom';

const NotFound = () => {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-light text-center p-4">
      <div>
        <h1 className="display-1 fw-bold text-danger brand-font">404</h1>
        <h3 className="fw-semibold text-dark mb-3">Page Not Found</h3>
        <p className="text-muted mb-4">The requested blood bank portal page does not exist or has been moved.</p>
        <Link to="/" className="btn btn-blood-danger rounded-pill px-4">
          Return Home
        </Link>
      </div>
    </div>
  );
};

export default NotFound;
