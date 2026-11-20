alter table public.estados_pago
  add column gastos_generales numeric(16,0)
  check (gastos_generales >= 0);

comment on column public.estados_pago.gastos_generales is
  'Gastos generales netos en CLP. NULL conserva el cálculo por diferencia para EDP históricos.';
