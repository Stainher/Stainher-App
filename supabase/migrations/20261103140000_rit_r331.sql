-- Desarrollo 29 · R331 · RIT en Liderazgo en Terreno
-- Refleja migraciones ya aplicadas en Supabase; idempotente para entornos nuevos.
create table if not exists public.rit_reuniones (
  id uuid primary key default gen_random_uuid(),
  created_by uuid not null default auth.uid() references auth.users(id),
  fecha date not null default current_date,
  turno text not null default 'A',
  centro text not null default 'Codelco Andina',
  gerencia text not null default 'GSER',
  empresa text not null default 'STAINHER',
  area text not null default '',
  supervisor text not null default '',
  asistentes integer not null default 0 check(asistentes between 0 and 999),
  participantes jsonb not null default '[]'::jsonb,
  riesgos jsonb not null default '[]'::jsonb,
  actividades jsonb not null default '[]'::jsonb,
  aportes jsonb not null default '[]'::jsonb,
  reconocimientos jsonb not null default '[]'::jsonb,
  estado text not null default 'borrador' check(estado in ('borrador','finalizado','anulado')),
  fecha_cierre timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint rit_max_six check(jsonb_array_length(actividades)<=6),
  constraint rit_max_four_aportes check(jsonb_array_length(aportes)<=4),
  constraint rit_max_four_reconocimientos check(jsonb_array_length(reconocimientos)<=4)
);
alter table public.rit_reuniones enable row level security;
revoke all on public.rit_reuniones from anon;
grant select, insert, update on public.rit_reuniones to authenticated;
create index if not exists rit_by_creator_date on public.rit_reuniones(created_by,fecha desc);
do $$
begin
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='rit_reuniones' and policyname='rit_select_own') then
  create policy rit_select_own on public.rit_reuniones for select to authenticated
   using(created_by=(select auth.uid()));
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='rit_reuniones' and policyname='rit_insert_own') then
  create policy rit_insert_own on public.rit_reuniones for insert to authenticated
   with check(created_by=(select auth.uid()) and estado='borrador');
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='rit_reuniones' and policyname='rit_update_own_draft') then
  create policy rit_update_own_draft on public.rit_reuniones for update to authenticated
   using(created_by=(select auth.uid()) and estado='borrador')
   with check(created_by=(select auth.uid()) and estado in ('borrador','finalizado','anulado'));
 end if;
 if not exists(select 1 from pg_policies where schemaname='public' and tablename='rit_reuniones' and policyname='rit_select_management') then
  create policy rit_select_management on public.rit_reuniones for select to authenticated
   using(lower((select public.mi_rol())) in ('administrador','gerente','prevencion'));
 end if;
end $$;
