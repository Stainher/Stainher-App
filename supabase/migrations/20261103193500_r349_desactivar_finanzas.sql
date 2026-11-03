-- R349: ya no se gestiona la recuperación por Finanzas en Stainher App.
-- Preservar historial existente; impedir nuevas operaciones financieras.
revoke execute on function public.registrar_recuperacion_finanzas_r348(uuid,date) from authenticated, public, anon;
