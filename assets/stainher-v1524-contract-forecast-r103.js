/* Stainher V15.24 · R103 · limpieza activa de wrappers R99 persistentes.
 * Desenvuelve cualquier función Forecast marcada __r99 que haya quedado viva
 * en una sesión SPA anterior y reinstala R98/R100 sobre la base limpia.
 */
(()=>{
  'use strict';
  const BUILD='20260918-r103-clean-r99-wrapper';
  if(window.__STAINHER_CONTRACT_FORECAST_R103__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R103__=BUILD;

  function stripR99(fn){
    let current=fn,guard=0;
    while(typeof current==='function' && guard++<20){
      if(current.__r99 && typeof current.__base==='function'){
        current=current.__base;
        continue;
      }
      if(typeof current.__base==='function'){
        const cleaned=stripR99(current.__base);
        if(cleaned!==current.__base){
          try{current.__base=cleaned}catch(_){}
        }
      }
      break;
    }
    return current;
  }

  function cleanGlobal(name){
    const fn=window[name];
    if(typeof fn!=='function')return false;
    const cleaned=stripR99(fn);
    if(cleaned!==fn){
      window[name]=cleaned;
      try{globalThis[name]=cleaned}catch(_){}
      return true;
    }
    return false;
  }

  function install(){
    const a=cleanGlobal('loadForecastV9');
    const b=cleanGlobal('renderForecastBodyV9');
    if(a||b){
      try{window.StainherContractForecastR98?.install?.()}catch(_){}
      try{window.StainherContractForecastR100?.install?.()}catch(_){}
      if(window.state?.contractTab==='forecast'){
        Promise.resolve(window.loadForecastV9?.()).catch(err=>console.error('[Stainher Forecast R103]',err));
      }
    }
    return a||b;
  }

  function boot(){
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const changed=install();
      if(changed||tries>=80)clearInterval(timer);
    },125);
    ['stainher:modules-ready','stainher:contract-forecast-r100-ready'].forEach(ev=>window.addEventListener(ev,install));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR103=Object.freeze({install,stripR99,cleanGlobal});
})();