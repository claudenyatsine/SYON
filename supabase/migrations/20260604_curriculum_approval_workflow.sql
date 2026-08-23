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
