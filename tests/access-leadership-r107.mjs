import assert from 'node:assert/strict';
import fs from 'node:fs';
import vm from 'node:vm';

const source=fs.readFileSync(new URL('../assets/stainher-v1524-access-leadership-r107.js',import.meta.url),'utf8');
const root={innerHTML:''};
const form={};
let rpcCalls=0;
const window={
  state:{profile:{rol:'apr'},leadershipYear:2026,leadershipMonth:9,session:{user:{id:'apr-1'}}},
  v11Role(){return this.state.profile.rol},
  canEditV11(module){return module==='liderazgo'},
  esc(value){return String(value)},
  v1514RoleLabel(value){return value==='tecnico'?'Técnico':'Supervisor'},
  addEventListener(){},
  toast(){},
  sb:{
    async rpc(name){rpcCalls++;assert.equal(name,'liderazgo_personal_programable_v107');return {data:[{id:'u-1',nombre:'Ana Técnico',rol:'tecnico'}],error:null}},
    from(table){assert.equal(table,'liderazgo_plantillas_v1512');return {select(){return this},eq(){return this},order(){return Promise.resolve({data:[],error:null})}}}
  }
};
const document={getElementById(id){return id==='modalRoot'?root:id==='v1514LeadGoal'?form:null}};
const context=vm.createContext({window,document,V12_CONTROLS:[{n:6,code:'CTRL-06',name:'Control preventivo',active:true}],console,FormData:class {}});
vm.runInContext(source,context);

assert.equal(window.canManageLeadershipV11(),true,'APR con permiso editar debe programar');
await window.openLeadershipGoalV95();
assert.equal(rpcCalls,1,'debe usar la RPC restringida');
assert.match(root.innerHTML,/Ana Técnico/);
assert.match(root.innerHTML,/CTRL-06/);

window.state.profile.rol='tecnico';
assert.equal(window.canManageLeadershipV11(),false,'Técnico no debe administrar programación');
await window.openLeadershipGoalV95();
assert.equal(rpcCalls,1,'Técnico no debe consultar el listado programable');

console.log('access-leadership-r107: ok');
