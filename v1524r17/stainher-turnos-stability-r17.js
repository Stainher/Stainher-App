/* Stainher App V15.24 r17 · Estabilidad de Turnos y Novedades.
 * Corrige la espera circular detectada en r16 sin reintroducir MutationObserver.
 */
(function installStainherTurnosStabilityR17(){
  'use strict';
  if(window.__STAINHER_TURNOS_STABILITY_R17__)return;
  window.__STAINHER_TURNOS_STABILITY_R17__=true;
  window.__STAINHER_V1524_HOTFIX3__=true;

  const EVENTS=[
    {code:'ET',label:'Encierro turno',fg:'#6ee7b7',bg:'rgba(16,185,129,.22)',border:'#34d399'},
    {code:'EF',label:'Encierro libre',fg:'#fdba74',bg:'rgba(249,115,22,.22)',border:'#fb923c'},
    {code:'SE',label:'Suspendido',fg:'#fda4af',bg:'rgba(244,63,94,.22)',border:'#fb7185'},
    {code:'DA',label:'Día adicional',fg:'#67e8f9',bg:'rgba(6,182,212,.22)',border:'#22d3ee'},
    {code:'HE',label:'H. extra',fg:'#fde047',bg:'rgba(234,179,8,.22)',border:'#facc15'},
    {code:'HF',label:'H. feriado',fg:'#d8b4fe',bg:'rgba(147,51,234,.22)',border:'#c084fc'},
    {code:'V',label:'Vacaciones',fg:'#7dd3fc',bg:'rgba(14,165,233,.22)',border:'#38bdf8'},
    {code:'LM',label:'Licencia',fg:'#f0abfc',bg:'rgba(192,38,211,.22)',border:'#e879f9'},
    {code:'P',label:'Permiso',fg:'#bef264',bg:'rgba(101,163,13,.22)',border:'#a3e635'},
    {code:'F',label:'Falta',fg:'#fca5a5',bg:'rgba(220,38,38,.22)',border:'#ef4444'},
    {code:'CAP',label:'Capacitación',fg:'#a5b4fc',bg:'rgba(79,70,229,.22)',border:'#818cf8'},
    {code:'EV',label:'Otra novedad',fg:'#cbd5e1',bg:'rgba(100,116,139,.22)',border:'#94a3b8'}
  ];
  const EVENT_CODES=EVENTS.map(x=>x.code).sort((a,b)=>b.length-a.length);
  const dateEventCache=new WeakMap();
  let renderPromise=null;

  function chainHasFlag(fn,flag){
    const seen=new Set();let cur=fn;
    while(typeof cur==='function'&&!seen.has(cur)){
      if(cur[flag])return true;
      seen.add(cur);cur=cur.__base;
    }
    return false;
  }
  function legendHtml(){
    const base=[['A','Turno A'],['C','Turno C'],['L','Libre']];
    return `<div id="v1524CompactTurnLegend" class="v1512-turn-legend v1524-compact-legend" aria-label="Glosa de turnos y novedades"><span class="v1524-legend-label">Glosa</span>${base.map(([c,l])=>`<span><i class="v1512-shift ${c}">${c}</i>${l}</span>`).join('')}<i class="v1524-legend-separator" aria-hidden="true"></i>${EVENTS.map(x=>`<span class="event-${x.code}" title="${x.label}"><i>${x.code}</i>${x.label}</span>`).join('')}</div>`;
  }
  function mountStyle(){
    if(document.getElementById('stainher-turnos-stability-r17-style'))return;
    const s=document.createElement('style');s.id='stainher-turnos-stability-r17-style';
    const eventCss=EVENTS.map(x=>`.v1512-event-badge.${x.code},.v1524-compact-legend .event-${x.code} i{background:${x.bg}!important;color:${x.fg}!important;border:1px solid ${x.border}!important}.v1524-existing-event.event-${x.code}{border-left:3px solid ${x.border}!important}`).join('');
    s.textContent=`#page-turnos>.v1524-event-glossary,#page-turnos .v1524-turn-hint{display:none!important}#page-turnos .v1512-turn-legend.v1524-compact-legend{display:flex!important;align-items:center!important;gap:5px!important;width:100%!important;max-width:100%!important;margin:7px 0 8px!important;padding:6px 7px!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:hidden!important;border:1px solid #2c3a48!important;border-radius:9px!important;background:#0d151e!important;white-space:nowrap!important;scrollbar-width:thin}#page-turnos .v1524-compact-legend span{display:inline-flex!important;align-items:center!important;gap:4px!important;flex:0 0 auto!important;color:#c4d0dc!important;font-size:9px!important;line-height:1.1!important}#page-turnos .v1524-compact-legend .v1524-legend-label{padding-right:3px!important;color:#8fa3b7!important;font-size:8px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:.05em!important}#page-turnos .v1524-compact-legend .v1524-legend-separator{width:1px!important;height:19px!important;margin:0 2px!important;background:#314151!important}#page-turnos .v1524-compact-legend i{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:24px!important;height:20px!important;padding:0 5px!important;border-radius:6px!important;box-sizing:border-box!important;font-style:normal!important;font-size:9px!important;font-weight:900!important;line-height:1!important}#page-turnos .v1524-compact-legend .v1512-shift{min-width:20px!important;width:auto!important}#page-turnos .v1512-event-badge{border-radius:6px!important;font-weight:900!important;box-sizing:border-box!important}${eventCss}`;
    document.head.appendChild(s);
  }
  function installLegendRenderer(){window.v1512TurnLegend=()=>legendHtml()}
  function eventCodeFromBadge(badge){const txt=String(badge?.textContent||'').trim().toUpperCase();return EVENT_CODES.find(code=>txt===code||txt.startsWith(code+' ')||txt.startsWith(code+'·'))||null}
  function normalizeBadges(root){root?.querySelectorAll?.('.v1512-event-badge').forEach(badge=>{const code=eventCodeFromBadge(badge);if(!code)return;EVENT_CODES.forEach(c=>{if(c!==code)badge.classList.remove(c)});badge.classList.add(code);const row=badge.closest('.v1524-existing-event');if(row){EVENT_CODES.forEach(c=>row.classList.remove('event-'+c));row.classList.add('event-'+code)}})}
  function ensureStableLegend(){
    const page=document.getElementById('page-turnos');if(!page)return;
    page.querySelectorAll(':scope > .v1524-event-glossary,.v1524-turn-hint').forEach(x=>x.remove());
    let legend=page.querySelector('#v1524CompactTurnLegend');
    if(!legend){const legacy=page.querySelector('.v1512-turn-legend');if(!legacy)return;const holder=document.createElement('div');holder.innerHTML=legendHtml();legend=holder.firstElementChild;legacy.replaceWith(legend)}
    const content=page.querySelector('#v1520TurnContent'),matrix=content?.querySelector('.v1520-turn-matrix'),table=matrix?.querySelector(':scope > table');
    if(matrix&&table){if(legend.parentElement!==matrix||legend.nextElementSibling!==table)matrix.insertBefore(legend,table)}else if(content&&legend.nextElementSibling!==content)content.insertAdjacentElement('beforebegin',legend);
    normalizeBadges(page);
  }
  function patchEventsOn(){
    const current=window.v1520EventsOn;if(typeof current!=='function'||chainHasFlag(current,'__v17Memoized'))return true;
    const wrapped=function(data,date){if(!data||typeof data!=='object')return current.apply(this,arguments);let map=dateEventCache.get(data);if(!map){map=new Map();dateEventCache.set(data,map)}const key=String(date||'');if(map.has(key))return map.get(key);const out=current.apply(this,arguments)||[];map.set(key,out);return out};
    wrapped.__v17Memoized=true;wrapped.__base=current;window.v1520EventsOn=wrapped;return true;
  }
  function patchRenderer(){
    const current=window.renderTurnosV15;if(typeof current!=='function')return false;
    if(chainHasFlag(current,'__v17TurnStable'))return true;
    const wrapped=function(){
      if(renderPromise)return renderPromise;
      const self=this,args=arguments;
      renderPromise=Promise.resolve().then(()=>current.apply(self,args)).then(out=>{installLegendRenderer();ensureStableLegend();return out}).catch(error=>{console.error('[Turnos r17]',error);const page=document.getElementById('page-turnos');if(page&&/Cargando/i.test(page.textContent||''))page.innerHTML=`<div class="notice error">No fue posible completar la vista de Turnos y Novedades. ${String(error?.message||error||'')}</div>`;throw error}).finally(()=>{renderPromise=null});
      return renderPromise;
    };
    wrapped.__v17TurnStable=true;wrapped.__base=current;window.renderTurnosV15=wrapped;return true;
  }
  function boot(){
    mountStyle();installLegendRenderer();patchEventsOn();patchRenderer();
    let tries=0;const timer=setInterval(()=>{tries++;patchEventsOn();if(chainHasFlag(window.renderTurnosV15,'__v17TurnStable')){clearInterval(timer);ensureStableLegend();return}if(patchRenderer()){clearInterval(timer);ensureStableLegend();return}if(tries>40)clearInterval(timer)},125);
    document.addEventListener('click',event=>{if(event.target?.closest?.('[data-page="turnos"]'))requestAnimationFrame(()=>requestAnimationFrame(ensureStableLegend))},true);
    window.addEventListener('stainher:modules-ready',()=>{patchEventsOn();if(!chainHasFlag(window.renderTurnosV15,'__v17TurnStable'))patchRenderer();ensureStableLegend()},{once:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
