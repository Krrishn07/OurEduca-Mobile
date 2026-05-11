# 🚀 OurEduca Future Roadmap (Optional Enhancements)

This document serves as a "Memory Bank" for high-fidelity features and architectural improvements that are designed but not yet implemented to keep the current MVP lean and fast.

---

## 📊 Dashboard & StatCards
*Status: Standardized (Master Controller Pattern implemented)*

### [ ] Progress Underlays (Goal Tracking)
- **Concept**: Add a subtle circular or horizontal progress bar behind the stat value.
- **Use Case**: Attendance (e.g., 88% vs 95% target) or Billing (e.g., $4k vs $10k target).
- **Aesthetic**: Ghosted emerald/rose tracks that fill based on a `target` prop.

### [ ] Comparison Subtitles
- **Concept**: Add a second line of metadata below the trend.
- **Use Case**: "vs. last month: +12%" or "Industry Avg: 85%".
- **Aesthetic**: Micro-typography in `text-gray-300`.

### [ ] Interactive Drill-Downs (Modals)
- **Concept**: Long-pressing a StatCard opens a "Mini-Analytics" modal.
- **Use Case**: Click "Students" to see a quick pie chart of Male/Female or Active/Inactive without leaving the Home screen.

### [ ] Unit Suffixes & Fractions
- **Concept**: Support for complex values like `8 / 12`.
- **Use Case**: "To Grade" card showing (Graded / Total).

---

## ✉️ Messaging Hub
*Status: Production Ready*

### [ ] Real-time Typing Indicators
- **Concept**: Show "Principal is typing..." in the chat list.
- **Implementation**: Supabase Realtime Broadcast.

### [ ] Message Reactions
- **Concept**: Long-press to add emojis (👍, ❤️, ❓) to school notices.

---

## 🏗️ General Architecture

### [ ] Global Theme Switcher (Platinum Customization)
- **Concept**: Allow the Headmaster to change the "Institutional Tone" (e.g., changing the Indigo theme to Emerald school-wide).

### [ ] Offline-First Sync Ledger
- **Concept**: Track local changes while offline and "Replay" them to Supabase when connection returns.

---

> **Note to Antigravity**: When the user asks for "Optional features from the vault," refer to this file and implement the chosen node.
