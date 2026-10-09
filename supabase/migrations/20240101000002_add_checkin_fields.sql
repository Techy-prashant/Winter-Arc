-- Add new daily check-in fields
ALTER TABLE public.daily_check_ins
ADD COLUMN study_learned text,
ADD COLUMN physical_activity_type text,
ADD COLUMN physical_activity_duration_minutes integer DEFAULT 0;
