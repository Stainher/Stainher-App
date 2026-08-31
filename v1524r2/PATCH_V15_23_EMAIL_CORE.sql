-- Stainher App V15.23 · núcleo de correo centralizado
-- Mantiene el número de versión de la aplicación.

alter table public.email_envios_v1518
  add column if not exists idempotency_key text,
  add column if not exists proveedor text not null default 'brevo',
  add column if not exists destinatario_previsto text,
  add column if not exists copias jsonb not null default '[]'::jsonb,
  add column if not exists http_status integer,
  add column if not exists detalle_respuesta jsonb,
  add column if not exists procesado_at timestamptz,
  add column if not exists tipo_documento text;

create unique index if not exists email_envios_v1518_idempotency_key_uidx
  on public.email_envios_v1518 (idempotency_key)
  where idempotency_key is not null;

create index if not exists email_envios_v1518_estado_created_idx
  on public.email_envios_v1518 (estado, created_at desc);

drop policy if exists clean_email_envios_insert on public.email_envios_v1518;
drop policy if exists clean_email_envios_update on public.email_envios_v1518;

revoke all on table public.email_envios_v1518 from anon;
revoke insert, update, delete, truncate on table public.email_envios_v1518 from authenticated;
grant select on table public.email_envios_v1518 to authenticated;
grant select, insert, update on table public.email_envios_v1518 to service_role;

comment on table public.email_envios_v1518 is
  'Trazabilidad autoritativa y append-only para clientes. Solo send-stainher-email registra o actualiza envíos.';
comment on column public.email_envios_v1518.idempotency_key is
  'Clave lógica única que evita envíos duplicados por doble clic o reintentos concurrentes.';
