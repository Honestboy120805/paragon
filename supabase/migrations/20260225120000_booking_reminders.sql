-- Migration: Booking Reminders Tracking
-- Creates table to track sent reminders and schedules daily cron job

-- 1. Create booking_reminders table to track which reminders have been sent
CREATE TABLE IF NOT EXISTS public.booking_reminders (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id UUID NOT NULL REFERENCES public.bookings(id) ON DELETE CASCADE,
  days_before INTEGER NOT NULL CHECK (days_before BETWEEN 1 AND 5),
  email_sent_to TEXT NOT NULL,
  sent_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. Unique constraint: one reminder per booking per day-offset
CREATE UNIQUE INDEX IF NOT EXISTS idx_booking_reminders_unique
  ON public.booking_reminders (booking_id, days_before);

-- 3. Index for fast lookups by booking
CREATE INDEX IF NOT EXISTS idx_booking_reminders_booking_id
  ON public.booking_reminders (booking_id);

-- 4. Enable RLS
ALTER TABLE public.booking_reminders ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies
DROP POLICY IF EXISTS "service_role_manage_booking_reminders" ON public.booking_reminders;
CREATE POLICY "service_role_manage_booking_reminders"
  ON public.booking_reminders
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

DROP POLICY IF EXISTS "admin_view_booking_reminders" ON public.booking_reminders;
CREATE POLICY "admin_view_booking_reminders"
  ON public.booking_reminders
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.user_profiles up
      WHERE up.id = auth.uid() AND up.is_admin = true
    )
  );

-- 6. Schedule daily cron job to send booking reminders at 9:00 AM UTC
-- This requires pg_cron extension (available in Supabase)
DO $$
BEGIN
  -- Only schedule if pg_cron extension is available
  IF EXISTS (
    SELECT 1 FROM pg_extension WHERE extname = 'pg_cron'
  ) THEN
    -- Remove existing job if present
    PERFORM cron.unschedule('send-booking-reminders-daily')
    WHERE EXISTS (
      SELECT 1 FROM cron.job WHERE jobname = 'send-booking-reminders-daily'
    );

    -- Schedule new daily job at 9:00 AM UTC
    -- Use $cron$ delimiter to avoid conflict with outer $$ block
    PERFORM cron.schedule(
      'send-booking-reminders-daily',
      '0 9 * * *',
      $cron$
        SELECT net.http_post(
          url := current_setting('app.supabase_url') || '/functions/v1/send-booking-reminders',
          headers := jsonb_build_object(
            'Content-Type', 'application/json',
            'Authorization', 'Bearer ' || current_setting('app.service_role_key')
          ),
          body := '{}'::jsonb
        );
      $cron$
    );

    RAISE NOTICE 'Cron job send-booking-reminders-daily scheduled successfully';
  ELSE
    RAISE NOTICE 'pg_cron extension not available. Please schedule the send-booking-reminders edge function manually via Supabase Dashboard.';
  END IF;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Could not schedule cron job: %. Please schedule manually via Supabase Dashboard.', SQLERRM;
END $$;
