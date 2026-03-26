-- User Roles and Permissions Migration
-- Extends user_profiles with role-based access control

-- 1. Create role enum
DROP TYPE IF EXISTS public.user_role CASCADE;
CREATE TYPE public.user_role AS ENUM ('super_admin', 'admin', 'moderator', 'user');

-- 2. Create permissions table
CREATE TABLE IF NOT EXISTS public.permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    category TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- 3. Create role_permissions junction table
CREATE TABLE IF NOT EXISTS public.role_permissions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    role public.user_role NOT NULL,
    permission_id UUID NOT NULL REFERENCES public.permissions(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(role, permission_id)
);

-- 4. Update user_profiles table to use enum
-- Drop the default value first to avoid casting issues
ALTER TABLE public.user_profiles 
ALTER COLUMN role DROP DEFAULT;

-- Convert the column type
ALTER TABLE public.user_profiles 
ALTER COLUMN role TYPE public.user_role USING role::public.user_role;

-- Set the new default with proper enum casting
ALTER TABLE public.user_profiles 
ALTER COLUMN role SET DEFAULT 'user'::public.user_role;

-- 5. Add indexes
CREATE INDEX IF NOT EXISTS idx_user_profiles_role ON public.user_profiles(role);
CREATE INDEX IF NOT EXISTS idx_role_permissions_role ON public.role_permissions(role);
CREATE INDEX IF NOT EXISTS idx_permissions_category ON public.permissions(category);

-- 6. Enable RLS
ALTER TABLE public.permissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.role_permissions ENABLE ROW LEVEL SECURITY;

-- 7. RLS Policies for permissions
DROP POLICY IF EXISTS "public_can_view_permissions" ON public.permissions;
CREATE POLICY "public_can_view_permissions"
ON public.permissions
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admins_manage_permissions" ON public.permissions;
CREATE POLICY "admins_manage_permissions"
ON public.permissions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 8. RLS Policies for role_permissions
DROP POLICY IF EXISTS "public_can_view_role_permissions" ON public.role_permissions;
CREATE POLICY "public_can_view_role_permissions"
ON public.role_permissions
FOR SELECT
TO public
USING (true);

DROP POLICY IF EXISTS "admins_manage_role_permissions" ON public.role_permissions;
CREATE POLICY "admins_manage_role_permissions"
ON public.role_permissions
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 9. Update RLS policy for user_profiles to allow admins to update roles
DROP POLICY IF EXISTS "admins_manage_all_profiles" ON public.user_profiles;
CREATE POLICY "admins_manage_all_profiles"
ON public.user_profiles
FOR ALL
TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 10. Insert default permissions
INSERT INTO public.permissions (name, description, category) VALUES
    ('manage_bookings', 'View and manage all booking requests', 'bookings'),
    ('manage_media', 'Upload, edit, and delete media gallery items', 'media'),
    ('manage_services', 'Create, edit, and delete services', 'services'),
    ('manage_users', 'View and manage user accounts and roles', 'users'),
    ('view_analytics', 'Access dashboard analytics and reports', 'analytics'),
    ('manage_permissions', 'Assign and modify role permissions', 'permissions')
ON CONFLICT (name) DO NOTHING;

-- 11. Assign permissions to roles
DO $$
DECLARE
    perm_manage_bookings UUID;
    perm_manage_media UUID;
    perm_manage_services UUID;
    perm_manage_users UUID;
    perm_view_analytics UUID;
    perm_manage_permissions UUID;
BEGIN
    -- Get permission IDs
    SELECT id INTO perm_manage_bookings FROM public.permissions WHERE name = 'manage_bookings';
    SELECT id INTO perm_manage_media FROM public.permissions WHERE name = 'manage_media';
    SELECT id INTO perm_manage_services FROM public.permissions WHERE name = 'manage_services';
    SELECT id INTO perm_manage_users FROM public.permissions WHERE name = 'manage_users';
    SELECT id INTO perm_view_analytics FROM public.permissions WHERE name = 'view_analytics';
    SELECT id INTO perm_manage_permissions FROM public.permissions WHERE name = 'manage_permissions';

    -- Super Admin: All permissions
    INSERT INTO public.role_permissions (role, permission_id) VALUES
        ('super_admin'::public.user_role, perm_manage_bookings),
        ('super_admin'::public.user_role, perm_manage_media),
        ('super_admin'::public.user_role, perm_manage_services),
        ('super_admin'::public.user_role, perm_manage_users),
        ('super_admin'::public.user_role, perm_view_analytics),
        ('super_admin'::public.user_role, perm_manage_permissions)
    ON CONFLICT (role, permission_id) DO NOTHING;

    -- Admin: All except permission management
    INSERT INTO public.role_permissions (role, permission_id) VALUES
        ('admin'::public.user_role, perm_manage_bookings),
        ('admin'::public.user_role, perm_manage_media),
        ('admin'::public.user_role, perm_manage_services),
        ('admin'::public.user_role, perm_manage_users),
        ('admin'::public.user_role, perm_view_analytics)
    ON CONFLICT (role, permission_id) DO NOTHING;

    -- Moderator: Limited permissions
    INSERT INTO public.role_permissions (role, permission_id) VALUES
        ('moderator'::public.user_role, perm_manage_bookings),
        ('moderator'::public.user_role, perm_manage_media),
        ('moderator'::public.user_role, perm_view_analytics)
    ON CONFLICT (role, permission_id) DO NOTHING;
END $$;

-- 12. Update existing admin user to super_admin
UPDATE public.user_profiles 
SET role = 'super_admin'::public.user_role 
WHERE email = 'admin@paragon.com';