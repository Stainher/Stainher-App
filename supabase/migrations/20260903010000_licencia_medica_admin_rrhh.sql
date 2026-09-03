-- Stainher App V15.24 · licencia médica directa en Turnos y Novedades.
-- Preparada, no aplicada. Ejecutar únicamente tras autorización expresa.

begin;

alter table public.turnos_novedades_v15 enable row level security;

create unique index if not exists uq_turnos_licencia_medica_periodo_v1524
  on public.turnos_novedades_v15 (user_id, fecha_inicio, fecha_fin)
  where tipo = 'licencia_medica';

drop policy if exists "licencia médica admin rrhh insert" on public.turnos_novedades_v15;
create policy "licencia médica admin rrhh insert"
on public.turnos_novedades_v15
for insert
to authenticated
with check (
  tipo = 'licencia_medica'
  and created_by = (select auth.uid())
  and aprobado_por = (select auth.uid())
  and public.mi_rol() in ('administrador','recursos_humanos')
  and exists (
    select 1
    from public.dotacion_contrato d
    where d.user_id = turnos_novedades_v15.user_id
      and d.estado = 'activo'
  )
  and fecha_inicio is not null
  and fecha_fin is not null
  and fecha_fin >= fecha_inicio
);

grant select, insert on table public.turnos_novedades_v15 to authenticated;

commit;
