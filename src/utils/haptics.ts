import * as Haptics from 'expo-haptics';
export { ImpactFeedbackStyle } from 'expo-haptics';
import { Platform } from 'react-native';

/**
 * Trigger a haptic feedback impact.
 * Optimized for institutional grade responsiveness.
 */
export const triggerHaptic = async (style: Haptics.ImpactFeedbackStyle = Haptics.ImpactFeedbackStyle.Light) => {
  if (Platform.OS === 'web') return;
  try {
    await Haptics.impactAsync(style);
  } catch (error) {
    // Silently fail if haptics are not available
  }
};

/**
 * Predefined haptic patterns for specific UX events.
 */
export const HapticPatterns = {
  selection: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Light),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
  heavy: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Heavy),
};
