-- Notifications and Booking Updates Schema
-- Tables: notifications
-- Add cancellation_reason to bookings table

-- 1. Create notification_type enum
DROP TYPE IF EXISTS public.notification_type CASCADE;
CREATE TYPE public.notification_type AS ENUM ('booking', 'contact', 'cancellation');

-- 2. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type public.notification_type NOT NULL,
    title TEXT NOT NULL,
    message TEXT NOT NULL,
    reference_id UUID,  -- ID of the booking or contact submission
    reference_table TEXT,  -- 'bookings' or 'contact_submissions'
    is_read BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. Add cancellation_reason to bookings table
ALTER TABLE public.bookings 
ADD COLUMN IF NOT EXISTS cancellation_reason TEXT;

-- 4. Indexes
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON public.notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON public.notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_reference ON public.notifications(reference_id, reference_table);

-- 5. Enable RLS
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

-- 6. RLS Policies
-- Admins can view all notifications
DROP POLICY IF EXISTS "admins_view_all_notifications" ON public.notifications;
CREATE POLICY "admins_view_all_notifications"
ON public.notifications
FOR SELECT
TO authenticated
USING (public.is_admin());

-- Admins can update notifications (mark as read)
DROP POLICY IF EXISTS "admins_update_notifications" ON public.notifications;
CREATE POLICY "admins_update_notifications"
ON public.notifications
FOR UPDATE
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- System can insert notifications
DROP POLICY IF EXISTS "system_can_create_notifications" ON public.notifications;
CREATE POLICY "system_can_create_notifications"
ON public.notifications
FOR INSERT
TO public
WITH CHECK (true);

-- 7. Function to create notification on new booking
CREATE OR REPLACE FUNCTION public.create_booking_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.notifications (type, title, message, reference_id, reference_table)
    VALUES (
        'booking',
        'New Booking Request',
        'New booking from ' || NEW.name || ' for ' || NEW.service_type,
        NEW.id,
        'bookings'
    );
    RETURN NEW;
END;
$$;

-- 8. Function to create notification on booking cancellation
CREATE OR REPLACE FUNCTION public.create_cancellation_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NEW.status = 'cancelled' AND OLD.status != 'cancelled' THEN
        INSERT INTO public.notifications (type, title, message, reference_id, reference_table)
        VALUES (
            'cancellation',
            'Booking Cancelled',
            'Booking cancelled by ' || NEW.name || ' - ' || COALESCE(NEW.cancellation_reason, 'No reason provided'),
            NEW.id,
            'bookings'
        );
    END IF;
    RETURN NEW;
END;
$$;

-- 9. Function to create notification on new contact submission
CREATE OR REPLACE FUNCTION public.create_contact_notification()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.notifications (type, title, message, reference_id, reference_table)
    VALUES (
        'contact',
        'New Contact Submission',
        'New message from ' || NEW.name || ' - ' || NEW.subject,
        NEW.id,
        'contact_submissions'
    );
    RETURN NEW;
END;
$$;

-- 10. Triggers
DROP TRIGGER IF EXISTS trigger_booking_notification ON public.bookings;
CREATE TRIGGER trigger_booking_notification
    AFTER INSERT ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.create_booking_notification();

DROP TRIGGER IF EXISTS trigger_cancellation_notification ON public.bookings;
CREATE TRIGGER trigger_cancellation_notification
    AFTER UPDATE ON public.bookings
    FOR EACH ROW
    EXECUTE FUNCTION public.create_cancellation_notification();

DROP TRIGGER IF EXISTS trigger_contact_notification ON public.contact_submissions;
CREATE TRIGGER trigger_contact_notification
    AFTER INSERT ON public.contact_submissions
    FOR EACH ROW
    EXECUTE FUNCTION public.create_contact_notification();