-- Devuelve el aprobador persistido por los triggers de asignación inicial.
CREATE OR REPLACE FUNCTION public.crear_solicitud_propia_v1520(p_tipo text, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_asunto text DEFAULT NULL::text, p_comentario text DEFAULT NULL::text, p_firma_solicitante text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := (select auth.uid());
  v_role text;
  v_can_request boolean := true;
  v_approver uuid;
  v_approver_role text;
  v_id text;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión para crear una solicitud.'; end if;
  if btrim(coalesce(p_tipo,''))='' then raise exception 'Debes seleccionar el tipo de solicitud.'; end if;
  if p_tipo not in ('vacaciones','permiso','cambio_turno','otro') then raise exception 'Tipo de solicitud no válido.'; end if;

  select p.rol,coalesce(t.puede_solicitar,true)
  into v_role,v_can_request
  from public.perfiles p
  left join public.tipos_perfil_v1517 t on t.codigo=p.rol
  where p.id=v_uid and p.activo=true;

  if v_role is null then raise exception 'Perfil de usuario no disponible o inactivo.'; end if;
  if not coalesce(v_can_request,true) then raise exception 'Este perfil no participa como solicitante en el flujo operacional.'; end if;

  if p_tipo='otro' then
    if btrim(coalesce(p_asunto,''))='' then raise exception 'Debes indicar el asunto de la solicitud.'; end if;
  else
    if p_fecha_inicio is null or p_fecha_fin is null or p_fecha_fin<p_fecha_inicio then raise exception 'El rango de fechas no es válido.'; end if;
  end if;

  if v_role='administrador' then
    select p.id,p.rol into v_approver,v_approver_role
    from public.perfiles p
    join public.tipos_perfil_v1517 t on t.codigo=p.rol
    where p.activo=true and t.aprueba_administrador=true and p.id<>v_uid
    order by p.nombre nulls last,p.id
    limit 1;
    if v_approver is null then raise exception 'No existe un perfil Gerente activo configurado para aprobar solicitudes del Administrador.'; end if;
  else
    select p.id,p.rol into v_approver,v_approver_role
    from public.perfiles p
    where p.activo=true and p.rol='administrador' and p.id<>v_uid
    order by p.nombre nulls last,p.id
    limit 1;
    if v_approver is null then raise exception 'No existe un Administrador activo disponible para aprobar la solicitud.'; end if;
  end if;

  insert into public.solicitudes_v15(
    tipo,fecha_inicio,fecha_fin,asunto,comentario,estado,etapa,
    solicitante_user_id,solicitante_rol,created_by,
    aprobador_user_id,aprobador_rol,firma_solicitante,firmado_solicitante_at
  ) values (
    p_tipo,p_fecha_inicio,p_fecha_fin,nullif(btrim(coalesce(p_asunto,'')),''),p_comentario,
    'pendiente','aprobador',v_uid,v_role,v_uid,
    v_approver,v_approver_role,p_firma_solicitante,
    case when p_firma_solicitante is null then null else now() end
  ) returning id::text, aprobador_user_id, aprobador_rol
    into v_id, v_approver, v_approver_role;

  return jsonb_build_object(
    'id',v_id,'solicitante_user_id',v_uid,'solicitante_rol',v_role,
    'aprobador_user_id',v_approver,'aprobador_rol',v_approver_role,
    'estado','pendiente','etapa','aprobador','tipo',p_tipo,'asunto',p_asunto
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.crear_solicitud_legal_r171(p_tipo text, p_fecha_inicio date, p_fecha_fin date, p_comentario text, p_permiso_legal_tipo text, p_permiso_legal_evento text, p_permiso_legal_fecha_evento date, p_permiso_legal_modalidad text DEFAULT NULL::text, p_permiso_legal_dias integer DEFAULT NULL::integer, p_permiso_legal_unidad text DEFAULT NULL::text, p_permiso_legal_certificado_estado text DEFAULT NULL::text, p_aprobador_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_can_request boolean := true;
  v_approver uuid;
  v_approver_role text;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión para crear una solicitud.'; end if;
  if p_tipo not in ('permiso_matrimonio','permiso_fallecimiento','permiso_nacimiento') then
    raise exception 'Tipo de permiso legal no válido.';
  end if;
  if p_fecha_inicio is null or p_fecha_fin is null or p_fecha_fin<p_fecha_inicio then
    raise exception 'El rango de fechas no es válido.';
  end if;
  if p_permiso_legal_fecha_evento is null then
    raise exception 'Debes indicar la fecha del hecho que origina el permiso.';
  end if;

  select p.rol,coalesce(t.puede_solicitar,true)
    into v_role,v_can_request
  from public.perfiles p
  left join public.tipos_perfil_v1517 t on t.codigo=p.rol
  where p.id=v_uid and p.activo=true;

  if v_role is null then raise exception 'Tu perfil no está activo.'; end if;
  if not coalesce(v_can_request,true) then
    raise exception 'Este perfil no participa como solicitante en el flujo operacional.';
  end if;

  if v_role='administrador' then
    if p_aprobador_user_id is not null then
      select p.id,p.rol into v_approver,v_approver_role
      from public.perfiles p
      join public.tipos_perfil_v1517 t on t.codigo=p.rol
      where p.id=p_aprobador_user_id
        and p.activo=true and t.aprueba_administrador=true and p.id<>v_uid
      limit 1;
    else
      select p.id,p.rol into v_approver,v_approver_role
      from public.perfiles p
      join public.tipos_perfil_v1517 t on t.codigo=p.rol
      where p.activo=true and t.aprueba_administrador=true and p.id<>v_uid
        and lower(coalesce(p.email,''))='clagos@stainher.cl'
      order by p.nombre nulls last limit 1;
    end if;
    if v_approver is null then raise exception 'No existe un aprobador habilitado para esta solicitud.'; end if;
  else
    select p.id,p.rol into v_approver,v_approver_role
    from public.perfiles p
    where p.activo=true and p.rol='administrador' and p.id<>v_uid
    order by p.nombre nulls last,p.id limit 1;
    if v_approver is null then raise exception 'No existe un Administrador activo disponible para aprobar la solicitud.'; end if;
  end if;

  insert into public.solicitudes_v15(
    tipo,fecha_inicio,fecha_fin,comentario,estado,etapa,
    solicitante_user_id,solicitante_rol,created_by,
    aprobador_user_id,aprobador_rol,
    permiso_legal_tipo,permiso_legal_evento,permiso_legal_fecha_evento,
    permiso_legal_modalidad,permiso_legal_dias,permiso_legal_unidad,
    permiso_legal_certificado_estado
  ) values (
    p_tipo,p_fecha_inicio,p_fecha_fin,p_comentario,'pendiente','aprobador',
    v_uid,v_role,v_uid,v_approver,v_approver_role,
    p_permiso_legal_tipo,p_permiso_legal_evento,p_permiso_legal_fecha_evento,
    p_permiso_legal_modalidad,p_permiso_legal_dias,p_permiso_legal_unidad,
    coalesce(p_permiso_legal_certificado_estado,'no_aplica')
  )
  returning id, aprobador_user_id, aprobador_rol
    into v_id, v_approver, v_approver_role;

  return jsonb_build_object(
    'id',v_id::text,'tipo',p_tipo,'estado','pendiente','etapa','aprobador',
    'solicitante_user_id',v_uid,'solicitante_rol',v_role,
    'aprobador_user_id',v_approver,'aprobador_rol',v_approver_role
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.crear_solicitud_propia_v135(p_tipo text, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_comentario text DEFAULT NULL::text, p_firma_solicitante text DEFAULT NULL::text, p_aprobador_user_id uuid DEFAULT NULL::uuid)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_can_request boolean := true;
  v_approver uuid;
  v_approver_role text;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión para crear una solicitud.'; end if;
  if btrim(coalesce(p_tipo,''))='' then raise exception 'Debes seleccionar el tipo de solicitud.'; end if;

  select p.rol,coalesce(t.puede_solicitar,true)
    into v_role,v_can_request
  from public.perfiles p
  left join public.tipos_perfil_v1517 t on t.codigo=p.rol
  where p.id=v_uid and p.activo=true;

  if v_role is null then raise exception 'Tu perfil no está activo.'; end if;
  if not coalesce(v_can_request,true) then
    raise exception 'Este perfil no participa como solicitante en el flujo operacional.';
  end if;

  if p_tipo<>'otro' then
    if p_fecha_inicio is null or p_fecha_fin is null or p_fecha_fin<p_fecha_inicio then
      raise exception 'El rango de fechas no es válido.';
    end if;
  elsif p_fecha_inicio is not null and p_fecha_fin is not null and p_fecha_fin<p_fecha_inicio then
    raise exception 'El rango de fechas no es válido.';
  end if;

  if v_role='administrador' then
    if p_aprobador_user_id is not null then
      select p.id,p.rol
        into v_approver,v_approver_role
      from public.perfiles p
      join public.tipos_perfil_v1517 t on t.codigo=p.rol
      where p.id=p_aprobador_user_id
        and p.activo=true
        and t.aprueba_administrador=true
        and p.id<>v_uid
      limit 1;

      if v_approver is null then
        raise exception 'El aprobador seleccionado no está habilitado para aprobar solicitudes del Administrador.';
      end if;
    else
      select p.id,p.rol
        into v_approver,v_approver_role
      from public.perfiles p
      join public.tipos_perfil_v1517 t on t.codigo=p.rol
      where p.activo=true
        and t.aprueba_administrador=true
        and p.id<>v_uid
        and (
          lower(coalesce(p.email,''))='clagos@stainher.cl'
          or lower(regexp_replace(coalesce(p.nombre,''),'[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]','','g')) like '%cristian lagos%'
        )
      order by case when lower(coalesce(p.email,''))='clagos@stainher.cl' then 0 else 1 end,
               p.nombre nulls last
      limit 1;

      if v_approver is null then
        raise exception 'Cristian Lagos no está disponible. Selecciona manualmente un aprobador habilitado.';
      end if;
    end if;
  else
    select p.id,p.rol
      into v_approver,v_approver_role
    from public.perfiles p
    where p.activo=true and p.rol='administrador' and p.id<>v_uid
    order by case when lower(coalesce(p.email,'') )='ismael.galvez@stainher.cl' then 0 else 1 end, p.nombre nulls last,p.id
    limit 1;

    if v_approver is null then
      raise exception 'No existe un Administrador activo disponible para aprobar la solicitud.';
    end if;
  end if;

  insert into public.solicitudes_v15
    (tipo,fecha_inicio,fecha_fin,comentario,estado,etapa,solicitante_user_id,solicitante_rol,created_by,
     aprobador_user_id,aprobador_rol,firma_solicitante,firmado_solicitante_at)
  values
    (p_tipo,p_fecha_inicio,p_fecha_fin,p_comentario,'pendiente','aprobador',v_uid,v_role,v_uid,
     v_approver,v_approver_role,p_firma_solicitante,
     case when p_firma_solicitante is null then null else now() end)
  returning id, aprobador_user_id, aprobador_rol
    into v_id, v_approver, v_approver_role;

  return jsonb_build_object(
    'id',v_id::text,
    'solicitante_user_id',v_uid,
    'solicitante_rol',v_role,
    'aprobador_user_id',v_approver,
    'aprobador_rol',v_approver_role,
    'estado','pendiente',
    'etapa','aprobador',
    'tipo',p_tipo
  );
end;
$function$;

CREATE OR REPLACE FUNCTION public.crear_solicitud_propia_v1517(p_tipo text, p_fecha_inicio date DEFAULT NULL::date, p_fecha_fin date DEFAULT NULL::date, p_comentario text DEFAULT NULL::text, p_firma_solicitante text DEFAULT NULL::text)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_can_request boolean := true;
  v_approver uuid;
  v_approver_role text;
  v_id text;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión para crear una solicitud.'; end if;
  if btrim(coalesce(p_tipo,''))='' then raise exception 'Debes seleccionar el tipo de solicitud.'; end if;

  select p.rol,coalesce(t.puede_solicitar,true)
  into v_role,v_can_request
  from public.perfiles p
  left join public.tipos_perfil_v1517 t on t.codigo=p.rol
  where p.id=v_uid;

  if not coalesce(v_can_request,true) then
    raise exception 'Este perfil no participa como solicitante en el flujo operacional.';
  end if;

  if p_tipo<>'otro' then
    if p_fecha_inicio is null or p_fecha_fin is null or p_fecha_fin<p_fecha_inicio then
      raise exception 'El rango de fechas no es válido.';
    end if;
  elsif p_fecha_inicio is not null and p_fecha_fin is not null and p_fecha_fin<p_fecha_inicio then
    raise exception 'El rango de fechas no es válido.';
  end if;

  if v_role='administrador' then
    select p.id,p.rol into v_approver,v_approver_role
    from public.perfiles p
    join public.tipos_perfil_v1517 t on t.codigo=p.rol
    where p.activo=true and t.aprueba_administrador=true and p.id<>v_uid
    order by p.nombre nulls last,p.id
    limit 1;
    if v_approver is null then
      raise exception 'No existe un perfil Gerente activo configurado para aprobar solicitudes del Administrador.';
    end if;
  else
    select p.id,p.rol into v_approver,v_approver_role
    from public.perfiles p
    where p.activo=true and p.rol='administrador' and p.id<>v_uid
    order by p.nombre nulls last,p.id
    limit 1;
    if v_approver is null then
      raise exception 'No existe un Administrador activo disponible para aprobar la solicitud.';
    end if;
  end if;

  insert into public.solicitudes_v15
    (tipo,fecha_inicio,fecha_fin,comentario,estado,etapa,solicitante_user_id,solicitante_rol,created_by,
     aprobador_user_id,aprobador_rol,firma_solicitante,firmado_solicitante_at)
  values
    (p_tipo,p_fecha_inicio,p_fecha_fin,p_comentario,'pendiente','aprobador',v_uid,v_role,v_uid,
     v_approver,v_approver_role,p_firma_solicitante,case when p_firma_solicitante is null then null else now() end)
  returning id::text, aprobador_user_id, aprobador_rol
    into v_id, v_approver, v_approver_role;

  return jsonb_build_object(
    'id',v_id,
    'solicitante_user_id',v_uid,
    'solicitante_rol',v_role,
    'aprobador_user_id',v_approver,
    'aprobador_rol',v_approver_role,
    'estado','pendiente',
    'etapa','aprobador',
    'tipo',p_tipo
  );
end;
$function$;

-- Reencamina un solo aviso inicial activo por solicitud pendiente.
-- Los avisos descartados, ya resueltos o de otra etapa conservan su historial.
with avisos as (
  select distinct on (s.id) n.id, s.aprobador_user_id
  from public.solicitudes_v15 s
  join public.perfiles p on p.id = s.aprobador_user_id and p.activo
  join public.notificaciones_v15 n on n.referencia_id = s.id::text
    and n.modulo_destino = 'solicitudes'
    and n.titulo = 'Nueva solicitud'
    and n.created_by = s.solicitante_user_id
    and not n.descartada and not n.resuelta
    and n.destinatario_user_id is distinct from s.aprobador_user_id
  where s.estado = 'pendiente'
    and s.etapa = 'aprobador'
    and s.aprobador_user_id <> s.solicitante_user_id
    and not exists (
      select 1 from public.notificaciones_v15 correct
      where correct.referencia_id = s.id::text
        and correct.modulo_destino = 'solicitudes'
        and correct.destinatario_user_id = s.aprobador_user_id
        and not correct.descartada and not correct.resuelta
    )
  order by s.id, n.created_at desc, n.id desc
)
update public.notificaciones_v15 n
set destinatario_user_id = avisos.aprobador_user_id,
    leida = false,
    leida_at = null
from avisos
where n.id = avisos.id;
