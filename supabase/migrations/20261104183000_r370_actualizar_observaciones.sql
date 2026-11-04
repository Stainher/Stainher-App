-- R370: complemento seguro al importador consolidado; no modifica filas sin confirmar.
create table if not exists public.auditoria_observaciones_averias_r370(
 id uuid primary key default gen_random_uuid(),averia_id uuid not null references public.averias(id),
 usuario_id uuid not null, archivo text not null, antes text, despues text not null,
 registrado_en timestamptz not null default now()
);
alter table public.auditoria_observaciones_averias_r370 enable row level security;
revoke all on public.auditoria_observaciones_averias_r370 from public,anon,authenticated;
grant select on public.auditoria_observaciones_averias_r370 to authenticated;
drop policy if exists auditoria_observaciones_r370_lectura on public.auditoria_observaciones_averias_r370;
create policy auditoria_observaciones_r370_lectura on public.auditoria_observaciones_averias_r370 for select to authenticated using(lower(public.mi_rol()) in ('administrador','confiabilidad'));
CREATE OR REPLACE FUNCTION public.actualizar_observaciones_averias_r370(p_filas jsonb, p_archivo text, p_confirmar boolean DEFAULT false)
 RETURNS jsonb
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO ''
AS $function$
declare
 r record; candidate record; norm_equipo text; guia text;
 candidates integer; matched_id uuid; old_obs text;
 total integer:=0; unchanged integer:=0; changed integer:=0; missing integer:=0; ambiguous integer:=0; invalid integer:=0;
 samples jsonb:='[]'::jsonb; change_list jsonb:='[]'::jsonb;
begin
 if auth.uid() is null or lower(coalesce(public.mi_rol(),'')) not in ('administrador','confiabilidad')
 or not public.tiene_permiso('correctivo','editar')
 then raise exception 'Solo Confiabilidad o Administrador con permiso de edición pueden actualizar observaciones';end if;
 if p_filas is null or jsonb_typeof(p_filas)<>'array' or jsonb_array_length(p_filas) not between 1 and 10000
 then raise exception 'Seleccione un Excel con entre 1 y 10.000 averías';end if;
 if length(trim(coalesce(p_archivo,''))) not between 4 and 240 then raise exception 'Nombre del archivo no válido';end if;
 perform pg_advisory_xact_lock(739370,1);
 for r in select e.obj as item,e.ord as fila from jsonb_array_elements(p_filas) with ordinality e(obj,ord)
 loop
  total:=total+1;
  if jsonb_typeof(r.item)<>'object' or nullif(btrim(r.item->>'equipo_original'),'') is null
     or nullif(btrim(r.item->>'observaciones'),'') is null
     or nullif(r.item->>'fecha_inicio','') is null then
   invalid:=invalid+1;continue;
  end if;
  norm_equipo:=lower(regexp_replace(btrim(r.item->>'equipo_original'),'[[:space:]]+',' ','g'));
  guia:=lower(btrim(coalesce(r.item->>'numero_guia','')));
  matched_id:=null;old_obs:=null;
  -- Fecha, hora y equipo mantienen la identidad de la intervención.
  -- Si hay guía, se usa para desambiguar; nunca se actualiza una coincidencia múltiple.
  select count(*),(array_agg(a.id))[1] into candidates,matched_id
  from public.averias a
  where lower(regexp_replace(btrim(coalesce(a.equipo_original,'')),'[[:space:]]+',' ','g'))=norm_equipo
    and a.fecha_inicio=(r.item->>'fecha_inicio')::date
    and coalesce(left(a.hora_inicio,5),'')=coalesce(left(r.item->>'hora_inicio',5),'')
    and (guia='' or coalesce(nullif(btrim(a.numero_guia),''),nullif(btrim(a.id_falla),''),'')='' or guia=lower(btrim(coalesce(nullif(a.numero_guia,''),nullif(a.id_falla,''),''))));
  if candidates=0 then missing:=missing+1;continue;end if;
  if candidates>1 then ambiguous:=ambiguous+1;continue;end if;
  select observaciones into old_obs from public.averias where id=matched_id for update;
  if btrim(coalesce(old_obs,''))=btrim(r.item->>'observaciones') then unchanged:=unchanged+1;continue;end if;
  changed:=changed+1;
  if jsonb_array_length(samples)<8 then
   samples:=samples||jsonb_build_array(jsonb_build_object('equipo',r.item->>'equipo_original','fecha',r.item->>'fecha_inicio','antes',left(coalesce(old_obs,''),160),'despues',left(btrim(r.item->>'observaciones'),160)));
  end if;
  change_list:=change_list||jsonb_build_array(jsonb_build_object('id',matched_id,'nuevo',btrim(r.item->>'observaciones')));
 end loop;
 if p_confirmar then
  if invalid>0 or ambiguous>0 or missing>0 then raise exception
    'No se actualizó ninguna observación. Sin coincidencia %, ambiguas %, inválidas %. Corrija la planilla.',missing,ambiguous,invalid;
  end if;
  if changed=0 then return jsonb_build_object('total',total,'actualizados',0,'sin_cambios',unchanged,'sin_coincidencia',0,'ambiguos',0,'invalidos',0,'ejemplos',samples);end if;
  -- Garantizar que una avería no aparezca dos veces con modificaciones distintas.
  if (select count(distinct e.item->>'id') from jsonb_array_elements(change_list) e(item))<>changed then
   raise exception 'El Excel contiene filas repetidas de una misma avería. Operación cancelada.';
  end if;
  insert into public.auditoria_observaciones_averias_r370(averia_id,usuario_id,archivo,antes,despues)
  select a.id,auth.uid(),p_archivo,a.observaciones,c.item->>'nuevo'
  from jsonb_array_elements(change_list) c(item)
  join public.averias a on a.id=(c.item->>'id')::uuid;
  update public.averias a set observaciones=c.item->>'nuevo'
  from jsonb_array_elements(change_list) c(item)
  where a.id=(c.item->>'id')::uuid;
 end if;
 return jsonb_build_object('total',total,'actualizados',changed,'sin_cambios',unchanged,
   'sin_coincidencia',missing,'ambiguos',ambiguous,'invalidos',invalid,'ejemplos',samples,
   'simulacion',not p_confirmar);
end $function$

revoke all on function public.actualizar_observaciones_averias_r370(jsonb,text,boolean) from public,anon;
grant execute on function public.actualizar_observaciones_averias_r370(jsonb,text,boolean) to authenticated;
