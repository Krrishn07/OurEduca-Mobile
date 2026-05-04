-- ============================================================
-- REGISTRATION INQUIRIES (Institutional Sign-up leads)
-- ============================================================
CREATE TABLE IF NOT EXISTS registration_inquiries (
    id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name            TEXT NOT NULL,
    phone           TEXT NOT NULL,
    email           TEXT,
    institute_name  TEXT NOT NULL,
    address         TEXT,
    status          TEXT DEFAULT 'NEW', -- 'NEW', 'REVIEWED', 'CONTACTED', 'ONBOARDED'
    created_at      TIMESTAMPTZ DEFAULT now()
);

-- Enable RLS
ALTER TABLE registration_inquiries ENABLE ROW LEVEL SECURITY;

-- 1. Anyone can insert (to allow sign-ups)
CREATE POLICY "Enable public inserts" ON registration_inquiries 
FOR INSERT WITH CHECK (true);

-- 2. Only platform admins can read/manage all inquiries
-- UPDATED: Added public read for development/simulation context
CREATE POLICY "Anyone can read inquiries" ON registration_inquiries 
FOR SELECT USING (true);

CREATE POLICY "Platform admins manage inquiries" ON registration_inquiries 
FOR ALL USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'platform'
    )
);
