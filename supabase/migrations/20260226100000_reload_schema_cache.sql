-- Force PostgREST to reload its schema cache
-- This resolves PGRST205 errors where tables exist but aren't recognized
NOTIFY pgrst, 'reload schema';
