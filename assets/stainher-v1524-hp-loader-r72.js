/* Stainher V15.24 · R74 · cargador HP anti-cache.
 * No contiene lógica de login/sesión. Solo renueva los módulos HP cuando
 * el runtime autenticado lo invoca, evitando reutilizar versiones anteriores.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LOADER_R72__)return;
  window.__STAINHER_HP_LOADER_R72__=true;

  const BUILD='20260914-r74-hp-admin-detail';
  const fresh=src=>`${src}${src.includes('?')?'&':'?'}build=${encodeURIComponent(`${BUILD}-${Date.now()}`)}`;
  const load=(id,src)=>new Promise((resolve,reject)=>{
    document.getElementById(id)?.remove();
    const s=document.createElement('script');
    s.id=id;
    s.src=fresh(src);
    s.async=false;
    s.addEventListener('load',()=>resolve(s),{once:true});
    s.addEventListener('error',()=>reject(new Error(`No fue posible cargar ${src}`)),{once:true});
    document.head.appendChild(s);
  });

  async function refresh(){
    try{
      await load('stainher-weekly-hp-runtime-r74','stainher-v1524-weekly-hp-report.js');
      await load('stainher-hp-history-runtime-r74','stainher-v1524-hp-history-r71.js');
      await load('stainher-hp-admin-detail-runtime-r74','stainher-v1524-hp-admin-detail-r74.js');
      await load('stainher-weekly-hp-router-r74','stainher-v1524-hp-router-r57.js');
      window.dispatchEvent(new CustomEvent('stainher:hp-r74-ready'));
    }catch(error){
      console.error('[Stainher HP R74]',error);
    }
  }

  window.StainherHPR72={refresh};
  refresh();
})();