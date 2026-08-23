-- Add file_url to submissions table
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS file_url TEXT;
ALTER TABLE public.submissions ALTER COLUMN raw_text DROP NOT NULL;

-- Create student_submissions bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('student_submissions', 'student_submissions', true)
ON CONFLICT (id) DO NOTHING;

-- RLS for student_submissions bucket
CREATE POLICY "Students can upload submissions" 
ON storage.objects FOR INSERT 
WITH CHECK ( bucket_id = 'student_submissions' AND auth.role() = 'authenticated' );

CREATE POLICY "Users can view submissions" 
ON storage.objects FOR SELECT 
USING ( bucket_id = 'student_submissions' );
