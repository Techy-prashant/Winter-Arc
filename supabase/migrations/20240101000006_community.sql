-- Secure the storage buckets
UPDATE storage.buckets SET public = false WHERE id = 'proofs';
INSERT INTO storage.buckets (id, name, public) VALUES ('community', 'community', false) ON CONFLICT DO NOTHING;

-- Drop old insecure policy
DROP POLICY IF EXISTS "Proofs are publicly accessible" ON storage.objects;

-- Create secure policies for proofs
CREATE POLICY "Users can read own proofs" ON storage.objects FOR SELECT USING (bucket_id = 'proofs' AND auth.uid() = owner);
CREATE POLICY "Admins can read all proofs" ON storage.objects FOR SELECT USING (bucket_id = 'proofs' AND public.is_admin());

-- Create policies for community media
CREATE POLICY "Authenticated users can read community media" ON storage.objects FOR SELECT USING (bucket_id = 'community' AND auth.role() = 'authenticated');
CREATE POLICY "Users can upload community media" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'community' AND auth.uid() = owner);
CREATE POLICY "Users can delete own community media" ON storage.objects FOR DELETE USING (bucket_id = 'community' AND auth.uid() = owner);

-- Add moderation state to community_posts
CREATE TYPE public.moderation_status AS ENUM ('approved', 'flagged', 'removed');

ALTER TABLE public.community_posts
ADD COLUMN moderation_status moderation_status NOT NULL DEFAULT 'approved',
ADD COLUMN moderated_by uuid REFERENCES public.profiles(id) ON DELETE SET NULL,
ADD COLUMN moderated_at timestamptz;

-- Update community_posts RLS to filter removed posts
DROP POLICY IF EXISTS "Community posts are viewable by everyone" ON public.community_posts;
CREATE POLICY "Community posts are viewable by authenticated users" ON public.community_posts 
  FOR SELECT USING (auth.role() = 'authenticated' AND (moderation_status != 'removed' OR public.is_admin() OR auth.uid() = user_id));
