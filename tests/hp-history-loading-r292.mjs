import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';

const source=readFileSync('assets/stainher-v1524-hp-history-r71.js','utf8');
assert.match(source,/QUERY_LIMIT_MS=12000/);
assert.match(source,/data-hp-history-retry/);

function fixture(hanging=false){
  let calls=0;
  const node=(type='div')=>({
    type,id:'',className:'',isConnected:true,innerHTML:'',textContent:'',
    _events:{},
    addEventListener(name,handler){this._events[name]=handler},
    querySelector(selector){
      if(selector==='.hp-history-table')return this.innerHTML.includes('hp-history-table')?{}:null;
      if(selector==='[data-hp-history-error]'&&this.innerHTML.includes('data-hp-history-error'))return errorNode;
      if(selector==='[data-hp-history-retry]'&&this.innerHTML.includes('data-hp-history-retry'))return retryNode;
      return null;
    }
  });
  const errorNode=node('span'),retryNode=node('button');
  const document={
    head:{appendChild(){}},
    getElementById(){return null},
    createElement:()=>node()
  };
  const inputs={'#hpMonth':{value:'2026-10'}};
  let host=null;
  const page={
    isConnected:true,dataset:{},_events:{},
    querySelector(selector){return selector==='#hpHistoryR71'?host:inputs[selector]||null},
    querySelectorAll(){return []},
    appendChild(child){host=child},
    addEventListener(name,fn){this._events[name]=fn}
  };
  const rows={
    dotacion_contrato:[{user_id:'u1',nombre:'Ejemplo',cargo:'Técnico',estado:'activo',fecha_inicio_contrato:'2026-01-01'}],
    perfiles:[{id:'u1',rol:'tecnico'}],
    turnos_malla_v1512:[{user_id:'u1',fecha:'2026-09-01',turno_base:'A'}],
    turnos_novedades_v15:[],
    hp_ajustes_manuales:[]
  };
  const sb={from(table){
    calls++;
    const query={
      select(){return this},not(){return this},gte(){return this},lte(){return this},eq(){return this},abortSignal(){return this},
      then(ok,fail){
        if(hanging&&table==='turnos_malla_v1512')return new Promise(()=>{}).then(ok,fail);
        return Promise.resolve({data:rows[table],error:null}).then(ok,fail);
      }
    };
    return query;
  }};
  const window={sb};
  const context={window,document,Date,Intl,AbortController,Promise,Map,WeakMap,Set,Number,String,Object,Math,
    setTimeout:(fn,ms)=>setTimeout(fn,ms>=12000?35:ms),clearTimeout};
  runInNewContext(source,context);
  return {window,page,inputs,getHost:()=>host,getCalls:()=>calls,errorNode,retryNode};
}

{
  const f=fixture();
  await Promise.all([f.window.StainherHPHistory.render(f.page),f.window.StainherHPHistory.render(f.page)]);
  const html=f.getHost().innerHTML;
  assert.match(html,/Julio-26/);
  assert.match(html,/Agosto-26/);
  assert.match(html,/Septiembre-26/);
  assert.match(html,/hp-history-table/);
  assert.match(html,/Principales variaciones/);
  assert.equal(f.getCalls(),5,'Las consultas compartidas no se deben duplicar');
  await f.window.StainherHPHistory.render(f.page);
  assert.equal(f.getCalls(),5,'No reiniciar una comparación ya cargada');
}
{
  const f=fixture(true);
  await f.window.StainherHPHistory.render(f.page);
  assert.match(f.getHost().innerHTML,/data-hp-history-retry/);
  assert.match(f.errorNode.textContent,/Tiempo de espera agotado/);
  assert.ok(typeof f.retryNode._events.click==='function','Permite reintentar');
}
console.log('R292: tres meses, consultas únicas y salida de carga ante timeout');
