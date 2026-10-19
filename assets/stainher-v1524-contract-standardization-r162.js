/* Stainher V15.24 · R162 · Administración del Contrato: Estandarización e Innovación.
 * - Agrega una ficha propia inmediatamente después de Gastos Reembolsables.
 * - Lista presupuestos imputados como estandarización por Estado de Pago.
 * - Resume monto neto, IVA y total IVA incluido sin duplicar partidas.
 */
(()=>{
  'use strict';
  const BUILD='20261019-r162-estandarizacion-innovacion-contrato';
  if(window.__STAINHER_CONTRACT_STANDARDIZATION_R162__===BUILD)return;
  window.__STAINHER_CONTRACT_STANDARDIZATION_R162__=BUILD;

  const TAB='estandarizacion_innovacion';
  const TABLE='presupuestos_tecnico_comerciales_v1524';
  const STYLE_ID='stainher-contract-standardization-r162-style';
  let observer=null,loading=false;

  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const num=v=>Number(v)||0;
  const money=v=>typeof window.fmtCLP==='function'?window.fmtCLP(Math.round(num(v))):'$'+Math.round(num(v)).toLocaleString('es-CL');
  const dateCL=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(v||'')};
  const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #page-contrato .r162-toolbar{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
      #page-contrato .r162-toolbar label{display:grid;gap:5px;color:var(--muted);font-size:10px;text-transform:uppercase;min-width:260px}
      #page-contrato .r162-kpis{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:10px;margin:0 0 14px}
      #page-contrato .r162-kpi{border:1px solid var(--line);border-radius:11px;background:var(--panel,#0d141c);padding:11px;min-width:0}
      #page-contrato .r162-kpi span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase}
      #page-contrato .r162-kpi b{display:block;margin-top:5px;font-size:18px;overflow-wrap:anywhere}
      #page-contrato .r162-note{margin:0 0 14px}
      #page-contrato .r162-table{overflow:auto;border:1px solid var(--line);border-radius:11px}
      #page-contrato .r162-table table{width:100%;border-collapse:collapse;min-width:980px;table-layout:fixed}
      #page-contrato .r162-table th,#page-contrato .r162-table td{padding:12px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}
      #page-contrato .r162-table th{background:var(--panel2);color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.02em}
      #page-contrato .r162-table td{font-size:13px;line-height:1.35}
      #page-contrato .r162-table th:nth-child(1),#page-contrato .r162-table td:nth-child(1){width:12%}
      #page-contrato .r162-table th:nth-child(2),#page-contrato .r162-table td:nth-child(2){width:20%}
      #page-contrato .r162-table th:nth-child(3),#page-contrato .r162-table td:nth-child(3){width:16%}
      #page-contrato .r162-table th:nth-child(4),#page-contrato .r162-table td:nth-child(4){width:28%}
      #page-contrato .r162-table th:nth-child(5),#page-contrato .r162-table td:nth-child(5),
      #page-contrato .r162-table th:nth-child(6),#page-contrato .r162-table td:nth-child(6){width:12%;text-align:right}
      #page-contrato .r162-detail{white-space:pre-line;overflow-wrap:anywhere}
      #page-contrato .r162-empty{padding:26px 14px;text-align:center;color:var(--muted)}
      @media(max-width:850px){#page-contrato .r162-kpis{grid-template-columns:1fr 1fr}}
      @media(max-width:520px){#page-contrato .r162-kpis{grid-template-columns:1fr}#page-contrato .r162-toolbar label{min-width:100%;width:100%}}
    `;
    document.head.appendChild(s);
  }

  function eps(){
    return Array.isArray(window.state?.contractData?.edp)?window.state.contractData.edp:[];
  }

  function budgetDetail(row){
    const lines=(Array.isArray(row?.materiales)?row.materiales:[]).map(x=>{
      const name=String(x?.detalle||'').trim();
      if(!name)return '';
      const qty=Number(x?.cantidad)||0,unit=String(x?.unidad||'').trim();
      if(qty<=0)return name;
      const q=Number.isInteger(qty)?String(qty):qty.toLocaleString('es-CL',{maximumFractionDigits:2});
      if(unit.toLowerCase()==='unidad')return `${name} (${q} ${qty===1?'unidad':'unidades'})`;
      return unit?`${name} (${q} ${unit})`:`${name} (${q})`;
    }).filter(Boolean);
    if(lines.length)return lines.join('\n');
    const obs=String(row?.observacion||'').trim();
    return obs||'—';
  }

  async function fetchRows(){
    const q=await window.sb.from(TABLE)
      .select('id,codigo,equipo_nombre,fecha,materiales,observacion,venta_neta,iva,total_final,estado_pago_id,tipo_imputacion')
      .eq('tipo_imputacion','estandarizacion')
      .not('estado_pago_id','is',null)
      .order('fecha',{ascending:false})
      .order('created_at',{ascending:false});
    if(q.error)throw q.error;
    return q.data||[];
  }

  function selectedEpId(rows){
    const available=new Set((rows||[]).map(x=>String(x.estado_pago_id||'')).filter(Boolean));
    const current=String(window.state?.r162StandardizationEpId||'');
    if(current&&available.has(current))return current;
    const ordered=[...eps()].sort((a,b)=>Number(b.ep_num)-Number(a.ep_num));
    const withRows=ordered.find(ep=>available.has(String(ep.id)));
    return String(withRows?.id||ordered[0]?.id||'');
  }

  function epOptionHtml(selected){
    return [...eps()].sort((a,b)=>Number(b.ep_num)-Number(a.ep_num)).map(ep=>{
      const label=`EP${ep.ep_num} · ${months[Number(ep.mes_edp)-1]||ep.mes_edp} ${ep.anio_edp}`;
      return `<option value="${esc(ep.id)}" ${String(ep.id)===String(selected)?'selected':''}>${esc(label)}</option>`;
    }).join('');
  }

  async function render(){
    if(window.state?.contractTab!==TAB)return false;
    const host=document.getElementById('contractContent');
    if(!host||loading)return false;
    loading=true;
    installStyle();
    host.innerHTML='<div class="empty">Cargando Estandarización e Innovación…</div>';
    try{
      const rows=await fetchRows();
      if(window.state?.contractTab!==TAB||!host.isConnected)return false;
      const epId=selectedEpId(rows);
      window.state.r162StandardizationEpId=epId;
      const ep=eps().find(x=>String(x.id)===String(epId))||null;
      const filtered=rows.filter(x=>String(x.estado_pago_id)===String(epId));
      const net=filtered.reduce((s,x)=>s+num(x.venta_neta),0);
      const iva=filtered.reduce((s,x)=>s+num(x.iva),0);
      const total=filtered.reduce((s,x)=>s+num(x.total_final),0);
      host.innerHTML=`
        <div class="r162-toolbar">
          <div>
            <h3 style="margin:0 0 3px">Estandarización e Innovación</h3>
            <div class="muted">Presupuestos imputados al Estado de Pago seleccionado como Estandarización e Innovación.</div>
          </div>
          <label>Estado de Pago
            <select class="field" id="r162EpSelect">${epOptionHtml(epId)}</select>
          </label>
        </div>
        <div class="r162-kpis">
          <div class="r162-kpi"><span>Presupuestos asignados</span><b>${filtered.length}</b></div>
          <div class="r162-kpi"><span>Monto neto</span><b>${money(net)}</b></div>
          <div class="r162-kpi"><span>IVA</span><b>${money(iva)}</b></div>
          <div class="r162-kpi"><span>Total IVA incluido</span><b>${money(total)}</b></div>
        </div>
        <div class="notice r162-note">
          ${ep?`EP${esc(ep.ep_num)} · ${esc(months[Number(ep.mes_edp)-1]||ep.mes_edp)} ${esc(ep.anio_edp)} · ${esc(dateCL(ep.periodo_inicio))} → ${esc(dateCL(ep.periodo_fin))}`:'Sin Estado de Pago seleccionado'}.
          Los montos se obtienen automáticamente desde los presupuestos asignados; no se duplican dentro de Gastos Reembolsables.
        </div>
        <div class="r162-table"><table>
          <thead><tr><th>Fecha</th><th>Código</th><th>Equipo</th><th>Detalle</th><th>Monto neto</th><th>Total IVA incluido</th></tr></thead>
          <tbody>${filtered.map(row=>`
            <tr>
              <td>${esc(dateCL(row.fecha))}</td>
              <td><b>${esc(row.codigo||'—')}</b></td>
              <td>${esc(row.equipo_nombre||'—')}</td>
              <td class="r162-detail">${esc(budgetDetail(row))}</td>
              <td><b>${money(row.venta_neta)}</b></td>
              <td><b>${money(row.total_final)}</b></td>
            </tr>`).join('')||'<tr><td colspan="6"><div class="r162-empty">No hay presupuestos asignados a Estandarización e Innovación para este EDP.</div></td></tr>'}
          </tbody>
        </table></div>`;
      host.querySelector('#r162EpSelect')?.addEventListener('change',event=>{
        window.state.r162StandardizationEpId=event.target.value;
        render();
      });
      return true;
    }catch(error){
      if(host.isConnected)host.innerHTML=`<div class="notice error">No fue posible cargar Estandarización e Innovación: ${esc(error?.message||error||'Error desconocido')}</div>`;
      return false;
    }finally{
      loading=false;
    }
  }

  function decorateTabs(){
    const tabs=document.querySelector('#page-contrato .contract-tabs');
    if(!tabs)return false;
    let btn=tabs.querySelector('[data-r162-standardization-tab]');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className='contract-tab';
      btn.dataset.r162StandardizationTab='1';
      btn.textContent='Estandarización e Innovación';
      btn.addEventListener('click',()=>{
        window.state=window.state||{};
        window.state.contractTab=TAB;
        if(typeof window.renderContractTab==='function')window.renderContractTab();
        else render();
      });
    }
    const ggrr=[...tabs.querySelectorAll('.contract-tab')].find(x=>norm(x.textContent)==='gastos reembolsables');
    if(ggrr&&ggrr.nextElementSibling!==btn)ggrr.insertAdjacentElement('afterend',btn);
    else if(!btn.isConnected)tabs.appendChild(btn);
    tabs.querySelectorAll('.contract-tab').forEach(x=>x.classList.toggle('active',x===btn&&window.state?.contractTab===TAB));
    return true;
  }

  function wrapRenderContractTab(){
    const current=window.renderContractTab;
    if(typeof current!=='function')return false;
    if(current.__r162)return true;
    const wrapped=function(){
      decorateTabs();
      if(window.state?.contractTab===TAB)return render();
      const out=current.apply(this,arguments);
      requestAnimationFrame(decorateTabs);
      return out;
    };
    wrapped.__r162=true;
    wrapped.__base=current;
    window.renderContractTab=wrapped;
    try{renderContractTab=wrapped}catch(_){}
    return true;
  }

  function wrapRenderContrato(){
    const current=window.renderContrato;
    if(typeof current!=='function')return false;
    if(current.__r162)return true;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      requestAnimationFrame(()=>{decorateTabs();if(window.state?.contractTab===TAB)render()});
      return out;
    };
    wrapped.__r162=true;
    wrapped.__base=current;
    window.renderContrato=wrapped;
    try{renderContrato=wrapped}catch(_){}
    return true;
  }

  function install(){
    installStyle();
    wrapRenderContrato();
    wrapRenderContractTab();
    decorateTabs();
    if(window.state?.contractTab===TAB)render();
    if(!observer){
      const root=document.getElementById('page-contrato')||document.body;
      observer=new MutationObserver(()=>requestAnimationFrame(decorateTabs));
      observer.observe(root,{childList:true,subtree:true});
    }
  }

  window.StainherContractStandardizationR162=Object.freeze({install,render,decorateTabs,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:runtime-r142-ready',install);
})();
