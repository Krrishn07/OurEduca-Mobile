import { Easing } from 'react-native-reanimated';

/**
 * Unified "Platinum" Motion System
 * One spring, one duration hierarchy, one easing language.
 */

export const SPRING_CONFIG = {
  damping: 18,
  stiffness: 180,
  mass: 0.8,
};

export const EASING_PLATINUM = Easing.out(Easing.exp);

export const DURATIONS = {
  tap: 120,          // 80–120ms
  hover: 200,        // 150–200ms
  screen: 320,       // 280–360ms
  modal: 450,        // 400–500ms
  hero: 600,         // 600ms+
};

/**
 * Shared entrance/exit animations for consistent feel.
 */
export const MOTION = {
  spring: SPRING_CONFIG,
  easing: EASING_PLATINUM,
  durations: DURATIONS,
};
