/*
 * Shadow presets for React Native (iOS shadowX + Android elevation).
 *
 * cardDefault — standard card lift (subtle, used everywhere)
 * cardElevated — bottom sheet, modals
 * glow — cyan accent glow on active markers / FAB
 * none — explicitly no shadow
 */

export const Shadows = {

  none: {
    shadowColor: 'transparent',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0,
    shadowRadius: 0,
    elevation: 0,
  },

  cardDefault: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 5,
  },

  cardElevated: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.35,
    shadowRadius: 16,
    elevation: 10,
  },

  glow: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },

  glowSubtle: {
    shadowColor: '#00D4FF',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },

  fab: {
    shadowColor: '#00BCD4',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.40,
    shadowRadius: 10,
    elevation: 8,
  },
};
