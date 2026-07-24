export const BLOOD_GROUPS = ['A+', 'A-', 'B+', 'B-', 'O+', 'O-', 'AB+', 'AB-'] as const;

export const VISIT_TYPES = [
  { value: 'new', label: 'New Visit' },
  { value: 'follow_up', label: 'Follow Up' },
  { value: 'telemedicine', label: 'Telemedicine' },
] as const;

export const COMMON_DOSAGES = [
  { value: '1+0+1', label: '1+0+1 (Twice daily, Morning and Night)' },
  { value: '1+1+1', label: '1+1+1 (Thrice daily)' },
  { value: '1+0+0', label: '1+0+0 (Once daily, Morning)' },
  { value: '0+0+1', label: '0+0+1 (Once daily, Night)' },
  { value: '1+1+1+1', label: '1+1+1+1 (Four times daily)' },
  { value: '0+1+0', label: '0+1+0 (Once daily, Noon)' },
] as const;

export const COMMON_DURATIONS = [
  '3 days',
  '5 days',
  '7 days',
  '10 days',
  '2 weeks',
  '1 month',
  'Continue',
] as const;
