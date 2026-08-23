-- Migration: Forum Schema
-- Creates tables and policies for the community forums feature

-- 1. Forum Communities
CREATE TABLE IF NOT EXISTS public.forum_communities (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.forum_communities ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view communities" ON public.forum_communities;
CREATE POLICY "Anyone can view communities" ON public.forum_communities
    FOR SELECT USING (auth.role() = 'authenticated');

-- 2. Forum Posts
CREATE TABLE IF NOT EXISTS public.forum_posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    community_id UUID REFERENCES public.forum_communities(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    tag VARCHAR(50),
    image_url TEXT,
    votes INTEGER DEFAULT 0 NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.forum_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view posts" ON public.forum_posts;
CREATE POLICY "Anyone can view posts" ON public.forum_posts
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own posts" ON public.forum_posts;
CREATE POLICY "Users can insert their own posts" ON public.forum_posts
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own posts" ON public.forum_posts;
CREATE POLICY "Users can delete their own posts" ON public.forum_posts
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tutors and Admins can delete any post" ON public.forum_posts;
CREATE POLICY "Tutors and Admins can delete any post" ON public.forum_posts
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('tutor', 'admin')
        )
    );

DROP POLICY IF EXISTS "Anyone can update votes on posts" ON public.forum_posts;
CREATE POLICY "Anyone can update votes on posts" ON public.forum_posts
    FOR UPDATE USING (auth.role() = 'authenticated');

-- 3. Forum Comments
CREATE TABLE IF NOT EXISTS public.forum_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    text TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.forum_comments ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Anyone can view comments" ON public.forum_comments;
CREATE POLICY "Anyone can view comments" ON public.forum_comments
    FOR SELECT USING (auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Users can insert their own comments" ON public.forum_comments;
CREATE POLICY "Users can insert their own comments" ON public.forum_comments
    FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own comments" ON public.forum_comments;
CREATE POLICY "Users can delete their own comments" ON public.forum_comments
    FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Tutors and Admins can delete any comment" ON public.forum_comments;
CREATE POLICY "Tutors and Admins can delete any comment" ON public.forum_comments
    FOR DELETE USING (
        EXISTS (
            SELECT 1 FROM public.profiles 
            WHERE id = auth.uid() AND role IN ('tutor', 'admin')
        )
    );

-- 4. Forum Saved Posts
CREATE TABLE IF NOT EXISTS public.forum_saved_posts (
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    post_id UUID REFERENCES public.forum_posts(id) ON DELETE CASCADE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (user_id, post_id)
);

ALTER TABLE public.forum_saved_posts ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own saved posts" ON public.forum_saved_posts;
CREATE POLICY "Users can manage their own saved posts" ON public.forum_saved_posts
    FOR ALL USING (auth.uid() = user_id);

-- 5. Realtime Publication
-- Add tables to the supabase_realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime;
COMMIT;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_posts;
ALTER PUBLICATION supabase_realtime ADD TABLE public.forum_comments;

-- 6. Insert Mock Communities
INSERT INTO public.forum_communities (id, name, description)
VALUES 
    ('00000000-0000-0000-0000-000000000001', 'A-Level Mathematics', 'Calculus, Algebra, and beyond.'),
    ('00000000-0000-0000-0000-000000000002', 'O-Level Biology', 'Cell biology, anatomy, ecosystems.'),
    ('00000000-0000-0000-0000-000000000003', 'General Discussion', 'Talk about anything related to school.')
ON CONFLICT (id) DO NOTHING;

-- 7. Create Storage Bucket for Forum Images
INSERT INTO storage.buckets (id, name, public)
VALUES ('forum-images', 'forum-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage Policies for forum-images
DROP POLICY IF EXISTS "Forum images are publicly accessible." ON storage.objects;
CREATE POLICY "Forum images are publicly accessible." ON storage.objects
FOR SELECT USING (bucket_id = 'forum-images');

DROP POLICY IF EXISTS "Authenticated users can upload forum images." ON storage.objects;
CREATE POLICY "Authenticated users can upload forum images." ON storage.objects
FOR INSERT WITH CHECK (bucket_id = 'forum-images' AND auth.role() = 'authenticated');