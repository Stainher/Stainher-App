/* Stainher App R383: selector de supervisor para CTRL-05 abierto a perfiles con acceso Liderazgo.
 * Cargar la nómina desde la RPC protegida por permisos de lectura y no modificar roles.
 */
(()=>{
 'use strict';
 if(window.StainherExtintoresSupervisorR383)return;
 const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 let cache=[],cachedAt=0,loading=null,updating=false,queued=false;
 const touched=new WeakMap();
 const form=()=>document.getElementById('extFormV157');
 function selector(){
  const f=form();if(!f)return null;
  const found=[...f.querySelectorAll('select')].find(s=>{
   const attr=norm([s.id,s.name,s.getAttribute('aria-label')].join(' '));
   const label=norm(s.closest('label')?.textContent||s.labels?.[0]?.textContent||'');
   return /supervisor|inspector/.test(attr)||/^supervisor\b/.test(label);
  });
  if(found)return found;
  // Algunos diseños colocan el texto Supervisor fuera del <label>.
  const candidates=[...f.querySelectorAll('select')];
  for(const s of candidates){
   let container=s.parentElement;
   for(let i=0;i<3&&container&&container!==f;i++,container=container.parentElement){
    const texts=[...container.querySelectorAll('label,span,strong,b')].map(e=>norm(e.textContent));
    if(texts.some(t=>/^supervisor\s*[:*]?$/.test(t)) && container.querySelectorAll('select').length===1)return s;
   }
  }
  // En el paso Datos principales el primer selector corresponde a Supervisor.
  const modal=f.closest('.modal,.modal-wide-v9')||f;
  if(/check list de extintores/i.test(modal.querySelector('h2,h3')?.textContent||'') && /supervisor/i.test(f.textContent||''))return candidates[0]||null;
  return null;
 }
 function notice(sel,msg){
  if(!sel?.isConnected)return;
  let el=sel.parentElement?.querySelector('[data-r383-notice]');
  if(!el){el=document.createElement('small');el.dataset.r383Notice='1';el.style.cssText='display:block;margin-top:4px;color:var(--muted,#496a85);font-size:11px';sel.insertAdjacentElement('afterend',el)}
  el.textContent=msg;
 }
 async function supervisors(force=false){
  if(!force&&cache.length&&Date.now()-cachedAt<120000)return cache;
  if(loading)return loading;
  loading=(async()=>{
   const db=window.sb;if(!db?.rpc)throw Error('Servicio de nómina no disponible');
   const errors=[];
   for(const name of ['liderazgo_supervisores_v13','liderazgo_supervisores']){
    try{
     const q=await db.rpc(name);
     if(q.error){errors.push(String(q.error.message||name));continue}
     const rows=Array.isArray(q.data)?q.data:[];
     const unique=new Set();
     const list=rows.filter(x=>x?.nombre&&x?.user_id).map(x=>({nombre:String(x.nombre).trim(),id:String(x.user_id)}))
      .filter(x=>{const k=norm(x.nombre);if(unique.has(k))return false;unique.add(k);return true});
     if(list.length){cache=list;cachedAt=Date.now();return list}
    }catch(e){errors.push(String(e?.message||e))}
   }
   throw Error(errors.join('; ')||'No hay supervisores vinculados disponibles');
  })();
  try{return await loading}finally{loading=null}
 }
 async function refresh(sel=selector(),force=false){
  if(!sel?.isConnected||sel.closest('form')!==form())return false;
  if(!force&&sel.dataset.r383Ready==='1'&&sel.options.length>1&&!sel.disabled)return true;
  notice(sel,'Cargando supervisores…');
  try{
   const list=await supervisors(force);
   if(!sel.isConnected||sel.closest('form')!==form())return false;
   const current=touched.get(sel)||sel.value;
   // Se mantiene el formato de las opciones del propio formulario.
   const existing=[...sel.options].find(o=>o.value&&!/^seleccionar/i.test(norm(o.textContent)));
   const useId=!!existing&&list.some(x=>x.id===existing.value)&&!list.some(x=>x.nombre===existing.value);
   updating=true;
   try{
    sel.replaceChildren();
    const placeholder=document.createElement('option');placeholder.value='';placeholder.textContent='Seleccionar supervisor';sel.appendChild(placeholder);
    for(const item of list){
     const opt=document.createElement('option');opt.value=useId?item.id:item.nombre;opt.textContent=item.nombre;
     opt.dataset.userId=item.id;opt.dataset.nombre=item.nombre;sel.appendChild(opt);
    }
    if(current&&[...sel.options].some(o=>o.value===current))sel.value=current;
    else sel.value='';
    sel.disabled=false;sel.removeAttribute('aria-disabled');sel.style.setProperty('pointer-events','auto','important');sel.style.setProperty('opacity','1','important');
    sel.dataset.r383Ready='1';notice(sel,'');
   }finally{updating=false}
   return true;
  }catch(err){console.warn('[R383] Carga del selector de supervisor de extintores',err);
   if(sel.isConnected){sel.disabled=false;notice(sel,'No fue posible cargar supervisores; vuelva a abrir el selector para reintentar.')}
   return false;
  }
 }
 function schedule(){
  if(queued||updating)return;queued=true;
  queueMicrotask(()=>{queued=false;const s=selector();if(s&&(!s.dataset.r383Ready||s.options.length<2||s.disabled))void refresh(s)});
 }
 function install(){
  if(document.__r383ExtintorInstalled)return;document.__r383ExtintorInstalled=true;
  document.addEventListener('change',e=>{if(e.target===selector())touched.set(e.target,e.target.value)},true);
  document.addEventListener('focusin',e=>{if(e.target===selector()&&(e.target.options.length<2||e.target.disabled))void refresh(e.target,true)},true);
  document.addEventListener('pointerdown',e=>{if(e.target===selector()&&(e.target.options.length<2||e.target.disabled))void refresh(e.target,true)},true);
  new MutationObserver(list=>{if(updating||!list.some(x=>x.addedNodes.length||x.removedNodes.length))return;schedule()}).observe(document.body,{childList:true,subtree:true});
  window.addEventListener('stainher:modules-ready',schedule);schedule();
 }
 window.StainherExtintoresSupervisorR383=Object.freeze({install,refresh,supervisors});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();