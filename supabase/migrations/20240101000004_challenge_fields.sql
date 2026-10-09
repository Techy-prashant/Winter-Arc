-- Add text response to challenge submissions
ALTER TABLE public.challenge_submissions
ADD COLUMN text_response text;
