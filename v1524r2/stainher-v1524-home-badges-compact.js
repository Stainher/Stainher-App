/* Stainher App V15.24 · Inicio: etiquetas compactas de turno + pestañas autoritativas */
(function installCompactHomeTurnBadges(){
  if(window.__STAINHER_V1524_HOME_BADGES_COMPACT_R2__) return;
  window.__STAINHER_V1524_HOME_BADGES_COMPACT_R2__=true;

  const shortByText={
    'Turno normal A':'A','Turno normal C':'C','Encierro dentro de turno':'ET',
    'Encierro fuera de turno':'EF','Suspendido por encierro':'SE','Día adicional':'DA'
  };
  function mountStyle(){
    if(document.getElementById('stainher-v1524-home-badges-compact-style')) return;
    const s=document.createElement('style');s.id='stainher-v1524-home-badges-compact-style';s.textContent=`
      .v1524-home-person{grid-template-columns:minmax(0,1fr) min-content!important;gap:5px!important}
      .v1524-home-badge{min-width:22px!important;max-width:34px!important;padding:2px 5px!important;font-size:8px!important;line-height:1.15!important;letter-spacing:.2px!important}
      .v1524-home-person>div{min-width:0!important}.v1524-home-person b{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      @media(max-width:520px){.v1524-home-badge{min-width:20px!important;max-width:30px!important;padding:2px 4px!important;font-size:7.5px!important}}`;
    document.head.appendChild(s);
  }
  function compact(root=document){
    root.querySelectorAll?.('.v1524-home-badge').forEach(el=>{
      const visible=String(el.textContent||'').trim(),full=String(el.dataset.fullLabel||visible).trim();
      const short=shortByText[full]||shortByText[visible];if(!short)return;
      if(el.dataset.fullLabel!==full)el.dataset.fullLabel=full;
      if(visible!==short)el.textContent=short;
      if(el.title!==full)el.title=full;
      if(el.getAttribute('aria-label')!==full)el.setAttribute('aria-label',full);
    });
  }
  function wrapHome(){
    const current=window.renderInicio;if(typeof current!=='function'||current.__v1524CompactBadgesR2)return false;
    const wrapped=async function(){const out=await current.apply(this,arguments);compact(document.getElementById('page-inicio')||document);return out};
    wrapped.__v1524CompactBadgesR2=true;wrapped.__base=current;window.renderInicio=wrapped;return true;
  }
  function boot(){
    mountStyle();compact();let tries=0;const timer=setInterval(()=>{tries++;if(wrapHome()||window.renderInicio?.__v1524CompactBadgesR2||tries>30)clearInterval(timer)},120);
    document.addEventListener('click',e=>{if(String(e.target?.closest?.('[data-page]')?.dataset?.page||'')==='inicio')setTimeout(()=>compact(document.getElementById('page-inicio')||document),80)},true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* Controlador final de las pestañas de Alertas y próximos hitos.
 * La base histórica contiene varias redefiniciones del mismo renderizador.
 * Este listener trabaja en fase de captura para que ninguna capa antigua vuelva
 * a bloquear el clic ni fuerce visualmente la pestaña Todas. */
(function installAuthoritativeHomeAlertTabs(){
  if(window.__STAINHER_V1524_HOME_ALERT_TABS_FINAL__)return;
  window.__STAINHER_V1524_HOME_ALERT_TABS_FINAL__=true;
  const KEYS=new Set(['todas','dotacion','cumpleanos','feriados','recordatorios']);
  const labels={todas:'todas',dotacion:'dotacion','dotación':'dotacion',cumpleanos:'cumpleanos','cumpleaños':'cumpleanos',feriados:'feriados',recordatorios:'recordatorios'};
  const selector='#homeImpactAlerts .v152-alert-filterbar button,#homeAlertsV95 .v152-alert-filterbar button';
  function keyOf(button){
    const data=String(button?.dataset?.alertFilter||'').toLowerCase();if(KEYS.has(data))return data;
    return labels[String(button?.textContent||'').trim().toLowerCase()]||null;
  }
  function current(){const value=String(window.v152AlertFilter||'todas').toLowerCase();return KEYS.has(value)?value:'todas'}
  function sync(){
    const active=current();
    document.querySelectorAll(selector).forEach(button=>{
      const key=keyOf(button);if(!key)return;
      button.dataset.alertFilter=key;
      const on=key===active;
      button.classList.toggle('primary',on);
      button.classList.toggle('active',on);
      button.setAttribute('aria-pressed',String(on));
    });
  }
  async function select(key){
    key=String(key||'todas').toLowerCase();if(!KEYS.has(key))key='todas';
    window.v152AlertFilter=key;
    try{v152AlertFilter=key}catch(_){ }
    try{
      const out=typeof window.renderHomeAlertsV95==='function'?window.renderHomeAlertsV95():null;
      if(out&&typeof out.then==='function')await out;
    }catch(error){console.warn('[Inicio tabs]',error)}
    requestAnimationFrame(sync);
    setTimeout(sync,60);
  }
  window.v1524SetHomeAlertFilter=select;
  document.addEventListener('click',event=>{
    const button=event.target?.closest?.(selector);if(!button)return;
    const key=keyOf(button);if(!key)return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    select(key);
  },true);
  function boot(){
    sync();
    const root=document.getElementById('page-inicio')||document.body;
    if(root)new MutationObserver(()=>sync()).observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
