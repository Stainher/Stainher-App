-- R174 · Permitir nuevos tipos de permisos legales en solicitudes_v15.
-- Corrige el CHECK heredado que aún solo aceptaba los tipos históricos.

alter table public.solicitudes_v15
  drop constraint if exists solicitudes_v15_tipo_check;

alter table public.solicitudes_v15
  add constraint solicitudes_v15_tipo_check
  check (
    tipo = any (
      array[
        'vacaciones'::text,
        'permiso'::text,
        'cambio_turno'::text,
        'otro'::text,
        'justificativo'::text,
        'permiso_matrimonio'::text,
        'permiso_fallecimiento'::text,
        'permiso_nacimiento'::text
      ]
    )
  );
