import { PlatformSpacing } from './spacing';
import { PlatformColors } from './colors';
import { PlatformTypography } from './typography';
import { PlatformRadius } from './radius';
import { AppTheme } from '../../../design-system';

export const PlatformShadows = {
  sm: 'shadow-sm shadow-indigo-100/40',
  md: 'shadow-md shadow-indigo-100/50',
  lg: 'shadow-lg shadow-indigo-200/50',
  xl: 'shadow-xl shadow-indigo-900/5', // The Platinum Signature Shadow
  inner: 'shadow-inner',
};

export const PlatformTheme = {
  ...AppTheme,
  spacing: PlatformSpacing,
  colors: PlatformColors,
  typography: PlatformTypography,
  radius: PlatformRadius,
  shadows: PlatformShadows,
  card: {
    base: `bg-white border border-gray-100 overflow-hidden ${PlatformRadius.primary} ${PlatformShadows.xl}`,
    interactive: `bg-white border border-gray-100 overflow-hidden ${PlatformRadius.primary} ${PlatformShadows.md}`,
  },
};

export * from './spacing';
export * from './colors';
export * from './typography';
export * from './radius';
