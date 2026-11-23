create table public.contrato_kpi_mensual (
  periodo date primary key check (extract(day from periodo)=1),
  numero_edp integer not null check (numero_edp>0),
  resultados numeric(5,2)[] not null check (cardinality(resultados)=4 and array_position(resultados,null) is null and 0<=all(resultados) and 100>=all(resultados)),
  descuentos numeric(5,2)[] not null check (cardinality(descuentos)=4 and array_position(descuentos,null) is null and 0<=all(descuentos)
    and descuentos[1]+descuentos[2]+descuentos[3]+descuentos[4]<=100),
  administrador_stainher text not null default '' check (length(administrador_stainher)<=120),
  administrador_codelco text not null default '' check (length(administrador_codelco)<=120)
);
alter table public.contrato_kpi_mensual enable row level security;
revoke all on public.contrato_kpi_mensual from public, anon, authenticated;
grant select,insert,update on public.contrato_kpi_mensual to authenticated;
create policy contrato_kpi_consultar on public.contrato_kpi_mensual for select to authenticated
using ((select public.tiene_permiso('contrato','ver')));
create policy contrato_kpi_crear on public.contrato_kpi_mensual for insert to authenticated
with check ((select public.tiene_permiso('contrato','editar')));
create policy contrato_kpi_actualizar on public.contrato_kpi_mensual for update to authenticated
using ((select public.tiene_permiso('contrato','editar')))
with check ((select public.tiene_permiso('contrato','editar')));
insert into public.contrato_kpi_mensual(periodo,numero_edp,resultados,descuentos)
values ('2026-10-01',17,array[97,94,94,100],array[0,0,0.5,0]);
