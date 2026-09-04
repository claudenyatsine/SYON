-- Migration: Create parent_student_links table
CREATE TABLE IF NOT EXISTS public.parent_student_links (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    parent_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT now(),
    UNIQUE(student_id)
);

ALTER TABLE public.parent_student_links ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow authenticated read parent_student_links" 
ON public.parent_student_links FOR SELECT 
TO authenticated 
USING (true);

CREATE POLICY "Allow authenticated manage parent_student_links" 
ON public.parent_student_links FOR ALL 
TO authenticated 
USING (true) 
WITH CHECK (true);
