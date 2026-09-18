-- R101 · Aplicación genérica de conciliación de vacaciones.
-- Baseline oficial RRHH 09-09-2026 menos movimientos aprobados posteriores.
-- Las excepciones se detectan por reglas de datos, sin identificadores personales codificados.

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

with base as (
  select b.*,d.user_id,d.fecha_inicio_contrato as app_contract_start
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
  select b.*,coalesce(p.dias,0) post_days,
         round(b.dias_pendientes-coalesce(p.dias,0),2) proposed_balance
  from base b
  left join post p on p.user_id=b.user_id
)
insert into stainher_private.vacation_reconciliation_exceptions(source_date,user_id,rut,reason)
select source_date,user_id,rut,
       case
         when proposed_balance < 0 then
           'Saldo reconciliado negativo: baseline oficial menos vacaciones aprobadas posteriores al corte.'
         when contract_start is distinct from app_contract_start then
           'Discrepancia de fecha de contrato entre baseline oficial y App. Requiere validación humana.'
       end
from calc
where proposed_balance < 0
   or contract_start is distinct from app_contract_start
on conflict (source_date,rut) do update set
  user_id=excluded.user_id,
  reason=excluded.reason,
  detected_at=now(),
  resolved_at=null,
  resolution=null;

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

revoke all on table stainher_private.vacation_reconciliation_exceptions from public, anon, authenticated;
