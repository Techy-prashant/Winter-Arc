-- Fix overly permissive Profiles RLS
DROP POLICY IF EXISTS "Profiles are viewable by everyone" ON public.profiles;
CREATE POLICY "Profiles are viewable by everyone" ON public.profiles FOR SELECT USING (auth.uid() = id OR public.is_admin());

-- Enforce case-insensitive and trimmed username uniqueness
CREATE UNIQUE INDEX IF NOT EXISTS profiles_username_lower_idx ON public.profiles (LOWER(TRIM(username)));

-- Secure community media bucket: Users can read community bucket, but not other users' proofs
-- Admins already have full access via admin_policies.sql
DROP POLICY IF EXISTS "Anyone can view community media" ON storage.objects;
CREATE POLICY "Anyone can view community media" ON storage.objects FOR SELECT USING (bucket_id = 'community');

-- Users can only view their OWN proofs
DROP POLICY IF EXISTS "Users can view their own proofs" ON storage.objects;
CREATE POLICY "Users can view their own proofs" ON storage.objects FOR SELECT USING (bucket_id = 'proofs' AND auth.uid() = owner);

CREATE POLICY "Admins can view all proofs" ON storage.objects FOR SELECT USING (bucket_id = 'proofs' AND public.is_admin());
