-- Desarrollo 30 / R342 · Gastos Operacionales
-- Migracion idempotente equivalente a la desplegada.
create table if not exists public.gastos_operacionales_r342(
 id uuid primary key default gen_random_uuid(),
 created_by uuid not null default auth.uid() references auth.users(id),
 fecha date not null,
 categoria text not null check(length(trim(categoria))>0),
 detalle text not null check(length(trim(detalle))>0),
 monto bigint not null check(monto>0),
 tipo_documento text not null default 'boleta' check(tipo_documento in ('boleta','factura','otro','sin_documento')),
 numero_documento text not null default '',
 realizado_por uuid references public.perfiles(id),
 realizado_por_nombre text not null,
 ofertable_codelco boolean not null default false,
 estado_codelco text not null default 'no_aplica' check(estado_codelco in ('no_aplica','pendiente','ofertado','recuperado')),
 estado_pago_id uuid references public.estados_pago(id),
 reembolso_personal_monto bigint not null default 0 check(reembolso_personal_monto>=0),
 reembolso_personal_fecha date,
 reembolso_personal_por text not null default '',
 reembolso_finanzas_monto bigint not null default 0 check(reembolso_finanzas_monto>=0),
 reembolso_finanzas_fecha date,
 reembolso_finanzas_referencia text not null default '',
 comprobante_path text,
 comprobante_nombre text,
 comprobante_mime text,
 observaciones text not null default '',
 anulado boolean not null default false,
 motivo_anulacion text,
 created_at timestamptz not null default now(),
 updated_at timestamptz not null default now(),
 constraint r342_reembolso_top check(reembolso_personal_monto<=monto and reembolso_finanzas_monto<=monto),
 constraint r342_estado_codelco check((ofertable_codelco and estado_codelco<>'no_aplica') or (not ofertable_codelco and estado_codelco='no_aplica'))
);
create index if not exists gastos_r342_fecha on public.gastos_operacionales_r342(fecha desc);
create index if not exists gastos_r342_persona on public.gastos_operacionales_r342(realizado_por,fecha desc);
alter table public.gastos_operacionales_r342 enable row level security;
revoke all on public.gastos_operacionales_r342 from anon;
grant select,insert,update on public.gastos_operacionales_r342 to authenticated;
drop policy if exists gastos_r342_select on public.gastos_operacionales_r342;
create policy gastos_r342_select on public.gastos_operacionales_r342 for select to authenticated using (
 created_by=(select auth.uid()) or realizado_por=(select auth.uid()) or lower((select public.mi_rol())) in ('administrador','gerente')
);
drop policy if exists gastos_r342_insert on public.gastos_operacionales_r342;
create policy gastos_r342_insert on public.gastos_operacionales_r342 for insert to authenticated with check (
 created_by=(select auth.uid()) and (realizado_por=(select auth.uid()) or lower((select public.mi_rol()))='administrador')
);
drop policy if exists gastos_r342_update on public.gastos_operacionales_r342;
create policy gastos_r342_update on public.gastos_operacionales_r342 for update to authenticated
 using(lower((select public.mi_rol()))='administrador') with check(lower((select public.mi_rol()))='administrador');
insert into storage.buckets(id,name,public,file_size_limit,allowed_mime_types)
values('gastos-operacionales-r342','gastos-operacionales-r342',false,10485760,
 array['image/jpeg','image/png','image/webp','application/pdf'])
on conflict(id) do update set public=false,file_size_limit=10485760,allowed_mime_types=excluded.allowed_mime_types;
drop policy if exists gastos_r342_storage_read on storage.objects;
create policy gastos_r342_storage_read on storage.objects for select to authenticated
using(bucket_id='gastos-operacionales-r342' and ((storage.foldername(name))[2]=(select auth.uid())::text
 or lower((select public.mi_rol())) in ('administrador','gerente')));
drop policy if exists gastos_r342_storage_insert on storage.objects;
create policy gastos_r342_storage_insert on storage.objects for insert to authenticated
with check(bucket_id='gastos-operacionales-r342' and (storage.foldername(name))[2]=(select auth.uid())::text);
