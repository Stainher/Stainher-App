-- R138 · Reasignar solicitudes aprobadas a Cristian Lagos.
-- Permite al Administrador reabrir solicitudes aprobadas de cualquier solicitante
-- y enviarlas nuevamente a Cristian Lagos para aprobación.
-- No aplica a justificativos ni a vacaciones finalizadas por RR.HH.
-- Conserva trazabilidad del aprobador anterior en auditoria_v15.

create or replace function public.reasignar_solicitud_aprobada_cristian_r138(
  p_id text
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
  v_target_name text;
  r public.solicitudes_v15%rowtype;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  select lower(coalesce(p.rol,''))
    into v_role
  from public.perfiles p
  where p.id=v_uid and p.activo=true;

  if v_role<>'administrador' then
    raise exception 'Solo el perfil Administrador puede reasignar solicitudes aprobadas.';
  end if;

  select * into r
  from public.solicitudes_v15
  where id::text=p_id
  for update;

  if not found then
    raise exception 'Solicitud no encontrada.';
  end if;

  if r.estado<>'aprobada' then
    raise exception 'Solo se pueden reasignar solicitudes que ya estén aprobadas.';
  end if;

  if r.tipo='justificativo' then
    raise exception 'Los justificativos mantienen su flujo directo con Recursos Humanos.';
  end if;

  if r.tipo='vacaciones' and (
    r.etapa='finalizada'
    or r.finalizada_at is not null
    or r.firmado_rrhh_at is not null
  ) then
    raise exception 'Las vacaciones ya finalizadas por RR.HH. no se pueden reabrir.';
  end if;

  select p.id,p.rol,p.nombre
    into v_target,v_target_role,v_target_name
  from public.perfiles p
  join public.tipos_perfil_v1517 t on t.codigo=p.rol
  where p.activo=true
    and t.aprueba_administrador=true
    and lower(coalesce(p.email,''))='clagos@stainher.cl'
  order by p.nombre nulls last
  limit 1;

  if v_target is null then
    raise exception 'Cristian Lagos no está disponible como aprobador activo.';
  end if;

  if r.aprobador_user_id=v_target then
    raise exception 'Esta solicitud ya fue aprobada por Cristian Lagos.';
  end if;

  insert into public.auditoria_v15
    (tabla,registro_id,accion,detalle,usuario_id)
  values
    ('solicitudes_v15',r.id::text,'reasignar_aprobada_cristian_r138',
     jsonb_build_object(
       'estado_anterior',r.estado,
       'etapa_anterior',r.etapa,
       'aprobador_anterior_user_id',r.aprobador_user_id,
       'aprobador_anterior_rol',r.aprobador_rol,
       'firmado_aprobador_at_anterior',r.firmado_aprobador_at,
       'resuelto_por_anterior',r.resuelto_por,
       'resuelto_at_anterior',r.resuelto_at,
       'finalizada_at_anterior',r.finalizada_at,
       'nuevo_aprobador_user_id',v_target,
       'nuevo_aprobador_nombre',v_target_name
     ),
     v_uid);

  update public.notificaciones_v15
     set descartada=true,
         resuelta=true,
         leida=true,
         leida_at=coalesce(leida_at,now()),
         resuelta_at=coalesce(resuelta_at,now()),
         resolucion=coalesce(resolucion,'Solicitud aprobada reasignada a Cristian Lagos')
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
   where id=r.id;

  insert into public.notificaciones_v15
    (titulo,mensaje,prioridad,destinatario_user_id,created_by,modulo_destino,referencia_id)
  values
    ('Solicitud aprobada reasignada',
     'Una solicitud previamente aprobada fue reasignada a Cristian Lagos para una nueva revisión.',
     'importante',v_target,v_uid,'solicitudes',r.id::text);

  select * into r
  from public.solicitudes_v15
  where id=r.id;

  return jsonb_build_object(
    'id',r.id::text,
    'tipo',r.tipo,
    'estado',r.estado,
    'etapa',r.etapa,
    'solicitante_user_id',r.solicitante_user_id,
    'aprobador_user_id',r.aprobador_user_id,
    'aprobador_rol',r.aprobador_rol
  );
end;
$function$;

revoke all on function public.reasignar_solicitud_aprobada_cristian_r138(text) from public,anon;
grant execute on function public.reasignar_solicitud_aprobada_cristian_r138(text) to authenticated;
