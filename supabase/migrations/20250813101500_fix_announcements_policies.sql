-- Ensure RLS policies on announcements explicitly cover INSERT/UPDATE/DELETE with proper WITH CHECK

DO $$ BEGIN
  CREATE POLICY "HR and Admins can insert announcements"
  ON public.announcements
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = ANY (ARRAY['admin','hr'])
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "HR and Admins can update announcements"
  ON public.announcements
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = ANY (ARRAY['admin','hr'])
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = ANY (ARRAY['admin','hr'])
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

DO $$ BEGIN
  CREATE POLICY "HR and Admins can delete announcements"
  ON public.announcements
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.user_id = auth.uid()
        AND profiles.role = ANY (ARRAY['admin','hr'])
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


