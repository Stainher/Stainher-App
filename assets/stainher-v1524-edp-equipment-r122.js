/* Stainher V15.24 · R122 · EDP: desglose mantenimiento por equipo + histórico real consistente.
 * - Permite ingresar y persistir montos históricos por grupo/equipo dentro del EDP.
 * - Corrige la clasificación histórica cuando el campo mantenimiento viene desglosado o combinado.
 * - "Gasto Operativo real" se obtiene como saldo real proyectable y no desde el monto de equipos.
 * - Forecast vs EDP usa Total proyectable real = Total Neto - GGRR.
 */
(()=>{
  'use strict';
  const BUILD='20260925-r122-edp-equipment-breakdown';
  if(window.__STAINHER_EDP_EQUIPMENT_R122__===BUILD)return;
  window.__STAINHER_EDP_EQUIPMENT_R122__=BUILD;

  const TABLE='edp_mantenimiento_equipos_v1524';
  const OP_REFERENCE=45364683;
  const GROUPS=[
    ['3700','Nodo 3700'],
    ['asea','HUINCHE ASEA (Concentradora)'],
    ['otis','HUINCHE OTIS'],
    ['alimak','HUINCHE ALIMAK'],
    ['ptp','Huinche Tercer Panel (PTP)'],
    ['eila','Ascensor EILA 1 y 2'],
    ['hilton','Montacargas Hilton (EQUIPOS 2 Y 3)']
  ];
  let detailsLoaded=false,installing=false;

  const money=n=>typeof window.fmtCLP==='function'?window.fmtCLP(n):'$'+Math.round(Number(n)||0).toLocaleString('es-CL');
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const role=()=>String(window.state?.profile?.rol||'').trim().toLowerCase();
  const canEdit=()=>['administrador','confiabilidad'].includes(role());

  function edps(){return Array.isArray(window.state?.contractData?.edp)?window.state.contractData.edp:[]}
  function details(){return Array.isArray(window.state?.contractData?.edpEquipoDetalles)?window.state.contractData.edpEquipoDetalles:[]}
  function detailsFor(epId){return details().filter(x=>String(x.estado_pago_id)===String(epId))}
  function epFor(year,month){return edps().find(x=>Number(x.anio_edp)===Number(year)&&Number(x.mes_edp)===Number(month))||null}

  function splitReal(ep,rows=detailsFor(ep?.id)){
    if(!ep)return {equipment:0,operational:0,ggrr:0,projectable:0,total:0,detailSum:0,hasDetail:false,source:'none'};
    const total=Math.max(0,Number(ep.total_neto)||0);
    const ggrr=Math.max(0,Number(ep.gastos_reembolsables)||0);
    const field=Math.max(0,Number(ep.mantenimiento)||0);
    const detailSum=(rows||[]).reduce((sum,row)=>sum+Math.max(0,Number(row.monto)||0),0);
    const hasDetail=Array.isArray(rows)&&rows.length>0;
    if(hasDetail){
      const equipment=detailSum;
      const operational=Math.max(0,total-ggrr-equipment);
      return {equipment,operational,ggrr,projectable:equipment+operational,total,detailSum,hasDetail:true,source:'detail'};
    }

    const residual=Math.max(0,total-ggrr-field);
    if(residual>0){
      return {equipment:field,operational:residual,ggrr,projectable:field+residual,total,detailSum:0,hasDetail:false,source:'residual'};
    }

    const operational=Math.min(OP_REFERENCE,field);
    const equipment=Math.max(0,field-operational);
    return {equipment,operational,ggrr,projectable:equipment+operational,total,detailSum:0,hasDetail:false,source:'legacy'};
  }

  async function loadDetails(){
    if(!window.sb?.from||!window.state?.contractData)return [];
    const ids=edps().map(x=>x.id).filter(Boolean);
    if(!ids.length){
      window.state.contractData.edpEquipoDetalles=[];
      detailsLoaded=true;
      return [];
    }
    const q=await window.sb.from(TABLE).select('*').in('estado_pago_id',ids).order('equipo_label',{ascending:true});
    if(q.error)throw q.error;
    window.state.contractData.edpEquipoDetalles=q.data||[];
    detailsLoaded=true;
    syncForecastMonths();
    return q.data||[];
  }

  function syncForecastMonths(){
    const f=window.state?.forecastDataV8;
    if(!f?.months?.length)return;
    f.months.forEach((month,index)=>{
      const ep=month?.ep||epFor(window.state?.forecastYear,index+1);
      if(!ep)return;
      const split=splitReal(ep);
      month.__r122Equipment=split.equipment;
      month.__r122Operational=split.operational;
      month.__r122Ggrr=split.ggrr;
      month.__r122Projectable=split.projectable;
      month.__r122Total=split.total;
    });
  }

  function selectedForecast(){
    const year=Number(window.state?.forecastYear||document.getElementById('forecastYear')?.value||new Date().getFullYear());
    const month=Number(window.state?.forecastMonth||new Date().getMonth()+1);
    const ep=epFor(year,month);
    return {year,month,ep,split:splitReal(ep)};
  }

  function setKpi(container,label,value){
    const node=[...container.querySelectorAll('span')].find(x=>clean(x.textContent).toLowerCase()===label.toLowerCase());
    const strong=node?.querySelector('b')||node?.parentElement?.querySelector('b');
    if(strong)strong.textContent=money(value);
  }

  function patchForecastHistorical(){
    if(window.state?.contractTab!=='forecast')return false;
    const body=document.getElementById('forecastBody');
    if(!body)return false;
    syncForecastMonths();
    const {ep,split}=selectedForecast();
    if(!ep)return false;

    const summary=body.querySelector('.forecast-history-summary-v92');
    if(summary){
      setKpi(summary,'Mantenimiento real',split.equipment);
      setKpi(summary,'Gasto Operativo real',split.operational);
      setKpi(summary,'Total real proyectable',split.projectable);
      setKpi(summary,'GGRR real',split.ggrr);
      setKpi(summary,'Total Neto real',split.total);
    }

    const month=window.state?.forecastDataV8?.months?.[Number(window.state?.forecastMonth||new Date().getMonth()+1)-1];
    const delta=split.projectable-Number(month?.total||0);
    const deltaBox=body.querySelector('.forecast-history-delta-v92');
    if(deltaBox)deltaBox.innerHTML=`Desviación histórica vs Forecast: <b>${money(delta)}</b>`;

    const tables=[...body.querySelectorAll('.forecast-tables-v9 .admin-table')];
    const equipmentTable=tables.find(x=>/Resumen histórico por equipo/i.test(x.textContent||''));
    const partTable=tables.find(x=>/Resumen histórico por partida/i.test(x.textContent||''));

    if(equipmentTable){
      const tbody=equipmentTable.querySelector('tbody');
      const rows=detailsFor(ep.id);
      if(tbody){
        tbody.innerHTML=rows.length
          ? GROUPS.map(([code,label])=>{
              const item=rows.find(x=>x.grupo_codigo===code);
              return `<tr><td>${label}</td><td class="money-cell-v8">${money(item?.monto||0)}</td></tr>`;
            }).join('')+`<tr class="forecast-total-v9"><td><b>Total mantenimiento equipos</b></td><td class="money-cell-v8"><b>${money(split.equipment)}</b></td></tr>`
          : `<tr><td colspan="2" class="empty">Sin desglose histórico por equipo cargado para este EDP. ${canEdit()?'Ingresa el detalle desde Estados de Pago.':''}</td></tr>`;
      }
    }

    if(partTable){
      const tbody=partTable.querySelector('tbody');
      if(tbody)tbody.innerHTML=`
        <tr><td>Mantenimiento equipos</td><td class="money-cell-v8">${money(split.equipment)}</td></tr>
        <tr><td>Gasto Operativo</td><td class="money-cell-v8">${money(split.operational)}</td></tr>
        <tr><td>GGRR</td><td class="money-cell-v8">${money(split.ggrr)}</td></tr>
        <tr class="forecast-total-v9"><td><b>Total Neto real</b></td><td class="money-cell-v8"><b>${money(split.total)}</b></td></tr>`;
    }

    try{window.StainherContractForecastR121?.rebuildCharts?.()}catch(_){}
    return true;
  }

  function enhanceEdpTable(){
    if(window.state?.contractTab!=='edp')return false;
    const host=document.getElementById('contractContent');if(!host)return false;
    const table=[...host.querySelectorAll('table')].find(t=>{
      const h=[...t.querySelectorAll('thead th')].map(x=>clean(x.textContent)).join('|');
      return /^EP\|/i.test(h)||(/Mes EDP/i.test(h)&&/Total Neto/i.test(h));
    });
    if(!table||table.dataset.r122Enhanced==='1')return false;
    table.dataset.r122Enhanced='1';

    const head=table.querySelector('thead tr');
    const th=document.createElement('th');th.textContent='Detalle equipos';head?.appendChild(th);

    [...table.querySelectorAll('tbody tr')].forEach(tr=>{
      const epNum=Number((tr.children[0]?.textContent||'').match(/\d+/)?.[0]||0);
      const ep=edps().find(x=>Number(x.ep_num)===epNum);
      const td=document.createElement('td');
      if(ep){
        const split=splitReal(ep);
        const button=document.createElement('button');
        button.type='button';button.className='btn';
        button.textContent=split.hasDetail?'Editar desglose':'Ingresar desglose';
        button.onclick=()=>openBreakdown(ep.id);
        td.appendChild(button);
        const small=document.createElement('small');
        small.className='muted';
        small.style.display='block';small.style.marginTop='5px';
        small.textContent=split.hasDetail?`Equipos: ${money(split.equipment)}`:'Sin detalle';
        td.appendChild(small);
      }
      tr.appendChild(td);
    });
    return true;
  }

  function modalRoot(){return document.getElementById('modalRoot')}

  function updateModalTotals(ep){
    const root=modalRoot();if(!root)return;
    const sum=[...root.querySelectorAll('[data-r122-amount]')].reduce((a,input)=>a+Math.max(0,Number(input.value)||0),0);
    const ggrr=Math.max(0,Number(ep.gastos_reembolsables)||0);
    const total=Math.max(0,Number(ep.total_neto)||0);
    const operational=Math.max(0,total-ggrr-sum);
    const projected=sum+operational;
    const put=(key,value)=>{const el=root.querySelector(`[data-r122-total="${key}"]`);if(el)el.textContent=money(value)};
    put('equipment',sum);put('operational',operational);put('projectable',projected);put('ggrr',ggrr);put('total',total);
    const warning=root.querySelector('[data-r122-warning]');
    if(warning){
      warning.textContent=operational===OP_REFERENCE
        ?'El desglose concilia con el Gasto Operativo contractual de referencia.'
        :`Gasto Operativo calculado por diferencia: ${money(operational)}. Referencia contractual: ${money(OP_REFERENCE)}.`;
      warning.className='notice '+(operational===OP_REFERENCE?'success':'warn');
    }
  }

  function openBreakdown(epId){
    if(!canEdit())return window.toast?.('Tu perfil no puede editar el desglose del EDP.','error');
    const ep=edps().find(x=>String(x.id)===String(epId));if(!ep)return;
    const current=detailsFor(ep.id);
    const root=modalRoot();if(!root)return;
    const month=(window.MONTHS_ES||[])[Number(ep.mes_edp)-1]||String(ep.mes_edp);
    root.innerHTML=`<div class="modal-bg"><div class="modal" style="width:min(760px,100%)">
      <div class="row-between"><div><h3>Detalle mantenimiento por equipo</h3><div class="muted">EP${ep.ep_num} · ${month} ${ep.anio_edp}</div></div><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div>
      <div class="notice">Ingresa el monto neto real por grupo de equipo. El total de equipos se utiliza en el Resumen Mensual Histórico y el Gasto Operativo se calcula por diferencia contra el Total Neto menos GGRR.</div>
      <form id="r122EdpEquipmentForm" class="form-grid">
        ${GROUPS.map(([code,label])=>{
          const value=current.find(x=>x.grupo_codigo===code)?.monto||0;
          return `<label class="full">${label}<input class="field" data-r122-amount="${code}" name="${code}" type="number" min="0" step="1" value="${value}"></label>`;
        }).join('')}
        <div class="full" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px">
          <div class="kpi"><span>Equipos</span><strong data-r122-total="equipment">—</strong></div>
          <div class="kpi"><span>Gasto Operativo</span><strong data-r122-total="operational">—</strong></div>
          <div class="kpi"><span>Proyectable</span><strong data-r122-total="projectable">—</strong></div>
          <div class="kpi"><span>GGRR</span><strong data-r122-total="ggrr">—</strong></div>
          <div class="kpi"><span>Total Neto</span><strong data-r122-total="total">—</strong></div>
        </div>
        <div class="full notice" data-r122-warning></div>
        <div class="full"><button class="btn primary" type="submit">Guardar desglose</button></div>
      </form>
    </div></div>`;

    root.querySelectorAll('[data-r122-amount]').forEach(input=>input.addEventListener('input',()=>updateModalTotals(ep)));
    updateModalTotals(ep);
    root.querySelector('#r122EdpEquipmentForm').onsubmit=async event=>{
      event.preventDefault();
      const payload=GROUPS.map(([code,label])=>({
        estado_pago_id:ep.id,
        grupo_codigo:code,
        equipo_label:label,
        monto:Math.max(0,Number(root.querySelector(`[data-r122-amount="${code}"]`)?.value)||0),
        updated_at:new Date().toISOString()
      }));
      const q=await window.sb.from(TABLE).upsert(payload,{onConflict:'estado_pago_id,grupo_codigo'});
      if(q.error)return window.toast?.(q.error.message,'error');
      try{
        await loadDetails();
        window.closeModal?.();
        window.renderContractEdp?.();
        enhanceEdpTable();
        window.toast?.('Desglose de equipos guardado.','success');
      }catch(error){
        window.toast?.(error.message||String(error),'error');
      }
    };
  }

  function wrapLoadContract(){
    const current=window.loadContratoData;
    if(typeof current!=='function')return false;
    if(current.__r122)return true;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      try{await loadDetails()}catch(error){console.error('[Stainher EDP R122] desglose',error)}
      if(window.state?.contractTab==='edp')enhanceEdpTable();
      if(window.state?.contractTab==='forecast')patchForecastHistorical();
      return out;
    };
    wrapped.__r122=true;wrapped.__base=current;
    window.loadContratoData=wrapped;
    try{loadContratoData=wrapped}catch(_){}
    return true;
  }

  function wrapEdp(){
    const current=window.renderContractEdp;
    if(typeof current!=='function')return false;
    if(current.__r122)return true;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      setTimeout(enhanceEdpTable,0);
      return out;
    };
    wrapped.__r122=true;wrapped.__base=current;
    window.renderContractEdp=wrapped;
    try{renderContractEdp=wrapped}catch(_){}
    return true;
  }

  function wrapForecast(){
    const current=window.renderForecastBodyV9;
    if(typeof current!=='function')return false;
    if(current.__r122)return true;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      setTimeout(patchForecastHistorical,0);
      return out;
    };
    wrapped.__r122=true;wrapped.__base=current;
    window.renderForecastBodyV9=wrapped;
    try{renderForecastBodyV9=wrapped}catch(_){}
    return true;
  }

  async function install(){
    if(installing)return;installing=true;
    try{
      wrapLoadContract();wrapEdp();wrapForecast();
      if(window.state?.contractData?.edp?.length&&!detailsLoaded){
        try{await loadDetails()}catch(error){console.error('[Stainher EDP R122] carga inicial',error)}
      }
      if(window.state?.contractTab==='edp')enhanceEdpTable();
      if(window.state?.contractTab==='forecast')patchForecastHistorical();
    }finally{installing=false}
  }

  window.StainherEdpEquipmentR122=Object.freeze({
    install,loadDetails,openBreakdown,splitReal,patchForecastHistorical,enhanceEdpTable,detailsFor
  });
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>install(),{once:true});else install();
  window.addEventListener('stainher:modules-ready',()=>install());
  window.addEventListener('stainher:contract-forecast-r121-ready',()=>install());
})();