-- R114: completa R113 eliminando la restricción de tabla que todavía
-- impedía guardar el saldo negativo al firmar RR.HH.

alter table public.perfiles
  drop constraint if exists perfiles_saldo_vacaciones_nonnegative;

comment on column public.perfiles.saldo_vacaciones is
  'Saldo referencial de vacaciones; puede ser negativo cuando RR.HH. aprueba días por sobre el saldo disponible.';
