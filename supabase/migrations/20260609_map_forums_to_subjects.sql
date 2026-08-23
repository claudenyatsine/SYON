-- Migration: Link Forums to Subjects
-- Drops forum_communities and makes forum_posts point to subjects

-- 1. Clear out dummy data since community_id references will break
DELETE FROM public.forum_comments;
DELETE FROM public.forum_saved_posts;
DELETE FROM public.forum_posts;

-- 2. Rename column and update foreign key
ALTER TABLE public.forum_posts DROP CONSTRAINT IF EXISTS forum_posts_community_id_fkey;
ALTER TABLE public.forum_posts RENAME COLUMN community_id TO subject_id;
ALTER TABLE public.forum_posts ADD CONSTRAINT forum_posts_subject_id_fkey FOREIGN KEY (subject_id) REFERENCES public.subjects(id) ON DELETE CASCADE;

-- 3. Drop forum_communities safely
DROP TABLE IF EXISTS public.forum_communities CASCADE;
