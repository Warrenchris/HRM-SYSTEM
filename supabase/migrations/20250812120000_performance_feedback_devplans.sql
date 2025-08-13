-- Performance module: feedback + development plans

-- 1) Feedback requests and items
create table if not exists public.feedback_requests (
  id uuid primary key default gen_random_uuid(),
  type text not null check (type in ('360','peer','upward','self')),
  subject text not null,
  requested_by uuid not null references public.employees(id) on delete restrict,
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.feedback_request_respondents (
  id uuid primary key default gen_random_uuid(),
  request_id uuid not null references public.feedback_requests(id) on delete cascade,
  employee_id uuid not null references public.employees(id) on delete restrict,
  responded_at timestamptz null,
  created_at timestamptz not null default now(),
  unique (request_id, employee_id)
);

create table if not exists public.feedback_items (
  id uuid primary key default gen_random_uuid(),
  request_id uuid null references public.feedback_requests(id) on delete set null,
  from_employee_id uuid not null references public.employees(id) on delete restrict,
  to_employee_id uuid not null references public.employees(id) on delete restrict,
  type text not null check (type in ('positive','constructive','neutral')),
  category text not null,
  message text not null,
  rating int null check (rating between 1 and 5),
  anonymous boolean not null default false,
  created_at timestamptz not null default now()
);

-- 2) Development plans and milestones
create table if not exists public.development_plans (
  id uuid primary key default gen_random_uuid(),
  employee_id uuid not null references public.employees(id) on delete cascade,
  title text not null,
  description text not null,
  category text not null check (category in ('technical','leadership','soft-skills','certification')),
  priority text not null check (priority in ('high','medium','low')),
  status text not null default 'not-started' check (status in ('not-started','in-progress','completed','on-hold')),
  progress int not null default 0 check (progress between 0 and 100),
  start_date date not null default current_date,
  target_date date not null,
  mentor text null,
  budget numeric null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.development_plan_milestones (
  id uuid primary key default gen_random_uuid(),
  plan_id uuid not null references public.development_plans(id) on delete cascade,
  title text not null,
  completed boolean not null default false,
  due_date date not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Basic RLS setup (relaxed for development)
alter table public.feedback_requests enable row level security;
alter table public.feedback_request_respondents enable row level security;
alter table public.feedback_items enable row level security;
alter table public.development_plans enable row level security;
alter table public.development_plan_milestones enable row level security;

-- Development-only open policies; tighten in production
do $$ begin
  create policy "allow all feedback_requests" on public.feedback_requests for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "allow all feedback_request_respondents" on public.feedback_request_respondents for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "allow all feedback_items" on public.feedback_items for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "allow all development_plans" on public.development_plans for all using (true) with check (true);
exception when duplicate_object then null; end $$;
do $$ begin
  create policy "allow all development_plan_milestones" on public.development_plan_milestones for all using (true) with check (true);
exception when duplicate_object then null; end $$;


