-- Activate only with the accompanying client. Existing balances remain the baseline.
create schema if not exists stainher_private;
revoke all on schema stainher_private from public, anon;
grant usage on schema stainher_private to authenticated;

create table stainher_private.vacation_accrual (
  user_id uuid primary key references public.perfiles(id) on delete cascade,
  contract_start date,
  baseline_date date not null,
  credited numeric(12,2) not null default 0,
  checked_date date not null
);
revoke all on stainher_private.vacation_accrual from public, anon, authenticated;
alter table stainher_private.vacation_accrual enable row level security;

-- Monthly anniversary clamped to month end; capped remainder prevents a decrease
-- on day 31. Exact numeric arithmetic, rounded only at the cumulative boundary.
create function stainher_private.vacation_earned(p_start date, p_date date)
returns numeric language plpgsql immutable security invoker set search_path = '' as $$
declare m integer; anniversary date; remainder integer;
begin
  if p_start is null or p_date is null or p_date <= p_start then return 0; end if;
  m := (extract(year from p_date)::int-extract(year from p_start)::int)*12
       + extract(month from p_date)::int-extract(month from p_start)::int;
  anniversary := (p_start + make_interval(months => m))::date;
  if anniversary > p_date then
    m := m-1; anniversary := (p_start + make_interval(months => m))::date;
  end if;
  remainder := least(30, greatest(0,p_date-anniversary));
  return m*1.25 + remainder*(1.25/30);
end $$;
revoke all on function stainher_private.vacation_earned(date,date) from public, anon, authenticated;

insert into stainher_private.vacation_accrual(user_id,contract_start,baseline_date,checked_date)
select p.id,d.fecha_inicio_contrato,(now() at time zone 'America/Santiago')::date,
       (now() at time zone 'America/Santiago')::date
from public.perfiles p left join public.dotacion_contrato d on d.user_id=p.id;

-- The private definer can update only the calculated balance/cursor, never an
-- amount or date supplied by a client. The public RPC is a thin invoker wrapper.
create function stainher_private.refresh_vacation_balance(p_user_id uuid)
returns jsonb language plpgsql security definer set search_path = '' as $$
declare
  actor uuid := auth.uid(); actor_role text; balance numeric; enabled boolean;
  start_date date; today date := (now() at time zone 'America/Santiago')::date;
  cursor_row stainher_private.vacation_accrual%rowtype;
  earned numeric; delta numeric := 0; status text := 'actualizado';
begin
  select p.rol into actor_role from public.perfiles p where p.id=actor and p.activo is true;
  if actor is null or actor_role is null then raise exception 'Sesión activa requerida' using errcode='42501'; end if;
  if p_user_id is distinct from actor and actor_role not in ('administrador','recursos_humanos')
     and not exists(select 1 from public.solicitudes_v15 s where s.solicitante_user_id=p_user_id
                    and s.aprobador_user_id=actor and s.estado in ('pendiente','pendiente_rrhh','aprobada')) then
    raise exception 'No autorizado para consultar este saldo' using errcode='42501';
  end if;
  select p.saldo_vacaciones,p.activo into balance,enabled from public.perfiles p where p.id=p_user_id for update;
  if not found then raise exception 'Usuario no encontrado'; end if;
  select d.fecha_inicio_contrato into start_date from public.dotacion_contrato d where d.user_id=p_user_id;
  insert into stainher_private.vacation_accrual(user_id,contract_start,baseline_date,checked_date)
    values(p_user_id,start_date,today,today) on conflict(user_id) do nothing;
  select * into cursor_row from stainher_private.vacation_accrual where user_id=p_user_id for update;
  if start_date is distinct from cursor_row.contract_start then
    -- A corrected/missing start date does not silently rewrite historical credit.
    update stainher_private.vacation_accrual set contract_start=start_date,baseline_date=today,credited=0,checked_date=today where user_id=p_user_id;
    cursor_row.contract_start:=start_date; cursor_row.baseline_date:=today; cursor_row.credited:=0;
  end if;
  if enabled is not true then status:='inactivo';
  elsif start_date is null then status:='sin_fecha_inicio';
  elsif start_date > today then status:='contrato_futuro';
  else
    earned := round(greatest(0,stainher_private.vacation_earned(start_date,today)
                                  -stainher_private.vacation_earned(start_date,cursor_row.baseline_date)),2);
    delta := greatest(0,earned-cursor_row.credited);
    if delta > 0 then
      balance:=coalesce(balance,0)+delta;
      update public.perfiles set saldo_vacaciones=balance where id=p_user_id;
      update stainher_private.vacation_accrual set credited=credited+delta where user_id=p_user_id;
    end if;
  end if;
  update stainher_private.vacation_accrual set checked_date=today where user_id=p_user_id and checked_date is distinct from today;
  return jsonb_build_object('saldo_vacaciones',balance,'fecha_calculo',today,'dias_sumados',delta,'estado_devengo',status);
end $$;
revoke all on function stainher_private.refresh_vacation_balance(uuid) from public, anon;
grant execute on function stainher_private.refresh_vacation_balance(uuid) to authenticated;

create function public.actualizar_saldo_vacaciones_v1524(p_user_id uuid default auth.uid())
returns jsonb language sql security invoker set search_path = '' as $$
  select stainher_private.refresh_vacation_balance(p_user_id);
$$;
revoke all on function public.actualizar_saldo_vacaciones_v1524(uuid) from public, anon;
grant execute on function public.actualizar_saldo_vacaciones_v1524(uuid) to authenticated;

-- Pause/restart the accrual window when a profile's employment access is disabled.
create function stainher_private.vacation_active_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare c stainher_private.vacation_accrual%rowtype; today date := (now() at time zone 'America/Santiago')::date; delta numeric;
begin
  if new.activo is distinct from old.activo then
    select * into c from stainher_private.vacation_accrual where user_id=new.id for update;
    if found and old.activo is true then
      delta:=greatest(0,round(stainher_private.vacation_earned(c.contract_start,today)-stainher_private.vacation_earned(c.contract_start,c.baseline_date),2)-c.credited);
      new.saldo_vacaciones:=coalesce(new.saldo_vacaciones,0)+delta;
    end if;
    update stainher_private.vacation_accrual set baseline_date=today,credited=0,checked_date=today where user_id=new.id;
  end if;
  return new;
end $$;
revoke all on function stainher_private.vacation_active_change() from public, anon, authenticated;
create trigger vacation_active_change before update of activo on public.perfiles
for each row execute function stainher_private.vacation_active_change();

create function stainher_private.vacation_contract_change()
returns trigger language plpgsql security definer set search_path = '' as $$
declare today date := (now() at time zone 'America/Santiago')::date;
begin
  if new.user_id is not null then
    if tg_op='INSERT' or new.fecha_inicio_contrato is distinct from old.fecha_inicio_contrato or new.user_id is distinct from old.user_id then
      insert into stainher_private.vacation_accrual(user_id,contract_start,baseline_date,checked_date)
        values(new.user_id,new.fecha_inicio_contrato,today,today)
        on conflict(user_id) do update set contract_start=excluded.contract_start,baseline_date=today,credited=0,checked_date=today;
    end if;
  end if;
  return new;
end $$;
revoke all on function stainher_private.vacation_contract_change() from public, anon, authenticated;
create trigger vacation_contract_change after insert or update of fecha_inicio_contrato,user_id on public.dotacion_contrato
for each row execute function stainher_private.vacation_contract_change();

-- Keep existing discount, restitution and historical receipt rules; refresh before
-- their locked balance read. Abort installation if the expected code has changed.
do $$
declare definition text; needle text;
begin
  definition:=pg_get_functiondef('public.aplicar_descuento_vacaciones_aprobadas()'::regprocedure);
  needle:='  select saldo_vacaciones into anterior';
  if position(needle in definition)=0 then raise exception 'Revisar integración del descuento antes de activar'; end if;
  execute replace(definition,needle,'  perform stainher_private.refresh_vacation_balance(new.solicitante_user_id);'||chr(10)||needle);
  definition:=pg_get_functiondef('public.admin_eliminar_solicitud(uuid)'::regprocedure);
  needle:='    select saldo_vacaciones into v_saldo_actual';
  if position(needle in definition)=0 then raise exception 'Revisar integración de restitución antes de activar'; end if;
  execute replace(definition,needle,'    perform stainher_private.refresh_vacation_balance(v_movimiento.user_id);'||chr(10)||needle);
end $$;
