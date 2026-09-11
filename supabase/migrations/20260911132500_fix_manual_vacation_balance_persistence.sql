-- Permite persistir la edición manual del saldo de vacaciones desde la ficha de usuario.
-- La UI activa actualiza únicamente public.perfiles.saldo_vacaciones; hasta ahora RLS
-- dejaba la operación sin filas afectadas, aunque el frontend mostraba confirmación.
--
-- Se evita habilitar UPDATE general sobre public.perfiles. Los cambios de nombre, rol,
-- estado y permisos continúan pasando por los RPC SECURITY DEFINER existentes.

revoke update on table public.perfiles from authenticated;

grant update (saldo_vacaciones) on table public.perfiles to authenticated;

drop policy if exists perfiles_update_saldo_vacaciones_v1524 on public.perfiles;

create policy perfiles_update_saldo_vacaciones_v1524
on public.perfiles
for update
to authenticated
using (
  public.mi_rol() in ('administrador', 'recursos_humanos')
)
with check (
  public.mi_rol() in ('administrador', 'recursos_humanos')
);
