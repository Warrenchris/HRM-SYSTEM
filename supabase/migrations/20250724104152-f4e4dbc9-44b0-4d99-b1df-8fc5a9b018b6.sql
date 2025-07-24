-- Add GPS coordinates to attendance records
ALTER TABLE attendance_records 
ADD COLUMN clock_in_latitude DECIMAL(10, 8),
ADD COLUMN clock_in_longitude DECIMAL(11, 8),
ADD COLUMN clock_out_latitude DECIMAL(10, 8), 
ADD COLUMN clock_out_longitude DECIMAL(11, 8),
ADD COLUMN clock_in_gps_timestamp TIMESTAMP WITH TIME ZONE,
ADD COLUMN clock_out_gps_timestamp TIMESTAMP WITH TIME ZONE;