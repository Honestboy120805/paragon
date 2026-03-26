-- Add DELETE RLS policy for admins on notifications table
-- This was missing, causing clearAllNotifications to silently fail

DROP POLICY IF EXISTS "admins_delete_notifications" ON public.notifications;
CREATE POLICY "admins_delete_notifications"
ON public.notifications
FOR DELETE
TO authenticated
USING (public.is_admin());
