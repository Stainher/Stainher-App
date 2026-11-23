create function public.generar_periodo_plan_matriz(p_periodo date)
returns void language plpgsql security definer set search_path='' as $$
declare
  periodo date := date_trunc('month',p_periodo)::date;
begin
  if auth.uid() is not null and (
    public.mi_rol() not in ('administrador','planificador')
    or not public.tiene_permiso('preventivo','editar')
  ) then raise exception 'Sin permiso para generar la programación preventiva' using errcode='42501'; end if;
  if auth.uid() is null and session_user not in ('postgres','supabase_admin') then
    raise exception 'Se requiere una sesión autenticada' using errcode='42501';
  end if;
  if periodo is null or periodo < date_trunc('month',now() at time zone 'America/Santiago')::date
     or periodo >= current_date + interval '10 years' then return; end if;

  perform e.id from public.equipos e where e.estado='activo'
    order by e.id for update;

  insert into public.programacion_preventiva(equipo_id,anio,mes,actividad,frecuencia,estado,created_by)
  select m.equipo_id,extract(year from periodo),extract(month from periodo),
         m.actividad,m.frecuencia,'pendiente',coalesce(m.created_by,auth.uid())
  from public.plan_matriz_actividades m
  join public.equipos e on e.id=m.equipo_id and e.estado='activo'
  cross join lateral (
    select lower(btrim(m.frecuencia)) as frecuencia,
           (extract(year from periodo)-extract(year from m.mes_inicio))::integer*12
            + (extract(month from periodo)-extract(month from m.mes_inicio))::integer as meses
  ) f
  cross join lateral (
    select case f.frecuencia when 'mensual' then 1 when 'bimestral' then 2
      when 'trimestral' then 3 when 'semestral' then 6 when 'anual' then 12 end as salto
  ) r
  cross join lateral (
    select case
      when f.meses<0 then 0
      when f.frecuencia='quincenal' then 2
      when f.frecuencia='semanal' then
        ceil(((periodo+interval '1 month')::date-m.mes_inicio)/7.0)::integer
        -ceil((periodo-m.mes_inicio)/7.0)::integer
      when r.salto is not null and mod(f.meses,r.salto)=0 then 1
      when f.frecuencia in ('según plan','segun plan') and f.meses=0 then 1
      else 0 end as cantidad
  ) objetivo
  cross join lateral (
    select count(*)::integer as cantidad from public.programacion_preventiva p
    where p.equipo_id=m.equipo_id and p.actividad=m.actividad and p.estado<>'no_aplica'
      and p.anio=extract(year from periodo) and p.mes=extract(month from periodo)
  ) existente
  cross join lateral generate_series(1,objetivo.cantidad-existente.cantidad) visitas
  where m.activo;
end
$$;
revoke all on function public.generar_periodo_plan_matriz(date) from public, anon, authenticated;
grant execute on function public.generar_periodo_plan_matriz(date) to authenticated;

select public.generar_periodo_plan_matriz(mes::date)
from generate_series(date '2027-01-01',date '2027-12-01',interval '1 month') mes;
