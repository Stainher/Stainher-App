-- V15.24 · catálogo Plan Matriz independiente de la calendarización.
create table if not exists public.plan_matriz_actividades (
  id uuid primary key default gen_random_uuid(),
  equipo_id uuid not null references public.equipos(id) on delete cascade,
  tipo_intervencion text not null,
  actividad text not null,
  frecuencia text not null,
  activo boolean not null default true,
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint plan_matriz_actividad_unica unique (equipo_id, actividad)
);

create index if not exists plan_matriz_actividades_equipo_idx
  on public.plan_matriz_actividades (equipo_id) where activo;

alter table public.plan_matriz_actividades enable row level security;
grant select, insert, update, delete on public.plan_matriz_actividades to authenticated;

drop policy if exists "usuarios leen plan matriz" on public.plan_matriz_actividades;
create policy "usuarios leen plan matriz" on public.plan_matriz_actividades
  for select to authenticated using (true);
drop policy if exists "planificadores crean plan matriz" on public.plan_matriz_actividades;
create policy "planificadores crean plan matriz" on public.plan_matriz_actividades
  for insert to authenticated
  with check (public.mi_rol() in ('administrador','planificador') and created_by=(select auth.uid()));
drop policy if exists "planificadores actualizan plan matriz" on public.plan_matriz_actividades;
create policy "planificadores actualizan plan matriz" on public.plan_matriz_actividades
  for update to authenticated
  using (public.mi_rol() in ('administrador','planificador'))
  with check (public.mi_rol() in ('administrador','planificador'));
drop policy if exists "planificadores eliminan plan matriz" on public.plan_matriz_actividades;
create policy "planificadores eliminan plan matriz" on public.plan_matriz_actividades
  for delete to authenticated using (public.mi_rol() in ('administrador','planificador'));

create or replace function public.crear_equipo_con_plan_matriz_v1524(
  p_equipo jsonb,
  p_actividades jsonb
) returns uuid
language plpgsql
security invoker
set search_path=public
as $$
declare
  v_equipo_id uuid;
  v_item jsonb;
begin
  if public.mi_rol() not in ('administrador','planificador') then
    raise exception 'No tienes permiso para crear equipos y planes matriz';
  end if;
  if coalesce(jsonb_array_length(p_actividades),0)=0 then
    raise exception 'El Plan Matriz debe contener al menos una actividad';
  end if;

  insert into public.equipos
    (nombre,nombre_alternativo,tipo,ubicacion,fabricante,modelo,capacidad_carga,
     pasajeros,velocidad,paradas,criticidad,estado,observaciones)
  values
    (nullif(trim(p_equipo->>'nombre'),''),nullif(trim(p_equipo->>'nombre_alternativo'),''),
     nullif(trim(p_equipo->>'tipo'),''),nullif(trim(p_equipo->>'ubicacion'),''),
     nullif(trim(p_equipo->>'fabricante'),''),nullif(trim(p_equipo->>'modelo'),''),
     nullif(trim(p_equipo->>'capacidad_carga'),''),nullif(p_equipo->>'pasajeros','')::integer,
     nullif(trim(p_equipo->>'velocidad'),''),nullif(p_equipo->>'paradas','')::integer,
     coalesce(nullif(trim(p_equipo->>'criticidad'),''),'Media'),
     coalesce(nullif(trim(p_equipo->>'estado'),''),'activo'),
     nullif(trim(p_equipo->>'observaciones'),''))
  returning id into v_equipo_id;

  for v_item in select value from jsonb_array_elements(p_actividades)
  loop
    if nullif(trim(v_item->>'actividad'),'') is null
       or nullif(trim(v_item->>'frecuencia'),'') is null then
      raise exception 'Cada actividad requiere nombre y frecuencia';
    end if;
    insert into public.plan_matriz_actividades
      (equipo_id,tipo_intervencion,actividad,frecuencia,created_by)
    values
      (v_equipo_id,coalesce(nullif(trim(v_item->>'tipo_intervencion'),''),'General'),
       trim(v_item->>'actividad'),trim(v_item->>'frecuencia'),(select auth.uid()));
  end loop;
  return v_equipo_id;
end;
$$;

revoke all on function public.crear_equipo_con_plan_matriz_v1524(jsonb,jsonb) from public, anon;
grant execute on function public.crear_equipo_con_plan_matriz_v1524(jsonb,jsonb) to authenticated;
