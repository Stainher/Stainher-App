-- R113: RR.HH. puede aprobar vacaciones aun cuando el descuento deje saldo negativo.
-- Se conservan el cálculo, el movimiento contable, el comprobante y la restitución.

do $migration$
declare
  definition text;
  insufficient_balance_guard text := E'  if anterior - descontar < 0 then\n    raise exception ''Saldo de vacaciones insuficiente: % días disponibles, % solicitados'', anterior, descontar;\n  end if;';
begin
  select pg_get_functiondef('public.aplicar_descuento_vacaciones_aprobadas()'::regprocedure)
    into definition;

  if position(insufficient_balance_guard in definition) = 0 then
    raise exception 'R113 no pudo localizar la validación de saldo insuficiente; no se modificó la función';
  end if;

  execute replace(
    definition,
    insufficient_balance_guard,
    E'  -- R113: el saldo negativo queda registrado y visible; no bloquea la aprobación de RR.HH.'
  );
end;
$migration$;

comment on function public.aplicar_descuento_vacaciones_aprobadas() is
  'Descuenta vacaciones aprobadas, registra el movimiento y permite saldo final negativo desde R113.';
