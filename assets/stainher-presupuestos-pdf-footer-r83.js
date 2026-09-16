/* Stainher V15.24 · R83 · Pie PDF Presupuestos.
 * El formato corporativo generado por pdfHeader ya ocupa la franja inferior.
 * Suprime únicamente la línea duplicada "Generado ... · Stainher App" que R80
 * dibuja en y=290 dentro de Presupuestos. No altera otros PDF ni su contenido.
 */
(()=>{
  'use strict';
  const BUILD='20260916-r83-presupuestos-pdf-footer';
  if(window.__STAINHER_PRESUPUESTOS_PDF_FOOTER_R83__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_PDF_FOOTER_R83__=BUILD;

  const API=window.jspdf?.jsPDF?.API;
  if(!API||typeof API.text!=='function')return;
  if(API.text.__stainherPresupuestoFooterR83)return;

  const base=API.text;
  const wrapped=function(text,x,y){
    const isBudget=window.state?.contractTab==='presupuestos';
    const duplicate=typeof text==='string'&&/^Generado\s.+Stainher App$/i.test(text.trim());
    if(isBudget&&duplicate&&Number(y)>=285)return this;
    return base.apply(this,arguments);
  };
  wrapped.__stainherPresupuestoFooterR83=true;
  wrapped.__base=base;
  API.text=wrapped;
})();
