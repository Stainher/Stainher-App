/* Stainher V15.24 · R95 · Forecast EDP fresco + contraste de gráficos + alineación historial EDP.
 * No modifica fórmulas del Forecast ni lógica de login/sesión.
 */
(()=>{
  'use strict';
  const BUILD='20260917-r95-forecast-edp-colors';
  if(window.__STAINHER_CONTRACT_FORECAST_R95__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R95__=BUILD;

  function installStyle(){
    if(document.getElementById('stainher-contract-r95-style'))return;
    const s=document.createElement('style');
    s.id='stainher-contract-r95-style';
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
    const sb=window.sb;if(!sb?.from)return;
    const q=await sb.from('estados_pago').select('*').eq('anio_edp',year).order('ep_num',{ascending:true});
    if(q.error)throw q.error;
    if(!window.state)window.state={};
    if(!window.state.contractData)window.state.contractData={};
    const others=(window.state.contractData.edp||[]).filter(x=>Number(x.anio_edp)!==Number(year));
    window.state.contractData.edp=[...others,...(q.data||[])];
  }

  function styleForecastCharts(){
    const forecast=window.state?.charts?.forecast;
    if(forecast?.data?.datasets?.length){
      const d0=forecast.data.datasets[0],d1=forecast.data.datasets[1];
      if(d0){d0.backgroundColor='#f97316';d0.borderColor='#fb923c';d0.borderWidth=1;d0.hoverBackgroundColor='#fb923c'}
      if(d1){d1.backgroundColor='#22c55e';d1.borderColor='#4ade80';d1.borderWidth=1;d1.hoverBackgroundColor='#4ade80'}
      forecast.update('none');
    }
    const real=window.state?.charts?.forecastReal;
    if(real?.data?.datasets?.length){
      const d0=real.data.datasets[0],d1=real.data.datasets[1];
      if(d0){d0.borderColor='#38bdf8';d0.backgroundColor='rgba(56,189,248,.18)';d0.pointBackgroundColor='#38bdf8';d0.pointBorderColor='#e0f2fe';d0.pointRadius=4;d0.borderWidth=3;d0.tension=.25}
      if(d1){d1.borderColor='#f97316';d1.backgroundColor='rgba(249,115,22,.18)';d1.pointBackgroundColor='#f97316';d1.pointBorderColor='#ffedd5';d1.pointRadius=4;d1.borderWidth=3;d1.tension=.25;d1.spanGaps=false}
      real.update('none');
    }
  }

  function wrapForecast(){
    const current=window.loadForecastV9;
    if(typeof current!=='function'||current.__r95)return false;
    const wrapped=async function(){
      const year=Number(document.getElementById('forecastYear')?.value||window.state?.forecastYear||new Date().getFullYear());
      try{await refreshEdp(year)}catch(error){console.error('[Stainher Forecast R95] No fue posible refrescar EDP',error)}
      const out=await current.apply(this,arguments);
      requestAnimationFrame(styleForecastCharts);
      return out;
    };
    wrapped.__r95=true;wrapped.__base=current;window.loadForecastV9=wrapped;
    return true;
  }

  function install(){installStyle();wrapForecast();if(window.state?.contractTab==='forecast')requestAnimationFrame(styleForecastCharts)}
  install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:free-report-r93-ready',install);
  window.StainherContractForecastR95=Object.freeze({install,refreshEdp,styleForecastCharts});
})();