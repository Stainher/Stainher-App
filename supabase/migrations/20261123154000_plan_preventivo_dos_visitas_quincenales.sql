CREATE OR REPLACE FUNCTION public.crear_equipo_con_plan_matriz_v1524(p_equipo jsonb, p_actividades jsonb)
 RETURNS uuid
 LANGUAGE plpgsql
 SET search_path TO 'public'
AS $function$
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
      select v_equipo_id,extract(year from v_fecha)::integer,extract(month from v_fecha)::integer,
        trim(v_item->>'actividad'),trim(v_item->>'frecuencia'),'pendiente',(select auth.uid())
      from generate_series(1,case when lower(trim(v_item->>'frecuencia'))='quincenal' then 2 else 1 end);
    end loop;
  end loop;
  return v_equipo_id;
end;
$function$;

CREATE OR REPLACE FUNCTION public.editar_plan_matriz_equipo(p_equipo uuid, p_actividades jsonb)
 RETURNS void
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
  item jsonb;
  anterior public.plan_matriz_actividades%rowtype;
  nombre text;
  tipo text;
  frecuencia_nueva text;
  inicio date;
  salto integer;
  mes_plan date;
  desde date := date_trunc('month', now() at time zone 'America/Santiago')::date;
begin
  if auth.uid() is null or public.mi_rol() not in ('administrador','planificador')
     or not public.tiene_permiso('equipos','editar') or not public.tiene_permiso('preventivo','editar') then
    raise exception 'No tienes permiso para editar el plan preventivo' using errcode='42501';
  end if;
  perform 1 from public.equipos where id=p_equipo and estado <> 'retirado' for update;
  if not found then raise exception 'Equipo no disponible'; end if;
  if jsonb_typeof(p_actividades) is distinct from 'array' or jsonb_array_length(p_actividades)>250 then
    raise exception 'Lista de actividades inválida';
  end if;
  if exists (
    select 1 from jsonb_array_elements(p_actividades) j
    group by lower(btrim(j->>'actividad')) having count(*)>1
  ) then raise exception 'Hay actividades con el mismo nombre'; end if;

  for anterior in select * from public.plan_matriz_actividades where equipo_id=p_equipo and activo loop
    select j into item from jsonb_array_elements(p_actividades) j where j->>'id'=anterior.id::text;
    if item is not null
       and anterior.actividad=btrim(item->>'actividad')
       and anterior.frecuencia=item->>'frecuencia' and anterior.mes_inicio=(item->>'mes_inicio'||'-01')::date then
      continue;
    end if;
    salto := case lower(anterior.frecuencia) when 'bimestral' then 2 when 'trimestral' then 3 when 'semestral' then 6 when 'anual' then 12 when 'según plan' then 12 else 1 end;
    delete from public.programacion_preventiva p
      where p.equipo_id=p_equipo and p.actividad=anterior.actividad and p.frecuencia=anterior.frecuencia
      and p.created_by=anterior.created_by and p.estado='pendiente'
      and p.fecha_programada is null and p.fecha_ejecucion is null
      and p.responsable is null and p.observacion is null
      and p.updated_at=p.created_at
      and make_date(p.anio,p.mes,1)>=desde
      and make_date(p.anio,p.mes,1) in (
        select f::date from generate_series(anterior.mes_inicio, anterior.mes_inicio + interval '11 months', make_interval(months=>salto)) f
      );
    if item is null then
      update public.plan_matriz_actividades set activo=false,updated_at=now() where id=anterior.id;
    end if;
  end loop;

  for item in select value from jsonb_array_elements(p_actividades) loop
    nombre := btrim(item->>'actividad');
    tipo := btrim(item->>'tipo_intervencion');
    frecuencia_nueva := item->>'frecuencia';
    if coalesce(nombre,'')='' or coalesce(tipo,'')=''
       or coalesce(frecuencia_nueva,'')=''
       or coalesce(item->>'mes_inicio','') !~ '^[0-9]{4}-(0[1-9]|1[0-2])$' then
      raise exception 'Completa intervención, actividad, frecuencia y mes de inicio';
    end if;
    inicio := (item->>'mes_inicio'||'-01')::date;
    select * into anterior from public.plan_matriz_actividades where equipo_id=p_equipo and id=(item->>'id')::uuid and activo;
    if not found and item->>'id' is not null then raise exception 'El plan cambió. Vuelve a abrirlo'; end if;
    if anterior.id is not null then
      if anterior.actividad <> nombre then
        insert into public.forecast_precios_actividades (equipo_id,actividad,precio_unitario)
        select equipo_id,nombre,precio_unitario from public.forecast_precios_actividades
        where equipo_id=p_equipo and actividad=anterior.actividad
        on conflict do nothing;
      end if;
      update public.plan_matriz_actividades
      set actividad=nombre,tipo_intervencion=tipo,frecuencia=frecuencia_nueva,mes_inicio=inicio,updated_at=now()
      where id=anterior.id;
      if anterior.actividad=nombre and anterior.frecuencia=frecuencia_nueva and anterior.mes_inicio=inicio then continue; end if;
    else
      insert into public.plan_matriz_actividades (equipo_id,tipo_intervencion,actividad,frecuencia,mes_inicio,created_by)
      values(p_equipo,tipo,nombre,frecuencia_nueva,inicio,auth.uid())
      on conflict(equipo_id,actividad) do update set activo=true,tipo_intervencion=tipo,
        frecuencia=frecuencia_nueva,mes_inicio=inicio,created_by=auth.uid(),updated_at=now()
      where not plan_matriz_actividades.activo;
      if not found then raise exception 'Ya existe la actividad %',nombre; end if;
    end if;
    salto := case lower(frecuencia_nueva) when 'bimestral' then 2 when 'trimestral' then 3 when 'semestral' then 6 when 'anual' then 12 when 'según plan' then 12 else 1 end;
    for mes_plan in select f::date from generate_series(inicio,inicio+interval '11 months',make_interval(months=>salto)) f loop
      if mes_plan<desde then continue; end if;
      insert into public.programacion_preventiva (equipo_id,anio,mes,actividad,frecuencia,estado,created_by)
      select p_equipo,extract(year from mes_plan),extract(month from mes_plan),nombre,frecuencia_nueva,'pendiente',
        coalesce(anterior.created_by,auth.uid())
      from generate_series(1, (case when lower(frecuencia_nueva)='quincenal' then 2 else 1 end) - (
        select count(*)::integer from public.programacion_preventiva p
        where p.equipo_id=p_equipo and p.actividad=nombre and p.anio=extract(year from mes_plan)
          and p.mes=extract(month from mes_plan) and p.estado <> 'no_aplica'
      ));
    end loop;
  end loop;
end;
$function$;

-- Completa las segundas visitas faltantes en períodos quincenales ya generados.
insert into public.programacion_preventiva(equipo_id,anio,mes,actividad,frecuencia,estado,created_by)
select m.equipo_id,p.anio,p.mes,m.actividad,m.frecuencia,'pendiente',m.created_by
from public.plan_matriz_actividades m
join public.programacion_preventiva p on p.equipo_id=m.equipo_id and p.actividad=m.actividad
where m.activo and lower(m.frecuencia)='quincenal'
  and p.estado <> 'no_aplica'
  and make_date(p.anio,p.mes,1)>=greatest(m.mes_inicio,date_trunc('month',now() at time zone 'America/Santiago')::date)
  and make_date(p.anio,p.mes,1)<m.mes_inicio+interval '12 months'
group by m.id,p.anio,p.mes
having count(*)=1;

create policy preventivo_update_admin_plan_matriz
on public.programacion_preventiva for update to authenticated
using (
  (select public.mi_rol())='administrador'
  and (select public.tiene_permiso('preventivo','editar'))
  and exists (select 1 from public.plan_matriz_actividades m
              where m.equipo_id=programacion_preventiva.equipo_id and m.actividad=programacion_preventiva.actividad and m.activo)
)
with check (
  (select public.mi_rol())='administrador'
  and (select public.tiene_permiso('preventivo','editar'))
  and exists (select 1 from public.plan_matriz_actividades m
              where m.equipo_id=programacion_preventiva.equipo_id and m.actividad=programacion_preventiva.actividad and m.activo)
);
