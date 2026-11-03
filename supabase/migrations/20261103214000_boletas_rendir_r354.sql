-- R354: Rendiciones independientes, privadas por usuario, reintegro exclusivo Ismael Gálvez.
create table if not exists public.boletas_rendir_r354(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null default auth.uid() references auth.users(id),
 nombre_solicitante text not null,
 fecha_gasto date not null,
 concepto text not null check(length(trim(concepto)) between 3 and 700),
 tipo_documento text not null check(tipo_documento in ('boleta','factura','otro')),
 numero_documento text not null default '',
 monto bigint not null check(monto>0),
 comprobante_path text not null,
 comprobante_nombre text not null,
 comprobante_mime text not null check(comprobante_mime in ('image/jpeg','image/png','image/webp','application/pdf')),
 estado text not null default 'pendiente' check(estado in ('pendiente','reintegrado')),
 transferencia_id uuid,
 created_at timestamptz not null default now()
);
create table if not exists public.boletas_reintegros_r354(
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id),
 fecha_transferencia date not null,
 monto_total bigint not null check(monto_total>0),
 confirmado_por uuid not null default auth.uid() references auth.users(id),
 created_at timestamptz not null default now()
);
-- La restricción FK existe desde la migración aplicada en producción.
create index if not exists boletas_r354_owner_idx on public.boletas_rendir_r354(user_id,created_at desc);
create index if not exists reintegros_r354_owner_idx on public.boletas_reintegros_r354(user_id,fecha_transferencia desc);
alter table public.boletas_rendir_r354 enable row level security;
alter table public.boletas_reintegros_r354 enable row level security;
revoke all on public.boletas_rendir_r354,public.boletas_reintegros_r354 from anon;
grant select,insert,update on public.boletas_rendir_r354 to authenticated;
grant select,insert on public.boletas_reintegros_r354 to authenticated;
drop policy if exists r354_boletas_read on public.boletas_rendir_r354;
create policy r354_boletas_read on public.boletas_rendir_r354 for select to authenticated
 using(user_id=(select auth.uid()) or (select auth.uid())='44b92981-9398-42cb-a334-a51baa876125'::uuid);
drop policy if exists r354_boletas_insert on public.boletas_rendir_r354;
create policy r354_boletas_insert on public.boletas_rendir_r354 for insert to authenticated
 with check(user_id=(select auth.uid()) and estado='pendiente' and transferencia_id is null);
drop policy if exists r354_boletas_update on public.boletas_rendir_r354;
create policy r354_boletas_update on public.boletas_rendir_r354 for update to authenticated
 using((select auth.uid())='44b92981-9398-42cb-a334-a51baa876125'::uuid)
 with check((select auth.uid())='44b92981-9398-42cb-a334-a51baa876125'::uuid);
drop policy if exists r354_reintegros_read on public.boletas_reintegros_r354;
create policy r354_reintegros_read on public.boletas_reintegros_r354 for select to authenticated
 using(user_id=(select auth.uid()) or (select auth.uid())='44b92981-9398-42cb-a334-a51baa876125'::uuid);
drop policy if exists r354_reintegros_insert on public.boletas_reintegros_r354;
create policy r354_reintegros_insert on public.boletas_reintegros_r354 for insert to authenticated
 with check((select auth.uid())='44b92981-9398-42cb-a334-a51baa876125'::uuid and confirmado_por=(select auth.uid()));
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('boletas-rendir-r354','boletas-rendir-r354',false,10485760,array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists boletas_r354_upload on storage.objects;
create policy boletas_r354_upload on storage.objects for insert to authenticated
 with check(bucket_id='boletas-rendir-r354' and (storage.foldername(name))[1]=(select auth.uid())::text);
drop policy if exists boletas_r354_read_file on storage.objects;
create policy boletas_r354_read_file on storage.objects for select to authenticated
 using(bucket_id='boletas-rendir-r354' and ((storage.foldername(name))[1]=(select auth.uid())::text
 or (select auth.uid())='44b92981-9398-42cb-a334-a51baa876125'::uuid));
create or replace function public.confirmar_reintegro_boletas_r354(p_boletas uuid[],p_fecha date)
returns uuid language plpgsql security invoker set search_path='' as $$
declare n integer; selected_count integer; owners integer; total bigint; owner_id uuid; transfer_id uuid;
begin
 if auth.uid() is distinct from '44b92981-9398-42cb-a334-a51baa876125'::uuid
 then raise exception 'Confirmación exclusiva de Ismael Gálvez';end if;
 if p_fecha is null then raise exception 'Fecha requerida';end if;
 n:=coalesce(array_length(p_boletas,1),0);
 if n=0 or n>100 or (select count(distinct x) from unnest(p_boletas) x)<>n
 then raise exception 'Seleccione documentos distintos';end if;
 select count(*),count(distinct user_id),coalesce(sum(monto),0),(array_agg(user_id))[1]
 into selected_count,owners,total,owner_id
 from (select * from public.boletas_rendir_r354 where id=any(p_boletas) for update) locked;
 if selected_count<>n or owners<>1 then raise exception 'Boletas de un solo usuario';end if;
 if exists(select 1 from public.boletas_rendir_r354 where id=any(p_boletas)
 and (estado<>'pendiente' or transferencia_id is not null)) then
 raise exception 'Una o más boletas ya fueron reintegradas';end if;
 insert into public.boletas_reintegros_r354(user_id,fecha_transferencia,monto_total)
 values(owner_id,p_fecha,total) returning id into transfer_id;
 update public.boletas_rendir_r354 set estado='reintegrado',transferencia_id=transfer_id where id=any(p_boletas);
 if (select count(*) from public.boletas_rendir_r354 where transferencia_id=transfer_id)<>n
 then raise exception 'Error de integridad de reintegro';end if;
 return transfer_id;
end $$;
revoke all on function public.confirmar_reintegro_boletas_r354(uuid[],date) from public,anon;
grant execute on function public.confirmar_reintegro_boletas_r354(uuid[],date) to authenticated;