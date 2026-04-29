-- SUPABASE SYSTEM LOGS SCHEMA
-- This file creates the audit logging table for the Headmaster Activity Feed.

-- 1. Create the base table
CREATE TABLE IF NOT EXISTS public.system_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID REFERENCES public.schools(id) ON DELETE CASCADE, -- Made NULLABLE for global platform logs
    user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,     -- Added to track which admin did what
    category TEXT NOT NULL DEFAULT 'SYSTEM',                         -- Added for grouping (INSTITUTION, BILLING, SECURITY, SYSTEM)
    title TEXT NOT NULL,
    icon TEXT NOT NULL DEFAULT 'Activity',
    color TEXT NOT NULL DEFAULT '#4f46e5',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_system_logs_school ON public.system_logs(school_id);
CREATE INDEX IF NOT EXISTS idx_system_logs_time ON public.system_logs(created_at DESC);

-- 3. Row Level Security Policies
ALTER TABLE public.system_logs ENABLE ROW LEVEL SECURITY;

-- Allow read access globally during dev/simulation mode
CREATE POLICY "Dev Mode Select Access"
    ON public.system_logs
    FOR SELECT
    USING (true);

-- Allow admins/headmasters to insert logs via API bypassing strict auth tokens
CREATE POLICY "Dev Mode Insert Access"
    ON public.system_logs
    FOR INSERT
    WITH CHECK (true);

-- Note: When you deploy the real Auth Provider (Phase 3), you should revert these to:
-- USING (auth.role() = 'authenticated')
