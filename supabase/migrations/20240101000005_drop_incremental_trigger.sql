-- Drop the incremental trigger as we now calculate accountability deterministically via the TS Engine
DROP TRIGGER IF EXISTS tr_process_daily_check_in ON public.daily_check_ins;
DROP FUNCTION IF EXISTS public.process_daily_check_in() CASCADE;
