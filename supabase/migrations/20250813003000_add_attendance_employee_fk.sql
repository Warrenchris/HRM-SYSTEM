-- Ensure attendance_records has a proper foreign key to employees so PostgREST can infer relationships
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM pg_constraint
    WHERE conname = 'attendance_records_employee_id_fkey'
  ) THEN
    ALTER TABLE public.attendance_records
      ADD CONSTRAINT attendance_records_employee_id_fkey
      FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;
  END IF;
END $$;

-- Helpful index for lookups by employee
CREATE INDEX IF NOT EXISTS idx_attendance_records_employee_id
  ON public.attendance_records(employee_id);


