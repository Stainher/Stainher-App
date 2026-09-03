/* Stainher App V15.24 · r9 · pestañas autoritativas de Inicio */
(function installHomeTabsR9(){
  if(window.__STAINHER_HOME_TABS_R9__)return;
  window.__STAINHER_HOME_TABS_R9__=true;

  const KEYS=new Set(['todas','dotacion','cumpleanos','feriados','recordatorios']);
  const LABELS={todas:'todas',dotacion:'dotacion','dotación':'dotacion',cumpleanos:'cumpleanos','cumpleaños':'cumpleanos',feriados:'feriados',recordatorios:'recordatorios'};
  const SELECTOR='#homeImpactAlerts .v152-alert-filterbar button,#homeAlertsV95 .v152-alert-filterbar button';

  function normKey(value){
    const key=String(value||'todas').trim().toLowerCase();
    return KEYS.has(key)?key:'todas';
  }
  function keyOf(button){
    const fromData=normKey(button?.dataset?.alertFilter||'');
    if(button?.dataset?.alertFilter&&KEYS.has(fromData))return fromData;
    return LABELS[String(button?.textContent||'').trim().toLowerCase()]||null;
  }
  function sync(){
    const active=normKey(window.v152AlertFilter||'todas');
    document.querySelectorAll(SELECTOR).forEach(button=>{
      const key=keyOf(button);if(!key)return;
      button.dataset.alertFilter=key;
      const on=key===active;
      button.classList.toggle('primary',on);
      button.classList.toggle('active',on);
      button.setAttribute('aria-pressed',String(on));
    });
  }

  function patchLegacyRenderer(){
    if(typeof window.v1518RenderAlerts==='function'&&!window.v1518RenderAlerts.__stainherR9){
      const base=window.v1518RenderAlerts;
      const wrapped=function(items){
        const normalized=(Array.isArray(items)?items:[]).map(item=>{
          if(!item||typeof item!=='object')return item;
          const kind=item.kind||item.type||item.tipo||item.category;
          return kind?Object.assign({},item,{kind,type:item.type||kind,category:item.category||kind}):item;
        });
        return base(normalized);
      };
      wrapped.__stainherR9=true;
      wrapped.__base=base;
      window.v1518RenderAlerts=wrapped;
      try{v1518RenderAlerts=wrapped}catch(_){ }
    }
  }

  async function selectFilter(value){
    const key=normKey(value);
    window.v152AlertFilter=key;
    window.v152ShowAll=false;
    try{v152AlertFilter=key}catch(_){ }
    try{v152ShowAll=false}catch(_){ }
    patchLegacyRenderer();
    try{
      const fn=window.renderHomeAlertsV95;
      if(typeof fn==='function'){
        const out=fn();
        if(out&&typeof out.then==='function')await out;
      }
    }catch(error){console.warn('[Inicio r9] no se pudo renderizar el filtro',error)}
    requestAnimationFrame(sync);
    setTimeout(sync,40);
  }

  function bindGlobal(){
    window.v152SetAlertFilter=selectFilter;
    window.v1524SetHomeAlertFilter=selectFilter;
    try{v152SetAlertFilter=selectFilter}catch(_){ }
    patchLegacyRenderer();
    sync();
  }

  document.addEventListener('click',event=>{
    const button=event.target?.closest?.(SELECTOR);if(!button)return;
    const key=keyOf(button);if(!key)return;
    event.preventDefault();
    event.stopPropagation();
    if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
    selectFilter(key);
  },true);

  function boot(){
    bindGlobal();
    const root=document.getElementById('page-inicio')||document.body;
    if(root)new MutationObserver(()=>{bindGlobal();sync()}).observe(root,{childList:true,subtree:true});
    let tries=0;const timer=setInterval(()=>{
      tries++;bindGlobal();
      if((window.STAINHER_LOADER_STATUS?.state==='ready'&&document.querySelector(SELECTOR))||tries>80)clearInterval(timer);
    },125);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('stainher:modules-ready',()=>setTimeout(bindGlobal,0));
})();
