/* Stainher App V15.24 · Hotfix 3 (pendiente de publicación)
 * - Reduce la glosa a una leyenda compacta en la cabecera de calendario/malla.
 * - Asigna un color distintivo y estable a cada tipo de evento.
 * - Reutiliza exactamente el mismo color en la malla, calendario y detalle de eventos creados.
 */
(function installStainherV1524Hotfix3(){
  if (window.__STAINHER_V1524_HOTFIX3__) return;
  window.__STAINHER_V1524_HOTFIX3__ = true;

  const EVENTS = [
    {code:'ET', label:'Encierro turno',      fg:'#6ee7b7', bg:'rgba(16,185,129,.22)', border:'#34d399'},
    {code:'EF', label:'Encierro libre',      fg:'#fdba74', bg:'rgba(249,115,22,.22)', border:'#fb923c'},
    {code:'SE', label:'Suspendido',          fg:'#fda4af', bg:'rgba(244,63,94,.22)',  border:'#fb7185'},
    {code:'DA', label:'Día adicional',       fg:'#67e8f9', bg:'rgba(6,182,212,.22)',  border:'#22d3ee'},
    {code:'HE', label:'H. extra',            fg:'#fde047', bg:'rgba(234,179,8,.22)',  border:'#facc15'},
    {code:'HF', label:'H. feriado',          fg:'#d8b4fe', bg:'rgba(147,51,234,.22)', border:'#c084fc'},
    {code:'V',  label:'Vacaciones',          fg:'#7dd3fc', bg:'rgba(14,165,233,.22)', border:'#38bdf8'},
    {code:'LM', label:'Licencia',            fg:'#f0abfc', bg:'rgba(192,38,211,.22)', border:'#e879f9'},
    {code:'P',  label:'Permiso',             fg:'#bef264', bg:'rgba(101,163,13,.22)', border:'#a3e635'},
    {code:'F',  label:'Falta',               fg:'#fca5a5', bg:'rgba(220,38,38,.22)',  border:'#ef4444'},
    {code:'CAP',label:'Capacitación',        fg:'#a5b4fc', bg:'rgba(79,70,229,.22)',  border:'#818cf8'},
    {code:'EV', label:'Otra novedad',        fg:'#cbd5e1', bg:'rgba(100,116,139,.22)',border:'#94a3b8'}
  ];
  const EVENT_CODES = EVENTS.map(x=>x.code).sort((a,b)=>b.length-a.length);

  function mountStyle(){
    if (document.getElementById('stainher-v1524-hotfix3-style')) return;
    const s=document.createElement('style');
    s.id='stainher-v1524-hotfix3-style';
    const eventCss=EVENTS.map(x=>`
      .v1512-event-badge.${x.code},.v1524-compact-legend .event-${x.code} i{background:${x.bg}!important;color:${x.fg}!important;border:1px solid ${x.border}!important}
      .v1524-existing-event.event-${x.code}{border-left:3px solid ${x.border}!important}
      .v1524-compact-legend .event-${x.code}{--event-accent:${x.border}}
    `).join('');
    s.textContent=`
      #page-turnos>.v1524-event-glossary,#page-turnos .v1524-turn-hint{display:none!important}
      .v1512-turn-legend.v1524-compact-legend{display:flex!important;align-items:center!important;gap:5px!important;width:100%!important;max-width:100%!important;margin:7px 0 8px!important;padding:6px 7px!important;box-sizing:border-box!important;overflow-x:auto!important;overflow-y:hidden!important;border:1px solid #2c3a48!important;border-radius:9px!important;background:#0d151e!important;white-space:nowrap!important;scrollbar-width:thin}
      .v1524-compact-legend::-webkit-scrollbar{height:5px}.v1524-compact-legend::-webkit-scrollbar-thumb{background:#3b4c5f;border-radius:99px}
      .v1524-compact-legend span{display:inline-flex!important;align-items:center!important;gap:4px!important;flex:0 0 auto!important;padding:0!important;color:#c4d0dc!important;font-size:9px!important;line-height:1.1!important;text-transform:none!important;letter-spacing:0!important}
      .v1524-compact-legend .v1524-legend-label{padding-right:3px!important;color:#8fa3b7!important;font-size:8px!important;font-weight:800!important;text-transform:uppercase!important;letter-spacing:.05em!important}
      .v1524-compact-legend .v1524-legend-separator{width:1px!important;height:19px!important;margin:0 2px!important;background:#314151!important}
      .v1524-compact-legend i{display:inline-flex!important;align-items:center!important;justify-content:center!important;min-width:24px!important;height:20px!important;padding:0 5px!important;border-radius:6px!important;box-sizing:border-box!important;font-style:normal!important;font-size:9px!important;font-weight:900!important;line-height:1!important}
      .v1524-compact-legend .v1512-shift{min-width:20px!important;width:auto!important}
      .v1512-event-badge{border-radius:6px!important;font-weight:900!important;box-sizing:border-box!important}
      .v1524-existing-event{transition:border-color .15s ease,background .15s ease}
      ${eventCss}
      @media(max-width:700px){
        .v1512-turn-legend.v1524-compact-legend{margin:5px 0 7px!important;padding:5px 6px!important;gap:4px!important}
        .v1524-compact-legend span{font-size:8px!important}.v1524-compact-legend i{height:19px!important;min-width:23px!important;font-size:8px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function legendHtml(){
    const base=[['A','Turno A'],['C','Turno C'],['L','Libre']];
    return `<div id="v1524CompactTurnLegend" class="v1512-turn-legend v1524-compact-legend" aria-label="Glosa de turnos y novedades"><span class="v1524-legend-label">Glosa</span>${base.map(([c,l])=>`<span><i class="v1512-shift ${c}">${c}</i>${l}</span>`).join('')}<i class="v1524-legend-separator" aria-hidden="true"></i>${EVENTS.map(x=>`<span class="event-${x.code}" title="${x.label}"><i>${x.code}</i>${x.label}</span>`).join('')}</div>`;
  }

  function installLegendRenderer(){
    window.v1512TurnLegend=function(){ return legendHtml(); };
  }

  function eventCodeFromBadge(badge){
    const txt=String(badge?.textContent||'').trim().toUpperCase();
    return EVENT_CODES.find(code=>txt===code || txt.startsWith(code+' ') || txt.startsWith(code+'·')) || null;
  }

  function normalizeBadges(root=document){
    root.querySelectorAll?.('.v1512-event-badge').forEach(badge=>{
      const code=eventCodeFromBadge(badge);
      if(!code) return;
      EVENT_CODES.forEach(c=>{ if(c!==code) badge.classList.remove(c); });
      badge.classList.add(code);
      const row=badge.closest('.v1524-existing-event');
      if(row){
        EVENT_CODES.forEach(c=>row.classList.remove('event-'+c));
        row.classList.add('event-'+code);
      }
    });
  }

  function replaceLegacyLegend(page){
    let legend=page.querySelector('#v1524CompactTurnLegend');
    if(!legend){
      const legacy=page.querySelector('.v1512-turn-legend');
      const host=document.createElement('div');
      host.innerHTML=legendHtml();
      legend=host.firstElementChild;
      if(legacy) legacy.replaceWith(legend);
      else {
        const firstCell=[...page.querySelectorAll('.v1520-turn-cell,.v1512-turn-cell,.v1512-day-mini')].find(x=>x.offsetParent!==null) || page.querySelector('.v1520-turn-cell,.v1512-turn-cell,.v1512-day-mini');
        const anchor=firstCell?.closest('table,.table-wrap,.v1512-turn-grid,.v1520-turn-grid,.v1512-calendar,.v1520-calendar,.calendar-grid') || firstCell?.parentElement;
        if(anchor) anchor.insertAdjacentElement('beforebegin',legend);
        else (page.querySelector('.v1512-turn-toolbar,.v1520-turn-toolbar,.v1520-kpis')||page.firstElementChild)?.insertAdjacentElement('afterend',legend);
      }
    }
    page.querySelectorAll(':scope > .v1524-event-glossary,.v1524-turn-hint').forEach(x=>x.remove());
    return legend;
  }

  function positionLegend(page,legend){
    if(!legend) return;
    const firstCell=[...page.querySelectorAll('.v1520-turn-cell,.v1512-turn-cell,.v1512-day-mini')].find(x=>x.offsetParent!==null) || page.querySelector('.v1520-turn-cell,.v1512-turn-cell,.v1512-day-mini');
    if(!firstCell) return;
    const anchor=firstCell.closest('table,.table-wrap,.v1512-turn-grid,.v1520-turn-grid,.v1512-calendar,.v1520-calendar,.calendar-grid');
    if(anchor && legend.nextElementSibling!==anchor) anchor.insertAdjacentElement('beforebegin',legend);
  }

  function enhance(){
    const page=document.getElementById('page-turnos');
    if(!page) return;
    const legend=replaceLegacyLegend(page);
    positionLegend(page,legend);
    normalizeBadges(page);
  }

  function patchRenderer(){
    const current=window.renderTurnosV15;
    if(typeof current!=='function' || current.__v1524hotfix3) return;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      installLegendRenderer();
      enhance();
      return out;
    };
    wrapped.__v1524hotfix3=true;
    wrapped.__base=current;
    window.renderTurnosV15=wrapped;
  }

  let observer=null;
  function observe(){
    const page=document.getElementById('page-turnos');
    if(!page || observer) return;
    observer=new MutationObserver(()=>{ enhance(); });
    observer.observe(page,{childList:true,subtree:true});
  }

  let tries=0;
  (function boot(){
    mountStyle();
    installLegendRenderer();
    patchRenderer();
    enhance();
    observe();
    if(typeof window.renderTurnosV15!=='function' && ++tries<150) return setTimeout(boot,100);
    if(document.getElementById('page-turnos')?.classList.contains('active')) window.renderTurnosV15?.();
  })();
})();
