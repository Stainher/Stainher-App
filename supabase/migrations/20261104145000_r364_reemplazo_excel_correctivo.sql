-- R364: backup and atomic replacement of corrective records
create table if not exists public.respaldos_averias_r364(
 id uuid primary key default gen_random_uuid(),
 importacion_id uuid references public.importaciones_averias(id) on delete set null,
 usuario_id uuid not null references auth.users(id),archivo text not null,
 registros_anteriores integer not null,registros_nuevos integer not null,
 datos_anteriores jsonb not null,creado_en timestamptz not null default now()
);
create index if not exists respaldos_averias_r364_fecha on public.respaldos_averias_r364(creado_en desc);
alter table public.respaldos_averias_r364 enable row level security;
revoke all on public.respaldos_averias_r364 from anon;
grant select,insert on public.respaldos_averias_r364 to authenticated;
drop policy if exists respaldos_averias_r364_select on public.respaldos_averias_r364;
create policy respaldos_averias_r364_select on public.respaldos_averias_r364 for select to authenticated using(lower(public.mi_rol()) in ('administrador','confiabilidad'));
drop policy if exists respaldos_averias_r364_insert on public.respaldos_averias_r364;
create policy respaldos_averias_r364_insert on public.respaldos_averias_r364 for insert to authenticated with check(usuario_id=(select auth.uid()) and lower(public.mi_rol()) in ('administrador','confiabilidad'));
CREATE OR REPLACE FUNCTION public.reemplazar_averias_excel_r364(p_filas jsonb, p_archivo text, p_cantidad_esperada integer)
 RETURNS jsonb
 LANGUAGE plpgsql
 SET search_path TO ''
AS $function$
declare
 v_uid uuid := auth.uid();
 v_rol text := lower(coalesce(public.mi_rol(),''));
 v_actual integer;
 v_count integer;
 v_importacion uuid;
 v_respaldo uuid;
 v_rows jsonb;
begin
 if v_uid is null or v_rol not in ('administrador','confiabilidad')
   or not public.tiene_permiso('correctivo','editar') then
  raise exception 'Solo Confiabilidad y Administrador con permiso de edición pueden reemplazar averías';
 end if;
 if p_filas is null or jsonb_typeof(p_filas)<>'array' then
  raise exception 'Se requiere un listado validado de filas';
 end if;
 v_count := jsonb_array_length(p_filas);
 if v_count<1 or v_count>10000 then
  raise exception 'Se requieren entre 1 y 10000 filas válidas';
 end if;
 if length(trim(coalesce(p_archivo,'')))<4 or length(p_archivo)>240 then
  raise exception 'Archivo Excel no válido';
 end if;
 perform pg_advisory_xact_lock(739364,1);
 select count(*) into v_actual from public.averias;
 if p_cantidad_esperada is distinct from v_actual then
   raise exception 'La base cambió desde la vista previa (% frente a %). Actualice e intente nuevamente.',p_cantidad_esperada,v_actual;
 end if;
 if exists(
   select 1 from jsonb_array_elements(p_filas) as x(f)
   where jsonb_typeof(f)<>'object'
      or length(trim(coalesce(f->>'equipo_original','')))=0
      or (nullif(f->>'fecha_inicio','') is null and nullif(f->>'fecha_hora_falla','') is null)
 ) then
   raise exception 'El Excel contiene registros sin equipo o fecha inicial';
 end if;
 -- Respaldo completo antes de la operación, incluyendo registros manuales.
 select coalesce(jsonb_agg(to_jsonb(a)),'[]'::jsonb) into v_rows from public.averias a;
 insert into public.importaciones_averias(nombre_archivo,total_registros,registros_nuevos,
   registros_duplicados,registros_error,usuario_id)
 values(trim(p_archivo),v_count,v_count,0,0,v_uid) returning id into v_importacion;
 insert into public.respaldos_averias_r364(importacion_id,usuario_id,archivo,
   registros_anteriores,registros_nuevos,datos_anteriores)
 values(v_importacion,v_uid,trim(p_archivo),v_actual,v_count,v_rows)
 returning id into v_respaldo;
 delete from public.averias;
 if (select count(*) from public.averias)<>0 then
   raise exception 'No fue posible vaciar la base anterior';
 end if;
 insert into public.averias (
   equipo_original,numero_guia,supervisor_tecnico,
   fecha_inicio,hora_inicio,fecha_termino,hora_termino,
   estado_final,observaciones,duracion_minutos,
   clave_unica,importacion_id,created_by,
   id_falla,fecha_hora_falla,fecha_hora_restitucion,
   excluir_kpi,motivo_exclusion,observacion_exclusion
 )
 select
   nullif(trim(r.equipo_original),''),
   nullif(trim(r.numero_guia),''),
   nullif(trim(r.supervisor_tecnico),''),
   r.fecha_inicio,
   nullif(trim(r.hora_inicio),''),
   r.fecha_termino,
   nullif(trim(r.hora_termino),''),
   nullif(trim(r.estado_final),''),
   nullif(trim(r.observaciones),''),
   r.duracion_minutos,
   'r364-'||v_importacion::text||'-'||ord::text,
   v_importacion,v_uid,
   nullif(trim(r.id_falla),''),
   r.fecha_hora_falla,r.fecha_hora_restitucion,
   coalesce(r.excluir_kpi,false),nullif(trim(r.motivo_exclusion),''),
   nullif(trim(r.observacion_exclusion),'')
 from jsonb_array_elements(p_filas) with ordinality as e(obj,ord)
 cross join lateral jsonb_to_record(e.obj) as r(
   equipo_original text,numero_guia text,supervisor_tecnico text,
   fecha_inicio date,hora_inicio text,fecha_termino date,hora_termino text,
   estado_final text,observaciones text,duracion_minutos integer,
   id_falla text,fecha_hora_falla timestamp,fecha_hora_restitucion timestamp,
   excluir_kpi boolean,motivo_exclusion text,observacion_exclusion text
 );
 if (select count(*) from public.averias where importacion_id=v_importacion)<>v_count then
  raise exception 'No se insertaron todas las filas. Se conservará la base anterior';
 end if;
 return jsonb_build_object('anteriores',v_actual,'nuevos',v_count,
   'respaldo_id',v_respaldo,'importacion_id',v_importacion);
end $function$

revoke all on function public.reemplazar_averias_excel_r364(jsonb,text,integer) from public,anon;
grant execute on function public.reemplazar_averias_excel_r364(jsonb,text,integer) to authenticated;
