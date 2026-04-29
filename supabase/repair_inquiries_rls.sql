-- ============================================================
-- REPAIR SCRIPT: REGISTRATION INQUIRY VISIBILITY
-- Run this in your Supabase SQL Editor to unblock the UI
-- ============================================================

-- 1. Reset permissions on the inquiries table
ALTER TABLE registration_inquiries DISABLE ROW LEVEL SECURITY;

-- 2. Drop any old conflicting policies
DROP POLICY IF EXISTS "Enable public inserts" ON registration_inquiries;
DROP POLICY IF EXISTS "Platform admins manage inquiries" ON registration_inquiries;
DROP POLICY IF EXISTS "Anyone can read inquiries" ON registration_inquiries;
DROP POLICY IF EXISTS "Public Read Access" ON registration_inquiries;
DROP POLICY IF EXISTS "Public Insert Access" ON registration_inquiries;
DROP POLICY IF EXISTS "Admin Full Access" ON registration_inquiries;

-- 3. Re-enable clean RLS
ALTER TABLE registration_inquiries ENABLE ROW LEVEL SECURITY;

-- 4. NEW POLICY: Allow EVERYONE to Read (Select)
-- This is required because Simulation Mode does not have a formal auth.uid()
CREATE POLICY "Public Read Access" 
ON registration_inquiries FOR SELECT 
USING (true);

-- 5. NEW POLICY: Allow EVERYONE to Insert (Sign-up)
CREATE POLICY "Public Insert Access" 
ON registration_inquiries FOR INSERT 
WITH CHECK (true);

-- 6. NEW POLICY: Full Platform Admin Control (for when real auth is used)
CREATE POLICY "Admin Full Access"
ON registration_inquiries FOR ALL 
USING (
    EXISTS (
        SELECT 1 FROM users 
        WHERE users.id = auth.uid() 
        AND users.role = 'platform'
    )
);
