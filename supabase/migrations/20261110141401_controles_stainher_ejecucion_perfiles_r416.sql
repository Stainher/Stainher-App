-- La validación de ejecución se basa en el perfil activo. Las metas
-- corresponden al ejecutor, independientemente del supervisor seleccionado.
CREATE OR REPLACE FUNCTION public.v14_validar_cumplimiento_liderazgo()
 RETURNS trigger
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_rol text;
  v_ejecutor_nombre text;
  v_programado boolean;
begin
  v_rol := coalesce(public.mi_rol(),'');
  if v_rol = '' then
    raise exception 'El perfil actual no puede ejecutar controles de Liderazgo en Terreno';
  end if;
  -- La programación es una herramienta de seguimiento, no un prerrequisito.
  -- Se respetan las verificaciones de permisos/RLS de la tabla.
  select coalesce(nullif(trim(p.nombre),''),nullif(trim(p.email),''),v_rol)
    into v_ejecutor_nombre from public.perfiles p where p.id=auth.uid() limit 1;
  v_ejecutor_nombre := coalesce(nullif(trim(v_ejecutor_nombre),''),
    nullif(trim(new.ejecutado_por_nombre),''),
    nullif(trim(new.supervisor_nombre),''),v_rol);
  new.supervisor_nombre := coalesce(nullif(trim(new.supervisor_nombre),''),v_ejecutor_nombre);
  new.supervisor_user_id := coalesce(new.supervisor_user_id,auth.uid());
  new.ejecutado_por_user_id := coalesce(new.ejecutado_por_user_id,auth.uid());
  new.ejecutado_por_nombre := coalesce(nullif(trim(new.ejecutado_por_nombre),''),v_ejecutor_nombre);
  new.ejecutado_por_rol := coalesce(nullif(trim(new.ejecutado_por_rol),''),v_rol);
  if new.control_codigo = 'CTRL-04' then
    new.fuera_programacion := true;
    return new;
  end if;
  if new.anio <> extract(year from current_date)::integer
     or new.mes <> extract(month from current_date)::integer then
    raise exception 'Los controles solo pueden ejecutarse dentro del mes en curso';
  end if;
  -- Registrar como fuera de programación solo si no existe una meta asignada,
  -- conservando el vínculo con las metas cuando corresponda.
  select exists(
    select 1 from public.liderazgo_programacion p
    where (
      coalesce(p.programado_user_id,p.supervisor_user_id) = new.ejecutado_por_user_id
      or (
        coalesce(p.programado_user_id,p.supervisor_user_id) is null
        and lower(trim(p.supervisor_nombre)) = lower(trim(v_ejecutor_nombre))
      )
    )
      and p.control_codigo=new.control_codigo
      and p.anio=new.anio and p.mes=new.mes and p.meta>0
  ) into v_programado;
  new.fuera_programacion := not v_programado;
  return new;
end;
$function$;
