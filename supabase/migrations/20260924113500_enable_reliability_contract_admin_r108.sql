-- R108 · Confiabilidad administra integralmente el módulo contractual.

update public.tipos_perfil_v1517
set permisos = jsonb_set(coalesce(permisos, '{}'::jsonb), '{contrato}', '"editar"'::jsonb, true),
    updated_at = now()
where lower(btrim(codigo)) = 'confiabilidad';

update public.perfiles
set permisos = jsonb_set(coalesce(permisos, '{}'::jsonb), '{contrato}', '"editar"'::jsonb, true),
    permisos_updated_at = now()
where lower(btrim(rol)) = 'confiabilidad';
