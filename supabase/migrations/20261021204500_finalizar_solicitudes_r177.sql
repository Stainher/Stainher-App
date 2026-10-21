-- R177 · Cierre operacional de solicitudes aprobadas.
-- Permite distinguir aprobación de ejecución/completitud real.

alter table public.solicitudes_v15
  add column if not exists finalizada_por uuid references auth.users(id),
  add column if not exists finalizacion_observacion text;

alter table public.solicitudes_v15
  drop constraint if exists solicitudes_v15_estado_check;

alter table public.solicitudes_v15
  add constraint solicitudes_v15_estado_check
  check (
    estado = any (
      array[
        'pendiente'::text,
        'pendiente_rrhh'::text,
        'aprobada'::text,
        'finalizada'::text,
        'rechazada'::text,
        'cancelada'::text,
        'anulada'::text
      ]
    )
  );

create or replace function public.finalizar_solicitud_operacional_r177(
  p_id text,
  p_observacion text
)
returns jsonb
language plpgsql
security definer
set search_path='public'
as $function$
declare
  v_uid uuid := auth.uid();
  v_role text := lower(coalesce(public.mi_rol(),''));
  r public.solicitudes_v15%rowtype;
begin
  if v_uid is null then raise exception 'Debes iniciar sesión.'; end if;

  select * into r
  from public.solicitudes_v15
  where id::text=p_id
  for update;

  if not found then raise exception 'Solicitud no encontrada.'; end if;

  if r.tipo not in ('otro','permiso','cambio_turno') then
    raise exception 'Este tipo de solicitud utiliza un flujo de cierre distinto.';
  end if;

  if r.estado<>'aprobada' then
    raise exception 'Solo se pueden finalizar solicitudes aprobadas.';
  end if;

  if v_role<>'administrador' and v_uid is distinct from r.aprobador_user_id then
    raise exception 'Solo el Administrador o el aprobador asignado puede finalizar esta solicitud.';
  end if;

  if nullif(trim(coalesce(p_observacion,'')),'') is null then
    raise exception 'Debes registrar una observación de cierre.';
  end if;

  update public.solicitudes_v15
     set estado='finalizada',
         etapa='finalizada',
         finalizada_at=now(),
         finalizada_por=v_uid,
         finalizacion_observacion=trim(p_observacion)
   where id=r.id;

  return jsonb_build_object(
    'id',r.id::text,
    'estado','finalizada',
    'finalizada_at',now(),
    'finalizada_por',v_uid,
    'finalizacion_observacion',trim(p_observacion)
  );
end;
$function$;

revoke all on function public.finalizar_solicitud_operacional_r177(text,text) from public,anon;
grant execute on function public.finalizar_solicitud_operacional_r177(text,text) to authenticated;
