import React, { useState } from 'react';
import BloodBadge from './BloodBadge';

const CompatibilityChecker = () => {
  const [selectedGroup, setSelectedGroup] = useState('O+');

  const compatibilityMap = {
    'O-': { giveTo: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'], receiveFrom: ['O-'] },
    'O+': { giveTo: ['O+', 'A+', 'B+', 'AB+'], receiveFrom: ['O-', 'O+'] },
    'A-': { giveTo: ['A-', 'A+', 'AB-', 'AB+'], receiveFrom: ['O-', 'A-'] },
    'A+': { giveTo: ['A+', 'AB+'], receiveFrom: ['O-', 'O+', 'A-', 'A+'] },
    'B-': { giveTo: ['B-', 'B+', 'AB-', 'AB+'], receiveFrom: ['O-', 'B-'] },
    'B+': { giveTo: ['B+', 'AB+'], receiveFrom: ['O-', 'O+', 'B-', 'B+'] },
    'AB-': { giveTo: ['AB-', 'AB+'], receiveFrom: ['O-', 'A-', 'B-', 'AB-'] },
    'AB+': { giveTo: ['AB+'], receiveFrom: ['O-', 'O+', 'A-', 'A+', 'B-', 'B+', 'AB-', 'AB+'] }
  };

  const currentInfo = compatibilityMap[selectedGroup];

  return (
    <div className="card card-healthcare p-4 shadow-sm">
      <h5 className="fw-bold brand-font text-dark mb-3">🩸 Blood Group Compatibility Matrix</h5>
      <p className="text-muted small">
        Select a blood group to see compatible donors (who can give blood to you) and compatible recipients (who you can donate to).
      </p>

      <div className="d-flex flex-wrap gap-2 mb-4">
        {Object.keys(compatibilityMap).map((bg) => (
          <button
            key={bg}
            className={`btn btn-sm ${selectedGroup === bg ? 'btn-danger fw-bold' : 'btn-outline-secondary'}`}
            onClick={() => setSelectedGroup(bg)}
          >
            {bg}
          </button>
        ))}
      </div>

      <div className="row g-3">
        <div className="col-md-6">
          <div className="p-3 border rounded bg-light">
            <h6 className="fw-bold text-success mb-2">Can Receive Blood From:</h6>
            <div className="d-flex flex-wrap gap-2">
              {currentInfo.receiveFrom.map((bg) => (
                <BloodBadge key={bg} bloodGroup={bg} />
              ))}
            </div>
            {selectedGroup === 'AB+' && (
              <small className="badge bg-success mt-2">Universal Recipient</small>
            )}
          </div>
        </div>

        <div className="col-md-6">
          <div className="p-3 border rounded bg-light">
            <h6 className="fw-bold text-danger mb-2">Can Donate Blood To:</h6>
            <div className="d-flex flex-wrap gap-2">
              {currentInfo.giveTo.map((bg) => (
                <BloodBadge key={bg} bloodGroup={bg} />
              ))}
            </div>
            {selectedGroup === 'O-' && (
              <small className="badge bg-danger mt-2">Universal Donor</small>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompatibilityChecker;
