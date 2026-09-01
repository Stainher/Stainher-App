-- Stainher App · Vacaciones: comprobante final con copia a RR.HH. y Administración
-- Preparado para publicación posterior.

alter table public.correo_config_v155
  add column if not exists copia_rrhh boolean not null default false;

update public.correo_config_v155
set copia_rrhh = true,
    copia_administrador = true
where tipo_documento = 'vacaciones';

comment on column public.correo_config_v155.copia_rrhh is
  'Incluye como copia a los perfiles activos con rol recursos_humanos.';
