-- Stainher App V15.24 r18
-- Agrega vencimiento de Control de Gases a la ficha de vehículos.
-- La publicación/aplicación de esta migración requiere autorización expresa.

alter table public.vehiculos_contrato
  add column if not exists control_gases_vence date;

comment on column public.vehiculos_contrato.control_gases_vence
  is 'Fecha de vencimiento del control de gases del vehículo.';
