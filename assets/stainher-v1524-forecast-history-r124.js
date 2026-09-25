/* Stainher V15.24 · R124 · Resumen Mensual Histórico visible en Forecast.
 * - Garantiza que el bloque histórico exista después de los gráficos.
 * - Reconstruye el resumen cuando una capa posterior de Forecast lo omite.
 * - Usa el desglose R122 y mantiene el selector mensual.
 */
(()=>{
  'use strict';
  const BUILD='20260925-r124-forecast-history-visible';
  if(window.__STAINHER_FORECAST_HISTORY_R124__===BUILD)return;
  window.__STAINHER_FORECAST_HISTORY_R124__=BUILD;

  const STYLE_ID='stainher-forecast-history-r124-style';
  const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const GROUPS=[
    ['3700','Nodo 3700'],
    ['asea','HUINCHE ASEA (Concentradora)'],
    ['otis','HUINCHE OTIS'],
    ['alimak','HUINCHE ALIMAK'],
    ['ptp','Huinche Tercer Panel (PTP)'],
    ['eila','Ascensor EILA 1 y 2'],
    ['hilton','Montacargas Hilton (EQUIPOS 2 Y 3)']
  ];
  let observer=null,scheduled=false;

  function active(){
    return window.state?.contractTab==='forecast'&&!!document.getElementById('forecastBody');
  }
  function money(v){
    if(typeof window.fmtCLP==='function')return window.fmtCLP(v);
    return '$'+Math.round(Number(v)||0).toLocaleString('es-CL');
  }
  function esc(v){
    return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }
  function mountStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #forecastBody .r124-history-panel{display:block!important;visibility:visible!important;opacity:1!important;margin-top:16px!important}
      #forecastBody .r124-history-panel[hidden]{display:block!important}
      #forecastBody .r124-history-panel .r124-history-head{display:flex!important;justify-content:space-between!important;gap:12px!important;align-items:center!important;flex-wrap:wrap!important}
      #forecastBody .r124-history-panel .r124-history-head h3{margin:0!important}
      #forecastBody .r124-history-panel .forecast-history-summary-v92{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px!important;margin:12px 0 8px!important}
      #forecastBody .r124-history-panel .forecast-history-summary-v92 span{border:1px solid var(--line,#334155)!important;border-radius:10px!important;padding:10px!important;background:var(--panel2,#0f151c)!important;color:var(--muted,#94a3b8)!important;font-size:11px!important}
      #forecastBody .r124-history-panel .forecast-history-summary-v92 b{display:block!important;color:var(--text,#fff)!important;font-size:16px!important;margin-top:4px!important}
      #forecastBody .r124-history-panel .forecast-history-delta-v92{text-align:right!important;margin:4px 0 12px!important;color:var(--muted,#94a3b8)!important;font-size:12px!important}
      #forecastBody .r124-history-panel .forecast-tables-v9{display:grid!important;grid-template-columns:1fr 1fr!important;gap:18px!important;margin-top:14px!important}
      #forecastBody .r124-history-panel .admin-table{min-width:0!important}
      #forecastBody .r124-history-panel table{width:100%!important}
      @media(max-width:900px){
        #forecastBody .r124-history-panel .forecast-history-summary-v92{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #forecastBody .r124-history-panel .forecast-tables-v9{grid-template-columns:1fr!important}
      }
      @media(max-width:560px){
        #forecastBody .r124-history-panel .forecast-history-summary-v92{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(style);
  }

  function edps(){
    return Array.isArray(window.state?.contractData?.edp)?window.state.contractData.edp:[];
  }
  function epFor(year,month){
    return edps().find(ep=>Number(ep.anio_edp)===Number(year)&&Number(ep.mes_edp)===Number(month))||null;
  }
  function split(ep){
    const api=window.StainherEdpEquipmentR122;
    if(api?.splitReal)return api.splitReal(ep);
    if(!ep)return {equipment:0,operational:0,ggrr:0,projectable:0,total:0,hasDetail:false,source:'none'};
    const total=Math.max(0,Number(ep.total_neto)||0);
    const ggrr=Math.max(0,Number(ep.gastos_reembolsables)||0);
    const equipment=Math.max(0,Number(ep.mantenimiento)||0);
    const operational=Math.max(0,total-ggrr-equipment);
    return {equipment,operational,ggrr,projectable:equipment+operational,total,hasDetail:false,source:'residual'};
  }
  function details(epId){
    const api=window.StainherEdpEquipmentR122;
    if(api?.detailsFor)return api.detailsFor(epId)||[];
    return Array.isArray(window.state?.contractData?.edpEquipoDetalles)
      ?window.state.contractData.edpEquipoDetalles.filter(x=>String(x.estado_pago_id)===String(epId))
      :[];
  }

  function findHistoryPanel(body){
    return [...body.querySelectorAll('.panel,section,details')].find(node=>/Resumen Mensual Hist[oó]rico/i.test(node.textContent||''))||null;
  }
  function anchorAfterCharts(body){
    const monthly=document.getElementById('forecastChartV8');
    const compare=document.getElementById('forecastRealChartV8');
    const candidates=[monthly?.closest('.two-col'),compare?.closest('.two-col')].filter(Boolean);
    return candidates[0]||body.querySelector('.two-col')||body.lastElementChild;
  }

  function render(){
    if(!active())return false;
    mountStyle();
    const body=document.getElementById('forecastBody');
    const year=Number(window.state?.forecastYear||document.getElementById('forecastYear')?.value||new Date().getFullYear());
    const month=Math.min(12,Math.max(1,Number(window.state?.forecastMonth||new Date().getMonth()+1)));
    const ep=epFor(year,month);
    const s=split(ep);
    const fmonth=window.state?.forecastDataV8?.months?.[month-1];
    const delta=ep?s.projectable-Number(fmonth?.total||0):0;

    let panel=findHistoryPanel(body);
    if(!panel){
      panel=document.createElement('section');
      panel.className='panel r124-history-panel';
      panel.dataset.noCollapse='1';
      const anchor=anchorAfterCharts(body);
      if(anchor)anchor.insertAdjacentElement('afterend',panel);else body.appendChild(panel);
    }else{
      panel.classList.add('r124-history-panel');
      panel.dataset.noCollapse='1';
      panel.removeAttribute('hidden');
      panel.style.display='block';
      const anchor=anchorAfterCharts(body);
      if(anchor&&panel.previousElementSibling!==anchor)anchor.insertAdjacentElement('afterend',panel);
    }

    const monthOptions=MONTHS.map((name,i)=>`<option value="${i+1}" ${i+1===month?'selected':''}>${name}</option>`).join('');

    if(!ep){
      panel.innerHTML=`
        <div class="r124-history-head">
          <div><h3>Resumen Mensual Histórico</h3><small class="muted">Solo información real de Estados de Pago cerrados.</small></div>
          <select class="field" data-r124-month>${monthOptions}</select>
        </div>
        <div class="notice">No existe un Estado de Pago cargado para ${esc(MONTHS[month-1])} ${year}.</div>`;
    }else{
      const rows=details(ep.id);
      const eqRows=rows.length
        ?GROUPS.map(([code,label])=>{
            const item=rows.find(x=>String(x.grupo_codigo)===code);
            return `<tr><td>${esc(label)}</td><td class="money-cell-v8" style="text-align:right">${money(item?.monto||0)}</td></tr>`;
          }).join('')+`<tr class="forecast-total-v9"><td><b>Total mantenimiento equipos</b></td><td class="money-cell-v8" style="text-align:right"><b>${money(s.equipment)}</b></td></tr>`
        :`<tr><td colspan="2" class="empty">Sin desglose histórico por equipo cargado para este EDP. ${window.StainherEdpEquipmentR122?'Ingresa el detalle desde Estados de Pago.':''}</td></tr>`;

      panel.innerHTML=`
        <div class="r124-history-head">
          <div><h3>Resumen Mensual Histórico</h3><small class="muted">Solo información real de Estados de Pago cerrados.</small></div>
          <select class="field" data-r124-month>${monthOptions}</select>
        </div>
        <div class="forecast-history-summary-v92">
          <span>Mantenimiento real <b>${money(s.equipment)}</b></span>
          <span>Gasto Operativo / General real <b>${money(s.operational)}</b></span>
          <span>Total real proyectable <b>${money(s.projectable)}</b></span>
          <span>GGRR real <b>${money(s.ggrr)}</b></span>
          <span>Total Neto real <b>${money(s.total)}</b></span>
        </div>
        <div class="forecast-history-delta-v92">Desviación histórica vs Forecast: <b>${money(delta)}</b></div>
        <div class="notice r122-forecast-history-note"><b>Conciliación R122:</b> el resumen usa el desglose real guardado en el Estado de Pago. Cuando no existe detalle por equipo, Mantenimiento se toma desde el EDP y el Gasto Operativo / General se obtiene por diferencia contra Total Neto y GGRR.</div>
        <div class="forecast-tables-v9">
          <div class="admin-table">
            <h3>Resumen histórico por equipo</h3>
            <table><thead><tr><th>Equipo</th><th style="text-align:right">Real</th></tr></thead><tbody>${eqRows}</tbody></table>
          </div>
          <div class="admin-table">
            <h3>Resumen histórico por partida</h3>
            <table><thead><tr><th>Partida</th><th style="text-align:right">Real</th></tr></thead><tbody>
              <tr><td>Mantenimiento equipos</td><td class="money-cell-v8" style="text-align:right">${money(s.equipment)}</td></tr>
              <tr><td>Gasto Operativo / General</td><td class="money-cell-v8" style="text-align:right">${money(s.operational)}</td></tr>
              <tr><td>GGRR</td><td class="money-cell-v8" style="text-align:right">${money(s.ggrr)}</td></tr>
              <tr class="forecast-total-v9"><td><b>Total Neto real</b></td><td class="money-cell-v8" style="text-align:right"><b>${money(s.total)}</b></td></tr>
            </tbody></table>
          </div>
        </div>`;
    }

    panel.querySelector('[data-r124-month]')?.addEventListener('change',event=>{
      window.state.forecastMonth=Number(event.target.value);
      render();
    });
    return true;
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      render();
      setTimeout(render,100);
      setTimeout(render,400);
    });
  }

  function wrap(name){
    const current=window[name];
    if(typeof current!=='function'||current.__r124)return false;
    const wrapped=name==='loadForecastV9'?async function(){
      const out=await current.apply(this,arguments);
      schedule();
      return out;
    }:function(){
      const out=current.apply(this,arguments);
      schedule();
      return out;
    };
    wrapped.__r124=true;wrapped.__base=current;
    window[name]=wrapped;
    try{
      if(name==='loadForecastV9')loadForecastV9=wrapped;
      if(name==='renderForecastBodyV9')renderForecastBodyV9=wrapped;
    }catch(_){}
    return true;
  }

  function install(){
    mountStyle();
    wrap('loadForecastV9');
    wrap('renderForecastBodyV9');
    if(active())schedule();
    if(!observer){
      const host=document.getElementById('page-contrato')||document.body;
      observer=new MutationObserver(()=>{if(active())schedule()});
      observer.observe(host,{childList:true,subtree:true});
    }
  }

  function boot(){
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      install();
      if(tries>=60)clearInterval(timer);
    },150);
    window.addEventListener('stainher:modules-ready',install);
    window.addEventListener('stainher:runtime-r124-ready',()=>{install();schedule()});
  }

  window.StainherForecastHistoryR124=Object.freeze({install,render});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();