-- Settings and Contact Submissions Schema
-- Tables: business_settings, contact_submissions
-- RLS policies for admin access

-- 1. Create contact_submissions table
CREATE TABLE IF NOT EXISTS public.contact_submissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Create business_settings table
CREATE TABLE IF NOT EXISTS public.business_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    business_phone TEXT,
    business_email TEXT,
    notifications_enabled BOOLEAN DEFAULT true,
    booking_notifications BOOLEAN DEFAULT true,
    contact_notifications BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON public.contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON public.contact_submissions(email);

-- 4. Enable RLS
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.business_settings ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
-- Contact Submissions: Public can insert, admins can view all
DROP POLICY IF EXISTS "public_can_create_contact_submissions" ON public.contact_submissions;
CREATE POLICY "public_can_create_contact_submissions"
ON public.contact_submissions
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "admins_view_all_contact_submissions" ON public.contact_submissions;
CREATE POLICY "admins_view_all_contact_submissions"
ON public.contact_submissions
FOR SELECT
TO authenticated
USING (public.is_admin());

DROP POLICY IF EXISTS "admins_delete_contact_submissions" ON public.contact_submissions;
CREATE POLICY "admins_delete_contact_submissions"
ON public.contact_submissions
FOR DELETE
TO authenticated
USING (public.is_admin());

-- Business Settings: Admins can manage all
DROP POLICY IF EXISTS "admins_manage_business_settings" ON public.business_settings;
CREATE POLICY "admins_manage_business_settings"
ON public.business_settings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Triggers
DROP TRIGGER IF EXISTS update_business_settings_updated_at ON public.business_settings;
CREATE TRIGGER update_business_settings_updated_at
    BEFORE UPDATE ON public.business_settings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 7. Mock Data
DO $$
BEGIN
    -- Create default business settings if none exist
    IF NOT EXISTS (SELECT 1 FROM public.business_settings LIMIT 1) THEN
        INSERT INTO public.business_settings (
            id,
            business_phone,
            business_email,
            notifications_enabled,
            booking_notifications,
            contact_notifications
        ) VALUES (
            gen_random_uuid(),
            '+1 (641) 954-2429',
            'paragondelaftadian@gmail.com',
            true,
            true,
            true
        )
        ON CONFLICT (id) DO NOTHING;
    END IF;

    -- Create sample contact submissions
    INSERT INTO public.contact_submissions (name, email, subject, message)
    VALUES
        ('Jane Doe', 'jane@example.com', 'Inquiry about services', 'I would like to know more about your music production services.'),
        ('Bob Wilson', 'bob@example.com', 'Collaboration opportunity', 'I have a project that might interest you. Let us discuss!')
    ON CONFLICT (id) DO NOTHING;

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;