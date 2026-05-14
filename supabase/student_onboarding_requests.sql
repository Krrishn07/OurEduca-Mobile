-- ============================================================
-- STUDENT ONBOARDING REQUESTS (STAGING TABLE)
-- Handles the "Pending Verification" state for new students
-- ============================================================

CREATE TABLE IF NOT EXISTS student_onboarding_requests (
    id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    school_id   UUID NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    class_id    UUID NOT NULL REFERENCES classes(id) ON DELETE CASCADE,
    section     TEXT NOT NULL,
    full_name   TEXT NOT NULL,
    phone       TEXT NOT NULL,
    status      TEXT NOT NULL CHECK (status IN ('pending', 'approved', 'rejected')) DEFAULT 'pending',
    created_at  TIMESTAMPTZ DEFAULT now(),
    -- Ensure a student can't have multiple pending requests for the same class
    UNIQUE(phone, class_id, section)
);

-- Enable RLS (Temporarily disabled for Simulation/Demo Support)
-- In a real production environment with full Supabase Auth, you would:
-- ALTER TABLE student_onboarding_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_onboarding_requests DISABLE ROW LEVEL SECURITY;

-- The policies below are preserved for reference but will be inactive while RLS is disabled.

-- Policy: Platform Admins can manage EVERYTHING
DROP POLICY IF EXISTS "Platform admins can manage all onboarding requests" ON student_onboarding_requests;
CREATE POLICY "Platform admins can manage all onboarding requests" 
ON student_onboarding_requests FOR ALL
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'platform'
    )
);

-- Policy: Teachers & Headmasters can view requests for their school
DROP POLICY IF EXISTS "School staff can view onboarding requests" ON student_onboarding_requests;
CREATE POLICY "School staff can view onboarding requests" 
ON student_onboarding_requests FOR SELECT
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.school_id = student_onboarding_requests.school_id
        AND users.role IN ('headmaster', 'mentor', 'teacher', 'admin')
    )
);

-- Policy: Teachers & Headmasters can update requests (approve/reject)
DROP POLICY IF EXISTS "School staff can update onboarding requests" ON student_onboarding_requests;
CREATE POLICY "School staff can update onboarding requests" 
ON student_onboarding_requests FOR UPDATE
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.school_id = student_onboarding_requests.school_id
        AND users.role IN ('headmaster', 'mentor', 'teacher', 'admin')
    )
);

-- Policy: Anyone can insert (so students can register)
-- In production, this should ideally be restricted to authenticated users or a service role,
-- but for open QR onboarding, we allow public inserts with validation checks.
DROP POLICY IF EXISTS "Public can submit onboarding requests" ON student_onboarding_requests;
CREATE POLICY "Public can submit onboarding requests" 
ON student_onboarding_requests FOR INSERT
WITH CHECK (true);
