-- Admin policies for moderation and full access
CREATE POLICY "Admins have full access to community_posts" ON public.community_posts FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to post_comments" ON public.post_comments FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to post_reactions" ON public.post_reactions FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to streaks_progress" ON public.streaks_progress FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to goals" ON public.goals FOR ALL USING (public.is_admin());
CREATE POLICY "Admins have full access to challenge_submissions" ON public.challenge_submissions FOR ALL USING (public.is_admin());

-- Also grant full storage access to admins for community buckets
CREATE POLICY "Admins can manage all community media" ON storage.objects FOR ALL USING (bucket_id = 'community' AND public.is_admin());
