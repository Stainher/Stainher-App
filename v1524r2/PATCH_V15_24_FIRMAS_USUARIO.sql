-- Firmas personales reutilizables · PNG transparente.
-- La firma solo puede ser consultada y modificada por su propietario.
create table if not exists public.firmas_usuario_v1524 (
  user_id uuid primary key references auth.users(id) on delete cascade,
  imagen_png text not null check (imagen_png like 'data:image/png;base64,%'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.firmas_usuario_v1524 enable row level security;

drop policy if exists "firmas seleccionar propia" on public.firmas_usuario_v1524;
create policy "firmas seleccionar propia"
on public.firmas_usuario_v1524 for select
to authenticated
using ((select auth.uid()) = user_id);

drop policy if exists "firmas insertar propia" on public.firmas_usuario_v1524;
create policy "firmas insertar propia"
on public.firmas_usuario_v1524 for insert
to authenticated
with check ((select auth.uid()) = user_id);

drop policy if exists "firmas actualizar propia" on public.firmas_usuario_v1524;
create policy "firmas actualizar propia"
on public.firmas_usuario_v1524 for update
to authenticated
using ((select auth.uid()) = user_id)
with check ((select auth.uid()) = user_id);

drop policy if exists "firmas eliminar propia" on public.firmas_usuario_v1524;
create policy "firmas eliminar propia"
on public.firmas_usuario_v1524 for delete
to authenticated
using ((select auth.uid()) = user_id);

grant select, insert, update, delete on table public.firmas_usuario_v1524 to authenticated;
revoke all on table public.firmas_usuario_v1524 from anon;

