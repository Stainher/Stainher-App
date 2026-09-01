window.STAINHER_CONFIG = {
  SUPABASE_URL: 'https://xeqoooouoknpbgyazjkj.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_iNXnSXRWpajeEAEWuRyWLw_PtjPurF0'
};
window.STAINHER_BUILD = 'V15.24-20260831-hotfix6-r2';

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
(function loadStainherV1524(){
  function append(id,src,onload){if(document.getElementById(id)){onload?.();return}const s=document.createElement('script');s.id=id;s.src=src;s.onload=()=>onload?.();s.onerror=()=>console.error('No se pudo cargar',src);document.head.appendChild(s)}
  function bridge(){try{if(!window.state&&typeof state!=='undefined')window.state=state}catch(_){ }try{if(!window.sb&&typeof sb!=='undefined')window.sb=sb}catch(_){ }}
  function load(){
    bridge();
    const modules=[
      ['turnos-v1524-script','turnos-v1524.js?v=20260831-3'],
      ['stainher-v1524-final-script','stainher-v1524-final.js?v=20260831-2'],
      ['stainher-v1524-report-script','stainher-v1524-report.js?v=20260831-2'],
      ['stainher-v1524-hotfix1-script','stainher-v1524-hotfix1.js?v=20260831-1'],
      ['stainher-v1524-hotfix2-script','stainher-v1524-hotfix2.js?v=20260831-1'],
      ['stainher-v1524-hotfix3-script','stainher-v1524-hotfix3.js?v=20260831-1'],
      ['stainher-v1524-report-hotfix4-script','stainher-v1524-report-hotfix4.js?v=20260831-1'],
      ['stainher-v1524-home-badges-compact-script','stainher-v1524-home-badges-compact.js?v=20260831-r2'],
      ['stainher-v1524-contract-money-fit-script','stainher-v1524-contract-money-fit.js?v=20260831-r2'],
      ['stainher-v1524-turn-views-personal-script','stainher-v1524-turn-views-personal-summary.js?v=20260831-r2'],
      ['stainher-v1524-vacation-balance-script','stainher-v1524-vacation-balance.js?v=20260901-2']
    ];
    let i=0;const next=()=>{const item=modules[i++];if(item)append(item[0],item[1],next)};next();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',load,{once:true});else load();
})();
