/* Stainher App V15.24 · Inicio consolidado
 * Este módulo conserva responsabilidades de arranque visual:
 * 1) etiquetas compactas de turno en Inicio;
 * 2) acceso directo Registrar avería exclusivo para Supervisor;
 * 3) puente temprano R146 para que Estandarización esté disponible desde el primer menú.
 *
 * Las pestañas de Alertas y el alcance de Dotación se eliminaron de este archivo
 * para evitar dobles controladores. Sus únicas implementaciones autoritativas son
 * stainher-home-tabs-r9.js y stainher-dotacion-scope-r10.js.
 */
(function installCompactHomeTurnBadges(){
  if(window.__STAINHER_V1524_HOME_BADGES_COMPACT_R2__) return;
  window.__STAINHER_V1524_HOME_BADGES_COMPACT_R2__=true;

  const shortByText={
    'Turno normal A':'A','Turno normal C':'C','Encierro dentro de turno':'ET',
    'Encierro fuera de turno':'EF','Suspendido por encierro':'SE','Día adicional':'DA'
  };
  function mountStyle(){
    if(document.getElementById('stainher-v1524-home-badges-compact-style')) return;
    const s=document.createElement('style');
    s.id='stainher-v1524-home-badges-compact-style';
    s.textContent=`
      .v1524-home-person{grid-template-columns:minmax(0,1fr) min-content!important;gap:5px!important}
      .v1524-home-badge{min-width:22px!important;max-width:34px!important;padding:2px 5px!important;font-size:8px!important;line-height:1.15!important;letter-spacing:.2px!important}
      .v1524-home-person>div{min-width:0!important}.v1524-home-person b{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      @media(max-width:520px){.v1524-home-badge{min-width:20px!important;max-width:30px!important;padding:2px 4px!important;font-size:7.5px!important}}
    `;
    document.head.appendChild(s);
  }
  function compact(root=document){
    root.querySelectorAll?.('.v1524-home-badge').forEach(el=>{
      const visible=String(el.textContent||'').trim();
      const full=String(el.dataset.fullLabel||visible).trim();
      const short=shortByText[full]||shortByText[visible];
      if(!short)return;
      el.dataset.fullLabel=full;
      if(visible!==short)el.textContent=short;
      if(el.title!==full)el.title=full;
      if(el.getAttribute('aria-label')!==full)el.setAttribute('aria-label',full);
    });
  }
  function wrapHome(){
    const current=window.renderInicio;
    if(typeof current!=='function'||current.__v1524CompactBadgesR2)return false;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      compact(document.getElementById('page-inicio')||document);
      return out;
    };
    wrapped.__v1524CompactBadgesR2=true;
    wrapped.__base=current;
    window.renderInicio=wrapped;
    return true;
  }
  function boot(){
    mountStyle();compact();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(wrapHome()||window.renderInicio?.__v1524CompactBadgesR2||tries>30)clearInterval(timer);
    },120);
    document.addEventListener('click',e=>{
      if(String(e.target?.closest?.('[data-page]')?.dataset?.page||'')==='inicio'){
        setTimeout(()=>compact(document.getElementById('page-inicio')||document),80);
      }
    },true);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

/* Menú operativo exclusivo del Supervisor: acceso directo al formulario de avería. */
(function installSupervisorAveriaMenu(){
  if(window.__STAINHER_V1524_SUPERVISOR_AVERIA_MENU__)return;
  window.__STAINHER_V1524_SUPERVISOR_AVERIA_MENU__=true;
  const ID='v1524SupervisorAveriaNav';
  function role(){
    try{return String(window.v11Role?.()||window.state?.profile?.rol||'').trim().toLowerCase()}catch(_){return ''}
  }
  function remove(){document.getElementById(ID)?.remove()}
  function mount(){
    const nav=document.querySelector('.sidebar .nav');
    if(!nav)return false;
    if(role()!=='supervisor'){remove();return true}
    if(document.getElementById(ID))return true;
    const button=document.createElement('button');
    button.id=ID;
    button.type='button';
    button.dataset.supervisorAction='registrar-averia';
    button.innerHTML='⚠ Registrar avería';
    button.title='Registrar una avería desde terreno';
    button.setAttribute('aria-label','Registrar avería');
    button.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      if(typeof event.stopImmediatePropagation==='function')event.stopImmediatePropagation();
      if(role()!=='supervisor')return remove();
      if(typeof window.v15OpenCorrectiveMobile==='function')return window.v15OpenCorrectiveMobile();
      window.toast?.('El formulario de averías todavía no está disponible.','error');
    },true);
    const corr=nav.querySelector('button[data-page="correctivo"]');
    if(corr)corr.insertAdjacentElement('afterend',button);
    else nav.prepend(button);
    return true;
  }
  function boot(){
    mount();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;mount();
      if((role()&&document.querySelector('.sidebar .nav'))||tries>80)clearInterval(timer);
    },125);
    const root=document.querySelector('.sidebar')||document.body;
    if(root)new MutationObserver(mount).observe(root,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',()=>setTimeout(mount,0));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();

/* R146 · Estandarización visible desde el primer render del menú.
 * El cargador autenticado R142 incorpora este módulo al final de una cadena larga.
 * Este puente crea el acceso apenas existen perfil y navegación, y adelanta en
 * segundo plano R142/R141. No consulta datos ni altera permisos persistidos.
 */
(function installStandardizationImmediateNavR146(){
  'use strict';
  const BUILD='20261002-r146-standardization-immediate-nav';
  if(window.__STAINHER_STANDARDIZATION_IMMEDIATE_NAV_R146__===BUILD)return;
  window.__STAINHER_STANDARDIZATION_IMMEDIATE_NAV_R146__=BUILD;

  const ALLOWED=new Set(['administrador','gerente','planificador','confiabilidad','prevencion','supervisor']);
  const SELECTOR='button[data-page="estandarizacion"]';
  let preloadPromise=null;

  function role(){
    try{return String(window.v11Role?.()||window.state?.profile?.rol||'').trim().toLowerCase()}catch(_){return ''}
  }

  function loadScript(id,src,ready){
    if(ready())return Promise.resolve();
    const current=document.getElementById(id);
    if(current)current.remove();
    return new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.id=id;
      script.async=false;
      script.src=`${src}?build=${encodeURIComponent(BUILD)}`;
      script.addEventListener('load',resolve,{once:true});
      script.addEventListener('error',()=>reject(new Error(`No fue posible cargar ${src}`)),{once:true});
      document.head.appendChild(script);
    });
  }

  async function preload(){
    if(window.StainherStandardizationR141&&window.StainherStandardizationAccessR142){
      window.StainherStandardizationAccessR142.install?.();
      window.StainherStandardizationR141.install?.();
      window.StainherStandardizationAccessR142.refreshPermissions?.();
      return;
    }
    if(preloadPromise)return preloadPromise;
    preloadPromise=(async()=>{
      await loadScript(
        'stainher-standardization-access-early-r146',
        'stainher-v1524-standardization-access-r142.js',
        ()=>!!window.StainherStandardizationAccessR142
      );
      window.StainherStandardizationAccessR142?.install?.();

      await loadScript(
        'stainher-standardization-early-r146',
        'stainher-v1524-standardization-r141.js',
        ()=>!!window.StainherStandardizationR141
      );
      window.StainherStandardizationR141?.install?.();
      window.StainherStandardizationAccessR142?.refreshPermissions?.();
      window.dispatchEvent(new CustomEvent('stainher:standardization-r141-ready'));
      window.dispatchEvent(new CustomEvent('stainher:standardization-access-r142-ready'));
    })().catch(error=>{
      preloadPromise=null;
      console.error('[Stainher Estandarización R146]',error);
      throw error;
    });
    return preloadPromise;
  }

  async function openStandardization(event){
    event?.preventDefault?.();
    event?.stopPropagation?.();
    try{
      await preload();
      if(window.StainherStandardizationR141?.canView?.()===false)return;
      window.StainherStandardizationR141?.install?.();
      document.querySelectorAll('.nav button').forEach(node=>node.classList.remove('active'));
      const button=document.querySelector(SELECTOR);
      button?.classList.add('active');
      document.querySelectorAll('.page').forEach(node=>node.classList.add('hidden'));
      const page=document.getElementById('page-estandarizacion');
      page?.classList.remove('hidden');
      await window.renderEstandarizacion?.();
    }catch(error){
      window.toast?.('No fue posible abrir Estandarización. Intenta nuevamente.','error');
    }
  }

  function mount(){
    const nav=document.querySelector('.sidebar .nav')||document.querySelector('.nav');
    const currentRole=role();
    if(!nav||!currentRole)return false;

    let button=nav.querySelector(SELECTOR);
    if(!ALLOWED.has(currentRole)){
      if(button?.dataset?.stainherR146Early==='1')button.remove();
      return true;
    }

    if(!button){
      button=document.createElement('button');
      button.type='button';
      button.dataset.page='estandarizacion';
      button.dataset.stainherR146Early='1';
      button.className='v15-nav stainher-standardization-nav';
      button.innerHTML='◇ Estandarización';
      button.title='Estandarización';
      button.setAttribute('aria-label','Estandarización');
      button.addEventListener('click',openStandardization,true);
      const equipment=nav.querySelector('button[data-page="equipos"]');
      if(equipment?.nextSibling)nav.insertBefore(button,equipment.nextSibling);
      else if(equipment)equipment.insertAdjacentElement('afterend',button);
      else nav.appendChild(button);
    }else{
      button.classList.remove('hidden');
    }

    if(!window.StainherStandardizationR141||!window.StainherStandardizationAccessR142){
      preload().catch(()=>{});
    }
    return true;
  }

  function boot(){
    mount();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const ready=mount();
      if((ready&&role())||tries>=100)clearInterval(timer);
    },50);
    const root=document.querySelector('.sidebar')||document.body;
    if(root)new MutationObserver(()=>mount()).observe(root,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',()=>setTimeout(mount,0));
  }

  window.StainherStandardizationImmediateNavR146=Object.freeze({mount,preload,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
