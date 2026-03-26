-- Fix contact_submissions INSERT permission for anonymous users
-- The RLS policy exists but the anon role needs explicit table privileges

-- Grant INSERT privilege to anon role so unauthenticated users can submit contact forms
GRANT INSERT ON public.contact_submissions TO anon;

-- Also grant SELECT so the .select().single() after insert works
GRANT SELECT ON public.contact_submissions TO anon;

-- Ensure the INSERT policy is correctly set for anon role
DROP POLICY IF EXISTS "public_can_create_contact_submissions" ON public.contact_submissions;
CREATE POLICY "public_can_create_contact_submissions"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);
