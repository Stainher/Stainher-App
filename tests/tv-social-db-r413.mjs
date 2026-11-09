import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';

test('las dinámicas separan perfiles, moderación y solución hasta el cierre',async()=>{
  const db=new PGlite();
  const admin='00000000-0000-0000-0000-000000000001';
  const worker='00000000-0000-0000-0000-000000000002';
  const disabled='00000000-0000-0000-0000-000000000003';
  const openRound="select tv_social_iniciar('¿Qué palabra es un palíndromo?','palabras',array['Radar','Reloj','Radio'],1,'Se lee igual en ambos sentidos.',60) id";
  const profile=async id=>{
    await db.exec('reset role;');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
    await db.exec('set role authenticated;');
  };
  const first=async (sql,args)=> (await db.query(sql,args)).rows[0];
  try{
    await db.exec(`
      create role authenticated; create role anon;
      create schema auth;
      grant usage on schema auth to authenticated;
      create table auth.users (id uuid primary key);
      insert into auth.users values ('${admin}'),('${worker}'),('${disabled}');
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create function public.mi_rol() returns text language sql stable as
        $$ select case auth.uid() when '${admin}'::uuid then 'administrador' when '${worker}'::uuid then 'tecnico' else '' end $$;
      create table tv_pantallas_r397 (id text primary key,valor jsonb,updated_at timestamptz default now());
      insert into tv_pantallas_r397 values ('diario-mural','{"screens":[{"title":"Existente","widgets":[]}]}');
    `);
    await db.exec(readFileSync('supabase/migrations/20261109195732_tv_social_r413.sql','utf8'));
    const {valor}=await first("select valor from tv_pantallas_r397 where id='diario-mural'");
    assert.deepEqual(valor.screens.map(s=>s.title),['Existente','Pausa de oficina']);

    await db.exec('set role anon');
    await assert.rejects(db.query('select tv_social_ronda()'),/permission denied/);
    await profile(disabled);
    assert.equal((await first('select tv_social_ronda() data')).data.ronda,null);
    await assert.rejects(db.query("insert into tv_social_aplausos(destinatario,mensaje) values ('QA','QA')"),/row-level security/);
    await profile(worker);
    await assert.rejects(db.query(openRound),/Solo Administración/);
    await profile(admin);
    const {id}=await first(openRound);
    assert.equal((await first('select tv_social_ronda() data')).data.ronda.correcta,null);
    await assert.rejects(db.query(openRound),/Ya hay un desafío/);

    await profile(worker);
    const hidden=(await first('select tv_social_ronda() data')).data.ronda;
    assert.equal(hidden.correcta,null);
    assert.equal(hidden.explicacion,null);
    assert.deepEqual((await db.query('select opcion from tv_social_soluciones')).rows,[]);
    await db.query('insert into tv_social_respuestas(desafio_id,opcion) values ($1,1)',[id]);
    await assert.rejects(db.query('insert into tv_social_respuestas(desafio_id,opcion) values ($1,2)',[id]),/duplicate key/);
    await db.query("insert into tv_social_aplausos(destinatario,mensaje) values ('Equipo QA','Gracias por la ayuda')");
    assert.deepEqual((await db.query('select id from tv_social_aplausos')).rows,[]);
    assert.equal((await db.query("update tv_social_aplausos set estado='publicado' returning id")).rows.length,0);
    await assert.rejects(db.query("insert into tv_social_aplausos(destinatario,mensaje,estado) values ('QA','QA','publicado')"),/permission denied/);
    await profile(admin);
    assert.deepEqual((await db.query('select opcion from tv_social_respuestas')).rows,[]);
    const {id:applause}=await first("select id from tv_social_aplausos where estado='pendiente'");
    await db.query("update tv_social_aplausos set estado='publicado' where id=$1",[applause]);

    await db.exec('reset role');
    await db.query("update tv_social_desafios set inicio=now()-interval '61 seconds', cierre=now()-interval '1 second' where id=$1",[id]);
    await profile(worker);
    const revealed=(await first('select tv_social_ronda() data')).data.ronda;
    assert.equal(revealed.correcta,1);
    assert.match(revealed.explicacion,/ambos sentidos/);
    assert.deepEqual((await db.query('select id,destinatario from tv_social_aplausos')).rows,[{id:applause,destinatario:'Equipo QA'}]);
    await profile(admin);
    await assert.rejects(db.query('insert into tv_social_respuestas(desafio_id,opcion) values ($1,1)',[id]),/row-level security/);
    await db.query("update tv_social_aplausos set estado='retirado' where id=$1",[applause]);
    await profile(worker);
    assert.deepEqual((await db.query('select id from tv_social_aplausos')).rows,[]);
  }finally{await db.close()}
});
