/* Stainher V15.24 · R90 · puente anti-cache HP + Presupuestos + Liderazgo + Sistema + Firmas.
 * Mantiene HP R78 y Presupuestos R85. Fuerza carga fresca del correo,
 * PDF, eliminación de programación, acciones DOM, correo post-guardado R88,
 * limpieza visual de Sistema R89 y firma personal ampliada/dibujable R90.
 * No contiene lógica de login/sesión ni modifica cálculos HP.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LOADER_VERSION__==='R90')return;
  window.__STAINHER_HP_LOADER_R72__=true;
  window.__STAINHER_HP_LOADER_VERSION__='R90';

  const BUILD='20260916-r90-signature-profile';
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
      await load('stainher-presupuestos-runtime-r90','stainher-presupuestos-r80.js');
      await load('stainher-presupuestos-pdf-footer-runtime-r90','stainher-presupuestos-pdf-footer-r84.js');
      await load('stainher-presupuestos-grid-runtime-r90','stainher-presupuestos-grid-r85.js');
      await load('stainher-presupuestos-router-runtime-r90','stainher-presupuestos-router-r82.js');
      window.dispatchEvent(new CustomEvent('stainher:presupuestos-r85-ready'));
    }catch(error){
      console.error('[Stainher Presupuestos R85]',error);
    }
  }

  async function refreshLeadership(){
    try{
      await load('stainher-leadership-mail-runtime-r90','stainher-v1524-leadership-mail.js');
      await load('stainher-leadership-record-pdf-runtime-r90','stainher-v1524-leadership-record-pdf-r86.js');
      await load('stainher-leadership-program-delete-runtime-r90','stainher-v1524-leadership-program-delete-r86.js');
      await load('stainher-leadership-dom-actions-runtime-r90','stainher-v1524-leadership-dom-actions-r87.js');
      await load('stainher-leadership-mail-after-save-runtime-r90','stainher-v1524-leadership-mail-after-save-r88.js');
      window.StainherLeadershipMail?.install?.();
      window.StainherLeadershipR86?.install?.();
      window.StainherLeadershipProgramDeleteR86?.install?.();
      window.StainherLeadershipR87?.install?.();
      window.StainherLeadershipMailAfterSaveR88?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:leadership-r88-ready'));
    }catch(error){
      console.error('[Stainher Liderazgo R88]',error);
    }
  }

  async function refreshSystem(){
    try{
      await load('stainher-system-cleanup-runtime-r90','stainher-v1524-system-cleanup-r89.js');
      window.StainherSystemCleanupR89?.install?.();
      window.StainherSystemCleanupR89?.cleanup?.();
      window.dispatchEvent(new CustomEvent('stainher:system-r89-ready'));
    }catch(error){
      console.error('[Stainher Sistema R89]',error);
    }
  }

  async function refreshSignature(){
    try{
      await load('stainher-signature-profile-runtime-r90','stainher-v1524-signature-profile-r90.js');
      window.StainherSignatureR90?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:signature-r90-ready'));
    }catch(error){
      console.error('[Stainher Firma R90]',error);
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
  window.StainherHPR86={refresh,refreshBudgets,refreshLeadership};
  window.StainherHPR87={refresh,refreshBudgets,refreshLeadership};
  window.StainherHPR88={refresh,refreshBudgets,refreshLeadership};
  window.StainherHPR89={refresh,refreshBudgets,refreshLeadership,refreshSystem};
  window.StainherHPR90={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature};
  refreshBudgets();
  refreshLeadership();
  refreshSystem();
  refreshSignature();
  refresh();
})();
