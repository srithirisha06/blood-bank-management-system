/**
 * Blood group compatibility reference data
 * Defines who can donate to whom and who can receive from whom
 */
export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];

export const COMPATIBILITY_MAP = {
  'O-':  { giveTo: ['O-','O+','A-','A+','B-','B+','AB-','AB+'], receiveFrom: ['O-'] },
  'O+':  { giveTo: ['O+','A+','B+','AB+'],                      receiveFrom: ['O-','O+'] },
  'A-':  { giveTo: ['A-','A+','AB-','AB+'],                     receiveFrom: ['O-','A-'] },
  'A+':  { giveTo: ['A+','AB+'],                                 receiveFrom: ['O-','O+','A-','A+'] },
  'B-':  { giveTo: ['B-','B+','AB-','AB+'],                     receiveFrom: ['O-','B-'] },
  'B+':  { giveTo: ['B+','AB+'],                                 receiveFrom: ['O-','O+','B-','B+'] },
  'AB-': { giveTo: ['AB-','AB+'],                                receiveFrom: ['O-','A-','B-','AB-'] },
  'AB+': { giveTo: ['AB+'],                                      receiveFrom: ['O-','O+','A-','A+','B-','B+','AB-','AB+'] },
};

export const DONATION_STATUS_STEPS = [
  'Registered',
  'Screening',
  'Collected',
  'Testing',
  'Stored',
];

export const REQUEST_STATUS_STEPS = [
  'Pending',
  'Approved',
  'Allocated',
  'Completed',
];

export const PRIORITY_LEVELS = ['Normal', 'Urgent', 'Emergency'];

export const CAMP_STATUSES = ['Upcoming', 'Ongoing', 'Completed', 'Cancelled'];

export const INVENTORY_STATUSES = ['Available', 'Reserved', 'Expired', 'Discarded'];

/** Returns CSS class for blood group badge */
export const getBloodGroupClass = (bg) => {
  const map = {
    'A+': 'badge-blood-ap',
    'A-': 'badge-blood-an',
    'B+': 'badge-blood-bp',
    'B-': 'badge-blood-bn',
    'AB+': 'badge-blood-abp',
    'AB-': 'badge-blood-abn',
    'O+': 'badge-blood-op',
    'O-': 'badge-blood-on',
  };
  return map[bg] || 'badge-blood-op';
};

/** Format a JS Date to readable string */
export const formatDate = (dateStr) => {
  if (!dateStr) return 'N/A';
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

/** Truncate long strings */
export const truncate = (str, length = 30) => {
  if (!str) return '';
  return str.length > length ? str.substring(0, length) + '...' : str;
};
