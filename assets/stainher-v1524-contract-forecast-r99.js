/* Stainher V15.24 · R99 · render inmediato de gráficos Forecast.
 * Evita animación diferida y redibujos visibles en móvil.
 * No altera datos ni fórmulas; solo presentación/render.
 */
(()=>{
  'use strict';
  const BUILD='20260917-r99-forecast-instant-render';
  if(window.__STAINHER_CONTRACT_FORECAST_R99__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R99__=BUILD;

  function forceInstant(chart){
    if(!chart)return false;
    try{chart.stop?.()}catch(_){}
    chart.options=chart.options||{};
    chart.options.animation=false;
    chart.options.animations=false;
    chart.options.transitions=chart.options.transitions||{};
    chart.options.transitions.active={animation:{duration:0}};
    chart.options.transitions.resize={animation:{duration:0}};
    chart.options.transitions.show={animations:{colors:{duration:0},visible:{duration:0}}};
    chart.options.transitions.hide={animations:{colors:{duration:0},visible:{duration:0}}};
    try{chart.resize?.()}catch(_){}
    try{chart.update?.('none')}catch(_){try{chart.update?.()}catch(__){}}
    return true;
  }

  function settle(){
    const charts=window.state?.charts||{};
    forceInstant(charts.forecast);
    forceInstant(charts.forecastReal);
    requestAnimationFrame(()=>{
      forceInstant(charts.forecast);
      forceInstant(charts.forecastReal);
    });
  }

  function wrapBody(){
    const current=window.renderForecastBodyV9;
    if(typeof current!=='function')return false;
    if(current.__r99)return true;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      settle();
      return out;
    };
    wrapped.__r99=true;wrapped.__base=current;
    window.renderForecastBodyV9=wrapped;
    try{renderForecastBodyV9=wrapped}catch(_){}
    return true;
  }

  function wrapLoad(){
    const current=window.loadForecastV9;
    if(typeof current!=='function')return false;
    if(current.__r99)return true;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      settle();
      return out;
    };
    wrapped.__r99=true;wrapped.__base=current;
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
    ['stainher:modules-ready','stainher:contract-forecast-r98-ready'].forEach(ev=>window.addEventListener(ev,install));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR99=Object.freeze({install,settle,forceInstant});
})();