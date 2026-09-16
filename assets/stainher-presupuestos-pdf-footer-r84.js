/* Stainher V15.24 · R84 · Pie PDF Presupuestos.
 * Corrige la superposición interceptando la instancia jsPDF devuelta por ensurePdf.
 * Solo suprime la línea manual "Generado ... · Stainher App" del PDF de Presupuestos.
 * No modifica otros informes ni el footer corporativo estándar.
 */
(()=>{
  'use strict';
  const BUILD='20260916-r84-presupuestos-pdf-footer-instance';
  if(window.__STAINHER_PRESUPUESTOS_PDF_FOOTER_R84__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_PDF_FOOTER_R84__=BUILD;

  const originalEnsure=window.ensurePdf;
  if(typeof originalEnsure!=='function')return;
  if(originalEnsure.__stainherPresupuestoFooterR84)return;

  function wrapCtor(C){
    if(typeof C!=='function'||C.__stainherBudgetCtorR84)return C;
    function Wrapped(){
      const doc=Reflect.construct(C,Array.from(arguments));
      if(doc&&typeof doc.text==='function'&&!doc.text.__stainherBudgetTextR84){
        const baseText=doc.text.bind(doc);
        const textWrapped=function(text,x,y){
          const isBudget=window.state?.contractTab==='presupuestos';
          const duplicate=typeof text==='string'&&/^Generado\b.*Stainher App$/i.test(text.trim());
          if(isBudget&&duplicate&&Number(y)>=285)return doc;
          return baseText.apply(doc,arguments);
        };
        textWrapped.__stainherBudgetTextR84=true;
        doc.text=textWrapped;
      }
      return doc;
    }
    try{Object.setPrototypeOf(Wrapped,C)}catch(_){ }
    Wrapped.prototype=C.prototype;
    Wrapped.__stainherBudgetCtorR84=true;
    Wrapped.__base=C;
    return Wrapped;
  }

  const ensureWrapped=function(){
    const C=originalEnsure.apply(this,arguments);
    return window.state?.contractTab==='presupuestos'?wrapCtor(C):C;
  };
  ensureWrapped.__stainherPresupuestoFooterR84=true;
  ensureWrapped.__base=originalEnsure;
  window.ensurePdf=ensureWrapped;
})();
