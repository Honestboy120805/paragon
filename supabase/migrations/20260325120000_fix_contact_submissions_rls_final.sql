-- Final fix for contact_submissions RLS
-- Drops all existing INSERT policies and creates a clean SECURITY DEFINER function
-- so anonymous users can always submit contact forms regardless of RLS policy conflicts

-- 1. Drop ALL existing INSERT-related policies on contact_submissions
DROP POLICY IF EXISTS "public_can_create_contact_submissions" ON public.contact_submissions;
DROP POLICY IF EXISTS "anon_can_insert_contact_submissions" ON public.contact_submissions;

-- 2. Ensure RLS is enabled
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;

-- 3. Create a SECURITY DEFINER function that bypasses RLS for contact form inserts
CREATE OR REPLACE FUNCTION public.submit_contact_form(
    p_name TEXT,
    p_email TEXT,
    p_subject TEXT,
    p_message TEXT,
    p_phone TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_id UUID;
BEGIN
    INSERT INTO public.contact_submissions (name, email, subject, message, phone)
    VALUES (p_name, p_email, p_subject, p_message, p_phone)
    RETURNING id INTO v_id;
    
    RETURN v_id;
END;
$$;

-- 4. Grant execute permission to anon and authenticated roles
GRANT EXECUTE ON FUNCTION public.submit_contact_form(TEXT, TEXT, TEXT, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_contact_form(TEXT, TEXT, TEXT, TEXT, TEXT) TO authenticated;

-- 5. Recreate a clean INSERT policy (belt-and-suspenders approach)
DROP POLICY IF EXISTS "anyone_can_insert_contact_submissions" ON public.contact_submissions;
CREATE POLICY "anyone_can_insert_contact_submissions"
ON public.contact_submissions
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- 6. Ensure SELECT policy for admins still exists
DROP POLICY IF EXISTS "admins_view_all_contact_submissions" ON public.contact_submissions;
CREATE POLICY "admins_view_all_contact_submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (public.is_admin());

-- 7. Ensure DELETE policy for admins still exists
DROP POLICY IF EXISTS "admins_delete_contact_submissions" ON public.contact_submissions;
CREATE POLICY "admins_delete_contact_submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (public.is_admin());

-- 8. Grant table-level privileges to anon role explicitly
GRANT INSERT ON public.contact_submissions TO anon;
GRANT SELECT ON public.contact_submissions TO anon;
