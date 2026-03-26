-- Testimonials and Storage Migration
-- Tables: testimonials
-- Storage: media-uploads bucket

-- 1. Create testimonials table
CREATE TABLE IF NOT EXISTS public.testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    photo TEXT,
    quote TEXT NOT NULL,
    rating INTEGER NOT NULL DEFAULT 5,
    is_approved BOOLEAN DEFAULT false,
    booking_id UUID REFERENCES public.bookings(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Indexes
CREATE INDEX IF NOT EXISTS idx_testimonials_is_approved ON public.testimonials(is_approved);
CREATE INDEX IF NOT EXISTS idx_testimonials_created_at ON public.testimonials(created_at);
CREATE INDEX IF NOT EXISTS idx_testimonials_booking_id ON public.testimonials(booking_id);

-- 3. Enable RLS
ALTER TABLE public.testimonials ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "public_can_view_approved_testimonials" ON public.testimonials;
CREATE POLICY "public_can_view_approved_testimonials"
ON public.testimonials
FOR SELECT
TO public
USING (is_approved = true);

DROP POLICY IF EXISTS "public_can_create_testimonials" ON public.testimonials;
CREATE POLICY "public_can_create_testimonials"
ON public.testimonials
FOR INSERT
TO public
WITH CHECK (true);

DROP POLICY IF EXISTS "admins_manage_testimonials" ON public.testimonials;
CREATE POLICY "admins_manage_testimonials"
ON public.testimonials
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 5. Triggers
DROP TRIGGER IF EXISTS update_testimonials_updated_at ON public.testimonials;
CREATE TRIGGER update_testimonials_updated_at
    BEFORE UPDATE ON public.testimonials
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- 6. Add category column to media_gallery if not exists
ALTER TABLE public.media_gallery
ADD COLUMN IF NOT EXISTS category TEXT DEFAULT 'general';

-- 7. Mock approved testimonials
DO $$
BEGIN
    INSERT INTO public.testimonials (name, role, photo, quote, rating, is_approved)
    VALUES
        ('Sarah Johnson', 'Event Coordinator', 'https://img.rocket.new/generatedImages/rocket_gen_img_1a38ab8ca-1763294483428.png', 'Mbi Roy brought incredible energy to our corporate event. The music performance was absolutely captivating, and our team is still talking about it weeks later!', 5, true),
        ('Michael Chen', 'Marketing Director', 'https://img.rocket.new/generatedImages/rocket_gen_img_10ace428a-1763300066458.png', 'The animation work exceeded all expectations. Professional, creative, and delivered on time. Highly recommend for any creative project!', 5, true),
        ('Emily Rodriguez', 'Comedy Club Owner', 'https://img.rocket.new/generatedImages/rocket_gen_img_139740554-1763300967554.png', 'Mbi''s comedy show was the highlight of our season. The audience loved every minute, and we''ve already booked a return performance!', 5, true),
        ('David Thompson', 'Aspiring Comedian', 'https://img.rocket.new/generatedImages/rocket_gen_img_1101e9026-1763296623238.png', 'The comedy coaching sessions transformed my stage presence. Mbi''s insights and techniques helped me develop material that really connects with audiences.', 5, true),
        ('Jessica Martinez', 'Wedding Planner', 'https://img.rocket.new/generatedImages/rocket_gen_img_115e5de2f-1763294932054.png', 'Hired Mbi for a wedding reception and it was magical! The live music created the perfect atmosphere. Every guest was impressed!', 5, true),
        ('Robert Kim', 'Creative Director', 'https://img.rocket.new/generatedImages/rocket_gen_img_1e6524513-1763293034063.png', 'Outstanding animation work! The attention to detail and creativity brought our vision to life perfectly. A true professional in every sense.', 5, true)
    ON CONFLICT (id) DO NOTHING;
EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'Mock testimonials insertion failed: %', SQLERRM;
END $$;
