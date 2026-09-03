/* Stainher App V15.24 r6 · Forzado autoritativo del importador de averías */
(function installAveriasImportForce(){
  'use strict';
  if(window.__STAINHER_AVERIAS_IMPORT_FORCE_R6__)return;
  window.__STAINHER_AVERIAS_IMPORT_FORCE_R6__=true;

  function install(){
    const detailed=window.previewAveriasFile;
    if(typeof detailed!=='function'||!detailed.__v1524ImportDiagnostics)return false;

    const parsed=window.parseHora;
    if(typeof parsed==='function'&&!parsed.__v1524R6LocalDate){
      const wrapped=function(v){
        if(v instanceof Date&&!isNaN(v)){
          return `${String(v.getHours()).padStart(2,'0')}:${String(v.getMinutes()).padStart(2,'0')}`;
        }
        return parsed(v);
      };
      wrapped.__v1524R6LocalDate=true;
      window.parseHora=wrapped;
    }

    if(!window.__STAINHER_AVERIAS_CHANGE_CAPTURE_R6__){
      window.__STAINHER_AVERIAS_CHANGE_CAPTURE_R6__=true;
      document.addEventListener('change',function(ev){
        const input=ev.target;
        if(!input||input.id!=='averiasFile')return;
        const fn=window.previewAveriasFile;
        if(typeof fn!=='function'||!fn.__v1524ImportDiagnostics)return;
        ev.preventDefault();
        ev.stopImmediatePropagation();
        fn(ev);
      },true);
    }
    return true;
  }

  let n=0;
  const timer=setInterval(function(){if(install()||++n>120)clearInterval(timer)},100);
  install();
})();
