/* Stainher App V15.24 · R389: RIT integrado como ficha desplegable en Controles Stainher.
   Se reutiliza exactamente el asistente R331 (6 etapas, historial y PDF).
   Sin nuevas tablas, sin duplicar RIT, sin observadores globales ni cambios en permisos.
 */
(()=>{
 'use strict';
 if(window.StainherRITCardR389)return;
 const CARD_ID='stainher-rit-card-r389';
 const BODY_ID='stainher-rit-control-body-r389';
 const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
 let expanded=false,installed=false,queued=false;
 const page=()=>document.getElementById('page-liderazgo');
 function controlsPanel(){
   const root=page();if(!root)return null;
   const named=root.querySelector('#v1512Lead_controles');
   if(named)return named;
   const title=[...root.querySelectorAll('h2,h3,h4,summary')].find(el=>/^controles stainher$/.test(norm(el.textContent)));
   return title?.closest('.panel,section,details')||null;
 }
 function grid(panel){
   // Insert alongside existing control cards, not as another module below the panel.
   const execute=[...panel.querySelectorAll('button')].find(btn=>norm(btn.textContent)==='realizar ahora'&&
     !btn.closest('#'+CARD_ID));
   let card=execute?.closest('.control-card-v95,.leadership-card,[class*="control-card"],[class*="leadership-card"],article');
   if(!card&&execute){
     let n=execute.parentElement;
     while(n&&n!==panel){
       const txt=norm(n.textContent);
       if(txt.includes('check list de camioneta')&&txt.length<950){card=n;break}
       if(txt.includes('check list de extintores')&&txt.length<950){card=n;break}
       n=n.parentElement;
     }
   }
   if(card?.parentElement&&panel.contains(card.parentElement))return card.parentElement;
   const candidates=[...panel.querySelectorAll('[class*="grid"]')];
   return candidates.find(el=>[...el.children].some(child=>/realizar ahora/i.test(child.textContent||'')))||panel;
 }
 function css(){
   if(document.getElementById('stainher-rit-r389-style'))return;
   const style=document.createElement('style');style.id='stainher-rit-r389-style';
   style.textContent=[
     '#page-liderazgo #'+CARD_ID+'{box-sizing:border-box;min-width:0;max-width:100%;border:1px solid var(--line,#b7cddd);border-radius:13px;background:var(--panel2,#f5f9fd);color:var(--text,#17354d);padding:14px;overflow:visible;align-self:start}',
     '#page-liderazgo #'+CARD_ID+' *{box-sizing:border-box}',
     '#page-liderazgo #'+CARD_ID+'.stainher-rit-expanded{grid-column:1/-1;width:100%}',
     '#page-liderazgo #'+CARD_ID+' .r389-head{display:flex;justify-content:space-between;align-items:center;gap:10px}',
     '#page-liderazgo #'+CARD_ID+' .r389-number{display:inline-flex;justify-content:center;align-items:center;min-width:30px;height:30px;border-radius:8px;border:1px solid #91bddf;background:#dceefe;color:#17436a;font-weight:700}',
     '#page-liderazgo #'+CARD_ID+' .r389-available{font-size:11px;border-radius:999px;background:#dcf5e9;color:#176243;padding:5px 9px}',
     '#page-liderazgo #'+CARD_ID+' h4{color:var(--text,#17354d)!important;margin:9px 0 5px;font-weight:700;font-size:15px}',
     '#page-liderazgo #'+CARD_ID+' p{color:var(--text,#17354d)!important;margin:5px 0;font-size:13px;line-height:1.5}',
     '#page-liderazgo #'+CARD_ID+' .r389-frequency{color:var(--muted,#59738b)!important;font-size:12px}',
     '#page-liderazgo #'+CARD_ID+' .r389-actions{display:flex;flex-wrap:wrap;gap:8px;align-items:center;margin-top:12px}',
     '#page-liderazgo #'+CARD_ID+' .r389-actions button{min-height:43px;padding:10px 13px;border:1px solid #0a77b4;border-radius:9px;background:linear-gradient(125deg,#008ca1,#1e70c2);color:#fff;-webkit-text-fill-color:#fff;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation}',
     '#page-liderazgo #'+CARD_ID+' .r389-actions button.r389-history{background:var(--panel,#fff);color:var(--text,#17354d);-webkit-text-fill-color:var(--text,#17354d);border-color:var(--line,#a8bdce)}',
     '#page-liderazgo #'+BODY_ID+'{margin-top:14px;min-width:0;max-width:100%;border-top:1px solid var(--line,#bbcedd);padding-top:12px}',
     '#page-liderazgo #'+BODY_ID+'[hidden]{display:none!important}',
     '#page-liderazgo #'+BODY_ID+' #rit-r331{width:100%;max-width:100%;margin:0 0 24px;padding:12px;overflow:visible}',
     '#page-liderazgo #'+BODY_ID+' #rt-history-list{max-width:100%;overflow-x:auto}',
     '@media(max-width:700px){#page-liderazgo #'+CARD_ID+'{width:100%;grid-column:1/-1;padding:12px}#page-liderazgo #'+CARD_ID+' .r389-actions button{flex:1 1 auto}#page-liderazgo #'+BODY_ID+' #rit-r331{padding:8px}}',
     'html[data-theme="dark"] #page-liderazgo #'+CARD_ID+' .r389-number{background:#173d5b;color:#eaf4ff}',
     'html[data-theme="dark"] #page-liderazgo #'+CARD_ID+' .r389-available{background:#184c3f;color:#d2f5e8}'
   ].join('\n');
   document.head.appendChild(style);
 }
 function createCard(){
   const el=document.createElement('article');
   el.id=CARD_ID;el.className='stainher-rit-control-card';
   el.dataset.r389Control='RIT';
   el.innerHTML=
     '<div class="r389-head"><span class="r389-number">10</span><span class="r389-available">Disponible</span></div>'+
     '<h4>Reunión de Inicio de Turno (RIT)</h4>'+
     '<p>Formulario de seguridad de inicio de turno con seis etapas, riesgos, actividades y firmas.</p>'+
     '<p class="r389-frequency">Frecuencia: Cada inicio de turno</p>'+
     '<div class="r389-actions">'+
       '<button type="button" data-r389-action="toggle" aria-controls="'+BODY_ID+'" aria-expanded="false">Realizar ahora</button>'+
       '<button type="button" class="r389-history" data-r389-action="history">Historial</button>'+
     '</div>'+
     '<div id="'+BODY_ID+'" hidden></div>';
   return el;
 }
 function update(card){
   const slot=card.querySelector('#'+BODY_ID);
   const button=card.querySelector('[data-r389-action="toggle"]');
   card.classList.toggle('stainher-rit-expanded',expanded);
   slot.hidden=!expanded;
   button.setAttribute('aria-expanded',String(expanded));
   button.textContent=expanded?'Ocultar formulario':'Realizar ahora';
 }
 function relocate(card){
   const rit=page()?.querySelector('#rit-r331');
   const slot=card?.querySelector('#'+BODY_ID);
   if(rit&&slot&&rit.parentElement!==slot){
     slot.appendChild(rit); // move, never clone; keeps RIT event handlers and state.
     rit.dataset.r389Integrated='1';
   }
   return !!(slot?.querySelector('#rit-r331'));
 }
 function mount(){
   const root=page(),panel=controlsPanel();
   if(!root||!panel)return false;
   css();
   let card=root.querySelector('#'+CARD_ID);
   if(!card||!panel.contains(card)){
     card?.remove();card=createCard();
     grid(panel).appendChild(card);
   }
   relocate(card);
   update(card);
   return true;
 }
 function schedule(){
   if(queued)return;queued=true;
   setTimeout(()=>{queued=false;mount()},75);
 }
 function open(history=false){
   expanded=true;
   mount();
   // RIT mounts asynchronously on first entry. No infinite polling.
   window.StainherRIT?.mount?.();
   const card=page()?.querySelector('#'+CARD_ID);
   if(card){relocate(card);update(card)}
   if(history){
     const historyButton=card?.querySelector('#rit-r331 [data-act="history"]');
     historyButton?.click();
   }
   [120,550].forEach(delay=>setTimeout(()=>{
     if(!expanded)return;
     const current=page()?.querySelector('#'+CARD_ID);
     if(current){relocate(current);update(current)}
     if(history&&current&&!current.dataset.r389HistoryOpened){
       const b=current.querySelector('#rit-r331 [data-act="history"]');
       if(b){b.click();current.dataset.r389HistoryOpened='1'}
     }
   },delay));
   card?.scrollIntoView?.({behavior:'smooth',block:'start'});
 }
 function wrapRender(){
   const original=window.renderLiderazgoV95;
   if(typeof original!=='function'||original.__stainherR389)return;
   const wrapped=async function(...args){
     const result=await original.apply(this,args);
     schedule();
     setTimeout(mount,250);
     return result;
   };
   wrapped.__stainherR389=true;wrapped.__base=original;
   window.renderLiderazgoV95=wrapped;
 }
 function onClick(event){
   const action=event.target?.closest?.('[data-r389-action]');
   if(action?.closest('#'+CARD_ID)){
     event.preventDefault();
     if(action.dataset.r389Action==='history')open(true);
     else {expanded=!expanded; if(expanded)open(false);else mount()}
     return;
   }
   const button=event.target?.closest?.('button,[role="tab"]');
   if(button&&norm(button.textContent)==='controles stainher'){
     [0,150,450].forEach(ms=>setTimeout(mount,ms));
   }
 }
 function install(){
   css();wrapRender();
   if(!installed){
     installed=true;
     document.addEventListener('click',onClick);
     window.addEventListener('stainher:modules-ready',()=>{wrapRender();schedule();setTimeout(mount,450)});
     window.addEventListener('stainher:navigation',()=>{wrapRender();schedule();setTimeout(mount,300)});
   }
   mount();
 }
 window.StainherRITCardR389=Object.freeze({install,mount,open});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
 [350,1000,2000,3500].forEach(delay=>setTimeout(()=>{wrapRender();mount()},delay));
})();
