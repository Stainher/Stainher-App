/* Stainher App R385 · CTRL-05 supervisor selector, no global DOM observers.
 * All profiles authorized to execute Liderazgo can choose from actual supervisors.
 * Loads once via authorized Supabase RPC, on opening the checklist or field focus.
 * Never patches the underlying save/PDF logic, alters privileges, or changes other controls.
 */
(()=>{
 'use strict';
 if(window.StainherExtintoresSupervisorR385)return;
 const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
 let cached=null,cacheAt=0,inflight=null;
 const ready=new WeakSet();
 function extRoot(){
  const modal=document.getElementById('modalRoot');
  if(!modal)return null;
  const form=modal.querySelector('#extFormV157');
  if(form)return {modal,form};
  // Fallback only when the actual modal title identifies the extintores control.
  const title=modal.querySelector('h1,h2,h3')?.textContent||'';
  if(!/check list de extintores/i.test(title))return null;
  const other=modal.querySelector('form');
  return other?{modal,form:other}:null;
 }
 function supervisorField(){
  const ctx=extRoot();if(!ctx)return null;
  const selects=[...ctx.form.querySelectorAll('select')];
  const named=selects.find(s=>/supervisor|inspector/.test(norm([s.name,s.id,s.getAttribute('aria-label')].join(' '))));
  if(named)return named;
  for(const s of selects){
   const label=s.closest('label')||s.labels?.[0];
   if(label&&/^supervisor\b/.test(norm(label.textContent)))return s;
  }
  // In the official CTRL-05 wizard, the first select in Datos principales is Supervisor.
  const title=norm(ctx.modal.querySelector('h1,h2,h3')?.textContent||'');
  const contents=norm(ctx.form.textContent||'');
  if(title.includes('check list de extintores')&&contents.includes('supervisor'))return selects[0]||null;
  return null;
 }
 function showNotice(sel,msg){
  if(!sel?.isConnected)return;
  const parent=sel.parentElement;
  if(!parent)return;
  let node=parent.querySelector('[data-r385-supervisor-info]');
  if(!node){
   node=document.createElement('small');node.dataset.r385SupervisorInfo='1';
   node.style.cssText='display:block;margin-top:5px;font-size:11px;color:var(--muted,#536d85)';
   parent.appendChild(node);
  }
  node.textContent=msg;
 }
 async function loadSupervisors(){
  if(cached?.length&&Date.now()-cacheAt<120000)return cached;
  if(inflight)return inflight;
  inflight=(async()=>{
   const sb=window.sb;if(!sb?.rpc)throw Error('No hay conexión con la nómina');
   const errors=[];
   for(const procedure of ['liderazgo_supervisores','liderazgo_supervisores_v13']){
    try{
     const r=await sb.rpc(procedure);
     if(r.error){errors.push(String(r.error.message||procedure));continue}
     const seen=new Set();
     const list=(Array.isArray(r.data)?r.data:[]).filter(x=>String(x?.nombre||'').trim())
       .map(x=>({nombre:String(x.nombre).trim(),id:String(x.user_id||'')}))
       .filter(x=>{const k=norm(x.nombre);if(seen.has(k))return false;seen.add(k);return true});
     if(list.length){cached=list;cacheAt=Date.now();return list}
    }catch(err){errors.push(String(err?.message||err))}
   }
   throw Error(errors.join(' / ')||'No se encontraron supervisores activos');
  })();
  try{return await inflight}finally{inflight=null}
 }
 async function refresh(force=false){
  const select=supervisorField();
  if(!select?.isConnected)return false;
  if(!force&&ready.has(select)&&select.options.length>1&&!select.disabled)return true;
  try{
   const roster=await loadSupervisors();
   if(!select.isConnected||select!==supervisorField())return false;
   const existing=[...select.options];
   const oldValue=select.value;
   const values=existing.filter(o=>o.value).map(o=>o.value);
   const useId=values.some(value=>roster.some(p=>p.id===value))&&!values.some(value=>roster.some(p=>p.nombre===value));
   // Append instead of replacing the form: preserve listeners, step navigation and event state.
   const byValue=new Set(values);
   if(!existing.some(o=>o.value==='')){
    const option=document.createElement('option');option.value='';option.textContent='Seleccionar supervisor';
    select.insertBefore(option,select.firstChild);
   }else{
    const blank=existing.find(o=>o.value==='');
    if(blank&&!blank.textContent.trim())blank.textContent='Seleccionar supervisor';
   }
   for(const person of roster){
    const value=useId?person.id:person.nombre;
    if(!value||byValue.has(value))continue;
    const option=document.createElement('option');
    option.value=value;option.textContent=person.nombre;option.dataset.userId=person.id;
    select.appendChild(option);byValue.add(value);
   }
   select.disabled=false;select.removeAttribute('aria-disabled');
   select.style.setProperty('pointer-events','auto');
   if(oldValue&&[...select.options].some(o=>o.value===oldValue))select.value=oldValue;
   ready.add(select);
   showNotice(select,'');
   return true;
  }catch(err){
   console.warn('[R385] No se cargó el selector de Supervisor de Extintores',err);
   if(select.isConnected)showNotice(select,'No se pudo cargar la nómina. Toque el campo para reintentar.');
   return false;
  }
 }
 function scheduleOpen(){
  // Maximum three bounded attempts following a real user action; no polling loops.
  [50,250,650].forEach(ms=>setTimeout(()=>{void refresh()},ms));
 }
 function install(){
  if(document.__r385ExtintoresInstalled)return;
  document.__r385ExtintoresInstalled=true;
  document.addEventListener('click',event=>{
   const button=event.target?.closest?.('button,[role="button"]');
   if(!button)return;
   const label=norm(button.textContent);
   if(label.includes('realizar ahora')||label.includes('check list de extintores')||label.includes('nueva inspeccion'))scheduleOpen();
  },true);
  document.addEventListener('focusin',event=>{
   if(event.target===supervisorField())void refresh();
  },true);
  document.addEventListener('pointerdown',event=>{
   if(event.target===supervisorField())void refresh();
  },true);
  window.addEventListener('stainher:modules-ready',()=>{
   void loadSupervisors().catch(()=>{});
   void refresh();
  },{once:true});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>{void refresh()},{once:true});
  else {void refresh();void loadSupervisors().catch(()=>{})}
 }
 window.StainherExtintoresSupervisorR385=Object.freeze({install,refresh,loadSupervisors});
 install();
})();
