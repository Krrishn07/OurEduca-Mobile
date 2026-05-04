-- 1. Create Live Streams Table for Real-Time Orchestration
CREATE TABLE IF NOT EXISTS live_streams (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    class_id UUID REFERENCES classes(id) ON DELETE SET NULL,
    section TEXT, -- For section-aware filtering
    title TEXT NOT NULL,
    subject TEXT,
    stream_url TEXT NOT NULL, -- The HLS/RTMP endpoint
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_live_streams_school ON live_streams(school_id);
CREATE INDEX IF NOT EXISTS idx_live_streams_active ON live_streams(is_active);

-- 3. Enable RLS (Row Level Security)
ALTER TABLE live_streams ENABLE ROW LEVEL SECURITY;

-- 4. Policies: Visibility (School-Wide or Private)
-- Everyone in the school can see public or their own section streams
CREATE POLICY "Streams are visible to everyone in the same school"
ON live_streams FOR SELECT
USING (
    auth.uid() IN (
        SELECT id FROM users WHERE school_id = live_streams.school_id
    )
);

-- 5. Policies: Management (Teacher/Admin only)
CREATE POLICY "Teachers and Admins can start streams"
ON live_streams FOR INSERT
WITH CHECK (
    auth.uid() IN (
        SELECT id FROM users 
        WHERE role IN ('TEACHER', 'ADMIN_TEACHER', 'SUPER_ADMIN')
    )
);

CREATE POLICY "Owners can update/end their own streams"
ON live_streams FOR UPDATE
USING (auth.uid() = created_by)
WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Owners can delete their own streams"
ON live_streams FOR DELETE
USING (auth.uid() = created_by);

-- 6. Trigger for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_live_streams_updated_at
    BEFORE UPDATE ON live_streams
    FOR EACH ROW
    EXECUTE PROCEDURE update_updated_at_column();
