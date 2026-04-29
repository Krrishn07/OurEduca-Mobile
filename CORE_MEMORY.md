# Oureduca Mobile: Core Project Memory 🧠

This file serves as the permanent memory for the Oureduca Mobile development process. It tracks critical architectural decisions, solved pitfalls, and the current state of the application to ensure continuity across development sessions.

## 📌 Project Overview
- **Objective**: High-fidelity institutional management app for schools (Students, Teachers, Mentors, Admins).
- **Stack**: React Native (Expo), Supabase (Auth/DB), Vanilla CSS (Tailwind-style via NativeWind).
- **Core Feature**: The **Simulation Hub**, which allows developers/clients to switch between any real Supabase identity instantly.

---

## 🏗️ Technical Architecture & Key Decisions

### 1. Atomic Registry Stabilization (Identity Switching)
- **Problem**: Switching roles (e.g., Teacher to Student) previously caused "ghost data" or UI crashes.
- **Decision**: Implemented an **Atomic Reset** pattern.
- **Logic**: Whenever the `mockAuthUser.id` or `role` changes, the `MASTER CLEANUP ENGINE` in `AdminDashboard.tsx` and `App.tsx` triggers:
    1.  `clearInstitutionalData()`: Wipes the global `SchoolDataContext` (Rosters, Materials, Messages).
    2.  `resetLocalDashboardState()`: Wipes local UI states (counts, filters).
    3.  `onNavigate('home')`: Resets the UI to the home tab to ensure a fresh data pulse.

### 2. Dual-Role (Hybrid) Logic
- **Teacher/Mentor Synergy**: Teachers can also be Mentors for specific sections.
- **Decision**: The `AdminDashboard` handles both Mentor and Institutional Admin roles. If a Teacher is assigned as a mentor, they are redirected to the `AdminDashboard` in "Mentor Mode."
- **Data Scope**: Mentors see *all* materials they've created school-wide, but their student roster is strictly limited to their assigned mentored section.

---

## ⚠️ Solved Pitfalls (The "Wall of Learning")

### 1. The "Infinite Pulse" Loop (April 2026)
- **Issue**: A `useEffect` depended on a function (`fetchTeacherData`) which updated a state (`uploadRosterId`), which was a dependency of that same function.
- **Fix**: Decoupled "Data Fetching" from "UI Selection." 
    - Moved default selection logic into a separate `useEffect` using a `ref` or `assignedSections.length` as a trigger.
    - Removed circular dependencies from all `useCallback` hooks in Dashboards.

### 2. Context Stability
- **Issue**: `clearInstitutionalData` was being recreated on every render, triggering infinite cleanup loops.
- **Fix**: All context-exported functions must be wrapped in `useCallback` with stable dependencies.

---

## ✅ Current Status (As of April 21, 2026)
- **Simulation Hub**: **Stable**. All roles (Student, Teacher, Mentor, Admin) can be switched smoothly.
- **Crash Status**: All reported "white square" crashes fixed.
- **Data Integrity**: Institutional data is correctly isolated per section while maintaining global visibility for creators.

---

## 📋 Ongoing / Future Tasks
- [ ] Implement Push Notifications for Attendance.
- [ ] Refine "Fees & Ledger" UI for Parents.
- [ ] Expand CCTV/Camera node integration for Mentors.

---

*Note: Update this file at the end of every major milestone to maintain the AI project memory.*
