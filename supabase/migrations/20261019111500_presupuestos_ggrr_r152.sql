-- R152 · Presupuestos -> Gastos Reembolsables por Estado de Pago.
-- Agrega trazabilidad de asignación y una RPC transaccional para evitar duplicados.

alter table public.presupuestos_tecnico_comerciales_v1524
  add column if not exists estado_pago_id uuid references public.estados_pago(id) on delete set null,
  add column if not exists gasto_reembolsable_id uuid references public.gastos_reembolsables(id) on delete set null,
  add column if not exists asignado_ggrr_at timestamptz,
  add column if not exists asignado_ggrr_by uuid;

create index if not exists presupuestos_v1524_estado_pago_idx
  on public.presupuestos_tecnico_comerciales_v1524(estado_pago_id);

create unique index if not exists presupuestos_v1524_gasto_reemb_unique
  on public.presupuestos_tecnico_comerciales_v1524(gasto_reembolsable_id)
  where gasto_reembolsable_id is not null;

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
    'Presupuesto técnico comercial · ' || v_budget.codigo,
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

revoke all on function public.asignar_presupuesto_ggrr_r152(uuid,uuid) from public;
grant execute on function public.asignar_presupuesto_ggrr_r152(uuid,uuid) to authenticated;
