/* Stainher App V15.24 · r15 · selección autoritativa de filtros de Inicio en escritorio y móvil. */
(function installHomeTabsDesktopR15(){
  'use strict';
  if(window.__STAINHER_HOME_TABS_DESKTOP_R15__)return;
  window.__STAINHER_HOME_TABS_DESKTOP_R15__=true;

  const KEYS=new Set(['todas','dotacion','cumpleanos','feriados','recordatorios','vehiculos']);
  const LABELS={
    'todas':'todas','dotacion':'dotacion','dotación':'dotacion',
    'cumpleanos':'cumpleanos','cumpleaños':'cumpleanos',
    'feriados':'feriados','recordatorios':'recordatorios',
    'vehiculos':'vehiculos','vehículos':'vehiculos'
  };
  const BAR_SELECTOR='#homeImpactAlerts .v152-alert-filterbar,#homeAlertsV95 .v152-alert-filterbar';
  const BUTTON_SELECTOR=BAR_SELECTOR.split(',').map(x=>x+' button').join(',');
  let lastActivation={key:null,at:0};

  function normalize(value){
    const k=String(value||'todas').trim().toLowerCase();
    return KEYS.has(k)?k:'todas';
  }
  function keyOf(button){
    const data=String(button?.dataset?.alertFilter||'').trim().toLowerCase();
    if(KEYS.has(data))return data;
    return LABELS[String(button?.textContent||'').replace(/\s+/g,' ').trim().toLowerCase()]||null;
  }
  function patchLegacyRenderer(){
    if(typeof window.v1518RenderAlerts==='function'&&!window.v1518RenderAlerts.__stainherR15){
      const base=window.v1518RenderAlerts;
      const wrapped=function(items){
        const normalized=(Array.isArray(items)?items:[]).map(item=>{
          if(!item||typeof item!=='object')return item;
          const kind=item.kind||item.type||item.tipo||item.category;
          return kind?Object.assign({},item,{kind,type:item.type||kind,category:item.category||kind}):item;
        });
        return base(normalized);
      };
      wrapped.__stainherR15=true;
      wrapped.__base=base;
      window.v1518RenderAlerts=wrapped;
      try{v1518RenderAlerts=wrapped}catch(_){ }
    }
  }
  function mountStyle(){
    if(document.getElementById('stainher-home-tabs-r15-style'))return;
    const style=document.createElement('style');
    style.id='stainher-home-tabs-r15-style';
    style.textContent=`
      ${BAR_SELECTOR}{position:relative!important;z-index:12!important;isolation:isolate!important;pointer-events:auto!important;touch-action:manipulation!important}
      ${BUTTON_SELECTOR}{position:relative!important;z-index:13!important;pointer-events:auto!important;cursor:pointer!important;user-select:none!important;-webkit-user-select:none!important}
    `;
    document.head.appendChild(style);
  }
  function syncButtons(){
    const active=normalize(window.v152AlertFilter||'todas');
    document.querySelectorAll(BUTTON_SELECTOR).forEach(button=>{
      const key=keyOf(button);if(!key)return;
      button.type='button';
      button.dataset.alertFilter=key;
      button.setAttribute('role','tab');
      button.setAttribute('aria-selected',String(key===active));
      button.setAttribute('aria-pressed',String(key===active));
      button.tabIndex=0;
      button.classList.toggle('primary',key===active);
      button.classList.toggle('active',key===active);
      button.style.pointerEvents='auto';
    });
  }
  function patchGlobals(){
    patchLegacyRenderer();
    window.v152SetAlertFilter=activate;
    window.v1524SetHomeAlertFilter=activate;
    try{v152SetAlertFilter=activate}catch(_){ }
  }
  async function activate(value){
    const key=normalize(value);
    const now=performance.now();
    if(lastActivation.key===key&&now-lastActivation.at<120)return;
    lastActivation={key,at:now};
    window.v152AlertFilter=key;
    window.v152ShowAll=false;
    try{v152AlertFilter=key}catch(_){ }
    try{v152ShowAll=false}catch(_){ }
    patchLegacyRenderer();
    syncButtons();
    try{
      const renderer=window.renderHomeAlertsV95;
      if(typeof renderer==='function')await renderer();
    }catch(error){console.warn('[Inicio r15] error al aplicar filtro',error)}
    requestAnimationFrame(syncButtons);
    setTimeout(syncButtons,60);
  }
  function buttonFromEvent(event){return event.target?.closest?.(BUTTON_SELECTOR)||null}
  function intercept(event){
    const button=buttonFromEvent(event);if(!button)return false;
    const key=keyOf(button);if(!key)return false;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    activate(key);
    return true;
  }
  function boot(){
    mountStyle();patchGlobals();syncButtons();
    /* El mouse de escritorio se resuelve en pointerup antes de cualquier onclick heredado. */
    window.addEventListener('pointerup',event=>{
      if(event.pointerType==='mouse'||event.pointerType==='pen'){
        if(event.button!==0)return;
        intercept(event);
      }
    },true);
    /* Touch, teclado y navegadores sin Pointer Events usan click. */
    window.addEventListener('click',event=>{intercept(event)},true);
    window.addEventListener('keydown',event=>{
      if(event.key!=='Enter'&&event.key!==' ')return;
      const button=buttonFromEvent(event);if(!button)return;
      intercept(event);
    },true);
    const root=document.getElementById('page-inicio')||document.body;
    if(root)new MutationObserver(()=>{patchGlobals();syncButtons()}).observe(root,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',()=>{patchGlobals();syncButtons()});
    window.addEventListener('resize',syncButtons,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* r15 · Días adicionales acumulados del mes visible en Turnos y Novedades. */
(function installMonthlyAdditionalDaysR15(){
  'use strict';
  if(window.__STAINHER_MONTHLY_ADDITIONAL_R15__)return;
  window.__STAINHER_MONTHLY_ADDITIONAL_R15__=true;

  const iso=value=>{
    const text=String(value||'').slice(0,10);
    return /^\d{4}-\d{2}-\d{2}$/.test(text)?text:null;
  };
  const nextDay=value=>{
    const d=new Date(value+'T12:00:00');
    d.setDate(d.getDate()+1);
    return d.toISOString().slice(0,10);
  };
  function monthlyAdditional(data){
    const range=data?.range;
    if(!range?.start||!range?.end)return 0;
    const days=new Set();
    for(const event of (data?.events||[])){
      if(String(event?.tipo||'')!=='dia_adicional')continue;
      let start=iso(event.fecha_inicio),end=iso(event.fecha_fin)||start;
      if(!start)continue;
      if(end<range.start||start>range.end)continue;
      if(start<range.start)start=range.start;
      if(end>range.end)end=range.end;
      for(let date=start;date<=end;date=nextDay(date)){
        days.add(`${String(event.user_id||'sin-usuario')}|${date}`);
      }
    }
    return days.size;
  }
  function patchCoverage(){
    const current=window.v1520TurnCoverage;
    if(typeof current!=='function')return false;
    if(current.__stainherMonthlyAdditionalR15)return true;
    const wrapped=function(data,date){
      const result=current.apply(this,arguments)||{};
      const additional=monthlyAdditional(data);
      return Object.assign({},result,{additional,additionalMonthly:additional});
    };
    wrapped.__stainherMonthlyAdditionalR15=true;
    wrapped.__base=current;
    window.v1520TurnCoverage=wrapped;
    try{v1520TurnCoverage=wrapped}catch(_){ }
    return true;
  }
  function syncLabel(){
    document.querySelectorAll('#page-turnos .v1520-kpis .v1520-kpi span').forEach(node=>{
      if(/^Días adicionales(?:\s*·\s*mes)?$/i.test(String(node.textContent||'').trim()))node.textContent='Días adicionales · mes';
    });
  }
  function refreshVisibleTurnPage(){
    const page=document.getElementById('page-turnos');
    if(!page||page.hidden||page.classList.contains('hidden'))return;
    if(typeof window.renderTurnosV15==='function')setTimeout(()=>window.renderTurnosV15(),0);
  }
  function boot(){
    if(patchCoverage())refreshVisibleTurnPage();
    syncLabel();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      patchCoverage();
      syncLabel();
      if(tries>40)clearInterval(timer);
    },125);
    const page=document.getElementById('page-turnos')||document.body;
    if(page)new MutationObserver(()=>{patchCoverage();syncLabel()}).observe(page,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',()=>{patchCoverage();syncLabel();refreshVisibleTurnPage()});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
