create or replace function public.obtener_firmantes_solicitud_v1524(p_id text)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  r public.solicitudes_v15%rowtype;
  v_solicitante_nombre text;
  v_aprobador_nombre text;
  v_aprobador_email text;
  v_rrhh_nombre text;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión.';
  end if;

  select lower(coalesce(p.rol, '')) into v_role
  from public.perfiles p
  where p.id = v_uid and p.activo is true;

  select * into r
  from public.solicitudes_v15
  where id::text = p_id;

  if not found then
    raise exception 'Solicitud no encontrada.';
  end if;

  if v_uid is distinct from r.solicitante_user_id
     and v_uid is distinct from r.aprobador_user_id
     and v_uid is distinct from r.rrhh_user_id
     and v_role <> 'administrador' then
    raise exception 'No tienes autorización para consultar los firmantes de esta solicitud.';
  end if;

  select nullif(btrim(p.nombre), '') into v_solicitante_nombre
  from public.perfiles p where p.id = r.solicitante_user_id;

  select nullif(btrim(p.nombre), ''), p.email
    into v_aprobador_nombre, v_aprobador_email
  from public.perfiles p where p.id = r.aprobador_user_id;

  select nullif(btrim(p.nombre), '') into v_rrhh_nombre
  from public.perfiles p where p.id = r.rrhh_user_id;

  return jsonb_build_object(
    'solicitante_nombre', coalesce(v_solicitante_nombre, nullif(btrim(r.solicitante_nombre), '')),
    'aprobador_nombre', v_aprobador_nombre,
    'aprobador_email', v_aprobador_email,
    'rrhh_nombre', v_rrhh_nombre
  );
end;
$$;

revoke all on function public.obtener_firmantes_solicitud_v1524(text) from public;
revoke all on function public.obtener_firmantes_solicitud_v1524(text) from anon;
grant execute on function public.obtener_firmantes_solicitud_v1524(text) to authenticated;
