-- R154 · Detalle de ítems de Presupuestos en Gastos Reembolsables.
-- Usa los ítems/materiales del presupuesto en la tabla GGRR y en el informe PDF.
-- Solo normaliza registros cuyo detalle actual es el texto genérico de R152.

create or replace function public.presupuesto_detalle_ggrr_r154(
  p_materiales jsonb,
  p_fletes jsonb,
  p_observacion text,
  p_codigo text
)
returns text
language plpgsql
immutable
as $function$
declare
  v_detail text := '';
  v_line text;
  v_qty numeric;
  v_unit text;
  v_name text;
begin
  for v_name,v_qty,v_unit in
    select
      nullif(trim(x->>'detalle'),''),
      coalesce(nullif(x->>'cantidad','')::numeric,0),
      nullif(trim(x->>'unidad'),'')
    from jsonb_array_elements(coalesce(p_materiales,'[]'::jsonb)) x
  loop
    if v_name is null then
      continue;
    end if;
    v_line := v_name;
    if v_qty > 0 then
      if lower(coalesce(v_unit,''))='unidad' then
        v_line := v_line || ' (' ||
          case when trunc(v_qty)=v_qty then trunc(v_qty)::bigint::text else trim(to_char(v_qty,'FM999999990.##')) end ||
          case when v_qty=1 then ' unidad)' else ' unidades)' end;
      elsif coalesce(v_unit,'')<>'' then
        v_line := v_line || ' (' ||
          case when trunc(v_qty)=v_qty then trunc(v_qty)::bigint::text else trim(to_char(v_qty,'FM999999990.##')) end ||
          ' ' || v_unit || ')';
      else
        v_line := v_line || ' (' ||
          case when trunc(v_qty)=v_qty then trunc(v_qty)::bigint::text else trim(to_char(v_qty,'FM999999990.##')) end ||
          ')';
      end if;
    end if;
    v_detail := v_detail || case when v_detail='' then '' else E'\n' end || v_line;
  end loop;

  for v_name,v_qty in
    select
      nullif(trim(x->>'detalle'),''),
      coalesce(nullif(x->>'cantidad','')::numeric,0)
    from jsonb_array_elements(coalesce(p_fletes,'[]'::jsonb)) x
  loop
    if v_name is null then
      continue;
    end if;
    v_line := v_name;
    if v_qty > 0 then
      v_line := v_line || ' (' ||
        case when trunc(v_qty)=v_qty then trunc(v_qty)::bigint::text else trim(to_char(v_qty,'FM999999990.##')) end ||
        case when v_qty=1 then ' unidad)' else ' unidades)' end;
    end if;
    v_detail := v_detail || case when v_detail='' then '' else E'\n' end || v_line;
  end loop;

  if trim(v_detail)<>'' then
    return v_detail;
  end if;

  if nullif(trim(coalesce(p_observacion,'')),'') is not null then
    return trim(p_observacion);
  end if;

  return 'Presupuesto técnico comercial · ' || coalesce(p_codigo,'');
end;
$function$;

-- Normaliza únicamente los GGRR generados con el texto genérico de R152.
update public.gastos_reembolsables g
set detalle=public.presupuesto_detalle_ggrr_r154(
      p.materiales,
      p.fletes,
      p.observacion,
      p.codigo
    ),
    updated_at=now()
from public.presupuestos_tecnico_comerciales_v1524 p
where p.gasto_reembolsable_id=g.id
  and g.detalle='Presupuesto técnico comercial · ' || p.codigo;

create or replace function public.asignar_presupuesto_ggrr_r152(
  p_presupuesto_id uuid,
  p_estado_pago_id uuid
)
returns table(
  presupuesto_id uuid,
  gasto_reembolsable_id uuid,
  estado_pago_id uuid,
  ep_num integer,
  monto_neto bigint,
  nuevo_total_ggrr bigint
)
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_budget public.presupuestos_tecnico_comerciales_v1524%rowtype;
  v_ep public.estados_pago%rowtype;
  v_ggrr_id uuid;
  v_monto bigint;
  v_nuevo bigint;
  v_detalle text;
begin
  if v_uid is null then
    raise exception 'Sesión no válida';
  end if;

  select lower(coalesce(p.rol,''))
    into v_role
  from public.perfiles p
  where p.id=v_uid
    and p.activo=true;

  if v_role not in ('administrador','confiabilidad') then
    raise exception 'Tu perfil no puede asignar presupuestos a Gastos Reembolsables';
  end if;

  select *
    into v_budget
  from public.presupuestos_tecnico_comerciales_v1524
  where id=p_presupuesto_id
  for update;

  if not found then
    raise exception 'Presupuesto no encontrado';
  end if;

  if v_role = 'confiabilidad' and v_budget.created_by is distinct from v_uid then
    raise exception 'Confiabilidad solo puede asignar presupuestos creados por su propio perfil';
  end if;

  if not public.tiene_permiso('contrato','editar') then
    raise exception 'Tu perfil no tiene permiso para editar Administración del Contrato';
  end if;

  if v_budget.gasto_reembolsable_id is not null or v_budget.estado_pago_id is not null then
    raise exception 'Este presupuesto ya está asignado a un Estado de Pago';
  end if;

  select *
    into v_ep
  from public.estados_pago
  where id=p_estado_pago_id
  for update;

  if not found then
    raise exception 'Estado de Pago no encontrado';
  end if;

  v_monto := greatest(0, round(coalesce(v_budget.venta_neta,0))::bigint);

  if v_monto <= 0 then
    raise exception 'El presupuesto no tiene un monto neto válido para asignar';
  end if;

  v_detalle := public.presupuesto_detalle_ggrr_r154(
    v_budget.materiales,
    v_budget.fletes,
    v_budget.observacion,
    v_budget.codigo
  );

  insert into public.gastos_reembolsables(
    ep_num,
    anio_edp,
    mes_edp,
    codigo_documento,
    tipo_documento,
    equipo,
    fecha_documento,
    detalle,
    monto_detalle,
    estado,
    enlace,
    created_at,
    updated_at
  )
  values(
    v_ep.ep_num,
    v_ep.anio_edp,
    v_ep.mes_edp,
    v_budget.codigo,
    'Presupuesto técnico comercial',
    v_budget.equipo_nombre,
    v_budget.fecha,
    v_detalle,
    v_monto,
    'APROBADO',
    null,
    now(),
    now()
  )
  returning id into v_ggrr_id;

  v_nuevo := coalesce(v_ep.gastos_reembolsables,0) + v_monto;

  update public.estados_pago
  set gastos_reembolsables=v_nuevo,
      updated_at=now()
  where id=v_ep.id;

  update public.presupuestos_tecnico_comerciales_v1524
  set estado_pago_id=v_ep.id,
      gasto_reembolsable_id=v_ggrr_id,
      asignado_ggrr_at=now(),
      asignado_ggrr_by=v_uid,
      tipo_imputacion=coalesce(tipo_imputacion,'gasto_reembolsable'),
      updated_at=now()
  where id=v_budget.id;

  return query
  select
    v_budget.id,
    v_ggrr_id,
    v_ep.id,
    v_ep.ep_num,
    v_monto,
    v_nuevo;
end;
$function$;

revoke all on function public.presupuesto_detalle_ggrr_r154(jsonb,jsonb,text,text) from public;
grant execute on function public.presupuesto_detalle_ggrr_r154(jsonb,jsonb,text,text) to authenticated, service_role;

revoke all on function public.asignar_presupuesto_ggrr_r152(uuid,uuid) from public;
grant execute on function public.asignar_presupuesto_ggrr_r152(uuid,uuid) to authenticated;
