-- Admin Dashboard Schema Migration
-- Tables: admin_users, bookings, media_gallery, services
-- RLS policies for admin-only access

-- 1. Types
DROP TYPE IF EXISTS public.booking_status CASCADE;
CREATE TYPE public.booking_status AS ENUM ('pending', 'confirmed', 'completed', 'cancelled');

DROP TYPE IF EXISTS public.service_category CASCADE;
CREATE TYPE public.service_category AS ENUM ('music', 'comedy', 'animation', 'coaching');

DROP TYPE IF EXISTS public.media_type CASCADE;
CREATE TYPE public.media_type AS ENUM ('image', 'video');

-- 2. Core Tables
CREATE TABLE IF NOT EXISTS public.user_profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email TEXT NOT NULL UNIQUE,
    full_name TEXT NOT NULL,
    role TEXT DEFAULT 'user',
    is_admin BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Drop and recreate bookings table to ensure clean state
-- NOTE: bookings table uses 'service_type' column, NOT 'category'
DROP TABLE IF EXISTS public.bookings CASCADE;
CREATE TABLE public.bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    phone TEXT NOT NULL,
    service_type TEXT NOT NULL,  -- This is the service identifier, NOT category
    event_date DATE NOT NULL,
    event_location TEXT NOT NULL,
    message TEXT,
    status public.booking_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Drop and recreate media_gallery table to ensure clean state
DROP TABLE IF EXISTS public.media_gallery CASCADE;
CREATE TABLE public.media_gallery (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    description TEXT,
    media_type public.media_type NOT NULL,
    url TEXT NOT NULL,
    thumbnail_url TEXT,
    display_order INTEGER DEFAULT 0,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Services table has 'category' column (this is correct)
CREATE TABLE IF NOT EXISTS public.services (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    category public.service_category NOT NULL,  -- Services have categories
    description TEXT NOT NULL,
    features TEXT[] DEFAULT ARRAY[]::TEXT[],
    pricing TEXT NOT NULL,
    image_url TEXT,
    video_url TEXT,
    is_active BOOLEAN DEFAULT true,
    display_order INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_email ON public.user_profiles(email);
CREATE INDEX IF NOT EXISTS idx_user_profiles_is_admin ON public.user_profiles(is_admin);
CREATE INDEX IF NOT EXISTS idx_bookings_status ON public.bookings(status);
CREATE INDEX IF NOT EXISTS idx_bookings_event_date ON public.bookings(event_date);
CREATE INDEX IF NOT EXISTS idx_bookings_service_type ON public.bookings(service_type);  -- Index on service_type, not category
CREATE INDEX IF NOT EXISTS idx_media_gallery_type ON public.media_gallery(media_type);
CREATE INDEX IF NOT EXISTS idx_media_gallery_featured ON public.media_gallery(is_featured);
CREATE INDEX IF NOT EXISTS idx_services_category ON public.services(category);  -- Only services table has category
CREATE INDEX IF NOT EXISTS idx_services_active ON public.services(is_active);

-- 4. Functions (BEFORE RLS policies)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.user_profiles (id, email, full_name, role, is_admin)
    VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'full_name', split_part(NEW.email, '@', 1)),
        COALESCE(NEW.raw_user_meta_data->>'role', 'user'),
        COALESCE((NEW.raw_user_meta_data->>'is_admin')::BOOLEAN, false)
    );
    RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.user_profiles up
        WHERE up.id = auth.uid()
        AND up.role IN ('super_admin'::public.user_role, 'admin'::public.user_role)
    );
$$;

CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$;

-- 5. Enable RLS
ALTER TABLE public.user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.media_gallery ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- User Profiles: Users manage own, admins see all
DROP POLICY IF EXISTS "users_manage_own_profile" ON public.user_profiles;
CREATE POLICY "users_manage_own_profile"
ON public.user_profiles
FOR ALL
TO authenticated
USING (id = auth.uid())
WITH CHECK (id = auth.uid());

DROP POLICY IF EXISTS "admins_view_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_view_all_profiles"
ON public.user_profiles
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Bookings: Public can insert, admins can manage all
DROP POLICY IF EXISTS "public_can_create_bookings" ON public.bookings;
CREATE POLICY "public_can_create_bookings"
ON public.bookings
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "admins_manage_all_bookings" ON public.bookings;
CREATE POLICY "admins_manage_all_bookings"
ON public.bookings
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Media Gallery: Public can read, admins can manage
DROP POLICY IF EXISTS "public_can_view_media" ON public.media_gallery;
CREATE POLICY "public_can_view_media"
ON public.media_gallery
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admins_manage_media" ON public.media_gallery;
CREATE POLICY "admins_manage_media"
ON public.media_gallery
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- Services: Public can read active, admins can manage all
DROP POLICY IF EXISTS "public_can_view_active_services" ON public.services;
CREATE POLICY "public_can_view_active_services"
ON public.services
FOR SELECT
TO public
USING (is_active = true);

DROP POLICY IF EXISTS "admins_manage_services" ON public.services;
CREATE POLICY "admins_manage_services"
ON public.services
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. Triggers
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_new_user();

DROP TRIGGER IF EXISTS update_bookings_updated_at ON public.bookings;
CREATE TRIGGER update_bookings_updated_at
    BEFORE UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_media_updated_at ON public.media_gallery;
CREATE TRIGGER update_media_updated_at
    BEFORE UPDATE ON public.media_gallery
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS update_services_updated_at ON public.services;
CREATE TRIGGER update_services_updated_at
    BEFORE UPDATE ON public.services
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 8. Mock Data
DO $$
DECLARE
    admin_uuid UUID := gen_random_uuid();
BEGIN
    -- Create admin user
    INSERT INTO auth.users (
        id, instance_id, aud, role, email, encrypted_password, email_confirmed_at,
        created_at, updated_at, raw_user_meta_data, raw_app_meta_data,
        is_sso_user, is_anonymous, confirmation_token, confirmation_sent_at,
        recovery_token, recovery_sent_at, email_change_token_new, email_change,
        email_change_sent_at, email_change_token_current, email_change_confirm_status,
        reauthentication_token, reauthentication_sent_at, phone, phone_change,
        phone_change_token, phone_change_sent_at
    ) VALUES (
        admin_uuid, '00000000-0000-0000-0000-000000000000', 'authenticated', 'authenticated',
        'admin@paragon.com', crypt('admin123', gen_salt('bf', 10)), now(), now(), now(),
        jsonb_build_object('full_name', 'Admin User', 'role', 'admin', 'is_admin', true),
        jsonb_build_object('provider', 'email', 'providers', ARRAY['email']::TEXT[]),
        false, false, '', null, '', null, '', '', null, '', 0, '', null, null, '', '', null
    )
    ON CONFLICT (id) DO NOTHING;

    -- Sample bookings with service_type (NOT category)
    INSERT INTO public.bookings (name, email, phone, service_type, event_date, event_location, message, status)
    VALUES
        ('John Smith', 'john@example.com', '+1 (641) 954-2429', 'Music Show', '2026-03-15', 'New York City', 'Looking for a 2-hour performance', 'pending'::public.booking_status),
        ('Sarah Johnson', 'sarah@example.com', '+1 (641) 954-2429', 'Comedy Show', '2026-04-20', 'Los Angeles', 'Corporate event with 200 attendees', 'confirmed'::public.booking_status),
        ('Mike Davis', 'mike@example.com', '+1 (641) 954-2429', 'Animation', '2026-05-10', 'Remote', 'Need 3D character animation', 'completed'::public.booking_status)
    ON CONFLICT (id) DO NOTHING;

    -- Sample media with explicit media_type casting
    INSERT INTO public.media_gallery (title, description, media_type, url, thumbnail_url, is_featured, display_order)
    VALUES
        ('Live Performance 2025', 'Electrifying music show at Madison Square Garden', 'video'::public.media_type, 'https://www.youtube.com/watch?v=dQw4w9WgXcQ', 'https://img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg', true, 1),
        ('Comedy Night', 'Stand-up comedy performance highlights', 'video'::public.media_type, 'https://www.youtube.com/watch?v=example2', 'https://images.unsplash.com/photo-1585699324551-f6c309eedeca', false, 2),
        ('Animation Showcase', 'Character animation portfolio', 'image'::public.media_type, 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe', false, 3)
    ON CONFLICT (id) DO NOTHING;

    -- Sample services with category (services table has category column)
    INSERT INTO public.services (title, category, description, features, pricing, image_url, is_active, display_order)
    VALUES
        (
            'Music Shows',
            'music'::public.service_category,
            'Electrifying live performances that captivate audiences with energy, emotion, and musical excellence.',
            ARRAY['Live 2-hour performance', 'Professional sound equipment', 'Customizable setlist', 'Meet and greet sessions']::TEXT[],
            'From $2,500',
            'https://images.unsplash.com/photo-1595270601830-c8ff3271ba25',
            true,
            1
        ),
        (
            'Comedy Shows',
            'comedy'::public.service_category,
            'Hilarious stand-up comedy performances that leave audiences in stitches.',
            ARRAY['60-90 minute set', 'Clean or adult content options', 'Audience interaction', 'Custom material available']::TEXT[],
            'From $1,800',
            'https://images.unsplash.com/photo-1585699324551-f6c309eedeca',
            true,
            2
        ),
        (
            'Event Animation',
            'animation'::public.service_category,
            'Creative event animations that bring stories and brands to life with stunning visual storytelling.',
            ARRAY['Custom 2D/3D animation', 'Storyboarding', 'Motion graphics', 'Explainer videos']::TEXT[],
            'Custom Quote',
            'https://img.rocket.new/generatedImages/rocket_gen_img_19391d60b-1767610083036.png',
            true,
            3
        )
    ON CONFLICT (id) DO NOTHING;

    RAISE NOTICE 'Admin dashboard schema created successfully';
    RAISE NOTICE 'Admin credentials: admin@paragon.com / admin123';
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock data insertion failed: %', SQLERRM;
END $$;