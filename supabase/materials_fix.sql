-- ============================================================
-- MIGRATION: ADD missing columns to materials TABLE
-- ============================================================

ALTER TABLE materials ADD COLUMN IF NOT EXISTS url TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'PDF';
ALTER TABLE materials ADD COLUMN IF NOT EXISTS section TEXT;
ALTER TABLE materials ADD COLUMN IF NOT EXISTS subject TEXT;
