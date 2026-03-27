/*
 * Color tokens extracted from mockup designs (pics(mobile)/1-1 ~ 4.png).
 * Dark-mode-first palette: deep navy background, cyan primary accent,
 * orange secondary, purple tertiary, with translucent border/glow variants.
 */

export const Colors = {

  // ── Backgrounds ──────────────────────────────────────
  background:       '#0A0E1A',
  surface:          '#141829',
  surfaceLight:     '#1A2035',
  surfaceElevated:  '#1E2440',
  overlay:          'rgba(10, 14, 26, 0.92)',

  // ── Borders (translucent cyan tints) ─────────────────
  borderSubtle:     'rgba(0, 212, 255, 0.10)',
  borderDefault:    'rgba(0, 212, 255, 0.18)',
  borderMedium:     'rgba(0, 212, 255, 0.28)',
  borderAccent:     '#00D4FF',

  // ── Primary (Cyan / Teal) ────────────────────────────
  primary:          '#00D4FF',
  primaryDark:      '#00B4D8',
  primaryMuted:     '#0891B2',
  primarySoft:      'rgba(0, 212, 255, 0.15)',
  primaryGlow:      'rgba(0, 212, 255, 0.30)',

  // ── Secondary (Orange — Hub coffee bars, warm accents) ─
  secondary:        '#FF6B35',
  secondaryDark:    '#E55A2B',
  secondaryMuted:   'rgba(255, 107, 53, 0.18)',

  // ── Tertiary (Purple — expense card, gradient accents) ─
  tertiary:         '#A855F7',
  tertiaryDark:     '#7C3AED',
  tertiaryMuted:    'rgba(168, 85, 247, 0.18)',

  // ── Semantic ─────────────────────────────────────────
  success:          '#10B981',
  successMuted:     'rgba(16, 185, 129, 0.18)',
  danger:           '#FF4757',
  dangerMuted:      'rgba(255, 71, 87, 0.18)',
  warning:          '#FBBF24',

  // ── Text ─────────────────────────────────────────────
  textPrimary:      '#FFFFFF',
  textSecondary:    '#8A8F9E',
  textTertiary:     '#5A5F70',
  textAccent:       '#00D4FF',
  textInverse:      '#0A0E1A',

  // ── Tab bar ──────────────────────────────────────────
  tabBarBg:         '#111528',
  tabBarBorder:     'rgba(0, 212, 255, 0.08)',
  tabBarActive:     '#00D4FF',
  tabBarInactive:   '#6B7080',

  // ── Interactive elements ─────────────────────────────
  chipBg:           'rgba(0, 212, 255, 0.08)',
  chipBorder:       'rgba(0, 212, 255, 0.30)',
  dismissBg:        '#3A3E4A',
  sliderTrack:      '#2A2E3E',
  sliderThumb:      '#00D4FF',
  fabBg:            '#00BCD4',

  // ── Gradients (start/end pairs for LinearGradient) ───
  gradientTeal:     ['#00D4FF', '#0891B2'],
  gradientPurple:   ['#A855F7', '#EC4899'],
  gradientCyan:     ['#00E5FF', '#06B6D4'],
  gradientHeart:    ['#38BDF8', '#00D4FF'],
  gradientOverlay:  ['transparent', 'rgba(10, 14, 26, 0.85)'],
};
