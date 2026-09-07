alter table public.solicitudes_v15
  add column if not exists justificativo_cuerpo text;

create or replace function public.crear_justificativo_firmado_v1524(
  p_fecha date,
  p_institucion text,
  p_motivo text,
  p_texto text default null,
  p_firma text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_name text;
  v_rrhh uuid;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.'; end if;

  select lower(p.rol), nullif(btrim(p.nombre), '')
    into v_role, v_name
  from public.perfiles p
  where p.id = v_uid and p.activo = true;

  if v_name is null then raise exception 'Tu perfil no tiene un nombre registrado.'; end if;
  if v_role not in ('tecnico', 'supervisor') then
    raise exception 'Solo Técnicos y Supervisores pueden solicitar justificativos laborales.';
  end if;
  if p_fecha is null then raise exception 'Debes seleccionar la fecha que se justificará.'; end if;
  if length(btrim(coalesce(p_institucion, ''))) not between 2 and 180 then
    raise exception 'Indica la institución o destinatario (2 a 180 caracteres).';
  end if;
  if length(coalesce(p_motivo, '')) > 1500 then
    raise exception 'La descripción opcional no puede superar 1500 caracteres.';
  end if;
  if length(coalesce(p_texto, '')) > 2000 then
    raise exception 'El antecedente complementario no puede superar 2000 caracteres.';
  end if;

  select p.id into v_rrhh
  from public.perfiles p
  where p.activo = true and lower(p.rol) = 'recursos_humanos'
  order by p.nombre nulls last, p.id
  limit 1;
  if v_rrhh is null then
    raise exception 'No existe un perfil activo de Recursos Humanos para visar el justificativo.';
  end if;

  insert into public.solicitudes_v15
    (tipo, fecha_inicio, fecha_fin, comentario, estado, etapa,
     solicitante_user_id, solicitante_nombre, solicitante_rol, created_by,
     aprobador_user_id, aprobador_rol, rrhh_user_id,
     justificativo_institucion, justificativo_texto,
     firma_solicitante, firmado_solicitante_at)
  values
    ('justificativo', p_fecha, p_fecha, nullif(btrim(coalesce(p_motivo, '')), ''), 'pendiente_rrhh', 'rrhh',
     v_uid, v_name, v_role, v_uid,
     v_rrhh, 'recursos_humanos', v_rrhh,
     btrim(p_institucion), nullif(btrim(coalesce(p_texto, '')), ''),
     null, null)
  returning id into v_id;

  insert into public.notificaciones_v15
    (titulo, mensaje, prioridad, destinatario_user_id, created_by, modulo_destino, referencia_id)
  values
    ('Justificativo laboral pendiente de visado',
     v_name || ' · ' || to_char(p_fecha, 'DD-MM-YYYY') || ' · ' || btrim(p_institucion),
     'importante', v_rrhh, v_uid, 'solicitudes', v_id::text);

  return jsonb_build_object(
    'id', v_id::text, 'tipo', 'justificativo', 'estado', 'pendiente_rrhh', 'etapa', 'rrhh',
    'solicitante_user_id', v_uid, 'solicitante_nombre', v_name, 'solicitante_rol', v_role,
    'aprobador_user_id', v_rrhh, 'aprobador_rol', 'recursos_humanos', 'rrhh_user_id', v_rrhh
  );
end;
$$;

create or replace function public.editar_y_resolver_justificativo_v1524(
  p_id text,
  p_accion text,
  p_motivo text default null,
  p_institucion text default null,
  p_cuerpo text default null
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  r public.solicitudes_v15%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.'; end if;
  select lower(p.rol) into v_role
  from public.perfiles p
  where p.id = v_uid and p.activo = true;
  if v_role <> 'recursos_humanos' then
    raise exception 'Solo Recursos Humanos puede editar o resolver justificativos.';
  end if;

  select * into r
  from public.solicitudes_v15
  where id::text = p_id
  for update;
  if not found or r.tipo <> 'justificativo' then raise exception 'Justificativo no encontrado.'; end if;
  if r.estado <> 'pendiente_rrhh' or r.etapa <> 'rrhh' then raise exception 'El justificativo ya fue resuelto.'; end if;
  if r.rrhh_user_id is distinct from v_uid then raise exception 'Este justificativo está asignado a otro perfil de Recursos Humanos.'; end if;

  if lower(p_accion) = 'visar' then
    if length(btrim(coalesce(p_institucion, ''))) not between 2 and 180 then
      raise exception 'Indica la institución destinataria.';
    end if;
    if length(btrim(coalesce(p_cuerpo, ''))) not between 80 and 4000 then
      raise exception 'El texto del certificado debe contener entre 80 y 4000 caracteres.';
    end if;
    update public.solicitudes_v15
       set justificativo_institucion = btrim(p_institucion),
           justificativo_cuerpo = btrim(p_cuerpo),
           estado = 'aprobada', etapa = 'finalizada',
           firma_rrhh = null, firmado_rrhh_at = null,
           justificativo_emitido_at = now(), resuelto_por = v_uid,
           resuelto_at = now(), finalizada_at = now()
     where id::text = p_id;
  elsif lower(p_accion) = 'rechazar' then
    if length(btrim(coalesce(p_motivo, ''))) < 5 then raise exception 'Debes indicar el motivo del rechazo.'; end if;
    update public.solicitudes_v15
       set estado = 'rechazada', etapa = 'finalizada', motivo_rechazo = btrim(p_motivo),
           resuelto_por = v_uid, resuelto_at = now(), finalizada_at = now()
     where id::text = p_id;
  else
    raise exception 'Acción de justificativo no válida.';
  end if;

  update public.notificaciones_v15
     set descartada = true, resuelta = true, leida = true, leida_at = coalesce(leida_at, now()),
         resuelta_at = coalesce(resuelta_at, now()),
         resolucion = case when lower(p_accion) = 'visar' then 'Justificativo emitido' else 'Justificativo rechazado' end
   where referencia_id = p_id and lower(coalesce(modulo_destino, '')) = 'solicitudes'
     and coalesce(descartada, false) = false;

  insert into public.notificaciones_v15
    (titulo, mensaje, prioridad, destinatario_user_id, created_by, modulo_destino, referencia_id)
  values
    (case when lower(p_accion) = 'visar' then 'Justificativo laboral emitido' else 'Justificativo laboral rechazado' end,
     case when lower(p_accion) = 'visar' then 'Tu documento ya está disponible para descargar.' else btrim(p_motivo) end,
     case when lower(p_accion) = 'visar' then 'normal' else 'importante' end,
     r.solicitante_user_id, v_uid, 'solicitudes', p_id);

  select * into r from public.solicitudes_v15 where id::text = p_id;
  return jsonb_build_object(
    'id', r.id::text, 'tipo', r.tipo, 'estado', r.estado, 'etapa', r.etapa,
    'solicitante_user_id', r.solicitante_user_id, 'solicitante_nombre', r.solicitante_nombre,
    'rrhh_user_id', r.rrhh_user_id, 'justificativo_institucion', r.justificativo_institucion,
    'justificativo_cuerpo', r.justificativo_cuerpo, 'justificativo_emitido_at', r.justificativo_emitido_at
  );
end;
$$;

revoke all on function public.crear_justificativo_firmado_v1524(date, text, text, text, text) from public, anon;
grant execute on function public.crear_justificativo_firmado_v1524(date, text, text, text, text) to authenticated;
revoke all on function public.editar_y_resolver_justificativo_v1524(text, text, text, text, text) from public, anon;
grant execute on function public.editar_y_resolver_justificativo_v1524(text, text, text, text, text) to authenticated;
