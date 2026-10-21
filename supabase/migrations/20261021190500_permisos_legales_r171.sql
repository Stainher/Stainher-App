-- R171 · Permisos legales personales en Solicitudes:
-- matrimonio/AUC, fallecimiento familiar directo y nacimiento/adopción.

alter table public.solicitudes_v15
  add column if not exists permiso_legal_tipo text,
  add column if not exists permiso_legal_evento text,
  add column if not exists permiso_legal_fecha_evento date,
  add column if not exists permiso_legal_modalidad text,
  add column if not exists permiso_legal_dias integer,
  add column if not exists permiso_legal_unidad text,
  add column if not exists permiso_legal_certificado_estado text,
  add column if not exists permiso_legal_certificado_recibido_at timestamptz,
  add column if not exists permiso_legal_certificado_recibido_por uuid references auth.users(id);

alter table public.solicitudes_v15
  drop constraint if exists solicitudes_v15_permiso_legal_tipo_check;
alter table public.solicitudes_v15
  add constraint solicitudes_v15_permiso_legal_tipo_check
  check (
    permiso_legal_tipo is null
    or permiso_legal_tipo in ('matrimonio_auc','fallecimiento','nacimiento_hijo')
  );

alter table public.solicitudes_v15
  drop constraint if exists solicitudes_v15_permiso_legal_certificado_estado_check;
alter table public.solicitudes_v15
  add constraint solicitudes_v15_permiso_legal_certificado_estado_check
  check (
    permiso_legal_certificado_estado is null
    or permiso_legal_certificado_estado in ('no_aplica','pendiente','recibido')
  );

create or replace function public.crear_solicitud_legal_r171(
  p_tipo text,
  p_fecha_inicio date,
  p_fecha_fin date,
  p_comentario text,
  p_permiso_legal_tipo text,
  p_permiso_legal_evento text,
  p_permiso_legal_fecha_evento date,
  p_permiso_legal_modalidad text default null,
  p_permiso_legal_dias integer default null,
  p_permiso_legal_unidad text default null,
  p_permiso_legal_certificado_estado text default null,
  p_aprobador_user_id uuid default null
)
returns jsonb
language plpgsql
security definer
set search_path='public'
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
  returning id into v_id;

  return jsonb_build_object(
    'id',v_id::text,'tipo',p_tipo,'estado','pendiente','etapa','aprobador',
    'solicitante_user_id',v_uid,'solicitante_rol',v_role,
    'aprobador_user_id',v_approver,'aprobador_rol',v_approver_role
  );
end;
$function$;

revoke all on function public.crear_solicitud_legal_r171(text,date,date,text,text,text,date,text,integer,text,text,uuid) from public,anon;
grant execute on function public.crear_solicitud_legal_r171(text,date,date,text,text,text,date,text,integer,text,text,uuid) to authenticated;

create or replace function public.marcar_certificado_permiso_legal_r171(p_id text)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_role text := lower(coalesce(public.mi_rol(),''));
  r public.solicitudes_v15%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.'; end if;
  if v_role not in ('administrador','recursos_humanos') then
    raise exception 'Solo Administración o Recursos Humanos puede registrar la recepción del certificado.';
  end if;
  select * into r from public.solicitudes_v15 where id::text=p_id for update;
  if not found then raise exception 'Solicitud no encontrada.'; end if;
  if coalesce(r.permiso_legal_certificado_estado,'no_aplica')='no_aplica' then
    raise exception 'Esta solicitud no requiere control de certificado.';
  end if;
  update public.solicitudes_v15
     set permiso_legal_certificado_estado='recibido',
         permiso_legal_certificado_recibido_at=now(),
         permiso_legal_certificado_recibido_por=v_uid
   where id::text=p_id;
  return jsonb_build_object('id',p_id,'estado','recibido');
end;
$function$;

revoke all on function public.marcar_certificado_permiso_legal_r171(text) from public,anon;
grant execute on function public.marcar_certificado_permiso_legal_r171(text) to authenticated;

-- La aprobación de permisos legales registra una novedad operacional una sola vez.
create or replace function public.registrar_permiso_legal_turno_r171()
returns trigger
language plpgsql
security definer
set search_path='public'
as $function$
declare
  v_motivo text;
begin
  if new.estado='aprobada'
     and old.estado is distinct from 'aprobada'
     and new.tipo in ('permiso_matrimonio','permiso_fallecimiento','permiso_nacimiento') then
    v_motivo := case new.tipo
      when 'permiso_matrimonio' then 'Permiso pagado por matrimonio / AUC'
      when 'permiso_fallecimiento' then 'Permiso pagado por fallecimiento familiar'
      when 'permiso_nacimiento' then 'Permiso pagado por nacimiento de hijo'
      else 'Permiso legal pagado'
    end;
    insert into public.turnos_novedades_v15(
      user_id,tipo,fecha_inicio,fecha_fin,cantidad,unidad,motivo,
      anio,mes,aprobado_por,created_by,solicitud_id,observacion
    ) values (
      new.solicitante_user_id,'permiso',new.fecha_inicio,new.fecha_fin,
      coalesce(new.permiso_legal_dias,1),coalesce(new.permiso_legal_unidad,'días'),
      v_motivo,extract(year from new.fecha_inicio)::int,extract(month from new.fecha_inicio)::int,
      new.resuelto_por,new.resuelto_por,new.id,
      coalesce(new.comentario,'')
    )
    on conflict(solicitud_id) where solicitud_id is not null do nothing;
  end if;
  return new;
end;
$function$;

drop trigger if exists trg_registrar_permiso_legal_turno_r171 on public.solicitudes_v15;
create trigger trg_registrar_permiso_legal_turno_r171
after update of estado on public.solicitudes_v15
for each row execute function public.registrar_permiso_legal_turno_r171();
