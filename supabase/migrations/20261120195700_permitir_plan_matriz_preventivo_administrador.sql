-- Allow administrators to generate pending occurrences from plans they create in Equipos.
create policy preventivo_insert_admin_plan_matriz
on public.programacion_preventiva
for insert to authenticated
with check (
  (select public.mi_rol()) = 'administrador'
  and (select public.tiene_permiso('equipos', 'editar'))
  and (select public.tiene_permiso('preventivo', 'editar'))
  and created_by = (select auth.uid())
  and estado = 'pendiente'
  and fecha_programada is null
  and fecha_ejecucion is null
  and exists (
    select 1
    from public.plan_matriz_actividades as plan
    where plan.equipo_id = programacion_preventiva.equipo_id
      and plan.actividad = programacion_preventiva.actividad
      and plan.frecuencia = programacion_preventiva.frecuencia
      and plan.created_by = (select auth.uid())
      and plan.activo
  )
);
