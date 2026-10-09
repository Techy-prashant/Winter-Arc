-- Create a storage bucket for proofs
INSERT INTO storage.buckets (id, name, public) VALUES ('proofs', 'proofs', true) ON CONFLICT DO NOTHING;

-- Set up storage RLS policies
CREATE POLICY "Proofs are publicly accessible" ON storage.objects FOR SELECT USING (bucket_id = 'proofs');
CREATE POLICY "Users can upload proofs" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'proofs' AND auth.uid() = owner);
