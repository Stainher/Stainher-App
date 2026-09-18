/* Stainher V15.24 · R97 · EDP real histórico = Total Neto real de Supabase.
 * Si existe EDP en el mes, se grafica total_neto; si no existe, la serie queda sin punto.
 * No modifica fórmulas de Forecast proyectable ni login/sesión.
 */
(()=>{
  'use strict';
  const BUILD='20260917-r97-forecast-real-total-neto';
  if(window.__STAINHER_CONTRACT_FORECAST_R97__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R97__=BUILD;

  async function fetchEdp(year){
    const sb=window.sb;if(!sb?.from)throw new Error('Supabase no disponible');
    const q=await sb.from('estados_pago')
      .select('id,ep_num,anio_edp,mes_edp,total_neto,mantenimiento,gastos_reembolsables,total_pagar_neto,total_iva_incluido')
      .eq('anio_edp',year)
      .order('mes_edp',{ascending:true});
    if(q.error)throw q.error;
    return q.data||[];
  }

  function applyRealSeries(year,eps){
    const byMonth=new Map((eps||[]).map(e=>[Number(e.mes_edp),Number(e.total_neto)||0]));
    const months=window.state?.forecastDataV8?.months;
    if(Array.isArray(months)){
      months.forEach((m,i)=>{
        const v=byMonth.get(i+1);
        m.real=v==null?0:v;
        if(v!=null)m.epTotal=v;
      });
    }

    const chart=window.state?.charts?.forecastReal;
    if(chart?.data?.datasets?.length){
      const ds=chart.data.datasets.find(d=>/EDP real/i.test(String(d.label||'')))||chart.data.datasets[1];
      if(ds){
        ds.data=Array.from({length:12},(_,i)=>byMonth.has(i+1)?byMonth.get(i+1):null);
        ds.label='EDP real histórico';
        ds.borderColor='#34d399';
        ds.backgroundColor='rgba(52,211,153,.18)';
        ds.pointBackgroundColor='#34d399';
        ds.pointBorderColor='#d1fae5';
        ds.pointRadius=4;
        ds.borderWidth=3;
        ds.tension=.25;
        ds.spanGaps=false;
      }
      chart.update();
    }
  }

  function wrap(){
    const current=window.loadForecastV9;
    if(typeof current!=='function')return false;
    if(current.__r97)return true;
    const wrapped=async function(){
      const year=Number(document.getElementById('forecastYear')?.value||window.state?.forecastYear||new Date().getFullYear());
      let eps=[];
      try{eps=await fetchEdp(year)}catch(error){console.error('[Stainher Forecast R97] EDP',error)}
      const out=await current.apply(this,arguments);
      applyRealSeries(year,eps);
      return out;
    };
    wrapped.__r97=true;wrapped.__base=current;
    window.loadForecastV9=wrapped;
    try{loadForecastV9=wrapped}catch(_){}
    return true;
  }

  function install(){
    if(wrap()){
      if(window.state?.contractTab==='forecast'&&document.getElementById('forecastBody')){
        Promise.resolve(window.loadForecastV9?.()).catch(error=>console.error('[Stainher Forecast R97] recarga',error));
      }
      return true;
    }
    return false;
  }

  function boot(){
    if(install())return;
    let tries=0;
    const timer=setInterval(()=>{tries++;if(install()||tries>=120)clearInterval(timer)},125);
    ['stainher:modules-ready','stainher:contract-forecast-r96-ready'].forEach(ev=>window.addEventListener(ev,install));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR97=Object.freeze({install,fetchEdp,applyRealSeries});
})();