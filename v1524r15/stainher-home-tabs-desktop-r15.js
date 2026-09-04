/* Stainher App V15.24 · r15 · selección autoritativa de filtros de Inicio en escritorio y móvil. */
(function installHomeTabsDesktopR15(){
  'use strict';
  if(window.__STAINHER_HOME_TABS_DESKTOP_R15__)return;
  window.__STAINHER_HOME_TABS_DESKTOP_R15__=true;

  const KEYS=new Set(['todas','dotacion','cumpleanos','feriados','recordatorios']);
  const LABELS={
    'todas':'todas','dotacion':'dotacion','dotación':'dotacion',
    'cumpleanos':'cumpleanos','cumpleaños':'cumpleanos',
    'feriados':'feriados','recordatorios':'recordatorios'
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
