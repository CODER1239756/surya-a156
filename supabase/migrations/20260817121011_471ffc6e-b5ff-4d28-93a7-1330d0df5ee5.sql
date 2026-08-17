-- 1) Storage: only approved wish images are publicly readable
DROP POLICY IF EXISTS "Wish images are publicly readable" ON storage.objects;

CREATE POLICY "Approved wish images are readable"
ON storage.objects FOR SELECT
TO anon, authenticated
USING (
  bucket_id = 'wish-images'
  AND EXISTS (
    SELECT 1 FROM public.wishes w
    WHERE w.status = 'approved'
      AND (w.note_image_url = storage.objects.name OR w.profile_image_url = storage.objects.name)
  )
);

CREATE POLICY "Admins can read all wish images"
ON storage.objects FOR SELECT
TO authenticated
USING (bucket_id = 'wish-images' AND public.has_role(auth.uid(), 'admin'::public.app_role));

-- 2) has_role: keep usable inside RLS policies, but not callable as an API RPC
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon, authenticated;
