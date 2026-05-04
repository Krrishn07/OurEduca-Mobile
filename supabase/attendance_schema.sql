-- ============================================================
-- SIMULATION-FRIENDLY ATTENDANCE SCHEMA
-- ============================================================

-- ============================================================
-- 2. ASSET ISOLATION (Materials & Videos)
-- ============================================================

-- Add section support to existing materials table
ALTER TABLE materials ADD COLUMN IF NOT EXISTS section TEXT;

-- Create videos table for persistent video lessons
CREATE TABLE IF NOT EXISTS videos (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    class_id UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    url TEXT NOT NULL,
    type TEXT DEFAULT 'PRIVATE', -- 'PUBLIC', 'PRIVATE'
    section TEXT, -- Link to specific section
    created_by UUID REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now()
);

-- ============================================================
-- 3. PERMISSIONS / RLS (Optional: Enable if using production RLS)
-- ============================================================
-- ALTER TABLE materials ENABLE ROW LEVEL SECURITY;
-- ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 1. Remove the view and table to ensure a clean start
DROP VIEW IF EXISTS attendance_stats;
DROP TABLE IF EXISTS attendance CASCADE;

-- 2. Create the table with TEXT for student_id
-- This allows both UUIDs and strings like 'student_1'
CREATE TABLE attendance (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id        UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    student_id      TEXT NOT NULL, 
    section         TEXT NOT NULL DEFAULT 'A', -- ADDED: Sectional Isolation
    date            DATE NOT NULL DEFAULT CURRENT_DATE,
    status          TEXT NOT NULL CHECK (status IN ('PRESENT', 'ABSENT', 'LATE', 'EXCUSED')),
    marked_by       UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    remarks         TEXT,
    created_at      TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id, class_id, section, date) -- ARMOR: Prevents cross-section overwrites
);

-- 3. Security & Access
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Full access for simulation" ON attendance FOR ALL USING (true) WITH CHECK (true);

-- 4. Institutional Stats View
CREATE OR REPLACE VIEW attendance_stats AS
SELECT 
    school_id,
    date,
    count(*) filter (where status = 'PRESENT') as present_count,
    count(*) as total_students
FROM attendance
GROUP BY school_id, date;
