-- R351 · Permitir gastos a nombre de personas externas.
-- Se conserva el identificador interno cuando existe y el nombre escrito cuando no.
alter table public.gastos_transferencias_r348 alter column realizado_por drop not null;
create or replace function public.registrar_transferencia_gastos_r348(p_gastos uuid[],p_fecha date,p_pagado_por text default 'Cristian Lagos')
returns uuid language plpgsql security invoker set search_path='' as $$
declare n integer;n_total integer;n_personas integer;total bigint;persona uuid;nombre text;tid uuid;
begin
 if lower(public.mi_rol())<>'administrador' then raise exception 'Solo administracion puede registrar transferencias';end if;
 if p_fecha is null or trim(coalesce(p_pagado_por,''))='' then raise exception 'Indique fecha y responsable';end if;
 n:=coalesce(array_length(p_gastos,1),0);
 if n=0 or n>100 or (select count(distinct x) from unnest(p_gastos) x)<>n then raise exception 'Seleccione hasta 100 documentos distintos';end if;
 select count(*),count(distinct coalesce(realizado_por::text,'externo:'||lower(trim(realizado_por_nombre)))),coalesce(sum(monto),0),(array_agg(realizado_por))[1],min(realizado_por_nombre)
 into n_total,n_personas,total,persona,nombre
 from (select * from public.gastos_operacionales_r342 where id=any(p_gastos) for update) locked;
 if n_total<>n or n_personas<>1 then raise exception 'Los documentos deben pertenecer a una sola persona';end if;
 if exists(select 1 from public.gastos_operacionales_r342 where id=any(p_gastos) and
 (anulado or transferencia_id is not null or reembolso_personal_monto<>0))
 then raise exception 'Uno o mas documentos ya fueron reembolsados o anulados';end if;
 insert into public.gastos_transferencias_r348(realizado_por,realizado_por_nombre,fecha,pagado_por,monto_total)
 values(persona,nombre,p_fecha,trim(p_pagado_por),total) returning id into tid;
 update public.gastos_operacionales_r342
 set transferencia_id=tid,reembolso_personal_monto=monto,reembolso_personal_fecha=p_fecha,
 reembolso_personal_por=trim(p_pagado_por),medio_reembolso_personal='transferencia',updated_at=now()
 where id=any(p_gastos);
 if (select count(*) from public.gastos_operacionales_r342 where transferencia_id=tid)<>n
 then raise exception 'No se pudieron guardar todos los documentos';end if;
 return tid;
end $$;
revoke all on function public.registrar_transferencia_gastos_r348(uuid[],date,text) from public,anon;
grant execute on function public.registrar_transferencia_gastos_r348(uuid[],date,text) to authenticated;
