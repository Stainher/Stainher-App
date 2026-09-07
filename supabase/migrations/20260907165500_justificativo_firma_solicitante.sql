create or replace function public.crear_justificativo_firmado_v1524(
  p_fecha date,
  p_institucion text,
  p_motivo text,
  p_texto text default null,
  p_firma text default null
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  v_name text;
  v_rrhh uuid;
  v_id uuid;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.'; end if;

  select lower(p.rol),coalesce(p.nombre,'Trabajador') into v_role,v_name
    from public.perfiles p where p.id=v_uid and p.activo=true;
  if v_role not in ('tecnico','supervisor') then
    raise exception 'Solo Técnicos y Supervisores pueden solicitar justificativos laborales.';
  end if;
  if p_fecha is null then raise exception 'Debes seleccionar la fecha que se justificará.'; end if;
  if length(btrim(coalesce(p_institucion,''))) not between 2 and 180 then
    raise exception 'Indica la institución o destinatario (2 a 180 caracteres).';
  end if;
  if length(btrim(coalesce(p_motivo,''))) not between 5 and 1500 then
    raise exception 'Describe el motivo del justificativo (5 a 1500 caracteres).';
  end if;
  if length(coalesce(p_texto,''))>2000 then
    raise exception 'El texto complementario no puede superar 2000 caracteres.';
  end if;
  if p_firma is null or p_firma not like 'data:image/png;base64,%' or length(p_firma)<100 then
    raise exception 'El justificativo requiere la firma personal del solicitante.';
  end if;

  select p.id into v_rrhh from public.perfiles p
   where p.activo=true and lower(p.rol)='recursos_humanos'
   order by p.nombre nulls last,p.id limit 1;
  if v_rrhh is null then
    raise exception 'No existe un perfil activo de Recursos Humanos para visar el justificativo.';
  end if;

  insert into public.solicitudes_v15
    (tipo,fecha_inicio,fecha_fin,comentario,estado,etapa,
     solicitante_user_id,solicitante_rol,created_by,
     aprobador_user_id,aprobador_rol,rrhh_user_id,
     justificativo_institucion,justificativo_texto,
     firma_solicitante,firmado_solicitante_at)
  values
    ('justificativo',p_fecha,p_fecha,btrim(p_motivo),'pendiente_rrhh','rrhh',
     v_uid,v_role,v_uid,v_rrhh,'recursos_humanos',v_rrhh,
     btrim(p_institucion),nullif(btrim(coalesce(p_texto,'')),''),p_firma,now())
  returning id into v_id;

  insert into public.notificaciones_v15
    (titulo,mensaje,prioridad,destinatario_user_id,created_by,modulo_destino,referencia_id)
  values
    ('Justificativo laboral pendiente de visado',
     v_name||' · '||to_char(p_fecha,'DD-MM-YYYY')||' · '||btrim(p_institucion),
     'importante',v_rrhh,v_uid,'solicitudes',v_id::text);

  return jsonb_build_object(
    'id',v_id::text,'tipo','justificativo','estado','pendiente_rrhh','etapa','rrhh',
    'solicitante_user_id',v_uid,'solicitante_rol',v_role,
    'aprobador_user_id',v_rrhh,'aprobador_rol','recursos_humanos','rrhh_user_id',v_rrhh
  );
end;
$$;

revoke all on function public.crear_justificativo_laboral_v1524(date,text,text,text) from public,anon,authenticated;
revoke all on function public.crear_justificativo_firmado_v1524(date,text,text,text,text) from public,anon;
grant execute on function public.crear_justificativo_firmado_v1524(date,text,text,text,text) to authenticated;
