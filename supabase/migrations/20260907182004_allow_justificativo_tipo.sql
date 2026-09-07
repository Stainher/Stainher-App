begin;

set local lock_timeout = '5s';

alter table public.solicitudes_v15
  drop constraint if exists solicitudes_v15_tipo_check;

alter table public.solicitudes_v15
  add constraint solicitudes_v15_tipo_check
  check (tipo in (
    'vacaciones',
    'permiso',
    'cambio_turno',
    'otro',
    'justificativo'
  ));

commit;
