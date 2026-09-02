-- Stainher App V15.24 · permisos esenciales coherentes por usuario.
-- Aplicada en Supabase el 2026-09-02 tras autorización expresa.

begin;

update public.perfiles as p
set permisos = coalesce(p.permisos, '{}'::jsonb)
  || jsonb_build_object(
    'inicio', case when p.permisos->>'inicio' = 'editar' then 'editar' else 'ver' end,
    'turnos', case when p.permisos->>'turnos' = 'editar' then 'editar' else 'ver' end,
    'solicitudes', case
      when t.puede_solicitar is true then 'editar'
      else coalesce(p.permisos->>'solicitudes', 'ninguno')
    end
  ),
  permisos_updated_at = now()
from public.tipos_perfil_v1517 as t
where t.codigo = p.rol
  and (
    coalesce(p.permisos->>'inicio', 'ninguno') not in ('ver','editar')
    or coalesce(p.permisos->>'turnos', 'ninguno') not in ('ver','editar')
    or (t.puede_solicitar is true and coalesce(p.permisos->>'solicitudes', 'ninguno') <> 'editar')
  );

commit;
