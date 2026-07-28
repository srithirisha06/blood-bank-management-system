import React from 'react';
import { FaSpinner } from 'react-icons/fa';

/**
 * Full-page loading spinner for route transitions and data fetches
 */
const LoadingSpinner = ({ text = 'Loading...' }) => {
  return (
    <div className="d-flex flex-column justify-content-center align-items-center"
      style={{ minHeight: '300px', gap: '16px' }}>
      <div className="spinner-border text-danger" style={{ width: '3rem', height: '3rem' }} role="status">
        <span className="visually-hidden">Loading...</span>
      </div>
      <span className="text-muted fw-semibold">{text}</span>
    </div>
  );
};

export default LoadingSpinner;
