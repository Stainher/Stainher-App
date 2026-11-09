create table tv_juego_privado.partidas (
  id uuid primary key default gen_random_uuid(),
  estado text not null default 'en_curso' check (estado in ('en_curso','finalizada','cancelada')),
  iniciada_at timestamptz not null default clock_timestamp(),
  finalizada_at timestamptz
);
alter table tv_juego_privado.partidas enable row level security;

alter table public.tv_social_desafios
  add column partida_id uuid references tv_juego_privado.partidas(id),
  add column numero smallint,
  add constraint tv_social_desafios_posicion_valida check (
    (partida_id is null and numero is null) or
    (partida_id is not null and numero is not null and numero between 1 and 10)
  ),
  add constraint tv_social_desafios_posicion_unica unique(partida_id,numero);
alter table tv_juego_privado.control add column partida_id uuid references tv_juego_privado.partidas(id);

-- Si el modo anterior está activo, incorpora únicamente la pregunta todavía abierta.
do $$
declare
  nueva uuid;
  actual public.tv_social_desafios%rowtype;
begin
  if (select automatico from tv_juego_privado.control where id) then
    insert into tv_juego_privado.partidas default values returning id into nueva;
    select * into actual from public.tv_social_desafios order by inicio desc limit 1;
    update tv_juego_privado.control set partida_id=nueva, usadas='{}' where id;
    if actual.id=(select ronda_automatica from tv_juego_privado.control where id)
      and (least(actual.cierre_real,actual.resuelto_at) is null or least(actual.cierre_real,actual.resuelto_at)>clock_timestamp()) then
      update public.tv_social_desafios set partida_id=nueva, numero=1 where id=actual.id;
      update tv_juego_privado.control set usadas=array(
        select b.id from tv_juego_privado.banco b where b.pregunta=actual.pregunta and b.categoria=actual.categoria
      ) where id;
    end if;
  end if;
end;
$$;

create or replace function tv_juego_privado.iniciar(pregunta text, categoria text, opciones text[], correcta integer, explicacion text, segundos integer)
returns uuid language plpgsql security definer set search_path = '' as $$
begin
  if auth.uid() is null or public.mi_rol() is distinct from 'administrador' then raise exception 'Solo Administración puede iniciar desafíos.'; end if;
  perform 1 from tv_juego_privado.control where id for update;
  if (select automatico from tv_juego_privado.control where id) then
    raise exception 'Detén la partida automática antes de iniciar una pregunta individual.';
  end if;
  update tv_juego_privado.control set partida_id=null,ronda_automatica=null where id;
  return tv_juego_privado.crear(pregunta,categoria,opciones,correcta,explicacion,segundos);
end;
$$;

create or replace function tv_juego_privado.avanzar() returns void
language plpgsql security invoker set search_path = '' as $$
declare
  config tv_juego_privado.control%rowtype;
  ultima public.tv_social_desafios%rowtype;
  elegida tv_juego_privado.banco%rowtype;
  siguiente integer;
  ronda uuid;
  fin timestamptz;
begin
  select * into config from tv_juego_privado.control where id for update;
  if not config.automatico then return; end if;
  select * into ultima from public.tv_social_desafios order by inicio desc limit 1 for update;
  if found then
    fin := least(ultima.cierre_real, ultima.resuelto_at);
    if fin is null or clock_timestamp()<fin+interval '12 seconds' then return; end if;
  end if;
  siguiente := case when ultima.partida_id=config.partida_id then ultima.numero+1 else 1 end;
  if siguiente=11 then
    update tv_juego_privado.partidas set estado='finalizada',finalizada_at=clock_timestamp() where id=config.partida_id;
    update tv_juego_privado.control set automatico=false where id;
    return;
  end if;
  select * into elegida from tv_juego_privado.banco where id <> all(config.usadas)
    order by (categoria=ultima.categoria), random() limit 1;
  if not found then raise exception 'El banco requiere al menos diez preguntas disponibles.'; end if;
  ronda := tv_juego_privado.crear(elegida.pregunta,elegida.categoria,elegida.opciones,elegida.correcta,elegida.explicacion,config.segundos);
  update public.tv_social_desafios set partida_id=config.partida_id,numero=siguiente where id=ronda;
  update tv_juego_privado.control set usadas=array_append(config.usadas,elegida.id),ronda_automatica=ronda where id;
end;
$$;

create or replace function tv_juego_privado.controlar(activar boolean, duracion integer) returns void
language plpgsql security definer set search_path = '' as $$
declare
  config tv_juego_privado.control%rowtype;
  nueva uuid;
begin
  if auth.uid() is null or public.mi_rol() is distinct from 'administrador' then raise exception 'Solo Administración puede gestionar el juego.'; end if;
  if activar is not null then
    select * into config from tv_juego_privado.control where id for update;
    if activar and not config.automatico then
      insert into tv_juego_privado.partidas default values returning id into nueva;
      update tv_juego_privado.control
        set partida_id=nueva,automatico=true,ronda_automatica=null,segundos=coalesce(duracion,segundos),usadas='{}' where id;
    elsif not activar and config.automatico then
      update public.tv_social_desafios set resuelto_at=clock_timestamp() where id=config.ronda_automatica
        and resuelto_at is null and (cierre_real is null or cierre_real>clock_timestamp());
      update tv_juego_privado.partidas set estado='cancelada',finalizada_at=clock_timestamp() where id=config.partida_id;
      update tv_juego_privado.control set automatico=false where id;
    end if;
  end if;
  perform tv_juego_privado.avanzar();
end;
$$;

create or replace function tv_juego_privado.estado() returns jsonb
language plpgsql security definer set search_path = '' as $$
declare momento timestamptz := clock_timestamp();
begin
  if auth.uid() is null or coalesce(public.mi_rol(),'')='' then return jsonb_build_object('ahora',momento,'ronda',null); end if;
  return (
    with config as (select partida_id,automatico from tv_juego_privado.control where id),
    ultima as (
      select d.* from public.tv_social_desafios d where d.inicio<=momento order by d.inicio desc limit 1
    ),
    puntos as (
      select coalesce(nullif(btrim(p.nombre),''),max(g.nombre)) as nombre,count(*) as puntos,max(d.resuelto_at) as ultimo,g.autor_id
      from tv_juego_privado.ganadores g join public.tv_social_desafios d on d.id=g.desafio_id
      left join public.perfiles p on p.id=g.autor_id cross join config c
      where d.partida_id is not distinct from c.partida_id
      group by g.autor_id,p.nombre order by puntos desc,ultimo,autor_id limit 5
    ),
    marcador as (
      select coalesce(jsonb_agg(jsonb_build_object('nombre',nombre,'puntos',puntos) order by puntos desc,ultimo,autor_id),'[]'::jsonb) as lista from puntos
    )
    select jsonb_build_object(
      'ahora',momento,'automatico',c.automatico,
      'ronda',(
        select jsonb_build_object('id',d.id,'pregunta',d.pregunta,'categoria',d.categoria,'opciones',d.opciones,'inicio',d.inicio,
          'cierre',least(d.cierre_real,d.resuelto_at),'esperando',d.cierre_real is null and d.resuelto_at is null,
          'correcta',s.opcion,'explicacion',s.explicacion,'ganador',g.nombre)
        from ultima d
        left join public.tv_social_soluciones s on s.desafio_id=d.id and least(d.cierre_real,d.resuelto_at)<=momento
        left join tv_juego_privado.ganadores g on g.desafio_id=d.id
      ),
      'marcador',m.lista,
      'partida',case when p.id is not null then jsonb_build_object(
        'id',p.id,'estado',p.estado,'finalizada_en',p.finalizada_at,'total',10,
        'numero',(select d.numero from ultima d where d.partida_id=p.id),
        'ganador',case when p.estado='finalizada' then m.lista->0 end
      ) end
    )
    from config c cross join marcador m left join tv_juego_privado.partidas p on p.id=c.partida_id
  );
end;
$$;
