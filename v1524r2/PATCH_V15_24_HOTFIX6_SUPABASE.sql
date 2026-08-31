-- Stainher App V15.24 Hotfix 6
-- Consolida correcciones de correo y flujo Vacaciones -> Gerente -> RR.HH.

grant select on table public.perfiles to service_role;
grant select on table public.correo_config_v155 to service_role;

create or replace function public.seleccionar_aprobador_solicitud_v1522(
  p_id uuid,
  p_aprobador_id uuid
)
returns public.solicitudes_v15
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_request public.solicitudes_v15;
  v_role text;
begin
  if auth.uid() is null then raise exception 'Sesión no válida'; end if;
  select lower(coalesce(rol,'')) into v_role from public.perfiles where id=auth.uid() and activo=true;
  if v_role <> 'administrador' then raise exception 'Solo el Administrador puede seleccionar Gerente'; end if;
  if not exists(select 1 from public.perfiles where id=p_aprobador_id and activo=true and lower(rol)='gerente') then raise exception 'El Gerente seleccionado no está activo'; end if;
  update public.solicitudes_v15
     set aprobador_user_id=p_aprobador_id, aprobador_rol='gerente'
   where id=p_id and solicitante_user_id=auth.uid() and tipo='vacaciones' and estado='pendiente'
  returning * into v_request;
  if v_request.id is null then raise exception 'Solicitud no encontrada o no editable'; end if;
  update public.notificaciones_v15
     set descartada=true,resuelta=true,leida=true,leida_at=coalesce(leida_at,now()),resuelta_at=coalesce(resuelta_at,now()),resolucion=coalesce(resolucion,'Reasignada a otro Gerente')
   where referencia_id=p_id::text and lower(coalesce(modulo_destino,''))='solicitudes' and coalesce(descartada,false)=false;
  insert into public.notificaciones_v15(titulo,mensaje,prioridad,destinatario_user_id,created_by,modulo_destino,referencia_id)
  values('Nueva solicitud',coalesce((select nombre from public.perfiles where id=auth.uid()),'Administrador') || ' · Vacaciones','importante',p_aprobador_id,auth.uid(),'solicitudes',p_id::text);
  return v_request;
end;
$$;

create or replace function public.resolver_solicitud_v1517(
  p_id text,
  p_accion text,
  p_motivo text default null::text,
  p_firma text default null::text
)
returns jsonb
language plpgsql
security definer
set search_path to 'public'
as $$
declare
  v_uid uuid := auth.uid();
  v_role text := public.mi_rol();
  r public.solicitudes_v15%rowtype;
  v_rrhh uuid;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.'; end if;
  select * into r from public.solicitudes_v15 where id::text=p_id for update;
  if not found then raise exception 'Solicitud no encontrada.'; end if;
  if r.estado in ('aprobada','rechazada') or r.etapa='finalizada' then raise exception 'La solicitud ya fue finalizada.'; end if;
  if lower(p_accion)='rechazar' then
    if r.etapa<>'aprobador' or r.aprobador_user_id is distinct from v_uid then raise exception 'No eres el aprobador asignado a esta solicitud.'; end if;
    if btrim(coalesce(p_motivo,''))='' then raise exception 'Debes indicar el motivo del rechazo.'; end if;
    update public.solicitudes_v15 set estado='rechazada',etapa='finalizada',motivo_rechazo=p_motivo,resuelto_por=v_uid,resuelto_at=now(),finalizada_at=now() where id::text=p_id;
  elsif lower(p_accion)='aprobar' and r.etapa='aprobador' then
    if r.aprobador_user_id is distinct from v_uid then raise exception 'No eres el aprobador asignado a esta solicitud.'; end if;
    if r.tipo='vacaciones' then
      if p_firma is null or length(p_firma)<20 then raise exception 'La aprobación de vacaciones requiere firma.'; end if;
      select id into v_rrhh from public.perfiles where activo=true and lower(rol)='recursos_humanos' order by nombre nulls last,id limit 1;
      if v_rrhh is null then raise exception 'No existe un usuario de Recursos Humanos activo para completar las vacaciones.'; end if;
      update public.solicitudes_v15 set estado='pendiente_rrhh',etapa='rrhh',firma_aprobador=p_firma,firmado_aprobador_at=now(),rrhh_user_id=v_rrhh,resuelto_por=v_uid,resuelto_at=now() where id::text=p_id;
      update public.notificaciones_v15 set descartada=true,resuelta=true,leida=true,leida_at=coalesce(leida_at,now()),resuelta_at=coalesce(resuelta_at,now()),resolucion=coalesce(resolucion,'Aprobada por Gerente') where referencia_id=p_id and lower(coalesce(modulo_destino,''))='solicitudes' and coalesce(descartada,false)=false;
      insert into public.notificaciones_v15(titulo,mensaje,prioridad,destinatario_user_id,created_by,modulo_destino,referencia_id)
      select 'Vacaciones pendientes de firma RR.HH.','Solicitud aprobada jerárquicamente · '||p_id,'importante',v_rrhh,v_uid,'solicitudes',p_id
      where not exists(select 1 from public.notificaciones_v15 n where n.referencia_id=p_id and lower(coalesce(n.modulo_destino,''))='solicitudes' and n.destinatario_user_id=v_rrhh and coalesce(n.descartada,false)=false and coalesce(n.resuelta,false)=false);
    else
      update public.solicitudes_v15 set estado='aprobada',etapa='finalizada',resuelto_por=v_uid,resuelto_at=now(),finalizada_at=now() where id::text=p_id;
    end if;
  elsif lower(p_accion) in ('aprobar','firmar_rrhh') and r.etapa='rrhh' then
    if v_role<>'recursos_humanos' then raise exception 'Solo Recursos Humanos puede realizar la validación final.'; end if;
    if r.tipo<>'vacaciones' then raise exception 'La firma de RRHH aplica únicamente a vacaciones.'; end if;
    if p_firma is null or length(p_firma)<20 then raise exception 'La validación de RRHH requiere firma.'; end if;
    if r.rrhh_user_id is not null and r.rrhh_user_id is distinct from v_uid then raise exception 'Esta solicitud está asignada a otro usuario de Recursos Humanos.'; end if;
    update public.solicitudes_v15 set estado='aprobada',etapa='finalizada',firma_rrhh=p_firma,firmado_rrhh_at=now(),rrhh_user_id=v_uid,resuelto_por=v_uid,resuelto_at=now(),finalizada_at=now() where id::text=p_id;
    insert into public.turnos_novedades_v15(user_id,tipo,fecha_inicio,fecha_fin,cantidad,unidad,motivo,anio,mes,aprobado_por,created_by,solicitud_id)
    select s.solicitante_user_id,'vacaciones',s.fecha_inicio,s.fecha_fin,1,'período','Vacaciones aprobadas · Solicitud '||s.id::text,extract(year from s.fecha_inicio)::int,extract(month from s.fecha_inicio)::int,v_uid,v_uid,s.id::text from public.solicitudes_v15 s where s.id::text=p_id
    on conflict(solicitud_id) where solicitud_id is not null do nothing;
    update public.notificaciones_v15 set descartada=true,resuelta=true,leida=true,leida_at=coalesce(leida_at,now()),resuelta_at=coalesce(resuelta_at,now()),resolucion=coalesce(resolucion,'Firmada por RR.HH.') where referencia_id=p_id and lower(coalesce(modulo_destino,''))='solicitudes' and coalesce(descartada,false)=false;
  else
    raise exception 'La acción no corresponde a la etapa actual de la solicitud.';
  end if;
  select * into r from public.solicitudes_v15 where id::text=p_id;
  return jsonb_build_object('id',r.id::text,'tipo',r.tipo,'estado',r.estado,'etapa',r.etapa,'solicitante_user_id',r.solicitante_user_id,'aprobador_user_id',r.aprobador_user_id,'aprobador_rol',r.aprobador_rol,'rrhh_user_id',r.rrhh_user_id);
end;
$$;

create or replace function public.asignar_rrhh_solicitud_v1519(p_id uuid)
returns public.solicitudes_v15
language plpgsql
security definer
set search_path to ''
as $$
declare
  v_request public.solicitudes_v15;
  v_rrhh uuid;
begin
  if auth.uid() is null then raise exception 'Sesión no válida'; end if;
  select * into v_request from public.solicitudes_v15 where id=p_id and aprobador_user_id=auth.uid() and tipo='vacaciones' and estado='pendiente_rrhh' for update;
  if v_request.id is null then raise exception 'Solicitud no autorizada para este aprobador'; end if;
  if v_request.rrhh_user_id is null or not exists(select 1 from public.perfiles p where p.id=v_request.rrhh_user_id and p.activo=true and lower(p.rol)='recursos_humanos') then
    select id into v_rrhh from public.perfiles where activo=true and lower(rol)='recursos_humanos' order by nombre nulls last,id limit 1;
    if v_rrhh is null then raise exception 'No existe un usuario activo de Recursos Humanos'; end if;
    update public.solicitudes_v15 set rrhh_user_id=v_rrhh where id=p_id returning * into v_request;
  end if;
  update public.notificaciones_v15 set descartada=true,resuelta=true,leida=true,leida_at=coalesce(leida_at,now()),resuelta_at=coalesce(resuelta_at,now()),resolucion=coalesce(resolucion,'Aprobada por Gerente') where referencia_id=p_id::text and lower(coalesce(modulo_destino,''))='solicitudes' and destinatario_user_id=auth.uid() and coalesce(descartada,false)=false;
  insert into public.notificaciones_v15(titulo,mensaje,prioridad,destinatario_user_id,created_by,modulo_destino,referencia_id)
  select 'Vacaciones pendientes de firma RR.HH.','Solicitud aprobada jerárquicamente · '||p_id::text,'importante',v_request.rrhh_user_id,auth.uid(),'solicitudes',p_id::text
  where not exists(select 1 from public.notificaciones_v15 n where n.referencia_id=p_id::text and lower(coalesce(n.modulo_destino,''))='solicitudes' and n.destinatario_user_id=v_request.rrhh_user_id and coalesce(n.descartada,false)=false and coalesce(n.resuelta,false)=false);
  return v_request;
end;
$$;

do $$
declare v_rrhh uuid;
begin
  select id into v_rrhh from public.perfiles where activo=true and lower(rol)='recursos_humanos' order by nombre nulls last,id limit 1;
  if v_rrhh is not null then
    update public.solicitudes_v15 set rrhh_user_id=v_rrhh where tipo='vacaciones' and estado='pendiente_rrhh' and etapa='rrhh' and rrhh_user_id is null;
    insert into public.notificaciones_v15(titulo,mensaje,prioridad,destinatario_user_id,created_by,modulo_destino,referencia_id)
    select 'Vacaciones pendientes de firma RR.HH.','Solicitud pendiente de validación RR.HH. · '||s.id::text,'importante',v_rrhh,coalesce(s.resuelto_por,s.created_by,s.solicitante_user_id),'solicitudes',s.id::text
      from public.solicitudes_v15 s
     where s.tipo='vacaciones' and s.estado='pendiente_rrhh' and s.etapa='rrhh' and s.rrhh_user_id=v_rrhh
       and not exists(select 1 from public.notificaciones_v15 n where n.referencia_id=s.id::text and lower(coalesce(n.modulo_destino,''))='solicitudes' and n.destinatario_user_id=v_rrhh and coalesce(n.descartada,false)=false and coalesce(n.resuelta,false)=false);
  end if;
end;
$$;
