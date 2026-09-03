-- V15.24 r14 · mes inicial y calendarización del Plan Matriz.
alter table public.plan_matriz_actividades
  add column if not exists mes_inicio date;

update public.plan_matriz_actividades
set mes_inicio = date_trunc('month', current_date)::date
where mes_inicio is null;

alter table public.plan_matriz_actividades
  alter column mes_inicio set not null,
  alter column mes_inicio set default date_trunc('month', current_date)::date;

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
  v_inicio date;
  v_fecha date;
  v_salto integer;
  v_iteracion integer;
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
       or nullif(trim(v_item->>'frecuencia'),'') is null
       or nullif(trim(v_item->>'mes_inicio'),'') is null then
      raise exception 'Cada actividad requiere nombre, frecuencia y mes de inicio';
    end if;

    begin
      v_inicio := to_date((v_item->>'mes_inicio') || '-01','YYYY-MM-DD');
    exception when others then
      raise exception 'El mes de inicio no es válido';
    end;

    insert into public.plan_matriz_actividades
      (equipo_id,tipo_intervencion,actividad,frecuencia,mes_inicio,created_by)
    values
      (v_equipo_id,coalesce(nullif(trim(v_item->>'tipo_intervencion'),''),'General'),
       trim(v_item->>'actividad'),trim(v_item->>'frecuencia'),v_inicio,(select auth.uid()));

    v_salto := case lower(trim(v_item->>'frecuencia'))
      when 'bimestral' then 2 when 'trimestral' then 3
      when 'semestral' then 6 when 'anual' then 12 else 1 end;

    for v_iteracion in 0..11 loop
      exit when lower(trim(v_item->>'frecuencia'))='según plan' and v_iteracion>0;
      v_fecha := (v_inicio + make_interval(months => v_iteracion * v_salto))::date;
      exit when v_fecha >= (v_inicio + interval '12 months');
      insert into public.programacion_preventiva
        (equipo_id,anio,mes,actividad,frecuencia,estado,created_by)
      values
        (v_equipo_id,extract(year from v_fecha)::integer,extract(month from v_fecha)::integer,
         trim(v_item->>'actividad'),trim(v_item->>'frecuencia'),'pendiente',(select auth.uid()));
    end loop;
  end loop;
  return v_equipo_id;
end;
$$;

revoke all on function public.crear_equipo_con_plan_matriz_v1524(jsonb,jsonb) from public, anon;
grant execute on function public.crear_equipo_con_plan_matriz_v1524(jsonb,jsonb) to authenticated;

-- El equipo Lutocar fue creado antes de existir el mes inicial. Se incorpora
-- al período vigente sin alterar sus datos técnicos ni su Plan Matriz.
insert into public.programacion_preventiva
  (equipo_id,anio,mes,actividad,frecuencia,estado,created_by)
select p.equipo_id,extract(year from p.mes_inicio)::integer,extract(month from p.mes_inicio)::integer,
       p.actividad,p.frecuencia,'pendiente',p.created_by
from public.plan_matriz_actividades p
join public.equipos e on e.id=p.equipo_id
where lower(e.nombre)='lutocar'
  and not exists (
    select 1 from public.programacion_preventiva x
    where x.equipo_id=p.equipo_id and x.anio=extract(year from p.mes_inicio)::integer
      and x.mes=extract(month from p.mes_inicio)::integer and lower(x.actividad)=lower(p.actividad)
  );
