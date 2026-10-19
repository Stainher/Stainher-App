/* Stainher V15.24 · R154 · Presupuestos en GGRR con detalle real de ítems.
 * - Oculta Estado, Venta neta e IVA del histórico.
 * - Mantiene Total y acciones.
 * - Permite asignar un presupuesto directamente a Gastos Reembolsables de un EDP.
 * - Usa venta_neta internamente porque GGRR trabaja con Monto Neto.
 */
(()=>{
  'use strict';
  const BUILD='20261019-r160-presupuestos-destino-edp';
  if(window.__STAINHER_PRESUPUESTOS_GGRR_R152__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_GGRR_R152__=BUILD;

  const MONTHS=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Number(v)||0;
  const money=v=>typeof window.fmtCLP==='function'?window.fmtCLP(Math.round(num(v))):'$ '+Math.round(num(v)).toLocaleString('es-CL');
  const dateCL=v=>{
    const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m?`${m[3]}-${m[2]}-${m[1]}`:String(v||'');
  };
  const qtyText=v=>{
    const n=Number(v)||0;
    return Number.isInteger(n)?String(n):n.toLocaleString('es-CL',{maximumFractionDigits:2});
  };
  function budgetDetail(row){
    const lines=[];
    (Array.isArray(row?.materiales)?row.materiales:[]).forEach(x=>{
      const name=String(x?.detalle||'').trim();
      if(!name)return;
      const qty=Number(x?.cantidad)||0,unit=String(x?.unidad||'').trim();
      let suffix='';
      if(qty>0){
        if(unit.toLowerCase()==='unidad')suffix=` (${qtyText(qty)} ${qty===1?'unidad':'unidades'})`;
        else if(unit)suffix=` (${qtyText(qty)} ${unit})`;
        else suffix=` (${qtyText(qty)})`;
      }
      lines.push(name+suffix);
    });
    (Array.isArray(row?.fletes)?row.fletes:[]).forEach(x=>{
      const name=String(x?.detalle||'').trim();
      if(!name)return;
      const qty=Number(x?.cantidad)||0;
      lines.push(name+(qty>0?` (${qtyText(qty)} ${qty===1?'unidad':'unidades'})`:''));
    });
    if(lines.length)return lines.join('\n');
    const obs=String(row?.observacion||'').trim();
    if(obs)return obs;
    return 'Presupuesto técnico comercial · '+String(row?.codigo||'');
  }

  function budgets(){return Array.isArray(window.state?.r80Budgets?.rows)?window.state.r80Budgets.rows:[]}
  function budget(id){return budgets().find(x=>String(x.id)===String(id))||null}
  function eps(){return Array.isArray(window.state?.contractData?.edp)?window.state.contractData.edp:[]}
  function matchingEp(row){
    const all=[...eps()].sort((a,b)=>Number(b.ep_num)-Number(a.ep_num));
    return all.find(ep=>row?.fecha&&String(row.fecha)>=String(ep.periodo_inicio||'')&&String(row.fecha)<=String(ep.periodo_fin||''))||all[0]||null;
  }

  function installStyle(){
    if(document.getElementById('stainher-presupuestos-ggrr-r152-style'))return;
    const s=document.createElement('style');
    s.id='stainher-presupuestos-ggrr-r152-style';
    s.textContent=`
      #page-contrato .r80-list table{
        min-width:980px!important;
        table-layout:fixed!important;
      }
      #page-contrato .r80-list th:nth-child(1),#page-contrato .r80-list td:nth-child(1){width:10%!important;text-align:left!important}
      #page-contrato .r80-list th:nth-child(2),#page-contrato .r80-list td:nth-child(2){width:17%!important;text-align:left!important}
      #page-contrato .r80-list th:nth-child(3),#page-contrato .r80-list td:nth-child(3){width:13%!important;text-align:left!important}
      #page-contrato .r80-list th:nth-child(4),#page-contrato .r80-list td:nth-child(4){width:24%!important;text-align:left!important}
      #page-contrato .r80-list th:nth-child(5),#page-contrato .r80-list td:nth-child(5){width:12%!important;text-align:right!important;font-variant-numeric:tabular-nums!important}
      #page-contrato .r80-list th:nth-child(6),#page-contrato .r80-list td:nth-child(6){width:24%!important;text-align:right!important}
      #page-contrato .r80-list th{font-size:12px!important;padding:12px 12px!important;text-transform:uppercase!important;letter-spacing:.02em!important}
      #page-contrato .r80-list td{font-size:14px!important;padding:13px 12px!important;line-height:1.35!important}
      #page-contrato .r80-list td.money{font-size:15px!important}
      #page-contrato .r80-list .actions{
        display:flex!important;
        flex-wrap:nowrap!important;
        gap:7px!important;
        justify-content:flex-end!important;
      }
      #page-contrato .r80-list .actions .btn{
        width:auto!important;
        min-width:54px!important;
        flex:0 0 auto!important;
        padding:9px 11px!important;
        font-size:13px!important;
      }
      #page-contrato .r80-list .actions [data-r152-ggrr]{
        width:94px!important;
        min-width:94px!important;
        max-width:94px!important;
        height:40px!important;
        padding:5px 7px!important;
        display:flex!important;
        flex-direction:column!important;
        align-items:center!important;
        justify-content:center!important;
        gap:1px!important;
        text-align:center!important;
        line-height:1.05!important;
      }
      #page-contrato .r152-assigned{
        border-color:rgba(52,211,153,.38)!important;
        color:#34d399!important;
      }
      #page-contrato .r152-standardization .r152-ep-line{
        display:block!important;
        font-size:12px!important;
        font-weight:700!important;
        line-height:1.05!important;
        white-space:nowrap!important;
      }
      #page-contrato .r152-standardization .r152-type-line{
        display:block!important;
        font-size:9px!important;
        font-weight:600!important;
        line-height:1.05!important;
        white-space:nowrap!important;
        text-align:center!important;
      }
      #modalRoot .r152-ggrr-summary{
        display:grid!important;
        grid-template-columns:1fr 1fr!important;
        gap:10px!important;
        margin:14px 0!important;
      }
      #modalRoot .r152-ggrr-card{
        border:1px solid var(--line,#334155)!important;
        border-radius:10px!important;
        padding:11px!important;
        background:var(--panel2,#111923)!important;
      }
      #modalRoot .r152-ggrr-card span{display:block!important;color:var(--muted,#94a3b8)!important;font-size:10px!important}
      #modalRoot .r152-ggrr-card strong{display:block!important;margin-top:5px!important;font-size:16px!important}
      @media(max-width:1180px){
        #page-contrato .r80-list .actions{flex-wrap:wrap!important}
      }
      @media(max-width:760px){
        #page-contrato .r80-list table{min-width:840px!important}
        #modalRoot .r152-ggrr-summary{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(s);
  }

  function simplifyTable(table){
    if(!table)return;
    const ths=[...table.querySelectorAll('thead th')];
    const remove=ths.map((th,i)=>({i,label:norm(th.textContent)}))
      .filter(x=>x.label==='estado'||x.label==='venta neta'||x.label==='iva')
      .map(x=>x.i).sort((a,b)=>b-a);
    if(remove.length){
      remove.forEach(i=>ths[i]?.remove());
      [...table.querySelectorAll('tbody tr:not(.r150-detail-row)')].forEach(tr=>{
        remove.forEach(i=>tr.children[i]?.remove());
      });
    }
    [...table.querySelectorAll('.r150-detail-row>td')].forEach(td=>td.colSpan=6);
  }

  function labelForAssigned(row){
    if(!row?.estado_pago_id)return 'Asignar';
    const ep=eps().find(x=>String(x.id)===String(row.estado_pago_id));
    if(row?.tipo_imputacion==='estandarizacion'){
      return ep?.ep_num?`EP${ep.ep_num} · Estandarización`:'Estandarización';
    }
    return ep?.ep_num?`EP${ep.ep_num} GGRR`:'GGRR asignado';
  }

  function decorateActions(table){
    [...table.querySelectorAll('tbody tr:not(.r150-detail-row)')].forEach(tr=>{
      const actions=tr.querySelector('.actions');
      const source=actions?.querySelector('[data-pdf],[data-r150-detail]');
      const id=source?.dataset?.pdf||source?.dataset?.r150Detail;
      if(!actions||!id)return;
      const row=budget(id);
      let btn=actions.querySelector('[data-r152-ggrr]');
      if(!btn){
        btn=document.createElement('button');
        btn.type='button';
        btn.className='btn';
        btn.dataset.r152Ggrr=id;
        const pdf=actions.querySelector('[data-pdf]');
        pdf?actions.insertBefore(btn,pdf):actions.appendChild(btn);
        btn.addEventListener('click',()=>openAssign(id));
      }
      const assigned=!!row?.estado_pago_id;
      const isStandardization=assigned&&row?.tipo_imputacion==='estandarizacion';
      if(isStandardization){
        const ep=eps().find(x=>String(x.id)===String(row.estado_pago_id));
        btn.innerHTML=`<span class="r152-ep-line">${esc(ep?.ep_num?`EP${ep.ep_num}`:'EP')}</span><span class="r152-type-line">Estandarización</span>`;
      }else{
        btn.textContent=labelForAssigned(row);
      }
      btn.disabled=assigned;
      btn.classList.toggle('r152-assigned',assigned);
      btn.classList.toggle('r152-standardization',isStandardization);
      btn.title=assigned
        ?(row?.tipo_imputacion==='estandarizacion'?'Presupuesto histórico imputado a Estandarización.':'Este presupuesto ya fue asignado a Gastos Reembolsables.')
        :'Asignar este presupuesto a GGRR o Estandarización en un Estado de Pago.';
    });
  }

  function decorate(){
    installStyle();
    const table=document.querySelector('#page-contrato .r80-list table');
    if(!table)return false;
    simplifyTable(table);
    decorateActions(table);
    return true;
  }

  function epOptions(selectedId){
    return [...eps()].sort((a,b)=>Number(b.ep_num)-Number(a.ep_num)).map(ep=>{
      const selected=String(ep.id)===String(selectedId)?'selected':'';
      return `<option value="${esc(ep.id)}" ${selected}>EP${ep.ep_num} · ${MONTHS[Number(ep.mes_edp)-1]||ep.mes_edp} ${ep.anio_edp} · ${dateCL(ep.periodo_inicio)} → ${dateCL(ep.periodo_fin)}</option>`;
    }).join('');
  }

  function assignmentNotice(){
    const destination=document.getElementById('r160Destination')?.value||'gasto_reembolsable';
    const notice=document.getElementById('r160AssignNotice');
    const button=document.querySelector('[data-r152-confirm]');
    if(notice){
      notice.innerHTML=destination==='estandarizacion'
        ?'El presupuesto quedará vinculado al <b>Estado de Pago seleccionado</b> como <b>Estandarización</b>. No aumentará el monto de Gastos Reembolsables.'
        :'Se registrará como documento de <b>Gastos Reembolsables</b> usando el monto neto del presupuesto y se sumará al GGRR reconocido del Estado de Pago seleccionado.';
    }
    if(button)button.textContent=destination==='estandarizacion'?'Asignar a Estandarización':'Asignar a GGRR';
  }

  function openAssign(id){
    const row=budget(id);
    if(!row)return window.toast?.('Presupuesto no encontrado.','error');
    if(row.estado_pago_id)return window.toast?.('Este presupuesto ya está asignado a un Estado de Pago.','warn');
    const all=eps();
    if(!all.length)return window.toast?.('No hay Estados de Pago disponibles para asignar.','error');
    const suggested=matchingEp(row);
    const root=document.getElementById('modalRoot');
    if(!root)return;
    root.innerHTML=`<div class="modal-bg"><div class="modal" style="width:min(660px,96vw)">
      <div class="row-between">
        <div><h3>Asignar presupuesto a Estado de Pago</h3><div class="muted">${esc(row.codigo||'')}</div></div>
        <button class="btn" type="button" onclick="closeModal()">Cerrar</button>
      </div>
      <div class="r152-ggrr-summary">
        <div class="r152-ggrr-card"><span>Equipo</span><strong>${esc(row.equipo_nombre||'—')}</strong></div>
        <div class="r152-ggrr-card"><span>Monto neto</span><strong>${money(row.venta_neta)}</strong></div>
        <div class="r152-ggrr-card"><span>Total presupuesto IVA incluido</span><strong>${money(row.total_final)}</strong></div>
        <div class="r152-ggrr-card"><span>Fecha documento</span><strong>${dateCL(row.fecha)}</strong></div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1.4fr;gap:12px">
        <label>Destino
          <select class="field" id="r160Destination" style="width:100%;margin-top:6px">
            <option value="gasto_reembolsable">Gastos Reembolsables</option>
            <option value="estandarizacion">Estandarización</option>
          </select>
        </label>
        <label>Estado de Pago
          <select class="field" id="r152EpSelect" style="width:100%;margin-top:6px">${epOptions(suggested?.id)}</select>
        </label>
      </div>
      <div class="notice" id="r160AssignNotice" style="margin-top:12px"></div>
      <div class="row" style="justify-content:flex-end;margin-top:14px">
        <button class="btn primary" type="button" data-r152-confirm>Asignar a GGRR</button>
      </div>
    </div></div>`;
    root.querySelector('#r160Destination')?.addEventListener('change',assignmentNotice);
    root.querySelector('[data-r152-confirm]')?.addEventListener('click',()=>assign(id));
    assignmentNotice();
  }

  async function assign(id){
    const row=budget(id);
    const epId=document.getElementById('r152EpSelect')?.value;
    const destination=document.getElementById('r160Destination')?.value||'gasto_reembolsable';
    if(!row||!epId)return window.toast?.('Selecciona un Estado de Pago.','error');
    if(!['gasto_reembolsable','estandarizacion'].includes(destination))return window.toast?.('Selecciona un destino válido.','error');
    const button=document.querySelector('[data-r152-confirm]');
    if(button){button.disabled=true;button.textContent='Asignando…';}
    try{
      const out=await window.sb.rpc('asignar_presupuesto_edp_r160',{
        p_presupuesto_id:id,
        p_estado_pago_id:epId,
        p_tipo_imputacion:destination
      });
      if(out.error)throw out.error;
      const data=Array.isArray(out.data)?out.data[0]:out.data;
      row.estado_pago_id=data?.estado_pago_id||epId;
      row.gasto_reembolsable_id=data?.gasto_reembolsable_id||null;
      row.tipo_imputacion=data?.tipo_imputacion||destination;
      row.asignado_edp_at=new Date().toISOString();
      if(destination==='gasto_reembolsable')row.asignado_ggrr_at=row.asignado_edp_at;

      const ep=eps().find(x=>String(x.id)===String(row.estado_pago_id));
      if(destination==='gasto_reembolsable'&&ep&&data?.nuevo_total_ggrr!=null)ep.gastos_reembolsables=Number(data.nuevo_total_ggrr);

      if(destination==='gasto_reembolsable'&&window.state?.contractData){
        window.state.contractData.reemb=Array.isArray(window.state.contractData.reemb)?window.state.contractData.reemb:[];
        if(data?.gasto_reembolsable_id&&!window.state.contractData.reemb.some(x=>String(x.id)===String(data.gasto_reembolsable_id))){
          window.state.contractData.reemb.push({
            id:data.gasto_reembolsable_id,
            ep_num:Number(data.ep_num),
            anio_edp:Number(ep?.anio_edp),
            mes_edp:Number(ep?.mes_edp),
            codigo_documento:row.codigo,
            tipo_documento:'Presupuesto técnico comercial',
            equipo:row.equipo_nombre,
            fecha_documento:row.fecha,
            detalle:budgetDetail(row),
            monto_detalle:Number(data.monto_neto||row.venta_neta||0),
            estado:'APROBADO',
            enlace:null
          });
        }
      }

      window.closeModal?.();
      decorate();
      const label=destination==='estandarizacion'?'Estandarización':'Gasto Reembolsable';
      window.toast?.(`Presupuesto asignado a EP${data?.ep_num||ep?.ep_num||''} como ${label}.`,'success');
    }catch(error){
      if(button){button.disabled=false;assignmentNotice();}
      window.toast?.(error.message||String(error),'error');
    }
  }

  let observer=null,pending=false;
  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(()=>{pending=false;decorate()});
  }
  function install(){
    installStyle();
    decorate();
    if(observer)return;
    const root=document.getElementById('contractContent')||document.getElementById('page-contrato')||document.body;
    observer=new MutationObserver(schedule);
    observer.observe(root,{childList:true,subtree:true});
    window.addEventListener('stainher:presupuestos-r150-ready',schedule);
    window.addEventListener('stainher:modules-ready',schedule);
  }

  window.StainherPresupuestosGgrrR152=Object.freeze({install,decorate,openAssign,budgetDetail,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
