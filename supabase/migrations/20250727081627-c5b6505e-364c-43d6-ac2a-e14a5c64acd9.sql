-- Add foreign key constraints for leave_requests table to fix data fetching
ALTER TABLE leave_requests 
ADD CONSTRAINT fk_leave_requests_employee_id 
FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE leave_requests 
ADD CONSTRAINT fk_leave_requests_leave_type_id 
FOREIGN KEY (leave_type_id) REFERENCES leave_types(id);

-- Also add foreign key for leave_balances table
ALTER TABLE leave_balances 
ADD CONSTRAINT fk_leave_balances_employee_id 
FOREIGN KEY (employee_id) REFERENCES employees(id);

ALTER TABLE leave_balances 
ADD CONSTRAINT fk_leave_balances_leave_type_id 
FOREIGN KEY (leave_type_id) REFERENCES leave_types(id);