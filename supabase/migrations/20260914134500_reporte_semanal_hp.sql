create table if not exists public.hp_periodos_codelco (
  id uuid primary key default gen_random_uuid(),
  anio integer not null,
  mes integer not null check (mes between 1 and 12),
  orden integer not null check (orden > 0),
  fecha_inicio date not null,
  fecha_fin date not null,
  etiqueta text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (anio, mes, orden),
  check (fecha_fin >= fecha_inicio)
);

create table if not exists public.hp_ajustes_manuales (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.perfiles(id) on delete cascade,
  fecha date not null,
  tipo text not null check (tipo in ('terreno_administrativo','operativa_esporadica')),
  horas numeric(6,2) not null default 0 check (horas >= 0),
  observacion text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, fecha, tipo)
);

create table if not exists public.hp_clasificacion_personal (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.perfiles(id) on delete cascade,
  anio integer not null,
  mes integer not null check (mes between 1 and 12),
  clasificacion text not null default 'operaciones' check (clasificacion in ('operaciones','inversiones')),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, anio, mes)
);

alter table public.hp_periodos_codelco enable row level security;
alter table public.hp_ajustes_manuales enable row level security;
alter table public.hp_clasificacion_personal enable row level security;

grant select, insert, update, delete on public.hp_periodos_codelco to authenticated;
grant select, insert, update, delete on public.hp_ajustes_manuales to authenticated;
grant select, insert, update, delete on public.hp_clasificacion_personal to authenticated;

drop policy if exists hp_periodos_select on public.hp_periodos_codelco;
create policy hp_periodos_select on public.hp_periodos_codelco for select to authenticated using (true);

drop policy if exists hp_periodos_write on public.hp_periodos_codelco;
create policy hp_periodos_write on public.hp_periodos_codelco for all to authenticated
using (public.mi_rol() in ('administrador','planificador'))
with check (public.mi_rol() in ('administrador','planificador'));

drop policy if exists hp_ajustes_select on public.hp_ajustes_manuales;
create policy hp_ajustes_select on public.hp_ajustes_manuales for select to authenticated using (true);

drop policy if exists hp_ajustes_write on public.hp_ajustes_manuales;
create policy hp_ajustes_write on public.hp_ajustes_manuales for all to authenticated
using (public.mi_rol() in ('administrador','planificador'))
with check (public.mi_rol() in ('administrador','planificador'));

drop policy if exists hp_clasificacion_select on public.hp_clasificacion_personal;
create policy hp_clasificacion_select on public.hp_clasificacion_personal for select to authenticated using (true);

drop policy if exists hp_clasificacion_write on public.hp_clasificacion_personal;
create policy hp_clasificacion_write on public.hp_clasificacion_personal for all to authenticated
using (public.mi_rol() in ('administrador','planificador'))
with check (public.mi_rol() in ('administrador','planificador'));

create index if not exists hp_periodos_mes_idx on public.hp_periodos_codelco(anio, mes, orden);
create index if not exists hp_ajustes_fecha_idx on public.hp_ajustes_manuales(fecha, user_id);
create index if not exists hp_clasificacion_mes_idx on public.hp_clasificacion_personal(anio, mes, clasificacion);
