-- Clear mock/application data while preserving the admin user and their profile
-- Usage:
--   psql -v admin=<admin-uuid> -f scripts/clear_mock_data.sql

-- Ensure the admin UUID is available via GUC (works with psql -v admin=...)
SELECT set_config('app.admin_uuid', coalesce(:'admin', current_setting('app.admin_uuid', true)), false);

DO $$
DECLARE
  admin uuid := current_setting('app.admin_uuid')::uuid;
BEGIN
  -- Child/dependent tables first
  DELETE FROM public.ticket_comments;
  DELETE FROM public.tickets;
  DELETE FROM public.task_comments;
  DELETE FROM public.tasks;
  DELETE FROM public.attendance_records;
  -- Some setups have summaries; ignore if missing
  BEGIN
    DELETE FROM public.attendance_summary;
  EXCEPTION WHEN undefined_table THEN NULL; END;
  DELETE FROM public.expense_approvals;
  DELETE FROM public.expenses;
  DELETE FROM public.payroll_records;
  DELETE FROM public.asset_transfers;
  DELETE FROM public.assets;
  DELETE FROM public.appraisal_objectives;
  DELETE FROM public.appraisals;
  DELETE FROM public.leave_balances;
  DELETE FROM public.leave_requests;
  DELETE FROM public.organization_positions;
  DELETE FROM public.announcements;
  DELETE FROM public.system_logs;
  DELETE FROM public.user_activity_logs;
  DELETE FROM public.user_settings;

  -- Keep only system roles
  DELETE FROM public.user_roles WHERE is_system_role = false;

  -- Definitions (treat as mock if populated)
  DELETE FROM public.leave_types;
  DELETE FROM public.expense_categories;

  -- Core entities
  DELETE FROM public.employees;
  DELETE FROM public.company_members WHERE user_id <> admin;
  -- Keep companies to avoid cascading delete of profiles via FK
  -- If you want to drop companies too, set profiles.company_id = NULL for admin first and then delete.

  -- Profiles: keep admin only
  DELETE FROM public.profiles WHERE user_id <> admin;

  -- Any leftover test tables
  BEGIN
    DELETE FROM public.test_table;
  EXCEPTION WHEN undefined_table THEN NULL; END;
END $$;


