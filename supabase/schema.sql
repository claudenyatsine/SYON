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
  INSERT INTO public.profiles (id, role, email, is_approved, full_name, avatar_url)
  VALUES (
    new.id, 
    COALESCE((new.raw_user_meta_data->>'role')::user_role, 'student'::user_role), 
    new.email, 
    false, 
    COALESCE(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name', initcap(replace(split_part(new.email, '@', 1), '.', ' '))),
    COALESCE(new.raw_user_meta_data->>'avatar_url', new.raw_user_meta_data->>'picture', NULL)
  )
  ON CONFLICT (id) DO UPDATE SET
    email = EXCLUDED.email,
    full_name = COALESCE(EXCLUDED.full_name, public.profiles.full_name),
    avatar_url = COALESCE(EXCLUDED.avatar_url, public.profiles.avatar_url);
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