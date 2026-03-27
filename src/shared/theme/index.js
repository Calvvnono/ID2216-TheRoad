/*
 * Unified theme re-export.
 *
 * Import anywhere via:
 *   import { Colors, Spacing, Typography, ... } from 'src/shared/theme';
 *   — or —
 *   import { Theme } from 'src/shared/theme';
 *   const bg = Theme.Colors.background;
 */

export { Colors }                          from './colors';
export { Spacing }                         from './spacing';
export { Typography }                      from './typography';
export { BorderRadius, BorderWidth }       from './borders';
export { Shadows }                         from './shadows';
export { CommonStyles }                    from './commonStyles';

import { Colors }                          from './colors';
import { Spacing }                         from './spacing';
import { Typography }                      from './typography';
import { BorderRadius, BorderWidth }       from './borders';
import { Shadows }                         from './shadows';
import { CommonStyles }                    from './commonStyles';

export const Theme = {
  Colors,
  Spacing,
  Typography,
  BorderRadius,
  BorderWidth,
  Shadows,
  CommonStyles,
};
