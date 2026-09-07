/* Stainher App V15.24 r19 · gráficos de Confiabilidad legibles en ambos temas. */
(()=>{
  'use strict';
  if(window.__STAINHER_RELIABILITY_CHARTS_R19__)return;
  window.__STAINHER_RELIABILITY_CHARTS_R19__=true;
  document.documentElement.dataset.stainherReliabilityCharts='r19';

  const IDS=new Set(['chartEq','chartHours','chartTrend']);
  const STATE_KEYS={chartEq:'a',chartHours:'b',chartTrend:'c'};
  let timer=0;

  function theme(){return document.documentElement.dataset.theme==='light'?'light':'dark'}
  function chartFor(canvas){
    if(!canvas||!window.Chart)return null;
    const direct=typeof Chart.getChart==='function'?Chart.getChart(canvas):null;
    return direct||window.state?.charts?.[STATE_KEYS[canvas.id]]||Object.values(Chart.instances||{}).find(chart=>chart?.canvas===canvas)||null;
  }
  function palette(id,light){
    if(id==='chartHours')return light?{fill:'#55a98c',border:'#286f5d'}:{fill:'#20d49a',border:'#b4f8df'};
    if(id==='chartTrend')return light?{fill:'rgba(49,112,181,.18)',border:'#316fae'}:{fill:'rgba(103,190,255,.20)',border:'#7dd3fc'};
    return light?{fill:'#5798d0',border:'#2d6698'}:{fill:'#319bea',border:'#bae3ff'};
  }
  function styleChart(canvas,forcedTheme){
    const chart=chartFor(canvas);if(!chart)return false;
    const light=(forcedTheme||theme())==='light',colors=palette(canvas.id,light);
    for(const dataset of chart.data?.datasets||[]){
      const line=(chart.config?.type==='line'||dataset.type==='line');
      const count=Math.max(dataset.data?.length||1,1);
      dataset.backgroundColor=line?colors.fill:Array(count).fill(colors.fill);
      dataset.borderColor=line?colors.border:Array(count).fill(colors.border);
      dataset.borderWidth=line?3:1.5;
      if(line){dataset.pointBackgroundColor=colors.border;dataset.pointBorderColor=light?'#fff':'#07111b';dataset.pointRadius=4;dataset.pointHoverRadius=6;dataset.tension=.25}
      else{dataset.hoverBackgroundColor=Array(count).fill(colors.border);dataset.borderRadius=5;dataset.maxBarThickness=72}
    }
    const text=light?'#475467':'#d6e2ef',grid=light?'rgba(71,84,103,.16)':'rgba(151,177,204,.24)';
    for(const scale of Object.values(chart.options?.scales||{})){
      scale.ticks={...(scale.ticks||{}),color:text};
      scale.grid={...(scale.grid||{}),color:grid};
      scale.border={...(scale.border||{}),color:grid};
    }
    try{
      chart.resize();chart.update('none');
      for(const meta of chart.getDatasetMeta?.(0)?.data||[]){meta.options.backgroundColor=colors.fill;meta.options.borderColor=colors.border;meta.options.borderWidth=1.5}
      chart.draw?.();
    }catch(error){console.warn('[Confiabilidad gráficos]',error)}
    canvas.dataset.stainherChartContrast=light?'light':'dark';
    return true;
  }
  function refresh(forcedTheme){
    let pending=false;
    IDS.forEach(id=>{const canvas=document.getElementById(id);if(canvas&&!styleChart(canvas,forcedTheme))pending=true});
    return pending;
  }
  function schedule(){
    clearTimeout(timer);
    requestAnimationFrame(()=>refresh());
    timer=setTimeout(()=>{refresh();setTimeout(refresh,240);setTimeout(refresh,900)},90);
  }

  function wrapRender(name){
    const original=window[name];if(typeof original!=='function'||original.__r19ReliabilityCharts)return;
    const wrapped=function(){const result=original.apply(this,arguments);Promise.resolve(result).finally(schedule);return result};
    wrapped.__r19ReliabilityCharts=true;wrapped.__base=original;window[name]=wrapped;
  }

  new MutationObserver(records=>{if(records.some(record=>[...record.addedNodes].some(node=>node.nodeType===1&&(IDS.has(node.id)||[...IDS].some(id=>node.querySelector?.(`#${id}`))))))schedule()}).observe(document.body,{childList:true,subtree:true});
  document.addEventListener('toggle',event=>{const details=event.target;if(details?.open&&details.querySelector?.('canvas'))setTimeout(schedule,0)},true);
  window.addEventListener('stainher:theme-change',schedule);
  window.addEventListener('resize',schedule,{passive:true});
  wrapRender('renderCorrectivo');wrapRender('loadCorrectivo');
  window.StainherReliabilityCharts=Object.freeze({refresh:()=>{refresh();return true},preparePdf:()=>{refresh('light');return true},schedule});
  schedule();
})();
