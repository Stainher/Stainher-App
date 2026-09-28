-- R135 · Enrutamiento de solicitudes del Administrador y reenvío a Cristian Lagos.
-- Las solicitudes creadas por Administrador usan Cristian Lagos por defecto,
-- pero permiten seleccionar otro perfil habilitado para aprobar Administrador.

create or replace function public.crear_solicitud_propia_v135(
  p_tipo text,
  p_fecha_inicio date default null,
  p_fecha_fin date default null,
  p_comentario text default null,
  p_firma_solicitante text default null,
  p_aprobador_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $function$
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
     v_approver,v_approver_role,p_firma_solicitante,
     case when p_firma_solicitante is null then null else now() end)
  returning id into v_id;

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

revoke all on function public.crear_solicitud_propia_v135(text,date,date,text,text,uuid) from public,anon;
grant execute on function public.crear_solicitud_propia_v135(text,date,date,text,text,uuid) to authenticated;


create or replace function public.reenviar_solicitud_aprobador_v135(
  p_id text,
  p_aprobador_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path = 'public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_target uuid;
  v_target_role text;
  r public.solicitudes_v15%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.'; end if;

  select lower(coalesce(p.rol,''))
    into v_role
  from public.perfiles p
  where p.id=v_uid and p.activo=true;

  if v_role<>'administrador' then
    raise exception 'Solo el perfil Administrador puede reenviar estas solicitudes.';
  end if;

  select * into r
  from public.solicitudes_v15
  where id::text=p_id
  for update;

  if not found then raise exception 'Solicitud no encontrada.'; end if;
  if r.solicitante_user_id is distinct from v_uid then
    raise exception 'Solo puedes reenviar tus propias solicitudes desde este control.';
  end if;
  if r.tipo='justificativo' then
    raise exception 'Los justificativos mantienen su flujo directo con Recursos Humanos.';
  end if;
  if r.tipo='vacaciones' and r.estado='aprobada' and r.etapa='finalizada' then
    raise exception 'Las vacaciones ya finalizadas por RR.HH. no se pueden reabrir desde este control.';
  end if;
  if r.estado not in ('pendiente','pendiente_rrhh','aprobada') then
    raise exception 'Esta solicitud no se encuentra en un estado que permita reenviarla.';
  end if;

  if p_aprobador_user_id is not null then
    select p.id,p.rol
      into v_target,v_target_role
    from public.perfiles p
    join public.tipos_perfil_v1517 t on t.codigo=p.rol
    where p.id=p_aprobador_user_id
      and p.activo=true
      and t.aprueba_administrador=true
      and p.id<>v_uid
    limit 1;
  else
    select p.id,p.rol
      into v_target,v_target_role
    from public.perfiles p
    join public.tipos_perfil_v1517 t on t.codigo=p.rol
    where p.activo=true
      and t.aprueba_administrador=true
      and p.id<>v_uid
      and lower(coalesce(p.email,''))='clagos@stainher.cl'
    order by p.nombre nulls last
    limit 1;
  end if;

  if v_target is null then
    raise exception 'No se encontró un aprobador habilitado para reenviar la solicitud.';
  end if;

  update public.notificaciones_v15
     set descartada=true,
         resuelta=true,
         leida=true,
         leida_at=coalesce(leida_at,now()),
         resuelta_at=coalesce(resuelta_at,now()),
         resolucion=coalesce(resolucion,'Solicitud reasignada por Administrador')
   where referencia_id=p_id
     and lower(coalesce(modulo_destino,''))='solicitudes'
     and coalesce(descartada,false)=false;

  update public.solicitudes_v15
     set estado='pendiente',
         etapa='aprobador',
         aprobador_user_id=v_target,
         aprobador_rol=v_target_role,
         rrhh_user_id=null,
         firma_aprobador=null,
         firmado_aprobador_at=null,
         resuelto_por=null,
         resuelto_at=null,
         finalizada_at=null,
         motivo_rechazo=null
   where id::text=p_id;

  insert into public.notificaciones_v15
    (titulo,mensaje,prioridad,destinatario_user_id,created_by,modulo_destino,referencia_id)
  values
    ('Solicitud reenviada para aprobación',
     'El Administrador reenvió una solicitud para tu revisión y aprobación.',
     'importante',v_target,v_uid,'solicitudes',p_id);

  select * into r from public.solicitudes_v15 where id::text=p_id;

  return jsonb_build_object(
    'id',r.id::text,
    'tipo',r.tipo,
    'estado',r.estado,
    'etapa',r.etapa,
    'solicitante_user_id',r.solicitante_user_id,
    'aprobador_user_id',r.aprobador_user_id,
    'aprobador_rol',r.aprobador_rol,
    'rrhh_user_id',r.rrhh_user_id
  );
end;
$function$;

revoke all on function public.reenviar_solicitud_aprobador_v135(text,uuid) from public,anon;
grant execute on function public.reenviar_solicitud_aprobador_v135(text,uuid) to authenticated;
