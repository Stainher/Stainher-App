create table public.forecast_precios_actividades (
  equipo_id uuid not null references public.equipos(id) on delete cascade,
  actividad text not null check (actividad = btrim(actividad) and actividad <> ''),
  precio_unitario bigint not null check (precio_unitario between 0 and 999999999999),
  primary key (equipo_id, actividad)
);
alter table public.forecast_precios_actividades enable row level security;
revoke all on public.forecast_precios_actividades from public, anon, authenticated;
grant select, insert, update on public.forecast_precios_actividades to authenticated;

create policy forecast_precios_leer on public.forecast_precios_actividades
for select to authenticated using ((select public.tiene_permiso('contrato', 'ver')));

create policy forecast_precios_insertar on public.forecast_precios_actividades
for insert to authenticated with check ((select public.tiene_permiso('contrato', 'editar')));

create policy forecast_precios_actualizar on public.forecast_precios_actividades
for update to authenticated using ((select public.tiene_permiso('contrato', 'editar')))
with check ((select public.tiene_permiso('contrato', 'editar')));
