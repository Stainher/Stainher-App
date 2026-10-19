-- R166 · Sincronización automática de presupuestos ya asignados al Estado de Pago.
-- Si se edita un presupuesto imputado a GGRR, actualiza el documento GGRR vinculado
-- y ajusta el total reconocido del EDP solo por la diferencia entre monto anterior y nuevo.
-- Estandarización se mantiene dinámica desde el propio presupuesto.

create or replace function public.sync_presupuesto_asignado_r166()
returns trigger
language plpgsql
security definer
set search_path = public
as $function$
declare
  v_ggrr public.gastos_reembolsables%rowtype;
  v_ep public.estados_pago%rowtype;
  v_nuevo_monto bigint;
  v_delta bigint;
  v_detalle text;
begin
  if new.tipo_imputacion is distinct from 'gasto_reembolsable'
     or new.estado_pago_id is null
     or new.gasto_reembolsable_id is null then
    return new;
  end if;

  select *
    into v_ggrr
  from public.gastos_reembolsables
  where id=new.gasto_reembolsable_id
  for update;

  if not found then
    return new;
  end if;

  select *
    into v_ep
  from public.estados_pago
  where id=new.estado_pago_id
  for update;

  if not found then
    return new;
  end if;

  v_nuevo_monto := greatest(0,round(coalesce(new.venta_neta,0))::bigint);
  v_delta := v_nuevo_monto - coalesce(v_ggrr.monto_detalle,0)::bigint;
  v_detalle := public.presupuesto_detalle_ggrr_r154(
    new.materiales,
    new.fletes,
    new.observacion,
    new.codigo
  );

  update public.gastos_reembolsables
  set ep_num=v_ep.ep_num,
      anio_edp=v_ep.anio_edp,
      mes_edp=v_ep.mes_edp,
      codigo_documento=new.codigo,
      tipo_documento='Presupuesto técnico comercial',
      equipo=new.equipo_nombre,
      fecha_documento=new.fecha,
      detalle=v_detalle,
      monto_detalle=v_nuevo_monto,
      updated_at=now()
  where id=v_ggrr.id;

  if v_delta<>0 then
    update public.estados_pago
    set gastos_reembolsables=greatest(0,coalesce(gastos_reembolsables,0)+v_delta),
        updated_at=now()
    where id=v_ep.id;
  end if;

  return new;
end;
$function$;

drop trigger if exists trg_sync_presupuesto_asignado_r166
on public.presupuestos_tecnico_comerciales_v1524;

create trigger trg_sync_presupuesto_asignado_r166
after update of
  venta_neta,
  codigo,
  equipo_nombre,
  fecha,
  materiales,
  fletes,
  observacion,
  estado_pago_id,
  gasto_reembolsable_id,
  tipo_imputacion
on public.presupuestos_tecnico_comerciales_v1524
for each row
execute function public.sync_presupuesto_asignado_r166();

-- Corrección inicial: sincroniza los presupuestos GGRR ya asignados que puedan
-- haber sido editados antes de instalar el trigger. El EDP solo se mueve por delta.
do $block$
declare
  r record;
  v_nuevo_monto bigint;
  v_delta bigint;
  v_detalle text;
begin
  for r in
    select
      p.id as presupuesto_id,
      p.codigo,
      p.equipo_nombre,
      p.fecha,
      p.materiales,
      p.fletes,
      p.observacion,
      p.venta_neta,
      p.estado_pago_id,
      p.gasto_reembolsable_id,
      g.monto_detalle as monto_anterior,
      e.ep_num,
      e.anio_edp,
      e.mes_edp
    from public.presupuestos_tecnico_comerciales_v1524 p
    join public.gastos_reembolsables g on g.id=p.gasto_reembolsable_id
    join public.estados_pago e on e.id=p.estado_pago_id
    where p.tipo_imputacion='gasto_reembolsable'
  loop
    v_nuevo_monto := greatest(0,round(coalesce(r.venta_neta,0))::bigint);
    v_delta := v_nuevo_monto - coalesce(r.monto_anterior,0)::bigint;
    v_detalle := public.presupuesto_detalle_ggrr_r154(
      r.materiales,
      r.fletes,
      r.observacion,
      r.codigo
    );

    update public.gastos_reembolsables
    set ep_num=r.ep_num,
        anio_edp=r.anio_edp,
        mes_edp=r.mes_edp,
        codigo_documento=r.codigo,
        tipo_documento='Presupuesto técnico comercial',
        equipo=r.equipo_nombre,
        fecha_documento=r.fecha,
        detalle=v_detalle,
        monto_detalle=v_nuevo_monto,
        updated_at=now()
    where id=r.gasto_reembolsable_id;

    if v_delta<>0 then
      update public.estados_pago
      set gastos_reembolsables=greatest(0,coalesce(gastos_reembolsables,0)+v_delta),
          updated_at=now()
      where id=r.estado_pago_id;
    end if;
  end loop;
end;
$block$;
