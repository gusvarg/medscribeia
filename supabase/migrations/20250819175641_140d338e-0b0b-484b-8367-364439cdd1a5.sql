
-- 1) Tabla de consultorios
create table if not exists public.consultorios (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  address text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Índices útiles
create index if not exists idx_consultorios_user_id on public.consultorios(user_id);

-- Nombre único por usuario
create unique index if not exists consultorios_user_name_unique 
on public.consultorios(user_id, lower(name));

-- Trigger para updated_at
drop trigger if exists trg_consultorios_updated_at on public.consultorios;
create trigger trg_consultorios_updated_at
before update on public.consultorios
for each row execute function public.update_updated_at_column();

-- RLS
alter table public.consultorios enable row level security;

drop policy if exists "Users can manage own consultorios" on public.consultorios;
create policy "Users can manage own consultorios"
on public.consultorios
as permissive
for all
to authenticated
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- 2) Añadir consultorio_id a pacientes (opcional)
alter table public.patients
add column if not exists consultorio_id uuid null references public.consultorios(id) on delete set null;

create index if not exists idx_patients_consultorio_id on public.patients(consultorio_id);

-- 3) Añadir consultorio_id a consultas
alter table public.consultations
add column if not exists consultorio_id uuid null references public.consultorios(id) on delete set null;

create index if not exists idx_consultations_consultorio_id on public.consultations(consultorio_id);
