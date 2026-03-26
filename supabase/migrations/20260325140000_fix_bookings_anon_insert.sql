-- Fix bookings RLS for anonymous inserts
-- Use SECURITY DEFINER function to bypass RLS for public booking submissions

-- Create a SECURITY DEFINER function to handle booking inserts
-- This bypasses RLS entirely for anonymous users submitting bookings
CREATE OR REPLACE FUNCTION public.submit_booking(
    p_name TEXT,
    p_email TEXT,
    p_phone TEXT,
    p_service_type TEXT,
    p_event_date DATE,
    p_event_location TEXT,
    p_message TEXT DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    new_booking_id UUID;
BEGIN
    INSERT INTO public.bookings (
        name,
        email,
        phone,
        service_type,
        event_date,
        event_location,
        message,
        status
    ) VALUES (
        p_name,
        p_email,
        p_phone,
        p_service_type,
        p_event_date,
        p_event_location,
        p_message,
        'pending'::public.booking_status
    )
    RETURNING id INTO new_booking_id;

    RETURN new_booking_id;
END;
$$;

-- Grant execute permission to anonymous and authenticated users
GRANT EXECUTE ON FUNCTION public.submit_booking(TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.submit_booking(TEXT, TEXT, TEXT, TEXT, DATE, TEXT, TEXT) TO authenticated;

-- Also ensure the direct INSERT policy is properly set for anon role
-- Drop and recreate to ensure it targets the anon role explicitly
DROP POLICY IF EXISTS "public_can_create_bookings" ON public.bookings;
CREATE POLICY "public_can_create_bookings"
ON public.bookings
FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Grant INSERT privilege explicitly to anon role
GRANT INSERT ON public.bookings TO anon;
GRANT SELECT ON public.bookings TO anon;
