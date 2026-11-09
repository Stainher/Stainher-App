import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
import test from 'node:test';

const code=readFileSync('supabase/functions/tv-portal-deve/index.ts','utf8');
const html=`<p>Alerta vigente: AVISO DE PRUEBA 10:00 HRS.</p>
 <a href="/deve/site/docs/uno.pdf"><p>Pronóstico semanal</p></a>
 <a href="/deve/site/docs/uno.pdf"><p>Pronóstico semanal</p></a>
 <a href="https://otro.invalid/deve/site/docs/dos.pdf">Informe Pluviométrico</a>
 <a href="/deve/site/docs/boletin.pdf"><p>Boletín Riesgos Naturales</p></a>`;
function serve(body){
 let handler;
 let reads=0;
 runInNewContext(code,{
  Deno:{serve:fn=>{handler=fn}},URL,Response,AbortSignal,
  fetch:async url=>{
   assert.equal(url,'https://deve.codelco.cl/');
   reads++;
   return new Response(body,{headers:{'Content-Type':'text/html'}});
  },
 });
 return {get:()=>handler(new Request('https://app.invalid/functions/v1/tv-portal-deve')),reads:()=>reads};
}

test('extrae aviso y documentos oficiales sin replicar la página, y reutiliza la consulta',async()=>{
 const fixture=serve(html);
 const response=await fixture.get();
 assert.equal(response.status,200);
 assert.match(response.headers.get('cache-control'),/max-age=/);
 const data=await response.json();
 assert.equal(data.alert,'AVISO DE PRUEBA 10:00 HRS.');
 assert.equal(data.documents.length,2);
 assert.ok(data.documents.every(doc=>new URL(doc.url).origin==='https://deve.codelco.cl'));
 assert.ok(Number.isFinite(Date.parse(data.consultedAt)));
 assert.deepEqual(await (await fixture.get()).json(),data);
 assert.equal(fixture.reads(),1);
});

test('cuando el formato de origen cambia, devuelve indisponibilidad',async()=>{
 const response=await serve('<html><p>Sin formato de alertas</p></html>').get();
 assert.equal(response.status,503);
 assert.equal(response.headers.get('cache-control'),'no-store');
});
