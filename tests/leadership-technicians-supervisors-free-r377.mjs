import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const src=readFileSync('assets/stainher-v1524-leadership-execution-access.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
new Function(src);new Function(loader);
assert.match(loader,/refreshLeadershipExecuteR377/);
assert.match(loader,/stainher-v1524-leadership-execution-access\.js/);
test('R377: todos los perfiles Supervisor y Técnico pueden ejecutar libremente, sin programación',()=>{
 for(const role of ['supervisor','tecnico','técnico','administrador','prevencion']){
  const ctx={
   window:{
    state:{profile:{rol:role},session:{user:{id:'test'}}},
    v11Role:()=>role,
    canExecuteLeadershipV11:()=>false,
    v1512LeadershipFreeRole:()=>false,
    canManageLeadershipV11:()=>false,
    addEventListener(){},
   },
   document:{getElementById:()=>null,currentScript:null,querySelector:()=>({}),createElement:()=>({dataset:{},addEventListener(){}}),head:{appendChild(){}}},
   location:{href:'https://example.test/assets/leadership.js'},
   URL, setTimeout:()=>{}
  };
  vm.runInNewContext(src,ctx);
  assert.equal(ctx.window.canExecuteLeadershipV11(),true,role+' puede ejecutar');
  assert.equal(ctx.window.v1512LeadershipFreeRole(),true,role+' sin programación');
  assert.equal(ctx.window.canManageLeadershipV11(),false,role+' no recibe permisos de administrar');
 }
});
test('R377: otros perfiles sin autorización no adquieren permisos',()=>{
 const ctx={window:{state:{profile:{rol:'visitante'}},v11Role:()=> 'visitante',canExecuteLeadershipV11:()=>false,v1512LeadershipFreeRole:()=>false,addEventListener(){}},document:{getElementById:()=>null,currentScript:null,querySelector:()=>({}),createElement:()=>({dataset:{},addEventListener(){}}),head:{appendChild(){}}},location:{href:'https://example.test/'},URL,setTimeout:()=>{}};
 vm.runInNewContext(src,ctx);
 assert.equal(ctx.window.canExecuteLeadershipV11(),false);
 assert.equal(ctx.window.v1512LeadershipFreeRole(),false);
});
