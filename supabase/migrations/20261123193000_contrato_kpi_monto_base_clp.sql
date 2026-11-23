alter table public.contrato_kpi_mensual
  add column ep_base_clp bigint check (ep_base_clp between 0 and 99999999999);
