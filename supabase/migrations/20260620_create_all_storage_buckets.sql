-- ==============================================================================
-- Migration: Create All Storage Buckets & Policies
-- Creates: avatars, student_submissions, class_resources, course-banners, forum-media, resources
-- ==============================================================================

-- 1. Create all application storage buckets if they don't already exist
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
    ('avatars', 'avatars', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/gif', 'image/svg+xml']),
    ('student_submissions', 'student_submissions', true, 52428800, NULL),
    ('class_resources', 'class_resources', true, 52428800, NULL),
    ('course-banners', 'course-banners', true, 10485760, ARRAY['image/jpeg', 'image/png', 'image/webp']),
    ('forum-media', 'forum-media', true, 20971520, NULL),
    ('resources', 'resources', true, 52428800, NULL)
ON CONFLICT (id) DO UPDATE SET 
    public = EXCLUDED.public,
    file_size_limit = COALESCE(EXCLUDED.file_size_limit, storage.buckets.file_size_limit),
    allowed_mime_types = COALESCE(EXCLUDED.allowed_mime_types, storage.buckets.allowed_mime_types);

-- 2. Storage Policies for 'avatars'
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." 
ON storage.objects FOR SELECT USING (bucket_id = 'avatars');

DROP POLICY IF EXISTS "Authenticated users can upload avatars." ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars." 
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can update their avatars." ON storage.objects;
CREATE POLICY "Authenticated users can update their avatars." 
ON storage.objects FOR UPDATE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

DROP POLICY IF EXISTS "Authenticated users can delete their avatars." ON storage.objects;
CREATE POLICY "Authenticated users can delete their avatars." 
ON storage.objects FOR DELETE USING (bucket_id = 'avatars' AND auth.role() = 'authenticated');

-- 3. Storage Policies for 'student_submissions'
DROP POLICY IF EXISTS "Submissions are publicly accessible" ON storage.objects;
CREATE POLICY "Submissions are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'student_submissions');

DROP POLICY IF EXISTS "Authenticated users can upload submissions" ON storage.objects;
CREATE POLICY "Authenticated users can upload submissions"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'student_submissions' AND auth.role() = 'authenticated');

-- 4. Storage Policies for 'class_resources'
DROP POLICY IF EXISTS "Class resources are publicly accessible" ON storage.objects;
CREATE POLICY "Class resources are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'class_resources');

DROP POLICY IF EXISTS "Authenticated users can upload class resources" ON storage.objects;
CREATE POLICY "Authenticated users can upload class resources"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'class_resources' AND auth.role() = 'authenticated');

-- 5. Storage Policies for 'course-banners'
DROP POLICY IF EXISTS "Course banners are publicly accessible" ON storage.objects;
CREATE POLICY "Course banners are publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'course-banners');

DROP POLICY IF EXISTS "Authenticated users can upload course banners" ON storage.objects;
CREATE POLICY "Authenticated users can upload course banners"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'course-banners' AND auth.role() = 'authenticated');

-- 6. Storage Policies for 'forum-media'
DROP POLICY IF EXISTS "Forum media is publicly accessible" ON storage.objects;
CREATE POLICY "Forum media is publicly accessible"
ON storage.objects FOR SELECT USING (bucket_id = 'forum-media');

DROP POLICY IF EXISTS "Authenticated users can upload forum media" ON storage.objects;
CREATE POLICY "Authenticated users can upload forum media"
ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'forum-media' AND auth.role() = 'authenticated');
