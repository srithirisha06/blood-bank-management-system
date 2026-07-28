import React from 'react';

const BloodBadge = ({ bloodGroup }) => {
  if (!bloodGroup) return null;

  const bgClassMap = {
    'A+': 'badge-blood-ap',
    'A-': 'badge-blood-an',
    'B+': 'badge-blood-bp',
    'B-': 'badge-blood-bn',
    'AB+': 'badge-blood-abp',
    'AB-': 'badge-blood-abn',
    'O+': 'badge-blood-op',
    'O-': 'badge-blood-on'
  };

  const badgeClass = bgClassMap[bloodGroup] || 'badge-blood-op';

  return (
    <span className={`badge-blood ${badgeClass}`}>
      <span>🩸</span> {bloodGroup}
    </span>
  );
};

export default BloodBadge;
