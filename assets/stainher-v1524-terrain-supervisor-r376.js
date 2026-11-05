/* R376 · Selector confiable de supervisor, Control Preventivo en Terreno */
(()=>{
'use strict';
if(window.StainherTerrainSupervisorR376)return;
const ID='terrainSupervisorV11';
const RESTRICTED=new Set(['supervisor','tecnico','técnico']);
let cached=[],cacheAt=0, loading=null, pending=null, installed=false, applying=false;
const remembered=new WeakMap();
const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
function role(){
 try{
  const v=typeof window.v11Role==='function'?window.v11Role():null;
  return norm(v||window.state?.profile?.rol||window.state?.profile?.role||'');
 }catch(e){return norm(window.state?.profile?.rol)}
}
function client(){return window.sb||null}
async function effectiveRole(){
 const known=role();if(known)return known;
 const db=client();if(!db?.rpc)return '';
 try{const {data,error}=await db.rpc('mi_rol');return error?'':norm(data)}catch(e){return ''}
}
function select(){return document.getElementById(ID)}
function message(sel,text){
 if(!sel?.isConnected)return;
 let el=sel.parentElement?.querySelector('[data-r376-notice]');
 if(!el){el=document.createElement('small');el.dataset.r376Notice='1';
  el.style.cssText='display:block;margin-top:5px;color:var(--muted,#496a85);font-size:12px';
  sel.insertAdjacentElement('afterend',el)}
 el.textContent=text;
}
async function supervisors(){
 if(cached.length&&Date.now()-cacheAt<120000)return cached;
 if(loading)return loading;
 loading=(async()=>{
  const db=client();
  if(!db?.rpc)throw new Error('Conexión a Supabase no disponible');
  let errors=[];
  for(const proc of ['liderazgo_supervisores_v13','liderazgo_supervisores']){
   try{
    const q=await db.rpc(proc);
    if(q.error){errors.push(q.error.message||proc);continue}
    const data=(q.data||[]).filter(x=>String(x.nombre||'').trim()).map(x=>({
     nombre:String(x.nombre).trim(),user_id:String(x.user_id||'')
    }));
    if(data.length){
     const seen=new Set();
     cached=data.filter(x=>{const k=norm(x.nombre);if(seen.has(k))return false;seen.add(k);return true});
     cacheAt=Date.now();return cached;
    }
   }catch(e){errors.push(e.message||String(e))}
  }
  throw new Error(errors.join('; ')||'No se encontraron supervisores activos');
 })();
 try{return await loading}finally{loading=null}
}
function populate(sel,list){
 if(!sel?.isConnected)return;
 const old=remembered.get(sel)||sel.value||'';
 applying=true;
 try{
  sel.replaceChildren();
  const placeholder=document.createElement('option');
  placeholder.value='';placeholder.textContent='Seleccionar supervisor';
  sel.appendChild(placeholder);
  for(const item of list){
   const opt=document.createElement('option');opt.value=item.nombre;opt.textContent=item.nombre;
   opt.dataset.userId=item.user_id;sel.appendChild(opt);
  }
  if(old&&Array.from(sel.options).some(o=>o.value===old))sel.value=old;
  else sel.value='';
  sel.disabled=false;sel.style.setProperty('pointer-events','auto','important');
  sel.style.setProperty('opacity','1','important');
  sel.dataset.r376Ready='1';
  message(sel,'');
 }finally{applying=false}
}
async function refresh(sel,force=false){
 if(!sel?.isConnected||sel.id!==ID)return;
 const r=await effectiveRole();
 if(!sel.isConnected)return;
 if(!r){message(sel,'No se ha identificado el perfil. Reabra el formulario.');return}
 if(RESTRICTED.has(r))return;
 if(!force&&sel.dataset.r376Ready==='1'&&sel.options.length>1&&!sel.disabled)return;
 if(pending===sel)return;
 pending=sel;
 message(sel,'Cargando supervisores…');
 try{
  const list=await supervisors();
  if(!sel.isConnected)return;
  // Sólo rellenar el selector del formulario todavía abierto.
  populate(sel,list);
 }catch(err){
  console.warn('[R376] Carga supervisores',err);
  if(sel.isConnected){
   sel.disabled=false;
   message(sel,'No se pudo cargar la nómina. Haga clic en Supervisor para reintentar.');
  }
 }finally{if(pending===sel)pending=null}
}
function schedule(){
 const el=select();if(!el||applying)return;
 if(el.dataset.r376Ready==='1'&&el.options.length>1&&!el.disabled)return;
 void refresh(el);
}
function install(){
 if(installed)return;installed=true;
 document.addEventListener('change',ev=>{
  const el=ev.target;
  if(el?.id===ID&&el.value)remembered.set(el,el.value);
 },true);
 document.addEventListener('focusin',ev=>{
  if(ev.target?.id===ID)void refresh(ev.target);
 },true);
 document.addEventListener('pointerdown',ev=>{
  if(ev.target?.id===ID&&ev.target.options.length<=1)void refresh(ev.target,true);
 },true);
 const observer=new MutationObserver(changes=>{
  if(applying||!changes.some(c=>c.addedNodes.length||c.removedNodes.length))return;
  const el=select();if(!el)return;
  if(el.dataset.r376Ready==='1'&&el.options.length>1&&!el.disabled)return;
  // Reintenta únicamente ante inserción del formulario u opciones vacías.
  schedule();
 });
 observer.observe(document.body,{subtree:true,childList:true});
 window.addEventListener('stainher:modules-ready',schedule);
 window.addEventListener('stainher:navigation',schedule);
 schedule();
}
window.StainherTerrainSupervisorR376={install,refresh,supervisors};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();