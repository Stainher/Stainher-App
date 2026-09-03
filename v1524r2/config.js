window.STAINHER_CONFIG = {
  SUPABASE_URL: 'https://xeqoooouoknpbgyazjkj.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_iNXnSXRWpajeEAEWuRyWLw_PtjPurF0'
};
window.STAINHER_BUILD = 'V15.24-20260903-disclosure-controls-r13';

/* Stainher App V15.24 · arranque visual estable en Inicio.
 * Este bloque se ejecuta desde config.js antes del primer renderizado visible.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_INITIAL_ROUTE_GUARD__)return;
  window.__STAINHER_INITIAL_ROUTE_GUARD__=true;

  const style=document.createElement('style');
  style.id='stainher-initial-route-guard-style';
  style.textContent=`
    @media(max-width:900px){
      html:not([data-stainher-initial-route-ready="1"]) #appView .page,
      html:not([data-stainher-initial-route-ready="1"]) #v151MobileTitle,
      html:not([data-stainher-initial-route-ready="1"]) .v151-mobile-title small{
        visibility:hidden!important
      }
    }
  `;
  document.head.appendChild(style);

  let observer,completed=false;
  function activateInicio(){
    if(completed)return true;
    if(!window.matchMedia?.('(max-width:900px)').matches){
      completed=true;
      observer?.disconnect();
      document.documentElement.dataset.stainherInitialRouteReady='1';
      return true;
    }
    const page=document.getElementById('page-inicio');
    const title=document.getElementById('v151MobileTitle');
    if(!page||!title)return false;

    /* Detener antes de modificar el DOM: cambiar el título también genera una
     * mutación y Safari podía encadenar el observador indefinidamente. */
    completed=true;
    observer?.disconnect();

    document.querySelectorAll('.page[id^="page-"]').forEach(node=>{
      const selected=node===page;
      node.classList.toggle('hidden',!selected);
      node.hidden=!selected;
      node.setAttribute('aria-hidden',String(!selected));
    });
    document.querySelectorAll('.nav button[data-page]').forEach(button=>{
      button.classList.toggle('active',button.dataset.page==='inicio');
    });
    document.querySelectorAll('#v151MobileBottom button[data-v151-page]').forEach(button=>{
      const selected=button.dataset.v151Page==='inicio';
      button.classList.toggle('active',selected);
      button.setAttribute('aria-current',selected?'page':'false');
    });
    if(title.textContent!=='⌂ Inicio')title.textContent='⌂ Inicio';
    const version=title.closest('.v151-mobile-title')?.querySelector('small');
    if(version)version.textContent='Stainher App · V15.24';

    requestAnimationFrame(()=>{
      document.documentElement.dataset.stainherInitialRouteReady='1';
    });
    return true;
  }

  observer=new MutationObserver(activateInicio);
  observer.observe(document.documentElement,{childList:true,subtree:true});
  if(!activateInicio())document.addEventListener('DOMContentLoaded',activateInicio,{once:true});
  setTimeout(()=>{
    completed=true;
    document.documentElement.dataset.stainherInitialRouteReady='1';
    observer?.disconnect();
  },2500);
})();


/* Controles date/month estables en iOS. La envolvente visual evita el ancho
 * intrínseco de Safari sin perder el selector nativo táctil. */
(function installStainherIOSNativeControlShell(){
  const STYLE_ID='stainher-ios-native-control-shell-style';
  const TARGETS=[['corrFromV1519','date'],['corrToV1519','date'],['v1523PrevEdpMonth','month']];
  const CSS=`
    #homeAlertsV95 .v152-alert-filterbar,#homeImpactAlerts .v152-alert-filterbar{
      display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;
      width:100%!important;max-width:100%!important;gap:8px!important;overflow:visible!important
    }
    #homeAlertsV95 .v152-alert-filterbar .btn,#homeImpactAlerts .v152-alert-filterbar .btn{
      width:100%!important;min-width:0!important;text-align:center!important;justify-content:center!important
    }
    @media(max-width:600px){
      #homeAlertsV95 .v152-alert-filterbar,#homeImpactAlerts .v152-alert-filterbar{
        grid-template-columns:repeat(2,minmax(0,1fr))!important
      }
      #homeAlertsV95 .v152-alert-filterbar .btn:last-child,#homeImpactAlerts .v152-alert-filterbar .btn:last-child{
        grid-column:1/-1!important
      }
    }
    @media(max-width:900px){
    #page-correctivo,#page-preventivo{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow-x:hidden!important}
    #page-correctivo .v1519-filter-grid,#page-preventivo .v1523-prev-period-toolbar{width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
    .stainher-native-control-shell{position:relative!important;display:flex!important;align-items:center!important;width:100%!important;inline-size:100%!important;max-width:100%!important;min-width:0!important;min-height:44px!important;margin:0!important;padding:10px 42px 10px 11px!important;box-sizing:border-box!important;overflow:hidden!important;border:1px solid var(--line)!important;border-radius:9px!important;background:#0c1117!important;color:#fff!important;font:inherit!important;text-transform:none!important;letter-spacing:normal!important}
    #page-preventivo .stainher-native-control-shell--month{padding-left:29px!important;padding-inline-start:29px!important}
    .stainher-native-control-shell:after{content:'▣';position:absolute;right:12px;top:50%;transform:translateY(-50%);color:#9fc7ee;font-size:13px;line-height:1;pointer-events:none}.stainher-native-control-shell--month:after{content:'▾';font-size:15px}
    .stainher-native-control-shell__value{display:block!important;width:100%!important;min-width:0!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important;color:#fff!important;font-size:16px!important;line-height:1.25!important;font-weight:400!important;pointer-events:none!important}.stainher-native-control-shell--month .stainher-native-control-shell__value{font-weight:700!important;text-align:left!important}
    .stainher-native-control-shell:focus-within{outline:2px solid rgba(159,199,238,.55)!important;outline-offset:1px!important}
    .stainher-native-control-shell>input.stainher-native-control{position:absolute!important;inset:0!important;z-index:2!important;display:block!important;width:100%!important;height:100%!important;min-width:0!important;max-width:none!important;margin:0!important;padding:0!important;border:0!important;border-radius:9px!important;opacity:.001!important;background:transparent!important;color:transparent!important;cursor:pointer!important;-webkit-appearance:none!important;appearance:none!important;box-sizing:border-box!important}
    .stainher-native-control-shell>input.stainher-native-control::-webkit-date-and-time-value,.stainher-native-control-shell>input.stainher-native-control::-webkit-datetime-edit,.stainher-native-control-shell>input.stainher-native-control::-webkit-calendar-picker-indicator{opacity:0!important}
  }`;
  function style(){let s=document.getElementById(STYLE_ID);if(!s){s=document.createElement('style');s.id=STYLE_ID;document.head.appendChild(s)}s.textContent=CSS}
  function fmtDate(v){const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:(v||'Seleccionar fecha')}
  function fmtMonth(v){const m=String(v||'').match(/^(\d{4})-(\d{2})$/);if(!m)return v||'Seleccionar mes';return new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(Number(m[1]),Number(m[2])-1,1))}
  function skin(input,kind){if(!input||input.dataset.stainherNativeShell==='1')return;const parent=input.parentNode;if(!parent)return;const shell=document.createElement('span');shell.className=`stainher-native-control-shell stainher-native-control-shell--${kind}`;const value=document.createElement('span');value.className='stainher-native-control-shell__value';value.setAttribute('aria-hidden','true');const sync=()=>value.textContent=kind==='month'?fmtMonth(input.value):fmtDate(input.value);input.dataset.stainherNativeShell='1';input.classList.add('stainher-native-control');parent.insertBefore(shell,input);shell.append(value,input);sync();input.addEventListener('input',sync);input.addEventListener('change',sync)}
  function apply(){if(!window.matchMedia?.('(max-width:900px)').matches)return;TARGETS.forEach(([id,k])=>skin(document.getElementById(id),k))}
  function boot(){style();apply();const root=document.getElementById('appView')||document.body;new MutationObserver(apply).observe(root,{childList:true,subtree:true});window.addEventListener('resize',apply,{passive:true});window.addEventListener('orientationchange',()=>setTimeout(apply,60),{passive:true})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();

/* Carga autoritativa V15.24 después de que index.html termine de definir las
 * capas históricas. El módulo final espera a que Turnos V15.24 esté listo. */
(function installStainherCoreLoader(){
  const MODULES=Object.freeze([
    {id:'turnos-v1524-script',src:'turnos-v1524.js?v=20260831-3',domain:'turnos'},
    {id:'stainher-v1524-final-script',src:'stainher-v1524-final.js?v=20260903-r6',domain:'core'},
    {id:'stainher-v1524-report-script',src:'stainher-v1524-report.js?v=20260831-2',domain:'informes'},
    {id:'stainher-v1524-hotfix1-script',src:'stainher-v1524-hotfix1.js?v=20260831-1',domain:'turnos'},
    {id:'stainher-v1524-hotfix2-script',src:'stainher-v1524-hotfix2.js?v=20260831-1',domain:'turnos'},
    {id:'stainher-v1524-hotfix3-script',src:'stainher-v1524-hotfix3.js?v=20260831-1',domain:'turnos'},
    {id:'stainher-v1524-report-hotfix4-script',src:'stainher-v1524-report-hotfix4.js?v=20260831-1',domain:'informes'},
    {id:'stainher-v1524-home-badges-compact-script',src:'stainher-v1524-home-badges-compact.js?v=20260831-r2',domain:'inicio'},
    {id:'stainher-v1524-contract-money-fit-script',src:'stainher-v1524-contract-money-fit.js?v=20260831-r2',domain:'contrato'},
      {id:'stainher-v1524-turn-views-personal-script',src:'stainher-v1524-turn-views-personal-summary.js?v=20260831-r2',domain:'turnos'},
      {id:'stainher-v1524-vacation-balance-script',src:'stainher-v1524-vacation-balance.js?v=20260902-7',domain:'vacaciones'},
      {id:'stainher-v1524-ux-runtime-script',src:'stainher-v1524-ux-runtime.js?v=20260903-r9',domain:'experiencia'},
      {id:'stainher-v1524-reliability-actions-script',src:'stainher-v1524-reliability-actions.js?v=20260902-6',domain:'confiabilidad'},
      {id:'stainher-v1524-admin-crud-script',src:'stainher-v1524-admin-crud.js?v=20260902-1',domain:'administracion'},
      {id:'stainher-v1524-theme-script',src:'stainher-v1524-theme.js?v=20260903-r13',domain:'tema'},
      {id:'stainher-v1524-runtime-audit-script',src:'stainher-v1524-runtime-audit.js?v=20260902-1',domain:'diagnostico'}
  ]);
  const status={state:'idle',loaded:[],failed:null,startedAt:null,finishedAt:null};
  window.STAINHER_MODULES=MODULES;window.STAINHER_LOADER_STATUS=status;
  function bridgeGlobals(){
    try{if(!window.state&&typeof state!=='undefined')window.state=state}catch(_){ }
    try{if(!window.sb&&typeof sb!=='undefined')window.sb=sb}catch(_){ }
  }
  function loadScript(module){
    const existing=document.getElementById(module.id);
    if(existing)return Promise.resolve(module);
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');script.id=module.id;script.src=module.src;script.async=false;
      script.addEventListener('load',()=>resolve(module),{once:true});
      script.addEventListener('error',()=>reject(new Error(`No se pudo cargar ${module.domain}: ${module.src}`)),{once:true});
      document.head.appendChild(script);
    });
  }
  function warmConnections(){
    if(!document.querySelector('link[data-stainher-preconnect]')){const link=document.createElement('link');link.rel='preconnect';link.href=window.STAINHER_CONFIG?.SUPABASE_URL||'https://xeqoooouoknpbgyazjkj.supabase.co';link.crossOrigin='anonymous';link.dataset.stainherPreconnect='1';document.head.appendChild(link)}
    for(const module of MODULES){if(document.querySelector(`link[data-stainher-preload="${module.id}"]`))continue;const link=document.createElement('link');link.rel='preload';link.as='script';link.href=module.src;link.dataset.stainherPreload=module.id;document.head.appendChild(link)}
  }
  async function start(){
    if(status.state==='loading'||status.state==='ready')return;
    status.state='loading';status.startedAt=new Date().toISOString();bridgeGlobals();warmConnections();
    try{
      for(const module of MODULES){await loadScript(module);status.loaded.push(module.id)}
      status.state='ready';status.finishedAt=new Date().toISOString();
      window.dispatchEvent(new CustomEvent('stainher:modules-ready',{detail:{loaded:[...status.loaded]}}));
    }catch(error){
      status.state='error';status.failed=String(error?.message||error);status.finishedAt=new Date().toISOString();
      console.error('[Stainher Loader]',error);window.dispatchEvent(new CustomEvent('stainher:modules-error',{detail:{error:status.failed}}));
    }
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
})();
