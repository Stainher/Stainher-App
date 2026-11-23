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
  const MONTHS_ES=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
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
    if(ep.gastos_generales!=null){
      const operational=Math.max(0,Number(ep.gastos_generales)||0);
      // Some EDPs store maintenance and general expenses together in mantenimiento.
      const combined=total>0&&field===total-ggrr&&field>=operational;
      const equipment=hasDetail?detailSum:combined?field-operational:field;
      return {equipment,operational,ggrr,projectable:equipment+operational,total,detailSum,hasDetail,source:'explicit'};
    }
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
    window.dispatchEvent(new Event('stainher:edp-details-updated'));
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
    const node=[...container.querySelectorAll('span')].find(x=>clean(x.textContent).toLowerCase().startsWith(label.toLowerCase()));
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
      const opLabel=[...summary.querySelectorAll('span')].find(x=>clean(x.textContent).toLowerCase().startsWith('gasto operativo real'));
      if(opLabel)opLabel.childNodes[0].textContent='Gasto Operativo / General real ';
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
        <tr><td>Gasto Operativo / General</td><td class="money-cell-v8">${money(split.operational)}</td></tr>
        <tr><td>GGRR</td><td class="money-cell-v8">${money(split.ggrr)}</td></tr>
        <tr class="forecast-total-v9"><td><b>Total Neto real</b></td><td class="money-cell-v8"><b>${money(split.total)}</b></td></tr>`;
    }

    const existingNote=body.querySelector('.r122-forecast-history-note');
    existingNote?.remove();
    if(summary){
      const note=document.createElement('div');
      note.className='notice r122-forecast-history-note';
      if(split.source==='explicit'){
        note.textContent='Gastos Generales informados en este EDP: '+money(split.operational)+'.';
      }else if(split.source==='residual'){
        note.innerHTML=`<b>Conciliación R122:</b> el EDP informa Mantenimiento por ${money(Number(ep.mantenimiento)||0)} y GGRR por ${money(split.ggrr)}. El Gasto Operativo / General no se toma desde Mantenimiento; se obtiene como Total Neto − Mantenimiento − GGRR = <b>${money(split.operational)}</b>. Puedes ingresar el detalle por equipo desde Estados de Pago.`;
      }else if(split.source==='detail'){
        note.innerHTML=`<b>Conciliación R122:</b> Mantenimiento por equipos se obtiene del desglose guardado en el EDP (<b>${money(split.equipment)}</b>) y el Gasto Operativo / General se calcula por diferencia (<b>${money(split.operational)}</b>).`;
      }else{
        note.innerHTML=`<b>Conciliación R122:</b> se conserva la compatibilidad con el histórico anterior. Para mayor trazabilidad, completa el desglose por equipo desde Estados de Pago.`;
      }
      summary.insertAdjacentElement('afterend',note);
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
        ?'El desglose concilia con el Gasto Operativo / General contractual de referencia.'
        :`Gasto Operativo / General calculado por diferencia: ${money(operational)}. Referencia contractual: ${money(OP_REFERENCE)}.`;
      warning.className='notice '+(operational===OP_REFERENCE?'success':'warn');
    }
  }

  function openBreakdown(epId){
    if(!canEdit())return window.toast?.('Tu perfil no puede editar el desglose del EDP.','error');
    const ep=edps().find(x=>String(x.id)===String(epId));if(!ep)return;
    const current=detailsFor(ep.id);
    const root=modalRoot();if(!root)return;
    const month=MONTHS_ES[Number(ep.mes_edp)-1]||String(ep.mes_edp);
    root.innerHTML=`<div class="modal-bg"><div class="modal" style="width:min(760px,100%)">
      <div class="row-between"><div><h3>Detalle mantenimiento por equipo</h3><div class="muted">EP${ep.ep_num} · ${month} ${ep.anio_edp}</div></div><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div>
      <div class="notice">Ingresa el monto neto real por grupo de equipo. El total de equipos se utiliza en el Resumen Mensual Histórico. <b>Mantenimiento informado en este EDP: ${money(ep.mantenimiento||0)}</b>. El Gasto Operativo / General se concilia contra el Total Neto menos GGRR y el detalle de equipos.</div>
      <form id="r122EdpEquipmentForm" class="form-grid">
        ${GROUPS.map(([code,label])=>{
          const value=current.find(x=>x.grupo_codigo===code)?.monto||0;
          return `<label class="full">${label}<input class="field" data-r122-amount="${code}" name="${code}" type="number" min="0" step="1" value="${value}"></label>`;
        }).join('')}
        <div class="full" style="display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px">
          <div class="kpi"><span>Equipos</span><strong data-r122-total="equipment">—</strong></div>
          <div class="kpi"><span>Gasto Operativo / General</span><strong data-r122-total="operational">—</strong></div>
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
    const visited=new Set();
    for(let previous=current;typeof previous==='function'&&!visited.has(previous);previous=previous.__base){
      if(previous.__r122)return true;
      visited.add(previous);
    }
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
/* Avance físico y financiero por partida del contrato base. */
(()=>{
  'use strict';
  const table = 'edp_avance_partidas';
  const catalog = [["A",10,"Mantenimiento eléctrico mensual",55000,1236832,68025760,12000,24352584],["A",20,"Mantenimiento mecánico mensual",55000,1236832,68025760,12000,24352584],["A",30,"Mantenimiento eléctrico trimestral",18000,1236832,22262976,4000,8751568],["A",40,"Mantenimiento mecánico trimestral",18000,1236832,22262976,4000,8751568],["A",50,"Mantenimiento mecánico semestral",9000,1236832,11131488,2000,4375784],["A",60,"Mantenimiento mecánico anual",5000,1236832,6184160,1000,1236832],["A",70,"Inspección de Sala de Máquinas, accesorios, cables y pique.",110000,820342,90237620,24000,32305068],["A",80,"Cambio cables de levante",5000,16706433,83532165,0,0],["A",90,"Certificación sistema de levante (cables y poleas)",18000,2900230,52204140,4000,20519088],["B",110,"Mantenimiento eléctrico quincenal",111000,1236832,137288352,23000,45566216],["B",120,"Mantenimiento mecánico mensual",55000,1236832,68025760,12000,24352584],["B",130,"Mantenimiento mecánico trimestral",17000,1236832,21026144,4000,10653688],["B",140,"Mantenimiento mecánico anual",5000,1236832,6184160,2000,2473664],["B",150,"Inspección de Sala de Máquinas, accesorios, cables y pique.",110000,820342,90237620,24000,32305068],["B",160,"Cambio cables de levante",5000,14050686,70253430,0,0],["B",170,"Certificación sistema de levante (cables y poleas)",18000,2900230,52204140,4000,20519088],["C",190,"Mantenimiento eléctrico mensual",55000,1236832,68025760,12000,24352584],["C",200,"Mantenimiento mecánico mensual",57000,1236832,70499424,11000,19311512],["C",210,"Mantenimiento mecánico trimestral",19000,1236832,23499808,4000,6849448],["C",220,"Mantenimiento mecánico anual",5000,1236832,6184160,1000,1236832],["C",230,"Certificación sistema de levante (cables y poleas)",19000,940304,17865776,4000,5207387],["C",240,"Inspección de Sala de Máquinas, accesorios, cables y estructura",57000,820342,46759494,12000,13822731],["C",250,"Pauta de engrase trimestral Alimak",19000,1236832,23499808,4000,6625504],["C",260,"Pauta de engrase semestral Alimak",9000,1236832,11131488,1000,3138952],["D",280,"Mantenimiento eléctrico quincenal",120000,1236832,148419840,3000,3710496],["D",290,"Mantenimiento mecánico mensual",60000,1236832,74209920,0,0],["D",300,"Mantenimiento mecánico trimestral",20000,1236832,24736640,0,0],["D",310,"Mantenimiento mecánico anual",5000,1236832,6184160,0,0],["D",320,"Inspección de Sala de Máquinas, accesorios, cables y pique.",120000,820342,98441040,13000,10664446],["D",330,"Cambio cables de levante",5000,11385949,56929745,0,0],["D",340,"Certificación sistema de levante (cables y poleas)",19000,2900230,55104370,3000,13159774],["E",360,"Mantenimiento eléctrico mensual",56000,1236832,69262592,12000,22450464],["E",370,"Mantenimiento mecánico mensual",56000,1236832,69262592,12000,22450464],["E",380,"Mantenimiento mecánico trimestral",18000,1236832,22262976,4000,8751568],["E",390,"Mantenimiento mecánico anual",5000,1236832,6184160,1000,1236832],["E",400,"Certificación sistema de levante (cables y poleas)",19000,1066214,20258066,4000,5904584],["E",410,"Inspección de Sala de Máquinas, accesorios, cables y estructura",56000,820342,45939152,12000,14890848],["E",420,"Pauta de engrase trimestral",18000,1236832,22262976,4000,8751568],["E",430,"Pauta de engrase semestral",10000,1236832,12368320,2000,2473664],["F",450,"Inspección de Sala de Máquinas, accesorios, cables y estructura mensual",55000,703723,38704765,12000,13855946],["F",460,"Mantenimiento mecánico y eléctrico mensual",55000,1236832,68025760,12000,24352584],["F",470,"Mantenimiento mecánico anual",5000,1236832,6184160,1000,1236832],["F",480,"Certificación sistema de levante (cables y poleas)",18000,816650,14699700,4000,5778086],["G",500,"Inspección de Sala de Máquinas, accesorios, cables y estructura",57000,1193649,67441169,11000,20747808],["G",510,"Mantenimiento mecánico y eléctrico mensual",58000,1357072,78031640,11000,19429491],["G",520,"Certificación sistema de levante (cables y poleas)",18000,485214,8733852,4000,3422702],["H",540,"Servicios adicionales, incluye atención de fallas y servicios de apoyo",55000,45364683,2495057579,13000,567307624],["I",560,"Estandarización e innovación",5000,79242000,396210000,0,71264034],["J",10,"GGRR",5000,35622265,178111325,1593,56817474]];
  const groups = {
    A:'HUINCHE ASEA (Concentradora)', B:'HUINCHE OTIS', C:'HUINCHE ALIMAK',
    D:'Huinche Tercer Panel (PTP)', E:'Nodo 3700', F:'Ascensor EILA 1 y 2',
    G:'Montacargas Hilton (EQUIPOS 2 Y 3)', H:'Gastos generales',
    I:'Cumplimiento Normativo', J:'Gastos Reembolsables'
  };
  const declaredBase = 5506993265;
  const currency = new Intl.NumberFormat('es-CL', {style:'currency',currency:'CLP'});
  const quantity = new Intl.NumberFormat('es-CL', {maximumFractionDigits:3,useGrouping:false});
  const percent = new Intl.NumberFormat('es-CL', {style:'percent',maximumFractionDigits:2});
  const money = value => currency.format(value);
  const units = value => quantity.format(value / 1000);
  const lineAmount = (value, price) => Math.round(value * price / 1000);

  function eligiblePayments(){
    return (window.state?.contractData?.edp || [])
      .filter(ep=>Number(ep.ep_num)>=18)
      .sort((a,b)=>Number(b.ep_num)-Number(a.ep_num));
  }

  async function openPanel(panel){
    const host = panel.querySelector('[data-avance-body]');
    host.textContent = 'Cargando avance por partida…';
    try {
      const {data,error} = await window.sb.from(table).select('revision,meses').eq('id',1).single();
      if(error) throw error;
      render(host,data,eligiblePayments());
    } catch(error) {
      host.textContent = 'No se pudo cargar el avance por partida. ' + error.message;
    }
  }

  function render(host, loaded, payments){
    let snapshot = loaded;
    let epNumber = Number(payments[0]?.ep_num);
    let draft = {};
    let dirty = false;
    let saving = false;
    let stale = false;
    const editable = typeof v1520CanEdit === 'function' && v1520CanEdit('contrato');
    if(!epNumber){
      host.textContent = 'El detalle por partida está disponible desde el EDP 18.';
      return;
    }
    const baseSum = catalog.reduce((sum, item)=>sum+item[5],0);
    host.innerHTML = `
      <div class="toolbar">
        <label>Estado de Pago <select class="field" data-avance-month></select></label>
        ${editable?'<button type="button" class="btn primary" data-avance-save>Guardar cantidades</button>':''}
      </div>
      <p class="muted">Base anterior al EDP 18 según planilla. Las partidas informadas suman ${money(baseSum)} de ${money(declaredBase)} del contrato base. Diferencia: ${money(declaredBase-baseSum)}.</p>
      <p role="status" data-avance-status></p>
      <div style="overflow-x:auto" tabindex="0" aria-label="Tabla de avance por partida">
        <table style="min-width:1320px;width:100%;white-space:nowrap">
          <thead>
            <tr><th colspan="7" scope="colgroup">Contrato base</th><th colspan="3" scope="colgroup">Avance físico</th><th colspan="7" scope="colgroup">Avance financiero</th></tr>
            <tr><th>Ítem</th><th>Descripción</th><th>Unidad</th><th>Cantidad</th><th>Saldo cantidad</th><th>Precio unitario</th><th>Total base</th><th>Cantidad del mes</th><th>Anterior</th><th>A la fecha</th><th>Presente</th><th>%</th><th>Anterior</th><th>%</th><th>A la fecha</th><th>%</th><th>Saldo contrato</th></tr>
          </thead>
          <tbody></tbody><tfoot></tfoot>
        </table>
      </div>`;
    const body = host.querySelector('tbody');
    const foot = host.querySelector('tfoot');
    const selector = host.querySelector('[data-avance-month]');
    const status = host.querySelector('[data-avance-status]');
    const save = host.querySelector('[data-avance-save]');
    const cells = [];
    payments.forEach(ep=>{
      selector.add(new Option(`EDP ${ep.ep_num} · ${String(ep.mes_edp).padStart(2,'0')}/${ep.anio_edp}`,ep.ep_num));
    });

    let previousGroup;
    for(const item of catalog){
      const [group,code,description,baseQty,price,base] = item;
      if(previousGroup!==group){
        const heading = body.insertRow();
        const cell = document.createElement('th');
        cell.colSpan = 17;
        cell.scope = 'row';
        cell.style.textAlign = 'left';
        cell.textContent = `${group} · ${groups[group]}`;
        heading.append(cell);
        previousGroup = group;
      }
      const row = body.insertRow();
      const key = group+code;
      const step = group==='J'?1:1000;
      row.innerHTML = `<td>${code}</td><td style="white-space:normal;min-width:200px">${description}</td><td>${group==='J'?'GL':'Unidad'}</td><td>${units(baseQty)}</td><td></td><td>${money(price)}</td><td>${money(base)}</td><td><input type="number" class="field" style="width:85px" min="0" step="${step/1000}" aria-label="Cantidad presente ${key}: ${description}"></td>`+'<td></td>'.repeat(9);
      const input = row.querySelector('input');
      input.readOnly = !editable;
      input.addEventListener('input',()=>{
        const scaled = Number(input.value)*1000;
        const rounded = Math.round(scaled);
        draft[key] = input.validity.badInput || Math.abs(rounded-scaled)>1e-7 ? NaN : rounded;
        dirty = true;
        refresh();
      });
      cells.push({item,key,step,row,input});
    }

    function refresh(){
      let presentTotal=0, previousTotal=0, runningTotal=0, balanceTotal=0;
      let valid=true;
      for(const {item,key,step,row,input} of cells){
        const [, , , baseQty, price, base, initialQty, initialAmount] = item;
        let previousQty = initialQty;
        let previousAmount = initialAmount;
        let futureQty = 0;
        for(const [period,values] of Object.entries(snapshot.meses)){
          const qty = values[key] || 0;
          if(Number(period)<epNumber){
            previousQty += qty;
            previousAmount += lineAmount(qty,price);
          }
          if(Number(period)>epNumber) futureQty += qty;
        }
        const entered = draft[key] ?? 0;
        const max = baseQty-previousQty-futureQty;
        const itemValid = Number.isSafeInteger(entered) && entered>=0 && entered<=max && entered%step===0;
        input.max = max/1000;
        input.setCustomValidity(itemValid?'':`Cantidad inválida. Máximo disponible: ${units(max)}.`);
        input.setAttribute('aria-invalid',String(!itemValid));
        valid &&= itemValid;
        const current = Number.isFinite(entered)?entered:0;
        const present = lineAmount(current,price);
        const accumulated = previousAmount+present;
        const balance = base-accumulated;
        const values = {4:units(baseQty-previousQty-current),8:units(previousQty),9:units(previousQty+current),
          10:money(present),11:percent.format(present/base),12:money(previousAmount),13:percent.format(previousAmount/base),
          14:money(accumulated),15:percent.format(accumulated/base),16:money(balance)};
        for(const [index,value] of Object.entries(values)) row.cells[index].textContent=value;
        presentTotal += present;
        previousTotal += previousAmount;
        runningTotal += accumulated;
        balanceTotal += balance;
      }
      const ratio = value=>percent.format(value/baseSum);
      foot.innerHTML = `<tr><th colspan="6" scope="row">Subtotal partidas informadas</th><td>${money(baseSum)}</td><td colspan="3"></td><td>${money(presentTotal)}</td><td>${ratio(presentTotal)}</td><td>${money(previousTotal)}</td><td>${ratio(previousTotal)}</td><td>${money(runningTotal)}</td><td>${ratio(runningTotal)}</td><td>${money(balanceTotal)}</td></tr>`;
      const official = Number(payments.find(ep=>Number(ep.ep_num)===epNumber)?.total_neto);
      const delta = Number.isFinite(official) && presentTotal !== official
        ? ` · Diferencia frente al total neto registrado (${money(official)}): ${money(presentTotal-official)}.` : '';
      status.textContent = stale ? 'Otro usuario guardó cambios. Cierra y vuelve a abrir el detalle para cargar la versión vigente.' :
        !valid ? 'Revisa las cantidades señaladas. Deben respetar el saldo y la unidad de cada partida.' :
        `Presente: ${money(presentTotal)}${delta}`;
      if(save) save.disabled = !dirty || !valid || saving || stale;
    }

    function changePeriod(){
      epNumber = Number(selector.value);
      draft = {...snapshot.meses[epNumber]};
      dirty = false;
      cells.forEach(({key,input})=>{input.value=Object.hasOwn(draft,key)?draft[key]/1000:''});
      refresh();
    }
    selector.addEventListener('change',()=>{
      if(dirty&&!window.confirm('¿Descartar las cantidades sin guardar de este EDP?')){
        selector.value=epNumber;
        return;
      }
      changePeriod();
    });
    if(save) save.addEventListener('click',async()=>{
      if(save.disabled)return;
      saving=true;
      selector.disabled=true;
      cells.forEach(({input})=>{input.disabled=true});
      refresh();
      let message='';
      try {
        const values=Object.fromEntries(Object.entries(draft).filter(([,value])=>value>0));
        const meses={...snapshot.meses,[epNumber]:values};
        const {data,error}=await window.sb.from(table).update({meses})
          .eq('id',1).eq('revision',snapshot.revision).select('revision,meses').maybeSingle();
        if(error)throw error;
        if(!data){
          stale=true;
          return;
        }
        snapshot=data;
        dirty=false;
        message='Cantidades guardadas.';
      } catch(error) {
        message='No se pudieron guardar las cantidades. '+error.message;
      } finally {
        saving=false;
        selector.disabled=false;
        cells.forEach(({input})=>{input.disabled=false});
        refresh();
        if(message)status.textContent += ' '+message;
      }
    });
    changePeriod();
  }

  function mount(){
    if(window.state?.contractTab!=='edp')return;
    const host=document.getElementById('contractContent');
    if(!host || !eligiblePayments().length || host.querySelector('[data-edp-avance]'))return;
    const panel=document.createElement('details');
    panel.className='panel';
    panel.dataset.edpAvance='';
    panel.dataset.noCollapse='1';
    panel.innerHTML='<summary>Avance físico y financiero por partida</summary><div data-avance-body></div>';
    let loaded=false;
    panel.addEventListener('toggle',()=>{
      if(!panel.open)return;
      if(!loaded || panel.querySelector('[data-avance-status]')?.textContent.startsWith('Otro usuario')){
        loaded=true;
        openPanel(panel);
      }
    });
    host.prepend(panel);
  }

  function boot(){
    const host=document.getElementById('page-contrato') || document.body;
    new MutationObserver(mount).observe(host,{subtree:true,childList:true});
    mount();
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});
  else boot();
})();
