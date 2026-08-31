-- STAINHER APP V15.22 · PARCHE CONSOLIDADO E IDEMPOTENTE
-- Compatible con el HTML consolidado V15.23. No incrementa la versión de la app.
-- Ejecutar en Supabase SQL Editor antes de publicar o reemplazar el HTML V15.23.
-- Conserva datos existentes y corrige funciones/restricciones requeridas por la app.

begin;

-- Turnos y Novedades: sincroniza todos los tipos visibles en la interfaz.
alter table if exists public.turnos_novedades_v15
  drop constraint if exists turnos_novedades_v15_tipo_check;
alter table if exists public.turnos_novedades_v15
  add constraint turnos_novedades_v15_tipo_check check (tipo in (
    'vacaciones','licencia_medica','permiso','falta','encierro',
    'encierro_planificado','encierro_no_planificado','suspendido_encierro',
    'dia_adicional','hora_extra','feriado','capacitacion','otro'
  )) not valid;

-- Campos usados por la malla/eventos actuales (seguros si ya existen).
alter table if exists public.turnos_novedades_v15 add column if not exists observacion text;
alter table if exists public.turnos_novedades_v15 add column if not exists turno_base text;
alter table if exists public.turnos_novedades_v15 add column if not exists clasificacion_auto text;
alter table if exists public.turnos_novedades_v15 add column if not exists hora_inicio time;
alter table if exists public.turnos_novedades_v15 add column if not exists hora_fin time;
alter table if exists public.turnos_novedades_v15 add column if not exists updated_at timestamptz default now();

-- Selección explícita del Gerente para solicitudes creadas por Administrador.
create or replace function public.seleccionar_aprobador_solicitud_v1522(
  p_id uuid,
  p_aprobador_id uuid
) returns public.solicitudes_v15
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.solicitudes_v15;
  v_role text;
begin
  if auth.uid() is null then raise exception 'Sesión no válida'; end if;
  select lower(coalesce(rol,'')) into v_role from public.perfiles where id=auth.uid() and activo=true;
  if v_role <> 'administrador' then raise exception 'Solo el Administrador puede seleccionar Gerente'; end if;
  if not exists(select 1 from public.perfiles where id=p_aprobador_id and activo=true and lower(rol)='gerente') then
    raise exception 'El Gerente seleccionado no está activo';
  end if;
  update public.solicitudes_v15
     set aprobador_user_id=p_aprobador_id, aprobador_rol='gerente'
   where id=p_id
     and solicitante_user_id=auth.uid()
     and tipo='vacaciones'
     and estado='pendiente'
   returning * into v_request;
  if v_request.id is null then raise exception 'Solicitud no encontrada o no editable'; end if;
  -- Si una función histórica creó avisos genéricos, se cierran todos antes de
  -- que el frontend cree el único aviso dirigido al Gerente elegido. Esto evita
  -- tanto avisos a otros Gerentes como duplicados para el seleccionado.
  update public.notificaciones_v15
     set descartada=true, resuelta=true, leida=true, leida_at=now()
   where referencia_id=p_id
     and modulo_destino='solicitudes'
     and coalesce(descartada,false)=false;
  insert into public.notificaciones_v15(
    titulo,mensaje,prioridad,destinatario_user_id,created_by,
    modulo_destino,referencia_id
  ) values (
    'Nueva solicitud',
    coalesce((select nombre from public.perfiles where id=auth.uid()),'Administrador') || ' · Vacaciones',
    'importante',p_aprobador_id,auth.uid(),'solicitudes',p_id
  );
  return v_request;
end;
$$;
revoke all on function public.seleccionar_aprobador_solicitud_v1522(uuid,uuid) from public, anon;
grant execute on function public.seleccionar_aprobador_solicitud_v1522(uuid,uuid) to authenticated;

-- Asignación segura de un único usuario activo de RR.HH. después de la aprobación.
create or replace function public.asignar_rrhh_solicitud_v1519(p_id uuid)
returns public.solicitudes_v15
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_request public.solicitudes_v15;
  v_rrhh uuid;
begin
  if auth.uid() is null then raise exception 'Sesión no válida'; end if;
  select id into v_rrhh from public.perfiles
   where activo=true and lower(rol)='recursos_humanos'
   order by nombre nulls last, id limit 1;
  if v_rrhh is null then raise exception 'No existe un usuario activo de Recursos Humanos'; end if;
  update public.solicitudes_v15
     set rrhh_user_id=case
       when exists(
         select 1 from public.perfiles p
          where p.id=solicitudes_v15.rrhh_user_id
            and p.activo=true and lower(p.rol)='recursos_humanos'
       ) then solicitudes_v15.rrhh_user_id
       else v_rrhh
     end,
     etapa='rrhh', estado='pendiente_rrhh'
   where id=p_id
     and aprobador_user_id=auth.uid()
     and tipo='vacaciones'
     and estado='pendiente_rrhh'
   returning * into v_request;
  if v_request.id is null then raise exception 'Solicitud no autorizada para este aprobador'; end if;
  update public.notificaciones_v15
     set descartada=true, resuelta=true, leida=true, leida_at=now()
   where referencia_id=p_id
     and modulo_destino='solicitudes'
     and coalesce(descartada,false)=false;
  insert into public.notificaciones_v15(
    titulo,mensaje,prioridad,destinatario_user_id,created_by,
    modulo_destino,referencia_id
  ) values (
    'Vacaciones pendientes de firma RR.HH.',
    'Solicitud aprobada jerárquicamente · ' || p_id::text,
    'importante',v_request.rrhh_user_id,auth.uid(),'solicitudes',p_id
  );
  return v_request;
end;
$$;
revoke all on function public.asignar_rrhh_solicitud_v1519(uuid) from public, anon;
grant execute on function public.asignar_rrhh_solicitud_v1519(uuid) to authenticated;

-- Fuerza actualización de la caché de esquema de PostgREST.
notify pgrst, 'reload schema';
commit;
