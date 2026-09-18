/* Stainher V15.24 · R104 · barras mensuales Forecast visibles.
 * Toma la geometría final calculada por Chart.js y la fija en el canvas.
 * Solo afecta state.charts.forecast; no toca Forecast vs EDP real.
 */
(()=>{
  'use strict';
  const BUILD='20260918-r104-monthly-bars-final-geometry';
  if(window.__STAINHER_CONTRACT_FORECAST_R104__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R104__=BUILD;

  const palette=[
    '#60a5fa','#34d399','#f59e0b','#a78bfa','#f472b6','#38bdf8',
    '#22c55e','#eab308','#8b5cf6','#fb7185','#60a5fa','#34d399'
  ];

  function forceMonthlyBars(){
    const chart=window.state?.charts?.forecast;
    if(!chart?.data?.datasets?.length)return false;

    chart.data.datasets.forEach((ds,di)=>{
      if(Array.isArray(ds.data)){
        ds.backgroundColor=ds.data.map((_,i)=>palette[i%palette.length]);
        ds.borderColor=ds.data.map((_,i)=>palette[i%palette.length]);
        ds.borderWidth=1.5;
        ds.hoverBackgroundColor=ds.data.map((_,i)=>palette[i%palette.length]);
      }
      const meta=chart.getDatasetMeta?.(di);
      if(!meta?.data?.length)return;
      meta.data.forEach((bar,i)=>{
        try{
          const final=bar.getProps?.(['x','y','base','width','height'],true);
          if(final)Object.assign(bar,final);
          if(bar.options){
            const color=palette[i%palette.length];
            bar.options.backgroundColor=color;
            bar.options.borderColor=color;
            bar.options.borderWidth=1.5;
          }
        }catch(_){}
      });
    });

    try{chart.stop?.()}catch(_){}
    chart.options=chart.options||{};
    chart.options.animation=false;
    chart.options.animations=false;
    try{chart.draw?.()}catch(_){}
    return true;
  }

  function settle(){
    const run=()=>forceMonthlyBars();
    requestAnimationFrame(()=>requestAnimationFrame(run));
    setTimeout(run,80);
    setTimeout(run,220);
  }

  function wrapBody(){
    const current=window.renderForecastBodyV9;
    if(typeof current!=='function')return false;
    if(current.__r104)return true;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      settle();
      return out;
    };
    wrapped.__r104=true;wrapped.__base=current;
    window.renderForecastBodyV9=wrapped;
    try{renderForecastBodyV9=wrapped}catch(_){}
    return true;
  }

  function wrapLoad(){
    const current=window.loadForecastV9;
    if(typeof current!=='function')return false;
    if(current.__r104)return true;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      settle();
      return out;
    };
    wrapped.__r104=true;wrapped.__base=current;
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
      const ok=install();
      if((ok&&forceMonthlyBars())||tries>=120)clearInterval(timer);
    },125);
    ['stainher:modules-ready','stainher:contract-forecast-r103-ready'].forEach(ev=>window.addEventListener(ev,install));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR104=Object.freeze({install,forceMonthlyBars,settle});
})();