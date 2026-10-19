/* Stainher V15.24 · R156 · Forecast mensual visible y estable.
 * Corrige el caso donde el canvas Chart.js conserva datos/tooltips pero no pinta barras.
 * No depende de state.contractTab ni de .chart-wrap.
 * Solo superpone el gráfico mensual; no altera datos, cálculos ni gráfico comparativo.
 */
(()=>{
  'use strict';
  const BUILD='20261019-r156-forecast-monthly-overlay';
  if(window.__STAINHER_CONTRACT_FORECAST_R156__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R156__=BUILD;

  const STYLE_ID='stainher-contract-forecast-r156-style';
  const MONTHS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const COLORS=['#60a5fa','#34d399','#f59e0b','#a78bfa','#f472b6','#38bdf8','#22c55e','#eab308','#8b5cf6','#fb7185','#60a5fa','#34d399'];

  function mountStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #forecastChartV8.r156-native-hidden{opacity:0!important;pointer-events:none!important}
      .r156-forecast-host{position:relative!important;min-height:310px!important;height:310px!important}
      .r156-forecast-overlay{position:absolute!important;inset:0!important;z-index:4!important;display:block!important;pointer-events:auto!important}
      .r156-forecast-overlay svg{display:block!important;width:100%!important;height:100%!important;overflow:visible!important}
    `;
    document.head.appendChild(s);
  }

  function money(v){
    if(typeof window.fmtCLP==='function')return window.fmtCLP(v);
    return '$'+Math.round(Number(v)||0).toLocaleString('es-CL');
  }
  function compact(v){
    const n=Number(v)||0;
    if(Math.abs(n)>=1e9)return '$'+(n/1e9).toLocaleString('es-CL',{maximumFractionDigits:1})+'B';
    if(Math.abs(n)>=1e6)return '$'+(n/1e6).toLocaleString('es-CL',{maximumFractionDigits:1})+'M';
    if(Math.abs(n)>=1e3)return '$'+(n/1e3).toLocaleString('es-CL',{maximumFractionDigits:0})+'k';
    return '$'+Math.round(n).toLocaleString('es-CL');
  }
  const esc=v=>String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));

  function hostFor(canvas){
    if(!canvas)return null;
    return canvas.closest('.chart-wrap,.panel-body,.panel,details')||canvas.parentElement;
  }

  function values(){
    const months=window.state?.forecastDataV8?.months;
    if(Array.isArray(months)&&months.length>=12)return months.slice(0,12).map(m=>Number(m?.total)||0);
    const chart=window.state?.charts?.forecast;
    const data=chart?.data?.datasets?.[0]?.data;
    if(Array.isArray(data)&&data.length>=12)return data.slice(0,12).map(Number);
    return null;
  }

  function svg(vals,w,h){
    const left=72,right=18,top=30,bottom=h-42;
    const max=Math.max(1,...vals.map(Number))*1.12;
    const inner=w-left-right,step=inner/12,bar=Math.max(14,Math.min(42,step*.6));
    const y=v=>bottom-(Number(v||0)/max)*(bottom-top);
    const parts=[];
    for(let i=0;i<=5;i++){
      const ratio=i/5,yy=top+(bottom-top)*ratio,val=max*(1-ratio);
      parts.push(`<line x1="${left}" y1="${yy}" x2="${w-right}" y2="${yy}" stroke="rgba(148,163,184,.16)" stroke-width="1"/>`);
      parts.push(`<text x="${left-10}" y="${yy+4}" text-anchor="end" fill="#94a3b8" font-size="11">${esc(compact(val))}</text>`);
    }
    vals.forEach((raw,i)=>{
      const v=Number(raw)||0,x=left+step*i+step/2,yy=y(v),hh=Math.max(0,bottom-yy),color=COLORS[i%COLORS.length];
      parts.push(`<g><title>${MONTHS[i]}: ${esc(money(v))}</title><rect x="${x-bar/2}" y="${yy}" width="${bar}" height="${hh}" rx="4" fill="${color}" stroke="${color}" stroke-width="1"/><text x="${x}" y="${bottom+22}" text-anchor="middle" fill="#aeb8c5" font-size="11">${MONTHS[i]}</text>${v?`<text x="${x}" y="${Math.max(top+11,yy-7)}" text-anchor="middle" fill="#f8fafc" font-size="10" font-weight="700">${esc(compact(v))}</text>`:''}</g>`);
    });
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Forecast mensual"><rect width="${w}" height="${h}" fill="transparent"/>${parts.join('')}<line x1="${left}" y1="${bottom}" x2="${w-right}" y2="${bottom}" stroke="rgba(148,163,184,.28)"/></svg>`;
  }

  function draw(){
    mountStyle();
    const canvas=document.getElementById('forecastChartV8');
    const vals=values();
    if(!canvas||!vals)return false;
    const host=hostFor(canvas);
    if(!host)return false;
    host.classList.add('r156-forecast-host');
    host.querySelector('.r156-forecast-overlay')?.remove();
    const rect=host.getBoundingClientRect();
    const w=Math.max(620,Math.round(rect.width||760)),h=310;
    const node=document.createElement('div');
    node.className='r156-forecast-overlay';
    node.innerHTML=svg(vals,w,h);
    host.appendChild(node);
    canvas.classList.add('r156-native-hidden');
    return true;
  }

  function schedule(){
    const run=()=>draw();
    run();
    requestAnimationFrame(run);
    setTimeout(run,80);
    setTimeout(run,250);
    setTimeout(run,700);
  }

  function wrap(name){
    const current=window[name];
    if(typeof current!=='function'||current.__r156)return false;
    const wrapped=name==='loadForecastV9'?async function(){
      const out=await current.apply(this,arguments);schedule();return out;
    }:function(){
      const out=current.apply(this,arguments);schedule();return out;
    };
    wrapped.__r156=true;wrapped.__base=current;
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
    if(document.getElementById('forecastChartV8'))schedule();
  }

  function boot(){
    install();
    let tries=0;
    const t=setInterval(()=>{
      tries++;install();
      if(document.getElementById('forecastChartV8')||tries>=80)clearInterval(t);
    },125);
    ['stainher:modules-ready','stainher:contract-forecast-r123-ready','stainher:forecast-history-r128-ready'].forEach(ev=>window.addEventListener(ev,install));
  }

  window.StainherContractForecastR156=Object.freeze({install,draw,schedule});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();