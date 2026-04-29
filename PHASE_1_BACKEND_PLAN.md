# Oureduca Phase 1: Backend Wiring Master Plan

## 🎯 The Goal
Wire the existing React Native (Expo) UI to Supabase to prove a multi-tenant data flow. Data must flow downwards: Admin -> Headmaster -> Mentor -> Teacher -> Student. 

## 🛑 Strict Constraints for the AI Agent
1. **NO Real Authentication:** Do not implement Supabase Auth, OTP, or Magic Links. We are using a "Mock Auth Context" to instantly switch between pre-defined users for the demo.
2. **NO RLS:** Leave Row Level Security (RLS) disabled in Supabase for Phase 1 to avoid permission blocking.
3. **UI Preservation:** The UI is already built using Nativewind. Do not change the visual layout, colors, or components. ONLY replace static mock arrays with Supabase fetch logic and wire the buttons to Supabase insert logic.
4. **Step-by-Step Execution:** Do not write the code for all steps at once. Complete one step, verify it works, and wait for user approval before moving to the next.

---

## 🛠️ Execution Steps

### Step 1: Database Initialization (Supabase SQL)
Agent must provide the raw SQL to run in the Supabase SQL Editor to create these exact tables with `id` as UUIDs:
1. `schools` (id, name, email, phone)
2. `users` (id, school_id, role, name, email) - Roles: 'platform', 'headmaster', 'mentor', 'teacher', 'student'
3. `classes` (id, school_id, name)
4. `class_roster` (id, class_id, user_id, role_in_class)
5. `materials` (id, class_id, title, created_by)
*Agent must also provide SQL to insert one demo school and 5 demo users (one for each role) linked to that school.*

### Step 2: The Mock Auth Router
Create a `MockAuthContext` in React. 
- The `Main Interface` screen must set the `currentUser` and `currentSchool` in this context when a role button is clicked.
- All subsequent database queries MUST use the IDs from this context (e.g., `currentUser.id` or `currentUser.school_id`) to ensure data is isolated to the active demo user.

### Step 3: Platform Admin Wiring
- **Target Screen:** `Institutes` Tab.
- **Read:** Fetch and display all records from the `schools` table.
- **Create:** Wire the "Add New Organization" modal to insert a new row into `schools`. Refresh the list on success.

### Step 4: Headmaster Wiring
- **Target Screen:** `Manage` Tab.
- **Read:** Fetch `classes` where `school_id === currentUser.school_id`.
- **Create 1:** Wire "Add Class" to insert into `classes`.
- **Create 2:** Wire "Add Staff" to insert into `users` with `role: 'teacher'`.

### Step 5: Class Teacher (Mentor) Wiring
- **Target Screen:** `Classes` (Roster) Tab.
- **Read:** Fetch users from `class_roster` where `class_id` matches the mentor's assigned class.
- **Create:** Wire "Add Student" to insert into `users` (`role: 'student'`), AND immediately insert a linking record into `class_roster`.

### Step 6: Subject Teacher Wiring
- **Target Screen:** `Classes` Tab.
- **Read:** Fetch `classes` assigned to this teacher.
- **Create:** Wire "Upload Material" to insert text into the `materials` table (`title`, `class_id`, `created_by`).

### Step 7: Student/Parent Wiring
- **Target Screen:** `Classes` Tab (Student View).
- **Read:** Fetch and display records from the `materials` table where `class_id` matches the student's enrolled classes (via `class_roster`).