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
 * High-fidelity tactile hierarchy for "Platinum" grade feel.
 */
export const HapticPatterns = {
  tabSwitch: () => Haptics.selectionAsync(),
  selection: () => Haptics.selectionAsync(),
  modalOpen: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Light),
  impactLight: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Light),
  impactMedium: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Medium),
  send: () => triggerHaptic(Haptics.ImpactFeedbackStyle.Medium),
  success: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success),
  error: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error),
  warning: () => Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning),
};

export default HapticPatterns;
