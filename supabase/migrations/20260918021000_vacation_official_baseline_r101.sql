-- R101 · Levantamiento oficial de vacaciones al 09-09-2026.
-- Fuente: informe_centros.pdf "LISTADO DE FERIADO LEGALES".
-- No modifica saldos productivos todavía: deja baseline y vista de conciliación para revisión.
create schema if not exists stainher_private;

create table if not exists stainher_private.vacation_official_baseline (
  source_date date not null,
  source_name text not null,
  rut text not null,
  contract_start date,
  dias_tomados numeric,
  dias_ganados numeric,
  dias_pendientes numeric not null,
  excluded boolean not null default false,
  exclusion_reason text,
  created_at timestamptz not null default now(),
  primary key (source_date,rut)
);

insert into stainher_private.vacation_official_baseline
(source_date,source_name,rut,contract_start,dias_tomados,dias_ganados,dias_pendientes,excluded,exclusion_reason)
values
('2026-09-09','informe_centros.pdf','19.664.389-3','2026-04-23',0,0,0,false,null),
('2026-09-09','informe_centros.pdf','18.384.874-7','2024-08-08',10,31,21,false,null),
('2026-09-09','informe_centros.pdf','13.688.791-2','2025-05-01',6,14,8,false,null),
('2026-09-09','informe_centros.pdf','19.664.218-8','2026-02-26',0,0,0,false,null),
('2026-09-09','informe_centros.pdf','18.792.245-3','2025-06-01',5,10,5,false,null),
('2026-09-09','informe_centros.pdf','15.370.661-1','2025-06-01',5,17,12,false,null),
('2026-09-09','informe_centros.pdf','19.881.343-5','2026-06-11',0,0,0,false,null),
('2026-09-09','informe_centros.pdf','15.694.355-K','2025-06-16',16,18,2,false,null),
('2026-09-09','informe_centros.pdf','16.900.894-9','2026-02-09',5,9,4,false,null),
('2026-09-09','informe_centros.pdf','17.273.191-0','2025-06-01',5,17,12,false,null),
('2026-09-09','informe_centros.pdf','16.106.736-9','2025-06-01',7,7,0,false,null),
('2026-09-09','informe_centros.pdf','27.183.819-0','2025-08-18',2,8,6,false,null),
('2026-09-09','informe_centros.pdf','18.457.566-3','2025-10-13',0,0,0,false,null),
('2026-09-09','informe_centros.pdf','12.952.055-8','2025-07-07',9,16,7,false,null),
('2026-09-09','informe_centros.pdf','26.183.850-8','2026-01-29',0,0,0,false,null),
('2026-09-09','informe_centros.pdf','18.916.538-2','2025-06-01',5,19,14,false,null),
('2026-09-09','informe_centros.pdf','11.485.153-1','2025-11-05',99,0,-99,true,'Excluido por instrucción: Christian Morales'),
('2026-09-09','informe_centros.pdf','21.160.147-7','2025-06-01',13,19,6,true,'Excluido por instrucción: Alejandro Silva'),
('2026-09-09','informe_centros.pdf','16.088.142-9','2020-02-01',89,90,1,true,'Excluido por instrucción: Cristian Lagos')
on conflict (source_date,rut) do update set
  source_name=excluded.source_name,
  contract_start=excluded.contract_start,
  dias_tomados=excluded.dias_tomados,
  dias_ganados=excluded.dias_ganados,
  dias_pendientes=excluded.dias_pendientes,
  excluded=excluded.excluded,
  exclusion_reason=excluded.exclusion_reason;

create or replace view stainher_private.vacation_reconciliation_20260909 as
with src as (
  select * from stainher_private.vacation_official_baseline
  where source_date=date '2026-09-09'
),
matched as (
  select s.*,d.user_id,p.nombre,p.saldo_vacaciones,
         d.fecha_inicio_contrato as app_contract_start
  from src s
  left join public.dotacion_contrato d
    on regexp_replace(upper(d.rut),'[^0-9K]','','g')=
       regexp_replace(upper(s.rut),'[^0-9K]','','g')
  left join public.perfiles p on p.id=d.user_id
),
mov as (
  select user_id,coalesce(sum(dias),0) dias
  from public.vacaciones_movimientos
  where created_at::date > date '2026-09-09'
  group by user_id
)
select m.nombre,m.rut,m.user_id,m.excluded,m.exclusion_reason,
       m.contract_start as official_contract_start,
       m.app_contract_start,
       m.dias_tomados,m.dias_ganados,m.dias_pendientes as official_pending_20260909,
       case when m.user_id is null or m.excluded then null
            else round(stainher_private.vacation_earned(
              m.contract_start,(now() at time zone 'America/Santiago')::date)
              - stainher_private.vacation_earned(m.contract_start,date '2026-09-09'),2)
       end as accrued_since_source,
       coalesce(v.dias,0) as app_vacation_days_after_source,
       case when m.user_id is null or m.excluded then null
            else round(m.dias_pendientes
              + stainher_private.vacation_earned(m.contract_start,(now() at time zone 'America/Santiago')::date)
              - stainher_private.vacation_earned(m.contract_start,date '2026-09-09')
              - coalesce(v.dias,0),2)
       end as proposed_balance,
       m.saldo_vacaciones as current_app_balance
from matched m
left join mov v on v.user_id=m.user_id;

comment on table stainher_private.vacation_official_baseline is
'Baseline oficial de feriado legal importado desde informe_centros.pdf del 09-09-2026. No es el saldo operativo hasta conciliación/aprobación.';
