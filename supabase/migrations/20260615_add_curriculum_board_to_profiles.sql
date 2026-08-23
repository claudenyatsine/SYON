-- Add curriculum board and student level to profiles
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS curriculum_board VARCHAR(50);
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS student_level VARCHAR(50);

-- Add curriculum board to subjects to allow filtering later
ALTER TABLE public.subjects ADD COLUMN IF NOT EXISTS curriculum_board VARCHAR(50);
