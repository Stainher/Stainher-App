(()=>{
  'use strict';
  const VERSION='R122';
  if(window.__STAINHER_EDP_DETAIL_R122__===VERSION)return;
  window.__STAINHER_EDP_DETAIL_R122__=VERSION;

  const TABLE='edp_detalle_mantenimiento_v1524';
  const EXPECTED_GENERAL=45364683;
  const ITEMS=[
    {key:'3700',name:'Nodo 3700',type:'equipo',inside:true},
    {key:'asea',name:'HUINCHE ASEA (Concentradora)',type:'equipo',inside:true},
    {key:'otis',name:'HUINCHE OTIS',type:'equipo',inside:true},
    {key:'alimak',name:'HUINCHE ALIMAK',type:'equipo',inside:true},
    {key:'ptp',name:'Huinche Tercer Panel (PTP)',type:'equipo',inside:true},
    {key:'eila',name:'Ascensor EILA 1 y 2',type:'equipo',inside:true},
    {key:'hilton',name:'Montacargas Hilton (EQUIPOS 2 Y 3)',type:'equipo',inside:true},
    {key:'gasto_general',name:'Gastos Generales / Operativos',type:'gasto_general',inside:false},
    {key:'otros',name:'Otros conceptos netos',type:'otro',inside:false}
  ];
  const STYLE_ID='stainher-edp-detail-r122-style';
  let loadingPromise=null,installed=false;

  function db(){
    try{if(typeof sb!=='undefined'&&sb)return sb}catch(_){}
    return window.sb;
  }
  function stateRef(){
    try{if(typeof state!=='undefined'&&state)return state}catch(_){}
    return window.state;
  }
  function esc(v){return String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]))}
  function money(v){
    try{if(typeof fmtCLP==='function')return fmtCLP(v)}catch(_){}
    return '$'+Math.round(Number(v)||0).toLocaleString('es-CL');
  }
  function cleanNumber(v){
    const n=Number(String(v??'').replace(/[^0-9-]/g,''));
    return Number.isFinite(n)?Math.max(0,Math.round(n)):0;
  }
  function monthNames(){
    try{if(typeof MONTHS_ES!=='undefined'&&Array.isArray(MONTHS_ES))return MONTHS_ES}catch(_){}
    return ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  }
  function canEdit(){
    try{if(typeof v1520CanEdit==='function')return !!v1520CanEdit('contrato')}catch(_){}
    const s=stateRef(),role=String(s?.profile?.rol||'').trim().toLowerCase();
    if(['administrador','confiabilidad'].includes(role))return true;
    return String(s?.profile?.permisos?.contrato||'').toLowerCase()==='editar';
  }
  function edps(){return [...(stateRef()?.contractData?.edp||[])].sort((a,b)=>Number(b.ep_num||0)-Number(a.ep_num||0))}
  function detailRows(){return stateRef()?.contractData?.edpDetalleMantenimiento||[]}
  function rowsFor(epId){return detailRows().filter(r=>String(r.estado_pago_id)===String(epId))}
  function rowMap(epId){return new Map(rowsFor(epId).map(r=>[String(r.item_key),r]))}
  function findEp(year,month){return (stateRef()?.contractData?.edp||[]).find(e=>Number(e.anio_edp)===Number(year)&&Number(e.mes_edp)===Number(month))||null}
  function officialItem(item,existing){
    return {
      estado_pago_id:existing?.estado_pago_id,
      item_key:item.key,
      item_nombre:item.name,
      tipo:item.type,
      monto:Number(existing?.monto||0),
      incluido_en_mantenimiento:existing?.incluido_en_mantenimiento??item.inside,
      observacion:existing?.observacion||null
    };
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      .r122-edp-detail-panel{margin-top:16px!important}
      .r122-edp-detail-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-end;flex-wrap:wrap}
      .r122-edp-detail-head h3{margin:0 0 4px!important}
      .r122-edp-detail-grid{display:grid;grid-template-columns:repeat(6,minmax(145px,1fr));gap:10px;margin:14px 0}
      .r122-edp-kpi{border:1px solid var(--line,#334155);border-radius:12px;padding:12px;background:var(--panel2,#111922);min-width:0}
      .r122-edp-kpi span{display:block;color:var(--muted,#94a3b8);font-size:11px;text-transform:uppercase;letter-spacing:.04em}
      .r122-edp-kpi b{display:block;margin-top:6px;font-size:19px;overflow-wrap:anywhere}
      .r122-edp-table-wrap{overflow:auto}
      .r122-edp-table{min-width:850px!important}
      .r122-edp-table input[type="number"]{width:150px!important}
      .r122-edp-table .r122-inside-toggle{display:flex;gap:7px;align-items:center;font-size:12px;color:var(--muted,#94a3b8)}
      .r122-reconcile{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
      .r122-reconcile .notice{margin:0!important}
      .r122-history-summary{display:grid;grid-template-columns:repeat(6,minmax(150px,1fr));gap:10px;margin:12px 0}
      .r122-history-card{border:1px solid var(--line,#334155);border-radius:12px;padding:12px;background:var(--panel2,#111922)}
      .r122-history-card small{display:block;color:var(--muted,#94a3b8);font-size:11px}
      .r122-history-card b{display:block;margin-top:4px;font-size:22px}
      .r122-history-tables{display:grid;grid-template-columns:1fr 1fr;gap:18px;margin-top:14px}
      .r122-history-tables table{width:100%}
      .r122-history-note{font-size:12px;color:var(--muted,#94a3b8);margin-top:6px}
      .r122-warning{color:#fbbf24!important}
      .r122-good{color:#34d399!important}
      @media(max-width:1180px){
        .r122-edp-detail-grid,.r122-history-summary{grid-template-columns:repeat(3,minmax(0,1fr))}
      }
      @media(max-width:760px){
        .r122-edp-detail-grid,.r122-history-summary{grid-template-columns:repeat(2,minmax(0,1fr))}
        .r122-history-tables,.r122-reconcile{grid-template-columns:1fr}
      }
    `;
    document.head.appendChild(style);
  }

  async function loadDetails(force=false){
    const s=stateRef();
    if(!s?.contractData)return [];
    if(!force&&Array.isArray(s.contractData.edpDetalleMantenimiento))return s.contractData.edpDetalleMantenimiento;
    if(loadingPromise)return loadingPromise;
    const client=db();if(!client)return [];
    loadingPromise=(async()=>{
      const {data,error}=await client.from(TABLE).select('id,estado_pago_id,item_key,item_nombre,tipo,monto,incluido_en_mantenimiento,observacion,updated_at').order('item_key');
      if(error){
        console.warn('[Stainher EDP R122] Detalle no disponible',error);
        s.contractData.edpDetalleMantenimiento=[];
        s.contractData.edpDetalleError=error.message||String(error);
        return [];
      }
      s.contractData.edpDetalleMantenimiento=data||[];
      s.contractData.edpDetalleError='';
      return s.contractData.edpDetalleMantenimiento;
    })().finally(()=>{loadingPromise=null});
    return loadingPromise;
  }

  function derive(ep){
    if(!ep)return null;
    const map=rowMap(ep.id);
    const equipment=ITEMS.filter(x=>x.type==='equipo').map(item=>officialItem(item,map.get(item.key)));
    const equipmentTotal=equipment.reduce((sum,x)=>sum+Number(x.monto||0),0);
    const maintenance=Math.max(0,Number(ep.mantenimiento||0));
    const ggrr=Math.max(0,Number(ep.gastos_reembolsables||0));
    const totalNet=Math.max(0,Number(ep.total_neto||0));
    const manualGeneral=map.get('gasto_general');
    const manualOther=map.get('otros');
    const other=Math.max(0,Number(manualOther?.monto||0));
    const outsideCandidate=Math.max(0,totalNet-maintenance-ggrr-other);
    const insideCandidate=equipmentTotal>0?Math.max(0,maintenance-equipmentTotal):0;
    let general=0,generalInside=false,generalSource='manual';
    if(manualGeneral){
      general=Math.max(0,Number(manualGeneral.monto||0));
      generalInside=!!manualGeneral.incluido_en_mantenimiento;
    }else{
      const candidates=[
        {value:outsideCandidate,inside:false,diff:Math.abs(outsideCandidate-EXPECTED_GENERAL)},
        ...(equipmentTotal>0?[{value:insideCandidate,inside:true,diff:Math.abs(insideCandidate-EXPECTED_GENERAL)}]:[])
      ].filter(x=>x.value>0);
      const chosen=candidates.sort((a,b)=>a.diff-b.diff)[0];
      if(chosen){general=chosen.value;generalInside=chosen.inside;generalSource='conciliado'}
      else{general=0;generalInside=false;generalSource='sin registro'}
    }
    const equipmentCoveredByGeneral=generalInside?general:0;
    const maintenancePending=Math.max(0,maintenance-equipmentTotal-equipmentCoveredByGeneral);
    const outsideClassified=(generalInside?0:general)+other;
    const netPendingRaw=totalNet-maintenance-ggrr-outsideClassified;
    return {
      ep,map,equipment,equipmentTotal,maintenance,ggrr,totalNet,general,generalInside,generalSource,other,
      maintenancePending,netPending:Math.max(0,netPendingRaw),netExcess:Math.max(0,-netPendingRaw),outsideCandidate
    };
  }

  function recalcEditor(panel,ep){
    const maintenance=Number(ep?.mantenimiento||0),ggrr=Number(ep?.gastos_reembolsables||0),totalNet=Number(ep?.total_neto||0);
    let equipment=0,general=0,other=0;
    panel.querySelectorAll('[data-r122-item]').forEach(input=>{
      const value=cleanNumber(input.value),type=input.dataset.r122Type;
      if(type==='equipo')equipment+=value;
      if(type==='gasto_general')general=value;
      if(type==='otro')other=value;
    });
    const generalInside=!!panel.querySelector('[data-r122-general-inside]')?.checked;
    const maintenancePending=Math.max(0,maintenance-equipment-(generalInside?general:0));
    const netPending=totalNet-maintenance-ggrr-(generalInside?0:general)-other;
    const set=(name,value,cls='')=>{
      const el=panel.querySelector(`[data-r122-total="${name}"]`);
      if(!el)return;
      el.textContent=money(Math.max(0,value));
      el.classList.remove('r122-warning','r122-good');
      if(cls)el.classList.add(cls);
    };
    set('equipos',equipment);
    set('mantenimiento-pendiente',maintenancePending,maintenancePending?'r122-warning':'r122-good');
    set('neto-pendiente',Math.max(0,netPending),netPending?'r122-warning':'r122-good');
    const warning=panel.querySelector('[data-r122-editor-warning]');
    if(warning){
      if(netPending<0)warning.textContent=`El desglose excede el Total Neto del EDP en ${money(Math.abs(netPending))}.`;
      else if(maintenancePending>0)warning.textContent=`Faltan ${money(maintenancePending)} por desglosar dentro de Mantenimiento EDP.`;
      else if(netPending>0)warning.textContent=`Quedan ${money(netPending)} del Total Neto sin clasificar fuera de Mantenimiento/GGRR.`;
      else warning.textContent='El desglose concilia con los totales del Estado de Pago.';
    }
  }

  async function saveDetail(panel,ep){
    if(!canEdit())return;
    const client=db();if(!client||!ep?.id)return;
    const inputs=[...panel.querySelectorAll('[data-r122-item]')];
    const inside=!!panel.querySelector('[data-r122-general-inside]')?.checked;
    const payload=inputs.map(input=>{
      const item=ITEMS.find(x=>x.key===input.dataset.r122Item);
      return {
        estado_pago_id:ep.id,
        item_key:item.key,
        item_nombre:item.name,
        tipo:item.type,
        monto:cleanNumber(input.value),
        incluido_en_mantenimiento:item.type==='equipo'?true:item.type==='gasto_general'?inside:false,
        observacion:null,
        updated_at:new Date().toISOString()
      };
    });
    const button=panel.querySelector('[data-r122-save]');
    if(button){button.disabled=true;button.textContent='Guardando…'}
    const {error}=await client.from(TABLE).upsert(payload,{onConflict:'estado_pago_id,item_key'});
    if(error){
      if(button){button.disabled=false;button.textContent='Guardar desglose'}
      window.toast?.(error.message||'No se pudo guardar el desglose','error');
      return;
    }
    await loadDetails(true);
    renderEdpDetail();
    enhanceHistoricalSummary();
    window.toast?.('Detalle del Estado de Pago actualizado','success');
  }

  function editorRows(ep){
    const map=rowMap(ep.id),editable=canEdit();
    return ITEMS.map(item=>{
      const row=map.get(item.key),value=Number(row?.monto||0),isGeneral=item.type==='gasto_general';
      return `<tr>
        <td><b>${esc(item.name)}</b><br><small class="muted">${item.type==='equipo'?'Equipo / grupo de equipos':item.type==='gasto_general'?'Partida general del contrato':'Otra partida neta'}</small></td>
        <td>${item.type==='equipo'?'Dentro de Mantenimiento EDP':isGeneral?'Según estructura del EDP':'Fuera de Mantenimiento EDP'}</td>
        <td style="text-align:right"><input class="field" type="number" min="0" step="1" value="${value}" data-r122-item="${item.key}" data-r122-type="${item.type}" ${editable?'':'disabled'}></td>
        <td>${isGeneral?`<label class="r122-inside-toggle"><input type="checkbox" data-r122-general-inside ${row?.incluido_en_mantenimiento?'checked':''} ${editable?'':'disabled'}> Incluido dentro de Mantenimiento EDP</label>`:'—'}</td>
      </tr>`;
    }).join('');
  }

  function renderEdpDetail(){
    const s=stateRef(),content=document.getElementById('contractContent');
    if(!content||s?.contractTab!=='edp')return false;
    const list=edps();if(!list.length)return false;
    let ep=list.find(x=>String(x.id)===String(s.r122EdpDetailId));
    if(!ep){ep=list[0];s.r122EdpDetailId=ep.id}
    let panel=content.querySelector('.r122-edp-detail-panel');
    if(!panel){
      panel=document.createElement('section');
      panel.className='panel r122-edp-detail-panel';
      panel.dataset.noCollapse='1';
      const grid=content.querySelector('.contract-grid');
      if(grid)grid.insertAdjacentElement('afterend',panel);else content.prepend(panel);
    }
    const d=derive(ep),error=s.contractData?.edpDetalleError;
    panel.innerHTML=`
      <div class="r122-edp-detail-head">
        <div><h3>Detalle real de mantenimiento por equipo</h3><div class="muted">Registra el desglose utilizado por el Resumen Mensual Histórico. No modifica el Forecast programado.</div></div>
        <label>Estado de Pago
          <select class="field" data-r122-ep-select>
            ${list.map(x=>`<option value="${x.id}" ${String(x.id)===String(ep.id)?'selected':''}>EP${x.ep_num} · ${esc(monthNames()[Number(x.mes_edp)-1]||x.mes_edp)} ${x.anio_edp}</option>`).join('')}
          </select>
        </label>
      </div>
      ${error?`<div class="notice error">La tabla de detalle aún no está disponible: ${esc(error)}</div>`:''}
      <div class="r122-edp-detail-grid">
        <div class="r122-edp-kpi"><span>Mantenimiento EDP</span><b>${money(d.maintenance)}</b></div>
        <div class="r122-edp-kpi"><span>Detalle equipos</span><b data-r122-total="equipos">${money(d.equipmentTotal)}</b></div>
        <div class="r122-edp-kpi"><span>Pendiente dentro de mantenimiento</span><b data-r122-total="mantenimiento-pendiente" class="${d.maintenancePending?'r122-warning':'r122-good'}">${money(d.maintenancePending)}</b></div>
        <div class="r122-edp-kpi"><span>GGRR</span><b>${money(d.ggrr)}</b></div>
        <div class="r122-edp-kpi"><span>Total Neto EDP</span><b>${money(d.totalNet)}</b></div>
        <div class="r122-edp-kpi"><span>Pendiente Neto</span><b data-r122-total="neto-pendiente" class="${d.netPending?'r122-warning':'r122-good'}">${money(d.netPending)}</b></div>
      </div>
      <div class="r122-edp-table-wrap">
        <table class="r122-edp-table"><thead><tr><th>Partida / equipo</th><th>Clasificación</th><th style="text-align:right">Monto real</th><th>Tratamiento</th></tr></thead>
        <tbody>${editorRows(ep)}</tbody></table>
      </div>
      <div class="r122-reconcile">
        <div class="notice" data-r122-editor-warning>${d.maintenancePending?`Faltan ${money(d.maintenancePending)} por desglosar dentro de Mantenimiento EDP.`:d.netPending?`Quedan ${money(d.netPending)} del Total Neto sin clasificar fuera de Mantenimiento/GGRR.`:'El desglose concilia con los totales del Estado de Pago.'}</div>
        <div class="notice"><b>Importante:</b> R122 ya no supone que el campo <i>Mantenimiento</i> corresponde a Gasto General. Los montos se muestran según el EDP y su desglose real.</div>
      </div>
      ${canEdit()?'<div style="display:flex;justify-content:flex-end;margin-top:12px"><button class="btn primary" data-r122-save>Guardar desglose</button></div>':''}
    `;
    panel.querySelector('[data-r122-ep-select]')?.addEventListener('change',e=>{s.r122EdpDetailId=e.target.value;renderEdpDetail()});
    panel.querySelectorAll('[data-r122-item],[data-r122-general-inside]').forEach(el=>el.addEventListener('input',()=>recalcEditor(panel,ep)));
    panel.querySelector('[data-r122-save]')?.addEventListener('click',()=>saveDetail(panel,ep));
    recalcEditor(panel,ep);
    return true;
  }

  function historyPanel(){
    const body=document.getElementById('forecastBody');if(!body)return null;
    return [...body.querySelectorAll('.panel,details')].find(node=>/Resumen Mensual Hist[oó]rico/i.test(node.textContent||''))||null;
  }

  function enhanceHistoricalSummary(){
    const s=stateRef(),panel=historyPanel();
    if(!panel||s?.contractTab!=='forecast')return false;
    const year=Number(s.forecastYear||document.getElementById('forecastYear')?.value||new Date().getFullYear());
    const month=Number(s.forecastMonth||new Date().getMonth()+1);
    const ep=findEp(year,month);
    const target=panel.tagName==='DETAILS'?(panel.querySelector(':scope > .stainher-disclosure-content')||panel):panel;
    if(!ep){
      const title=panel.tagName==='DETAILS'?'':`<div class="row-between"><div><h3>Resumen Mensual Histórico</h3><small class="muted">Solo información real de Estados de Pago cerrados.</small></div></div>`;
      target.innerHTML=`${title}<div class="notice">No existe un Estado de Pago cargado para este período.</div>`;
      return true;
    }
    const d=derive(ep),months=monthNames();
    const generalTag=d.generalSource==='manual'
      ?(d.generalInside?'Registrado · incluido en Mantenimiento':'Registrado fuera de Mantenimiento')
      :(d.generalSource==='conciliado'?`Calculado por conciliación · ${d.generalInside?'dentro de Mantenimiento':'fuera de Mantenimiento'}`:'Sin registro');
    const equipmentRows=ITEMS.filter(x=>x.type==='equipo').map(item=>{
      const row=d.map.get(item.key),value=Number(row?.monto||0);
      return `<tr><td>${esc(item.name)}</td><td style="text-align:right">${money(value)}</td></tr>`;
    }).join('');
    const hasDetail=d.equipmentTotal>0;
    const title=panel.tagName==='DETAILS'?'':`<div class="row-between"><div><h3>Resumen Mensual Histórico</h3><small class="muted">Solo información real de Estados de Pago cerrados.</small></div></div>`;
    target.innerHTML=`
      ${title}
      <div class="row-between" style="margin-bottom:10px">
        <div class="muted">EP${ep.ep_num} · desglose real conciliado</div>
        <select class="field" data-r122-history-month>
          ${months.map((x,i)=>`<option value="${i+1}" ${i+1===month?'selected':''}>${esc(x)}</option>`).join('')}
        </select>
      </div>
      <div class="r122-history-summary">
        <div class="r122-history-card"><small>Mantenimiento EDP</small><b>${money(d.maintenance)}</b></div>
        <div class="r122-history-card"><small>Detalle equipos</small><b>${money(d.equipmentTotal)}</b></div>
        <div class="r122-history-card"><small>Gasto General / Operativo</small><b>${money(d.general)}</b><div class="r122-history-note">${esc(generalTag)}</div></div>
        <div class="r122-history-card"><small>GGRR real</small><b>${money(d.ggrr)}</b></div>
        <div class="r122-history-card"><small>Total Neto real</small><b>${money(d.totalNet)}</b></div>
        <div class="r122-history-card"><small>Pendiente por clasificar</small><b class="${(d.maintenancePending||d.netPending||d.netExcess)?'r122-warning':'r122-good'}">${money(d.maintenancePending+d.netPending+d.netExcess)}</b></div>
      </div>
      <div class="notice">
        <b>Lectura corregida R122:</b> el valor de <b>Mantenimiento EDP</b> se toma directamente del Estado de Pago y ya no se presenta automáticamente como Gasto General.
        ${d.generalSource==='conciliado'?` El Gasto General / Operativo mostrado se obtiene por conciliación con Total Neto, Mantenimiento y GGRR hasta que se registre el desglose explícito.`:''}
      </div>
      <div class="r122-history-tables">
        <div class="admin-table"><h3>Resumen histórico por equipo</h3><table><thead><tr><th>Equipo</th><th style="text-align:right">Real</th></tr></thead><tbody>
          ${equipmentRows}
          <tr><td><b>Total equipos detallados</b></td><td style="text-align:right"><b>${money(d.equipmentTotal)}</b></td></tr>
          ${!hasDetail?`<tr><td colspan="2" class="empty">El EDP tiene ${money(d.maintenance)} en Mantenimiento, pero todavía no se ha ingresado su desglose por equipo.</td></tr>`:''}
        </tbody></table></div>
        <div class="admin-table"><h3>Resumen histórico por partida</h3><table><thead><tr><th>Partida</th><th style="text-align:right">Real</th></tr></thead><tbody>
          <tr><td>Mantenimiento EDP</td><td style="text-align:right">${money(d.maintenance)}</td></tr>
          <tr><td style="padding-left:24px">↳ Equipos detallados</td><td style="text-align:right">${money(d.equipmentTotal)}</td></tr>
          <tr><td style="padding-left:24px">↳ Pendiente dentro de Mantenimiento</td><td style="text-align:right">${money(d.maintenancePending)}</td></tr>
          <tr><td>Gasto General / Operativo</td><td style="text-align:right">${money(d.general)}</td></tr>
          <tr><td>Otros conceptos netos</td><td style="text-align:right">${money(d.other)}</td></tr>
          <tr><td>GGRR</td><td style="text-align:right">${money(d.ggrr)}</td></tr>
          <tr class="forecast-total-v9"><td><b>Total Neto real</b></td><td style="text-align:right"><b>${money(d.totalNet)}</b></td></tr>
        </tbody></table></div>
      </div>
    `;
    target.querySelector('[data-r122-history-month]')?.addEventListener('change',event=>{
      s.forecastMonth=Number(event.target.value);
      try{if(typeof renderForecastBodyV9==='function')renderForecastBodyV9();else window.renderForecastBodyV9?.()}catch(_){}
    });
    return true;
  }

  function assignGlobal(name,wrapped){
    window[name]=wrapped;
    try{(0,eval)(`${name}=window.${name}`)}catch(_){}
  }
  function currentGlobal(name){
    try{return window[name]||(0,eval)(name)}catch(_){return window[name]}
  }

  function wrapAsync(name,after){
    const current=currentGlobal(name);
    if(typeof current!=='function'||current.__r122)return false;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      try{await loadDetails();after?.()}catch(error){console.error('[Stainher EDP R122]',error)}
      return out;
    };
    wrapped.__r122=true;wrapped.__base=current;assignGlobal(name,wrapped);return true;
  }

  function wrapSync(name,after){
    const current=currentGlobal(name);
    if(typeof current!=='function'||current.__r122)return false;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      Promise.resolve(loadDetails()).then(()=>after?.()).catch(error=>console.error('[Stainher EDP R122]',error));
      return out;
    };
    wrapped.__r122=true;wrapped.__base=current;assignGlobal(name,wrapped);return true;
  }

  function install(){
    installStyle();
    wrapAsync('loadContratoData',()=>{
      const tab=stateRef()?.contractTab;
      if(tab==='edp')renderEdpDetail();
      if(tab==='forecast')enhanceHistoricalSummary();
    });
    wrapSync('renderContractEdp',()=>renderEdpDetail());
    wrapAsync('loadForecastV9',()=>enhanceHistoricalSummary());
    wrapSync('renderForecastBodyV9',()=>enhanceHistoricalSummary());
    loadDetails().then(()=>{
      if(stateRef()?.contractTab==='edp')renderEdpDetail();
      if(stateRef()?.contractTab==='forecast')enhanceHistoricalSummary();
    }).catch(()=>{});
  }

  function boot(){
    if(installed)return;installed=true;
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      install();
      if(tries>=60)clearInterval(timer);
    },150);
    window.addEventListener('stainher:modules-ready',install);
    window.addEventListener('stainher:runtime-r122-ready',install);
  }

  window.StainherEdpDetailR122=Object.freeze({install,loadDetails,renderEdpDetail,enhanceHistoricalSummary,derive});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
