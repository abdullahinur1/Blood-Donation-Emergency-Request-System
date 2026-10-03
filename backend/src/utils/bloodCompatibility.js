// Blood Compatibility Matrix
const COMPATIBLE_DONORS_FOR_RECIPIENT = {
  'A+': ['A+', 'A-', 'O+', 'O-'],
  'A-': ['A-', 'O-'],
  'B+': ['B+', 'B-', 'O+', 'O-'],
  'B-': ['B-', 'O-'],
  'AB+': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'AB-': ['AB-', 'A-', 'B-', 'O-'],
  'O+': ['O+', 'O-'],
  'O-': ['O-'],
};

const COMPATIBLE_RECIPIENTS_FOR_DONOR = {
  'O-': ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'],
  'O+': ['O+', 'A+', 'B+', 'AB+'],
  'A-': ['A-', 'A+', 'AB-', 'AB+'],
  'A+': ['A+', 'AB+'],
  'B-': ['B-', 'B+', 'AB-', 'AB+'],
  'B+': ['B+', 'AB+'],
  'AB-': ['AB-', 'AB+'],
  'AB+': ['AB+'],
};

/**
 * Returns array of blood groups that can donate to the recipient
 */
const getCompatibleDonorGroups = (recipientGroup) => {
  return COMPATIBLE_DONORS_FOR_RECIPIENT[recipientGroup] || [];
};

/**
 * Returns array of blood groups that this donor can give blood to
 */
const getCompatibleRecipientGroups = (donorGroup) => {
  return COMPATIBLE_RECIPIENTS_FOR_DONOR[donorGroup] || [];
};

/**
 * Checks whether a donor blood group is compatible with a recipient blood group
 */
const isCompatible = (donorGroup, recipientGroup) => {
  const compatible = COMPATIBLE_DONORS_FOR_RECIPIENT[recipientGroup];
  return compatible ? compatible.includes(donorGroup) : false;
};

module.exports = {
  COMPATIBLE_DONORS_FOR_RECIPIENT,
  COMPATIBLE_RECIPIENTS_FOR_DONOR,
  getCompatibleDonorGroups,
  getCompatibleRecipientGroups,
  isCompatible,
};
