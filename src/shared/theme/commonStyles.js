/*
 * Composite style presets assembled from tokens.
 * These map directly to recurring UI patterns across all mockup screens.
 *
 * Usage:  import { CommonStyles } from 'src/shared/theme';
 *         <View style={CommonStyles.card}> ... </View>
 */

import { Colors }                      from './colors';
import { Spacing }                     from './spacing';
import { Typography }                  from './typography';
import { BorderRadius, BorderWidth }   from './borders';
import { Shadows }                     from './shadows';

export const CommonStyles = {

  // ── Full-screen container ────────────────────────────
  screen: {
    flex: 1,
    backgroundColor: Colors.background,
  },

  screenPadded: {
    flex: 1,
    backgroundColor: Colors.background,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.screenVertical,
  },

  // ── App header bar (top bar with app name) ───────────
  // Rounded pill bar visible on Hub/Journeys/Discover/Profile
  appHeader: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xxl,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    marginTop: Spacing.sm,
  },

  appHeaderTitle: {
    ...Typography.appTitle,
    color: Colors.textPrimary,
  },

  appHeaderSubtitle: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xxs,
  },

  // ── Standard card ────────────────────────────────────
  // Dark card with subtle cyan border (journey cards, stat sections)
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.borderDefault,
    padding: Spacing.cardPadding,
    ...Shadows.cardDefault,
  },

  cardFlat: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.borderDefault,
    padding: Spacing.cardPadding,
  },

  // ── Stat card (Total Trips / Total Spent) ────────────
  statCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    borderWidth: BorderWidth.medium,
    padding: Spacing.cardPadding,
    flex: 1,
  },

  statValue: {
    ...Typography.statLarge,
    color: Colors.textPrimary,
  },

  statLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
  },

  // ── Chip / Tag ("Culture", "Adventure", location pills) ──
  chip: {
    backgroundColor: Colors.chipBg,
    borderRadius: BorderRadius.pill,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.chipBorder,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
  },

  chipText: {
    ...Typography.tagText,
    color: Colors.textAccent,
  },

  // ── Inline stat chip (Spent / Photos / Places) ──────
  inlineStat: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    borderWidth: BorderWidth.thin,
    borderColor: Colors.borderSubtle,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },

  inlineStatLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },

  inlineStatValue: {
    ...Typography.statSmall,
    color: Colors.textPrimary,
    marginTop: Spacing.xxs,
  },

  // ── Section header ("My Journeys", "Community Insights") ──
  sectionHeader: {
    ...Typography.section,
    color: Colors.textPrimary,
    marginBottom: Spacing.md,
  },

  sectionSubheader: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginBottom: Spacing.lg,
  },

  // ── Bottom sheet ─────────────────────────────────────
  bottomSheet: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xxl,
    borderTopRightRadius: BorderRadius.xxl,
    paddingHorizontal: Spacing.screenHorizontal,
    paddingTop: Spacing.lg,
    ...Shadows.cardElevated,
  },

  bottomSheetHandle: {
    width: 40,
    height: 4,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.textTertiary,
    alignSelf: 'center',
    marginBottom: Spacing.lg,
  },

  // ── Tab bar ──────────────────────────────────────────
  tabBar: {
    backgroundColor: Colors.tabBarBg,
    borderTopWidth: BorderWidth.thin,
    borderTopColor: Colors.tabBarBorder,
    paddingBottom: Spacing.sm,
    paddingTop: Spacing.sm,
  },

  tabBarActiveIcon: {
    backgroundColor: Colors.tabBarActive,
    borderRadius: BorderRadius.full,
    width: 48,
    height: 48,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glowSubtle,
  },

  // ── FAB (floating action button) ─────────────────────
  fab: {
    position: 'absolute',
    right: Spacing.screenHorizontal,
    bottom: Spacing.xxl,
    width: 56,
    height: 56,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.fabBg,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.fab,
  },

  // ── Circular action buttons (dismiss / save) ─────────
  actionCircle: {
    width: 52,
    height: 52,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
  },

  dismissCircle: {
    backgroundColor: Colors.dismissBg,
  },

  saveCircle: {
    backgroundColor: Colors.primary,
  },

  // ── Progress bar base ────────────────────────────────
  progressTrack: {
    height: 6,
    borderRadius: BorderRadius.sm,
    backgroundColor: Colors.sliderTrack,
  },

  progressFill: {
    height: 6,
    borderRadius: BorderRadius.sm,
  },

  // ── Badge pill ("Globetrotter Level 7") ──────────────
  badge: {
    backgroundColor: Colors.primarySoft,
    borderRadius: BorderRadius.pill,
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },

  badgeDot: {
    width: 8,
    height: 8,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.success,
  },

  badgeText: {
    ...Typography.tagText,
    color: Colors.textAccent,
  },

  // ── Label row (key + value horizontal) ───────────────
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },

  // ── Divider ──────────────────────────────────────────
  divider: {
    height: 1,
    backgroundColor: Colors.borderSubtle,
    marginVertical: Spacing.md,
  },

  // ── "Hidden Gem" badge ───────────────────────────────
  hiddenGemBadge: {
    backgroundColor: Colors.danger,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
  },

  hiddenGemText: {
    ...Typography.caption,
    color: Colors.textPrimary,
    fontWeight: '700',
  },
};
