-- Update attendance policies to allow HR/admin roles to view records without requiring user authentication
DROP POLICY IF EXISTS "HR and Admins can manage all attendance records" ON public.attendance_records;

CREATE POLICY "HR and Admins can view all attendance records" 
ON public.attendance_records 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE role IN ('admin', 'hr', 'manager', 'ceo')
));

CREATE POLICY "HR and Admins can manage all attendance records" 
ON public.attendance_records 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND role IN ('admin', 'hr', 'manager', 'ceo')
));
