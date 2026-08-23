-- Migration: Add votes and parent_id to forum_comments

-- 1. Add columns
ALTER TABLE public.forum_comments 
ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE;

-- 2. Update RLS policies to allow updating comments (for voting)
DROP POLICY IF EXISTS "Anyone can update votes on comments" ON public.forum_comments;
CREATE POLICY "Anyone can update votes on comments" ON public.forum_comments
    FOR UPDATE USING (auth.role() = 'authenticated');
