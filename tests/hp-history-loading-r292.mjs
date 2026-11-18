import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const monthlyScript=readFileSync('assets/stainher-v1524-hp-history-r71.js','utf8');
const window={};
const fteLabel={textContent:'Total FTE'};
const fteValue={textContent:''};
const row=(th,td)=>({querySelector:selector=>selector==='th'?th:td});
const total={textContent:'2.576'};
const month={id:'hpMonth',value:'2026-10'};
const note={};
const notes=[];
let onChange;
const page={
  isConnected:true,
  dataset:{},
  querySelectorAll(selector){
    assert.equal(selector,'.hp-summary tbody tr');
    return [row({textContent:'TOTAL HH EN FAENA'},total),row(fteLabel,fteValue)];
  },
  querySelector(selector){
    if(selector==='#hpMonth')return month;
    if(selector==='.hp-summary')return {};
    assert.equal(selector,'.hp-rules');
    return {querySelector:()=>notes[0],appendChild:child=>notes.push(child)};
  },
  addEventListener(type,listener){
    assert.equal(type,'change');
    assert.equal(onChange,undefined);
    onChange=listener;
  }
};

runInNewContext(monthlyScript,{
  window,
  document:{createElement:tag=>{assert.equal(tag,'span');return note;}},
  setTimeout:callback=>callback(),
  sb:{from(){assert.fail('El resumen mensual no debe consultar el comparativo');}}
});
window.StainherHPHistory.mount(page);
window.StainherHPHistory.mount(page);
assert.equal(fteValue.textContent,'14,1');
assert.equal(notes.length,1);

month.value='2026-11';
total.textContent='1.827';
onChange({target:month});
assert.equal(fteValue.textContent,'10,0');
assert.equal(notes.length,1);
console.log('Reporte HP: FTE mensual disponible sin comparativo histórico');
