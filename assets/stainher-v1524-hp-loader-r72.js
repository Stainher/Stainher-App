/* Stainher V15.24 · R121 · cargador único y secuencial para módulos autenticados.
 * Mantiene HP R78 y Presupuestos R85. Fuerza carga fresca del correo,
 * PDF, eliminación de programación, acciones DOM, correo post-guardado R88,
 * limpieza visual de Sistema R89, firma personal R90, expansión móvil R91,
 * Comunicados / Informes libres R92, acceso contractual R93 y Forecast/EDP R95.
 * No contiene lógica de login/sesión ni modifica cálculos HP.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LOADER_VERSION__==='R121')return;
  window.__STAINHER_HP_LOADER_R72__=true;
  window.__STAINHER_HP_LOADER_VERSION__='R121';

  const BUILD='20260925-r121-forecast-charts';
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
      await load('stainher-presupuestos-runtime-r110','stainher-presupuestos-r80.js');
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
      await load('stainher-contract-forecast-runtime-r121','stainher-v1524-contract-forecast-r121.js');
      window.StainherContractForecastR95?.install?.();
      window.StainherContractForecastR96?.install?.();
      window.StainherContractForecastR98?.install?.();
      window.StainherContractForecastR100?.install?.();
      window.StainherContractForecastR103?.install?.();
      window.StainherContractForecastR104?.install?.();
      window.StainherContractForecastR105?.install?.();
      window.StainherContractForecastR121?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:contract-forecast-r105-ready'));
      window.dispatchEvent(new CustomEvent('stainher:contract-forecast-r121-ready'));
    }catch(error){
      console.error('[Stainher Forecast R95]',error);
    }
  }

  async function refreshTurnReport(){
    try{
      await load('stainher-turn-pdf-final-runtime-r111','stainher-turn-pdf-final-r18.js');
      window.StainherTurnPdfR111?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:turn-report-r111-ready'));
    }catch(error){
      console.error('[Stainher Turnos R111]',error);
    }
  }

  async function refreshAccessR107(){
    try{
      await load('stainher-contract-alerts-runtime-r107','stainher-v1524-contract-alerts-r94.js');
      await load('stainher-access-leadership-runtime-r107','stainher-v1524-access-leadership-r107.js');
      await load('stainher-reliability-contract-runtime-r108','stainher-v1524-reliability-contract-r108.js');
      window.StainherAccessLeadershipR107?.install?.();
      window.StainherReliabilityContractR108?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:access-r107-ready'));
    }catch(error){
      console.error('[Stainher Accesos R107]',error);
    }
  }

  async function refreshVehicleExpiryR109(){
    try{
      if(window.__STAINHER_VEHICLE_EXPIRY_VERSION__!=='R109'){
        await load('stainher-vehicle-expiry-runtime-r109','stainher-vehicle-expiry-alerts-r18.js');
      }
      window.StainherVehicleExpiryR109?.install?.();
      window.dispatchEvent(new CustomEvent('stainher:vehicle-expiry-r109-ready'));
    }catch(error){
      console.error('[Stainher Vehículos R109]',error);
    }
  }

  async function refreshCorrectivoHistoryR118(){
    try{
      await load('stainher-correctivo-history-runtime-r118','stainher-v1524-corrective-history-r118.js');
      window.StainherCorrectivoHistoryR118?.install?.();
      window.StainherCorrectivoHistoryR118?.enhance?.();
      window.dispatchEvent(new CustomEvent('stainher:correctivo-history-r118-ready'));
    }catch(error){
      console.error('[Stainher Correctivo History R118]',error);
    }
  }

  async function refreshReliabilityActionsR119(){
    try{
      await load('stainher-reliability-actions-runtime-r119','stainher-v1524-reliability-actions.js');
      window.dispatchEvent(new CustomEvent('stainher:reliability-pdf-r119-ready'));
    }catch(error){
      console.error('[Stainher Confiabilidad PDF R119]',error);
    }
  }

  async function refreshEquipmentViewR120(){
    try{
      await load('stainher-equipment-view-runtime-r120','stainher-v1524-equipment-view-r120.js');
      window.StainherEquipmentViewR120?.install?.();
      window.StainherEquipmentViewR120?.enhance?.();
      window.dispatchEvent(new CustomEvent('stainher:equipment-view-r120-ready'));
    }catch(error){
      console.error('[Stainher Equipos R120]',error);
    }
  }

  async function refresh(){
    try{
      await load('stainher-weekly-hp-runtime-r117','stainher-v1524-weekly-hp-report.js');
      await load('stainher-hp-history-runtime-r117','stainher-v1524-hp-history-r71.js');
      await load('stainher-hp-admin-detail-runtime-r78','stainher-v1524-hp-admin-detail-r74.js');
      await load('stainher-hp-layout-runtime-r78','stainher-v1524-hp-layout-r78.js');
      await load('stainher-weekly-hp-router-r78','stainher-v1524-hp-router-r57.js');
      window.dispatchEvent(new CustomEvent('stainher:hp-r78-ready'));
      window.dispatchEvent(new CustomEvent('stainher:hp-r115-ready'));
      window.dispatchEvent(new CustomEvent('stainher:hp-r116-ready'));
      window.dispatchEvent(new CustomEvent('stainher:hp-r117-ready'));
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
  window.StainherHPR107={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast,refreshTurnReport,refreshAccessR107};
  window.StainherHPR108={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast,refreshTurnReport,refreshAccessR107};
  window.StainherHPR109={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast,refreshTurnReport,refreshAccessR107,refreshVehicleExpiryR109};
  window.StainherHPR110={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast,refreshTurnReport,refreshAccessR107,refreshVehicleExpiryR109};
  const api={refresh,refreshBudgets,refreshLeadership,refreshSystem,refreshSignature,refreshFreeReport,refreshContractForecast,refreshTurnReport,refreshAccessR107,refreshVehicleExpiryR109,refreshCorrectivoHistoryR118,refreshReliabilityActionsR119,refreshEquipmentViewR120};
  window.StainherHPR111=api;
  window.StainherHPR112=api;
  window.StainherHPR115=api;
  window.StainherHPR116=api;
  window.StainherHPR117=api;
  window.StainherHPR118=api;
  window.StainherHPR119=api;
  window.StainherHPR120=api;
  window.StainherHPR121=api;

  async function bootstrapR121(){
    await refreshAccessR107();
    await refreshBudgets();
    await refreshContractForecast();
    await refreshTurnReport();
    await refreshVehicleExpiryR109();
    await refreshLeadership();
    await refreshSystem();
    await refreshSignature();
    await refreshFreeReport();
    await refreshReliabilityActionsR119();
    await refreshCorrectivoHistoryR118();
    await refreshEquipmentViewR120();
    await refresh();
    window.dispatchEvent(new CustomEvent('stainher:runtime-r112-ready'));
    window.dispatchEvent(new CustomEvent('stainher:runtime-r115-ready'));
    window.dispatchEvent(new CustomEvent('stainher:runtime-r116-ready'));
    window.dispatchEvent(new CustomEvent('stainher:runtime-r117-ready'));
    window.dispatchEvent(new CustomEvent('stainher:runtime-r118-ready'));
    window.dispatchEvent(new CustomEvent('stainher:runtime-r119-ready'));
    window.dispatchEvent(new CustomEvent('stainher:runtime-r120-ready'));
    window.dispatchEvent(new CustomEvent('stainher:runtime-r121-ready'));
  }
  api.bootstrapR112=bootstrapR121;
  api.bootstrapR115=bootstrapR121;
  api.bootstrapR116=bootstrapR121;
  api.bootstrapR117=bootstrapR121;
  api.bootstrapR118=bootstrapR121;
  api.bootstrapR119=bootstrapR121;
  api.bootstrapR120=bootstrapR121;
  api.bootstrapR121=bootstrapR121;
  bootstrapR121().catch(error=>console.error('[Stainher Runtime R121]',error));
})();
