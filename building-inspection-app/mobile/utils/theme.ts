export const Colors = {
  primary: '#2563EB',
  primaryDark: '#1D4ED8',
  primaryLight: '#EFF6FF',
  background: '#F3F4F6',
  white: '#FFFFFF',
  text: '#111827',
  textSecondary: '#6B7280',
  textMuted: '#9CA3AF',
  border: '#E5E7EB',
  borderLight: '#F3F4F6',
  success: '#16A34A',
  successLight: '#F0FDF4',
  danger: '#DC2626',
  dangerLight: '#FEF2F2',
  warning: '#D97706',
  warningLight: '#FFFBEB',
  info: '#0284C7',
  infoLight: '#F0F9FF',
};

export const urgencyColors: Record<string, { bg: string; text: string; label: string }> = {
  'välitön': { bg: '#FEF2F2', text: '#DC2626', label: 'Välitön' },
  '1-2v': { bg: '#FFF7ED', text: '#EA580C', label: '1–2 v' },
  '3-5v': { bg: '#FEFCE8', text: '#CA8A04', label: '3–5 v' },
  'seurattava': { bg: '#EFF6FF', text: '#2563EB', label: 'Seurattava' },
  'ei_toimenpiteitä': { bg: '#F9FAFB', text: '#6B7280', label: 'Ei toimenpiteitä' },
};

export const Spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
};

export const Radius = {
  sm: 6,
  md: 10,
  lg: 14,
  xl: 20,
};
