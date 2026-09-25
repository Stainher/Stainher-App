-- R122 · Desglose histórico de mantenimiento por equipo dentro de cada Estado de Pago.
-- Permite distinguir montos reales por equipo, Gastos Generales/Operativos y otros
-- sin inferir automáticamente la composición desde el total de Mantenimiento.

create table if not exists public.edp_detalle_mantenimiento_v1524 (
  id uuid primary key default gen_random_uuid(),
  estado_pago_id uuid not null references public.estados_pago(id) on delete cascade,
  item_key text not null,
  item_nombre text not null,
  tipo text not null check (tipo in ('equipo','gasto_general','otro')),
  monto bigint not null default 0 check (monto >= 0),
  incluido_en_mantenimiento boolean not null default false,
  observacion text,
  created_by uuid default auth.uid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (estado_pago_id,item_key)
);

create index if not exists edp_detalle_mantenimiento_v1524_ep_idx
  on public.edp_detalle_mantenimiento_v1524 (estado_pago_id,tipo,item_key);

alter table public.edp_detalle_mantenimiento_v1524 enable row level security;

drop policy if exists edp_detalle_mantenimiento_v1524_select on public.edp_detalle_mantenimiento_v1524;
create policy edp_detalle_mantenimiento_v1524_select
on public.edp_detalle_mantenimiento_v1524
for select to authenticated
using (public.tiene_permiso('contrato','ver'));

drop policy if exists edp_detalle_mantenimiento_v1524_insert on public.edp_detalle_mantenimiento_v1524;
create policy edp_detalle_mantenimiento_v1524_insert
on public.edp_detalle_mantenimiento_v1524
for insert to authenticated
with check (public.tiene_permiso('contrato','editar'));

drop policy if exists edp_detalle_mantenimiento_v1524_update on public.edp_detalle_mantenimiento_v1524;
create policy edp_detalle_mantenimiento_v1524_update
on public.edp_detalle_mantenimiento_v1524
for update to authenticated
using (public.tiene_permiso('contrato','editar'))
with check (public.tiene_permiso('contrato','editar'));

drop policy if exists edp_detalle_mantenimiento_v1524_delete on public.edp_detalle_mantenimiento_v1524;
create policy edp_detalle_mantenimiento_v1524_delete
on public.edp_detalle_mantenimiento_v1524
for delete to authenticated
using (public.tiene_permiso('contrato','editar'));

grant select,insert,update,delete on public.edp_detalle_mantenimiento_v1524 to authenticated;

-- Migra el desglose histórico de agosto 2026 que ya estaba codificado en Forecast.
-- Mantenimiento EP15 agosto = detalle equipos + Gasto General/Operativo real.
with ep as (
  select id
  from public.estados_pago
  where anio_edp=2026 and mes_edp=8
  order by ep_num desc
  limit 1
), rows(item_key,item_nombre,tipo,monto,incluido_en_mantenimiento) as (
  values
    ('3700','Nodo 3700','equipo',4530838::bigint,true),
    ('asea','HUINCHE ASEA (Concentradora)','equipo',4114348::bigint,true),
    ('otis','HUINCHE OTIS','equipo',5351180::bigint,true),
    ('alimak','HUINCHE ALIMAK','equipo',3294006::bigint,true),
    ('ptp','Huinche Tercer Panel (PTP)','equipo',0::bigint,true),
    ('eila','Ascensor EILA 1 y 2','equipo',1940555::bigint,true),
    ('hilton','Montacargas Hilton (EQUIPOS 2 Y 3)','equipo',2550721::bigint,true),
    ('gasto_general','Gastos Generales / Operativos','gasto_general',45364683::bigint,true),
    ('otros','Otros conceptos netos','otro',0::bigint,false)
)
insert into public.edp_detalle_mantenimiento_v1524
  (estado_pago_id,item_key,item_nombre,tipo,monto,incluido_en_mantenimiento,observacion)
select ep.id,rows.item_key,rows.item_nombre,rows.tipo,rows.monto,rows.incluido_en_mantenimiento,
       case when rows.item_key='gasto_general'
            then 'Migrado desde la composición histórica utilizada por Forecast antes de R122.'
            else 'Migrado desde el desglose histórico de agosto utilizado por Forecast antes de R122.'
       end
from ep cross join rows
on conflict (estado_pago_id,item_key)
do update set
  item_nombre=excluded.item_nombre,
  tipo=excluded.tipo,
  monto=excluded.monto,
  incluido_en_mantenimiento=excluded.incluido_en_mantenimiento,
  observacion=coalesce(public.edp_detalle_mantenimiento_v1524.observacion,excluded.observacion),
  updated_at=now();
