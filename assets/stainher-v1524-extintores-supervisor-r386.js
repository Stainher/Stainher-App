/* Stainher App · R386 · Supervisor del Check List de Extintores.
 * Compatible con el campo original SELECT o INPUT (incluso type=number en móviles).
 * No instala MutationObservers ni modifica programación, perfiles o reglas de guardado.
 */
(()=>{
 'use strict';
 if(window.StainherExtintoresSupervisorR386)return;
 const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
 const isField=el=>!!el&&el.matches?.('select,input:not([type=hidden]):not([type=date]):not([type=checkbox]):not([type=radio])');
 let roster=null,rosterTime=0,inflight=null;
 const bound=new WeakSet();
 const selectors='select,input:not([type=hidden]):not([type=date]):not([type=checkbox]):not([type=radio])';
 function modal(){
   const root=document.getElementById('modalRoot');
   if(!root)return null;
   const title=[...root.querySelectorAll('h1,h2,h3,h4')].find(x=>/check\s*list\s*de\s*extintores/i.test(norm(x.textContent)));
   if(!title)return null;
   return title.closest('.modal,.modal-wide-v9,[role="dialog"]')||root;
 }
 function labelOwnText(el){
   return norm([...el.childNodes].filter(n=>n.nodeType===3).map(n=>n.textContent).join(' '));
 }
 function findField(){
   const root=modal();if(!root)return null;
   const labels=[...root.querySelectorAll('label,span,strong,b,div')].filter(el=>{
     if(el.matches('div')&&el.children.length>2)return false;
     const own=labelOwnText(el),whole=norm(el.textContent);
     return /^supervisor\s*:?\s*\*?$/.test(own)||(/^supervisor\s*:?\s*\*?$/.test(whole)&&el.children.length<3);
   });
   for(const label of labels){
     const linked=label.getAttribute?.('for')||label.htmlFor;
     const direct=linked&&document.getElementById(linked);
     if(isField(direct))return direct;
     const nested=label.querySelector?.(selectors);
     if(isField(nested))return nested;
     const parent=label.parentElement;
     if(!parent)continue;
     // With separate labels, find the field in the same row before moving up.
     const nearby=[...parent.querySelectorAll(selectors)].filter(isField);
     if(nearby.length===1)return nearby[0];
     const sibling=label.nextElementSibling;
     if(isField(sibling))return sibling;
     const inSibling=sibling?.querySelector?.(selectors);
     if(isField(inSibling))return inSibling;
   }
   // Actual form may put the label to the left of the input in a CSS grid.
   const all=[...root.querySelectorAll(selectors)].filter(isField);
   const named=all.find(el=>/supervisor|inspector/.test(norm([el.name,el.id,el.getAttribute('aria-label')].join(' '))));
   if(named)return named;
   const matching=labels.find(el=>/^supervisor\b/.test(labelOwnText(el)||norm(el.textContent)));
   if(matching&&typeof matching.getBoundingClientRect==='function'){
     const box=matching.getBoundingClientRect();
     let best=null,bestScore=Infinity;
     for(const el of all){
       const field=el.getBoundingClientRect();
       if(field.width<20||field.height<12)continue;
       const delta=Math.max(0,field.top-box.bottom);
       if(delta>120||field.bottom<box.top-12)continue;
       const score=delta+Math.abs(field.left-box.left)*0.15;
       if(score<bestScore){bestScore=score;best=el}
     }
     if(best)return best;
   }
   return null;
 }
 function inform(field,message){
   if(!field?.isConnected)return;
   const host=field.parentElement;if(!host)return;
   let note=host.querySelector('[data-r386-note]');
   if(!note){
     note=document.createElement('small');note.dataset.r386Note='1';
     note.style.cssText='display:block;margin-top:5px;color:var(--muted,#4b6780);font-size:12px';
     host.appendChild(note);
   }
   note.textContent=message;
 }
 async function fetchRoster(){
   if(roster?.length&&Date.now()-rosterTime<120000)return roster;
   if(inflight)return inflight;
   inflight=(async()=>{
     if(!window.sb?.rpc)throw Error('Servicio de supervisores no disponible');
     let error='';
     for(const name of ['liderazgo_supervisores','liderazgo_supervisores_v13']){
       try{
         const result=await window.sb.rpc(name);
         if(result.error){error=result.error.message||name;continue}
         const seen=new Set();
         const rows=(Array.isArray(result.data)?result.data:[])
           .filter(x=>norm(x?.nombre))
           .map(x=>({nombre:String(x.nombre).trim(),id:String(x.user_id||'')}))
           .filter(x=>{const k=norm(x.nombre);if(seen.has(k))return false;seen.add(k);return true});
         if(rows.length){roster=rows;rosterTime=Date.now();return rows}
       }catch(e){error=e?.message||String(e)}
     }
     throw Error(error||'No se encontraron supervisores activos');
   })();
   try{return await inflight}finally{inflight=null}
 }
 function emit(field){
   field.dispatchEvent(new Event('input',{bubbles:true}));
   field.dispatchEvent(new Event('change',{bubbles:true}));
 }
 function addToSelect(sel,people){
   const old=sel.value;
   const known=[...sel.options].filter(o=>o.value);
   const useId=known.some(o=>people.some(p=>p.id&&p.id===o.value))
      &&!known.some(o=>people.some(p=>p.nombre===o.value));
   const existing=new Set([...sel.options].map(o=>o.value));
   if(!existing.has('')){
     const blank=document.createElement('option');blank.value='';blank.textContent='Seleccionar supervisor';sel.insertBefore(blank,sel.firstChild);
   }else{
     const blank=[...sel.options].find(o=>o.value==='');
     if(blank&&!blank.textContent.trim())blank.textContent='Seleccionar supervisor';
   }
   for(const person of people){
     const value=useId?person.id:person.nombre;
     if(!value||existing.has(value))continue;
     const option=document.createElement('option');
     option.value=value;option.textContent=person.nombre;option.dataset.userId=person.id;
     sel.appendChild(option);existing.add(value);
   }
   sel.disabled=false;sel.removeAttribute('readonly');sel.removeAttribute('aria-disabled');
   sel.style.setProperty('pointer-events','auto','important');
   sel.style.setProperty('opacity','1','important');
   if(old&&[...sel.options].some(o=>o.value===old))sel.value=old;
   inform(sel,'');
   return true;
 }
 function addToInput(field,people){
   // A numeric input cannot accept supervisor names. Keep the original field so
   // existing FormData/querySelector references continue to work.
   let select=field.parentElement?.querySelector('[data-r386-supervisor-select]');
   if(!select){
     if(field.type==='number')field.type='text';
     const current=field.value;
     select=document.createElement('select');
     select.className=field.className||'field';
     select.dataset.r386SupervisorSelect='1';
     select.style.cssText='display:block;width:100%;min-height:42px;font-size:16px;color:var(--text,#17324c);background:var(--panel,#fff)';
     select.setAttribute('aria-label','Supervisor');
     // Preserve the original input's name, ID, event listeners and data binding.
     // The visible select has no name; it synchronizes the original input.
     select.required=field.required;
     field.required=false;
     field.disabled=false;
     field.readOnly=false;
     field.style.setProperty('display','none','important');
     field.insertAdjacentElement('afterend',select);
     select.addEventListener('change',()=>{
       field.value=select.value;
       emit(field);
     });
     if(current)field.value=current;
     bound.add(field);
   }
   const old=select.value||field.value;
   const values=new Set([...select.options].map(o=>o.value));
   if(!values.has('')){
     const blank=document.createElement('option');blank.value='';blank.textContent='Seleccionar supervisor';select.appendChild(blank);
   }
   for(const person of people){
     if(values.has(person.nombre))continue;
     const option=document.createElement('option');option.value=person.nombre;option.textContent=person.nombre;
     option.dataset.userId=person.id;select.appendChild(option);values.add(person.nombre);
   }
   select.value=values.has(old)?old:'';
   if(select.value&&!field.value)field.value=select.value;
   inform(select,'');
   return true;
 }
 async function refresh(){
   const field=findField();
   if(!field?.isConnected)return false;
   try{
     const people=await fetchRoster();
     if(field!==findField()||!field.isConnected)return false;
     if(field.tagName==='SELECT')return addToSelect(field,people);
     if(field.tagName==='INPUT')return addToInput(field,people);
   }catch(error){
     console.warn('[R386] Supervisor de extintores:',error);
     inform(field,'No fue posible cargar los supervisores. Toque el campo para reintentar.');
   }
   return false;
 }
 function schedule(){
   // Only bounded attempts after the user opens the official form.
   [0,100,350,800,1600].forEach(ms=>setTimeout(()=>{void refresh()},ms));
 }
 function install(){
   if(document.__stainherExtintoresSupervisorR386Installed)return;
   document.__stainherExtintoresSupervisorR386Installed=true;
   // Preload once; no access to the roster without the authorized read permission.
   void fetchRoster().catch(()=>{});
   document.addEventListener('click',event=>{
     const btn=event.target?.closest?.('button,[role="button"]');
     if(!btn)return;
     const text=norm(btn.textContent);
     if(/realizar ahora|extintores|nueva inspeccion/.test(text))schedule();
   },true);
   document.addEventListener('focusin',event=>{
     const field=findField();if(event.target===field||event.target===field?.parentElement?.querySelector('[data-r386-supervisor-select]'))void refresh();
   },true);
   document.addEventListener('pointerdown',event=>{
     const field=findField();if(event.target===field||event.target===field?.parentElement?.querySelector('[data-r386-supervisor-select]'))void refresh();
   },true);
   window.addEventListener('stainher:modules-ready',schedule,{once:true});
   if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',schedule,{once:true});
   else schedule();
 }
 window.StainherExtintoresSupervisorR386=Object.freeze({install,refresh,fetchRoster,findField});
 install();
})();