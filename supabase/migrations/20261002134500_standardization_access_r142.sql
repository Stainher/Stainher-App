-- R142 · Registrar Estandarización en la matriz dinámica de permisos.
-- No modifica las actividades ni la estructura del módulo R141.

update public.tipos_perfil_v1517
set permisos = coalesce(permisos,'{}'::jsonb) ||
  jsonb_build_object(
    'estandarizacion',
    case codigo
      when 'administrador' then 'editar'
      when 'gerente' then 'ver'
      when 'planificador' then 'editar'
      when 'confiabilidad' then 'editar'
      when 'prevencion' then 'editar'
      when 'supervisor' then 'editar'
      else 'ninguno'
    end
  ),
  updated_at=now()
where codigo in (
  'administrador','gerente','planificador','confiabilidad','prevencion',
  'supervisor','tecnico','consulta','recursos_humanos'
);
