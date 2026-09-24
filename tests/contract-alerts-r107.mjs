import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../assets/stainher-v1524-contract-alerts-r94.js',import.meta.url),'utf8');
let panel={dataset:{},remove(){this.removed=true},querySelectorAll(){return []},innerHTML:''};
const page={appendChild(node){panel=node}};
let queries=0;
const document={
  readyState:'loading',head:{appendChild(){}},
  addEventListener(){},createElement(){return {dataset:{},querySelectorAll(){return []},addEventListener(){}}},
  getElementById(id){if(id==='page-inicio')return page;if(id==='stainherContractAlertsR94')return panel;return null}
};
const window={
  state:{profile:{rol:'tecnico'}},document,
  addEventListener(){},
  sb:{from(){queries++;return {select(){return this},neq(){return this},order(){return this},limit(){return Promise.resolve({data:[],error:null})}}}}
};
vm.runInContext(source,vm.createContext({window,document,console,Intl,Date,setInterval,clearInterval}));

await window.stainherRefreshContractAlerts();
assert.equal(queries,0,'Técnico no debe consultar alertas contractuales');
assert.equal(panel.removed,true,'El panel existente debe retirarse para Técnico');

panel={dataset:{},remove(){this.removed=true},querySelectorAll(){return []},innerHTML:''};
window.state.profile.rol='apr';
await window.stainherRefreshContractAlerts();
assert.equal(queries,1,'APR debe consultar alertas contractuales');
assert.match(panel.innerHTML,/Alertas del contrato/);

console.log('contract-alerts-r107: ok');
