/* Stainher App V15.24 · R390
 * RIT behaves like all other controls: card opens a full dialog with ONLY the
 * existing six-step RIT wizard; history uses the same dialog, no second form.
 * Keep the portal under #page-liderazgo so R331 delegated events still work.
 * No global MutationObserver, no database changes, PDF stays the original R331.
 */
(()=>{
 'use strict';
 if(window.StainherRITModalR390)return;
 const CARD='stainher-rit-card-r389';
 const OVERLAY='stainher-rit-overlay-r390';
 const SLOT='stainher-rit-modal-body-r390';
 const norm=x=>String(x||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
 const page=()=>document.getElementById('page-liderazgo');
 let openNow=false,installed=false,mountQueued=false,returnFocus=null;
 let previousBodyOverflow='',previousHtmlOverflow='';
 function controlsPanel(){
  const root=page();if(!root)return null;
  const named=root.querySelector('#v1512Lead_controles');
  if(named)return named;
  const heading=[...root.querySelectorAll('h2,h3,h4,summary')].find(x=>/^controles stainher$/.test(norm(x.textContent)));
  return heading?.closest('.panel,section,details')||null;
 }
 function cardGrid(panel){
  const button=[...panel.querySelectorAll('button')].find(el=>norm(el.textContent)==='realizar ahora'&&!el.closest('#'+CARD));
  let existing=button?.closest('.control-card-v95,.leadership-card,[class*="control-card"],[class*="leadership-card"],article');
  if(!existing&&button){
   let parent=button.parentElement;
   while(parent&&parent!==panel){
    const text=norm(parent.textContent);
    if(text.includes('check list de camioneta')&&text.length<950){existing=parent;break}
    if(text.includes('check list de extintores')&&text.length<950){existing=parent;break}
    parent=parent.parentElement;
   }
  }
  if(existing?.parentElement&&panel.contains(existing.parentElement))return existing.parentElement;
  return [...panel.querySelectorAll('[class*="grid"]')].find(el=>[...el.children].some(n=>/realizar ahora/i.test(n.textContent||'')))||panel;
 }
 function styles(){
  if(document.getElementById('stainher-rit-r390-style'))return;
  const el=document.createElement('style');
  el.id='stainher-rit-r390-style';
  el.textContent=[
   '#page-liderazgo #'+CARD+'{box-sizing:border-box;min-width:0;max-width:100%;align-self:start;border:1px solid var(--line,#b7cddd);border-radius:13px;background:var(--panel2,#f5f9fd);color:var(--text,#17354d);padding:14px;overflow:visible}',
   '#page-liderazgo #'+CARD+' *{box-sizing:border-box}',
   '#page-liderazgo #'+CARD+' .r390-head{display:flex;justify-content:space-between;align-items:center;gap:10px}',
   '#page-liderazgo #'+CARD+' .r390-number{display:inline-flex;align-items:center;justify-content:center;min-width:30px;height:30px;border:1px solid #91bddf;border-radius:8px;background:#dceefe;color:#17436a;font-weight:700}',
   '#page-liderazgo #'+CARD+' .r390-available{font-size:11px;padding:5px 9px;border-radius:999px;background:#dcf5e9;color:#176243}',
   '#page-liderazgo #'+CARD+' h4{margin:9px 0 5px;font-size:15px;color:var(--text,#17354d)!important}',
   '#page-liderazgo #'+CARD+' p{margin:5px 0;font-size:13px;line-height:1.5;color:var(--text,#17354d)!important}',
   '#page-liderazgo #'+CARD+' .r390-frequency{font-size:12px;color:var(--muted,#59738b)!important}',
   '#page-liderazgo #'+CARD+' .r390-actions{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:12px}',
   '#page-liderazgo #'+CARD+' .r390-actions button{min-height:44px;padding:10px 13px;border:1px solid #0a77b4;border-radius:9px;background:linear-gradient(125deg,#008ca1,#1e70c2);color:#fff!important;-webkit-text-fill-color:#fff!important;font-size:14px;font-weight:700;cursor:pointer;touch-action:manipulation}',
   '#page-liderazgo #'+CARD+' .r390-actions .r390-history{background:var(--panel,#fff);color:var(--text,#17354d)!important;-webkit-text-fill-color:var(--text,#17354d)!important;border-color:var(--line,#a8bdce)}',
   '#page-liderazgo #'+OVERLAY+'{position:fixed!important;inset:0!important;z-index:2147482000!important;display:flex!important;align-items:center;justify-content:center;padding:max(12px,env(safe-area-inset-top,0px)) max(12px,env(safe-area-inset-right,0px)) max(12px,env(safe-area-inset-bottom,0px)) max(12px,env(safe-area-inset-left,0px));background:rgba(6,20,34,.74);box-sizing:border-box}',
   '#page-liderazgo #'+OVERLAY+'[hidden]{display:none!important}',
   '#page-liderazgo #'+OVERLAY+' .r390-dialog{display:flex;flex-direction:column;width:min(960px,100%);max-width:100%;height:min(92dvh,950px);max-height:calc(100dvh - 24px);min-height:0;overflow:hidden;border:1px solid var(--line,#b6cddd);border-radius:16px;background:var(--panel,#f8fbff);color:var(--text,#17354d);box-shadow:0 16px 50px #0005}',
   '#page-liderazgo #'+OVERLAY+' .r390-modal-header{flex:none;display:flex;gap:12px;justify-content:space-between;align-items:center;border-bottom:1px solid var(--line,#c2d2e0);padding:14px 18px;background:var(--panel,#f8fbff)}',
   '#page-liderazgo #'+OVERLAY+' .r390-modal-header h3{margin:0;font-size:clamp(18px,2.5vw,24px);line-height:1.25;color:var(--text,#17354d)!important}',
   '#page-liderazgo #'+OVERLAY+' .r390-modal-header button{flex:none;min-height:43px;padding:8px 15px;border:1px solid var(--line,#a7bfd2);border-radius:9px;background:var(--panel2,#eff6fb);color:var(--text,#17354d)!important;-webkit-text-fill-color:var(--text,#17354d)!important;font-size:15px;cursor:pointer}',
   '#page-liderazgo #'+OVERLAY+' .r390-modal-scroll{flex:1 1 auto;min-height:0;overflow-y:auto;overflow-x:hidden;overscroll-behavior:contain;-webkit-overflow-scrolling:touch;touch-action:pan-y;padding:14px 18px calc(26px + env(safe-area-inset-bottom,0px));scroll-padding-bottom:90px}',
   '#page-liderazgo #'+OVERLAY+' .r390-modal-scroll > #rit-r331{width:100%;max-width:100%;min-width:0;background:transparent!important;border:0!important;box-shadow:none!important;padding:0!important;margin:0!important;overflow:visible}',
   '#page-liderazgo #'+OVERLAY+' #rit-r331 > .rt-bar:first-child{display:none!important}',
   '#page-liderazgo #'+OVERLAY+' .r390-loading{font-size:14px;color:var(--muted,#59738b)}',
   '#page-liderazgo #'+OVERLAY+' #rt-history-list{max-width:100%;overflow-x:auto}',
   '@media(max-width:700px){',
     '#page-liderazgo #'+CARD+'{width:100%;grid-column:auto;padding:12px}',
     '#page-liderazgo #'+CARD+' .r390-actions button{flex:1 1 auto}',
     '#page-liderazgo #'+OVERLAY+'{padding:8px 6px max(8px,env(safe-area-inset-bottom,0px))}',
     '#page-liderazgo #'+OVERLAY+' .r390-dialog{width:100%;height:calc(100dvh - 18px - env(safe-area-inset-bottom,0px));max-height:calc(100dvh - 18px - env(safe-area-inset-bottom,0px));border-radius:15px}',
     '#page-liderazgo #'+OVERLAY+' .r390-modal-header{padding:12px 13px}',
     '#page-liderazgo #'+OVERLAY+' .r390-modal-scroll{padding:12px 13px calc(26px + env(safe-area-inset-bottom,0px))}',
     '#page-liderazgo #'+OVERLAY+' .rit331{margin-bottom:25px!important}',
   '}',
   'html[data-theme="dark"] #page-liderazgo #'+CARD+' .r390-number{background:#173d5b;color:#eaf4ff}',
   'html[data-theme="dark"] #page-liderazgo #'+CARD+' .r390-available{background:#184c3f;color:#d2f5e8}'
  ].join('\n');
  document.head.appendChild(el);
 }
 function makeCard(){
  const article=document.createElement('article');
  article.id=CARD;
  article.className='stainher-rit-control-card';
  article.dataset.r390Control='RIT';
  article.innerHTML='<div class="r390-head"><span class="r390-number">10</span><span class="r390-available">Disponible</span></div>'+
   '<h4>Reunión de Inicio de Turno (RIT)</h4>'+
   '<p>Formulario de seguridad de seis etapas con riesgos y controles del turno.</p>'+
   '<p class="r390-frequency">Frecuencia: Cada inicio de turno</p>'+
   '<div class="r390-actions">'+
     '<button type="button" data-r390-action="open" aria-haspopup="dialog" aria-controls="'+OVERLAY+'">Realizar ahora</button>'+
     '<button type="button" class="r390-history" data-r390-action="history" aria-haspopup="dialog" aria-controls="'+OVERLAY+'">Historial</button>'+
   '</div>';
  return article;
 }
 function makeOverlay(){
  const div=document.createElement('div');
  div.id=OVERLAY;
  div.hidden=true;
  div.setAttribute('aria-hidden','true');
  div.innerHTML='<div class="r390-dialog" role="dialog" aria-modal="true" aria-labelledby="r390-dialog-title">'+
   '<div class="r390-modal-header"><h3 id="r390-dialog-title">Reunión de Inicio de Turno (RIT)</h3>'+
     '<button type="button" data-r390-close="1">Cerrar</button></div>'+
   '<div class="r390-modal-scroll" id="'+SLOT+'"><p class="r390-loading">Cargando formulario RIT…</p></div></div>';
  return div;
 }
 function relocate(){
  const root=page(),overlay=root?.querySelector('#'+OVERLAY),slot=overlay?.querySelector('#'+SLOT);
  const rit=root?.querySelector('#rit-r331');
  if(rit&&slot){
   slot.querySelector('.r390-loading')?.remove();
   if(rit.parentElement!==slot)slot.appendChild(rit); // move, never clone
   rit.dataset.r390Modal='1';
  }
  return !!slot?.querySelector('#rit-r331');
 }
 function mount(){
  const root=page(),panel=controlsPanel();
  if(!root||!panel)return false;
  styles();
  let card=root.querySelector('#'+CARD);
  // R389 card markup is not a modal. Replace it but preserve the existing RIT node.
  if(!card||!panel.contains(card)||!card.querySelector('[data-r390-action="open"]')){
   const old=card;
   card=makeCard();
   if(old&&panel.contains(old)){old.replaceWith(card)}
   else cardGrid(panel).appendChild(card);
  }
  let overlay=root.querySelector('#'+OVERLAY);
  if(!overlay){overlay=makeOverlay();root.appendChild(overlay)}
  relocate();
  overlay.hidden=!openNow;
  overlay.setAttribute('aria-hidden',String(!openNow));
  return true;
 }
 function schedule(){
  if(mountQueued)return;
  mountQueued=true;
  setTimeout(()=>{mountQueued=false;mount()},90);
 }
 function ensureView(history){
  const overlay=page()?.querySelector('#'+OVERLAY);
  const rit=overlay?.querySelector('#rit-r331');
  if(!rit)return false;
  // The original R331 module handles these buttons and keeps history/PDF logic.
  const action=history?'history':rit.querySelector('#rt-history-list')?'new':'';
  const target=action?rit.querySelector('[data-act="'+action+'"]'):null;
  if(target)target.click();
  return true;
 }
 function show(history=false){
  returnFocus=document.activeElement;
  openNow=true;
  mount();
  window.StainherRIT?.mount?.();
  relocate();
  const overlay=page()?.querySelector('#'+OVERLAY);
  if(overlay){
   overlay.hidden=false;
   overlay.setAttribute('aria-hidden','false');
   previousBodyOverflow=document.body.style.overflow;
   previousHtmlOverflow=document.documentElement.style.overflow;
   document.body.style.overflow='hidden';
   document.documentElement.style.overflow='hidden';
   const scroller=overlay.querySelector('#'+SLOT);
   if(scroller)scroller.scrollTop=0;
   overlay.querySelector('[data-r390-close]')?.focus({preventScroll:true});
  }
  if(!ensureView(history)){
   [120,400,900].forEach(delay=>setTimeout(()=>{
    if(!openNow)return;
    relocate();
    ensureView(history);
   },delay));
  }
 }
 function close(){
  openNow=false;
  const overlay=page()?.querySelector('#'+OVERLAY);
  if(overlay){overlay.hidden=true;overlay.setAttribute('aria-hidden','true')}
  document.body.style.overflow=previousBodyOverflow;
  document.documentElement.style.overflow=previousHtmlOverflow;
  returnFocus?.focus?.({preventScroll:true});
  returnFocus=null;
 }
 function wrapRender(){
  const base=window.renderLiderazgoV95;
  if(typeof base!=='function'||base.__stainherR390)return;
  const wrapped=async function(...args){
   const result=await base.apply(this,args);
   schedule();
   setTimeout(mount,320);
   return result;
  };
  wrapped.__stainherR390=true;
  wrapped.__base=base;
  window.renderLiderazgoV95=wrapped;
 }
 function handleClick(e){
  const action=e.target?.closest?.('[data-r390-action]');
  if(action&&action.closest('#'+CARD)){
   e.preventDefault();
   show(action.dataset.r390Action==='history');
   return;
  }
  if(e.target?.closest?.('#'+OVERLAY+' [data-r390-close]')){
   e.preventDefault();
   close();
   return;
  }
  const tab=e.target?.closest?.('button,[role="tab"]');
  if(tab&&norm(tab.textContent)==='controles stainher')schedule();
 }
 function install(){
  styles();wrapRender();
  if(!installed){
   installed=true;
   document.addEventListener('click',handleClick);
   document.addEventListener('keydown',e=>{
    if(openNow&&e.key==='Escape'){e.preventDefault();close()}
   });
   window.addEventListener('stainher:modules-ready',()=>{wrapRender();schedule();setTimeout(mount,450)});
   window.addEventListener('stainher:navigation',()=>{if(openNow)close();wrapRender();schedule();setTimeout(mount,300)});
  }
  mount();
 }
 window.StainherRITModalR390=Object.freeze({install,mount,show,close,relocate});
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
 else install();
 [350,1000,2000,3500].forEach(ms=>setTimeout(()=>{wrapRender();mount()},ms));
})();