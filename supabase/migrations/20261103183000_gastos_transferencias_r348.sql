-- Desarrollo 30, R348: transferencias agrupadas por boletas completas.
create table if not exists public.gastos_transferencias_r348(
 id uuid primary key default gen_random_uuid(),
 realizado_por uuid not null references public.perfiles(id),
 realizado_por_nombre text not null,
 fecha date not null,
 pagado_por text not null default 'Cristian Lagos',
 monto_total bigint not null check(monto_total>0),
 finanzas_recuperado boolean not null default false,
 fecha_finanzas date,
 created_by uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now(),
 constraint r348_finanzas_fecha check(finanzas_recuperado or fecha_finanzas is null)
);
alter table public.gastos_transferencias_r348 enable row level security;
revoke all on public.gastos_transferencias_r348 from anon;
grant select,insert,update on public.gastos_transferencias_r348 to authenticated;
drop policy if exists r348_transfer_select on public.gastos_transferencias_r348;
create policy r348_transfer_select on public.gastos_transferencias_r348 for select to authenticated
 using(realizado_por=(select auth.uid()) or lower((select public.mi_rol())) in ('administrador','gerente'));
drop policy if exists r348_transfer_insert on public.gastos_transferencias_r348;
create policy r348_transfer_insert on public.gastos_transferencias_r348 for insert to authenticated
 with check(created_by=(select auth.uid()) and lower((select public.mi_rol()))='administrador');
drop policy if exists r348_transfer_update on public.gastos_transferencias_r348;
create policy r348_transfer_update on public.gastos_transferencias_r348 for update to authenticated
 using(lower((select public.mi_rol()))='administrador')
 with check(lower((select public.mi_rol()))='administrador');
alter table public.gastos_operacionales_r342 add column if not exists transferencia_id uuid references public.gastos_transferencias_r348(id);
create index if not exists r348_gastos_transferencia_idx on public.gastos_operacionales_r342(transferencia_id);
create index if not exists r348_transfer_persona_idx on public.gastos_transferencias_r348(realizado_por,fecha desc);
create or replace function public.registrar_transferencia_gastos_r348(p_gastos uuid[],p_fecha date,p_pagado_por text default 'Cristian Lagos')
returns uuid language plpgsql security invoker set search_path='' as $$
declare n integer;n_total integer;n_personas integer;total bigint;persona uuid;nombre text;tid uuid;
begin
 if (select lower(public.mi_rol()))<>'administrador' then raise exception 'Solo administracion puede registrar transferencias';end if;
 if p_fecha is null or trim(coalesce(p_pagado_por,''))='' then raise exception 'Indique fecha y responsable';end if;
 n:=coalesce(array_length(p_gastos,1),0);
 if n=0 or n>100 or (select count(distinct x) from unnest(p_gastos) x)<>n then raise exception 'Seleccione hasta 100 documentos distintos';end if;
 select count(*),count(distinct realizado_por),coalesce(sum(monto),0),(array_agg(realizado_por))[1],min(realizado_por_nombre)
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
create or replace function public.registrar_recuperacion_finanzas_r348(p_transferencia uuid,p_fecha date)
returns void language plpgsql security invoker set search_path='' as $$
declare tr public.gastos_transferencias_r348%rowtype;
begin
 if (select lower(public.mi_rol()))<>'administrador' then raise exception 'Acceso no autorizado';end if;
 if p_fecha is null then raise exception 'Indique fecha de recuperacion';end if;
 select * into tr from public.gastos_transferencias_r348 where id=p_transferencia for update;
 if not found then raise exception 'Transferencia no encontrada';end if;
 if tr.finanzas_recuperado then raise exception 'Transferencia ya regularizada';end if;
 update public.gastos_transferencias_r348 set finanzas_recuperado=true,fecha_finanzas=p_fecha where id=p_transferencia;
 update public.gastos_operacionales_r342 set reembolso_finanzas_monto=monto,reembolso_finanzas_fecha=p_fecha,updated_at=now()
 where transferencia_id=p_transferencia;
end $$;
revoke all on function public.registrar_recuperacion_finanzas_r348(uuid,date) from public,anon;
grant execute on function public.registrar_recuperacion_finanzas_r348(uuid,date) to authenticated;