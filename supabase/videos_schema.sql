-- ============================================================
-- OUREDUCA PHASE 2: VIDEO INFRASTRUCTURE SCHEMA
-- ============================================================

-- 1. VIDEOS TABLE
CREATE TABLE IF NOT EXISTS videos (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id       UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id        UUID REFERENCES classes(id) ON DELETE CASCADE, -- Optional: for class-specific content
    created_by      UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title           TEXT NOT NULL,
    subject         TEXT,
    video_url       TEXT NOT NULL,
    thumbnail_url   TEXT,
    duration        TEXT, -- Optional: "10:30"
    is_public       BOOLEAN DEFAULT false,
    section         TEXT, -- New: section-specific privacy
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- 2. ENABLE RLS
ALTER TABLE videos ENABLE ROW LEVEL SECURITY;

-- 3. POLICIES (Development Mode: USING true)
-- NOTE: In production, these will be restricted by auth.uid()
DROP POLICY IF EXISTS "Allow Public Read" ON videos;
CREATE POLICY "Allow Public Read" ON videos FOR SELECT USING (true);

DROP POLICY IF EXISTS "Allow Teacher Upload" ON videos;
CREATE POLICY "Allow Teacher Upload" ON videos FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "Allow Teacher Update" ON videos;
CREATE POLICY "Allow Teacher Update" ON videos FOR UPDATE USING (true);

DROP POLICY IF EXISTS "Allow Teacher Delete" ON videos;
CREATE POLICY "Allow Teacher Delete" ON videos FOR DELETE USING (true);

-- 4. SEED DATA
-- Insert a demo video for Springfield Academy (Mathematics)
INSERT INTO videos (school_id, class_id, created_by, title, subject, video_url, is_public)
VALUES (
    'a1b2c3d4-0001-4000-8000-000000000001', 
    'c1c2c3d4-0001-4000-8000-000000000001', 
    'b1b2c3d4-0004-4000-8000-000000000004', 
    'Introduction to Trigonometry', 
    'Mathematics', 
    'https://sample-videos.com/video123/mp4/720/big_buck_bunny_720p_1mb.mp4', 
    true
);
