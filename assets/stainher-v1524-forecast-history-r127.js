/* Stainher V15.24 · R127 · Resumen Mensual Histórico estable y rápido.
 * - Corrige el cierre instantáneo del selector mensual causado por rerender recursivo.
 * - Elimina el MutationObserver global de R124.
 * - Renderiza el resumen solo cuando cambia el Forecast, el EDP o el mes.
 * - Conserva conciliación R122, tablas por equipo/partida y ubicación bajo gráficos.
 */
(()=>{
  'use strict';
  const BUILD='20260928-r127-forecast-history-selector-stable';
  if(window.__STAINHER_FORECAST_HISTORY_R127__===BUILD)return;
  window.__STAINHER_FORECAST_HISTORY_R127__=BUILD;

  const STYLE_ID='stainher-forecast-history-r127-style';
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
  let installed=false;
  let pending=false;
  let lastSignature='';

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
      #forecastBody .r127-history-panel{display:block!important;visibility:visible!important;opacity:1!important;margin-top:16px!important}
      #forecastBody .r127-history-panel .r127-history-head{display:flex!important;justify-content:space-between!important;gap:12px!important;align-items:center!important;flex-wrap:wrap!important}
      #forecastBody .r127-history-panel .r127-history-head h3{margin:0!important}
      #forecastBody .r127-history-panel .forecast-history-summary-v92{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px!important;margin:12px 0 8px!important}
      #forecastBody .r127-history-panel .forecast-history-summary-v92 span{border:1px solid var(--line,#334155)!important;border-radius:10px!important;padding:10px!important;background:var(--panel2,#0f151c)!important;color:var(--muted,#94a3b8)!important;font-size:11px!important}
      #forecastBody .r127-history-panel .forecast-history-summary-v92 b{display:block!important;color:var(--text,#fff)!important;font-size:16px!important;margin-top:4px!important}
      #forecastBody .r127-history-panel .forecast-history-delta-v92{text-align:right!important;margin:4px 0 12px!important;color:var(--muted,#94a3b8)!important;font-size:12px!important}
      #forecastBody .r127-history-panel .forecast-tables-v9{display:grid!important;grid-template-columns:1fr 1fr!important;gap:18px!important;margin-top:14px!important}
      #forecastBody .r127-history-panel .admin-table{min-width:0!important}
      #forecastBody .r127-history-panel table{width:100%!important}
      @media(max-width:900px){
        #forecastBody .r127-history-panel .forecast-history-summary-v92{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #forecastBody .r127-history-panel .forecast-tables-v9{grid-template-columns:1fr!important}
      }
      @media(max-width:560px){
        #forecastBody .r127-history-panel .forecast-history-summary-v92{grid-template-columns:1fr!important}
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

  function anchorAfterCharts(body){
    const monthly=document.getElementById('forecastChartV8');
    const compare=document.getElementById('forecastRealChartV8');
    return monthly?.closest('.two-col')||compare?.closest('.two-col')||body.querySelector('.two-col')||body.lastElementChild;
  }

  function findPanel(body){
    return body.querySelector('.r127-history-panel')
      ||[...body.querySelectorAll('.panel,section,details')].find(node=>/Resumen Mensual Hist[oó]rico/i.test(node.textContent||''))
      ||null;
  }

  function signature(year,month,ep,s,rows){
    const fmonth=window.state?.forecastDataV8?.months?.[month-1];
    return JSON.stringify([
      year,month,ep?.id||'',ep?.updated_at||'',s.equipment,s.operational,s.ggrr,s.total,
      Number(fmonth?.total||0),
      rows.map(x=>[x.grupo_codigo,Number(x.monto||0),x.updated_at||''])
    ]);
  }

  function ensurePanel(body){
    let panel=findPanel(body);
    const anchor=anchorAfterCharts(body);
    if(!panel){
      panel=document.createElement('section');
      panel.className='panel r127-history-panel';
      panel.dataset.noCollapse='1';
      if(anchor)anchor.insertAdjacentElement('afterend',panel);else body.appendChild(panel);
    }else{
      panel.classList.remove('r124-history-panel');
      panel.classList.add('r127-history-panel');
      panel.dataset.noCollapse='1';
      panel.removeAttribute('hidden');
      panel.style.display='block';
      if(anchor&&panel.previousElementSibling!==anchor)anchor.insertAdjacentElement('afterend',panel);
    }
    return panel;
  }

  function bindMonth(panel){
    const select=panel.querySelector('[data-r127-month]');
    if(!select||select.dataset.r127Bound==='1')return;
    select.dataset.r127Bound='1';
    select.addEventListener('change',event=>{
      const next=Number(event.target.value);
      if(!Number.isFinite(next)||next<1||next>12)return;
      window.state.forecastMonth=next;
      lastSignature='';
      render(true);
    });
  }

  function render(force=false){
    if(!active())return false;
    mountStyle();
    const body=document.getElementById('forecastBody');
    const year=Number(window.state?.forecastYear||document.getElementById('forecastYear')?.value||new Date().getFullYear());
    const month=Math.min(12,Math.max(1,Number(window.state?.forecastMonth||new Date().getMonth()+1)));
    const ep=epFor(year,month);
    const s=split(ep);
    const rows=ep?details(ep.id):[];
    const sig=signature(year,month,ep,s,rows);
    const panel=ensurePanel(body);

    // No tocar el DOM si nada cambió: esto permite mantener abierto el <select>.
    if(!force&&sig===lastSignature&&panel.querySelector('[data-r127-month]')){
      return true;
    }
    lastSignature=sig;

    const fmonth=window.state?.forecastDataV8?.months?.[month-1];
    const delta=ep?s.projectable-Number(fmonth?.total||0):0;
    const monthOptions=MONTHS.map((name,i)=>`<option value="${i+1}" ${i+1===month?'selected':''}>${name}</option>`).join('');

    if(!ep){
      panel.innerHTML=`
        <div class="r127-history-head">
          <div><h3>Resumen Mensual Histórico</h3><small class="muted">Solo información real de Estados de Pago cerrados.</small></div>
          <select class="field" data-r127-month>${monthOptions}</select>
        </div>
        <div class="notice">No existe un Estado de Pago cargado para ${esc(MONTHS[month-1])} ${year}.</div>`;
      bindMonth(panel);
      return true;
    }

    const eqRows=rows.length
      ?GROUPS.map(([code,label])=>{
          const item=rows.find(x=>String(x.grupo_codigo)===code);
          return `<tr><td>${esc(label)}</td><td class="money-cell-v8" style="text-align:right">${money(item?.monto||0)}</td></tr>`;
        }).join('')+`<tr class="forecast-total-v9"><td><b>Total mantenimiento equipos</b></td><td class="money-cell-v8" style="text-align:right"><b>${money(s.equipment)}</b></td></tr>`
      :`<tr><td colspan="2" class="empty">Sin desglose histórico por equipo cargado para este EDP. ${window.StainherEdpEquipmentR122?'Ingresa el detalle desde Estados de Pago.':''}</td></tr>`;

    panel.innerHTML=`
      <div class="r127-history-head">
        <div><h3>Resumen Mensual Histórico</h3><small class="muted">Solo información real de Estados de Pago cerrados.</small></div>
        <select class="field" data-r127-month>${monthOptions}</select>
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
    bindMonth(panel);
    return true;
  }

  function schedule(force=false){
    if(pending)return;
    pending=true;
    requestAnimationFrame(()=>{
      pending=false;
      render(force);
    });
  }

  function wrap(name){
    const current=window[name];
    if(typeof current!=='function'||current.__r127)return false;
    const wrapped=name==='loadForecastV9'?async function(){
      const out=await current.apply(this,arguments);
      lastSignature='';
      schedule(true);
      return out;
    }:function(){
      const out=current.apply(this,arguments);
      lastSignature='';
      schedule(true);
      return out;
    };
    wrapped.__r127=true;
    wrapped.__base=current;
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
    if(active())schedule(true);
  }

  function boot(){
    if(installed)return;
    installed=true;
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      const a=wrap('loadForecastV9');
      const b=wrap('renderForecastBodyV9');
      if((a&&b)||tries>=40){
        clearInterval(timer);
        if(active())schedule(true);
      }
    },125);
    window.addEventListener('stainher:modules-ready',install);
    window.addEventListener('stainher:edp-equipment-r122-ready',()=>{lastSignature='';schedule(true)});
    window.addEventListener('stainher:runtime-r127-ready',()=>{install();lastSignature='';schedule(true)});
  }

  window.StainherForecastHistoryR127=Object.freeze({install,render,schedule});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();