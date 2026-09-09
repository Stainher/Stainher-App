import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const src=fs.readFileSync('assets/stainher-v1524-fixed-monday-thursday.js','utf8');
const people=[{user_id:'juan',nombre:'Juan Ignacio Soto Muñoz',cargo:'Ingeniero de Confiabilidad',estado:'activo'},{user_id:'cinthia',nombre:'Cinthia',cargo:'Experta en Prevención',estado:'activo'}];
const events=[{id:'lm',user_id:'juan',tipo:'licencia_medica'},{id:'v-j',user_id:'juan',tipo:'vacaciones'},{id:'v-c',user_id:'cinthia',tipo:'vacaciones'}];
async function run({group='',baseEvents=[],visible=people,error=null}={}){
 const queries=[];const query={select(){return this},in(k,v){queries.push([k,v]);return this},lte(){return this},gte(){return this},order(){return Promise.resolve({data:events,error})}};
 const home=()=>{};const eligible=()=>false;const window={renderInicio:home,v1513TurnEligible:eligible,state:{turnGroupV1512:group},sb:{from(name){assert.equal(name,'turnos_novedades_v15');return query}},v1520LoadTurnData:async()=>({allPeople:visible,people:group&&group!=='jornadas-administrativas'?[]:[...visible],groups:[],shifts:[{user_id:'juan',fecha:'2026-09-01',turno_base:'C'}],events:[...baseEvents],range:{start:'2026-09-01',end:'2026-09-30'}})};
 vm.runInNewContext(src,{window,Date,console});const data=await window.v1520LoadTurnData();assert.equal(window.renderInicio,home,'no automatic staffing in Home');assert.equal(window.v1513TurnEligible,eligible,'no forced eligibility');return {data,queries};
}
const rrhh=await run(),admin=await run({baseEvents:events});
assert.deepEqual(Array.from(rrhh.data.events,e=>e.id),['lm','v-j','v-c']);
assert.deepEqual(Array.from(admin.data.events,e=>e.id),['lm','v-j','v-c'],'no duplicated events for administrator');
assert.equal(rrhh.data.shifts.length,1,'no generated shifts');assert.equal(rrhh.data.shifts[0].turno_base,'C','stored shift preserved');assert.equal(rrhh.data.groups.length,0,'no permanent group');assert.equal((await run({group:'jornadas-administrativas'})).data.events.length,3,'retired group cleared');
assert.equal((await run({group:'another-group'})).queries.length,0,'group selection respected');
assert.equal((await run({visible:[]})).queries.length,0,'restricted roster cannot fetch other people');
await assert.rejects(()=>run({error:new Error('permission denied')}),/permission denied/);
console.log('PASS: registered schedules only; RRHH retains medical leave and vacations; administrator deduplication, group scope, restricted roster and query errors.');
