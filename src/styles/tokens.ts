/**
 * CourseCompass Design Tokens
 * Strict adherence to the warm, editorial learning-product design system.
 */

export const colors = {
  // Surfaces
  warmIvory: '#F8F7EF',
  paleCream: '#F1F2E6',
  lightSage: '#DCE5CE',
  softOlive: '#A8B594',
  deepOlive: '#697650',
  forestGreen: '#263F2B',
  white: '#FFFFFF',

  // Typography
  mainText: '#17241B',
  secondaryText: '#5D655B',
  mutedText: '#777E70',

  // Functional Accents & States
  crimsonCTA: '#D71935',
  softCrimson: '#F8E2E3',
  border: '#E1E4D8',
  amberWarning: '#B45309',
  amberSurface: '#FEF3C7',
  emeraldSuccess: '#166534',
  emeraldSurface: '#DCFCE7',
  neutralDisabled: '#9CA3AF'
} as const;

export const typography = {
  fontSerifDisplay: "'Fraunces', Georgia, serif",
  fontSansBody: "'Plus Jakarta Sans', system-ui, -apple-system, sans-serif",
  fontMonoCode: "'JetBrains Mono', monospace"
} as const;

export const spacing = {
  xs: '4px',
  sm: '8px',
  md: '12px',
  base: '16px',
  lg: '24px',
  xl: '32px',
  '2xl': '48px',
  '3xl': '64px'
} as const;
