alter table public.liderazgo_controles_base_v1513
  add column if not exists codigo text,
  add column if not exists nombre text,
  add column if not exists descripcion text,
  add column if not exists frecuencia text;

update public.liderazgo_controles_base_v1513
set codigo = coalesce(codigo, case control_num
      when 4 then 'CTRL-04' when 5 then 'CTRL-05' when 6 then 'SGI-ST-REG-018'
      when 7 then 'CTRL-07' when 8 then 'CTRL-08' when 9 then 'CTRL-09' end),
    nombre = coalesce(nombre, case control_num
      when 4 then 'Check List de Camioneta'
      when 5 then 'Check List de Extintores'
      when 6 then 'Control Preventivo en Terreno'
      when 7 then 'Registro de Inspección de EPP'
      when 8 then 'Cartilla de Inspección Ambiental'
      when 9 then 'Protección Auditiva y Respiratoria' end),
    descripcion = coalesce(descripcion, case control_num
      when 4 then 'Check list de vehículo liviano + declaración de fatiga y somnolencia antes de conducir.'
      when 5 then 'Chequeo de ubicación, fechas y condición de componentes del extintor.'
      when 6 then 'Observaciones conductuales y condiciones del entorno.'
      when 7 then 'Inspección de equipos de protección personal.'
      when 8 then 'Inspección ambiental, sustancias y residuos peligrosos.'
      when 9 then 'Un solo reporte con protección auditiva y respiratoria.' end),
    frecuencia = coalesce(frecuencia, case control_num
      when 4 then 'Cada vez que aplique'
      when 5 then 'Mensual'
      when 6 then '1 vez por turno'
      when 7 then '1 vez por turno'
      when 8 then 'Cada vez que se realice manejo de sustancias químicas'
      when 9 then 'Todo el personal · 1 vez al mes' end)
where control_num between 4 and 9;

create or replace function public.admin_update_control_base_v1524(
  p_control_num integer,
  p_nombre text,
  p_descripcion text,
  p_frecuencia text,
  p_activo boolean
) returns void
language plpgsql
security definer
set search_path = public, pg_temp
as $$
begin
  if public.mi_rol() not in ('administrador','prevencion')
     or not public.tiene_permiso('liderazgo','editar') then
    raise exception 'No autorizado para administrar Controles Stainher';
  end if;
  if p_control_num not between 4 and 9 then raise exception 'Control estándar inválido'; end if;
  if nullif(btrim(p_nombre),'') is null then raise exception 'El nombre es obligatorio'; end if;
  if nullif(btrim(p_frecuencia),'') is null then raise exception 'La frecuencia es obligatoria'; end if;
  update public.liderazgo_controles_base_v1513
  set nombre=btrim(p_nombre), descripcion=coalesce(btrim(p_descripcion),''), frecuencia=btrim(p_frecuencia),
      activo=coalesce(p_activo,true), updated_at=now(), updated_by=auth.uid()
  where control_num=p_control_num;
  if not found then raise exception 'No se encontró el control estándar'; end if;
end;
$$;
revoke all on function public.admin_update_control_base_v1524(integer,text,text,text,boolean) from public;
grant execute on function public.admin_update_control_base_v1524(integer,text,text,text,boolean) to authenticated;

create or replace function public.admin_delete_archived_custom_control_v1524(p_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare v_codigo text; v_nombre text; v_activo boolean; v_hist bigint;
begin
  if public.mi_rol() not in ('administrador','prevencion')
     or not public.tiene_permiso('liderazgo','editar') then
    raise exception 'No autorizado para administrar Controles Stainher';
  end if;
  select codigo,nombre,activo into v_codigo,v_nombre,v_activo
  from public.liderazgo_plantillas_v1512 where id=p_id for update;
  if not found then raise exception 'Control no encontrado'; end if;
  if v_activo is distinct from false then raise exception 'Solo se pueden eliminar controles archivados'; end if;
  select count(*) into v_hist from public.liderazgo_cumplimiento where control_codigo=v_codigo;
  delete from public.liderazgo_plantillas_v1512 where id=p_id;
  return jsonb_build_object('codigo',v_codigo,'nombre',v_nombre,'historicos_conservados',v_hist);
end;
$$;
revoke all on function public.admin_delete_archived_custom_control_v1524(uuid) from public;
grant execute on function public.admin_delete_archived_custom_control_v1524(uuid) to authenticated;

drop policy if exists clean_liderazgo_plantillas_insert on public.liderazgo_plantillas_v1512;
create policy clean_liderazgo_plantillas_insert on public.liderazgo_plantillas_v1512
for insert to authenticated with check (
  public.mi_rol() in ('administrador','prevencion') and public.tiene_permiso('liderazgo','editar')
);

drop policy if exists clean_liderazgo_plantillas_delete on public.liderazgo_plantillas_v1512;
create policy clean_liderazgo_plantillas_delete on public.liderazgo_plantillas_v1512
for delete to authenticated using (
  public.mi_rol() in ('administrador','prevencion') and public.tiene_permiso('liderazgo','editar')
);

-- Limpieza solicitada: elimina plantillas ya archivadas que nunca fueron ejecutadas.
delete from public.liderazgo_plantillas_v1512 p
where p.activo=false
  and not exists (select 1 from public.liderazgo_cumplimiento c where c.control_codigo=p.codigo);
