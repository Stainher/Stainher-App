/* Stainher V15.24 · R121 · Forecast: control único + gráficos estables.
 * - Elimina el segundo botón "Actualizar" del selector anual de Forecast.
 * - Conserva el botón general de actualización de Administración del Contrato.
 * - Evita que el patrón desplegable o el plugin gráfico R105 dejen canvases ocultos/vacíos.
 * - Reconstruye ambos gráficos con Chart.js usando los datos ya calculados por Forecast.
 */
(()=>{
  'use strict';
  const BUILD='20260925-r121-forecast-visible-charts';
  if(window.__STAINHER_CONTRACT_FORECAST_R121__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R121__=BUILD;

  const PALETTE=[
    '#60a5fa','#34d399','#f59e0b','#a78bfa','#f472b6','#38bdf8',
    '#22c55e','#eab308','#8b5cf6','#fb7185','#60a5fa','#34d399'
  ];
  let timer=0;

  function pageActive(){
    return window.state?.contractTab==='forecast'&&!!document.getElementById('forecastBody');
  }

  function disableLegacyPlugin(){
    const C=window.Chart;
    if(!C?.unregister)return;
    let plugin=null;
    try{plugin=C.registry?.plugins?.get?.('stainherForecastBarsR105')||C.registry?.getPlugin?.('stainherForecastBarsR105')||null}catch(_){}
    if(plugin){
      try{C.unregister(plugin)}catch(_){}
    }
  }

  function removeDuplicateRefresh(){
    const year=document.getElementById('forecastYear');
    const toolbar=year?.closest('.toolbar,.actions,.row-between');
    if(!toolbar)return false;
    const buttons=[...toolbar.querySelectorAll('button')];
    const duplicate=buttons.find(button=>{
      const label=String(button.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      const action=String(button.getAttribute('onclick')||'').toLowerCase();
      return label==='actualizar'&&action.includes('loadforecast');
    });
    duplicate?.remove();
    return Boolean(duplicate);
  }

  function protectChartPanels(){
    ['forecastChartV8','forecastRealChartV8'].forEach(id=>{
      const canvas=document.getElementById(id);if(!canvas)return;
      const panel=canvas.closest('.panel,details');
      if(!panel)return;
      if(panel.tagName==='DETAILS'){
        panel.open=true;
        panel.dataset.keepOpen='1';
        panel.addEventListener('toggle',()=>{
          if(panel.open)setTimeout(()=>resizeCharts(),0);
        },{once:false});
      }else{
        panel.dataset.noCollapse='1';
      }
      const wrap=canvas.closest('.chart-wrap');
      if(wrap){
        wrap.style.minHeight='310px';
        wrap.style.height='310px';
        wrap.style.position='relative';
      }
      canvas.style.display='block';
      canvas.style.width='100%';
      canvas.style.height='100%';
    });
  }

  function colors(){
    const light=document.documentElement.dataset.theme==='light';
    return {
      text:light?'#475467':'#aeb8c5',
      legend:light?'#344054':'#cbd5e1',
      grid:light?'rgba(71,84,103,.15)':'rgba(148,163,184,.12)'
    };
  }

  function fmt(value){
    if(typeof window.fmtCLP==='function')return window.fmtCLP(value);
    return '$'+Math.round(Number(value)||0).toLocaleString('es-CL');
  }

  function destroyCanvasChart(canvas,key){
    const charts=window.state?.charts;
    try{charts?.[key]?.destroy?.()}catch(_){}
    try{
      const existing=window.Chart?.getChart?.(canvas);
      if(existing&&existing!==charts?.[key])existing.destroy();
    }catch(_){}
    if(charts)charts[key]=null;
  }

  function historicalSeries(f){
    const year=Number(window.state?.forecastYear||document.getElementById('forecastYear')?.value||new Date().getFullYear());
    return (f.months||[]).map((month,index)=>{
      const corrected=Number.isFinite(Number(month?.__r122Projectable))?Number(month.__r122Projectable):Number(month?.real)||0;
      try{
        if(typeof window.forecastHistoricalStatusV92==='function'){
          const status=window.forecastHistoricalStatusV92(year,index+1);
          return status?.historical&&month?.ep?corrected:null;
        }
      }catch(_){}
      return month?.ep?corrected:null;
    });
  }

  function rebuildCharts(){
    if(!pageActive())return false;
    const C=window.Chart,f=window.state?.forecastDataV8;
    const monthly=document.getElementById('forecastChartV8');
    const real=document.getElementById('forecastRealChartV8');
    if(!C||!f?.months?.length||!monthly||!real)return false;

    disableLegacyPlugin();
    protectChartPanels();
    if(!window.state.charts)window.state.charts={};

    destroyCanvasChart(monthly,'forecast');
    destroyCanvasChart(real,'forecastReal');

    const labels=(window.MONTHS_ES||['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']).map(x=>String(x).slice(0,3));
    const theme=colors();
    const totals=f.months.map(x=>Number(x.total)||0);
    const historic=historicalSeries(f);

    window.state.charts.forecast=new C(monthly,{
      type:'bar',
      data:{labels,datasets:[{
        label:'Forecast total',
        data:totals,
        backgroundColor:totals.map((_,i)=>PALETTE[i%PALETTE.length]),
        borderColor:totals.map((_,i)=>PALETTE[i%PALETTE.length]),
        borderWidth:1.2,
        borderRadius:4,
        maxBarThickness:52
      }]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        animation:false,
        animations:false,
        resizeDelay:0,
        layout:{padding:{top:12,left:6,right:6,bottom:2}},
        scales:{
          x:{ticks:{color:theme.text,autoSkip:false,maxRotation:0,minRotation:0},grid:{display:false}},
          y:{beginAtZero:true,ticks:{color:theme.text,callback:v=>fmt(v)},grid:{color:theme.grid}}
        },
        plugins:{
          legend:{display:false},
          tooltip:{callbacks:{label:c=>` Total: ${fmt(c.raw)}`}}
        }
      }
    });

    window.state.charts.forecastReal=new C(real,{
      type:'line',
      data:{labels,datasets:[
        {
          label:'Forecast proyectable',
          data:totals,
          borderColor:'#38bdf8',
          backgroundColor:'rgba(56,189,248,.12)',
          pointBackgroundColor:'#38bdf8',
          pointRadius:3,
          borderWidth:2.5,
          tension:.25,
          spanGaps:false
        },
        {
          label:'EDP real histórico',
          data:historic,
          borderColor:'#34d399',
          backgroundColor:'rgba(52,211,153,.12)',
          pointBackgroundColor:'#34d399',
          pointRadius:4,
          borderWidth:2.5,
          tension:.25,
          spanGaps:false
        }
      ]},
      options:{
        responsive:true,
        maintainAspectRatio:false,
        animation:false,
        animations:false,
        resizeDelay:0,
        scales:{
          x:{ticks:{color:theme.text},grid:{display:false}},
          y:{beginAtZero:true,ticks:{color:theme.text,callback:v=>fmt(v)},grid:{color:theme.grid}}
        },
        plugins:{
          legend:{labels:{color:theme.legend}},
          tooltip:{callbacks:{label:c=>` ${c.dataset.label}: ${fmt(c.raw)}`}}
        }
      }
    });

    requestAnimationFrame(()=>resizeCharts());
    return true;
  }

  function resizeCharts(){
    if(!pageActive())return false;
    let ok=false;
    for(const key of ['forecast','forecastReal']){
      const chart=window.state?.charts?.[key];
      if(!chart)continue;
      try{chart.resize();chart.update('none');ok=true}catch(_){}
    }
    return ok;
  }

  function repair(){
    if(!pageActive())return false;
    removeDuplicateRefresh();
    protectChartPanels();
    return rebuildCharts();
  }

  function settle(){
    clearTimeout(timer);
    const run=()=>{try{repair()}catch(error){console.error('[Stainher Forecast R121]',error)}};
    requestAnimationFrame(()=>requestAnimationFrame(run));
    setTimeout(run,100);
    timer=setTimeout(run,340);
  }

  function wrapRender(){
    const current=window.renderForecastBodyV9;
    if(typeof current!=='function')return false;
    if(current.__r121)return true;
    const wrapped=function(){
      disableLegacyPlugin();
      let out;
      try{out=current.apply(this,arguments)}
      catch(error){
        console.error('[Stainher Forecast R121] Render histórico interrumpido; se aplicará reparación final.',error);
      }
      removeDuplicateRefresh();
      protectChartPanels();
      settle();
      return out;
    };
    wrapped.__r121=true;wrapped.__base=current;
    window.renderForecastBodyV9=wrapped;
    try{renderForecastBodyV9=wrapped}catch(_){}
    return true;
  }

  function wrapLoad(){
    const current=window.loadForecastV9;
    if(typeof current!=='function')return false;
    if(current.__r121)return true;
    const wrapped=async function(){
      disableLegacyPlugin();
      let out;
      try{out=await current.apply(this,arguments)}
      catch(error){
        console.error('[Stainher Forecast R121] Carga histórica interrumpida; se aplicará reparación final.',error);
      }
      removeDuplicateRefresh();
      protectChartPanels();
      settle();
      return out;
    };
    wrapped.__r121=true;wrapped.__base=current;
    window.loadForecastV9=wrapped;
    try{loadForecastV9=wrapped}catch(_){}
    return true;
  }

  function install(){
    disableLegacyPlugin();
    const a=wrapRender(),b=wrapLoad();
    if(pageActive())settle();
    return a||b;
  }

  function boot(){
    install();
    let tries=0;
    const wait=setInterval(()=>{
      tries++;
      if((wrapRender()&&wrapLoad())||tries>=80){
        clearInterval(wait);
        if(pageActive())settle();
      }
    },125);
    window.addEventListener('stainher:modules-ready',install);
    window.addEventListener('stainher:runtime-r121-ready',()=>{install();settle()});
    document.addEventListener('toggle',event=>{
      const details=event.target;
      if(details?.open&&details.querySelector?.('#forecastChartV8,#forecastRealChartV8'))setTimeout(resizeCharts,0);
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR121=Object.freeze({install,repair,rebuildCharts,resizeCharts,removeDuplicateRefresh});
})();