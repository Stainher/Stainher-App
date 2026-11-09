create schema tv_juego_privado;
revoke all on schema tv_juego_privado from public, anon, authenticated;
grant usage on schema tv_juego_privado to authenticated;

alter table public.tv_social_desafios add column cierre_real timestamptz, add column resuelto_at timestamptz;
update public.tv_social_desafios set cierre_real = cierre;
alter table public.tv_social_desafios drop constraint tv_social_desafios_tstzrange_excl;
alter table public.tv_social_desafios add constraint tv_social_desafios_sin_solapamiento
  exclude using gist (tstzrange(inicio, nullif(least(cierre_real, resuelto_at, 'infinity'::timestamptz), 'infinity'::timestamptz), '[)') with &&);

revoke insert on public.tv_social_desafios, public.tv_social_soluciones from authenticated;
drop policy tv_social_desafios_insert on public.tv_social_desafios;
drop policy tv_social_soluciones_insert on public.tv_social_soluciones;
drop policy tv_social_soluciones_select on public.tv_social_soluciones;
create policy tv_social_soluciones_select on public.tv_social_soluciones for select to authenticated
  using ((select public.mi_rol()) <> '' and exists (
    select 1 from public.tv_social_desafios d where d.id = desafio_id
    and least(d.cierre_real, d.resuelto_at) <= statement_timestamp()
  ));
drop policy tv_social_respuestas_insert on public.tv_social_respuestas;
create policy tv_social_respuestas_insert on public.tv_social_respuestas for insert to authenticated
  with check ((select public.mi_rol()) <> '' and autor_id = (select auth.uid()));

create table tv_juego_privado.control (
  id boolean primary key default true check (id),
  automatico boolean not null default false,
  segundos integer not null default 90 check (segundos in (60,90,120)),
  usadas integer[] not null default '{}',
  ronda_automatica uuid references public.tv_social_desafios(id)
);
insert into tv_juego_privado.control default values;

create table tv_juego_privado.banco (
  id integer primary key,
  categoria text not null,
  pregunta text not null,
  opciones text[] not null,
  correcta integer not null,
  explicacion text not null
);
insert into tv_juego_privado.banco values
 (1,'acertijo','Cuanto más le quitas, más grande se vuelve. ¿Qué es?',array['Una sombra','Un agujero','Un espejo'],2,'Al sacar tierra, el agujero crece.'),
 (2,'acertijo','🟦 + 🟦 = 8. 🟦 + ⭐ = 7. ¿Cuánto vale ⭐?',array['3','4','5'],1,'Cada cuadrado vale 4. La estrella vale 7 menos 4.'),
 (3,'acertijo','Dos padres y dos hijos comen tres empanadas. Cada uno come una. ¿Cuántas personas hay?',array['Cuatro','Cinco','Tres'],3,'Son abuelo, padre e hijo. El padre del niño también es hijo del abuelo.'),
 (4,'acertijo','Si adelantas a quien va segundo en una carrera, ¿en qué puesto quedas?',array['Primero','Segundo','Tercero'],2,'Pasas a ocupar su puesto. La persona que iba primera sigue delante.'),
 (5,'acertijo','Tiene ciudades, ríos y montañas, pero cabe sobre una mesa. ¿Qué es?',array['Un puente','Una brújula','Un mapa'],3,'Un mapa representa ciudades y accidentes geográficos.'),
 (6,'acertijo','¿Qué se moja mientras seca?',array['Una toalla','Un paraguas','Un jabón'],1,'La toalla absorbe el agua de lo que seca.'),
 (7,'palabras','¿Qué palabra de cinco letras se lee igual de izquierda a derecha que de derecha a izquierda?',array['Radar','Reloj','Radio'],1,'RADAR es un palíndromo. Se lee igual en ambos sentidos.'),
 (8,'palabras','¿Qué palabra puedes formar con las letras de MATE si empieza con T?',array['Marea','Tema','Meta'],2,'TEMA usa las mismas letras que MATE.'),
 (9,'palabras','¿Qué palabra es un anagrama de AMOR?',array['Mora','Rosa','Armar'],1,'MORA usa las cuatro letras de AMOR en otro orden.'),
 (10,'palabras','¿Qué palabra completa las expresiones «___ de nieve» y «___ de algodón»?',array['Lago','Bola','Sombrero'],2,'Se puede decir bola de nieve y bola de algodón.'),
 (11,'palabras','¿Cuál de estas palabras tiene dos letras que se repiten consecutivamente?',array['Arena','Pluma','Carro'],3,'CARRO tiene dos letras R seguidas.'),
 (12,'palabras','¿Cuál de estas palabras contiene las cinco vocales distintas?',array['Murciélago','Rinoceronte','Mariposa'],1,'MURCIÉLAGO contiene A, E, I, O y U.'),
 (13,'trivia','¿Cuántos lados tiene un hexágono?',array['Cinco','Ocho','Seis'],3,'Un hexágono es un polígono de seis lados.'),
 (14,'trivia','¿Qué planeta es conocido como el planeta rojo?',array['Marte','Venus','Mercurio'],1,'Los óxidos de hierro de su superficie le dan su color rojizo.'),
 (15,'trivia','¿Qué instrumento tiene teclas y cuerdas que golpean pequeños martillos?',array['Acordeón','Piano','Clarinete'],2,'En un piano acústico, cada tecla acciona un martillo que golpea una o más cuerdas.'),
 (16,'trivia','¿Qué animal de esta lista es un mamífero marino?',array['Tiburón','Pulpo','Delfín'],3,'El delfín respira aire con pulmones y amamanta a sus crías.'),
 (17,'trivia','¿Qué océano baña la costa continental de Chile?',array['Pacífico','Atlántico','Índico'],1,'La costa continental chilena se abre al océano Pacífico.'),
 (18,'trivia','¿Cuántos minutos hay en dos horas y media?',array['120','150','180'],2,'Dos horas suman 120 minutos y media hora añade 30.');

create table tv_juego_privado.ganadores (
  desafio_id uuid primary key references public.tv_social_desafios(id),
  autor_id uuid not null references auth.users(id) on delete cascade,
  nombre text not null
);
create index tv_juego_ganadores_autor_idx on tv_juego_privado.ganadores (autor_id);
alter table tv_juego_privado.control enable row level security;
alter table tv_juego_privado.banco enable row level security;
alter table tv_juego_privado.ganadores enable row level security;

create function tv_juego_privado.recibir_respuesta() returns trigger
language plpgsql security definer set search_path = '' as $$
declare
  ronda public.tv_social_desafios%rowtype;
  momento timestamptz;
  solucion integer;
  nombre text;
begin
  if auth.uid() is null or new.autor_id is distinct from auth.uid() or coalesce(public.mi_rol(),'') = '' then
    raise exception 'Se requiere un perfil activo.';
  end if;
  select * into ronda from public.tv_social_desafios where id = new.desafio_id for update;
  if not found then raise exception 'El desafío terminó.'; end if;
  momento := clock_timestamp();
  if ronda.inicio > momento or least(ronda.cierre_real, ronda.resuelto_at) <= momento then
    raise exception 'El desafío terminó.';
  end if;
  if ronda.cierre_real is null then
    update public.tv_social_desafios set cierre_real = momento + (ronda.cierre - ronda.inicio) where id = ronda.id;
  end if;
  select opcion into solucion from public.tv_social_soluciones where desafio_id = ronda.id;
  if new.opcion = solucion then
    select coalesce(nullif(btrim(p.nombre),''),'Participante') into nombre from public.perfiles p where p.id = new.autor_id;
    insert into tv_juego_privado.ganadores values (ronda.id, new.autor_id, coalesce(nombre,'Participante'));
    update public.tv_social_desafios set resuelto_at = momento where id = ronda.id;
  end if;
  return new;
end;
$$;
create trigger tv_juego_recibir_respuesta before insert on public.tv_social_respuestas
  for each row execute function tv_juego_privado.recibir_respuesta();

create function tv_juego_privado.crear(pregunta text, categoria text, opciones text[], correcta integer, explicacion text, segundos integer)
returns uuid language plpgsql security invoker set search_path = '' as $$
declare
  ronda uuid;
  momento timestamptz := clock_timestamp();
begin
  insert into public.tv_social_desafios(pregunta,categoria,opciones,inicio,cierre)
    values(btrim(pregunta),categoria,opciones,momento,momento+make_interval(secs=>segundos)) returning id into ronda;
  insert into public.tv_social_soluciones values(ronda,correcta,nullif(btrim(explicacion),''));
  return ronda;
exception when exclusion_violation then
  raise exception 'Ya hay un desafío en curso. Espera a que termine.';
end;
$$;

create function tv_juego_privado.iniciar(pregunta text, categoria text, opciones text[], correcta integer, explicacion text, segundos integer)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.mi_rol() is distinct from 'administrador' then raise exception 'Solo Administración puede iniciar desafíos.'; end if;
  update tv_juego_privado.control set automatico=false, ronda_automatica=null where id;
  return tv_juego_privado.crear(pregunta,categoria,opciones,correcta,explicacion,segundos);
end;
$$;

create function tv_juego_privado.avanzar() returns void
language plpgsql security invoker set search_path = '' as $$
declare
  config tv_juego_privado.control%rowtype;
  ultima public.tv_social_desafios%rowtype;
  elegida tv_juego_privado.banco%rowtype;
  fin timestamptz;
  anterior integer;
begin
  select * into config from tv_juego_privado.control where id for update;
  if not config.automatico then return; end if;
  select * into ultima from public.tv_social_desafios order by inicio desc limit 1 for update;
  if found then
    fin := least(ultima.cierre_real, ultima.resuelto_at);
    if fin is null or clock_timestamp() < fin + interval '12 seconds' then return; end if;
  end if;
  select * into elegida from tv_juego_privado.banco where id <> all(config.usadas)
    order by (categoria = ultima.categoria), random() limit 1;
  if not found then
    anterior := config.usadas[cardinality(config.usadas)];
    config.usadas := '{}';
    select * into elegida from tv_juego_privado.banco where id <> anterior
      order by (categoria = ultima.categoria), random() limit 1;
  end if;
  update tv_juego_privado.control set usadas = array_append(config.usadas,elegida.id),
    ronda_automatica = tv_juego_privado.crear(elegida.pregunta,elegida.categoria,elegida.opciones,elegida.correcta,elegida.explicacion,config.segundos)
    where id;
end;
$$;

create function tv_juego_privado.controlar(activar boolean, duracion integer) returns void
language plpgsql security definer set search_path = '' as $$
declare actual uuid;
begin
  if auth.uid() is null or public.mi_rol() is distinct from 'administrador' then raise exception 'Solo Administración puede gestionar el juego.'; end if;
  if activar is not null then
    update tv_juego_privado.control set automatico=activar, segundos=coalesce(duracion,segundos) where id returning ronda_automatica into actual;
    if not activar then
      update public.tv_social_desafios set resuelto_at=clock_timestamp() where id=actual
        and resuelto_at is null and (cierre_real is null or cierre_real>clock_timestamp());
    end if;
  end if;
  perform tv_juego_privado.avanzar();
end;
$$;

create function tv_juego_privado.banco_admin() returns jsonb
language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.mi_rol() is distinct from 'administrador' then raise exception 'Solo Administración puede consultar el banco.'; end if;
  return (select jsonb_agg(to_jsonb(b) order by b.id) from tv_juego_privado.banco b);
end;
$$;

create function tv_juego_privado.estado() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare momento timestamptz := clock_timestamp();
begin
  if auth.uid() is null or coalesce(public.mi_rol(),'') = '' then return jsonb_build_object('ahora',momento,'ronda',null); end if;
  return jsonb_build_object(
    'ahora',momento,
    'automatico',(select automatico from tv_juego_privado.control where id),
    'ronda',(
      select jsonb_build_object('id',d.id,'pregunta',d.pregunta,'categoria',d.categoria,'opciones',d.opciones,'inicio',d.inicio,
        'cierre',least(d.cierre_real,d.resuelto_at),'esperando',d.cierre_real is null and d.resuelto_at is null,
        'correcta',s.opcion,'explicacion',s.explicacion,'ganador',g.nombre)
      from public.tv_social_desafios d
      left join public.tv_social_soluciones s on s.desafio_id=d.id and least(d.cierre_real,d.resuelto_at)<=momento
      left join tv_juego_privado.ganadores g on g.desafio_id=d.id
      where d.inicio<=momento order by d.inicio desc limit 1
    ),
    'marcador',coalesce((select jsonb_agg(jsonb_build_object('nombre',m.nombre,'puntos',m.puntos) order by m.puntos desc,m.nombre)
      from (
        select coalesce(nullif(btrim(p.nombre),''),max(g.nombre)) as nombre,count(*) as puntos
        from tv_juego_privado.ganadores g left join public.perfiles p on p.id=g.autor_id
        group by g.autor_id,p.nombre order by puntos desc,nombre,g.autor_id limit 5
      ) m),'[]'::jsonb)
  );
end;
$$;

revoke all on all functions in schema tv_juego_privado from public, anon, authenticated;
grant execute on function tv_juego_privado.iniciar(text,text,text[],integer,text,integer),
  tv_juego_privado.controlar(boolean,integer), tv_juego_privado.estado(), tv_juego_privado.banco_admin() to authenticated;

create or replace function public.tv_social_iniciar(pregunta text, categoria text, opciones text[], correcta integer, explicacion text, segundos integer)
returns uuid language sql security invoker set search_path = '' as $$
  select tv_juego_privado.iniciar(pregunta,categoria,opciones,correcta,explicacion,segundos);
$$;
create or replace function public.tv_social_ronda() returns jsonb language sql security invoker set search_path = '' as $$
  select tv_juego_privado.estado();
$$;
create function public.tv_social_tv() returns jsonb language plpgsql security invoker set search_path = '' as $$
begin
  perform tv_juego_privado.controlar(null,null);
  return tv_juego_privado.estado();
end;
$$;
create function public.tv_social_modo(activar boolean, duracion integer) returns void language sql security invoker set search_path = '' as $$
  select tv_juego_privado.controlar(activar,duracion);
$$;
create function public.tv_social_banco() returns jsonb language sql security invoker set search_path = '' as $$
  select tv_juego_privado.banco_admin();
$$;
revoke all on function public.tv_social_tv(), public.tv_social_modo(boolean,integer), public.tv_social_banco() from public, anon, authenticated;
grant execute on function public.tv_social_tv(), public.tv_social_modo(boolean,integer), public.tv_social_banco() to authenticated;
