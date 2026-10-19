-- R160 · Presupuestos: asignación a GGRR o Estandarización por Estado de Pago.
-- Mantiene una sola asignación por presupuesto. Solo GGRR afecta el monto
-- de gastos reembolsables del EDP; Estandarización conserva trazabilidad
-- al EDP sin modificar dicho total.

alter table public.presupuestos_tecnico_comerciales_v1524
  add column if not exists asignado_edp_at timestamptz,
  add column if not exists asignado_edp_by uuid;

update public.presupuestos_tecnico_comerciales_v1524
set asignado_edp_at=coalesce(asignado_edp_at,asignado_ggrr_at)
where estado_pago_id is not null
  and asignado_edp_at is null
  and asignado_ggrr_at is not null;

create or replace function public.asignar_presupuesto_edp_r160(
  p_presupuesto_id uuid,
  p_estado_pago_id uuid,
  p_tipo_imputacion text
)
returns table(
  presupuesto_id uuid,
  gasto_reembolsable_id uuid,
  estado_pago_id uuid,
  ep_num integer,
  tipo_imputacion text,
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
  v_ggrr_id uuid := null;
  v_monto bigint;
  v_nuevo bigint;
  v_detalle text;
  v_tipo text := lower(trim(coalesce(p_tipo_imputacion,'')));
begin
  if v_uid is null then
    raise exception 'Sesión no válida';
  end if;

  if v_tipo not in ('gasto_reembolsable','estandarizacion') then
    raise exception 'Destino de imputación no válido';
  end if;

  select lower(coalesce(p.rol,''))
    into v_role
  from public.perfiles p
  where p.id=v_uid
    and p.activo=true;

  if v_role not in ('administrador','confiabilidad') then
    raise exception 'Tu perfil no puede asignar presupuestos a Estados de Pago';
  end if;

  if not public.tiene_permiso('contrato','editar') then
    raise exception 'Tu perfil no tiene permiso para editar Administración del Contrato';
  end if;

  select *
    into v_budget
  from public.presupuestos_tecnico_comerciales_v1524
  where id=p_presupuesto_id
  for update;

  if not found then
    raise exception 'Presupuesto no encontrado';
  end if;

  if v_role='confiabilidad' and v_budget.created_by is distinct from v_uid then
    raise exception 'Confiabilidad solo puede asignar presupuestos creados por su propio perfil';
  end if;

  if v_budget.estado_pago_id is not null
     or v_budget.gasto_reembolsable_id is not null
     or v_budget.tipo_imputacion is not null then
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

  v_monto := greatest(0,round(coalesce(v_budget.venta_neta,0))::bigint);
  if v_monto<=0 then
    raise exception 'El presupuesto no tiene un monto neto válido para asignar';
  end if;

  v_nuevo := coalesce(v_ep.gastos_reembolsables,0);

  if v_tipo='gasto_reembolsable' then
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

    v_nuevo := coalesce(v_ep.gastos_reembolsables,0)+v_monto;

    update public.estados_pago
    set gastos_reembolsables=v_nuevo,
        updated_at=now()
    where id=v_ep.id;
  end if;

  update public.presupuestos_tecnico_comerciales_v1524
  set estado_pago_id=v_ep.id,
      gasto_reembolsable_id=v_ggrr_id,
      tipo_imputacion=v_tipo,
      asignado_edp_at=now(),
      asignado_edp_by=v_uid,
      asignado_ggrr_at=case when v_tipo='gasto_reembolsable' then now() else null end,
      asignado_ggrr_by=case when v_tipo='gasto_reembolsable' then v_uid else null end,
      updated_at=now()
  where id=v_budget.id;

  return query
  select
    v_budget.id,
    v_ggrr_id,
    v_ep.id,
    v_ep.ep_num,
    v_tipo,
    v_monto,
    v_nuevo;
end;
$function$;

revoke all on function public.asignar_presupuesto_edp_r160(uuid,uuid,text) from public;
grant execute on function public.asignar_presupuesto_edp_r160(uuid,uuid,text) to authenticated;
