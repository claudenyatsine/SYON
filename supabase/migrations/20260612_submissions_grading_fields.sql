-- Migration: Add component_scores to submissions table and alter overall_grade type
ALTER TABLE public.submissions ADD COLUMN IF NOT EXISTS component_scores JSONB;
ALTER TABLE public.submissions ALTER COLUMN overall_grade TYPE VARCHAR(10);
