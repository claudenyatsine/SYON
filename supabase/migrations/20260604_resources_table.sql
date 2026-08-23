-- Ensure resources table has all required columns for live class publishing
-- This migration is safe to run multiple times (uses IF NOT EXISTS / ADD COLUMN IF NOT EXISTS)

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    format TEXT,
    file_url TEXT,
    size_mb TEXT,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL,
    live_class_id TEXT,
    source TEXT DEFAULT 'tutor_upload',
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Add columns if they don't already exist (safe on re-run)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'format') THEN
        ALTER TABLE public.resources ADD COLUMN format TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'file_url') THEN
        ALTER TABLE public.resources ADD COLUMN file_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'size_mb') THEN
        ALTER TABLE public.resources ADD COLUMN size_mb TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'subject_id') THEN
        ALTER TABLE public.resources ADD COLUMN subject_id UUID REFERENCES public.subjects(id) ON DELETE SET NULL;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'live_class_id') THEN
        ALTER TABLE public.resources ADD COLUMN live_class_id TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'source') THEN
        ALTER TABLE public.resources ADD COLUMN source TEXT DEFAULT 'tutor_upload';
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'resources' AND column_name = 'uploaded_by') THEN
        ALTER TABLE public.resources ADD COLUMN uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL;
    END IF;
END $$;

-- Enable RLS
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Tutors can insert resources
DROP POLICY IF EXISTS "Tutors can insert resources" ON public.resources;
CREATE POLICY "Tutors can insert resources" ON public.resources
    FOR INSERT WITH CHECK (
        auth.uid() = uploaded_by OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('tutor', 'admin'))
    );

-- Students can view resources for subjects they're enrolled in
DROP POLICY IF EXISTS "Students can view enrolled resources" ON public.resources;
CREATE POLICY "Students can view enrolled resources" ON public.resources
    FOR SELECT USING (
        subject_id IS NULL OR
        EXISTS (
            SELECT 1 FROM public.enrollments
            WHERE student_id = auth.uid()
            AND subject_id = resources.subject_id
            AND status = 'approved'
        ) OR
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('tutor', 'admin'))
    );
