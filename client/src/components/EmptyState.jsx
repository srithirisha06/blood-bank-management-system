import React from 'react';
import { FaInbox } from 'react-icons/fa';

/**
 * Displayed when a data table / list has zero records
 */
const EmptyState = ({ title = 'No Records Found', description = 'There are no items to display.', icon }) => {
  return (
    <div className="text-center py-5 px-3">
      <div className="mb-3 text-secondary" style={{ fontSize: '3.5rem' }}>
        {icon || <FaInbox />}
      </div>
      <h5 className="fw-bold text-dark mb-1">{title}</h5>
      <p className="text-muted small">{description}</p>
    </div>
  );
};

export default EmptyState;
