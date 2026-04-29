-- ============================================================
-- MIGRATION: ADD school_id TO materials TABLE
-- ============================================================

-- 1. Add the column (nullable initially to allow adding to existing rows)
ALTER TABLE materials ADD COLUMN IF NOT EXISTS school_id UUID REFERENCES schools(id) ON DELETE CASCADE;

-- 2. Backfill existing data from the classes table
UPDATE materials
SET school_id = classes.school_id
FROM classes
WHERE materials.class_id = classes.id
AND materials.school_id IS NULL;

-- 3. In a real environment, you'd want to enforce NOT NULL after backfilling.
-- However, if there are materials without valid classes, this might fail.
-- Run this if you are sure all materials are linked to valid classes:
-- ALTER TABLE materials ALTER COLUMN school_id SET NOT NULL;
