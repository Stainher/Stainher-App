-- R129 · Permitir corrección de justificativos después de emitidos.
-- Mantiene el documento en estado aprobado/finalizado y registra quién/ cuándo lo corrigió.

alter table public.solicitudes_v15
  add column if not exists justificativo_editado_at timestamptz,
  add column if not exists justificativo_editado_por uuid references auth.users(id);

create or replace function public.editar_justificativo_emitido_v1524(
  p_id text,
  p_institucion text,
  p_cuerpo text
)
returns jsonb
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_uid uuid := auth.uid();
  v_role text;
  r public.solicitudes_v15%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.'; end if;

  select lower(coalesce(p.rol,''))
    into v_role
  from public.perfiles p
  where p.id=v_uid and p.activo=true;

  if v_role not in ('recursos_humanos','administrador') then
    raise exception 'Solo Recursos Humanos o Administrador pueden editar justificativos emitidos.';
  end if;

  select * into r
  from public.solicitudes_v15
  where id::text=p_id
  for update;

  if not found or r.tipo<>'justificativo' then
    raise exception 'Justificativo no encontrado.';
  end if;
  if r.estado<>'aprobada' or r.etapa<>'finalizada' then
    raise exception 'Solo se pueden editar justificativos ya emitidos.';
  end if;
  if v_role='recursos_humanos' and r.rrhh_user_id is distinct from v_uid then
    raise exception 'Este justificativo fue visado por otro perfil de Recursos Humanos.';
  end if;
  if length(btrim(coalesce(p_institucion,''))) not between 2 and 180 then
    raise exception 'Indica la institución destinataria.';
  end if;
  if length(btrim(coalesce(p_cuerpo,''))) not between 80 and 4000 then
    raise exception 'El texto del certificado debe contener entre 80 y 4000 caracteres.';
  end if;

  update public.solicitudes_v15
     set justificativo_institucion=btrim(p_institucion),
         justificativo_cuerpo=btrim(p_cuerpo),
         justificativo_emitido_at=now(),
         justificativo_editado_at=now(),
         justificativo_editado_por=v_uid
   where id::text=p_id;

  insert into public.notificaciones_v15
    (titulo,mensaje,prioridad,destinatario_user_id,created_by,modulo_destino,referencia_id)
  values
    ('Justificativo laboral actualizado',
     'Tu justificativo laboral emitido fue corregido y ya puedes descargar la versión actualizada.',
     'normal',r.solicitante_user_id,v_uid,'solicitudes',p_id);

  select * into r from public.solicitudes_v15 where id::text=p_id;

  return jsonb_build_object(
    'id',r.id::text,
    'tipo',r.tipo,
    'estado',r.estado,
    'etapa',r.etapa,
    'justificativo_institucion',r.justificativo_institucion,
    'justificativo_cuerpo',r.justificativo_cuerpo,
    'justificativo_emitido_at',r.justificativo_emitido_at,
    'justificativo_editado_at',r.justificativo_editado_at,
    'justificativo_editado_por',r.justificativo_editado_por
  );
end;
$$;

revoke all on function public.editar_justificativo_emitido_v1524(text,text,text) from public,anon;
grant execute on function public.editar_justificativo_emitido_v1524(text,text,text) to authenticated;
