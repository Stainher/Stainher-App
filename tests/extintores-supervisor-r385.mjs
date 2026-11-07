import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {test} from 'node:test';
const src=readFileSync('assets/stainher-v1524-extintores-supervisor-r385.js','utf8');
const loader=readFileSync('assets/stainher-v1524-hp-loader-r72.js','utf8');
test('R385: solo el selector seguro se carga y no observa todo el DOM',()=>{
 new Function(src);
 assert.match(loader,/await refreshExtintoresSupervisorR386\(\);/);
 assert.match(loader,/stainher-v1524-extintores-supervisor-r385\.js/);
 assert.doesNotMatch(loader,/await refreshExtintoresSupervisorR383\(\)/);
 assert.doesNotMatch(src,/MutationObserver|setInterval/);
});
test('R385: técnicos cargan cuatro supervisores sin bloquear el formulario ni perder selección',async()=>{
 const callbacks={};
 const options=[];
 const form={querySelectorAll(type){return type==='select'?[select]:[]}};
 const title={textContent:'Check List de Extintores'};
 const root={querySelector(type){return type==='#extFormV157'?form:type==='h1,h2,h3'?title:null}};
 const parent={
  querySelector(){return null},
  appendChild(node){this.notice=node}
 };
 const select={
  name:'supervisor_nombre',id:'extSupervisorV157',labels:[],dataset:{},
  disabled:true,value:'',style:{setProperty(){}},isConnected:true,
  options, parentElement:parent,
  getAttribute(){return ''},
  closest(type){return type==='label'?{textContent:'Supervisor'}:null},
  insertBefore(item){options.unshift(item)},
  appendChild(item){options.push(item)},
  removeAttribute(){}
 };
 const document={
  readyState:'loading',__r385ExtintoresInstalled:false,
  getElementById(id){return id==='modalRoot'?root:null},
  addEventListener(name,cb){callbacks[name]=cb},
  createElement(){return {dataset:{},style:{},textContent:'',value:''}}
 };
 const sup=[
  {nombre:'Supervisor A',user_id:'id1'},
  {nombre:'Supervisor B',user_id:'id2'},
  {nombre:'Supervisor C',user_id:'id3'},
  {nombre:'Supervisor D',user_id:'id4'}
 ];
 let rpcCalls=0;
 const window={sb:{rpc:async()=>{rpcCalls++;return {data:sup,error:null}}},addEventListener(){}};
 vm.runInNewContext(src,{window,document,console,setTimeout(){}});
 const api=window.StainherExtintoresSupervisorR385;
 assert.equal(await api.refresh(),true);
 assert.equal(options.length,5);
 assert.equal(options[1].value,'Supervisor A');
 assert.equal(select.disabled,false);
 assert.equal(parent.notice.textContent,'');
 select.value='Supervisor C';
 assert.equal(await api.refresh(),true);
 assert.equal(select.value,'Supervisor C');
 assert.equal(rpcCalls,1);
 assert.equal(await api.refresh(),true);
 assert.equal(options.length,5,'No genera opciones duplicadas');
});
