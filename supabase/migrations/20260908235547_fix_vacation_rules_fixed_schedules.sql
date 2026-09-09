create or replace function public.aplicar_descuento_vacaciones_aprobadas()
returns trigger
language plpgsql
security definer
set search_path = 'public', 'pg_temp'
as $$
declare
  d record;
  total_d int;
  habiles int;
  fines int;
  fest int;
  descontar numeric(8,2);
  anterior numeric(8,2);
  regla text;
  v_ultimo_dia int;
begin
  if not (new.tipo = 'vacaciones' and new.estado = 'aprobada' and coalesce(old.estado, '') <> 'aprobada') then
    return new;
  end if;
  if exists(select 1 from public.vacaciones_movimientos where solicitud_id = new.id) then
    return new;
  end if;

  select dc.aplica_turnos,
         translate(lower(coalesce(dc.cargo, '')), 'áéíóúñ', 'aeioun') as cargo,
         coalesce(p.rol, '') as rol
    into d
  from public.perfiles p
  left join public.dotacion_contrato dc on dc.user_id = p.id
  where p.id = new.solicitante_user_id
  limit 1;

  if d.cargo ~ 'confiabilidad' then
    v_ultimo_dia := 5;
    regla := 'Jornada fija de Confiabilidad: lunes a viernes, excluidos festivos';
  elsif d.cargo ~ 'expert[oa].*prevencion|programacion|planificacion' then
    v_ultimo_dia := 4;
    regla := 'Jornada fija de Prevención o Programación: lunes a jueves, excluidos festivos';
  end if;

  select count(*),
         count(*) filter(where extract(isodow from g.d)::int between 1 and 5 and f.fecha is null),
         count(*) filter(where extract(isodow from g.d)::int in (6, 7)),
         count(*) filter(where f.fecha is not null)
    into total_d, habiles, fines, fest
  from generate_series(new.fecha_inicio, new.fecha_fin, interval '1 day') g(d)
  left join public.feriados_vacaciones f on f.fecha = g.d::date;

  if v_ultimo_dia is not null then
    select count(*)
      into descontar
    from generate_series(new.fecha_inicio, new.fecha_fin, interval '1 day') g(d)
    left join public.feriados_vacaciones f on f.fecha = g.d::date
    left join public.turnos_malla_v1512 tm
      on tm.user_id = new.solicitante_user_id and tm.fecha = g.d::date
    where f.fecha is null
      and coalesce(
        tm.turno_base,
        case when extract(isodow from g.d)::int between 1 and v_ultimo_dia then 'A' else 'L' end
      ) in ('A', 'C');
  elsif coalesce(d.aplica_turnos, false) or d.rol in ('tecnico', 'supervisor', 'apr') then
    select count(*) into descontar
    from public.turnos_malla_v1512
    where user_id = new.solicitante_user_id
      and fecha between new.fecha_inicio and new.fecha_fin
      and turno_base in ('A', 'C');
    regla := 'Turno 7x7: días A/C programados, incluidos fines de semana y festivos';
  else
    descontar := habiles;
    regla := 'Jornada administrativa: lunes a viernes, excluidos festivos';
  end if;

  select saldo_vacaciones into anterior
  from public.perfiles
  where id = new.solicitante_user_id
  for update;
  anterior := coalesce(anterior, 15);
  if anterior - descontar < 0 then
    raise exception 'Saldo de vacaciones insuficiente: % días disponibles, % solicitados', anterior, descontar;
  end if;

  update public.perfiles
  set saldo_vacaciones = anterior - descontar
  where id = new.solicitante_user_id;

  insert into public.vacaciones_movimientos(user_id, solicitud_id, dias, saldo_anterior, saldo_final)
  values(new.solicitante_user_id, new.id, descontar, anterior, anterior - descontar);

  update public.solicitudes_v15
  set vacaciones_dias_totales = total_d,
      vacaciones_dias_habiles = habiles,
      vacaciones_fines_semana = fines,
      vacaciones_festivos = fest,
      vacaciones_dias_descontados = descontar,
      vacaciones_saldo_anterior = anterior,
      vacaciones_saldo_final = anterior - descontar,
      vacaciones_regla = regla,
      vacaciones_contabilizadas_at = now()
  where id = new.id;

  return new;
end;
$$;

revoke all on function public.aplicar_descuento_vacaciones_aprobadas() from public, anon, authenticated;

-- Corrige el único comprobante ya emitido con la regla 7x7 incorrecta.
do $$
declare
  v_id uuid := '0c7b402a-8dda-4972-be70-2409dbf7aaf4';
  v_uid uuid;
  v_saldo numeric(8,2);
begin
  select solicitante_user_id into v_uid
  from public.solicitudes_v15
  where id = v_id
    and tipo = 'vacaciones'
    and estado = 'aprobada'
    and coalesce(vacaciones_dias_descontados, 0) = 0;

  if v_uid is not null then
    select saldo_vacaciones into v_saldo
    from public.perfiles
    where id = v_uid
    for update;

    if coalesce(v_saldo, 0) < 2 then
      raise exception 'No es posible corregir la solicitud %: saldo insuficiente.', v_id;
    end if;

    update public.perfiles
    set saldo_vacaciones = v_saldo - 2
    where id = v_uid;

    update public.vacaciones_movimientos
    set dias = 2,
        saldo_final = saldo_anterior - 2
    where solicitud_id = v_id
      and dias = 0;

    update public.solicitudes_v15
    set vacaciones_dias_descontados = 2,
        vacaciones_saldo_final = vacaciones_saldo_anterior - 2,
        vacaciones_regla = 'Jornada fija de Confiabilidad: lunes a viernes, excluidos festivos',
        vacaciones_contabilizadas_at = now()
    where id = v_id;
  end if;
end;
$$;
