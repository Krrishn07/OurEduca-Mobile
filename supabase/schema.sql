-- ============================================================
-- OUREDUCA PHASE 1: DATABASE SCHEMA
-- Run this entire script in the Supabase SQL Editor (one shot)
-- ============================================================

-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. SCHOOLS TABLE
-- ============================================================
CREATE TABLE schools (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name        TEXT NOT NULL,
    email       TEXT,
    phone       TEXT,
    plan        TEXT DEFAULT 'Basic', -- 'Basic', 'Pro', 'Enterprise'
    status      TEXT DEFAULT 'PENDING', -- 'PENDING', 'ACTIVE', 'SUSPENDED'
    billing_status TEXT DEFAULT 'Pending', -- 'Paid', 'Pending', 'Overdue'
    last_billing_date TIMESTAMPTZ DEFAULT now(), -- Updated on each billing cycle
    billing_cycle_days INTEGER DEFAULT 30, -- Cycle duration in days
    logo_url    TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 1.1 PLATFORM SETTINGS (Global Configuration)
-- ============================================================
CREATE TABLE platform_settings (
    key         TEXT PRIMARY KEY,
    value       JSONB NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 1.2 ROLE PERMISSIONS (RBAC Persistence)
-- ============================================================
CREATE TABLE role_permissions (
    role        TEXT PRIMARY KEY,
    permissions TEXT[] NOT NULL,
    updated_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 2. USERS TABLE
-- Roles: 'platform', 'headmaster', 'mentor', 'teacher', 'student'
-- ============================================================
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID REFERENCES schools(id) ON DELETE CASCADE,
    role        TEXT NOT NULL CHECK (role IN ('platform', 'headmaster', 'mentor', 'teacher', 'student')),
    name        TEXT NOT NULL,
    email       TEXT,
    phone       TEXT,
    office      TEXT,
    grade       TEXT,
    roll_number TEXT,
    avatar      TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
 );

-- ============================================================
-- 3. CLASSES TABLE
-- ============================================================
CREATE TABLE classes (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name        TEXT NOT NULL,
    sections    TEXT[] DEFAULT '{A,B,C,D}', -- New: configurable sections
    subject     TEXT,
    room_no     TEXT,
    teacher_name TEXT,
    class_time  TEXT,
    last_topic  TEXT,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 4. CLASS ROSTER (join table: which user is in which class)
-- ============================================================
CREATE TABLE class_roster (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id        UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    section         TEXT, -- New: link to specific section from classes.sections
    role_in_class   TEXT NOT NULL CHECK (role_in_class IN ('mentor', 'teacher', 'student')),
    subject         TEXT, -- New: For teachers assigned to specific subjects
    grade_score     TEXT,
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 5. MATERIALS TABLE
-- ============================================================
CREATE TABLE materials (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    subject     TEXT,
    type        TEXT DEFAULT 'PDF',
    is_public   BOOLEAN DEFAULT false,
    section     TEXT, -- New: section-specific privacy
    created_by  UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at  TIMESTAMPTZ DEFAULT now()
);


-- ============================================================
-- 6. ANNOUNCEMENTS TABLE
-- ============================================================
CREATE TABLE announcements (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    sender_id   UUID REFERENCES users(id) ON DELETE SET NULL,
    class_id    UUID REFERENCES classes(id) ON DELETE CASCADE, -- Optional: for class-specific notices
    title       TEXT NOT NULL,
    message     TEXT NOT NULL,
    audience    TEXT NOT NULL CHECK (audience IN ('ALL', 'STUDENT', 'STAFF')),
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- SEED DATA (Continued)
-- One demo announcement
INSERT INTO announcements (school_id, sender_id, title, message, audience) VALUES
    ('a1b2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0002-4000-8000-000000000002', 'Welcome to Springfield Academy', 'We are excited to have you all here for the new academic session.', 'ALL');

-- One demo school
INSERT INTO schools (id, name, email, phone, status, plan) VALUES
    ('a1b2c3d4-0001-4000-8000-000000000001', 'Springfield Academy', 'admin@springfield.edu', '+1 (555) 100-2000', 'ACTIVE', 'Enterprise');

-- Default Platform Settings
INSERT INTO platform_settings (key, value) VALUES
    ('global', '{
        "platformName": "OurEduca Global",
        "supportEmail": "support@oureduca.com",
        "supportPhone": "+1 (800) EDUCA",
        "maintenanceMode": false,
        "primaryColor": "#4f46e5"
    }'::jsonb);

-- Default Role Permissions
INSERT INTO role_permissions (role, permissions) VALUES
    ('platform', '{"Global Control", "User Management", "Billing Access", "System Settings"}'),
    ('headmaster', '{"School Management", "Staff Management", "Student Management", "Financial Overview"}'),
    ('mentor', '{"Classroom Management", "Student Mentoring", "Resource Management", "Messaging"}'),
    ('teacher', '{"Attendance", "Grading", "Materials", "Direct Messaging"}'),
    ('student', '{"View Materials", "Submit Assignments", "Fees Payment", "Profile Management"}');

-- Five demo users (one per role), all linked to the demo school
-- Platform Admin (school_id is NULL — they sit above schools)
INSERT INTO users (id, school_id, role, name, email) VALUES
    ('b1b2c3d4-0001-4000-8000-000000000001', NULL, 'platform', 'Super Admin', 'admin@oureduca.com');

-- Headmaster
INSERT INTO users (id, school_id, role, name, email) VALUES
    ('b1b2c3d4-0002-4000-8000-000000000002', 'a1b2c3d4-0001-4000-8000-000000000001', 'headmaster', 'Principal Skinner', 'skinner@springfield.edu');

-- Class Teacher / Mentor
INSERT INTO users (id, school_id, role, name, email) VALUES
    ('b1b2c3d4-0003-4000-8000-000000000003', 'a1b2c3d4-0001-4000-8000-000000000001', 'mentor', 'Seymour Skinner', 'seymour@springfield.edu');

-- Subject Teacher
INSERT INTO users (id, school_id, role, name, email) VALUES
    ('b1b2c3d4-0004-4000-8000-000000000004', 'a1b2c3d4-0001-4000-8000-000000000001', 'teacher', 'Edna Krabappel', 'edna@springfield.edu');

-- Student
INSERT INTO users (id, school_id, role, name, email) VALUES
    ('b1b2c3d4-0005-4000-8000-000000000005', 'a1b2c3d4-0001-4000-8000-000000000001', 'student', 'Lisa Simpson', 'lisa@student.springfield.edu');

-- One demo class
INSERT INTO classes (id, school_id, name, subject, room_no, teacher_name, class_time, last_topic) VALUES
    ('c1c2c3d4-0001-4000-8000-000000000001', 'a1b2c3d4-0001-4000-8000-000000000001', 'Class 10-A', 'Mathematics', '302', 'Seymour Skinner', '09:00 AM', 'Trigonometry Intro');

-- Wire the mentor and student into the class roster
INSERT INTO class_roster (class_id, user_id, role_in_class, grade_score) VALUES
    ('c1c2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0003-4000-8000-000000000003', 'mentor', NULL),
    ('c1c2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0004-4000-8000-000000000004', 'teacher', NULL),
    ('c1c2c3d4-0001-4000-8000-000000000001', 'b1b2c3d4-0005-4000-8000-000000000005', 'student', 'A+');

-- One demo material
INSERT INTO materials (school_id, class_id, title, created_by) VALUES
    ('a1b2c3d4-0001-4000-8000-000000000001', 'c1c2c3d4-0001-4000-8000-000000000001', 'Chapter 4: Trigonometry Review', 'b1b2c3d4-0004-4000-8000-000000000004');

-- ============================================================
-- 7. ASSIGNMENTS TABLE
-- ============================================================
CREATE TABLE IF NOT EXISTS assignments (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title       TEXT NOT NULL,
    description TEXT,
    max_marks   INTEGER DEFAULT 100,
    due_date    TIMESTAMPTZ,
    created_at  TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 8. GRADES TABLE (Specific evaluations per assignment)
-- ============================================================
CREATE TABLE IF NOT EXISTS grades (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    student_id      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    assignment_id   UUID NOT NULL REFERENCES assignments(id) ON DELETE CASCADE,
    marks           NUMERIC NOT NULL,
    feedback        TEXT,
    graded_at       TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, assignment_id)
);

-- SEED ASSIGNMENTS
INSERT INTO assignments (school_id, class_id, title, max_marks) VALUES
    ('a1b2c3d4-0001-4000-8000-000000000001', 'c1c2c3d4-0001-4000-8000-000000000001', 'Mid-Term Algebra Quiz', 100),
    ('a1b2c3d4-0001-4000-8000-000000000001', 'c1c2c3d4-0001-4000-8000-000000000001', 'Trigonometry Assignment', 50);
