create table if not exists public.presupuestos_tecnico_comerciales_v1524 (
  id uuid primary key default gen_random_uuid(),
  codigo text not null unique,
  equipo_id uuid references public.equipos(id) on delete set null,
  equipo_nombre text not null,
  fecha date not null,
  materiales jsonb not null default '[]'::jsonb,
  fletes jsonb not null default '[]'::jsonb,
  utilidad_pct numeric(8,4) not null default 7,
  subtotal_materiales numeric(14,2) not null default 0,
  subtotal_fletes numeric(14,2) not null default 0,
  total_costos_netos numeric(14,2) not null default 0,
  utilidad numeric(14,2) not null default 0,
  venta_neta numeric(14,2) not null default 0,
  iva numeric(14,2) not null default 0,
  total_final numeric(14,2) not null default 0,
  observacion text,
  estado text not null default 'borrador' check (estado in ('borrador','emitido','anulado')),
  created_by uuid not null default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists presupuestos_tecnico_comerciales_v1524_fecha_idx
  on public.presupuestos_tecnico_comerciales_v1524 (fecha desc, created_at desc);

alter table public.presupuestos_tecnico_comerciales_v1524 enable row level security;

drop policy if exists presupuestos_v1524_admin_select on public.presupuestos_tecnico_comerciales_v1524;
create policy presupuestos_v1524_admin_select
on public.presupuestos_tecnico_comerciales_v1524
for select to authenticated
using (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.activo = true and lower(p.rol) = 'administrador'
  )
);

drop policy if exists presupuestos_v1524_admin_insert on public.presupuestos_tecnico_comerciales_v1524;
create policy presupuestos_v1524_admin_insert
on public.presupuestos_tecnico_comerciales_v1524
for insert to authenticated
with check (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.activo = true and lower(p.rol) = 'administrador'
  )
);

drop policy if exists presupuestos_v1524_admin_update on public.presupuestos_tecnico_comerciales_v1524;
create policy presupuestos_v1524_admin_update
on public.presupuestos_tecnico_comerciales_v1524
for update to authenticated
using (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.activo = true and lower(p.rol) = 'administrador'
  )
)
with check (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.activo = true and lower(p.rol) = 'administrador'
  )
);

drop policy if exists presupuestos_v1524_admin_delete on public.presupuestos_tecnico_comerciales_v1524;
create policy presupuestos_v1524_admin_delete
on public.presupuestos_tecnico_comerciales_v1524
for delete to authenticated
using (
  exists (
    select 1 from public.perfiles p
    where p.id = auth.uid() and p.activo = true and lower(p.rol) = 'administrador'
  )
);

grant select, insert, update, delete on public.presupuestos_tecnico_comerciales_v1524 to authenticated;
