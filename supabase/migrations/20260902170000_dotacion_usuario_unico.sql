-- Stainher App V15.24 · integridad de asociación cuenta ↔ dotación.
-- Aplicada en Supabase el 2026-09-02 tras autorización expresa.

begin;

do $$
begin
  if exists (
    select 1
    from public.dotacion_contrato
    where user_id is not null
    group by user_id
    having count(*) > 1
  ) then
    raise exception 'No se puede crear la restricción: existen cuentas asociadas a más de una persona';
  end if;
end
$$;

create unique index if not exists uq_dotacion_usuario_activo_v1524
  on public.dotacion_contrato (user_id)
  where user_id is not null;

comment on index public.uq_dotacion_usuario_activo_v1524 is
  'Impide asociar una cuenta de Stainher App a más de una ficha de Dotación.';

commit;
