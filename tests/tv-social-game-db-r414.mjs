import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {test} from 'node:test';
import {PGlite} from '@electric-sql/pglite';

test('el reloj espera el primer envío y diez preguntas definen un ganador con reinicio de puntos',async()=>{
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
    for(const file of ['20261109195732_tv_social_r413.sql','20261109201757_tv_social_juego_r414.sql','20261109204246_tv_social_partidas_r415.sql'])
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
    let automatic=await status('tv_social_tv');
    assert.equal(automatic.automatico,true);
    assert.notEqual(automatic.ronda.id,id);
    assert.deepEqual(automatic.marcador,[]);
    const match=automatic.partida.id;
    const seen=new Set();
    let previousCategory=null;
    for(let number=1;number<=10;number++){
      assert.equal(automatic.partida.numero,number);
      assert.equal(automatic.partida.total,10);
      assert.equal(automatic.partida.id,match);
      assert.equal(automatic.ronda.esperando,true);
      assert.notEqual(automatic.ronda.categoria,previousCategory);
      previousCategory=automatic.ronda.categoria;
      assert.ok(!seen.has(automatic.ronda.pregunta),'La partida no repite preguntas');
      seen.add(automatic.ronda.pregunta);
      const chosen=bank.find(entry=>entry.pregunta===automatic.ronda.pregunta);
      assert.ok(chosen);
      await role(number<=5?ana:diego);
      await answer(automatic.ronda.id,chosen.correcta);
      assert.equal((await status()).ronda.ganador,number<=5?'Ana QA':'Diego QA');
      await role(admin);
      assert.equal((await status('tv_social_tv')).ronda.id,automatic.ronda.id,'Se deja visible el resultado de cada pregunta');
      await db.exec('reset role');
      await db.query(`update tv_social_desafios set
        inicio=now()-interval '20 minutes'+numero*interval '15 seconds',
        cierre=now()-interval '19 minutes'+numero*interval '15 seconds',
        resuelto_at=now()-interval '20 minutes'+numero*interval '15 seconds'+interval '1 second'
        where id=$1`,[automatic.ronda.id]);
      await role(admin);
      automatic=await status('tv_social_tv');
    }
    assert.equal(automatic.automatico,false);
    assert.equal(automatic.partida.estado,'finalizada');
    assert.equal(automatic.partida.numero,10);
    assert.deepEqual(automatic.marcador,[{nombre:'Ana QA',puntos:5},{nombre:'Diego QA',puntos:5}]);
    assert.deepEqual(automatic.partida.ganador,{nombre:'Ana QA',puntos:5},'Desempata quien llegó primero al puntaje final');
    assert.equal((await status('tv_social_tv')).ronda.id,automatic.ronda.id,'La pregunta once espera otra partida');
    await db.query('select tv_social_modo(true,60)');
    const restarted=await status('tv_social_tv');
    assert.equal(restarted.partida.numero,1);
    assert.notEqual(restarted.partida.id,match);
    assert.deepEqual(restarted.marcador,[]);
    await db.query('select tv_social_modo(false,60)');
    const stopped=await status('tv_social_tv');
    assert.equal(stopped.partida.estado,'cancelada');
    assert.equal(stopped.automatico,false);
    assert.equal(stopped.ronda.esperando,false);
  }finally{await db.close()}
});
