-- Add annotations_data to submissions table
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS annotations_data JSONB DEFAULT '[]'::jsonb;
