-- R141 · Rollback de Estandarización
-- Usar solo si es necesario revertir R141 después de su publicación.
-- R141 crea objetos nuevos y no modifica tablas productivas existentes.

begin;

drop trigger if exists trg_touch_estandarizacion_v141
  on public.estandarizacion_actividades_v141;

drop function if exists public.touch_estandarizacion_v141();

drop table if exists public.estandarizacion_actividades_v141;

commit;
