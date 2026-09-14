-- Stainher App V15.24 R76
-- Permite registrar la novedad Teletrabajo (TT) en turnos_novedades_v15.
-- Conserva todos los tipos previamente autorizados.

alter table public.turnos_novedades_v15
  drop constraint if exists turnos_novedades_v15_tipo_check;

alter table public.turnos_novedades_v15
  add constraint turnos_novedades_v15_tipo_check
  check (
    tipo = any (
      array[
        'vacaciones'::text,
        'licencia_medica'::text,
        'permiso'::text,
        'falta'::text,
        'encierro'::text,
        'encierro_planificado'::text,
        'encierro_no_planificado'::text,
        'suspendido_encierro'::text,
        'dia_adicional'::text,
        'hora_extra'::text,
        'feriado'::text,
        'capacitacion'::text,
        'otro'::text,
        'teletrabajo'::text
      ]
    )
  );
