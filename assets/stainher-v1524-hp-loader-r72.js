/* Stainher V15.24 · R85 · puente anti-cache HP + Presupuestos.
 * Mantiene el cargador HP estable R78 y carga Presupuestos R80, el fix de
 * pie PDF R84, la cuadrícula R85 y su integración contractual R82.
 * No contiene lógica de login/sesión ni modifica cálculos HP.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LOADER_VERSION__==='R85')return;
  window.__STAINHER_HP_LOADER_R72__=true;
  window.__STAINHER_HP_LOADER_VERSION__='R85';

  const BUILD='20260916-r85-presupuestos-grid';
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

  async function refreshBudgets(){
    try{
      await load('stainher-presupuestos-runtime-r85','stainher-presupuestos-r80.js');
      await load('stainher-presupuestos-pdf-footer-runtime-r85','stainher-presupuestos-pdf-footer-r84.js');
      await load('stainher-presupuestos-grid-runtime-r85','stainher-presupuestos-grid-r85.js');
      await load('stainher-presupuestos-router-runtime-r85','stainher-presupuestos-router-r82.js');
      window.dispatchEvent(new CustomEvent('stainher:presupuestos-r85-ready'));
    }catch(error){
      console.error('[Stainher Presupuestos R85]',error);
    }
  }

  async function refresh(){
    try{
      await load('stainher-weekly-hp-runtime-r78','stainher-v1524-weekly-hp-report.js');
      await load('stainher-hp-history-runtime-r78','stainher-v1524-hp-history-r71.js');
      await load('stainher-hp-admin-detail-runtime-r78','stainher-v1524-hp-admin-detail-r74.js');
      await load('stainher-hp-layout-runtime-r78','stainher-v1524-hp-layout-r78.js');
      await load('stainher-weekly-hp-router-r78','stainher-v1524-hp-router-r57.js');
      window.dispatchEvent(new CustomEvent('stainher:hp-r78-ready'));
    }catch(error){
      console.error('[Stainher HP R78]',error);
    }
  }

  window.StainherHPR72={refresh};
  window.StainherHPR75={refresh};
  window.StainherHPR77={refresh};
  window.StainherHPR78={refresh};
  window.StainherHPR81={refresh,refreshBudgets};
  window.StainherHPR82={refresh,refreshBudgets};
  window.StainherHPR83={refresh,refreshBudgets};
  window.StainherHPR84={refresh,refreshBudgets};
  window.StainherHPR85={refresh,refreshBudgets};
  refreshBudgets();
  refresh();
})();
