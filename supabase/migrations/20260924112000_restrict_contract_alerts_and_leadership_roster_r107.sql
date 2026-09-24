-- R107 · Restringe alertas contractuales y expone solo el personal programable.

drop policy if exists "alertas_contrato_read_authenticated" on public.alertas_contrato_v1524;
drop policy if exists "alertas_contrato_read_roles_r107" on public.alertas_contrato_v1524;
create policy "alertas_contrato_read_roles_r107"
on public.alertas_contrato_v1524
for select to authenticated
using (
  exists (
    select 1
    from public.perfiles p
    where p.id = (select auth.uid())
      and p.activo is true
      and lower(btrim(coalesce(p.rol,''))) in (
        'administrador','administrativo','gerente','confiabilidad','planificador',
        'recursos_humanos','rrhh','prevencion','prevención','apr'
      )
  )
);

drop policy if exists "alertas_contrato_manage_roles" on public.alertas_contrato_v1524;
drop policy if exists "alertas_contrato_manage_roles_r107" on public.alertas_contrato_v1524;
create policy "alertas_contrato_manage_roles_r107"
on public.alertas_contrato_v1524
for all to authenticated
using (
  exists (
    select 1 from public.perfiles p
    where p.id = (select auth.uid()) and p.activo is true
      and lower(btrim(coalesce(p.rol,''))) in (
        'administrador','gerente','confiabilidad','planificador',
        'recursos_humanos','rrhh','prevencion','prevención','apr'
      )
  )
)
with check (
  exists (
    select 1 from public.perfiles p
    where p.id = (select auth.uid()) and p.activo is true
      and lower(btrim(coalesce(p.rol,''))) in (
        'administrador','gerente','confiabilidad','planificador',
        'recursos_humanos','rrhh','prevencion','prevención','apr'
      )
  )
);

create or replace function public.liderazgo_personal_programable_v107()
returns table(id uuid, nombre text, rol text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null
     or lower(btrim(coalesce(public.mi_rol(),''))) not in ('administrador','planificador','prevencion','prevención','apr')
     or not coalesce(public.tiene_permiso('liderazgo','editar'),false) then
    raise exception 'No autorizado para consultar personal programable';
  end if;

  return query
  select p.id, p.nombre, p.rol
  from public.perfiles p
  where p.activo is true
    and lower(btrim(coalesce(p.rol,''))) in ('supervisor','tecnico','técnico')
  order by p.nombre;
end;
$$;

revoke all on function public.liderazgo_personal_programable_v107() from public, anon, authenticated;
grant execute on function public.liderazgo_personal_programable_v107() to authenticated;
