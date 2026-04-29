# Oureduca Platinum: Official Design System & Theme Registry 🎨

This document is the absolute source of truth for the Oureduca UI/UX. It defines the "Platinum" aesthetic derived from the original project prototypes.

## 1. 🌈 Color Palette (The "Oureduca Spectrum")

| Token | HSL / Hex | Usage |
| :--- | :--- | :--- |
| **Primary (Main)** | `#4f46e5` | Core buttons, active states, branding. |
| **Primary (Bright)** | `#6366f1` | Gradients, hover states, secondary icons. |
| **Highlight** | `#fde047` | Personalization (Greeting names), specific emphasis. |
| **Success** | `#10b981` | Positive attendance, verified payments, "New" badges. |
| **Error** | `#ef4444` | Deletion actions, attendance absence, urgent alerts. |
| **Warning** | `#f59e0b` | Pending statuses, late fee indicators. |
| **Surface (Main)** | `#f9fafb` | Primary app background (light gray). |
| **Surface (Card)** | `#ffffff` | Elevated containers, modals, white-space. |

## 2. ✍️ Typography (The "Hi-Fi" Type Scale)

We use the **System Font** (San Francisco / Roboto) optimized with precise tracking and leading.

| Level | Style | Size | Weight | Tracking |
| :--- | :--- | :--- | :--- | :--- |
| **Hero Title** | `text-4xl` | 36px | Black (900) | `-2.5px` |
| **Screen Title** | `text-2xl` | 24px | Black (900) | `-1.5px` |
| **Card Title** | `text-base` | 16px | Bold (700) | `-0.5px` |
| **Body (Main)** | `text-sm` | 14px | Medium (500) | `Normal` |
| **Data Label** | `text-[10px]` | 10px | Black (900) | `2px` (All Caps) |
| **Caption** | `text-[9px]` | 9px | Bold (700) | `1px` (All Caps) |

## 3. 🛡️ Layout & Primitives

### Border Radius
- **Institutional (Huge)**: `32px` (Used for primary page cards and banners).
- **Component (Large)**: `16px` (Used for secondary widgets and buttons).
- **Element (Small)**: `8px` (Used for badges and text inputs).

### Spacing (The 4px Grid)
- **Page Margin**: `24px` (px-6) — The absolute standard for horizontal gutters.
- **Card Padding**: `20px` (p-5) — Standard internal breathing room for cards.
- **Inner Gap**: `12px` (gap-3) — Space between sibling elements in a list.

### Depth & Shadows (Elevation)
- **Level 1 (Flat)**: Border only (`Gray-100`).
- **Level 2 (Raised)**: `shadow-sm` (Subtle Indigo tint: `rgba(79, 70, 229, 0.05)`).
- **Level 3 (Floating)**: `shadow-xl` (Deep shadow for primary banners/modals).

## 4. 🧩 Iconography Standards
- **Source**: Lucide-React-Native.
- **Stroke Width**: Always `1.5px` or `2px` (Never use thin `1px` strokes).
- **Standard Sizes**:
    - `16px`: For detail line-items (Clock, Calendar).
    - `20px`: For card titles and navigation labels.
    - `24px`: For large action buttons and hero stats.

## 5. ✨ Widgets & Components
1. **PlatformCard**: A white container with fixed `32px` radius and `shadow-sm`.
2. **ActionButton**: Rounded `18px`, centered text (All caps), Indigo background.
3. **StatusBadge**: Soft background (10% opacity) with high-contrast text label.

---

> [!IMPORTANT]
> **Why this proposal?**
> This "Platinum" logic ensures the app looks extremely premium while handling professional data density. The high border radius (`32px`) makes the app feel "soft" and approachable, while the `black (900)` weight typography ensures it remains "serious" and academic.
