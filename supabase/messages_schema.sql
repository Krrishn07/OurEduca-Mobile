-- SUPABASE MESSAGES SCHEMA
-- This file creates the table for persistent instiutional messaging.

-- 1. Create the base table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    school_id UUID NOT NULL REFERENCES public.schools(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    receiver_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Performance Indexes
CREATE INDEX IF NOT EXISTS idx_messages_school ON public.messages(school_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON public.messages(sender_id, receiver_id);
CREATE INDEX IF NOT EXISTS idx_messages_time ON public.messages(created_at DESC);

-- 3. Row Level Security Policies (Enabling Dev Persistence)
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- Allow read access globally during dev/simulation mode
CREATE POLICY "Dev Mode Select Access"
    ON public.messages
    FOR SELECT
    USING (true);

-- Allow users to insert messages during simulation mode
CREATE POLICY "Dev Mode Insert Access"
    ON public.messages
    FOR INSERT
    WITH CHECK (true);

-- 4. Realtime Configuration
-- Enable Realtime for the messages table so the UI can react instantly to new messages
ALTER PUBLICATION supabase_realtime ADD TABLE public.messages;
