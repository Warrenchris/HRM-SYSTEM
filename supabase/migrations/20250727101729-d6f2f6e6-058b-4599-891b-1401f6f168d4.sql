-- Add missing foreign key constraints for leave management
ALTER TABLE public.leave_balances 
ADD CONSTRAINT fk_leave_balances_leave_type_id 
FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE CASCADE;

ALTER TABLE public.leave_balances 
ADD CONSTRAINT fk_leave_balances_employee_id 
FOREIGN KEY (employee_id) REFERENCES public.employees(id) ON DELETE CASCADE;

-- Also ensure leave_requests has proper foreign keys
ALTER TABLE public.leave_requests 
ADD CONSTRAINT fk_leave_requests_leave_type_id 
FOREIGN KEY (leave_type_id) REFERENCES public.leave_types(id) ON DELETE CASCADE;