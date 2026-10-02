-- R141 · Nuevo módulo Estandarización.
-- Controla actividades de normalización/estandarización de equipos y precarga
-- los 55 registros del archivo "pendientes normalizacion equipos .xlsx".

create table if not exists public.estandarizacion_actividades_v141 (
  id uuid primary key default gen_random_uuid(),
  equipo text not null,
  actividad text not null,
  alcance text,
  observacion text,
  estado text not null default 'NO REALIZADO'
    check (estado in ('REALIZADO','EN PROCESO','NO REALIZADO')),
  fecha_ejecucion date,
  responsable text,
  detalle_ejecucion text,
  source_key text unique,
  orden integer not null default 0,
  activo boolean not null default true,
  created_by uuid,
  updated_by uuid,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists estandarizacion_v141_equipo_idx
  on public.estandarizacion_actividades_v141(equipo);
create index if not exists estandarizacion_v141_estado_idx
  on public.estandarizacion_actividades_v141(estado);
create index if not exists estandarizacion_v141_activo_idx
  on public.estandarizacion_actividades_v141(activo);

alter table public.estandarizacion_actividades_v141 enable row level security;

drop policy if exists estandarizacion_v141_select on public.estandarizacion_actividades_v141;
create policy estandarizacion_v141_select
on public.estandarizacion_actividades_v141
for select
to authenticated
using (
  public.mi_rol() in ('administrador','gerente','planificador','confiabilidad','prevencion','supervisor')
);

drop policy if exists estandarizacion_v141_insert on public.estandarizacion_actividades_v141;
create policy estandarizacion_v141_insert
on public.estandarizacion_actividades_v141
for insert
to authenticated
with check (
  public.mi_rol() in ('administrador','planificador','confiabilidad','prevencion','supervisor')
);

drop policy if exists estandarizacion_v141_update on public.estandarizacion_actividades_v141;
create policy estandarizacion_v141_update
on public.estandarizacion_actividades_v141
for update
to authenticated
using (
  public.mi_rol() in ('administrador','planificador','confiabilidad','prevencion','supervisor')
)
with check (
  public.mi_rol() in ('administrador','planificador','confiabilidad','prevencion','supervisor')
);

drop policy if exists estandarizacion_v141_delete on public.estandarizacion_actividades_v141;
create policy estandarizacion_v141_delete
on public.estandarizacion_actividades_v141
for delete
to authenticated
using (public.mi_rol()='administrador');

create or replace function public.touch_estandarizacion_v141()
returns trigger
language plpgsql
set search_path='public'
as $function$
begin
  new.updated_at=now();
  new.updated_by=auth.uid();
  return new;
end;
$function$;

drop trigger if exists trg_touch_estandarizacion_v141 on public.estandarizacion_actividades_v141;
create trigger trg_touch_estandarizacion_v141
before update on public.estandarizacion_actividades_v141
for each row execute function public.touch_estandarizacion_v141();

with seed as (
  select *
  from jsonb_to_recordset($seed$
[{"orden":1,"equipo":"JAULA ASEA","actividad":"puertas de pozo y escalera","alcance":"fabricación e instalacion de escalera","observacion":"fabricar escalera","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":"escaleras listas, falta puerta de pozo","responsable":null,"source_key":"excel-normalizacion-2026-10-02-001"},{"orden":2,"equipo":"JAULA ASEA","actividad":"botones Stop en pozo","alcance":"instalar botones stop nivel de pozo","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-002"},{"orden":3,"equipo":"JAULA ASEA","actividad":"toma corriente pozo","alcance":"instalar en techo pozo","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-003"},{"orden":4,"equipo":"JAULA ASEA","actividad":"iluminacion de escotilla","alcance":"instalacion de estancos","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":"se instalan 10 estancos","responsable":null,"source_key":"excel-normalizacion-2026-10-02-004"},{"orden":5,"equipo":"JAULA ASEA","actividad":"avisos de acceso restringido sala de maquina","alcance":"rotular y señalizar","observacion":"falta fabricar e instalar","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-005"},{"orden":6,"equipo":"JAULA ASEA","actividad":"botones Stop en sala de maquina","alcance":"instalar boton stop en sala de maquina","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-006"},{"orden":7,"equipo":"JAULA ASEA","actividad":"luz de emergencia en cabina","alcance":"Iluminacion de emergencia de 1 hora de autonomia","observacion":"falta iluminacion","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-007"},{"orden":8,"equipo":"JAULA ASEA","actividad":"diferencial de 30 mA en protecciones","alcance":"instalar diferencial","observacion":"falta instalar","estado":"REALIZADO","fecha_ejecucion":"2026-08-24","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-008"},{"orden":9,"equipo":"JAULA ASEA","actividad":"iluminacion con proteccion independientes","alcance":"independizar protecciones","observacion":"falta instalar luminarias","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-009"},{"orden":10,"equipo":"JAULA ASEA","actividad":"toma corriente sobre cabina","alcance":"instalar caja de enchufe","observacion":"falta cable de alimentacion","estado":"REALIZADO","fecha_ejecucion":"2026-09-06","detalle_ejecucion":"06-09-2026 POR LUIS ROJAS","responsable":"Luis Rojas","source_key":"excel-normalizacion-2026-10-02-010"},{"orden":11,"equipo":"JAULA ASEA","actividad":"toma corriente en sala de maquina","alcance":"instalar caja de enchufe","observacion":"falta cable de alimentacion","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-011"},{"orden":12,"equipo":"JAULA ASEA","actividad":"citofono entre sala de maquinas y cabina","alcance":"verificar compatibilidad del componente","observacion":"se debe ver por ingenieria","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-012"},{"orden":13,"equipo":"JAULA ASEA","actividad":"rotular elementos sobre cabina","alcance":"rotular y señalizar","observacion":"sin rotuladora (17-07)","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-013"},{"orden":14,"equipo":"JAULA ASEA","actividad":"rotular protecciones de TDF","alcance":"rotular y señalizar","observacion":"sin rotuladora (17-07)","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-014"},{"orden":15,"equipo":"JAULA ALIMAK","actividad":"instalacion de toma corriente pozo","alcance":"instalar en punto especifico del pozo","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-015"},{"orden":16,"equipo":"JAULA ALIMAK","actividad":"interruptor 9/24","alcance":"falta comprar interruptor","observacion":"sin recurso por SAP, se debe comprar","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-016"},{"orden":17,"equipo":"JAULA ALIMAK","actividad":"instalacion de iluminacion en vertical de foso","alcance":"instalacion de estancos","observacion":"falta cable de alimentacion","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-017"},{"orden":18,"equipo":"JAULA ALIMAK","actividad":"iluminacion de emergencia en sala de maquinas","alcance":"falta instalacion","observacion":"falta instalar/falta de cable","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-018"},{"orden":19,"equipo":"JAULA ALIMAK","actividad":"iluminacion de emergencia interior cabina","alcance":"falta instalacion","observacion":"falta instalar/falta de cable","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-019"},{"orden":20,"equipo":"JAULA ALIMAK","actividad":"realizar aterramiento de la estructuras de la jaula","alcance":"se debe estudiar el tipo de aterramiento","observacion":"sin materiales asignados","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-020"},{"orden":21,"equipo":"JAULA ALIMAK","actividad":"instalacion de toma corriente techo de cabina","alcance":"instalar en punto especifico de sala maquinas","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-021"},{"orden":22,"equipo":"JAULA ALIMAK","actividad":"rotular con parada emergencia stop en pozo","alcance":"rotular y señalizar","observacion":"sin cartucho en rotuladora","estado":"REALIZADO","fecha_ejecucion":"2026-08-21","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-022"},{"orden":23,"equipo":"JAULA ALIMAK","actividad":"rotular salida de escotilla en techo de cabina","alcance":"rotular y señalizar","observacion":"sin cartucho en rotuladora","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-023"},{"orden":24,"equipo":"JAULA ALIMAK","actividad":"rotular freno de auto rescate","alcance":"rotular y señalizar","observacion":"sin cartucho en rotuladora","estado":"REALIZADO","fecha_ejecucion":"2026-08-21","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-024"},{"orden":25,"equipo":"NODO 3700","actividad":"revisar la iluminacion de la escotilla (cuanta con menos de 50 lux en recorrido)","alcance":"se debe instalar estancos para fortalecer la iluminacon de escotilla","observacion":"usar estancos cada 3 metros","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-025"},{"orden":26,"equipo":"NODO 3700","actividad":"FALTA INSTALAR proteccion AUTOMATICA C32 A curva D","alcance":"se debe ofertar o ver disponibilidad por mandante, según recomendación vendor debe ser asi","observacion":"es importante para la proteccion del estabilizador de voltaje.","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-026"},{"orden":27,"equipo":"NODO 3700","actividad":"interruptores independinetes","alcance":"se debe independizar las lineas de alimentacion","observacion":"verificar espacios en TDF","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-027"},{"orden":28,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"instalar protecciones para la iluminacion de escotilla y sala de maquina independiente","alcance":"se debe independizar los alimentadores","observacion":"falta instalacion","estado":"REALIZADO","fecha_ejecucion":"2026-09-06","detalle_ejecucion":"se instalaron en cada uno pero la proteccion del hilton 3 esta solo conectada a las botoneras","responsable":null,"source_key":"excel-normalizacion-2026-10-02-028"},{"orden":29,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"instalacion de toma corriente sala de maquina","alcance":"instalar en punto especifico de sala maquinas","observacion":"falta cable de alimentacion","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-029"},{"orden":30,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"iluminacion de emergencia en sala de maquinas","alcance":"falta instalacion","observacion":"falta instalar/falta de cable","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-030"},{"orden":31,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"Tabla N° de pasajero, carga nominal y superficie útil","alcance":"se debe fabricar placa de identificacion","observacion":"sin fabricar","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-031"},{"orden":32,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"Procedimiento de rescate de pasajeros en sala máquinas. Debe ser de carga.","alcance":"se debe dejar informacion a disponibilidad de cualquier persona","observacion":"sin actividad","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-032"},{"orden":33,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"Identificar nivel de piso en caso de rescate pasajeros.","alcance":"se debe identificar en puertas de piso, numero de nivel","observacion":"en fabricacion de formato","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-033"},{"orden":34,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"Protección de partes móviles, deben ser removibles.","alcance":"se debe fabricar proteccion para evtar atrapamientos","observacion":"sin medidas ni planos","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-034"},{"orden":35,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"9/24 DE ESOCITILLA Y POZO","alcance":"falta comprar interruptor","observacion":"sin recurso por SAP, se debe comprar","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-035"},{"orden":36,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"INTERRUPTOR LUZ SALA DE MAQUINA","alcance":"se debe instalar","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-036"},{"orden":37,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"instalacion de toma corriente pozo y sala de maquina","alcance":"se debe instalar","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":"solo en sala de maquina","responsable":null,"source_key":"excel-normalizacion-2026-10-02-037"},{"orden":38,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"CARGA NOMINAL DE ASCENSOR Y PERSONAS N° DE ASC","alcance":"se debe fabricar placa de identificacion","observacion":"sin fabricar","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-038"},{"orden":39,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"rotular protecciones de TDF","alcance":"rotular y señalizar","observacion":"sin cartucho en rotuladora","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-039"},{"orden":40,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"identificar sentido de grio del motor","alcance":"pintar direccion de giro para evitar atrapamiento","observacion":"usar pintura o spray","estado":"REALIZADO","fecha_ejecucion":"2026-09-07","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-040"},{"orden":41,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"identificacion de nivel de piso","alcance":"se debe usar pintura o referencia","observacion":"usar pintura o spray","estado":"REALIZADO","fecha_ejecucion":"2026-09-07","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-041"},{"orden":42,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"ROTULO DE PARADA DE EMERGENCIA","alcance":"rotular en cada boton stop","observacion":"sin cartucho en rotuladora","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-042"},{"orden":43,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"instalar iluminacion en sala de maquinas","alcance":"instalar equipo estanco","observacion":"falta cable de alimentacion","estado":"REALIZADO","fecha_ejecucion":"2026-09-10","detalle_ejecucion":"HECHO POR LUIS CONTRERAS 10-09","responsable":"Luis Contreras","source_key":"excel-normalizacion-2026-10-02-043"},{"orden":44,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"INSTALAR PARADA DE EMERGENCIA EN SALA DE MAQUINAS","alcance":"INSTALAR BOTON","observacion":"FALTA RETIRO","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-044"},{"orden":45,"equipo":"Hilton 2 y 3 (Multiservicio)","actividad":"instalar iluminacion en escotilla no menor a 20 lux","alcance":"instalar sistema de iluminacion","observacion":"según espacios y especificaciones por medidas internas, ver tipo de iluminacion","estado":"REALIZADO","fecha_ejecucion":"2026-09-10","detalle_ejecucion":"HECHO POR LUIS CONTRERAS 10-09","responsable":"Luis Contreras","source_key":"excel-normalizacion-2026-10-02-045"},{"orden":46,"equipo":"Ascensor EILA 1 y 2","actividad":"iluminacion de escotilla","alcance":"instalacion de estancos","observacion":"falta cable de alimentacion","estado":"EN PROCESO","fecha_ejecucion":null,"detalle_ejecucion":"estancos instalados falta alimentar","responsable":null,"source_key":"excel-normalizacion-2026-10-02-046"},{"orden":47,"equipo":"Ascensor EILA 1 y 2","actividad":"tapar pasadas en sala de maquinas","alcance":"reducir los espacios para evitarcaidas","observacion":"se deben tomar medidas y espacios","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-047"},{"orden":48,"equipo":"Ascensor EILA 1 y 2","actividad":"instalar protecciones para la iluminacion de escotilla y sala de maquina independiente","alcance":"se debe independizar los alimentadores","observacion":"falta instalacion","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-048"},{"orden":49,"equipo":"Ascensor EILA 1 y 2","actividad":"instalar trifonia","alcance":"se debe instalar citofonia para comunicar sala de maquinas","observacion":"se debe realizar analisis por ingenieria para compatibilidad","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-049"},{"orden":50,"equipo":"Ascensor EILA 1 y 2","actividad":"rotular caja de inspeccion mas boton stop","alcance":"identificar los comandos","observacion":"sin cartucho en rotuladora","estado":"REALIZADO","fecha_ejecucion":"2026-08-23","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-050"},{"orden":51,"equipo":"Ascensor EILA 1 y 2","actividad":"rotular interruptores principales","alcance":"identificar las protecciones del TDF","observacion":"sin cartucho en rotuladora","estado":"REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-051"},{"orden":52,"equipo":"Ascensor EILA 1 y 2","actividad":"interruptor 9/24","alcance":"falta comprar interruptor","observacion":"sin recurso por SAP","estado":"NO REALIZADO","fecha_ejecucion":null,"detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-052"},{"orden":53,"equipo":"Ascensor EILA 1 y 2","actividad":"instalar foco de emergencia","alcance":"instalar estanco de emergencia","observacion":"tener en cunata los metros de alimentador","estado":"REALIZADO","fecha_ejecucion":"2026-06-25","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-053"},{"orden":54,"equipo":"Ascensor EILA 1 y 2","actividad":"rotular elementos sobre cabina","alcance":"identificar los elementos de sala de maquina","observacion":"sin cartucho en rotuladora","estado":"REALIZADO","fecha_ejecucion":"2026-08-23","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-054"},{"orden":55,"equipo":"Ascensor EILA 1 y 2","actividad":"identificar sentido de grio del motor","alcance":"pintar direccion de giro para evitar atrapamiento","observacion":"usar pintura o spray","estado":"REALIZADO","fecha_ejecucion":"2026-08-23","detalle_ejecucion":null,"responsable":null,"source_key":"excel-normalizacion-2026-10-02-055"}]
$seed$::jsonb) as x(
    orden integer,
    equipo text,
    actividad text,
    alcance text,
    observacion text,
    estado text,
    fecha_ejecucion date,
    detalle_ejecucion text,
    responsable text,
    source_key text
  )
)
insert into public.estandarizacion_actividades_v141
  (equipo,actividad,alcance,observacion,estado,fecha_ejecucion,responsable,detalle_ejecucion,source_key,orden)
select
  equipo,actividad,alcance,observacion,estado,fecha_ejecucion,responsable,detalle_ejecucion,source_key,orden
from seed
on conflict (source_key) do update
set equipo=excluded.equipo,
    actividad=excluded.actividad,
    alcance=excluded.alcance,
    observacion=excluded.observacion,
    estado=excluded.estado,
    fecha_ejecucion=excluded.fecha_ejecucion,
    responsable=excluded.responsable,
    detalle_ejecucion=excluded.detalle_ejecucion,
    orden=excluded.orden,
    activo=true,
    updated_at=now();
