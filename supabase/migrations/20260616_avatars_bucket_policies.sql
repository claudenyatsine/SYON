-- Migration: Storage RLS Policies for Avatars Bucket
-- Ensures users can upload and view profile pictures

INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO UPDATE SET public = true;

-- 1. Anyone can view public avatar images
DROP POLICY IF EXISTS "Avatar images are publicly accessible." ON storage.objects;
CREATE POLICY "Avatar images are publicly accessible." ON storage.objects
FOR SELECT USING (bucket_id = 'avatars');

-- 2. Authenticated users can upload their own avatar
DROP POLICY IF EXISTS "Authenticated users can upload avatars." ON storage.objects;
CREATE POLICY "Authenticated users can upload avatars." ON storage.objects
FOR INSERT WITH CHECK (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- 3. Authenticated users can update/overwrite their avatar
DROP POLICY IF EXISTS "Authenticated users can update their avatars." ON storage.objects;
CREATE POLICY "Authenticated users can update their avatars." ON storage.objects
FOR UPDATE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);

-- 4. Authenticated users can delete their avatar
DROP POLICY IF EXISTS "Authenticated users can delete their avatars." ON storage.objects;
CREATE POLICY "Authenticated users can delete their avatars." ON storage.objects
FOR DELETE USING (
  bucket_id = 'avatars' AND 
  auth.role() = 'authenticated'
);
