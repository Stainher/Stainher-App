/* Stainher App V15.24 r18 · Mejora de legibilidad PDF Turnos
 * Aumenta exclusivamente la tipografía de los datos dentro del calendario PDF.
 * - Informe general A3: turnos y códigos de novedades más grandes.
 * - Informe filtrado por usuario A4: A/C/L más grandes y en negrita; códigos de novedades más legibles.
 * - No altera encabezados, glosa, resumen, detalle ni estructura/paginación.
 */
(function installTurnPdfLegibilityR18(){
  'use strict';
  if(window.__STAINHER_TURN_PDF_LEGIBILITY_R18__)return;
  window.__STAINHER_TURN_PDF_LEGIBILITY_R18__=true;

  const FLAG='__r18TurnPdfLegibility';

  function install(){
    const current=window.v1516ExportTurnReportPdf;
    if(typeof current!=='function'||current[FLAG]||!window.ensurePdf)return false;

    const wrapped=function(){
      let C,api,originalSetFontSize,originalSetFont;
      try{
        C=window.ensurePdf?.();
        api=C?.API;
        if(!api||typeof api.setFontSize!=='function'||typeof api.setFont!=='function'){
          return current.apply(this,arguments);
        }

        originalSetFontSize=api.setFontSize;
        originalSetFont=api.setFont;

        api.setFont=function(fontName,fontStyle,fontWeight){
          try{
            const style=String(fontStyle||fontWeight||'').toLowerCase();
            this.__stainherTurnPdfStyleR18=style;
          }catch(_){ }
          return originalSetFont.apply(this,arguments);
        };

        api.setFontSize=function(value){
          let size=Number(value);
          try{
            const width=Number(this.internal?.pageSize?.getWidth?.()||0);
            const height=Number(this.internal?.pageSize?.getHeight?.()||0);
            const landscape=width>height;
            const style=String(this.__stainherTurnPdfStyleR18||'').toLowerCase();
            const bold=style.includes('bold');

            // Calendario general: A3 horizontal. Solo tipografía propia de la cuadrícula.
            if(landscape&&width>350){
              if(bold&&size>=2.5&&size<=4.25){
                // A / C / L y numeración de días: más visibles, manteniendo la celda original.
                size=Math.min(6.2,Math.max(5.0,size*1.45));
              }else if(!bold&&size>=2.0&&size<=3.25){
                // ET / EF / SE / DA / HF / V / LM / P / CAP, etc.
                size=Math.min(4.2,Math.max(3.7,size*1.30));
              }
            }

            // Calendario individual: A4 horizontal. Los valores 6.8 y 4.7 son exclusivos
            // de turno y novedades dentro de las celdas del calendario personal.
            if(landscape&&width>=250&&width<350){
              if(bold&&Math.abs(size-6.8)<0.2)size=9.4;
              else if(!bold&&Math.abs(size-4.7)<0.2)size=6.1;
            }
          }catch(_){ }
          return originalSetFontSize.call(this,size);
        };

        return current.apply(this,arguments);
      }finally{
        if(api&&originalSetFontSize)api.setFontSize=originalSetFontSize;
        if(api&&originalSetFont)api.setFont=originalSetFont;
      }
    };

    wrapped[FLAG]=true;
    wrapped.__base=current;
    window.v1516ExportTurnReportPdf=wrapped;
    console.info('[r18] PDF Turnos: legibilidad de calendario mejorada');
    return true;
  }

  let attempts=0;
  (function boot(){
    if(install())return;
    if(++attempts<300)setTimeout(boot,100);
  })();

  window.addEventListener('stainher:modules-ready',()=>setTimeout(install,0));
})();
