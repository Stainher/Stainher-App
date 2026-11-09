import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import test from 'node:test';
import {runInNewContext} from 'node:vm';

const source=readFileSync('supabase/functions/tv-youtube-search/index.ts','utf8');
const origin='https://stainher.github.io';

function fixture({role='administrador',active=true,key='test-api-key'}={}){
 const env={SUPABASE_URL:'https://db.test',SUPABASE_ANON_KEY:'anon',YOUTUBE_DATA_API_KEY:key};
 const calls=[];
 let handler;
 runInNewContext(source,{
  Deno:{serve:fn=>{handler=fn},env:{get:name=>env[name]}},
  Response,URL,URLSearchParams,AbortSignal,
  fetch:async(url,options)=>{
   calls.push({url,options});
   if(url.pathname==='/auth/v1/user')return Response.json({id:'admin-test'});
   if(url.pathname==='/rest/v1/perfiles')return Response.json([{rol:role,activo:active}]);
   assert.equal(url.origin,'https://www.googleapis.com');
   return Response.json({items:[
    {id:{videoId:'M7lc1UVf-VE'},snippet:{title:'Video QA',channelTitle:'Canal QA'}},
    {id:{videoId:'javascript:'},snippet:{title:'ID no válido'}},
   ]});
  },
 });
 const request=({method='POST',token='signed-test',site=origin,query='  seguridad  Andina  '}={})=>{
  const headers={Origin:site,'Content-Type':'application/json'};
  if(token)headers.Authorization='Bearer '+token;
  return handler(new Request('https://db.test/functions/v1/tv-youtube-search',{
   method,headers,body:method==='POST'?JSON.stringify({query}):undefined,
  }));
 };
 return {calls,request};
}

test('rechaza orígenes externos, sesiones ausentes, consultas cortas y perfiles sin permiso',async()=>{
 const guest=fixture();
 assert.equal((await guest.request({site:'https://otro.test'})).status,403);
 assert.equal((await guest.request({token:null})).status,401);
 assert.equal((await guest.request({query:'a'})).status,400);
 assert.equal(guest.calls.length,0);
 for(const options of [{role:'tecnico'},{active:false}]){
  const denied=fixture(options);
  assert.equal((await denied.request()).status,403);
  assert.equal(denied.calls.length,2);
 }
});

test('permite el preflight y reporta una integración sin clave',async()=>{
 const {calls,request}=fixture({key:''});
 const preflight=await request({method:'OPTIONS',token:null});
 assert.equal(preflight.status,204);
 assert.equal(preflight.headers.get('Access-Control-Allow-Origin'),origin);
 const missing=await request();
 assert.equal(missing.status,503);
 assert.match((await missing.json()).error,/activar la conexión/);
 assert.equal(calls.length,2);
});

test('envía solo consultas autorizadas y devuelve videos insertables sin la clave',async()=>{
 const {calls,request}=fixture();
 const response=await request();
 assert.equal(response.status,200);
 assert.deepEqual(await response.json(),{items:[{id:'M7lc1UVf-VE',title:'Video QA',channel:'Canal QA'}]});
 assert.equal(calls[1].url.searchParams.get('id'),'eq.admin-test');
 assert.equal(calls[1].options.headers.Authorization,'Bearer signed-test');
 const [{url,options}]=calls.slice(2);
 assert.equal(url.pathname,'/youtube/v3/search');
 for(const [name,value] of Object.entries({
  q:'seguridad Andina',type:'video',videoEmbeddable:'true',videoSyndicated:'true',regionCode:'CL',
 }))assert.equal(url.searchParams.get(name),value);
 assert.equal(options.headers['x-goog-api-key'],'test-api-key');
});
