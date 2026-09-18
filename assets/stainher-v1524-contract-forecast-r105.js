/* Stainher V15.24 · R105 · barras Forecast trazadas desde la escala real.
 * Sustituye solo el dibujo de state.charts.forecast. Los datos, cálculos,
 * tooltips y el gráfico Forecast vs EDP real histórico permanecen intactos.
 */
(()=>{
  'use strict';
  const BUILD='20260918-r105-monthly-bars-scale-render';
  if(window.__STAINHER_CONTRACT_FORECAST_R105__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R105__=BUILD;

  const palette=[
    '#60a5fa','#34d399','#f59e0b','#a78bfa','#f472b6','#38bdf8',
    '#22c55e','#eab308','#8b5cf6','#fb7185','#60a5fa','#34d399'
  ];

  const isMonthlyForecast=chart=>chart&&(
    chart===window.state?.charts?.forecast||chart.canvas?.id==='forecastChartV8'
  );

  function compactValue(value,mobile){
    const n=Number(value)||0;
    if(mobile&&Math.abs(n)>=1000000)return '$'+Math.round(n/1000000)+'M';
    if(typeof window.fmtCLPChartV91==='function')return window.fmtCLPChartV91(n);
    return '$'+Math.round(n).toLocaleString('es-CL');
  }

  function barWidth(chart,meta){
    const bars=meta?.data||[];
    if(bars.length>1){
      const step=Math.abs(Number(bars[1].x)-Number(bars[0].x));
      if(Number.isFinite(step)&&step>0)return Math.max(8,Math.min(52,step*.68));
    }
    const area=chart.chartArea;
    return Math.max(8,Math.min(52,(area.right-area.left)/18));
  }

  function roundedBar(ctx,x,y,width,height,radius){
    const top=Math.min(y,y+height),h=Math.abs(height),left=x-width/2;
    if(!h||!width)return;
    const r=Math.max(0,Math.min(radius,width/2,h/2));
    ctx.beginPath();
    ctx.moveTo(left,top+h);
    ctx.lineTo(left,top+r);
    ctx.quadraticCurveTo(left,top,left+r,top);
    ctx.lineTo(left+width-r,top);
    ctx.quadraticCurveTo(left+width,top,left+width,top+r);
    ctx.lineTo(left+width,top+h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  }

  const renderPlugin={
    id:'stainherForecastBarsR105',
    beforeDatasetsDraw(chart){
      if(!isMonthlyForecast(chart))return;
      const dataset=chart.data?.datasets?.[0],meta=chart.getDatasetMeta?.(0);
      const xScale=chart.scales?.x,yScale=chart.scales?.y,area=chart.chartArea;
      if(!dataset||!meta?.data?.length||!xScale||!yScale||!area)return;

      // La barra nativa queda transparente. El tooltip conserva el mismo dataset.
      meta.data.forEach(bar=>{
        if(!bar.options)return;
        bar.options.backgroundColor='rgba(0,0,0,0)';
        bar.options.borderColor='rgba(0,0,0,0)';
        bar.options.borderWidth=0;
      });

      const ctx=chart.ctx,width=barWidth(chart,meta);
      const base=Math.min(area.bottom,Math.max(area.top,yScale.getPixelForValue(0)));
      ctx.save();
      ctx.beginPath();ctx.rect(area.left,area.top,area.right-area.left,area.bottom-area.top);ctx.clip();
      meta.data.forEach((bar,i)=>{
        const value=Number(dataset.data?.[i])||0;
        if(value<=0)return;
        const x=Number.isFinite(Number(bar.x))?Number(bar.x):xScale.getPixelForValue(i);
        const y=Math.min(area.bottom,Math.max(area.top,yScale.getPixelForValue(value)));
        const color=palette[i%palette.length];
        ctx.fillStyle=color;
        ctx.strokeStyle=color;
        ctx.lineWidth=1;
        roundedBar(ctx,x,y,width,base-y,4);
      });
      ctx.restore();
    },
    afterDatasetsDraw(chart){
      if(!isMonthlyForecast(chart))return;
      const dataset=chart.data?.datasets?.[0],meta=chart.getDatasetMeta?.(0);
      const yScale=chart.scales?.y,area=chart.chartArea;
      if(!dataset||!meta?.data?.length||!yScale||!area)return;
      const mobile=chart.width<640,ctx=chart.ctx;
      ctx.save();
      ctx.fillStyle='#f8fafc';
      ctx.font=`700 ${mobile?9:11}px Arial`;
      ctx.textAlign='center';ctx.textBaseline='bottom';
      meta.data.forEach((bar,i)=>{
        const value=Number(dataset.data?.[i])||0;
        if(value<=0)return;
        const y=Math.max(area.top+10,yScale.getPixelForValue(value)-6);
        ctx.fillText(compactValue(value,mobile),bar.x,y);
      });
      ctx.restore();
    }
  };

  function removeLegacyLabels(chart){
    const plugins=chart?.config?.plugins;
    if(!Array.isArray(plugins))return;
    for(let i=plugins.length-1;i>=0;i--){
      if(plugins[i]?.id==='forecastTotalLabelsV9')plugins.splice(i,1);
    }
    try{chart._plugins?.invalidate?.()}catch(_){}
  }

  function configure(){
    const chart=window.state?.charts?.forecast;
    if(!isMonthlyForecast(chart))return false;
    removeLegacyLabels(chart);
    chart.options=chart.options||{};
    chart.options.animation=false;
    chart.options.animations=false;
    const xTicks=chart.options.scales?.x?.ticks;
    if(xTicks){xTicks.font={...(xTicks.font||{}),size:chart.width<640?9:11};xTicks.padding=4}
    const yTicks=chart.options.scales?.y?.ticks;
    if(yTicks)yTicks.font={...(yTicks.font||{}),size:chart.width<640?9:11};
    const tooltip=chart.options.plugins?.tooltip;
    if(tooltip){
      tooltip.callbacks=tooltip.callbacks||{};
      tooltip.callbacks.labelColor=context=>{
        const color=palette[(context.dataIndex||0)%palette.length];
        return {backgroundColor:color,borderColor:color,borderWidth:1};
      };
    }
    try{chart.update?.('none')}catch(_){try{chart.draw?.()}catch(__){}}
    return true;
  }

  function settle(){
    const run=()=>configure();
    run();
    requestAnimationFrame(()=>requestAnimationFrame(run));
    setTimeout(run,90);
    setTimeout(run,240);
  }

  function wrap(name){
    const current=window[name];
    if(typeof current!=='function')return false;
    if(current.__r105)return true;
    const wrapped=name==='loadForecastV9'?async function(){
      const out=await current.apply(this,arguments);settle();return out;
    }:function(){
      const out=current.apply(this,arguments);settle();return out;
    };
    wrapped.__r105=true;wrapped.__base=current;
    window[name]=wrapped;
    try{if(name==='loadForecastV9')loadForecastV9=wrapped;else renderForecastBodyV9=wrapped}catch(_){}
    return true;
  }

  function install(){
    if(window.Chart?.register)window.Chart.register(renderPlugin);
    const a=wrap('renderForecastBodyV9'),b=wrap('loadForecastV9');
    if(window.state?.contractTab==='forecast')settle();
    return a||b;
  }

  function boot(){
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const ok=install();
      if((ok&&configure())||tries>=120)clearInterval(timer);
    },125);
    ['stainher:modules-ready','stainher:contract-forecast-r104-ready'].forEach(ev=>window.addEventListener(ev,install));
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.StainherContractForecastR105=Object.freeze({install,configure,settle});
})();
