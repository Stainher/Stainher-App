-- Restringe la administración de plantillas de Controles Stainher a
-- Administrador y Prevención, manteniendo la lectura para los perfiles que
-- ya pueden consultar Liderazgo.

alter table public.liderazgo_plantillas_v1512 enable row level security;

drop policy if exists clean_liderazgo_plantillas_insert on public.liderazgo_plantillas_v1512;
drop policy if exists clean_liderazgo_plantillas_update on public.liderazgo_plantillas_v1512;
drop policy if exists clean_liderazgo_plantillas_delete on public.liderazgo_plantillas_v1512;

create policy clean_liderazgo_plantillas_insert
on public.liderazgo_plantillas_v1512
for insert
to authenticated
with check (
  public.mi_rol() in ('administrador','prevencion')
  and public.tiene_permiso('liderazgo','editar')
);

create policy clean_liderazgo_plantillas_update
on public.liderazgo_plantillas_v1512
for update
to authenticated
using (
  public.mi_rol() in ('administrador','prevencion')
  and public.tiene_permiso('liderazgo','editar')
)
with check (
  public.mi_rol() in ('administrador','prevencion')
  and public.tiene_permiso('liderazgo','editar')
);

create policy clean_liderazgo_plantillas_delete
on public.liderazgo_plantillas_v1512
for delete
to authenticated
using (
  public.mi_rol() in ('administrador','prevencion')
  and public.tiene_permiso('liderazgo','editar')
);
