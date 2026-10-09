-- Phase 1: Architecture, Database, Security
-- Initial Schema Definition for Namdapha Winter Arc

-- Create Enums
CREATE TYPE public.user_role AS ENUM ('participant', 'admin');
CREATE TYPE public.account_status AS ENUM ('active', 'suspended', 'at-risk');
CREATE TYPE public.goal_category AS ENUM ('study', 'fitness', 'personal');
CREATE TYPE public.reaction_type AS ENUM ('fire', 'heart', 'respect');

-- 1. Profiles
CREATE TABLE public.profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  full_name text NOT NULL,
  username text UNIQUE NOT NULL,
  avatar_url text,
  bio text,
  phone_number text,
  instagram_handle text,
  program text,
  city text,
  role user_role NOT NULL DEFAULT 'participant',
  account_status account_status NOT NULL DEFAULT 'active',
  onboarded boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX profiles_username_idx ON public.profiles(username);
CREATE INDEX profiles_account_status_idx ON public.profiles(account_status);

-- 2. Consent Records
CREATE TABLE public.consent_records (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES public.profiles(id) ON DELETE CASCADE,
  agreed_to_rules boolean NOT NULL,
  community_visibility boolean NOT NULL,
  agreed_at timestamptz NOT NULL DEFAULT now()
);

-- 3. Participant Registrations (from Google Form)
CREATE TABLE public.participant_registrations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_email text UNIQUE NOT NULL,
  registration_data jsonb NOT NULL,
  imported_at timestamptz NOT NULL DEFAULT now(),
  profile_id uuid REFERENCES public.profiles(id) ON DELETE SET NULL
);

-- 4. Goals
CREATE TABLE public.goals (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  goal_text text NOT NULL,
  category goal_category NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 5. Daily Check-Ins
CREATE TABLE public.daily_check_ins (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  date date NOT NULL,
  study_duration_minutes integer NOT NULL DEFAULT 0,
  study_proof_url text,
  study_description text,
  physical_activity_completed boolean NOT NULL DEFAULT false,
  physical_activity_proof_url text,
  is_day_completed boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (user_id, date)
);

-- 6. Weekly Challenges
CREATE TABLE public.weekly_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text NOT NULL,
  start_date date NOT NULL,
  end_date date NOT NULL,
  created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 7. Challenge Submissions
CREATE TABLE public.challenge_submissions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenge_id uuid NOT NULL REFERENCES public.weekly_challenges(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  proof_url text NOT NULL,
  submitted_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (challenge_id, user_id)
);

-- 8. Community Posts
CREATE TABLE public.community_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  media_url text,
  linked_check_in_id uuid REFERENCES public.daily_check_ins(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 9. Post Comments
CREATE TABLE public.post_comments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  content text NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- 10. Post Reactions
CREATE TABLE public.post_reactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  post_id uuid NOT NULL REFERENCES public.community_posts(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  reaction_type reaction_type NOT NULL,
  UNIQUE (post_id, user_id)
);

-- 11. Streaks Progress
CREATE TABLE public.streaks_progress (
  user_id uuid PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  current_streak integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  total_study_minutes integer NOT NULL DEFAULT 0,
  total_workouts integer NOT NULL DEFAULT 0,
  last_completed_date date,
  leaderboard_score integer NOT NULL DEFAULT 0,
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Trigger for `updated_at` on profiles
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Function & Trigger: Automatic Streak Engine
CREATE OR REPLACE FUNCTION process_daily_check_in()
RETURNS TRIGGER AS $$
DECLARE
  v_is_day_completed boolean;
  v_last_completed_date date;
  v_current_streak integer;
  v_longest_streak integer;
  v_total_study_minutes integer;
  v_total_workouts integer;
BEGIN
  -- 1. Determine if the day is completed (>= 180 mins)
  v_is_day_completed := NEW.study_duration_minutes >= 180;
  NEW.is_day_completed := v_is_day_completed;
  
  -- 2. Fetch current streak data
  SELECT 
    last_completed_date, current_streak, longest_streak, total_study_minutes, total_workouts
  INTO 
    v_last_completed_date, v_current_streak, v_longest_streak, v_total_study_minutes, v_total_workouts
  FROM public.streaks_progress
  WHERE user_id = NEW.user_id;
  
  -- If no row exists in streaks_progress, initialize it
  IF NOT FOUND THEN
    INSERT INTO public.streaks_progress (user_id) VALUES (NEW.user_id)
    RETURNING last_completed_date, current_streak, longest_streak, total_study_minutes, total_workouts
    INTO v_last_completed_date, v_current_streak, v_longest_streak, v_total_study_minutes, v_total_workouts;
  END IF;

  -- 3. Calculate additions (Simple implementation assuming mostly INSERTs)
  IF TG_OP = 'INSERT' THEN
    v_total_study_minutes := v_total_study_minutes + NEW.study_duration_minutes;
    IF NEW.physical_activity_completed THEN
      v_total_workouts := v_total_workouts + 1;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    v_total_study_minutes := v_total_study_minutes - OLD.study_duration_minutes + NEW.study_duration_minutes;
    IF NEW.physical_activity_completed AND NOT OLD.physical_activity_completed THEN
      v_total_workouts := v_total_workouts + 1;
    ELSIF NOT NEW.physical_activity_completed AND OLD.physical_activity_completed THEN
      v_total_workouts := v_total_workouts - 1;
    END IF;
  END IF;

  -- 4. Streak Calculation Logic
  IF v_is_day_completed THEN
    IF v_last_completed_date IS NULL OR v_last_completed_date < NEW.date THEN
      IF v_last_completed_date = NEW.date - 1 THEN
        v_current_streak := v_current_streak + 1;
      ELSE
        v_current_streak := 1;
      END IF;
      v_last_completed_date := NEW.date;
      
      IF v_current_streak > v_longest_streak THEN
        v_longest_streak := v_current_streak;
      END IF;
    END IF;
  END IF;

  -- 5. Update Streaks Progress Table
  UPDATE public.streaks_progress
  SET 
    current_streak = v_current_streak,
    longest_streak = v_longest_streak,
    total_study_minutes = v_total_study_minutes,
    total_workouts = v_total_workouts,
    last_completed_date = v_last_completed_date,
    leaderboard_score = v_current_streak * 10 + v_total_workouts * 5,
    updated_at = now()
  WHERE user_id = NEW.user_id;

  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER tr_process_daily_check_in
  BEFORE INSERT OR UPDATE ON public.daily_check_ins
  FOR EACH ROW EXECUTE PROCEDURE process_daily_check_in();


-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.consent_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.participant_registrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_check_ins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.weekly_challenges ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.challenge_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.community_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_reactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.streaks_progress ENABLE ROW LEVEL SECURITY;


-- Profiles RLS
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles
  FOR SELECT USING (true);
CREATE POLICY "Users can update their own profile" ON public.profiles
  FOR UPDATE USING (auth.uid() = id);

-- Goals RLS
CREATE POLICY "Goals are viewable by owner" ON public.goals
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own goals" ON public.goals
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own goals" ON public.goals
  FOR UPDATE USING (auth.uid() = user_id);

-- Daily Check-Ins RLS
CREATE POLICY "Check-ins are viewable by owner" ON public.daily_check_ins
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own check-ins" ON public.daily_check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own check-ins" ON public.daily_check_ins
  FOR UPDATE USING (auth.uid() = user_id AND date >= current_date - interval '2 days');

-- Streaks Progress RLS
CREATE POLICY "Streaks are viewable by everyone" ON public.streaks_progress
  FOR SELECT USING (true);

-- Community Posts RLS
CREATE POLICY "Community posts are viewable by everyone" ON public.community_posts
  FOR SELECT USING (true);
CREATE POLICY "Users can insert their own posts" ON public.community_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own posts" ON public.community_posts
  FOR DELETE USING (auth.uid() = user_id);

-- Admin RLS rules
CREATE OR REPLACE FUNCTION public.is_admin() RETURNS boolean AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE POLICY "Admins have full access to profiles" ON public.profiles FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to check_ins" ON public.daily_check_ins FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to participant_registrations" ON public.participant_registrations FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to weekly_challenges" ON public.weekly_challenges FOR ALL USING (public.is_admin());

-- Default public policies for community interaction
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
CREATE POLICY "Users can create comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Reactions are viewable by everyone" ON public.post_reactions FOR SELECT USING (true);
CREATE POLICY "Users can create reactions" ON public.post_reactions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete their own reactions" ON public.post_reactions FOR DELETE USING (auth.uid() = user_id);
