/* Stainher V15.24 · R96 · instalación robusta Forecast + EDP fresco.
 * Corrige dependencia de orden de carga sin MutationObserver global ni cambios de login.
 */
(()=>{
  'use strict';
  const BUILD='20260917-r96-forecast-install';
  if(window.__STAINHER_CONTRACT_FORECAST_R96__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R96__=BUILD;

  function installStyle(){
    if(document.getElementById('stainher-contract-r96-style'))return;
    const s=document.createElement('style');
    s.id='stainher-contract-r96-style';
    s.textContent=`
      #page-contrato .v1512-clean-table{table-layout:fixed;width:100%}
      #page-contrato .v1512-clean-table th,#page-contrato .v1512-clean-table td{vertical-align:middle}
      #page-contrato .v1512-clean-table th:nth-child(1),#page-contrato .v1512-clean-table td:nth-child(1){width:7%;text-align:left}
      #page-contrato .v1512-clean-table th:nth-child(2),#page-contrato .v1512-clean-table td:nth-child(2){width:19%;text-align:left}
      #page-contrato .v1512-clean-table th:nth-child(3),#page-contrato .v1512-clean-table td:nth-child(3),
      #page-contrato .v1512-clean-table th:nth-child(4),#page-contrato .v1512-clean-table td:nth-child(4),
      #page-contrato .v1512-clean-table th:nth-child(6),#page-contrato .v1512-clean-table td:nth-child(6),
      #page-contrato .v1512-clean-table th:nth-child(7),#page-contrato .v1512-clean-table td:nth-child(7){text-align:right}
      #page-contrato .v1512-clean-table th:nth-child(3),#page-contrato .v1512-clean-table td:nth-child(3){width:15%}
      #page-contrato .v1512-clean-table th:nth-child(4),#page-contrato .v1512-clean-table td:nth-child(4){width:15%}
      #page-contrato .v1512-clean-table th:nth-child(5),#page-contrato .v1512-clean-table td:nth-child(5){width:10%;text-align:center}
      #page-contrato .v1512-clean-table th:nth-child(6),#page-contrato .v1512-clean-table td:nth-child(6){width:16%}
      #page-contrato .v1512-clean-table th:nth-child(7),#page-contrato .v1512-clean-table td:nth-child(7){width:16%}
      #page-contrato .v1512-clean-table th:last-child,#page-contrato .v1512-clean-table td:last-child{width:10%;text-align:center}
    `;
    document.head.appendChild(s);
  }

  async function refreshEdp(year){
    const sb=window.sb;if(!sb?.from)throw new Error('Supabase no disponible');
    const q=await sb.from('estados_pago').select('*').eq('anio_edp',year).order('ep_num',{ascending:true});
    if(q.error)throw q.error;
    if(!window.state)window.state={};
    if(!window.state.contractData)window.state.contractData={};
    const others=(window.state.contractData.edp||[]).filter(x=>Number(x.anio_edp)!==Number(year));
    window.state.contractData.edp=[...others,...(q.data||[])];
    return q.data||[];
  }

  function styleForecastCharts(){
    const forecast=window.state?.charts?.forecast;
    if(forecast?.data?.datasets?.length){
      const [a,b]=forecast.data.datasets;
      if(a){Object.assign(a,{backgroundColor:'#f97316',borderColor:'#fb923c',borderWidth:1,hoverBackgroundColor:'#fb923c'})}
      if(b){Object.assign(b,{backgroundColor:'#22c55e',borderColor:'#4ade80',borderWidth:1,hoverBackgroundColor:'#4ade80'})}
      forecast.update('none');
    }
    const real=window.state?.charts?.forecastReal;
    if(real?.data?.datasets?.length){
      const [a,b]=real.data.datasets;
      if(a){Object.assign(a,{borderColor:'#38bdf8',backgroundColor:'rgba(56,189,248,.18)',pointBackgroundColor:'#38bdf8',pointBorderColor:'#e0f2fe',pointRadius:4,borderWidth:3,tension:.25})}
      if(b){Object.assign(b,{borderColor:'#f97316',backgroundColor:'rgba(249,115,22,.18)',pointBackgroundColor:'#f97316',pointBorderColor:'#ffedd5',pointRadius:4,borderWidth:3,tension:.25,spanGaps:false})}
      real.update('none');
    }
  }

  function wrapForecast(){
    const current=window.loadForecastV9;
    if(typeof current!=='function')return false;
    if(current.__r96)return true;
    const wrapped=async function(){
      const year=Number(document.getElementById('forecastYear')?.value||window.state?.forecastYear||new Date().getFullYear());
      try{await refreshEdp(year)}catch(error){console.error('[Stainher Forecast R96] EDP',error)}
      const out=await current.apply(this,arguments);
      requestAnimationFrame(styleForecastCharts);
      return out;
    };
    wrapped.__r96=true;wrapped.__base=current;
    window.loadForecastV9=wrapped;
    try{loadForecastV9=wrapped}catch(_){}
    return true;
  }

  function ensureInstalled(){
    installStyle();
    if(wrapForecast()){
      if(window.state?.contractTab==='forecast'&&document.getElementById('forecastBody')){
        Promise.resolve(window.loadForecastV9?.()).catch(error=>console.error('[Stainher Forecast R96] recarga',error));
      }else{
        requestAnimationFrame(styleForecastCharts);
      }
      return true;
    }
    return false;
  }

  function boot(){
    if(ensureInstalled())return;
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(ensureInstalled()||tries>=120)clearInterval(timer);
    },125);
    ['stainher:modules-ready','stainher:free-report-r93-ready','stainher:contract-forecast-r95-ready'].forEach(ev=>window.addEventListener(ev,ensureInstalled));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR96=Object.freeze({install:ensureInstalled,refreshEdp,styleForecastCharts});
})();