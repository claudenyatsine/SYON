-- Migration for Tutor Grading Features: Hybrid Approach with Flexible Scores

-- 1. Add new columns to student_assignments
ALTER TABLE public.student_assignments
  ADD COLUMN IF NOT EXISTS component_scores JSONB,
  ADD COLUMN IF NOT EXISTS total_score INT,
  ADD COLUMN IF NOT EXISTS grade VARCHAR(5),
  ADD COLUMN IF NOT EXISTS overall_feedback TEXT,
  ADD COLUMN IF NOT EXISTS graded_document JSONB;

-- 2. Create assignment_annotations table for analytics/reporting
CREATE TABLE IF NOT EXISTS public.assignment_annotations (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    assignment_id UUID REFERENCES public.student_assignments(id) ON DELETE CASCADE NOT NULL,
    tiptap_mark_id VARCHAR(255) NOT NULL,
    annotation_type VARCHAR(50) NOT NULL, -- 'comment' or 'correction'
    category VARCHAR(50),                 -- 'vagueness', 'transition', etc.
    content TEXT,
    original_text TEXT,
    replacement_text TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE public.assignment_annotations ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies for assignment_annotations

-- Tutors can manage annotations for assignments they are assigned to/have marked
DROP POLICY IF EXISTS "Tutors can manage annotations" ON public.assignment_annotations;
CREATE POLICY "Tutors can manage annotations" 
ON public.assignment_annotations 
FOR ALL USING (
  EXISTS (
    SELECT 1 FROM public.student_assignments sa 
    WHERE sa.id = public.assignment_annotations.assignment_id 
    AND sa.tutor_id = auth.uid()
  )
);

-- Students can view their own annotations
DROP POLICY IF EXISTS "Students can view their own annotations" ON public.assignment_annotations;
CREATE POLICY "Students can view their own annotations" 
ON public.assignment_annotations 
FOR SELECT USING (
  EXISTS (
    SELECT 1 FROM public.student_assignments sa 
    WHERE sa.id = public.assignment_annotations.assignment_id 
    AND sa.student_id = auth.uid()
  )
);

-- Admins have full access
DROP POLICY IF EXISTS "Admins can manage annotations" ON public.assignment_annotations;
CREATE POLICY "Admins can manage annotations" 
ON public.assignment_annotations 
FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);
