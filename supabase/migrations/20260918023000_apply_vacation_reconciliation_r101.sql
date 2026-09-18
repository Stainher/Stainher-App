-- R101 · Aplicación de conciliación de vacaciones.
-- PREPARADA, NO APLICADA EN PRODUCCIÓN.
-- Usa baseline oficial RRHH 09-09-2026 menos movimientos aprobados posteriores.
-- Pablo Lillo queda excluido de actualización automática por saldo reconciliado negativo.

create table if not exists stainher_private.vacation_reconciliation_exceptions (
  source_date date not null,
  user_id uuid,
  rut text not null,
  reason text not null,
  detected_at timestamptz not null default now(),
  resolved_at timestamptz,
  resolution text,
  primary key (source_date,rut)
);

-- Fecha de contrato donde el informe oficial difiere de la App.
-- Cristian Flores se mantiene en 01-06-2025 por validación manual de Ismael.
update public.dotacion_contrato
set fecha_inicio_contrato=date '2026-01-29'
where regexp_replace(upper(rut),'[^0-9K]','','g')='261838508';

-- Registrar excepción Pablo Lillo antes de cualquier actualización masiva.
insert into stainher_private.vacation_reconciliation_exceptions(source_date,user_id,rut,reason)
select b.source_date,d.user_id,b.rut,
       'Baseline oficial 09-09-2026 = 0 días; existe 1 día de vacaciones aprobado por la App el 11-09-2026. Requiere validación RRHH.'
from stainher_private.vacation_official_baseline b
join public.dotacion_contrato d
  on regexp_replace(upper(d.rut),'[^0-9K]','','g')=
     regexp_replace(upper(b.rut),'[^0-9K]','','g')
where b.source_date=date '2026-09-09'
  and regexp_replace(upper(b.rut),'[^0-9K]','','g')='184575663'
on conflict (source_date,rut) do update set
  user_id=excluded.user_id,
  reason=excluded.reason,
  detected_at=now(),
  resolved_at=null,
  resolution=null;

-- Reconciliar todos los incluidos salvo excepciones con resultado negativo.
with base as (
  select b.*,d.user_id
  from stainher_private.vacation_official_baseline b
  join public.dotacion_contrato d
    on regexp_replace(upper(d.rut),'[^0-9K]','','g')=
       regexp_replace(upper(b.rut),'[^0-9K]','','g')
  where b.source_date=date '2026-09-09'
    and b.excluded=false
),
post as (
  select user_id,coalesce(sum(dias),0) dias
  from public.vacaciones_movimientos
  where created_at::date > date '2026-09-09'
  group by user_id
),
calc as (
  select b.user_id,b.rut,
         round(b.dias_pendientes-coalesce(p.dias,0),2) proposed_balance
  from base b
  left join post p on p.user_id=b.user_id
)
update public.perfiles p
set saldo_vacaciones=c.proposed_balance
from calc c
where p.id=c.user_id
  and c.proposed_balance>=0
  and not exists(
    select 1
    from stainher_private.vacation_reconciliation_exceptions e
    where e.source_date=date '2026-09-09'
      and e.rut=c.rut
      and e.resolved_at is null
  );

-- Reiniciar cursor de devengo para que una conciliación oficial no vuelva a
-- acreditar retroactivamente diferencias históricas ya reemplazadas por RRHH.
update stainher_private.vacation_accrual va
set baseline_date=(now() at time zone 'America/Santiago')::date,
    credited=0,
    checked_date=(now() at time zone 'America/Santiago')::date,
    contract_start=d.fecha_inicio_contrato
from public.dotacion_contrato d
where d.user_id=va.user_id
  and exists(
    select 1 from stainher_private.vacation_official_baseline b
    where b.source_date=date '2026-09-09'
      and b.excluded=false
      and regexp_replace(upper(b.rut),'[^0-9K]','','g')=
          regexp_replace(upper(d.rut),'[^0-9K]','','g')
  );

comment on table stainher_private.vacation_reconciliation_exceptions is
'Casos que no deben reconciliarse automáticamente con baseline RRHH hasta validación manual.';
