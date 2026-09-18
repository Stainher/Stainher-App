-- R101 OPT · índices de bajo riesgo recomendados por Supabase Advisor.
-- No modifica lógica de negocio ni RLS.
create index if not exists vacaciones_movimientos_user_id_idx
  on public.vacaciones_movimientos(user_id);

create index if not exists plan_matriz_actividades_created_by_idx
  on public.plan_matriz_actividades(created_by);

create index if not exists presupuestos_v1524_equipo_id_idx
  on public.presupuestos_tecnico_comerciales_v1524(equipo_id);
