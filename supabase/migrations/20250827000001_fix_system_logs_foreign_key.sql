-- Add foreign key reference to auth.users table if it doesn't exist
DO $$ 
BEGIN 
  IF NOT EXISTS (
    SELECT 1 
    FROM pg_constraint 
    WHERE conname = 'system_logs_user_id_fkey'
  ) THEN
    ALTER TABLE public.system_logs
    ADD CONSTRAINT system_logs_user_id_fkey 
    FOREIGN KEY (user_id) 
    REFERENCES auth.users(id)
    ON DELETE CASCADE;
  END IF;
END $$;

-- Add user_id index for better performance if it doesn't exist
CREATE INDEX IF NOT EXISTS idx_system_logs_user_id ON public.system_logs(user_id);
