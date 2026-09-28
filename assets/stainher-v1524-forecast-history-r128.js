/* Stainher V15.24 · R128 · Histórico Forecast con detalle EDP hidratado.
 * - Carga directamente el desglose del EDP seleccionado cuando el estado local aún no lo tiene.
 * - Evita mostrar "Sin desglose" mientras los datos reales existen en Supabase.
 * - Mantiene selector mensual estable de R127 sin MutationObserver global.
 * - Corrige desbordes de glosas/tablas dentro de la cuadrícula.
 */
(()=>{
  'use strict';
  const BUILD='20260928-r128-forecast-history-detail-hydration';
  if(window.__STAINHER_FORECAST_HISTORY_R128__===BUILD)return;
  window.__STAINHER_FORECAST_HISTORY_R128__=BUILD;

  const TABLE='edp_mantenimiento_equipos_v1524';
  const STYLE_ID='stainher-forecast-history-r128-style';
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
  const localDetails=new Map();
  const fetchStatus=new Map();
  const fetchPromises=new Map();

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
      #forecastBody .r128-history-panel{display:block!important;visibility:visible!important;opacity:1!important;margin-top:16px!important;overflow:hidden!important}
      #forecastBody .r128-history-panel .r128-history-head{display:flex!important;justify-content:space-between!important;gap:12px!important;align-items:center!important;flex-wrap:wrap!important}
      #forecastBody .r128-history-panel .r128-history-head h3{margin:0!important}
      #forecastBody .r128-history-panel .forecast-history-summary-v92{display:grid!important;grid-template-columns:repeat(5,minmax(0,1fr))!important;gap:10px!important;margin:12px 0 8px!important}
      #forecastBody .r128-history-panel .forecast-history-summary-v92 span{min-width:0!important;border:1px solid var(--line,#334155)!important;border-radius:10px!important;padding:10px!important;background:var(--panel2,#0f151c)!important;color:var(--muted,#94a3b8)!important;font-size:11px!important;overflow-wrap:anywhere!important}
      #forecastBody .r128-history-panel .forecast-history-summary-v92 b{display:block!important;color:var(--text,#fff)!important;font-size:16px!important;margin-top:4px!important;overflow-wrap:anywhere!important}
      #forecastBody .r128-history-panel .forecast-history-delta-v92{text-align:right!important;margin:4px 0 12px!important;color:var(--muted,#94a3b8)!important;font-size:12px!important}
      #forecastBody .r128-history-panel .r122-forecast-history-note{display:block!important;max-width:100%!important;white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important;box-sizing:border-box!important}
      #forecastBody .r128-history-panel .forecast-tables-v9{display:grid!important;grid-template-columns:minmax(0,1fr) minmax(0,1fr)!important;gap:18px!important;margin-top:14px!important;align-items:start!important}
      #forecastBody .r128-history-panel .admin-table{min-width:0!important;max-width:100%!important;overflow:hidden!important}
      #forecastBody .r128-history-panel table{width:100%!important;max-width:100%!important;table-layout:fixed!important}
      #forecastBody .r128-history-panel th,#forecastBody .r128-history-panel td{white-space:normal!important;overflow-wrap:anywhere!important;word-break:normal!important;vertical-align:top!important}
      #forecastBody .r128-history-panel td.empty{white-space:normal!important;overflow-wrap:anywhere!important;line-height:1.4!important}
      #forecastBody .r128-history-panel .r128-loading-row{color:var(--muted,#94a3b8)!important}
      @media(max-width:900px){
        #forecastBody .r128-history-panel .forecast-history-summary-v92{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #forecastBody .r128-history-panel .forecast-tables-v9{grid-template-columns:1fr!important}
      }
      @media(max-width:560px){
        #forecastBody .r128-history-panel .forecast-history-summary-v92{grid-template-columns:1fr!important}
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
  function stateDetails(epId){
    const fromR122=window.StainherEdpEquipmentR122?.detailsFor?.(epId);
    if(Array.isArray(fromR122)&&fromR122.length)return fromR122;
    const all=Array.isArray(window.state?.contractData?.edpEquipoDetalles)?window.state.contractData.edpEquipoDetalles:[];
    return all.filter(x=>String(x.estado_pago_id)===String(epId));
  }
  function details(epId){
    const local=localDetails.get(String(epId));
    if(Array.isArray(local))return local;
    return stateDetails(epId);
  }
  function split(ep,rows=ep?details(ep.id):[]){
    const api=window.StainherEdpEquipmentR122;
    if(api?.splitReal)return api.splitReal(ep,rows);
    if(!ep)return {equipment:0,operational:0,ggrr:0,projectable:0,total:0,hasDetail:false,source:'none'};
    const total=Math.max(0,Number(ep.total_neto)||0);
    const ggrr=Math.max(0,Number(ep.gastos_reembolsables)||0);
    const detailSum=(rows||[]).reduce((sum,row)=>sum+Math.max(0,Number(row.monto)||0),0);
    const equipment=rows?.length?detailSum:Math.max(0,Number(ep.mantenimiento)||0);
    const operational=Math.max(0,total-ggrr-equipment);
    return {equipment,operational,ggrr,projectable:equipment+operational,total,hasDetail:!!rows?.length,source:rows?.length?'detail':'residual'};
  }

  function mergeIntoState(epId,rows){
    if(!window.state?.contractData)return;
    const all=Array.isArray(window.state.contractData.edpEquipoDetalles)?window.state.contractData.edpEquipoDetalles:[];
    window.state.contractData.edpEquipoDetalles=[
      ...all.filter(x=>String(x.estado_pago_id)!==String(epId)),
      ...(rows||[])
    ];
  }

  async function ensureDetails(ep,{force=false}={}){
    if(!ep?.id)return [];
    const key=String(ep.id);
    const known=stateDetails(key);
    if(!force&&known.length){
      localDetails.set(key,known);
      fetchStatus.set(key,'loaded');
      return known;
    }
    if(!force&&fetchStatus.get(key)==='loaded'){
      return localDetails.get(key)||[];
    }
    if(fetchPromises.has(key))return fetchPromises.get(key);

    const client=window.sb;
    if(!client?.from)return known;

    fetchStatus.set(key,'loading');
    const promise=(async()=>{
      const q=await client.from(TABLE)
        .select('id,estado_pago_id,grupo_codigo,equipo_label,monto,updated_at')
        .eq('estado_pago_id',ep.id)
        .order('equipo_label',{ascending:true});
      if(q.error)throw q.error;
      const rows=q.data||[];
      localDetails.set(key,rows);
      mergeIntoState(key,rows);
      fetchStatus.set(key,'loaded');
      lastSignature='';
      schedule(true);
      return rows;
    })().catch(error=>{
      fetchStatus.set(key,'error');
      console.error('[Stainher Forecast Histórico R128] detalle EDP',error);
      lastSignature='';
      schedule(true);
      return [];
    }).finally(()=>fetchPromises.delete(key));

    fetchPromises.set(key,promise);
    return promise;
  }

  function anchorAfterCharts(body){
    const monthly=document.getElementById('forecastChartV8');
    const compare=document.getElementById('forecastRealChartV8');
    return monthly?.closest('.two-col')||compare?.closest('.two-col')||body.querySelector('.two-col')||body.lastElementChild;
  }
  function findPanel(body){
    return body.querySelector('.r128-history-panel')
      ||body.querySelector('.r127-history-panel')
      ||[...body.querySelectorAll('.panel,section,details')].find(node=>/Resumen Mensual Hist[oó]rico/i.test(node.textContent||''))
      ||null;
  }
  function signature(year,month,ep,s,rows,status){
    const fmonth=window.state?.forecastDataV8?.months?.[month-1];
    return JSON.stringify([
      year,month,ep?.id||'',ep?.updated_at||'',status,
      s.equipment,s.operational,s.ggrr,s.total,Number(fmonth?.total||0),
      rows.map(x=>[x.grupo_codigo,Number(x.monto||0),x.updated_at||''])
    ]);
  }
  function ensurePanel(body){
    let panel=findPanel(body);
    const anchor=anchorAfterCharts(body);
    if(!panel){
      panel=document.createElement('section');
      panel.className='panel r128-history-panel';
      panel.dataset.noCollapse='1';
      if(anchor)anchor.insertAdjacentElement('afterend',panel);else body.appendChild(panel);
    }else{
      panel.classList.remove('r124-history-panel','r127-history-panel');
      panel.classList.add('r128-history-panel');
      panel.dataset.noCollapse='1';
      panel.removeAttribute('hidden');
      panel.style.display='block';
      if(anchor&&panel.previousElementSibling!==anchor)anchor.insertAdjacentElement('afterend',panel);
    }
    return panel;
  }
  function bindMonth(panel){
    const select=panel.querySelector('[data-r128-month]');
    if(!select||select.dataset.r128Bound==='1')return;
    select.dataset.r128Bound='1';
    select.addEventListener('change',event=>{
      const next=Number(event.target.value);
      if(!Number.isFinite(next)||next<1||next>12)return;
      window.state.forecastMonth=next;
      lastSignature='';
      const year=Number(window.state?.forecastYear||document.getElementById('forecastYear')?.value||new Date().getFullYear());
      const ep=epFor(year,next);
      if(ep)ensureDetails(ep,{force:false});
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
    const rows=ep?details(ep.id):[];
    const status=ep?fetchStatus.get(String(ep.id))||'idle':'none';

    if(ep&&!rows.length&&status==='idle'){
      ensureDetails(ep,{force:false});
    }

    const s=split(ep,rows);
    const sig=signature(year,month,ep,s,rows,status);
    const panel=ensurePanel(body);
    if(!force&&sig===lastSignature&&panel.querySelector('[data-r128-month]'))return true;
    lastSignature=sig;

    const fmonth=window.state?.forecastDataV8?.months?.[month-1];
    const delta=ep?s.projectable-Number(fmonth?.total||0):0;
    const monthOptions=MONTHS.map((name,i)=>`<option value="${i+1}" ${i+1===month?'selected':''}>${name}</option>`).join('');

    if(!ep){
      panel.innerHTML=`
        <div class="r128-history-head">
          <div><h3>Resumen Mensual Histórico</h3><small class="muted">Solo información real de Estados de Pago cerrados.</small></div>
          <select class="field" data-r128-month>${monthOptions}</select>
        </div>
        <div class="notice">No existe un Estado de Pago cargado para ${esc(MONTHS[month-1])} ${year}.</div>`;
      bindMonth(panel);
      return true;
    }

    const loadState=fetchStatus.get(String(ep.id))||status;
    const eqRows=rows.length
      ?GROUPS.map(([code,label])=>{
          const item=rows.find(x=>String(x.grupo_codigo)===code);
          return `<tr><td>${esc(label)}</td><td class="money-cell-v8" style="text-align:right">${money(item?.monto||0)}</td></tr>`;
        }).join('')+`<tr class="forecast-total-v9"><td><b>Total mantenimiento equipos</b></td><td class="money-cell-v8" style="text-align:right"><b>${money(s.equipment)}</b></td></tr>`
      :loadState==='loading'||loadState==='idle'
        ?`<tr><td colspan="2" class="empty r128-loading-row">Cargando desglose real de equipos…</td></tr>`
        :loadState==='error'
          ?`<tr><td colspan="2" class="empty">No fue posible cargar el desglose de este EDP. Reintenta con Actualizar.</td></tr>`
          :`<tr><td colspan="2" class="empty">Este EDP no tiene desglose por equipo registrado.</td></tr>`;

    const reconciliation=s.source==='detail'
      ?`<b>Conciliación R122:</b> el mantenimiento real se obtiene del desglose cargado por equipo (<b>${money(s.equipment)}</b>). El Gasto Operativo / General se calcula contra Total Neto y GGRR.`
      :`<b>Conciliación R122:</b> el EDP informa Mantenimiento por ${money(Number(ep.mantenimiento)||0)} y GGRR por ${money(s.ggrr)}. El Gasto Operativo / General no se toma desde Mantenimiento; se obtiene como Total Neto − Mantenimiento − GGRR = <b>${money(s.operational)}</b>.`;

    panel.innerHTML=`
      <div class="r128-history-head">
        <div><h3>Resumen Mensual Histórico</h3><small class="muted">Solo información real de Estados de Pago cerrados.</small></div>
        <select class="field" data-r128-month>${monthOptions}</select>
      </div>
      <div class="forecast-history-summary-v92">
        <span>Mantenimiento real <b>${money(s.equipment)}</b></span>
        <span>Gasto Operativo / General real <b>${money(s.operational)}</b></span>
        <span>Total real proyectable <b>${money(s.projectable)}</b></span>
        <span>GGRR real <b>${money(s.ggrr)}</b></span>
        <span>Total Neto real <b>${money(s.total)}</b></span>
      </div>
      <div class="forecast-history-delta-v92">Desviación histórica vs Forecast: <b>${money(delta)}</b></div>
      <div class="notice r122-forecast-history-note">${reconciliation}</div>
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
    if(typeof current!=='function'||current.__r128)return false;
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
    wrapped.__r128=true;
    wrapped.__base=current;
    window[name]=wrapped;
    try{
      if(name==='loadForecastV9')loadForecastV9=wrapped;
      if(name==='renderForecastBodyV9')renderForecastBodyV9=wrapped;
    }catch(_){}
    return true;
  }

  async function warmSelected(){
    if(!active())return;
    const year=Number(window.state?.forecastYear||document.getElementById('forecastYear')?.value||new Date().getFullYear());
    const month=Math.min(12,Math.max(1,Number(window.state?.forecastMonth||new Date().getMonth()+1)));
    const ep=epFor(year,month);
    if(ep)await ensureDetails(ep,{force:false});
  }

  function install(){
    mountStyle();
    wrap('loadForecastV9');
    wrap('renderForecastBodyV9');
    if(active()){
      schedule(true);
      warmSelected().catch(()=>{});
    }
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
        if(active()){
          schedule(true);
          warmSelected().catch(()=>{});
        }
      }
    },125);
    window.addEventListener('stainher:modules-ready',install);
    window.addEventListener('stainher:edp-equipment-r122-ready',()=>{lastSignature='';warmSelected().finally(()=>schedule(true))});
    window.addEventListener('stainher:runtime-r128-ready',()=>{install();lastSignature='';warmSelected().finally(()=>schedule(true))});
  }

  window.StainherForecastHistoryR128=Object.freeze({install,render,schedule,ensureDetails});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();