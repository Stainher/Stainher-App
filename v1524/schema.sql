-- STAINHER Dashboard V1 - esquema base
create extension if not exists pgcrypto;

create table if not exists public.perfiles (
  id uuid primary key references auth.users(id) on delete cascade,
  nombre text,
  email text,
  rol text not null default 'consulta' check (rol in ('administrador','planificador','supervisor','tecnico','consulta')),
  activo boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.equipos (
  id uuid primary key default gen_random_uuid(),
  nombre text not null unique,
  nombre_alternativo text,
  tipo text,
  ubicacion text,
  fabricante text,
  modelo text,
  capacidad_carga text,
  pasajeros integer,
  velocidad text,
  recorrido text,
  paradas integer,
  potencia text,
  voltaje text,
  frecuencia text,
  control text,
  criticidad text default 'Media',
  responsable text,
  estado text not null default 'activo' check (estado in ('activo','retirado')),
  observaciones text,
  especificaciones jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.programacion_preventiva (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references public.equipos(id) on delete restrict,
  anio integer not null,
  mes integer not null check (mes between 1 and 12),
  actividad text not null,
  frecuencia text,
  fecha_programada date,
  estado text not null default 'programado' check (estado in ('programado','pendiente','ejecutado','no_aplica')),
  fecha_ejecucion date,
  responsable text,
  observacion text,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.perfiles enable row level security;
alter table public.equipos enable row level security;
alter table public.programacion_preventiva enable row level security;

create or replace function public.mi_rol() returns text language sql stable security definer set search_path=public as $$
  select rol from public.perfiles where id=auth.uid() and activo=true
$$;

create policy "perfil propio o admin lee" on public.perfiles for select to authenticated using (id=auth.uid() or public.mi_rol()='administrador');
create policy "todos leen equipos" on public.equipos for select to authenticated using (true);
create policy "admin planificador inserta equipos" on public.equipos for insert to authenticated with check (public.mi_rol() in ('administrador','planificador'));
create policy "admin planificador actualiza equipos" on public.equipos for update to authenticated using (public.mi_rol() in ('administrador','planificador')) with check (public.mi_rol() in ('administrador','planificador'));
create policy "admin elimina equipos" on public.equipos for delete to authenticated using (public.mi_rol()='administrador');
create policy "todos leen preventivo" on public.programacion_preventiva for select to authenticated using (true);
create policy "admin planificador inserta preventivo" on public.programacion_preventiva for insert to authenticated with check (public.mi_rol() in ('administrador','planificador'));
create policy "admin planificador supervisor actualiza preventivo" on public.programacion_preventiva for update to authenticated using (public.mi_rol() in ('administrador','planificador','supervisor')) with check (public.mi_rol() in ('administrador','planificador','supervisor'));
create policy "admin elimina preventivo" on public.programacion_preventiva for delete to authenticated using (public.mi_rol()='administrador');

-- Carga inicial del parque (editable desde el dashboard)
insert into public.equipos (nombre,nombre_alternativo,tipo,ubicacion,fabricante,modelo,capacidad_carga,pasajeros,velocidad,paradas,criticidad,observaciones) values
('JAULA ASEA','Huinche ASEA','Elevador vertical','Concentradora / Molinos','ASEA',null,'4.000 kg',40,null,4,'Alta','Información técnica parcial disponible.'),
('JAULA OTIS',null,'Ascensor / Jaula','Planta Primaria Nivel 18','OTIS','ES40','1.200 kg',10,null,4,'Alta','Motor 12 HP / 380 V según manual disponible.'),
('JAULA ALIMAK','Traspaso Domo ALIMAK','Elevador','Nodo 3500 / Domo','ALIMAK HEK',null,'1.400 kg',18,null,7,'Alta','Equipo ALIMAK Nodo 3500.'),
('NODO 3700','Ascensor Barrio Cívico 3700','Ascensor','Barrio Cívico Nodo 3700','OTIS','GEN2 MRL_HZ','900 kg',12,'1,0 m/s',4,'Alta','Recorrido aproximado 13,99 m.'),
('HUINCHE PTP','Tercer Panel PTP','Huinche','Tercer Panel',null,null,null,null,null,null,'Alta','Datos técnicos pendientes de completar.'),
('EILA 1',null,'Ascensor','Edificio EILA','Schindler','100L','600 kg',8,'1,0 m/s',4,'Media','Equipo 1 de 2.'),
('EILA 2',null,'Ascensor','Edificio EILA','Schindler','100L','600 kg',8,'1,0 m/s',4,'Media','Equipo 2 de 2.'),
('HILTON 02','Alimentación','Montaplatos','Casino Hilton',null,null,null,null,null,null,'Media','Montaplatos de alimentación.'),
('HILTON 03','Multiservicio','Montaplatos','Casino Hilton',null,null,null,null,null,null,'Media','Montaplatos multiservicio.')
on conflict (nombre) do nothing;

-- IMPORTANTE: crear primero un usuario en Auth y luego asignarlo como administrador:
-- insert into public.perfiles(id,nombre,email,rol) values ('UUID_DEL_USUARIO','Ismael Gálvez','correo@dominio.cl','administrador');

-- ============================================================
-- MODULO CORRECTIVO / AVERÍAS - CARGA MANUAL EXCEL/CSV
-- ============================================================

create table if not exists public.importaciones_averias (
  id uuid primary key default gen_random_uuid(),
  nombre_archivo text not null,
  total_registros integer not null default 0,
  registros_nuevos integer not null default 0,
  registros_duplicados integer not null default 0,
  registros_error integer not null default 0,
  usuario_id uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create table if not exists public.averias (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid references public.equipos(id) on delete set null,
  equipo_original text,
  numero_guia text,
  supervisor_tecnico text,
  fecha_inicio date,
  hora_inicio text,
  fecha_termino date,
  hora_termino text,
  estado_final text,
  observaciones text,
  duracion_minutos integer,
  clave_unica text unique,
  importacion_id uuid references public.importaciones_averias(id) on delete set null,
  created_by uuid references auth.users(id) on delete set null,
  created_at timestamptz not null default now()
);

create index if not exists idx_averias_equipo_id on public.averias(equipo_id);
create index if not exists idx_averias_fecha_inicio on public.averias(fecha_inicio);
create index if not exists idx_averias_estado_final on public.averias(estado_final);
create index if not exists idx_averias_importacion on public.averias(importacion_id);
create index if not exists idx_importaciones_averias_fecha on public.importaciones_averias(created_at);

alter table public.averias enable row level security;
alter table public.importaciones_averias enable row level security;

create policy "todos leen averias" on public.averias for select to authenticated using (true);
create policy "todos leen importaciones averias" on public.importaciones_averias for select to authenticated using (true);
create policy "admin planificador inserta averias" on public.averias for insert to authenticated with check (public.mi_rol() in ('administrador','planificador'));
create policy "admin planificador inserta importaciones" on public.importaciones_averias for insert to authenticated with check (public.mi_rol() in ('administrador','planificador'));
create policy "admin planificador actualiza averias" on public.averias for update to authenticated using (public.mi_rol() in ('administrador','planificador')) with check (public.mi_rol() in ('administrador','planificador'));
create policy "admin elimina averias" on public.averias for delete to authenticated using (public.mi_rol()='administrador');
create policy "admin elimina importaciones averias" on public.importaciones_averias for delete to authenticated using (public.mi_rol()='administrador');
