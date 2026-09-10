-- Stainher App V15.24
-- Corrige la validación heredada de Liderazgo en Terreno para que los perfiles
-- con ejecución libre no requieran programación mensual de Supervisor.
-- Supervisor/Técnico conservan la validación de programación existente.

create or replace function public.v14_validar_cumplimiento_liderazgo()
returns trigger
language plpgsql
security definer
set search_path to 'public'
as $function$
declare
  v_rol text;
  v_meta integer;
  v_realizados integer;
  v_ejecutor_nombre text;
  v_ejecucion_libre boolean;
begin
  v_rol := coalesce(public.mi_rol(),'');
  v_ejecucion_libre := v_rol in ('administrador','prevencion','confiabilidad','planificador');

  if v_rol not in ('supervisor','tecnico','prevencion','administrador','confiabilidad','planificador') then
    raise exception
      'El perfil actual no puede ejecutar controles de Liderazgo en Terreno';
  end if;

  -- En ejecución libre, normalizar identidad del ejecutor antes de que se
  -- validen las restricciones NOT NULL de la tabla.
  if v_ejecucion_libre then
    select coalesce(nullif(trim(p.nombre),''), nullif(trim(p.email),''), v_rol)
      into v_ejecutor_nombre
    from public.perfiles p
    where p.id = auth.uid()
    limit 1;

    v_ejecutor_nombre := coalesce(
      nullif(trim(v_ejecutor_nombre),''),
      nullif(trim(new.ejecutado_por_nombre),''),
      nullif(trim(new.supervisor_nombre),''),
      v_rol
    );

    new.fuera_programacion := true;
    new.supervisor_nombre := coalesce(nullif(trim(new.supervisor_nombre),''), v_ejecutor_nombre);
    new.supervisor_user_id := coalesce(new.supervisor_user_id, auth.uid());
    new.ejecutado_por_user_id := coalesce(new.ejecutado_por_user_id, auth.uid());
    new.ejecutado_por_nombre := coalesce(nullif(trim(new.ejecutado_por_nombre),''), v_ejecutor_nombre);
    new.ejecutado_por_rol := coalesce(nullif(trim(new.ejecutado_por_rol),''), v_rol);
  end if;

  -- Control 4 se ejecuta cada vez que aplique y no requiere programación.
  if new.control_codigo = 'CTRL-04' then
    return new;
  end if;

  -- Mantener la regla histórica de registrar controles dentro del mes en curso.
  if new.anio <> extract(year from current_date)::integer
     or new.mes <> extract(month from current_date)::integer then
    raise exception
      'Los controles solo pueden ejecutarse dentro del mes en curso';
  end if;

  -- Administrador, Prevención, Confiabilidad y Planificación/Programación
  -- ejecutan libremente, sin meta mensual asociada a un Supervisor.
  if v_ejecucion_libre then
    return new;
  end if;

  -- Supervisor y Técnico conservan la programación mensual obligatoria.
  select coalesce(sum(p.meta),0)::integer
    into v_meta
  from public.liderazgo_programacion p
  where lower(trim(p.supervisor_nombre)) = lower(trim(new.supervisor_nombre))
    and p.control_codigo = new.control_codigo
    and p.anio = new.anio
    and p.mes = new.mes;

  if v_meta <= 0 then
    raise exception
      'El usuario no tiene este control programado para el mes en curso';
  end if;

  select count(*)::integer
    into v_realizados
  from public.liderazgo_cumplimiento c
  where lower(trim(c.supervisor_nombre)) = lower(trim(new.supervisor_nombre))
    and c.control_codigo = new.control_codigo
    and c.anio = new.anio
    and c.mes = new.mes
    and coalesce(c.estado,'realizado') = 'realizado';

  if v_realizados >= v_meta then
    raise exception
      'La cantidad programada para este control ya fue completada';
  end if;

  return new;
end;
$function$;
