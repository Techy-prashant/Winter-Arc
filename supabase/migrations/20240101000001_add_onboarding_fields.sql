-- Add new onboarding fields to profiles
ALTER TABLE public.profiles
ADD COLUMN working_on text,
ADD COLUMN current_study_hours integer DEFAULT 0,
ADD COLUMN target_study_hours integer DEFAULT 0,
ADD COLUMN winter_goal text;
