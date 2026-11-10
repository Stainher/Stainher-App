create schema if not exists stainher_control_privado;
revoke all on schema stainher_control_privado from public, anon, authenticated;
grant usage on schema stainher_control_privado to authenticated;

create or replace function stainher_control_privado.controles_responsables_r416()
returns table(user_id uuid, nombre text)
language sql
stable
security definer
set search_path = ''
as $$
  select p.id, btrim(p.nombre)
  from public.perfiles p
  where (select auth.uid()) is not null
    and (select public.mi_rol()) <> ''
    and p.activo
    and nullif(btrim(p.nombre), '') is not null
  order by btrim(p.nombre), p.id
$$;

revoke execute on function stainher_control_privado.controles_responsables_r416() from public, anon, authenticated;
grant execute on function stainher_control_privado.controles_responsables_r416() to authenticated;

create or replace function public.controles_responsables_r416()
returns table(user_id uuid, nombre text)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from stainher_control_privado.controles_responsables_r416()
$$;

revoke execute on function public.controles_responsables_r416() from public, anon, authenticated;
grant execute on function public.controles_responsables_r416() to authenticated;

create policy controles_stainher_ejecucion_r416
on public.liderazgo_cumplimiento for insert to authenticated
with check (
  (select public.mi_rol()) <> ''
  and created_by = (select auth.uid())
  and ejecutado_por_user_id = (select auth.uid())
  and estado = 'realizado'
);

create policy controles_stainher_plantillas_activas_r416
on public.liderazgo_plantillas_v1512 for select to authenticated
using (activo and (select public.mi_rol()) <> '');

create or replace function stainher_control_privado.controles_vehiculos_r416()
returns table(patente text, marca_modelo text, kilometraje bigint, estado text)
language sql
stable
security definer
set search_path = ''
as $$
  select v.patente::text, v.marca_modelo::text, v.kilometraje::bigint, v.estado::text
  from public.vehiculos_contrato v
  where (select auth.uid()) is not null and (select public.mi_rol()) <> ''
  order by v.patente
$$;

revoke execute on function stainher_control_privado.controles_vehiculos_r416() from public, anon, authenticated;
grant execute on function stainher_control_privado.controles_vehiculos_r416() to authenticated;

create or replace function public.controles_vehiculos_r416()
returns table(patente text, marca_modelo text, kilometraje bigint, estado text)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from stainher_control_privado.controles_vehiculos_r416()
$$;

revoke execute on function public.controles_vehiculos_r416() from public, anon, authenticated;
grant execute on function public.controles_vehiculos_r416() to authenticated;

-- Conserva el registro transaccional del control y la inspección del vehículo.
CREATE OR REPLACE FUNCTION public.registrar_control4_v151(p_supervisor_user_id uuid, p_supervisor_nombre text, p_fecha date, p_patente text, p_kilometraje bigint, p_inspector text, p_resultado text, p_observaciones text)
 RETURNS uuid
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
declare
 v_actual bigint;
 v_id uuid;
 v_uid uuid := (select auth.uid());
begin
 if v_uid is null then raise exception 'Sesión requerida'; end if;
 if public.mi_rol() = '' then
   raise exception 'Se requiere un perfil activo para registrar el Check List de vehículo';
 end if;
 if p_patente is null or trim(p_patente)='' then
   raise exception 'Debes seleccionar la patente del vehículo';
 end if;
 select coalesce(kilometraje,0)::bigint into v_actual
 from public.vehiculos_contrato where patente=p_patente limit 1;
 if not found then raise exception 'No existe el vehículo % en la ficha de Vehículos',p_patente; end if;
 if p_kilometraje < v_actual then
   raise exception 'El kilometraje ingresado (%) no puede ser menor al último registrado (%)',p_kilometraje,v_actual;
 end if;
 insert into public.liderazgo_cumplimiento(
   supervisor_user_id,supervisor_nombre,control_codigo,control_nombre,
   fecha,anio,mes,estado,created_by,ejecutado_por_user_id,ejecutado_por_nombre,
   ejecutado_por_rol,fuera_programacion,detalle
 ) values(
   p_supervisor_user_id,p_supervisor_nombre,'CTRL-04','Check List de Camioneta',
   p_fecha,extract(year from p_fecha)::integer,extract(month from p_fecha)::integer,
   'realizado',v_uid,v_uid,coalesce(p_inspector,public.mi_nombre()),public.mi_rol(),
   true,
   jsonb_build_object(
      'items', jsonb_build_array(
         jsonb_build_array('Patente',p_patente),
         jsonb_build_array('Kilometraje',p_kilometraje::text),
         jsonb_build_array('Resultado',coalesce(nullif(p_resultado,''),'CONFORME'))
      ),
      'observaciones',coalesce(p_observaciones,'')
   )
 ) returning id into v_id;
 update public.vehiculos_contrato
 set kilometraje=p_kilometraje,
     ultima_inspeccion_fecha=p_fecha,
     ultima_inspeccion_resultado=coalesce(nullif(p_resultado,''),'CONFORME'),
     ultima_inspeccion_por=p_inspector
 where patente=p_patente;
 insert into public.vehiculo_inspecciones_v151(
   patente,fecha,kilometraje,inspector,resultado,observaciones,creado_por
 ) values (
   p_patente,p_fecha,p_kilometraje,p_inspector,
   coalesce(nullif(p_resultado,''),'CONFORME'),p_observaciones,v_uid
 );
 return v_id;
end;
$function$;
