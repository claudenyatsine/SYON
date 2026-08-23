-- =========================================================================
--           FULL SYON DATABASE SCHEMA & MIGRATIONS MASTER SETUP
-- =========================================================================

-- --- 1. CORE SCHEMA (schema.sql) ---
-- 1. Create Custom Types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
        CREATE TYPE user_role AS ENUM ('student', 'admin');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'enrollment_status') THEN
        CREATE TYPE enrollment_status AS ENUM ('pending', 'approved', 'rejected');
    END IF;
END $$;

-- 2. Create Profiles Table (extends auth.users)
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
    email TEXT,
    full_name TEXT,
    avatar_url TEXT,
    role user_role DEFAULT 'student'::user_role NOT NULL,
    is_approved BOOLEAN DEFAULT FALSE NOT NULL,
    curriculum_board TEXT,
    gamification_score INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Idempotent column additions for profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_approved BOOLEAN DEFAULT FALSE;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS curriculum_board TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gamification_score INTEGER DEFAULT 0;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- Enable RLS for profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Profiles Policies
DROP POLICY IF EXISTS "Public profiles are viewable by everyone." ON public.profiles;
CREATE POLICY "Public profiles are viewable by everyone." 
ON public.profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "Users can insert their own profile." ON public.profiles;
CREATE POLICY "Users can insert their own profile." 
ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Users can update own profile." ON public.profiles;
CREATE POLICY "Users can update own profile." 
ON public.profiles FOR UPDATE USING (auth.uid() = id);

DROP POLICY IF EXISTS "Admins can update all profiles." ON public.profiles;
CREATE POLICY "Admins can update all profiles." 
ON public.profiles FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- Trigger to automatically create profile on signup
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.profiles (id, role, email, is_approved, full_name)
  VALUES (
    new.id, 
    'student', 
    new.email, 
    false, 
    COALESCE(new.raw_user_meta_data->>'full_name', initcap(replace(split_part(new.email, '@', 1), '.', ' ')))
  );
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop trigger if it exists
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- 3. Create Subjects Table
CREATE TABLE IF NOT EXISTS public.subjects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    level TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS for subjects
ALTER TABLE public.subjects ENABLE ROW LEVEL SECURITY;

-- Subjects Policies
DROP POLICY IF EXISTS "Subjects are viewable by everyone." ON public.subjects;
CREATE POLICY "Subjects are viewable by everyone." 
ON public.subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can modify subjects." ON public.subjects;
CREATE POLICY "Only admins can modify subjects." 
ON public.subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Create Enrollments Table
CREATE TABLE IF NOT EXISTS public.enrollments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    status enrollment_status DEFAULT 'pending'::enrollment_status NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, subject_id)
);

-- Enable RLS for enrollments
ALTER TABLE public.enrollments ENABLE ROW LEVEL SECURITY;

-- Enrollments Policies
DROP POLICY IF EXISTS "Students can view their own enrollments." ON public.enrollments;
CREATE POLICY "Students can view their own enrollments." 
ON public.enrollments FOR SELECT USING (
  auth.uid() = student_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Students can create their own pending enrollments." ON public.enrollments;
CREATE POLICY "Students can create their own pending enrollments." 
ON public.enrollments FOR INSERT WITH CHECK (
  auth.uid() = student_id AND status = 'pending'
);

DROP POLICY IF EXISTS "Admins can create enrollments." ON public.enrollments;
CREATE POLICY "Admins can create enrollments." 
ON public.enrollments FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Only admins can update enrollments." ON public.enrollments;
CREATE POLICY "Only admins can update enrollments." 
ON public.enrollments FOR UPDATE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

DROP POLICY IF EXISTS "Only admins can delete enrollments." ON public.enrollments;
CREATE POLICY "Only admins can delete enrollments." 
ON public.enrollments FOR DELETE USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 5. Seed Database (The Subjects)
INSERT INTO public.subjects (name, category, level) VALUES
-- O-Level / Core Sciences
('Combined Science', 'Core Sciences', 'O-Level'),
('Biology', 'Core Sciences', 'O-Level'),
('Physics', 'Core Sciences', 'O-Level'),
('Chemistry', 'Core Sciences', 'O-Level'),
('Mathematics', 'Core Sciences', 'O-Level'),
('Additional Mathematics', 'Core Sciences', 'O-Level'),
('Agriculture', 'Core Sciences', 'O-Level'),
('Computer Science', 'Core Sciences', 'O-Level'),

-- O-Level / Arts & Humanities
('Heritage Studies', 'Arts & Humanities', 'O-Level'),
('History', 'Arts & Humanities', 'O-Level'),
('Family and Religious Studies (FRS)', 'Arts & Humanities', 'O-Level'),
('Indigenous Languages (Shona, Ndebele)', 'Arts & Humanities', 'O-Level'),
('Literature in English', 'Arts & Humanities', 'O-Level'),
('Geography', 'Arts & Humanities', 'O-Level'),
('Musical Arts / Theatre Art', 'Arts & Humanities', 'O-Level'),

-- A-Level / Sciences & Mathematics
('Biology', 'Sciences & Mathematics', 'A-Level'),
('Chemistry', 'Sciences & Mathematics', 'A-Level'),
('Physics', 'Sciences & Mathematics', 'A-Level'),
('Mathematics', 'Sciences & Mathematics', 'A-Level'),
('Further Mathematics', 'Sciences & Mathematics', 'A-Level'),
('Computer Science', 'Sciences & Mathematics', 'A-Level'),

-- A-Level / Arts & Humanities
('Literature in English', 'Arts & Humanities', 'A-Level'),
('History', 'Arts & Humanities', 'A-Level'),
('Divinity', 'Arts & Humanities', 'A-Level'),
('Geography', 'Arts & Humanities', 'A-Level'),
('Indigenous Languages (Shona, Ndebele)', 'Arts & Humanities', 'A-Level'),
('Heritage Studies', 'Arts & Humanities', 'A-Level'),
('Sociology', 'Arts & Humanities', 'A-Level')
ON CONFLICT DO NOTHING;

-- Create an enum for resource types
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_type') THEN
        CREATE TYPE resource_type AS ENUM ('past_paper', 'notes', 'voice_note', 'powerpoint', 'recording');
    END IF;
END $$;

-- Create the resources table
CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    subject_id UUID NOT NULL REFERENCES public.subjects(id) ON DELETE CASCADE,
    tutor_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    type resource_type NOT NULL,
    file_url TEXT NOT NULL,
    file_size TEXT, -- Optional: e.g., "4.2 MB"
    duration TEXT   -- Optional: e.g., "12:34" for audio/video
);

-- Enable Row Level Security
ALTER TABLE public.resources ENABLE ROW LEVEL SECURITY;

-- Create RLS Policy: Students can only view resources for subjects they are actively enrolled in
DROP POLICY IF EXISTS "Students can view resources of enrolled subjects" ON public.resources;
CREATE POLICY "Students can view resources of enrolled subjects" ON public.resources
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 
            FROM public.enrollments e
            WHERE e.subject_id = public.resources.subject_id
              AND e.student_id = auth.uid()
              AND e.status = 'approved'
        )
    );

-- 6. Forum Upgrade (Posts, Comments, Votes)
CREATE TABLE IF NOT EXISTS public.posts (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    community_id UUID,
    title TEXT,
    content TEXT NOT NULL,
    image_url TEXT,
    tag TEXT DEFAULT 'Discussion',
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;

-- Upgrade Posts Table safely
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS title TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS image_url TEXT;
ALTER TABLE public.posts ADD COLUMN IF NOT EXISTS tag TEXT DEFAULT 'Discussion';

-- Update existing rows that have NULL titles to avoid NOT NULL violations if any exist
UPDATE public.posts SET title = substring(content from 1 for 30) || '...' WHERE title IS NULL;

ALTER TABLE public.posts ALTER COLUMN title SET NOT NULL;

-- Create Comments Table
CREATE TABLE IF NOT EXISTS public.post_comments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    content TEXT NOT NULL,
    votes INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;

-- Create Post Votes Junction Table (to prevent multi-voting)
CREATE TABLE IF NOT EXISTS public.post_votes (
    post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    vote_type SMALLINT NOT NULL CHECK (vote_type = 1 OR vote_type = -1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (post_id, user_id)
);

ALTER TABLE public.post_votes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for posts, post_comments, post_votes
DROP POLICY IF EXISTS "Anyone can view posts." ON public.posts;
CREATE POLICY "Anyone can view posts." ON public.posts FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert posts." ON public.posts;
CREATE POLICY "Authenticated users can insert posts." ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own posts." ON public.posts;
CREATE POLICY "Users can update own posts." ON public.posts FOR UPDATE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own posts." ON public.posts;
CREATE POLICY "Users can delete own posts." ON public.posts FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view comments." ON public.post_comments;
CREATE POLICY "Anyone can view comments." ON public.post_comments FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can insert comments." ON public.post_comments;
CREATE POLICY "Authenticated users can insert comments." ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own comments." ON public.post_comments;
CREATE POLICY "Users can delete own comments." ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Anyone can view post votes." ON public.post_votes;
CREATE POLICY "Anyone can view post votes." ON public.post_votes FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated users can manage post votes." ON public.post_votes;
CREATE POLICY "Authenticated users can manage post votes." ON public.post_votes FOR ALL USING (auth.uid() = user_id);

-- 7. Add email & full_name to profiles (if missing) and populate existing profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS email TEXT;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS full_name TEXT;

-- Populate existing profiles with email & full_name from auth.users
UPDATE public.profiles p
SET 
  email = COALESCE(p.email, u.email),
  full_name = COALESCE(
    NULLIF(p.full_name, ''),
    NULLIF(u.raw_user_meta_data->>'full_name', ''),
    NULLIF(u.raw_user_meta_data->>'name', ''),
    initcap(replace(split_part(u.email, '@', 1), '.', ' '))
  )
FROM auth.users u
WHERE p.id = u.id AND (p.email IS NULL OR p.full_name IS NULL OR p.full_name = '' OR p.full_name = 'Unnamed Student');

-- 8. Add Resource Library schema
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_format') THEN
        CREATE TYPE resource_format AS ENUM ('pdf', 'video', 'word', 'excel', 'ppt', 'mp3');
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'resource_source') THEN
        CREATE TYPE resource_source AS ENUM ('tutor_upload', 'live_class_automation');
    END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    format resource_format NOT NULL,
    source resource_source NOT NULL,
    file_url TEXT NOT NULL,
    size_mb DECIMAL(10, 2),
    uploaded_by UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    live_class_id UUID,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

CREATE TABLE IF NOT EXISTS public.student_offline_resources (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    resource_id UUID REFERENCES public.resources(id) ON DELETE CASCADE,
    saved_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, resource_id)
);

-- 9. Tutor Assignments
CREATE TABLE IF NOT EXISTS public.tutor_subjects (
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    assigned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    PRIMARY KEY (tutor_id, subject_id)
);

-- Enable RLS
ALTER TABLE public.tutor_subjects ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Tutor assignments viewable by everyone." ON public.tutor_subjects;
CREATE POLICY "Tutor assignments viewable by everyone." 
ON public.tutor_subjects FOR SELECT USING (true);

DROP POLICY IF EXISTS "Only admins can manage tutor assignments." ON public.tutor_subjects;
CREATE POLICY "Only admins can manage tutor assignments." 
ON public.tutor_subjects FOR ALL USING (
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 10. Curriculum Module System
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'module_item_type') THEN
        CREATE TYPE module_item_type AS ENUM ('live_class', 'test', 'resource', 'topic');
    ELSE
        -- Ensure 'topic' is added to the enum if it doesn't exist
        BEGIN
            ALTER TYPE module_item_type ADD VALUE 'topic';
        EXCEPTION WHEN duplicate_object THEN
            NULL;
        END;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'approval_status') THEN
        CREATE TYPE approval_status AS ENUM ('draft_pending', 'approved', 'rejected');
    END IF;
END $$;

-- Modules table
CREATE TABLE IF NOT EXISTS public.modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    course_level VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    sequence_order INT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(subject_id, sequence_order)
);

ALTER TABLE public.modules ADD COLUMN IF NOT EXISTS course_level VARCHAR(50);

ALTER TABLE public.modules ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Modules are viewable by everyone." ON public.modules;
CREATE POLICY "Modules are viewable by everyone." ON public.modules FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins and tutors can manage modules." ON public.modules;
CREATE POLICY "Admins and tutors can manage modules." ON public.modules FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor'))
);

-- Live Classes table
CREATE TABLE IF NOT EXISTS public.live_classes (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title VARCHAR(255) NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE NOT NULL,
    due_date TIMESTAMP WITH TIME ZONE,
    meeting_link TEXT,
    recording_url TEXT,
    presentation_url TEXT,
    status VARCHAR(50) DEFAULT 'scheduled',
    approval_status approval_status DEFAULT 'draft_pending',
    proposed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.live_classes ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Live classes viewable by enrolled students, tutors, and admins." ON public.live_classes;
CREATE POLICY "Live classes viewable by enrolled students, tutors, and admins." ON public.live_classes FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor')) OR
    (approval_status = 'approved' AND EXISTS (SELECT 1 FROM public.enrollments WHERE student_id = auth.uid() AND subject_id = public.live_classes.subject_id AND status = 'approved'))
);
DROP POLICY IF EXISTS "Admins and tutors can manage live classes." ON public.live_classes;
CREATE POLICY "Admins and tutors can manage live classes." ON public.live_classes FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor'))
);

-- Module Items table
CREATE TABLE IF NOT EXISTS public.module_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    item_type module_item_type NOT NULL,
    reference_id UUID,
    sequence_order INT NOT NULL,
    start_date TIMESTAMP WITH TIME ZONE,
    end_date TIMESTAMP WITH TIME ZONE,
    metadata JSONB,
    UNIQUE(module_id, sequence_order)
);

-- Idempotent schema upgrades for module_items
ALTER TABLE public.module_items ALTER COLUMN reference_id DROP NOT NULL;
ALTER TABLE public.module_items ADD COLUMN IF NOT EXISTS start_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.module_items ADD COLUMN IF NOT EXISTS end_date TIMESTAMP WITH TIME ZONE;
ALTER TABLE public.module_items ADD COLUMN IF NOT EXISTS metadata JSONB;

ALTER TABLE public.module_items ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Module items are viewable by everyone." ON public.module_items;
CREATE POLICY "Module items are viewable by everyone." ON public.module_items FOR SELECT USING (true);
DROP POLICY IF EXISTS "Admins and tutors can manage module items." ON public.module_items;
CREATE POLICY "Admins and tutors can manage module items." ON public.module_items FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor'))
);

-- Tests Table
CREATE TABLE IF NOT EXISTS public.tests (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    title VARCHAR(255) NOT NULL,
    scheduled_time TIMESTAMP WITH TIME ZONE NOT NULL,
    duration_minutes INT NOT NULL,
    max_score INT DEFAULT 100,
    approval_status approval_status DEFAULT 'draft_pending',
    proposed_by UUID REFERENCES public.profiles(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE public.tests ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Tests viewable by enrolled students, tutors, and admins." ON public.tests;
CREATE POLICY "Tests viewable by enrolled students, tutors, and admins." ON public.tests FOR SELECT USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor')) OR
    (approval_status = 'approved' AND EXISTS (
        SELECT 1 FROM public.modules m 
        JOIN public.enrollments e ON e.subject_id = m.subject_id 
        WHERE m.id = public.tests.module_id AND e.student_id = auth.uid() AND e.status = 'approved'
    ))
);
DROP POLICY IF EXISTS "Admins and tutors can manage tests." ON public.tests;
CREATE POLICY "Admins and tutors can manage tests." ON public.tests FOR ALL USING (
    EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor'))
);

-- Student Module Progress Table
CREATE TABLE IF NOT EXISTS public.student_module_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    module_id UUID REFERENCES public.modules(id) ON DELETE CASCADE,
    is_completed BOOLEAN DEFAULT FALSE NOT NULL,
    score DECIMAL(5, 2) DEFAULT 0.00,
    completed_at TIMESTAMP WITH TIME ZONE,
    UNIQUE(student_id, module_id)
);

ALTER TABLE public.student_module_progress ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own module progress." ON public.student_module_progress;
CREATE POLICY "Users can view their own module progress." ON public.student_module_progress FOR SELECT USING (
    auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor'))
);

-- Student Item Completions Table
CREATE TABLE IF NOT EXISTS public.student_item_completions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.module_items(id) ON DELETE CASCADE,
    is_done BOOLEAN DEFAULT TRUE NOT NULL,
    score_achieved INT,
    completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
    UNIQUE(student_id, item_id)
);

ALTER TABLE public.student_item_completions ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Users can view their own item completions." ON public.student_item_completions;
CREATE POLICY "Users can view their own item completions." ON public.student_item_completions FOR SELECT USING (
    auth.uid() = student_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role IN ('admin', 'tutor'))
);

-- Trigger Function
DROP FUNCTION IF EXISTS public.update_student_module_progress() CASCADE;
CREATE OR REPLACE FUNCTION public.update_student_module_progress()
RETURNS TRIGGER AS $$
DECLARE
    v_module_id UUID;
    v_total_items INT;
    v_completed_items INT;
    v_avg_score DECIMAL(5,2);
BEGIN
    -- Get the module context for the completed item
    SELECT module_id INTO v_module_id 
    FROM public.module_items WHERE id = NEW.item_id;

    -- Count total active items belonging to this specific module
    SELECT COUNT(*) INTO v_total_items 
    FROM public.module_items WHERE module_id = v_module_id;

    -- Count how many of those specific items the student has finished
    SELECT COUNT(*) INTO v_completed_items 
    FROM public.student_item_completions sic
    JOIN public.module_items mi ON sic.item_id = mi.id
    WHERE mi.module_id = v_module_id AND sic.student_id = NEW.student_id AND sic.is_done = true;

    -- Compute the mathematical mean of scores attained across all tests inside this module
    SELECT COALESCE(AVG((sic.score_achieved::decimal / t.max_score) * 100), 0) INTO v_avg_score
    FROM public.student_item_completions sic
    JOIN public.module_items mi ON sic.item_id = mi.id
    JOIN public.tests t ON mi.reference_id = t.id
    WHERE mi.module_id = v_module_id 
      AND mi.item_type = 'test' 
      AND sic.student_id = NEW.student_id;

    -- Upsert the computed tracking status directly into the module progress ledger
    INSERT INTO public.student_module_progress (student_id, module_id, is_completed, score, completed_at)
    VALUES (
        NEW.student_id, 
        v_module_id, 
        (v_total_items = v_completed_items AND v_total_items > 0),
        v_avg_score,
        CASE WHEN (v_total_items = v_completed_items AND v_total_items > 0) THEN NOW() ELSE NULL END
    )
    ON CONFLICT (student_id, module_id) 
    DO UPDATE SET 
        is_completed = EXCLUDED.is_completed,
        score = EXCLUDED.score,
        completed_at = EXCLUDED.completed_at;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_sync_progress ON public.student_item_completions;
CREATE TRIGGER trigger_sync_progress
AFTER INSERT OR UPDATE ON public.student_item_completions
FOR EACH ROW EXECUTE FUNCTION public.update_student_module_progress();

-- 11. RPC for Batch Curriculum Creation
DROP FUNCTION IF EXISTS public.batch_create_curriculum(UUID, UUID, JSONB) CASCADE;
CREATE OR REPLACE FUNCTION public.batch_create_curriculum(
    p_subject_id UUID,
    p_tutor_id UUID,
    p_modules JSONB
) RETURNS BOOLEAN AS $body$
DECLARE
    v_module_record RECORD;
    v_item_record RECORD;
    v_new_module_id UUID;
    v_new_class_id UUID;
    v_new_test_id UUID;
BEGIN
    -- Loop through modules provided in the JSON payload
    FOR v_module_record IN SELECT * FROM jsonb_to_recordset(p_modules) AS x(title TEXT, description TEXT, sequence_order INT, items JSONB) LOOP
        
        INSERT INTO public.modules (subject_id, title, description, sequence_order)
        VALUES (p_subject_id, v_module_record.title, v_module_record.description, v_module_record.sequence_order)
        RETURNING id INTO v_new_module_id;

        -- Loop through items inside this module
        IF v_module_record.items IS NOT NULL THEN
            FOR v_item_record IN SELECT * FROM jsonb_to_recordset(v_module_record.items) AS y(title TEXT, item_type TEXT, due_date TIMESTAMPTZ, duration_minutes INT) LOOP
                
                IF v_item_record.item_type = 'live_class' THEN
                    INSERT INTO public.live_classes (subject_id, title, due_date, proposed_by, approval_status)
                    VALUES (p_subject_id, v_item_record.title, v_item_record.due_date, p_tutor_id, 'draft_pending')
                    RETURNING id INTO v_new_class_id;

                    INSERT INTO public.module_items (module_id, title, item_type, reference_id, sequence_order)
                    VALUES (v_new_module_id, v_item_record.title, 'live_class', v_new_class_id, 1);

                ELSIF v_item_record.item_type = 'test' THEN
                    INSERT INTO public.tests (module_id, title, scheduled_time, duration_minutes, proposed_by, approval_status)
                    VALUES (v_new_module_id, v_item_record.title, v_item_record.due_date, v_item_record.duration_minutes, p_tutor_id, 'draft_pending')
                    RETURNING id INTO v_new_test_id;

                    INSERT INTO public.module_items (module_id, title, item_type, reference_id, sequence_order)
                    VALUES (v_new_module_id, v_item_record.title, 'test', v_new_test_id, 1);
                END IF;

            END LOOP;
        END IF;
    END LOOP;
    RETURN TRUE;
END;
$body$ LANGUAGE plpgsql;


-- 12. Add tutor assignment to enrollments
DO $$ 
BEGIN
    ALTER TABLE public.enrollments ADD COLUMN IF NOT EXISTS tutor_id UUID REFERENCES public.profiles(id);
EXCEPTION WHEN duplicate_column THEN NULL;
END $$;

-- --- MIGRATION: 20260601_student_tutor_extensions.sql ---
-- SQL Migration for Tutor-Student dashboard features: Messages & Deadlines

-- 1. Create Messages Table
CREATE TABLE IF NOT EXISTS public.student_tutor_messages (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    sender_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    receiver_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.student_tutor_messages ENABLE ROW LEVEL SECURITY;

-- Policies for Messages
DROP POLICY IF EXISTS "Users can view their own messages." ON public.student_tutor_messages;
CREATE POLICY "Users can view their own messages." ON public.student_tutor_messages
    FOR SELECT USING (auth.uid() = sender_id OR auth.uid() = receiver_id);

DROP POLICY IF EXISTS "Users can insert their own messages." ON public.student_tutor_messages;
CREATE POLICY "Users can insert their own messages." ON public.student_tutor_messages
    FOR INSERT WITH CHECK (auth.uid() = sender_id);


-- 2. Create Deadlines Table
CREATE TABLE IF NOT EXISTS public.student_deadlines (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    due_date TIMESTAMP WITH TIME ZONE NOT NULL,
    status VARCHAR(50) DEFAULT 'pending' NOT NULL, -- 'pending', 'completed', 'overdue'
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE public.student_deadlines ENABLE ROW LEVEL SECURITY;

-- Policies for Deadlines
DROP POLICY IF EXISTS "Users can view their own deadlines." ON public.student_deadlines;
CREATE POLICY "Users can view their own deadlines." ON public.student_deadlines
    FOR SELECT USING (auth.uid() = tutor_id OR auth.uid() = student_id);

DROP POLICY IF EXISTS "Tutors can manage deadlines." ON public.student_deadlines;
CREATE POLICY "Tutors can manage deadlines." ON public.student_deadlines
    FOR ALL USING (auth.uid() = tutor_id);

-- 3. Update Enrollments select policy to allow tutors to view their assigned students
DROP POLICY IF EXISTS "Students can view their own enrollments." ON public.enrollments;
CREATE POLICY "Students can view their own enrollments." 
ON public.enrollments FOR SELECT USING (
  auth.uid() = student_id OR
  auth.uid() = tutor_id OR
  EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
);

-- 4. Create Student Assignments Table
CREATE TABLE IF NOT EXISTS public.student_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    student_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    module_item_id UUID REFERENCES public.module_items(id) ON DELETE CASCADE NOT NULL,
    assignment_number INT NOT NULL CHECK (assignment_number BETWEEN 1 AND 4),
    status VARCHAR(50) DEFAULT 'not_started' NOT NULL, -- 'not_started', 'unmarked', 'completed'
    student_submission TEXT,
    tutor_feedback TEXT,
    submitted_at TIMESTAMP WITH TIME ZONE,
    marked_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(student_id, module_item_id, assignment_number)
);

-- Enable RLS
ALTER TABLE public.student_assignments ENABLE ROW LEVEL SECURITY;

-- Policies for student_assignments
DROP POLICY IF EXISTS "Users can view their own student assignments." ON public.student_assignments;
CREATE POLICY "Users can view their own student assignments." ON public.student_assignments
    FOR SELECT USING (auth.uid() = student_id OR auth.uid() = tutor_id OR EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin'));

DROP POLICY IF EXISTS "Students can insert their own assignments." ON public.student_assignments;
CREATE POLICY "Students can insert their own assignments." ON public.student_assignments
    FOR INSERT WITH CHECK (auth.uid() = student_id);

DROP POLICY IF EXISTS "Users can update their own assignments." ON public.student_assignments;
CREATE POLICY "Users can update their own assignments." ON public.student_assignments
    FOR UPDATE USING (auth.uid() = student_id OR auth.uid() = tutor_id);




-- --- MIGRATION: 20260603_forum_schema.sql ---
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

-- --- MIGRATION: 20260603_tutor_grading_schema.sql ---
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


-- --- MIGRATION: 20260604100000_grading_schema.sql ---
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


-- --- MIGRATION: 20260604_class_resources_bucket.sql ---
-- Create a new storage bucket for class resources
insert into storage.buckets (id, name, public)
values ('class_resources', 'class_resources', true)
on conflict (id) do nothing;

-- Set up security policies
create policy "Public Access"
on storage.objects for select
using ( bucket_id = 'class_resources' );

create policy "Authenticated users can upload"
on storage.objects for insert
with check ( bucket_id = 'class_resources' and auth.role() = 'authenticated' );


-- --- MIGRATION: 20260604_curriculum_approval_workflow.sql ---
-- Drop the ENUM if it exists (for safety)
DROP TYPE IF EXISTS public.approval_state CASCADE;
CREATE TYPE public.approval_state AS ENUM ('draft', 'pending_admin_review', 'approved', 'rejected');

-- Drop existing tables to avoid schema conflicts
DROP TABLE IF EXISTS public.curriculum_assignments CASCADE;
DROP TABLE IF EXISTS public.curriculum_items CASCADE;
DROP TABLE IF EXISTS public.curriculum_modules CASCADE;

-- 1. Curriculum Modules Table
CREATE TABLE public.curriculum_modules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    subject_id UUID REFERENCES public.subjects(id) ON DELETE CASCADE NOT NULL,
    tutor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    description TEXT,
    sequence_order INTEGER NOT NULL,
    course_level TEXT, -- e.g., 'O-Level', 'AS-Level', 'A-Level'
    approval_status public.approval_state DEFAULT 'draft' NOT NULL,
    admin_feedback TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 2. Curriculum Items Table (Topics, Classes, Tests)
CREATE TABLE public.curriculum_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_id UUID REFERENCES public.curriculum_modules(id) ON DELETE CASCADE NOT NULL,
    title TEXT NOT NULL,
    item_type TEXT CHECK (item_type IN ('topic', 'live_class', 'test')) NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb, -- Stores key_questions, exam_allocation_2026, etc.
    start_date TIMESTAMP WITH TIME ZONE,
    duration_minutes INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- 3. Curriculum Assignments Table
CREATE TABLE public.curriculum_assignments (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    module_item_id UUID REFERENCES public.curriculum_items(id) ON DELETE CASCADE NOT NULL,
    assignment_number INTEGER NOT NULL,
    title TEXT NOT NULL,
    description TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    UNIQUE(module_item_id, assignment_number)
);

-- Trigger for updating updated_at timestamp
DROP FUNCTION IF EXISTS update_modified_column() CASCADE;
CREATE OR REPLACE FUNCTION update_modified_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_curriculum_modules_modtime
    BEFORE UPDATE ON public.curriculum_modules
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

CREATE TRIGGER update_curriculum_items_modtime
    BEFORE UPDATE ON public.curriculum_items
    FOR EACH ROW EXECUTE PROCEDURE update_modified_column();

-- ==========================================
-- ROW LEVEL SECURITY (RLS)
-- ==========================================

ALTER TABLE public.curriculum_modules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.curriculum_assignments ENABLE ROW LEVEL SECURITY;

-- Admins can do everything
CREATE POLICY "Admins can manage all curriculum_modules" ON public.curriculum_modules
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admins can manage all curriculum_items" ON public.curriculum_items
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );
CREATE POLICY "Admins can manage all curriculum_assignments" ON public.curriculum_assignments
    FOR ALL USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin')
    );

-- Tutors can manage their own modules ONLY IF draft or rejected
CREATE POLICY "Tutors can view their own modules" ON public.curriculum_modules
    FOR SELECT USING (auth.uid() = tutor_id);

CREATE POLICY "Tutors can insert their own modules" ON public.curriculum_modules
    FOR INSERT WITH CHECK (auth.uid() = tutor_id);

CREATE POLICY "Tutors can update their own draft/rejected modules" ON public.curriculum_modules
    FOR UPDATE USING (
        auth.uid() = tutor_id AND approval_status IN ('draft', 'rejected')
    );

CREATE POLICY "Tutors can delete their own draft/rejected modules" ON public.curriculum_modules
    FOR DELETE USING (
        auth.uid() = tutor_id AND approval_status IN ('draft', 'rejected')
    );

-- Tutors can manage items and assignments if they own the module and it's draft or rejected
CREATE POLICY "Tutors can view items for their modules" ON public.curriculum_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.curriculum_modules WHERE id = module_id AND tutor_id = auth.uid())
    );

CREATE POLICY "Tutors can manage items for their draft/rejected modules" ON public.curriculum_items
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.curriculum_modules 
            WHERE id = module_id 
              AND tutor_id = auth.uid() 
              AND approval_status IN ('draft', 'rejected')
        )
    );

CREATE POLICY "Tutors can view assignments for their modules" ON public.curriculum_assignments
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM public.curriculum_items i
            JOIN public.curriculum_modules m ON m.id = i.module_id
            WHERE i.id = curriculum_assignments.module_item_id AND m.tutor_id = auth.uid()
        )
    );

CREATE POLICY "Tutors can manage assignments for their draft/rejected modules" ON public.curriculum_assignments
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.curriculum_items i
            JOIN public.curriculum_modules m ON m.id = i.module_id
            WHERE i.id = curriculum_assignments.module_item_id 
              AND m.tutor_id = auth.uid()
              AND m.approval_status IN ('draft', 'rejected')
        )
    );

-- Students can ONLY read approved curriculum
CREATE POLICY "Students can view approved modules" ON public.curriculum_modules
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
        AND approval_status = 'approved'
    );

CREATE POLICY "Students can view items of approved modules" ON public.curriculum_items
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
        AND EXISTS (SELECT 1 FROM public.curriculum_modules WHERE id = module_id AND approval_status = 'approved')
    );

CREATE POLICY "Students can view assignments of approved modules" ON public.curriculum_assignments
    FOR SELECT USING (
        EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'student')
        AND EXISTS (
            SELECT 1 FROM public.curriculum_items i
            JOIN public.curriculum_modules m ON m.id = i.module_id
            WHERE i.id = curriculum_assignments.module_item_id AND m.approval_status = 'approved'
        )
    );

-- ==========================================
-- RPC for Batch Creation
-- ==========================================

DROP FUNCTION IF EXISTS public.batch_create_curriculum(UUID, UUID, JSONB) CASCADE;
CREATE OR REPLACE FUNCTION public.batch_create_curriculum(
    p_subject_id UUID,
    p_tutor_id UUID,
    p_modules JSONB
) RETURNS void AS $$
DECLARE
    mod_record RECORD;
    item_record RECORD;
    assignment_record RECORD;
    v_module_id UUID;
    v_item_id UUID;
BEGIN
    FOR mod_record IN SELECT * FROM jsonb_array_elements(p_modules)
    LOOP
        -- Insert Module
        INSERT INTO public.curriculum_modules (
            subject_id, 
            tutor_id, 
            title, 
            description, 
            sequence_order,
            course_level,
            approval_status
        ) VALUES (
            p_subject_id,
            p_tutor_id,
            mod_record.value->>'title',
            mod_record.value->>'description',
            (mod_record.value->>'sequence_order')::INTEGER,
            mod_record.value->>'course_level',
            'pending_admin_review' -- Automatically set to pending
        ) RETURNING id INTO v_module_id;

        -- Insert Items
        IF mod_record.value ? 'items' THEN
            FOR item_record IN SELECT * FROM jsonb_array_elements(mod_record.value->'items')
            LOOP
                INSERT INTO public.curriculum_items (
                    module_id,
                    title,
                    item_type,
                    metadata,
                    start_date,
                    duration_minutes
                ) VALUES (
                    v_module_id,
                    item_record.value->>'title',
                    item_record.value->>'item_type',
                    (item_record.value->>'metadata')::JSONB,
                    (item_record.value->>'start_date')::TIMESTAMP WITH TIME ZONE,
                    (item_record.value->>'duration_minutes')::INTEGER
                ) RETURNING id INTO v_item_id;

                -- Insert Assignments (if any)
                IF item_record.value ? 'assignments' THEN
                    FOR assignment_record IN SELECT * FROM jsonb_array_elements(item_record.value->'assignments')
                    LOOP
                        INSERT INTO public.curriculum_assignments (
                            module_item_id,
                            assignment_number,
                            title,
                            description
                        ) VALUES (
                            v_item_id,
                            (assignment_record.value->>'assignment_number')::INTEGER,
                            assignment_record.value->>'title',
                            assignment_record.value->>'description'
                        );
                    END LOOP;
                END IF;
            END LOOP;
        END IF;
    END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --- MIGRATION: 20260604_gamification.sql ---
-- Add a gamification score column to the profiles table
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS gamification_score INTEGER DEFAULT 0 NOT NULL;

-- Create an RPC function to safely award points without overriding concurrent updates
DROP FUNCTION IF EXISTS award_points(UUID, INTEGER) CASCADE;
CREATE OR REPLACE FUNCTION award_points(user_id UUID, points INTEGER)
RETURNS VOID AS $$
BEGIN
    UPDATE public.profiles
    SET gamification_score = gamification_score + points
    WHERE id = user_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --- MIGRATION: 20260604_resources_table.sql ---
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


-- --- MIGRATION: 20260609_comments_features.sql ---
-- Migration: Add votes and parent_id to forum_comments

-- 1. Add columns
ALTER TABLE public.forum_comments 
ADD COLUMN IF NOT EXISTS votes INTEGER DEFAULT 0 NOT NULL,
ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES public.forum_comments(id) ON DELETE CASCADE;

-- 2. Update RLS policies to allow updating comments (for voting)
DROP POLICY IF EXISTS "Anyone can update votes on comments" ON public.forum_comments;
CREATE POLICY "Anyone can update votes on comments" ON public.forum_comments
    FOR UPDATE USING (auth.role() = 'authenticated');


-- --- MIGRATION: 20260609_get_storage_usage_rpc.sql ---
DROP FUNCTION IF EXISTS get_storage_usage() CASCADE;
CREATE OR REPLACE FUNCTION get_storage_usage()
RETURNS bigint AS $$
DECLARE
  total_size bigint;
BEGIN
  -- Sum up the size of all objects across all buckets
  SELECT SUM((metadata->>'size')::bigint)
  INTO total_size
  FROM storage.objects;
  
  RETURN COALESCE(total_size, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- --- MIGRATION: 20260609_map_forums_to_subjects.sql ---
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


-- --- MIGRATION: 20260610_add_annotations_data.sql ---
-- Add annotations_data to submissions table
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS annotations_data JSONB DEFAULT '[]'::jsonb;


-- --- MIGRATION: 20260610_student_submissions_bucket.sql ---
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


-- --- MIGRATION: 20260612_submissions_grading_fields.sql ---
-- Migration: Add component_scores to submissions table and alter overall_grade type
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS component_scores JSONB;
ALTER TABLE public.submissions ALTER COLUMN overall_grade TYPE VARCHAR(10);


-- --- MIGRATION: 20260615_add_curriculum_board_to_profiles.sql ---
-- Add curriculum board and student level to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS curriculum_board VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_level VARCHAR(50);

-- Add curriculum board to subjects to allow filtering later
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS curriculum_board VARCHAR(50);


