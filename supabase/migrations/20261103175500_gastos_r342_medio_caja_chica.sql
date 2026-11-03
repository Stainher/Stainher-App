-- R342: identificación explícita de reembolso mediante caja chica.
alter table public.gastos_operacionales_r342
 add column if not exists medio_reembolso_personal text not null default 'pendiente';
alter table public.gastos_operacionales_r342
 drop constraint if exists gastos_r342_medio_reembolso_check;
alter table public.gastos_operacionales_r342
 add constraint gastos_r342_medio_reembolso_check
 check(medio_reembolso_personal in ('pendiente','caja_chica','transferencia','efectivo','otro'));
