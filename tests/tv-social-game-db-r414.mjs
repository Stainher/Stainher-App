import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';

test('el primer envío inicia el tiempo, un acierto cierra y el ciclo conserva el marcador',async()=>{
  const db=new PGlite();
  const admin='00000000-0000-0000-0000-000000000001';
  const ana='00000000-0000-0000-0000-000000000002';
  const diego='00000000-0000-0000-0000-000000000003';
  const start="select tv_social_iniciar('Ronda manual','palabras',array['Radar','Reloj','Radio'],1,'Palíndromo.',60) id";
  const first=async (sql,args)=>(await db.query(sql,args)).rows[0];
  const role=async id=>{
    await db.exec('reset role');
    await db.query("select set_config('request.jwt.claim.sub',$1,false)",[id]);
    await db.exec('set role authenticated');
  };
  const status=async (rpc='tv_social_ronda')=>(await first('select '+rpc+'() value')).value;
  const answer=(id,option)=>db.query('insert into tv_social_respuestas(desafio_id,opcion) values ($1,$2)',[id,option]);
  try{
    await db.exec(`
      create role authenticated; create role anon;
      create schema auth; grant usage on schema auth to authenticated;
      create table auth.users (id uuid primary key);
      insert into auth.users values ('${admin}'),('${ana}'),('${diego}');
      create table public.perfiles (id uuid primary key,nombre text,rol text);
      insert into perfiles values ('${admin}','Admin QA','administrador'),('${ana}','Ana QA','tecnico'),('${diego}','Diego QA','tecnico');
      create function auth.uid() returns uuid language sql stable as
        $$ select nullif(current_setting('request.jwt.claim.sub',true),'')::uuid $$;
      create function public.mi_rol() returns text language sql stable security definer as
        $$ select coalesce((select rol from public.perfiles where id=auth.uid()),'') $$;
      create table tv_pantallas_r397 (id text primary key,valor jsonb,updated_at timestamptz);
    `);
    for(const file of ['20261109195732_tv_social_r413.sql','20261109201757_tv_social_juego_r414.sql'])
      await db.exec(readFileSync('supabase/migrations/'+file,'utf8'));
    await role(admin);
    const {value:bank}=await first('select tv_social_banco() value');
    assert.equal(bank.length,18);
    assert.equal(new Set(bank.map(row=>row.categoria)).size,3);
    assert.ok(bank.every(row=>row.opciones.length===3&&row.correcta>=1&&row.correcta<=3&&row.explicacion.length>0));
    const {id}=await first(start);
    assert.equal((await status()).ronda.esperando,true);
    assert.equal((await status()).ronda.cierre,null);
    await assert.rejects(db.query(start),/Ya hay un desafío/);
    // Incluso después del plazo nominal, la pregunta sigue esperando el primer envío.
    await db.exec('reset role');
    await db.query("update tv_social_desafios set inicio=now()-interval '4 hours',cierre=now()-interval '239 minutes' where id=$1",[id]);
    await role(ana);
    await assert.rejects(db.query('select tv_social_banco()'),/Solo Administración/);
    await assert.rejects(db.query('select tv_social_tv()'),/Solo Administración/);
    assert.equal((await status()).ronda.esperando,true);
    await answer(id,2);
    const running=await status();
    assert.equal(running.ronda.esperando,false);
    assert.equal(running.ronda.correcta,null);
    assert.ok(Date.parse(running.ronda.cierre)-Date.parse(running.ahora)>58000);
    await assert.rejects(answer(id,1),/duplicate key/);
    assert.deepEqual((await status()).marcador,[]);
    await role(diego);
    await answer(id,1);
    const win=await status();
    assert.equal(win.ronda.ganador,'Diego QA');
    assert.equal(win.ronda.correcta,1);
    assert.deepEqual(win.marcador,[{nombre:'Diego QA',puntos:1}]);
    assert.equal((await first('select opcion from tv_social_soluciones where desafio_id=$1',[id])).opcion,1);
    await assert.rejects(answer(id,1),/terminó/);

    await role(admin);
    await db.query('select tv_social_modo(true,60)');
    assert.equal((await status('tv_social_tv')).ronda.id,id,'Se deja visible el ganador por 12 segundos');
    await db.exec('reset role');
    await db.query("update tv_social_desafios set resuelto_at=now()-interval '3 hours' where id=$1",[id]);
    await role(admin);
    const automatic=await status('tv_social_tv');
    assert.equal(automatic.automatico,true);
    assert.notEqual(automatic.ronda.id,id);
    assert.equal(automatic.ronda.esperando,true);
    assert.deepEqual(automatic.marcador,win.marcador);
    assert.equal((await status('tv_social_tv')).ronda.id,automatic.ronda.id);
    const chosen=bank.find(entry=>entry.pregunta===automatic.ronda.pregunta);
    assert.ok(chosen);
    await role(ana);
    await answer(automatic.ronda.id,chosen.correcta);
    assert.equal((await status()).ronda.ganador,'Ana QA','El primer envío correcto gana al instante');
    assert.deepEqual((await status()).marcador,[{nombre:'Ana QA',puntos:1},{nombre:'Diego QA',puntos:1}]);

    await db.exec('reset role');
    await db.query("update tv_social_desafios set inicio=now()-interval '3 minutes',cierre=now()-interval '2 minutes',resuelto_at=now()-interval '13 seconds' where id=$1",[automatic.ronda.id]);
    await role(admin);
    const next=await status('tv_social_tv');
    assert.notEqual(next.ronda.pregunta,automatic.ronda.pregunta);
    assert.notEqual(next.ronda.categoria,automatic.ronda.categoria);
    await db.query('select tv_social_modo(false,60)');
    const stopped=await status('tv_social_tv');
    assert.equal(stopped.automatico,false);
    assert.equal(stopped.ronda.esperando,false);
    assert.equal(stopped.ronda.id,next.ronda.id);
  }finally{await db.close()}
});
