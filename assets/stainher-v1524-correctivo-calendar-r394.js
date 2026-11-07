/* R394: calendarios táctiles Desde/Hasta en Correctivo.
 * Conserva input[type=date] y sus eventos para el filtro existente.
 * Sin MutationObserver ni bucles de refresco continuo.
 */
(()=>{
 'use strict';
 if(window.StainherCorrectivoCalendarR394)return;
 const FROM='corrFromV1519',TO='corrToV1519',MODAL='stainher-corr-date-modal-r394';
 const months=['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
 const weekdays=['Lu','Ma','Mi','Ju','Vi','Sa','Do'];
 const icon='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4M17 3v4M3 10h18M7 14h.01M12 14h.01M17 14h.01M7 18h.01M12 18h.01"/></svg>';
 const $=id=>document.getElementById(id);
 const pad=n=>String(n).padStart(2,'0');
 const iso=(y,m,d)=>y+'-'+pad(m+1)+'-'+pad(d);
 const label=v=>{const p=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return p?p[3]+'-'+p[2]+'-'+p[1]:'Seleccionar fecha'};
 let active=null,trigger=null,year=0,month=0,installed=false;
 function mountOne(id){
  const input=$(id);
  if(!input||input.type!=='date'||!input.closest('#page-correctivo'))return false;
  let host=input.closest('.r394-date-field');
  if(!host){
   const shell=input.parentElement?.matches('.stainher-date-picker,.stainher-native-control-shell')?input.parentElement:input;
   host=document.createElement('span');host.className='r394-date-field';
   shell.parentNode.insertBefore(host,shell);host.appendChild(shell);
   const btn=document.createElement('button');btn.type='button';btn.className='r394-date-button';
   btn.dataset.r394Target=id;btn.setAttribute('aria-label','Seleccionar fecha '+(id===FROM?'desde':'hasta'));
   btn.innerHTML='<span class="r394-date-text"></span><span class="r394-date-icon">'+icon+'</span>';
   host.appendChild(btn);
   input.addEventListener('change',()=>{const text=host.querySelector('.r394-date-text');if(text)text.textContent=label(input.value)});
  }
  const button=host.querySelector('.r394-date-button');
  button.disabled=input.disabled||input.readOnly;
  const text=host.querySelector('.r394-date-text');if(text)text.textContent=label(input.value);
  return true;
 }
 function mount(){return [FROM,TO].map(mountOne).every(Boolean)}
 function dialog(){
  let root=$(MODAL);if(root)return root;
  root=document.createElement('div');root.id=MODAL;root.hidden=true;root.setAttribute('aria-hidden','true');
  root.innerHTML='<div class="r394-dialog" role="dialog" aria-modal="true" aria-labelledby="r394-modal-title">'+
    '<div class="r394-header"><h3 id="r394-modal-title">Seleccionar fecha</h3><button type="button" data-r394-act="close" class="r394-close">Cerrar</button></div>'+
    '<div class="r394-month-nav"><button type="button" data-r394-act="prev" aria-label="Mes anterior">‹</button><strong class="r394-month-label"></strong>'+
    '<button type="button" data-r394-act="next" aria-label="Mes siguiente">›</button></div>'+
    '<div class="r394-grid"></div><div class="r394-footer"><button type="button" data-r394-act="today">Hoy</button>'+
    '<button type="button" data-r394-act="close">Cancelar</button></div></div>';
  document.body.appendChild(root);return root;
 }
 function draw(){
  const root=dialog(),input=$(active);if(!input)return;
  root.querySelector('#r394-modal-title').textContent='Seleccionar fecha '+(active===FROM?'desde':'hasta');
  root.querySelector('.r394-month-label').textContent=months[month]+' de '+year;
  const grid=root.querySelector('.r394-grid');grid.replaceChildren();
  for(const w of weekdays){const el=document.createElement('span');el.className='r394-weekday';el.textContent=w;grid.appendChild(el)}
  const offset=(new Date(year,month,1).getDay()+6)%7;
  for(let j=0;j<offset;j++){const gap=document.createElement('span');gap.setAttribute('aria-hidden','true');grid.appendChild(gap)}
  const end=new Date(year,month+1,0).getDate();
  const today=new Date(),todayStr=iso(today.getFullYear(),today.getMonth(),today.getDate());
  for(let d=1;d<=end;d++){
   const value=iso(year,month,d),button=document.createElement('button');
   button.type='button';button.className='r394-day';button.dataset.r394Day=value;button.dataset.selected=String(value===input.value);
   button.dataset.today=String(value===todayStr);button.textContent=String(d);
   button.setAttribute('aria-label',d+' de '+months[month]+' de '+year);
   if(value===input.value)button.setAttribute('aria-current','date');
   grid.appendChild(button);
  }
 }
 function open(id,button){
  const input=$(id);if(!input||input.disabled||input.readOnly)return;
  const d=/^\d{4}-\d{2}-\d{2}$/.test(input.value)?new Date(input.value+'T12:00:00'):new Date();
  active=id;trigger=button;year=d.getFullYear();month=d.getMonth();
  const root=dialog();root.hidden=false;root.setAttribute('aria-hidden','false');draw();
  root.querySelector('[data-r394-act="close"]')?.focus({preventScroll:true});
 }
 function close(){
  const root=$(MODAL);if(root){root.hidden=true;root.setAttribute('aria-hidden','true')}
  const previous=trigger;active=null;trigger=null;previous?.focus?.({preventScroll:true});
 }
 function choose(value){
  const input=$(active);if(!input||!/^\d{4}-\d{2}-\d{2}$/.test(value))return;
  if(input.value!==value){
   input.value=value;input.dispatchEvent(new Event('input',{bubbles:true}));input.dispatchEvent(new Event('change',{bubbles:true}));
  }
  const text=input.closest('.r394-date-field')?.querySelector('.r394-date-text');
  if(text)text.textContent=label(input.value);
  close();
 }
 function install(){
  if(installed)return;installed=true;mount();
  document.addEventListener('click',event=>{
   const button=event.target?.closest?.('[data-r394-target]');
   if(button&&button.closest('#page-correctivo')){event.preventDefault();open(button.dataset.r394Target,button);return}
   const day=event.target?.closest?.('[data-r394-day]');
   if(day?.closest('#'+MODAL)){choose(day.dataset.r394Day);return}
   const act=event.target?.closest?.('[data-r394-act]');
   if(act?.closest('#'+MODAL)){
    if(act.dataset.r394Act==='close')close();
    else if(act.dataset.r394Act==='today'){const d=new Date();choose(iso(d.getFullYear(),d.getMonth(),d.getDate()))}
    else {const d=new Date(year,month+(act.dataset.r394Act==='next'?1:-1),1);year=d.getFullYear();month=d.getMonth();draw()}
    return;
   }
   const tab=event.target?.closest?.('button,[role="tab"],[data-page]');
   if(tab&&(/correctivo|confiabilidad|historial de intervenciones/i.test(tab.textContent||'')||tab.dataset?.page==='correctivo')){
    [0,200,600].forEach(ms=>setTimeout(mount,ms));
   }
  },true);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!$(MODAL)?.hidden)close()});
  document.addEventListener('change',e=>{if(e.target?.id===FROM||e.target?.id===TO)mount()},true);
  window.addEventListener('stainher:modules-ready',()=>{[0,250,650].forEach(ms=>setTimeout(mount,ms))});
  window.addEventListener('stainher:navigation',()=>{if(active)close();[0,250].forEach(ms=>setTimeout(mount,ms))});
  [150,550,1350,2600].forEach(ms=>setTimeout(mount,ms));
 }
 window.StainherCorrectivoCalendarR394=Object.freeze({install,mount,open,close});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();