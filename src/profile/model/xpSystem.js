export const MAX_LEVEL = 10;
const BASE_XP_STEP = 50;

const TITLE_BY_LEVEL_RANGE = [
  { min: 1, max: 2, title: 'Trail Rookie' },
  { min: 3, max: 4, title: 'Road Seeker' },
  { min: 5, max: 6, title: 'Globetrotter' },
  { min: 7, max: 8, title: 'Route Master' },
  { min: 9, max: 10, title: 'Legend Voyager' },
];

export const XP_EVENT_KEYS = {
  FIRST_PROFILE_BOOTSTRAP: 'first_profile_bootstrap',
  FIRST_BUDGET_SAVE: 'first_budget_save',
  FIRST_AVATAR_UPLOAD: 'first_avatar_upload',
  FIRST_EXPORT: 'first_export',
  FIRST_JOURNEY_CREATE: 'first_journey_create',
  FIRST_JOURNEY_EDIT: 'first_journey_edit',
  FIRST_JOURNEY_PHOTO_MILESTONE: 'first_journey_photo_milestone',
  FIRST_JOURNEY_BGM_MATCH: 'first_journey_bgm_match',
  WISHLIST_ADD_DAILY: 'wishlist_add_daily',
  DAILY_SIGNIN: 'daily_signin',
  DAILY_DISCOVER_BROWSE: 'daily_discover_browse',
};

export function triangularNumber(n) {
  const safe = Math.max(0, Number(n) || 0);
  return (safe * (safe + 1)) / 2;
}

export function thresholdForLevel(level) {
  const safeLevel = Math.min(MAX_LEVEL, Math.max(1, Number(level) || 1));
  return BASE_XP_STEP * triangularNumber(safeLevel - 1);
}

export function levelFromXp(totalXp) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  for (let level = MAX_LEVEL; level >= 1; level -= 1) {
    if (safeXp >= thresholdForLevel(level)) return level;
  }
  return 1;
}

export function titleForLevel(level) {
  const safeLevel = Math.min(MAX_LEVEL, Math.max(1, Number(level) || 1));
  const found = TITLE_BY_LEVEL_RANGE.find(
    (item) => safeLevel >= item.min && safeLevel <= item.max,
  );
  return found ? found.title : 'Trail Rookie';
}

export function computeProgress(totalXp) {
  const safeXp = Math.max(0, Number(totalXp) || 0);
  const level = levelFromXp(safeXp);
  const currentStartXp = thresholdForLevel(level);
  const isMaxLevel = level >= MAX_LEVEL;
  const nextLevel = isMaxLevel ? MAX_LEVEL : level + 1;
  const nextLevelXp = thresholdForLevel(nextLevel);
  const xpIntoLevel = isMaxLevel ? 0 : Math.max(0, safeXp - currentStartXp);
  const xpNeededThisLevel = isMaxLevel
    ? 0
    : Math.max(1, nextLevelXp - currentStartXp);
  const xpToNextLevel = isMaxLevel
    ? 0
    : Math.max(0, nextLevelXp - safeXp);
  const progress = isMaxLevel
    ? 1
    : Math.min(1, Math.max(0, xpIntoLevel / xpNeededThisLevel));

  return {
    level,
    isMaxLevel,
    title: titleForLevel(level),
    currentStartXp,
    nextLevelXp,
    xpIntoLevel,
    xpNeededThisLevel,
    xpToNextLevel,
    progress,
  };
}
