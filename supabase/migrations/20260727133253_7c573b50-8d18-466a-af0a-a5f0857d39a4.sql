REVOKE EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(UUID, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.set_updated_at() TO service_role;

CREATE POLICY "Wish images are publicly readable"
  ON storage.objects FOR SELECT TO anon, authenticated
  USING (bucket_id = 'wish-images');

CREATE POLICY "Anyone can upload wish images"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'wish-images');

CREATE POLICY "Admins can delete wish images"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'wish-images' AND public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update wish images"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'wish-images' AND public.has_role(auth.uid(), 'admin'));