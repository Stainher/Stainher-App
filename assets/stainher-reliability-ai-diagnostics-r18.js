/* Stainher App V15.24 r18 · diagnóstico visible de Confiabilidad IA.
 * Solo ruta de prueba. Sustituye el toast genérico por el detalle que ya expone el panel IA.
 */
(function installReliabilityAiDiagnosticsR18(){
  'use strict';
  if(window.__STAINHER_RELIABILITY_AI_DIAG_R18__)return;
  window.__STAINHER_RELIABILITY_AI_DIAG_R18__=true;

  let tries=0;
  function install(){
    const original=window.toast;
    if(typeof original!=='function'){
      if(++tries<100)setTimeout(install,100);
      return;
    }
    if(original.__r18AiDiagnostics)return;
    const wrapped=function(message,type){
      let next=String(message??'');
      if(next==='No fue posible generar el análisis IA. Revisa la configuración de Gemini.'){
        const detail=document.querySelector('#modalRoot .v16-ai-status.error')?.textContent?.trim();
        if(detail)next=`IA: ${detail}`;
      }
      return original.call(this,next,type);
    };
    wrapped.__r18AiDiagnostics=true;
    wrapped.__base=original;
    window.toast=wrapped;
  }
  install();
})();
