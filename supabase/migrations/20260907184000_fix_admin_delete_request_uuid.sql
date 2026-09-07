create or replace function public.admin_eliminar_solicitud(p_solicitud_id uuid)
returns jsonb
language plpgsql
security definer
set search_path to 'public', 'auth'
as $function$
declare
  v_rol text;
  v_solicitud public.solicitudes_v15%rowtype;
  v_movimiento public.vacaciones_movimientos%rowtype;
  v_saldo_actual numeric;
  v_saldo_nuevo numeric;
  v_dias_restituidos numeric := 0;
begin
  select lower(coalesce(rol, ''))
  into v_rol
  from public.perfiles
  where id = auth.uid()
    and activo is true;

  if v_rol <> 'administrador' then
    raise exception 'Solo el Administrador puede eliminar solicitudes.';
  end if;

  select *
  into v_solicitud
  from public.solicitudes_v15
  where id = p_solicitud_id
  for update;

  if not found then
    raise exception 'Solicitud no encontrada.';
  end if;

  select *
  into v_movimiento
  from public.vacaciones_movimientos
  where solicitud_id = p_solicitud_id
  for update;

  if found then
    select saldo_vacaciones
    into v_saldo_actual
    from public.perfiles
    where id = v_movimiento.user_id
    for update;

    v_dias_restituidos := coalesce(v_movimiento.dias, 0);
    v_saldo_nuevo := coalesce(v_saldo_actual, 0) + v_dias_restituidos;

    update public.perfiles
    set saldo_vacaciones = v_saldo_nuevo
    where id = v_movimiento.user_id;

    update public.vacaciones_movimientos
    set saldo_anterior = saldo_anterior + v_dias_restituidos,
        saldo_final = saldo_final + v_dias_restituidos
    where user_id = v_movimiento.user_id
      and created_at > v_movimiento.created_at;

    delete from public.vacaciones_movimientos
    where id = v_movimiento.id;
  else
    v_saldo_nuevo := null;
  end if;

  delete from public.turnos_novedades_v15
  where solicitud_id = p_solicitud_id;

  delete from public.notificaciones_v15
  where referencia_id = p_solicitud_id::text
    and lower(coalesce(modulo_destino, '')) in ('solicitudes', 'solicitud', 'vacaciones');

  delete from public.email_envios_v1518
  where referencia_id = p_solicitud_id::text
    and lower(coalesce(modulo, '')) = 'vacaciones';

  delete from public.solicitudes_v15
  where id = p_solicitud_id;

  return jsonb_build_object(
    'ok', true,
    'accion', 'eliminada',
    'dias_restituidos', v_dias_restituidos,
    'saldo_vacaciones', v_saldo_nuevo
  );
end;
$function$;

revoke all on function public.admin_eliminar_solicitud(uuid) from public, anon;
grant execute on function public.admin_eliminar_solicitud(uuid) to authenticated;