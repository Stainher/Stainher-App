alter table public.presupuestos_tecnico_comerciales_v1524
  add column if not exists equipos_ids uuid[] not null default '{}';
