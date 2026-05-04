# OurEduca UI System

This document defines the visual system for the OurEduca app.

The `Platform Home` dashboard is the visual source reference, but it should be applied as a system, not copied screen-for-screen. Every role should feel like part of the same product while keeping its own tone.

## Design Intent

- Premium
- Institutional
- Modern
- Structured
- Warm, not sterile
- Bold, but not noisy

The app should feel trustworthy, polished, and purpose-built for education operations.

## Product-Wide Rules

### Visual Direction

- Use soft white surfaces on a lightly tinted background.
- Use indigo as the primary brand color.
- Use large rounded shapes, but keep them controlled and repeatable.
- Prefer clear hierarchy over decorative density.
- Avoid making each role look like a separate app.

### Screen Architecture

- Dashboard home screens can use a hero/header zone.
- Subpages should usually use a lighter header treatment.
- After the header, content should flow in stacked sections with consistent spacing.
- Use reusable section shells instead of one-off layout patterns.

### Role Tone

- Platform: command center, operational, strategic.
- Headmaster: administrative, structured, institutional.
- Teacher: active, practical, classroom-focused.
- Student: clear, encouraging, calm.

Same system, different tone weight.

## Layout System

### Background

- App background should be a very light cool surface.
- Avoid flat, harsh white full-screen layouts unless inside cards or modals.

### Width and Padding

- Keep horizontal screen padding consistent.
- Major dashboard sections should align to one content grid.
- Avoid random per-section left/right spacing.

### Vertical Rhythm

- Keep section spacing predictable.
- Cards within a section should share consistent internal spacing.
- Dense data screens can be tighter, but should still feel deliberate.

## Radius System

Use only a small set of radii across the product.

- Primary card radius: large, soft
- Secondary radius: medium for controls and internal panels
- Pill radius: full for badges and status tags
- Hero radius: slightly larger than standard cards

Do not mix too many corner sizes on one screen.

## Color System

### Primary

- Primary brand: indigo

### Semantic Accent Colors

- Success: green
- Warning: amber
- Error or destructive: rose/red
- Informational secondary accent: blue

### Usage Rules

- Use tinted backgrounds for icon shells and status surfaces.
- Avoid strong saturated fills on large UI areas unless it is a hero/header.
- Do not overload a single screen with too many competing accent colors.

## Typography System

### Hierarchy

- Hero title: large, bold, tightly tracked
- Screen title: strong and prominent
- Section title: bold, smaller than hero
- Eyebrow/subtitle: uppercase, compact, spaced out
- Body text: calm, readable, medium emphasis
- Badge and label text: compact uppercase

### Rules

- Keep heading personality consistent across roles.
- Do not let some screens feel editorial and others generic.
- Avoid weak body text on critical data cards.

## Card System

### Standard Card

- White surface
- Subtle border
- Soft shadow
- Generous padding
- Large radius

### Interactive Card

- Same shell as standard card
- Slightly stronger feedback on press
- No completely different styling unless functionally necessary

### Empty State Card

- Same card family
- Can use quieter border or dashed variation
- Should still feel part of the system

## Hero System

### Where to Use

- Main dashboard home screens
- High-importance summary views

### Where Not to Overuse

- Every secondary page
- Utility screens
- Dense forms

### Role Weight

- Platform hero can be the most cinematic
- Teacher hero should be lighter and more workflow-oriented
- Student hero should feel supportive and cleaner

## Stat Card System

Every stat card should follow the same pattern.

- Icon in tinted rounded shell
- Large value
- Small uppercase label
- Consistent vertical alignment
- Matching heights in shared rows

Most dashboards should show no more than 4 primary stats above the fold.

## Section Header System

Use one reusable header pattern across the app.

- Title
- Small uppercase subtitle
- Optional right-side action

Do not create a different section header style for every screen.

## Button System

### Variants

- Primary: indigo fill, white text
- Secondary: indigo tint background
- Outline: white with border
- Danger: rose/red fill

### Rules

- Buttons should have comfortable tap size.
- Primary actions should stand out clearly.
- Secondary actions should not visually compete with primary ones.
- Avoid too many tiny text-only actions in important sections.

## Icon System

- Major icons should sit inside a consistent icon shell when used in summary or action cards.
- Keep icon sizing consistent across roles.
- Do not let one screen use tiny icons while another uses oversized icon shells for similar functions.

## Navigation System

### Sidebar and Desktop Navigation

- Active item uses tinted surface and stronger icon shell
- Inactive item remains quiet but readable
- Locked states use consistent lock treatment

### Mobile Bottom Navigation

- Active state should match the same visual language as desktop
- Labels should remain small and clean
- Avoid adding custom styles per role

## Modal System

- Use the same card shell language as the rest of the app
- Strong title
- Compact eyebrow or subtitle where useful
- Clear close action
- Internal sections should maintain normal spacing rhythm

## Data Visualization Rules

- Charts should use the brand palette and semantic accents
- Avoid fake or random analytics values in production-facing UI
- If data is simulated, do not let the UI pattern depend on unrealistic numbers

## What Should Be Reused Everywhere

- Card shell
- Section header
- Stat card
- Action tile
- Buttons
- Icon shells
- Empty states
- Surface colors
- Radius scale
- Typography hierarchy

## What Should Not Be Copied Everywhere

- Heavy hero decoration on every screen
- Unique one-off card styles for single sections
- Random metric generation patterns
- Different spacing systems per role
- Different active-state logic per navigation area

## Master Template Rule

The app should use `Platform Home` as the stylistic source, but through reusable primitives and toned variants.

That means:

- preserve the premium direction
- normalize the system
- lighten where necessary
- adapt by role without breaking consistency

## Implementation Reference

The current shared direction should be built around:

- [src/design-system/theme.ts](C:/Users/krris/OneDrive/Documents/OurEduca%20-%20Copy/mobile/src/design-system/theme.ts)
- [src/design-system/components/AppCard.tsx](C:/Users/krris/OneDrive/Documents/OurEduca%20-%20Copy/mobile/src/design-system/components/AppCard.tsx)
- [src/design-system/components/AppButton.tsx](C:/Users/krris/OneDrive/Documents/OurEduca%20-%20Copy/mobile/src/design-system/components/AppButton.tsx)
- [src/design-system/components/SectionHeader.tsx](C:/Users/krris/OneDrive/Documents/OurEduca%20-%20Copy/mobile/src/design-system/components/SectionHeader.tsx)
- [src/design-system/components/StatCard.tsx](C:/Users/krris/OneDrive/Documents/OurEduca%20-%20Copy/mobile/src/design-system/components/StatCard.tsx)
- [src/design-system/components/ActionTile.tsx](C:/Users/krris/OneDrive/Documents/OurEduca%20-%20Copy/mobile/src/design-system/components/ActionTile.tsx)

## Next Recommended Rollout

Apply this system next to:

- teacher videos
- student videos
- teacher messages
- student messages
- headmaster home
- shared modals

Once those are aligned, the app will start feeling system-led instead of screen-led.
