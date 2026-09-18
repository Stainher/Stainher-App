/* Stainher V15.24 · R98 · render final estable de Forecast vs EDP real.
 * Fuente EDP real: estados_pago.total_neto. Se reaplica después de cada render
 * para evitar que capas históricas sobrescriban la serie corregida.
 * Sin MutationObserver global y sin cambios de login/sesión.
 */
(()=>{
  'use strict';
  const BUILD='20260917-r98-forecast-final-render';
  if(window.__STAINHER_CONTRACT_FORECAST_R98__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R98__=BUILD;

  let latestByYear=new Map();

  async function fetchEdp(year){
    const sb=window.sb;if(!sb?.from)throw new Error('Supabase no disponible');
    const q=await sb.from('estados_pago')
      .select('id,ep_num,anio_edp,mes_edp,total_neto,total_pagar_neto,mantenimiento,gastos_reembolsables')
      .eq('anio_edp',year)
      .order('mes_edp',{ascending:true});
    if(q.error)throw q.error;
    latestByYear.set(Number(year),q.data||[]);
    if(!window.state)window.state={};
    if(!window.state.contractData)window.state.contractData={};
    const others=(window.state.contractData.edp||[]).filter(x=>Number(x.anio_edp)!==Number(year));
    window.state.contractData.edp=[...others,...(q.data||[])];
    return q.data||[];
  }

  function applySeries(year,eps){
    const rows=eps||latestByYear.get(Number(year))||[];
    const byMonth=new Map(rows.map(e=>[Number(e.mes_edp),Number(e.total_neto)||0]));
    const months=window.state?.forecastDataV8?.months;
    if(Array.isArray(months)){
      months.forEach((m,i)=>{
        const value=byMonth.get(i+1);
        m.real=value==null?0:value;
        if(value!=null)m.epTotal=value;
      });
    }

    const chart=window.state?.charts?.forecastReal;
    if(!chart?.data?.datasets?.length)return false;
    const ds=chart.data.datasets.find(d=>/EDP real/i.test(String(d.label||'')))||chart.data.datasets[1];
    if(!ds)return false;

    ds.label='EDP real histórico';
    ds.data=Array.from({length:12},(_,i)=>byMonth.has(i+1)?byMonth.get(i+1):null);
    Object.assign(ds,{
      borderColor:'#34d399',
      backgroundColor:'rgba(52,211,153,.18)',
      pointBackgroundColor:'#34d399',
      pointBorderColor:'#d1fae5',
      pointRadius:4,
      pointHoverRadius:5,
      borderWidth:3,
      tension:.25,
      spanGaps:false
    });
    chart.update('none');
    return true;
  }

  function yearNow(){
    return Number(document.getElementById('forecastYear')?.value||window.state?.forecastYear||new Date().getFullYear());
  }

  async function refreshAndApply(){
    const year=yearNow();
    let rows=[];
    try{rows=await fetchEdp(year)}catch(error){console.error('[Stainher Forecast R98] EDP',error)}
    const apply=()=>applySeries(year,rows);
    apply();
    requestAnimationFrame(()=>{apply();requestAnimationFrame(apply)});
    setTimeout(apply,80);
    setTimeout(apply,220);
  }

  function wrapLoad(){
    const current=window.loadForecastV9;
    if(typeof current!=='function')return false;
    if(current.__r98)return true;
    const wrapped=async function(){
      const year=yearNow();
      let rows=[];
      try{rows=await fetchEdp(year)}catch(error){console.error('[Stainher Forecast R98] refresco',error)}
      const out=await current.apply(this,arguments);
      const apply=()=>applySeries(year,rows);
      apply();
      requestAnimationFrame(()=>{apply();requestAnimationFrame(apply)});
      setTimeout(apply,80);
      setTimeout(apply,220);
      return out;
    };
    wrapped.__r98=true;
    wrapped.__base=current;
    window.loadForecastV9=wrapped;
    try{loadForecastV9=wrapped}catch(_){}
    return true;
  }

  function wrapRenderBody(){
    const current=window.renderForecastBodyV9;
    if(typeof current!=='function')return false;
    if(current.__r98)return true;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      const year=yearNow();
      const rows=latestByYear.get(year)||[];
      const apply=()=>applySeries(year,rows);
      apply();
      requestAnimationFrame(()=>{apply();requestAnimationFrame(apply)});
      setTimeout(apply,80);
      setTimeout(apply,220);
      return out;
    };
    wrapped.__r98=true;
    wrapped.__base=current;
    window.renderForecastBodyV9=wrapped;
    try{renderForecastBodyV9=wrapped}catch(_){}
    return true;
  }

  function install(){
    const a=wrapLoad(),b=wrapRenderBody();
    if(window.state?.contractTab==='forecast'&&document.getElementById('forecastBody'))refreshAndApply();
    return a||b;
  }

  function boot(){
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const okLoad=wrapLoad();
      const okBody=wrapRenderBody();
      if(okLoad&&okBody&&tries>8)clearInterval(timer);
      if(tries>=120)clearInterval(timer);
    },125);
    ['stainher:modules-ready','stainher:contract-forecast-r96-ready','stainher:contract-forecast-r97-ready'].forEach(ev=>window.addEventListener(ev,install));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR98=Object.freeze({install,fetchEdp,applySeries,refreshAndApply});
})();