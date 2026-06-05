
-- Remove user_roles from realtime publication to stop broadcasting role changes
ALTER PUBLICATION supabase_realtime DROP TABLE public.user_roles;

-- Add explicit admin-only INSERT/DELETE/UPDATE policies on user_roles
CREATE POLICY "Admins can insert user roles" ON public.user_roles
  FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can update user roles" ON public.user_roles
  FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can delete user roles" ON public.user_roles
  FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(), 'admin'::app_role));

-- Drop broad SELECT policy on storage.objects for product-images bucket.
-- Files remain accessible via the public CDN URL since the bucket is public,
-- but clients can no longer enumerate/list objects via the storage API.
DROP POLICY IF EXISTS "Public can view product images" ON storage.objects;
