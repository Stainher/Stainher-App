/* Stainher V15.24 · R106 · puente anti-cache HP + Presupuestos + Liderazgo + Sistema + Firmas + Informes + Forecast + Turnos.
 * Mantiene HP R78 y Presupuestos R85. Fuerza carga fresca del correo,
 * PDF, eliminación de programación, acciones DOM, correo post-guardado R88,
 * limpieza visual de Sistema R89, firma personal R90, expansión móvil R91,
 * Comunicados / Informes libres R92, acceso contractual R93 y Forecast/EDP R95.
 * No contiene lógica de login/sesión ni modifica cálculos HP.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LOADER_VERSION__==='R106')return;
  window.__STAINHER_HP_LOADER_R72__=true;
  window.__STAINHER_HP_LOADER_VERSION__='R106';

  const BUILD='20260924-r106-personal-turn-report-layout';
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
      await load('stainher-presupuestos-runtime-r93','stainher-presupuestos-r80.js');
      await load('stainher-presupuestos-pdf-footer-runtime-r93','stainher-presupuestos-pdf-footer-r84.js');
      await load('stainher-presupuestos-grid-runtime-r93','stainher-presupuestos-grid-r85.js');
      await load('stainher-presupuestos-router-runtime-r93','stainher-presupuestos-router-r82.js');
      window.dispatchEvent(new CustomEvent('stainher:presupuestos-r85-ready'));
    }catch(error){
      console.error('[Stainher Presupuestos R85]',error);
    }
  }

  async function refreshLeadership(){
    try{
      await load('stainher-leadership-mail-runtime-r93','stainher-v1524-leadership-mail.js');
      await load('stainher-leadership-record-pdf-runtime-r93','stainher-v1524-leadership-record-pdf-r86.js');
      await load('stainher-leadership-program-delete-runtime-r93','stainher-v1524-leadership-program-delete-r86.js');
      await load('stainher-leadership-dom-actions-runtime-r93','stainher-v1524-leadership-dom-actions-r87.js');
      await load('stainher-leadership-mail-after-save-runtime-r93','stainher-v1524-leadership-mail-after-save-r88.js');
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
      await load('stainher-system-cleanup-runtime-r93','stainher-v1524-system-cleanup-r89.js');
      window.StainherSystemCleanupR89?.install?.();
      window.StainherSystemCleanupR89?.cleanup?.();
      window.dispatchEvent(new CustomEvent('stainher:system-r89-ready'));
    }catch(error){
      console.error('[Stainher Sistema R89]',error);
    }
  }

  async function refreshSignature(){
    try{
      await load('stainher-signature-profile-runtime-r93','stainher-v1524-signature-profile-r90.js');
      await load('stainher-signature-mobile-runtime-r93','stainher-v1524-signature-mobile-r91.js');
      window.StainherSignatureR90?.install?.();
      window.StainherSignatureR91?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:signature-r91-ready'));
    }catch(error){
      console.error('[Stainher Firma R91]',error);
    }
  }

  async function refreshFreeReport(){
    try{
      await load('stainher-free-report-runtime-r93','stainher-v1524-free-report-r92.js');
      await load('stainher-free-report-contract-runtime-r93','stainher-v1524-free-report-contract-r93.js');
      window.StainherFreeReportR92?.install?.();
      window.StainherFreeReportContractR93?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:free-report-r93-ready'));
    }catch(error){
      console.error('[Stainher Comunicados/Informes R93]',error);
    }
  }

  async function refreshContractForecast(){
    try{
      await load('stainher-contract-forecast-runtime-r95','stainher-v1524-contract-forecast-r95.js');
      await load('stainher-contract-forecast-runtime-r96','stainher-v1524-contract-forecast-r96.js');
      await load('stainher-contract-forecast-runtime-r98','stainher-v1524-contract-forecast-r98.js');
      await load('stainher-contract-forecast-runtime-r100','stainher-v1524-contract-forecast-r100.js');
      await load('stainher-contract-forecast-runtime-r103','stainher-v1524-contract-forecast-r103.js');
      await load('stainher-contract-forecast-runtime-r104','stainher-v1524-contract-forecast-r104.js');
      await load('stainher-contract-forecast-runtime-r105','stainher-v1524-contract-forecast-r105.js');
      window.StainherContractForecastR95?.install?.();
      window.StainherContractForecastR96?.install?.();
      window.StainherContractForecastR98?.install?.();
      window.StainherContractForecastR100?.install?.();
      window.StainherContractForecastR103?.install?.();
      window.StainherContractForecastR104?.install?.();
      window.StainherContractForecastR105?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:contract-forecast-r105-ready'));
    }catch(error){
      console.error('[Stainher Forecast R95]',error);
    }
  }

  async function refreshTurnReport(){
    try{
      await load('stainher-turn-pdf-final-runtime-r106','stainher-turn-pdf-final-r18.js');
      window.dispatchEvent(new CustomEvent('stainher:turn-report-r106-ready'));
    }catch(error){
      console.error('[Stainher Turnos R106]',error);
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
  window.StainherHPR91={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature};
  window.StainherHPR92={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport};
  window.StainherHPR93={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport};
  window.StainherHPR95={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast};
  window.StainherHPR96={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast};
  window.StainherHPR98={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast};
  window.StainherHPR100={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast};
  window.StainherHPR102={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast};
  window.StainherHPR103={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast};
  window.StainherHPR104={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast};
  window.StainherHPR105={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast};
  window.StainherHPR106={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast,refreshTurnReport};
  refreshBudgets();
  refreshLeadership();
  refreshSystem();
  refreshSignature();
  refreshFreeReport();
  refreshContractForecast();
  refreshTurnReport();
  refresh();
})();
