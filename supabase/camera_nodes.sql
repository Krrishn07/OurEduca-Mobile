-- Create Camera Nodes table for institutional CCTV management
CREATE TABLE IF NOT EXISTS camera_nodes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name TEXT NOT NULL, -- e.g., "Classroom 101 CCTV"
    stream_url TEXT NOT NULL, -- The HLS/RTMP endpoint for this camera
    target_class_id UUID, -- Optional: Link to a specific virtual classroom
    target_section TEXT, -- Optional: Link to a specific section (e.g. "A")
    status TEXT DEFAULT 'ONLINE', -- ONLINE, OFFLINE, MAINTENANCE
    created_at TIMESTAMPTZ DEFAULT now(),
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE camera_nodes ENABLE ROW LEVEL SECURITY;

-- Policies: Visibility (Everyone in school)
CREATE POLICY "Camera nodes visible to school members"
ON camera_nodes FOR SELECT
USING (
    auth.uid() IN (SELECT id FROM users WHERE school_id = camera_nodes.school_id)
);

-- Policies: Management (Admins & Headmasters)
CREATE POLICY "Admins can manage camera nodes"
ON camera_nodes FOR ALL
USING (
    auth.uid() IN (SELECT id FROM users WHERE school_id = camera_nodes.school_id AND role IN ('SUPER_ADMIN', 'ADMIN_TEACHER'))
)
WITH CHECK (
    auth.uid() IN (SELECT id FROM users WHERE school_id = camera_nodes.school_id AND role IN ('SUPER_ADMIN', 'ADMIN_TEACHER'))
);
