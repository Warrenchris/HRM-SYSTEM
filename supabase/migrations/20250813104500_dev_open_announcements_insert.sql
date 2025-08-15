-- Development-only: allow any authenticated user to insert announcements
-- Remove or tighten before production

DO $$ BEGIN
  CREATE POLICY "dev: authenticated can insert announcements"
  ON public.announcements
  FOR INSERT
  WITH CHECK (auth.uid() IS NOT NULL);
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


