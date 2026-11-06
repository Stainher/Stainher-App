import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import test from 'node:test';
const code=readFileSync('assets/stainher-v1524-extintores-supervisor-r383.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
test('R383: módulo instalado y syntax',()=>{
 new Function(code);assert.match(loader,/refreshExtintoresSupervisorR383/);
 assert.match(loader,/stainher-v1524-extintores-supervisor-r383\.js/);
});
test('R383: listado de supervisores no depende de programación ni perfil que ejecuta',async()=>{
 const opts=[];
 const sel={
  options:opts,disabled:true,value:'',dataset:{},style:{setProperty(){}},isConnected:true,
  parentElement:{querySelector:()=>null},
  closest(x){return x==='form'?form:null},
  replaceChildren(){opts.length=0;this.value=''},
  appendChild(o){opts.push(o)}
 };
 const form={querySelectorAll(type){return type==='select'?[sel]:[]}};
 sel.id='extSupervisorV157';sel.name='supervisor';sel.getAttribute=()=>null;sel.labels=[];
 const doc={
  readyState:'loading',addEventListener(){},getElementById(id){return id==='extFormV157'?form:null},
  createElement(){return {dataset:{},style:{},textContent:'',value:''}}
 };
 const win={addEventListener(){},sb:{rpc:async name=>({data:[{user_id:'u1',nombre:'Supervisor Uno'},{user_id:'u2',nombre:'Supervisor Dos'}],error:null})}};
 const ctx={window:win,document:doc,console,Date,MutationObserver:class{},queueMicrotask:setImmediate};
 vm.runInNewContext(code,ctx);
 const list=await win.StainherExtintoresSupervisorR383.supervisors();
 assert.equal(list.length,2);
 assert.equal(list[0].nombre,'Supervisor Uno');
 assert.doesNotMatch(code,/RESTRICTED|role\(\)===['"]tecnico/);
});
