-- R110 · Endurece la firma institucional y optimiza la política DELETE.

create or replace function stainher_private.presupuesto_firma_administrador_v110()
returns table (user_id uuid, nombre text, cargo text, imagen_png text)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if (select auth.uid()) is null or not exists (
    select 1
    from public.perfiles caller
    where caller.id = (select auth.uid())
      and caller.activo = true
      and lower(caller.rol) in ('administrador', 'confiabilidad')
  ) then
    raise exception 'Acceso no autorizado a la firma institucional.' using errcode = '42501';
  end if;

  return query
  select p.id, p.nombre, 'Administrador de Contrato'::text, f.imagen_png
  from public.perfiles p
  join public.firmas_usuario_v1524 f on f.user_id = p.id
  where p.activo = true
    and lower(p.rol) = 'administrador'
    and nullif(f.imagen_png, '') is not null
  order by p.created_at, p.id
  limit 1;
end;
$$;

revoke all on function stainher_private.presupuesto_firma_administrador_v110() from public;
revoke all on function stainher_private.presupuesto_firma_administrador_v110() from anon;
grant usage on schema stainher_private to authenticated;
grant execute on function stainher_private.presupuesto_firma_administrador_v110() to authenticated;

create or replace function public.presupuesto_firma_administrador_v110()
returns table (user_id uuid, nombre text, cargo text, imagen_png text)
language sql
stable
security invoker
set search_path = ''
as $$
  select * from stainher_private.presupuesto_firma_administrador_v110();
$$;

revoke all on function public.presupuesto_firma_administrador_v110() from public;
revoke all on function public.presupuesto_firma_administrador_v110() from anon;
grant execute on function public.presupuesto_firma_administrador_v110() to authenticated;

drop policy if exists presupuestos_v1524_admin_delete on public.presupuestos_tecnico_comerciales_v1524;
create policy presupuestos_v1524_admin_delete
on public.presupuestos_tecnico_comerciales_v1524
for delete to authenticated
using (
  exists (
    select 1 from public.perfiles p
    where p.id = (select auth.uid())
      and p.activo = true
      and lower(p.rol) = 'administrador'
  )
);
