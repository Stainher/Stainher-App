/* Stainher V15.24 · R100 · primer frame estable de Forecast.
 * Deja completar el layout inicial de Chart.js y luego fija el render sin animación.
 * No altera datos, fórmulas ni login/sesión.
 */
(()=>{
  'use strict';
  const BUILD='20260917-r100-forecast-first-frame';
  if(window.__STAINHER_CONTRACT_FORECAST_R100__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R100__=BUILD;

  function finalize(chart){
    if(!chart)return false;
    chart.options=chart.options||{};
    chart.options.animation=false;
    chart.options.animations=false;
    try{chart.update?.('none')}catch(_){try{chart.update?.()}catch(__){}}
    return true;
  }

  function settle(){
    const charts=window.state?.charts||{};
    const run=()=>{
      finalize(charts.forecast);
      finalize(charts.forecastReal);
    };
    requestAnimationFrame(()=>requestAnimationFrame(run));
  }

  function wrapBody(){
    const current=window.renderForecastBodyV9;
    if(typeof current!=='function')return false;
    if(current.__r100)return true;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      settle();
      return out;
    };
    wrapped.__r100=true;
    wrapped.__base=current;
    window.renderForecastBodyV9=wrapped;
    try{renderForecastBodyV9=wrapped}catch(_){}
    return true;
  }

  function wrapLoad(){
    const current=window.loadForecastV9;
    if(typeof current!=='function')return false;
    if(current.__r100)return true;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      settle();
      return out;
    };
    wrapped.__r100=true;
    wrapped.__base=current;
    window.loadForecastV9=wrapped;
    try{loadForecastV9=wrapped}catch(_){}
    return true;
  }

  function install(){
    const a=wrapBody(),b=wrapLoad();
    if(window.state?.contractTab==='forecast')settle();
    return a||b;
  }

  function boot(){
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const a=wrapBody(),b=wrapLoad();
      if(a&&b&&tries>8)clearInterval(timer);
      if(tries>=120)clearInterval(timer);
    },125);
    ['stainher:modules-ready','stainher:contract-forecast-r99-ready'].forEach(ev=>window.addEventListener(ev,install));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR100=Object.freeze({install,settle,finalize});
})();