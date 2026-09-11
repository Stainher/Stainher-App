-- Nueva regla RRHH para vacaciones de personal 7x7.
-- Si el período contiene al menos un día hábil, solo se descuentan los días
-- hábiles (lunes a viernes no festivos). Los fines de semana y festivos
-- intermedios no descuentan. Si el período no contiene días hábiles pero sí
-- sábado/domingo, esos días de fin de semana sí se descuentan. Un período
-- compuesto solo por festivos no descuenta saldo.

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
    if habiles > 0 then
      descontar := habiles;
      regla := 'Turno 7x7: se descuentan solo días hábiles; fines de semana y festivos dentro del período no descuentan';
    elsif fines > 0 then
      descontar := fines;
      regla := 'Turno 7x7: período sin días hábiles; el fin de semana solicitado sí descuenta saldo';
    else
      descontar := 0;
      regla := 'Turno 7x7: período compuesto solo por festivos; sin descuento de saldo';
    end if;
  else
    descontar := habiles;
    regla := 'Jornada administrativa: lunes a viernes, excluidos festivos';
  end if;

  perform stainher_private.refresh_vacation_balance(new.solicitante_user_id);
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
