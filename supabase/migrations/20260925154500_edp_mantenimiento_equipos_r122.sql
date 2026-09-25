-- Stainher V15.24 · R122 · Desglose histórico de mantenimiento por equipo en EDP
create table if not exists public.edp_mantenimiento_equipos_v1524 (
  id uuid primary key default gen_random_uuid(),
  estado_pago_id uuid not null references public.estados_pago(id) on delete cascade,
  grupo_codigo text not null,
  equipo_label text not null,
  monto bigint not null default 0 check (monto >= 0),
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estado_pago_id, grupo_codigo)
);

create index if not exists edp_mantenimiento_equipos_v1524_estado_pago_idx
  on public.edp_mantenimiento_equipos_v1524 (estado_pago_id);

alter table public.edp_mantenimiento_equipos_v1524 enable row level security;

drop policy if exists edp_mantenimiento_equipos_v1524_read on public.edp_mantenimiento_equipos_v1524;
create policy edp_mantenimiento_equipos_v1524_read
on public.edp_mantenimiento_equipos_v1524
for select to authenticated
using (
  exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.activo = true
      and lower(coalesce(p.rol,'')) in ('administrador','confiabilidad')
  )
);

drop policy if exists edp_mantenimiento_equipos_v1524_manage on public.edp_mantenimiento_equipos_v1524;
create policy edp_mantenimiento_equipos_v1524_manage
on public.edp_mantenimiento_equipos_v1524
for all to authenticated
using (
  exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.activo = true
      and lower(coalesce(p.rol,'')) in ('administrador','confiabilidad')
  )
)
with check (
  exists (
    select 1
    from public.perfiles p
    where p.id = auth.uid()
      and p.activo = true
      and lower(coalesce(p.rol,'')) in ('administrador','confiabilidad')
  )
);

grant select, insert, update, delete on public.edp_mantenimiento_equipos_v1524 to authenticated;

-- Preserva el único desglose histórico por equipo que ya existía en el frontend (agosto 2026 / EP15).
insert into public.edp_mantenimiento_equipos_v1524 (estado_pago_id,grupo_codigo,equipo_label,monto)
select ep.id, seed.grupo_codigo, seed.equipo_label, seed.monto
from public.estados_pago ep
cross join (
  values
    ('asea','HUINCHE ASEA (Concentradora)',4114348::bigint),
    ('otis','HUINCHE OTIS',5351180::bigint),
    ('alimak','HUINCHE ALIMAK',3294006::bigint),
    ('ptp','Huinche Tercer Panel (PTP)',0::bigint),
    ('3700','Nodo 3700',4530838::bigint),
    ('eila','Ascensor EILA 1 y 2',1940555::bigint),
    ('hilton','Montacargas Hilton (EQUIPOS 2 Y 3)',2550721::bigint)
) as seed(grupo_codigo,equipo_label,monto)
where ep.anio_edp=2026 and ep.mes_edp=8
on conflict (estado_pago_id,grupo_codigo)
do update set
  equipo_label=excluded.equipo_label,
  monto=excluded.monto,
  updated_at=now();
