-- R352. Anulación de transferencias sin borrar gastos ni su auditoría.
alter table public.gastos_transferencias_r348
 add column if not exists anulada boolean not null default false,
 add column if not exists anulada_por uuid references auth.users(id),
 add column if not exists anulada_en timestamptz,
 add column if not exists motivo_anulacion text;
create or replace function public.anular_transferencia_gastos_r352(p_transferencia uuid,p_motivo text)
returns integer language plpgsql security invoker set search_path='' as $$
declare tr public.gastos_transferencias_r348%rowtype; n integer;
begin
 if lower(public.mi_rol())<>'administrador' then raise exception 'Solo administración puede anular transferencias';end if;
 if length(trim(coalesce(p_motivo,'')))<5 then raise exception 'Indique un motivo válido';end if;
 select * into tr from public.gastos_transferencias_r348 where id=p_transferencia for update;
 if not found then raise exception 'Transferencia no encontrada';end if;
 if tr.anulada then raise exception 'Transferencia anulada previamente';end if;
 if tr.finanzas_recuperado then raise exception 'Existe regularización histórica; requiere revisión';end if;
 update public.gastos_operacionales_r342
 set transferencia_id=null,reembolso_personal_monto=0,reembolso_personal_fecha=null,
 reembolso_personal_por='',medio_reembolso_personal='pendiente',updated_at=now()
 where transferencia_id=p_transferencia and anulado=false;
 get diagnostics n=row_count;
 if n=0 then raise exception 'No existen gastos activos vinculados';end if;
 update public.gastos_transferencias_r348
 set anulada=true,anulada_por=auth.uid(),anulada_en=now(),motivo_anulacion=trim(p_motivo)
 where id=p_transferencia;
 return n;
end $$;
revoke all on function public.anular_transferencia_gastos_r352(uuid,text) from public,anon;
grant execute on function public.anular_transferencia_gastos_r352(uuid,text) to authenticated;