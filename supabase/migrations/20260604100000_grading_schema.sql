-- Grading & Annotation Workflow Schema

-- 1. Submissions Table
CREATE TABLE IF NOT EXISTS public.submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    assignment_id UUID NOT NULL, -- Logical link to assignments
    student_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    raw_text TEXT NOT NULL,
    overall_grade NUMERIC,
    overall_feedback TEXT,
    status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'grading', 'graded')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Submission Scores Table (Rubric Breakdown)
CREATE TABLE IF NOT EXISTS public.submission_scores (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    category TEXT NOT NULL, -- e.g., 'Content', 'Language'
    score NUMERIC NOT NULL,
    max_score NUMERIC NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Annotations Table
CREATE TABLE IF NOT EXISTS public.annotations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    submission_id UUID NOT NULL REFERENCES public.submissions(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    type TEXT NOT NULL CHECK (type IN ('highlight', 'comment', 'strikeout', 'insert', 'replace', 'resource')),
    start_offset INTEGER NOT NULL,
    end_offset INTEGER NOT NULL,
    selected_text TEXT,
    content TEXT, -- Comment text, correction text, or resource URL
    marker_number INTEGER, -- The badge number
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Realtime Setup
ALTER PUBLICATION supabase_realtime ADD TABLE public.annotations;

-- RLS Policies (Submissions)
ALTER TABLE public.submissions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own submissions" 
    ON public.submissions FOR SELECT 
    USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own submissions" 
    ON public.submissions FOR INSERT 
    WITH CHECK (auth.uid() = student_id);

CREATE POLICY "Tutors can view all submissions" 
    ON public.submissions FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tutor'));

CREATE POLICY "Tutors can update submissions" 
    ON public.submissions FOR UPDATE 
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tutor'));

-- RLS Policies (Submission Scores)
ALTER TABLE public.submission_scores ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view their own scores" 
    ON public.submission_scores FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND student_id = auth.uid()));

CREATE POLICY "Tutors can manage scores" 
    ON public.submission_scores FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tutor'));

-- RLS Policies (Annotations)
ALTER TABLE public.annotations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can view annotations on their submissions" 
    ON public.annotations FOR SELECT 
    USING (EXISTS (SELECT 1 FROM public.submissions WHERE id = submission_id AND student_id = auth.uid()));

CREATE POLICY "Tutors can manage annotations" 
    ON public.annotations FOR ALL
    USING (EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'tutor'));
