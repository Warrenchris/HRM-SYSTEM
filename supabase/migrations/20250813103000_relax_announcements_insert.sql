-- Allow any authenticated user to create announcements for themselves (based on profiles)

DO $$ BEGIN
  CREATE POLICY "Users can insert own announcements"
  ON public.announcements
  FOR INSERT
  WITH CHECK (
    auth.uid() IS NOT NULL
    AND author_id = (
      SELECT p.employee_id FROM public.profiles p
      WHERE p.user_id = auth.uid()
      LIMIT 1
    )
    AND (
      company_id IS NULL
      OR company_id = (
        SELECT p.company_id FROM public.profiles p
        WHERE p.user_id = auth.uid()
        LIMIT 1
      )
    )
  );
EXCEPTION WHEN duplicate_object THEN NULL; END $$;


