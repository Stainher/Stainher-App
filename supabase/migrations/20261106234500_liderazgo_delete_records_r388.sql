-- R388: Eliminar controles realizados con autorización y trazabilidad.
-- Solo el autor o un perfil no técnico/supervisor con permiso editar de Liderazgo.
-- No elimina ningún registro durante la migración.
create or replace function public.eliminar_control_liderazgo_r388(p_id uuid)
returns boolean
language plpgsql security definer set search_path=public
as $function$
declare
  v_uid uuid := (select auth.uid());
  v_reg public.liderazgo_cumplimiento%rowtype;
  v_rol text;
  v_rows integer := 0;
begin
  if v_uid is null then
    raise exception 'Debes iniciar sesión para eliminar un control.' using errcode='42501';
  end if;
  if not public.tiene_permiso('liderazgo','ver') then
    raise exception 'Tu perfil no tiene acceso a Liderazgo en Terreno.' using errcode='42501';
  end if;
  select * into v_reg
  from public.liderazgo_cumplimiento where id=p_id for update;
  if not found then
    raise exception 'El control ya no existe o fue eliminado.' using errcode='P0002';
  end if;
  v_rol := coalesce(public.mi_rol(),'');
  if not (
    v_reg.created_by = v_uid
    or (
      public.tiene_permiso('liderazgo','editar')
      and v_rol not in ('supervisor','tecnico')
    )
  ) then
    raise exception 'Solo puedes eliminar tus propios controles, salvo permiso de administración.' using errcode='42501';
  end if;

  insert into public.auditoria_v1512(user_id,modulo,accion,registro_id,detalle)
  values(v_uid,'liderazgo','eliminar_control_realizado',p_id::text,
         jsonb_build_object(
           'control_codigo',v_reg.control_codigo,
           'control_nombre',v_reg.control_nombre,
           'fecha',v_reg.fecha,
           'creado_por',v_reg.created_by,
           'ejecutado_por_user_id',v_reg.ejecutado_por_user_id,
           'supervisor_user_id',v_reg.supervisor_user_id,
           'estado',v_reg.estado
         ));

  delete from public.liderazgo_cumplimiento where id=p_id;
  get diagnostics v_rows=row_count;
  if v_rows<>1 then
    raise exception 'La eliminación no fue confirmada.' using errcode='P0001';
  end if;
  return true;
end;
$function$;
revoke all on function public.eliminar_control_liderazgo_r388(uuid) from public;
grant execute on function public.eliminar_control_liderazgo_r388(uuid) to authenticated;
