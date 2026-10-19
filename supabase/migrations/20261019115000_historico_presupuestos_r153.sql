-- R153 · Carga histórica de Presupuestos y trazabilidad por EDP.
-- 36 registros se vinculan a GGRR ya existentes sin alterar los montos reconocidos.
-- 2 registros se clasifican como Estandarización: Hilton 03 -> EP5 y ASEA -> EP11.

alter table public.presupuestos_tecnico_comerciales_v1524
  add column if not exists tipo_imputacion text,
  add column if not exists registro_historico boolean not null default false,
  add column if not exists tipo_documento_origen text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname='presupuestos_v1524_tipo_imputacion_check'
  ) then
    alter table public.presupuestos_tecnico_comerciales_v1524
      add constraint presupuestos_v1524_tipo_imputacion_check
      check (tipo_imputacion is null or tipo_imputacion in ('gasto_reembolsable','estandarizacion'));
  end if;
end $$;

create index if not exists presupuestos_v1524_tipo_imputacion_idx
  on public.presupuestos_tecnico_comerciales_v1524(tipo_imputacion);

-- Los presupuestos ya asignados mediante R152 quedan identificados como GGRR.
update public.presupuestos_tecnico_comerciales_v1524
set tipo_imputacion='gasto_reembolsable'
where gasto_reembolsable_id is not null
  and tipo_imputacion is null;

with seed as (
  select *
  from (values
    (1,'pto 2607-25','pto 2606-25','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2025-06-26'::date,'Contactores Alimak',629460::numeric,2,'gasto_reembolsable'),
    (2,'pto 0207-25','pto 0207-25','PE (PROPUESTA ECONOMICA)','NODO 3700','2025-07-02'::date,'Inductivos 3700',254765::numeric,2,'gasto_reembolsable'),
    (3,'JAULAOTIS-IT-0307-25','pto 0307-25','IT (INFORME TECNICO)','JAULA OTIS','2025-07-03'::date,'Trabajos cable limitador Jaula OTIS',1665392::numeric,2,'gasto_reembolsable'),
    (4,'pto 0807-25','pto 0807-25','PE (PROPUESTA ECONOMICA)','NODO 3700','2025-07-08'::date,'Variador Otis 3700',2583800::numeric,2,'gasto_reembolsable'),
    (5,'pto 2008-2025','2008','PE (PROPUESTA ECONOMICA)','JAULA ASEA','2025-08-20'::date,'Cortina Infraroja para Jaula Asea',1500000::numeric,3,'gasto_reembolsable'),
    (6,'HILTON03-PE-0309-25-01',null,'PE (PROPUESTA ECONOMICA)','HILTON 03 SERVICIOS','2025-09-03'::date,'Modernización y puesta en marcha de montacargas Casino Hilton',43113367::numeric,5,'estandarizacion'),
    (7,'HILTON02-PE-0809-25-01','HILTON02-PE-0809-25-01','PE (PROPUESTA ECONOMICA)','HILTON 02 ALIMENTACION','2025-09-08'::date,'Cable de acero y prensas para cable de combinación de puertas Hilton 2',225614::numeric,4,'gasto_reembolsable'),
    (8,'ALIMAK-PE-0909-25-01','ALIMAK-PE-0909-25-01','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2025-09-09'::date,'Trabajos cuadro de comando Jaula ALIMAK',378708::numeric,4,'gasto_reembolsable'),
    (9,'ALIMAK-PE-0909-25-02','ALIMAK-PE-0909-25-02','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2025-09-09'::date,'Trabajos de cambio de repuestos en puesta en marcha Jaula ALIMAK',178753::numeric,4,'gasto_reembolsable'),
    (10,'ASEA-PE-1002-26','ASEA-PE-1002-26','PE (PROPUESTA ECONOMICA)','JAULA ASEA','2026-02-10'::date,'Suministro cortina infrarroja Jaula ASEA',1605000::numeric,11,'gasto_reembolsable'),
    (11,'ASEA-PE-1004-26',null,'PE (PROPUESTA ECONOMICA)','JAULA ASEA','2026-04-10'::date,'Instalacion y perforación guias especiales',4486125::numeric,11,'estandarizacion'),
    (12,'ASEA-PE-1208-26','ASEA-PE-1208-26','PE (PROPUESTA ECONOMICA)','JAULA ASEA','2026-08-12'::date,'Suministro piolas terminal gancho y resorte',1566191::numeric,15,'gasto_reembolsable'),
    (13,'NODO3700-PE-1310-25','NODO3700-PE-1310-25','PE (PROPUESTA ECONOMICA)','NODO 3700','2025-10-13'::date,'Estabilizador de tensión trifásico Nodo 3700',1101325::numeric,5,'gasto_reembolsable'),
    (14,'EILA01-PE-2910-25','EILA01-PE-2910-25','PE (PROPUESTA ECONOMICA)','EILA 01','2025-10-29'::date,'Suministro (2) motor inducción trifásica MKQS8',1840400::numeric,6,'gasto_reembolsable'),
    (15,'EILA01-PE-2310-25','EILA01-PE-2310-25','PE (PROPUESTA ECONOMICA)','EILA 01','2025-10-29'::date,'Suministro (2) Contactores marca Siemens, modelo 3TH2031-7JB4, 3NO+1NC',568934::numeric,6,'gasto_reembolsable'),
    (16,'ALIMAK-PE-1011-25','ALIMAK-PE-1011-25','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2025-11-07'::date,'Ajuste y calibración de limitador de velocidad Jaula ALIMAK',513600::numeric,6,'gasto_reembolsable'),
    (17,'ALIMAK-PE-0411-25 V1','ALIMAK-PE-0411-25 V1','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2025-11-11'::date,'Repuestos cuadro de comando Jaula ALIMAK.',236864::numeric,6,'gasto_reembolsable'),
    (18,'NODO3700-PE-3112-25','NODO3700-PE-3112-25','PE (PROPUESTA ECONOMICA)','NODO 3700','2025-12-31'::date,'Suministro reparación de horquilla y rodillos puerta de piso',820931::numeric,8,'gasto_reembolsable'),
    (19,'Cotización COT1575 Curso EC Stainher','Cotización COT1575 Curso EC Stainher','PE (PROPUESTA ECONOMICA)','Otros','2025-01-27'::date,'Curso Técnicas de Trabajo en Espacios Confinados',1260000::numeric,12,'gasto_reembolsable'),
    (20,'Cotización COT1543 RC N°22 Stainher','Cotización COT1543 RC N°22 Stainher','PE (PROPUESTA ECONOMICA)','Otros','2025-01-27'::date,'Curso Instalaciones Industriales y sus Estructuras RC N°22',2310000::numeric,12,'gasto_reembolsable'),
    (21,'ASEA-PE-2429-25-01','ASEA-PE-2429-25-01','PE (PROPUESTA ECONOMICA)','JAULA ASEA','2025-09-24'::date,'Aceite caja reductora Jaula ASEA.',7325620::numeric,5,'gasto_reembolsable'),
    (22,'ALIMAK-PE-1002-26','ALIMAK-PE-1002-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-02-10'::date,'Suministro piñon montacargas',5019638::numeric,9,'gasto_reembolsable'),
    (23,'ASEA-PE-0610-25','ASEA-PE-0610-25','PE (PROPUESTA ECONOMICA)','JAULA ASEA','2025-10-06'::date,'Fabricación y reemplazo de guiadores Jaula ASEA.',1264740::numeric,5,'gasto_reembolsable'),
    (24,'ASEA-PE-0202-26','ASEA-PE-0202-26','PE (PROPUESTA ECONOMICA)','JAULA ASEA','2025-02-03'::date,'Roldana de suspensión en poliamida 74mm (32 unidades) / Roldana de suspensión excéntrica 48mm (32 unidades)',6107800::numeric,9,'gasto_reembolsable'),
    (25,'EILA01-PE-0903-26','EILA01-PE-0903-26','PE (PROPUESTA ECONOMICA)','EILA 01','2026-03-09'::date,'Suministro de correas operador puertas EILA 01 y EILA 02',925978::numeric,10,'gasto_reembolsable'),
    (26,'ALIMAK-PE-1803-26','ALIMAK-PE-1803-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-03-18'::date,'Trabajos cuadro de comando Jaula ALIMAK',950113::numeric,10,'gasto_reembolsable'),
    (27,'ALIMAK-PE-2703-26','ALIMAK-PE-2703-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-03-27'::date,'Trabajos reemplazo de contactores de comando Jaula ALIMAK',1716834::numeric,11,'gasto_reembolsable'),
    (28,'ALIMAK-PE-3103-26','ALIMAK-PE-3103-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-03-31'::date,'Suministro piñon montacargas',3628638::numeric,11,'gasto_reembolsable'),
    (29,'ALIMAK-PE-1004-26','ALIMAK-PE-1004-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-04-10'::date,'Suministro de contactores de comando Jaula ALIMAK',1716834::numeric,11,'gasto_reembolsable'),
    (30,'ALIMAK-PE-1506-26','ALIMAK-PE-1506-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-06-15'::date,'Roldanas cable viajante Jaula ALIMAK',457404::numeric,13,'gasto_reembolsable'),
    (31,'NODO3700-PE-2206-26','NODO3700-PE-2206-26','PE (PROPUESTA ECONOMICA)','NODO 3700','2026-06-22'::date,'Estabilizador de tensión trifásico Nodo 3700',1393228::numeric,15,'gasto_reembolsable'),
    (32,'HILTON02-PE-2007-26-0','HILTON02-PE-2007-26-0','PE (PROPUESTA ECONOMICA)','HILTON 02 ALIMENTACION','2026-07-20'::date,'Suministro cable de acero',213893::numeric,14,'gasto_reembolsable'),
    (33,'HILTON02-PE-2007-26-1','HILTON02-PE-2007-26-1','PE (PROPUESTA ECONOMICA)','HILTON 02 ALIMENTACION','2026-07-20'::date,'Fuente de poder 12VDC 10A Hilton 2',129147::numeric,14,'gasto_reembolsable'),
    (34,'HILTON02-PE-2007-26-2','HILTON02-PE-2007-26-2','PE (PROPUESTA ECONOMICA)','HILTON 02 ALIMENTACION','2026-07-20'::date,'Contactos de puerta Hilton 2',214808::numeric,14,'gasto_reembolsable'),
    (35,'ALIMAK-PE-2007-26','ALIMAK-PE-2007-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-07-20'::date,'Suministro sensor inductivo Z30N',468038::numeric,14,'gasto_reembolsable'),
    (36,'ALIMAK-PE-1108-26','ALIMAK-PE-1108-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-08-11'::date,'Roldanas cable viajante Jaula ALIMAK',457404::numeric,15,'gasto_reembolsable'),
    (37,'ALIMAK-PE-1208-26','ALIMAK-PE-1208-26','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-08-12'::date,'Suministro rodamientos trole sensor cable viajante',639488::numeric,15,'gasto_reembolsable'),
    (38,'ALIMAK-PE-1208-26-1','ALIMAK-PE-1208-26-1','PE (PROPUESTA ECONOMICA)','JAULA ALIMAK','2026-08-12'::date,'Guias cable viajante Jaula ALIMAK',416340::numeric,15,'gasto_reembolsable')
  ) as x(ord,codigo,codigo_ggrr,tipo_documento,equipo,fecha,detalle,monto_neto,ep_num,tipo_imputacion)
),
resolved as (
  select s.*,
         e.id as estado_pago_id,
         g.id as gasto_reembolsable_id
  from seed s
  join public.estados_pago e on e.ep_num=s.ep_num
  left join public.gastos_reembolsables g
    on s.codigo_ggrr is not null
   and lower(trim(g.codigo_documento))=lower(trim(s.codigo_ggrr))
   and g.ep_num=s.ep_num
),
validated as (
  select *
  from resolved
  where (tipo_imputacion='estandarizacion' and gasto_reembolsable_id is null)
     or (tipo_imputacion='gasto_reembolsable' and gasto_reembolsable_id is not null)
)
insert into public.presupuestos_tecnico_comerciales_v1524(
  codigo,
  equipo_nombre,
  fecha,
  materiales,
  fletes,
  utilidad_pct,
  subtotal_materiales,
  subtotal_fletes,
  total_costos_netos,
  utilidad,
  venta_neta,
  iva,
  total_final,
  observacion,
  estado,
  created_by,
  estado_pago_id,
  gasto_reembolsable_id,
  asignado_ggrr_at,
  asignado_ggrr_by,
  tipo_imputacion,
  registro_historico,
  tipo_documento_origen
)
select
  codigo,
  equipo,
  fecha,
  '[]'::jsonb,
  '[]'::jsonb,
  0,
  0,
  0,
  0,
  0,
  monto_neto,
  round(monto_neto*0.19),
  monto_neto+round(monto_neto*0.19),
  detalle,
  'aprobado',
  '44b92981-9398-42cb-a334-a51baa876125'::uuid,
  estado_pago_id,
  gasto_reembolsable_id,
  case when tipo_imputacion='gasto_reembolsable' then now() else null end,
  case when tipo_imputacion='gasto_reembolsable' then '44b92981-9398-42cb-a334-a51baa876125'::uuid else null end,
  tipo_imputacion,
  true,
  tipo_documento
from validated
on conflict (codigo) do update
set equipo_nombre=excluded.equipo_nombre,
    fecha=excluded.fecha,
    venta_neta=excluded.venta_neta,
    iva=excluded.iva,
    total_final=excluded.total_final,
    observacion=excluded.observacion,
    estado_pago_id=excluded.estado_pago_id,
    gasto_reembolsable_id=excluded.gasto_reembolsable_id,
    tipo_imputacion=excluded.tipo_imputacion,
    registro_historico=true,
    tipo_documento_origen=excluded.tipo_documento_origen,
    updated_at=now();

-- Seguridad de integridad: la carga debe resolver exactamente los 38 antecedentes.
do $$
declare
  v_count integer;
  v_ggrr integer;
  v_std integer;
begin
  select count(*),
         count(*) filter (where registro_historico and tipo_imputacion='gasto_reembolsable'),
         count(*) filter (where registro_historico and tipo_imputacion='estandarizacion')
  into v_count,v_ggrr,v_std
  from public.presupuestos_tecnico_comerciales_v1524
  where registro_historico=true;

  if v_count < 38 or v_ggrr < 36 or v_std < 2 then
    raise exception 'Carga histórica incompleta: total %, GGRR %, estandarización %',v_count,v_ggrr,v_std;
  end if;
end $$;
