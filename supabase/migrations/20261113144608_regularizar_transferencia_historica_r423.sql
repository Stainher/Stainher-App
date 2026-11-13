create function public.regularizar_transferencia_historica_r423(
  p_gasto uuid, p_fecha date, p_pagado_por text, p_archivo text
)
returns uuid language plpgsql security invoker set search_path='' as $$
declare
  gasto public.gastos_operacionales_r342%rowtype;
  transferencia uuid;
begin
  if (select public.mi_rol()) is distinct from 'administrador' then
    raise exception 'Acceso no autorizado';
  end if;
  if p_fecha is null or nullif(btrim(p_pagado_por),'') is null or nullif(btrim(p_archivo),'') is null then
    raise exception 'Indique fecha, responsable y comprobante de la transferencia';
  end if;
  select * into gasto from public.gastos_operacionales_r342 where id=p_gasto for update;
  if not found or gasto.anulado or gasto.transferencia_id is not null
     or gasto.reembolso_personal_monto is distinct from gasto.monto then
    raise exception 'El gasto ya no admite una regularización histórica';
  end if;

  insert into public.gastos_transferencias_r348
    (realizado_por,realizado_por_nombre,fecha,pagado_por,monto_total)
  values (gasto.realizado_por,gasto.realizado_por_nombre,p_fecha,btrim(p_pagado_por),gasto.reembolso_personal_monto)
  returning id into transferencia;

  perform public.adjuntar_comprobante_transferencia_r420(transferencia,p_archivo);

  update public.gastos_operacionales_r342
  set transferencia_id=transferencia,reembolso_personal_fecha=p_fecha,
      reembolso_personal_por=btrim(p_pagado_por),medio_reembolso_personal='transferencia',updated_at=now()
  where id=p_gasto;
  return transferencia;
end $$;

revoke all on function public.regularizar_transferencia_historica_r423(uuid,date,text,text) from public,anon;
grant execute on function public.regularizar_transferencia_historica_r423(uuid,date,text,text) to authenticated;
