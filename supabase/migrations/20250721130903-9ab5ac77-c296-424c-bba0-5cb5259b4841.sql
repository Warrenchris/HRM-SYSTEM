-- Add clock out location field to attendance records
ALTER TABLE public.attendance_records 
ADD COLUMN clock_out_location TEXT,
ADD COLUMN clock_out_ip_address INET;

-- Update existing records to have clock_out_location same as location if clocked out
UPDATE public.attendance_records 
SET clock_out_location = location,
    clock_out_ip_address = ip_address
WHERE clock_out_time IS NOT NULL;