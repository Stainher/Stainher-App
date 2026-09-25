/* Stainher V15.24 · R123 · Forecast runtime estable.
 * - Elimina inmediatamente el botón Actualizar redundante junto al año.
 * - Mantiene como único control global el botón Actualizar de Administración del Contrato.
 * - Superpone gráficos SVG determinísticos sobre los canvases para evitar paneles vacíos.
 * - Mantiene los cálculos y datos de Forecast/R122 sin modificar su origen.
 */
(()=>{
  'use strict';
  const BUILD='20260925-r123-forecast-runtime-stable';
  if(window.__STAINHER_CONTRACT_FORECAST_R123__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R123__=BUILD;

  const STYLE_ID='stainher-contract-forecast-r123-style';
  const MONTHS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const COLORS=['#60a5fa','#34d399','#f59e0b','#a78bfa','#f472b6','#38bdf8','#22c55e','#eab308','#8b5cf6','#fb7185','#60a5fa','#34d399'];
  let scheduled=false,observer=null;

  function pageActive(){
    return window.state?.contractTab==='forecast'&&!!document.getElementById('forecastBody');
  }

  function mountStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #forecastBody .chart-wrap{position:relative!important;min-height:310px!important;height:310px!important}
      #forecastBody .chart-wrap.r123-svg-active>canvas{opacity:0!important}
      #forecastBody .r123-chart-overlay{position:absolute!important;inset:0!important;z-index:3!important;display:block!important}
      #forecastBody .r123-chart-overlay svg{display:block!important;width:100%!important;height:100%!important;overflow:visible!important}
      #forecastBody .r123-chart-empty{display:grid!important;place-items:center!important;height:100%!important;color:var(--muted,#94a3b8)!important;font-size:13px!important}
    `;
    document.head.appendChild(style);
  }

  function removeDuplicateRefresh(){
    const year=document.getElementById('forecastYear');
    const toolbar=year?.closest('.toolbar,.actions,.row-between');
    if(!toolbar)return false;
    let removed=false;
    [...toolbar.querySelectorAll('button')].forEach(button=>{
      const label=String(button.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(label==='actualizar'){
        button.remove();
        removed=true;
      }
    });
    return removed;
  }

  function compact(v){
    const n=Number(v)||0;
    const abs=Math.abs(n);
    if(abs>=1000000000)return '$'+(n/1000000000).toLocaleString('es-CL',{maximumFractionDigits:1})+'B';
    if(abs>=1000000)return '$'+(n/1000000).toLocaleString('es-CL',{maximumFractionDigits:1})+'M';
    if(abs>=1000)return '$'+(n/1000).toLocaleString('es-CL',{maximumFractionDigits:0})+'k';
    return '$'+Math.round(n).toLocaleString('es-CL');
  }

  function money(v){
    if(typeof window.fmtCLP==='function')return window.fmtCLP(v);
    return '$'+Math.round(Number(v)||0).toLocaleString('es-CL');
  }

  function esc(v){
    return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function chartSize(wrap){
    const rect=wrap.getBoundingClientRect();
    return {w:Math.max(620,Math.round(rect.width||760)),h:310};
  }

  function yScale(max,top,bottom,height){
    const span=Math.max(1,max);
    return value=>bottom-(Number(value||0)/span)*(bottom-top);
  }

  function gridSvg(max,w,h,left,right,top,bottom){
    const parts=[];
    for(let i=0;i<=4;i++){
      const ratio=i/4;
      const value=max*(1-ratio);
      const y=top+(bottom-top)*ratio;
      parts.push(`<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="rgba(148,163,184,.16)" stroke-width="1"/>`);
      parts.push(`<text x="${left-10}" y="${y+4}" text-anchor="end" fill="#94a3b8" font-size="11">${esc(compact(value))}</text>`);
    }
    return parts.join('');
  }

  function monthlySvg(values,w,h){
    const left=70,right=20,top=24,bottom=h-38;
    const max=Math.max(1,...values.map(Number))*1.12;
    const y=yScale(max,top,bottom,h);
    const inner=w-left-right,step=inner/12,bar=Math.max(14,Math.min(44,step*.58));
    const bars=values.map((value,i)=>{
      const v=Number(value)||0,x=left+step*i+step/2,yy=y(v),height=Math.max(0,bottom-yy);
      const labelY=Math.max(top+11,yy-7);
      return `<g><title>${MONTHS[i]}: ${esc(money(v))}</title><rect x="${x-bar/2}" y="${yy}" width="${bar}" height="${height}" rx="4" fill="${COLORS[i%COLORS.length]}"/><text x="${x}" y="${bottom+20}" text-anchor="middle" fill="#aeb8c5" font-size="11">${MONTHS[i]}</text>${v?`<text x="${x}" y="${labelY}" text-anchor="middle" fill="#e5edf5" font-size="10" font-weight="700">${esc(compact(v))}</text>`:''}</g>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Forecast mensual"><rect width="${w}" height="${h}" fill="transparent"/>${gridSvg(max,w,h,left,right,top,bottom)}<line x1="${left}" y1="${bottom}" x2="${w-right}" y2="${bottom}" stroke="rgba(148,163,184,.28)"/>${bars}</svg>`;
  }

  function historicalValue(month,index){
    if(!month?.ep)return null;
    try{
      if(typeof window.forecastHistoricalStatusV92==='function'){
        const year=Number(window.state?.forecastYear||new Date().getFullYear());
        const status=window.forecastHistoricalStatusV92(year,index+1);
        if(!status?.historical)return null;
      }
    }catch(_){}
    if(Number.isFinite(Number(month.__r122Projectable)))return Number(month.__r122Projectable);
    return Number(month.real)||0;
  }

  function linePath(values,xFor,yFor){
    let d='',open=false;
    values.forEach((value,i)=>{
      if(value==null||!Number.isFinite(Number(value))){open=false;return}
      const x=xFor(i),y=yFor(value);
      d+=`${open?' L':' M'} ${x} ${y}`;open=true;
    });
    return d;
  }

  function compareSvg(forecast,historical,w,h){
    const left=70,right=24,top=34,bottom=h-40;
    const nums=[...forecast,...historical.filter(v=>v!=null)].map(Number).filter(Number.isFinite);
    const max=Math.max(1,...nums)*1.12;
    const y=yScale(max,top,bottom,h),inner=w-left-right,step=inner/Math.max(1,forecast.length-1);
    const x=i=>left+step*i;
    const fp=linePath(forecast,x,y),hp=linePath(historical,x,y);
    const xLabels=MONTHS.map((m,i)=>`<text x="${x(i)}" y="${bottom+21}" text-anchor="middle" fill="#aeb8c5" font-size="11">${m}</text>`).join('');
    const fDots=forecast.map((v,i)=>`<g><title>${MONTHS[i]} Forecast: ${esc(money(v))}</title><circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#38bdf8"/></g>`).join('');
    const hDots=historical.map((v,i)=>v==null?'':`<g><title>${MONTHS[i]} EDP real: ${esc(money(v))}</title><circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#34d399"/></g>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Forecast proyectable versus EDP real histórico"><rect width="${w}" height="${h}" fill="transparent"/>${gridSvg(max,w,h,left,right,top,bottom)}<line x1="${left}" y1="${bottom}" x2="${w-right}" y2="${bottom}" stroke="rgba(148,163,184,.28)"/><g transform="translate(${left},12)"><line x1="0" y1="0" x2="28" y2="0" stroke="#38bdf8" stroke-width="3"/><text x="36" y="4" fill="#cbd5e1" font-size="11">Forecast proyectable</text><line x1="165" y1="0" x2="193" y2="0" stroke="#34d399" stroke-width="3"/><text x="201" y="4" fill="#cbd5e1" font-size="11">EDP real histórico</text></g><path d="${fp}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><path d="${hp}" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${fDots}${hDots}${xLabels}</svg>`;
  }

  function overlay(canvas,markup){
    const wrap=canvas?.closest('.chart-wrap');
    if(!wrap)return false;
    wrap.classList.add('r123-svg-active');
    wrap.querySelector('.r123-chart-overlay')?.remove();
    const node=document.createElement('div');
    node.className='r123-chart-overlay';
    node.innerHTML=markup;
    wrap.appendChild(node);
    return true;
  }

  function drawCharts(){
    if(!pageActive())return false;
    const f=window.state?.forecastDataV8;
    const monthly=document.getElementById('forecastChartV8');
    const real=document.getElementById('forecastRealChartV8');
    if(!f?.months?.length||!monthly||!real)return false;
    const forecast=f.months.map(m=>Number(m.total)||0);
    const historical=f.months.map((m,i)=>historicalValue(m,i));
    const a=chartSize(monthly.closest('.chart-wrap'));
    const b=chartSize(real.closest('.chart-wrap'));
    overlay(monthly,monthlySvg(forecast,a.w,a.h));
    overlay(real,compareSvg(forecast,historical,b.w,b.h));
    return true;
  }

  function showWatchdogMessage(){
    const body=document.getElementById('forecastBody');
    if(!body||!pageActive())return;
    const text=String(body.textContent||'');
    if(!/Calculando Forecast/i.test(text))return;
    const data=window.state?.forecastDataV8;
    if(data?.months?.length){
      try{window.renderForecastBodyV9?.()}catch(_){}
      schedule();
      return;
    }
    body.innerHTML='<div class="notice warn"><b>El Forecast está demorando más de lo esperado.</b><br>Presiona el botón general <b>↻ Actualizar</b> de Administración del Contrato para reintentar la carga.</div>';
  }

  function repair(){
    if(!pageActive())return false;
    mountStyle();
    removeDuplicateRefresh();
    drawCharts();
    return true;
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      repair();
      setTimeout(repair,80);
      setTimeout(repair,360);
      setTimeout(repair,800);
    });
  }

  function wrap(name){
    const current=window[name];
    if(typeof current!=='function'||current.__r123)return false;
    const wrapped=name==='loadForecastV9'?async function(){
      removeDuplicateRefresh();
      const out=await current.apply(this,arguments);
      schedule();
      return out;
    }:function(){
      const out=current.apply(this,arguments);
      removeDuplicateRefresh();
      schedule();
      return out;
    };
    wrapped.__r123=true;
    wrapped.__base=current;
    window[name]=wrapped;
    try{
      if(name==='loadForecastV9')loadForecastV9=wrapped;
      if(name==='renderForecastBodyV9')renderForecastBodyV9=wrapped;
      if(name==='renderContractForecastV8')renderContractForecastV8=wrapped;
    }catch(_){}
    return true;
  }

  function install(){
    mountStyle();
    wrap('renderContractForecastV8');
    wrap('loadForecastV9');
    wrap('renderForecastBodyV9');
    if(pageActive())schedule();
    if(!observer){
      const host=document.getElementById('page-contrato')||document.body;
      observer=new MutationObserver(()=>{if(pageActive())schedule()});
      observer.observe(host,{childList:true,subtree:true});
    }
  }

  function boot(){
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      install();
      if(tries>=80)clearInterval(timer);
    },125);
    setTimeout(showWatchdogMessage,8000);
    window.addEventListener('stainher:modules-ready',install);
    window.addEventListener('stainher:runtime-r123-ready',()=>{install();schedule()});
  }

  window.StainherContractForecastR123=Object.freeze({install,repair,drawCharts,removeDuplicateRefresh});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();