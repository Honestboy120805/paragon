-- Create testimonial-photos storage bucket for client profile photo uploads
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES 
  ('testimonial-photos', 'testimonial-photos', true, 5242880, ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'])
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = 5242880,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

-- Public read access
DROP POLICY IF EXISTS "testimonial_photos_public_read" ON storage.objects;
CREATE POLICY "testimonial_photos_public_read"
ON storage.objects FOR SELECT
TO public
USING (bucket_id = 'testimonial-photos');

-- Allow anyone (anon + authenticated) to upload testimonial photos
DROP POLICY IF EXISTS "testimonial_photos_public_insert" ON storage.objects;
CREATE POLICY "testimonial_photos_public_insert"
ON storage.objects FOR INSERT
TO public
WITH CHECK (bucket_id = 'testimonial-photos');

-- Allow anyone to update their own uploads
DROP POLICY IF EXISTS "testimonial_photos_public_update" ON storage.objects;
CREATE POLICY "testimonial_photos_public_update"
ON storage.objects FOR UPDATE
TO public
USING (bucket_id = 'testimonial-photos')
WITH CHECK (bucket_id = 'testimonial-photos');
