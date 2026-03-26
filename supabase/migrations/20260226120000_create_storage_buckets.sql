-- Create storage buckets for media uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('media-uploads', 'media-uploads', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('service-media', 'service-media', true, 52428800, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 52428800,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp', 'video/mp4', 'video/webm', 'video/ogg', 'video/quicktime'];

-- RLS policies for media-uploads bucket
DROP POLICY IF EXISTS "media_uploads_public_read" ON storage.objects;
CREATE POLICY "media_uploads_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'media-uploads');

DROP POLICY IF EXISTS "media_uploads_admin_insert" ON storage.objects;
CREATE POLICY "media_uploads_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'media-uploads');

DROP POLICY IF EXISTS "media_uploads_admin_update" ON storage.objects;
CREATE POLICY "media_uploads_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'media-uploads')
WITH CHECK (bucket_id = 'media-uploads');

DROP POLICY IF EXISTS "media_uploads_admin_delete" ON storage.objects;
CREATE POLICY "media_uploads_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'media-uploads');

-- RLS policies for service-media bucket
DROP POLICY IF EXISTS "service_media_public_read" ON storage.objects;
CREATE POLICY "service_media_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'service-media');

DROP POLICY IF EXISTS "service_media_admin_insert" ON storage.objects;
CREATE POLICY "service_media_admin_insert"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'service-media');

DROP POLICY IF EXISTS "service_media_admin_update" ON storage.objects;
CREATE POLICY "service_media_admin_update"
ON storage.objects FOR UPDATE
TO authenticated
USING (bucket_id = 'service-media')
WITH CHECK (bucket_id = 'service-media');

DROP POLICY IF EXISTS "service_media_admin_delete" ON storage.objects;
CREATE POLICY "service_media_admin_delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'service-media');
