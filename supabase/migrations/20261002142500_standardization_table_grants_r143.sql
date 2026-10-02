-- R143 · Privilegios de tabla para Estandarización.
-- R141 creó RLS correctamente, pero faltaron los GRANT base para el rol authenticated.
-- Las políticas RLS siguen determinando qué perfiles pueden leer/editar/eliminar.

revoke all on table public.estandarizacion_actividades_v141 from anon;

grant select, insert, update, delete
on table public.estandarizacion_actividades_v141
to authenticated;

grant all
on table public.estandarizacion_actividades_v141
to service_role;
