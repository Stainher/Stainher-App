-- R101 · Hardening inicial de SECURITY DEFINER.
-- Objetivo: retirar exposición RPC directa de funciones que son solo triggers/helpers internos.
-- No cambia las funciones de negocio SECURITY DEFINER que validan auth.uid()/rol internamente.

-- Trigger-only: no deben ser invocables desde /rest/v1/rpc por usuarios autenticados.
revoke execute on function public.crear_perfil_usuario() from public, authenticated, anon;
revoke execute on function public.sync_dotacion_links_v158() from public, authenticated, anon;
revoke execute on function public.v14_proteger_estado_dotacion() from public, authenticated, anon;
revoke execute on function public.v14_validar_cumplimiento_liderazgo() from public, authenticated, anon;
revoke execute on function public.v15_auditar() from public, authenticated, anon;

-- Helper interno consumido por mi_permiso(); no requiere exposición RPC directa.
revoke execute on function public.permisos_base_rol(text) from public, authenticated, anon;

-- Documentación de riesgo aceptado:
-- Las RPC SECURITY DEFINER de negocio que siguen ejecutables por authenticated
-- conservan validación interna de auth.uid(), rol o tiene_permiso().
-- No se revocan de forma masiva porque rompería flujos legítimos de Administrador,
-- Solicitudes, Dotación, Vehículos y Liderazgo.


-- Blindaje explícito de las tablas privadas de vacaciones. Se conserva USAGE del esquema para wrappers controlados.
revoke all on table stainher_private.vacation_accrual from public, anon, authenticated;
revoke all on table stainher_private.vacation_official_baseline from public, anon, authenticated;
-- vacation_accrual tiene RLS sin policies de forma intencional: deny-by-default.
-- Los clientes no deben acceder directamente; solo las funciones controladas del backend.
