
-- 1) Función genérica para updated_at (idempotente)
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- 2) Tabla de citas (appointments)
create table if not exists public.appointments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  patient_id uuid not null,
  title text not null,
  description text,
  location text,
  status text not null default 'scheduled',
  start_time timestamptz not null,
  end_time timestamptz not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS para appointments
alter table public.appointments enable row level security;

drop policy if exists "Users can manage own appointments" on public.appointments;
create policy "Users can manage own appointments"
  on public.appointments
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Índices útiles
create index if not exists idx_appointments_user_id on public.appointments (user_id);
create index if not exists idx_appointments_patient_id on public.appointments (patient_id);
create index if not exists idx_appointments_start_time on public.appointments (start_time);

-- Validación con trigger: end_time > start_time
create or replace function public.validate_appointment_time()
returns trigger
language plpgsql
as $$
begin
  if new.end_time <= new.start_time then
    raise exception 'end_time must be after start_time';
  end if;
  return new;
end;
$$;

drop trigger if exists validate_appointment_time_trigger on public.appointments;
create trigger validate_appointment_time_trigger
  before insert or update on public.appointments
  for each row execute function public.validate_appointment_time();

-- updated_at automático
drop trigger if exists set_updated_at_on_appointments on public.appointments;
create trigger set_updated_at_on_appointments
  before update on public.appointments
  for each row execute function public.set_updated_at();

-- 3) Tabla para configuración de IA (ai_settings)
create table if not exists public.ai_settings (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  assistant_name text default 'Asistente médico',
  model_provider text default 'openai',
  model_name text default 'gpt-4o-mini',
  temperature numeric default 0.2,
  specialty_override text,
  system_prompt text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- RLS para ai_settings
alter table public.ai_settings enable row level security;

drop policy if exists "Users can manage own ai_settings" on public.ai_settings;
create policy "Users can manage own ai_settings"
  on public.ai_settings
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Cada usuario solo necesita un registro
create unique index if not exists uq_ai_settings_user_id on public.ai_settings (user_id);

-- updated_at automático
drop trigger if exists set_updated_at_on_ai_settings on public.ai_settings;
create trigger set_updated_at_on_ai_settings
  before update on public.ai_settings
  for each row execute function public.set_updated_at();
