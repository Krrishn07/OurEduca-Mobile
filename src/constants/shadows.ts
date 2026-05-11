/**
 * Unified "Platinum" Shadow System
 * Professional grade depth hierarchy.
 */

export const SHADOWS = {
  // Level 1 — Subtle Cards
  level1: {
    shadowColor: "#000",
    shadowOpacity: 0.04,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2
  },
  
  // Level 2 — Floating Action Buttons / Primary Controls
  level2: {
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 14,
    shadowOffset: { width: 0, height: 6 },
    elevation: 5
  },
  
  // Level 3 — Overlays / Modals / Sheets
  level3: {
    shadowColor: "#000",
    shadowOpacity: 0.12,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: -6 },
    elevation: 10
  }
};
