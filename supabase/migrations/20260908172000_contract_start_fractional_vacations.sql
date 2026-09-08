-- Registra la fecha laboral utilizada para el cálculo referencial de feriado.
-- perfiles.saldo_vacaciones ya es numeric(8,2), por lo que no requiere cambio.
alter table public.dotacion_contrato
  add column if not exists fecha_inicio_contrato date;

comment on column public.dotacion_contrato.fecha_inicio_contrato is
  'Fecha de inicio del contrato laboral; base referencial para calcular feriado proporcional.';
