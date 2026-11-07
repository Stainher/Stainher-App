create table if not exists public.tv_pantallas_r397 (
 id text primary key check (id = 'diario-mural'),
 valor jsonb not null check (jsonb_typeof(valor) = 'object'),
 updated_at timestamptz not null default now(),
 updated_by uuid not null references auth.users(id) default auth.uid()
);
alter table public.tv_pantallas_r397 enable row level security;
revoke all on public.tv_pantallas_r397 from anon, authenticated;
grant select, insert, update on public.tv_pantallas_r397 to authenticated;
create policy tv_admin_select on public.tv_pantallas_r397 for select to authenticated
 using (exists (select 1 from public.perfiles p where p.id=(select auth.uid()) and p.rol='administrador' and p.activo=true));
create policy tv_admin_insert on public.tv_pantallas_r397 for insert to authenticated
 with check (updated_by=(select auth.uid()) and exists (select 1 from public.perfiles p where p.id=(select auth.uid()) and p.rol='administrador' and p.activo=true));
create policy tv_admin_update on public.tv_pantallas_r397 for update to authenticated
 using (exists (select 1 from public.perfiles p where p.id=(select auth.uid()) and p.rol='administrador' and p.activo=true))
 with check (updated_by=(select auth.uid()) and exists (select 1 from public.perfiles p where p.id=(select auth.uid()) and p.rol='administrador' and p.activo=true));
comment on table public.tv_pantallas_r397 is 'Diario mural TV: pantallas y widgets compartidos, solo administradores activos.';
