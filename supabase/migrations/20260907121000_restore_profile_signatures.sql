create table if not exists public.firmas_usuario_v1524 (
  user_id uuid primary key references auth.users(id) on delete cascade,
  imagen_png text not null check (imagen_png like 'data:image/png;base64,%'),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

alter table public.firmas_usuario_v1524 enable row level security;
grant select, insert, update, delete on public.firmas_usuario_v1524 to authenticated;

do $$
begin
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='firmas_usuario_v1524' and policyname='firmas seleccionar propia') then
    create policy "firmas seleccionar propia" on public.firmas_usuario_v1524 for select to authenticated using ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='firmas_usuario_v1524' and policyname='firmas insertar propia') then
    create policy "firmas insertar propia" on public.firmas_usuario_v1524 for insert to authenticated with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='firmas_usuario_v1524' and policyname='firmas actualizar propia') then
    create policy "firmas actualizar propia" on public.firmas_usuario_v1524 for update to authenticated using ((select auth.uid()) = user_id) with check ((select auth.uid()) = user_id);
  end if;
  if not exists (select 1 from pg_policies where schemaname='public' and tablename='firmas_usuario_v1524' and policyname='firmas eliminar propia') then
    create policy "firmas eliminar propia" on public.firmas_usuario_v1524 for delete to authenticated using ((select auth.uid()) = user_id);
  end if;
end
$$;
