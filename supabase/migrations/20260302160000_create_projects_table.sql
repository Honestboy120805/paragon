-- Create projects table for Recent Projects section on homepage
CREATE TABLE IF NOT EXISTS public.projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  category TEXT NOT NULL DEFAULT 'Music',
  project_date DATE,
  image_url TEXT,
  is_featured BOOLEAN DEFAULT true,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_projects_display_order ON public.projects(display_order);
CREATE INDEX IF NOT EXISTS idx_projects_is_featured ON public.projects(is_featured);

ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Public can read all projects
DROP POLICY IF EXISTS "public_read_projects" ON public.projects;
CREATE POLICY "public_read_projects"
  ON public.projects
  FOR SELECT
  TO public
  USING (true);

-- Authenticated admins can manage projects
DROP POLICY IF EXISTS "admin_manage_projects" ON public.projects;
CREATE POLICY "admin_manage_projects"
  ON public.projects
  FOR ALL
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION public.update_projects_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS projects_updated_at ON public.projects;
CREATE TRIGGER projects_updated_at
  BEFORE UPDATE ON public.projects
  FOR EACH ROW
  EXECUTE FUNCTION public.update_projects_updated_at();

-- Sample projects data
DO $$
BEGIN
  INSERT INTO public.projects (title, description, category, project_date, image_url, is_featured, display_order)
  VALUES
    ('Summer Concert 2023', 'An electrifying outdoor concert performance featuring original music and crowd favorites.', 'Music', '2023-07-15', 'https://images.unsplash.com/photo-1499639548599-a8fb39474e68', true, 1),
    ('Wedding Event Performance', 'A memorable live performance at an elegant wedding reception, creating the perfect atmosphere.', 'Events', '2023-09-10', 'https://images.unsplash.com/photo-1723832348105-2e69f948135a', true, 2),
    ('Comedy Special', 'A sold-out comedy special featuring original material and crowd interaction.', 'Comedy', '2023-11-05', 'https://images.unsplash.com/photo-1636391637370-76fd60a5609b', true, 3)
  ON CONFLICT (id) DO NOTHING;
EXCEPTION
  WHEN OTHERS THEN
    RAISE NOTICE 'Sample projects insertion skipped: %', SQLERRM;
END $$;
