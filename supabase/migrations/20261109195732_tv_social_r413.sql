create table public.tv_social_desafios (
  id uuid primary key default gen_random_uuid(),
  pregunta text not null check (char_length(btrim(pregunta)) between 1 and 180),
  categoria text not null check (categoria in ('acertijo', 'palabras', 'trivia')),
  opciones text[] not null check (
    array_ndims(opciones) = 1 and array_lower(opciones, 1) = 1 and cardinality(opciones) = 3
    and array_position(opciones, null) is null
    and char_length(btrim(opciones[1])) between 1 and 70
    and char_length(btrim(opciones[2])) between 1 and 70
    and char_length(btrim(opciones[3])) between 1 and 70
    and lower(btrim(opciones[1])) <> lower(btrim(opciones[2]))
    and lower(btrim(opciones[1])) <> lower(btrim(opciones[3]))
    and lower(btrim(opciones[2])) <> lower(btrim(opciones[3]))
  ),
  inicio timestamptz not null,
  cierre timestamptz not null check (cierre - inicio in (interval '60 seconds', interval '90 seconds', interval '120 seconds')),
  exclude using gist (tstzrange(inicio, cierre, '[)') with &&)
);
create index tv_social_desafios_inicio_idx on public.tv_social_desafios (inicio desc);

create table public.tv_social_soluciones (
  desafio_id uuid primary key references public.tv_social_desafios(id),
  opcion smallint not null check (opcion between 1 and 3),
  explicacion text check (char_length(explicacion) <= 250)
);

create table public.tv_social_respuestas (
  desafio_id uuid references public.tv_social_desafios(id),
  autor_id uuid references auth.users(id) on delete cascade default auth.uid(),
  opcion smallint not null check (opcion between 1 and 3),
  primary key (desafio_id, autor_id)
);
create index tv_social_respuestas_autor_idx on public.tv_social_respuestas (autor_id);

create table public.tv_social_aplausos (
  id uuid primary key default gen_random_uuid(),
  autor_id uuid references auth.users(id) on delete set null default auth.uid(),
  destinatario text not null check (char_length(btrim(destinatario)) between 1 and 60),
  mensaje text not null check (char_length(btrim(mensaje)) between 1 and 200),
  estado text not null default 'pendiente' check (estado in ('pendiente', 'publicado', 'retirado')),
  creado_at timestamptz not null default now()
);
create index tv_social_aplausos_estado_idx on public.tv_social_aplausos (estado, creado_at desc, id);
create index tv_social_aplausos_autor_idx on public.tv_social_aplausos (autor_id);

alter table public.tv_social_desafios enable row level security;
alter table public.tv_social_soluciones enable row level security;
alter table public.tv_social_respuestas enable row level security;
alter table public.tv_social_aplausos enable row level security;
revoke all on public.tv_social_desafios, public.tv_social_soluciones, public.tv_social_respuestas, public.tv_social_aplausos
  from public, anon, authenticated;
grant select, insert on public.tv_social_desafios, public.tv_social_soluciones to authenticated;
grant select, insert (desafio_id, opcion) on public.tv_social_respuestas to authenticated;
grant select (id, destinatario, mensaje, estado, creado_at), insert (id, destinatario, mensaje), update (estado)
  on public.tv_social_aplausos to authenticated;

create policy tv_social_desafios_select on public.tv_social_desafios for select to authenticated
  using ((select public.mi_rol()) <> '');
create policy tv_social_desafios_insert on public.tv_social_desafios for insert to authenticated
  with check ((select public.mi_rol()) = 'administrador' and inicio = statement_timestamp());

create policy tv_social_soluciones_select on public.tv_social_soluciones for select to authenticated
  using ((select public.mi_rol()) <> '' and exists (
    select 1 from public.tv_social_desafios d where d.id = desafio_id and d.cierre <= statement_timestamp()
  ));
create policy tv_social_soluciones_insert on public.tv_social_soluciones for insert to authenticated
  with check ((select public.mi_rol()) = 'administrador');

create policy tv_social_respuestas_select on public.tv_social_respuestas for select to authenticated
  using ((select public.mi_rol()) <> '' and autor_id = (select auth.uid()));
create policy tv_social_respuestas_insert on public.tv_social_respuestas for insert to authenticated
  with check ((select public.mi_rol()) <> '' and autor_id = (select auth.uid()) and exists (
    select 1 from public.tv_social_desafios d
    where d.id = desafio_id and statement_timestamp() >= d.inicio and statement_timestamp() < d.cierre
  ));

create policy tv_social_aplausos_select on public.tv_social_aplausos for select to authenticated
  using ((select public.mi_rol()) = 'administrador' or ((select public.mi_rol()) <> '' and estado = 'publicado'));
create policy tv_social_aplausos_insert on public.tv_social_aplausos for insert to authenticated
  with check ((select public.mi_rol()) <> '' and autor_id = (select auth.uid()) and estado = 'pendiente');
create policy tv_social_aplausos_update on public.tv_social_aplausos for update to authenticated
  using ((select public.mi_rol()) = 'administrador' and estado in ('pendiente', 'publicado'))
  with check ((select public.mi_rol()) = 'administrador' and estado in ('publicado', 'retirado'));

create function public.tv_social_iniciar(
  pregunta text, categoria text, opciones text[], correcta integer, explicacion text, segundos integer
) returns uuid
language plpgsql security invoker set search_path = ''
as $$
declare
  nuevo_id uuid;
  inicio_ronda timestamptz := statement_timestamp();
begin
  if (select public.mi_rol()) <> 'administrador' then
    raise exception 'Solo Administración puede iniciar desafíos.';
  end if;
  insert into public.tv_social_desafios (pregunta, categoria, opciones, inicio, cierre)
    values (btrim(pregunta), categoria, opciones, inicio_ronda, inicio_ronda + make_interval(secs => segundos))
    returning id into nuevo_id;
  insert into public.tv_social_soluciones (desafio_id, opcion, explicacion)
    values (nuevo_id, correcta, nullif(btrim(explicacion), ''));
  return nuevo_id;
exception when exclusion_violation then
  raise exception 'Ya hay un desafío en curso. Espera a que termine.';
end;
$$;

create function public.tv_social_ronda() returns jsonb
language sql stable security invoker set search_path = ''
as $$
  select jsonb_build_object('ahora', statement_timestamp(), 'ronda', (
    select to_jsonb(d) || jsonb_build_object('correcta', s.opcion, 'explicacion', s.explicacion)
    from public.tv_social_desafios d
    left join public.tv_social_soluciones s on s.desafio_id = d.id
    where d.inicio <= statement_timestamp()
    order by d.inicio desc limit 1
  ));
$$;

revoke all on function public.tv_social_iniciar(text, text, text[], integer, text, integer), public.tv_social_ronda()
  from public, anon, authenticated;
grant execute on function public.tv_social_iniciar(text, text, text[], integer, text, integer), public.tv_social_ronda()
  to authenticated;

-- Agrega la lámina a instalaciones que ya tienen pantallas personalizadas.
update public.tv_pantallas_r397
set valor = jsonb_set(valor, '{screens}', (valor->'screens') || jsonb_build_array(
      jsonb_build_object('title', 'Pausa de oficina', 'widgets', jsonb_build_array(
        jsonb_build_object('type', 'desafio', 'width', 6, 'title', 'Desafío de sobremesa', 'text', ''),
        jsonb_build_object('type', 'aplausos', 'width', 6, 'title', 'Un aplauso para…', 'text', '')
      ))
    )), updated_at = now()
where id = 'diario-mural'
  and jsonb_array_length(valor->'screens') < 12
  and not jsonb_path_exists(valor, '$.screens[*].widgets[*] ? (@.type == "desafio" || @.type == "aplausos")');
