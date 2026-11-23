create table public.edp_avance_partidas (
  id integer primary key check (id = 1),
  revision integer not null default 0,
  meses jsonb not null check (jsonb_typeof(meses) = 'object')
);
alter table public.edp_avance_partidas enable row level security;
revoke all on public.edp_avance_partidas from public, anon, authenticated;
grant select, update (meses) on public.edp_avance_partidas to authenticated;
create policy edp_avance_leer on public.edp_avance_partidas for select to authenticated
  using (public.tiene_permiso('contrato', 'ver'));
create policy edp_avance_editar on public.edp_avance_partidas for update to authenticated
  using (public.tiene_permiso('contrato', 'editar'))
  with check (public.tiene_permiso('contrato', 'editar'));

insert into public.edp_avance_partidas (id, meses)
values (1, '{"18":{"A10":1000,"A20":1000,"A70":2000,"B110":2000,"B120":1000,"B130":1000,"B150":2000,"C190":1000,"C200":1000,"C240":1000,"C250":1000,"D320":1000,"E360":1000,"E370":1000,"E410":1000,"F450":1000,"F460":1000,"G500":1000,"G510":1000,"H540":1000,"J10":83}}');

create function public.validar_edp_avance_partidas() returns trigger
language plpgsql security invoker set search_path = ''
as $$
declare
  limites constant jsonb := '{"A10":43000,"A20":43000,"A30":14000,"A40":14000,"A50":7000,"A60":4000,"A70":86000,"A80":5000,"A90":14000,"B110":88000,"B120":43000,"B130":13000,"B140":3000,"B150":86000,"B160":5000,"B170":14000,"C190":43000,"C200":46000,"C210":15000,"C220":4000,"C230":15000,"C240":45000,"C250":15000,"C260":8000,"D280":117000,"D290":60000,"D300":20000,"D310":5000,"D320":107000,"D330":5000,"D340":16000,"E360":44000,"E370":44000,"E380":14000,"E390":4000,"E400":15000,"E410":44000,"E420":14000,"E430":8000,"F450":43000,"F460":43000,"F470":4000,"F480":14000,"G500":46000,"G510":47000,"G520":14000,"H540":42000,"I560":5000,"J10":3407}';
  periodo record;
  partida record;
begin
  if not (new.meses ? '18') then
    raise exception 'El detalle debe incluir el EDP 18';
  end if;
  for periodo in select key, value from jsonb_each(new.meses) loop
    if periodo.key !~ '^[1-9][0-9]{1,8}$' or periodo.key::integer < 18 or jsonb_typeof(periodo.value) <> 'object' then
      raise exception 'Período inválido';
    end if;
    if periodo.value is distinct from old.meses -> periodo.key
       and not exists (select 1 from public.estados_pago where ep_num = periodo.key::integer) then
      raise exception 'El Estado de Pago debe estar registrado';
    end if;
    for partida in select key, value from jsonb_each(periodo.value) loop
      if not (limites ? partida.key) or jsonb_typeof(partida.value) <> 'number'
         or partida.value::text !~ '^[0-9]{1,9}$'
         or (partida.key <> 'J10' and partida.value::text::integer % 1000 <> 0) then
        raise exception 'Cantidad inválida en la partida %', partida.key;
      end if;
    end loop;
  end loop;
  for partida in
    select item.key, sum(item.value::text::numeric) as ejecutado
    from jsonb_each(new.meses) mes
    cross join lateral jsonb_each(mes.value) item
    group by item.key
  loop
    if partida.ejecutado > (limites ->> partida.key)::numeric then
      raise exception 'La partida % supera el saldo contractual', partida.key;
    end if;
  end loop;
  new.revision := old.revision + 1;
  return new;
end;
$$;
revoke all on function public.validar_edp_avance_partidas() from public, anon, authenticated;
create trigger edp_avance_validar before update on public.edp_avance_partidas
for each row execute function public.validar_edp_avance_partidas();
