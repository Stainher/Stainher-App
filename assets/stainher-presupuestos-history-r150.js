/* Stainher V15.24 · R150 · Detalle visible en histórico de Presupuestos.
 * - Mantiene el historial compacto por defecto.
 * - Agrega acción "Detalle" por presupuesto.
 * - Despliega materiales, fletes, utilidad, totales y observación en la misma lista.
 */
(()=>{
  'use strict';
  const BUILD='20261019-r150-presupuestos-history-detail';
  if(window.__STAINHER_PRESUPUESTOS_HISTORY_R150__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_HISTORY_R150__=BUILD;

  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Number(v)||0;
  const money=v=>typeof window.fmtCLP==='function'?window.fmtCLP(Math.round(num(v))):'$ '+Math.round(num(v)).toLocaleString('es-CL');

  function rows(){
    return Array.isArray(window.state?.r80Budgets?.rows)?window.state.r80Budgets.rows:[];
  }
  function budget(id){
    return rows().find(x=>String(x.id)===String(id))||null;
  }

  function installStyle(){
    if(document.getElementById('stainher-presupuestos-history-r150-style'))return;
    const s=document.createElement('style');
    s.id='stainher-presupuestos-history-r150-style';
    s.textContent=`
      #page-contrato .r80-list .actions{
        grid-template-columns:repeat(4,minmax(58px,1fr))!important;
      }
      #page-contrato .r150-detail-row>td{
        padding:0!important;
        background:rgba(15,23,32,.72)!important;
      }
      #page-contrato .r150-detail-panel{
        padding:14px 16px 16px!important;
        border-top:1px solid var(--line,#334155)!important;
      }
      #page-contrato .r150-detail-head{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:12px!important;
        flex-wrap:wrap!important;
        margin-bottom:12px!important;
      }
      #page-contrato .r150-detail-head h4{
        margin:0 0 4px!important;
        font-size:14px!important;
      }
      #page-contrato .r150-detail-meta{
        color:var(--muted,#94a3b8)!important;
        font-size:11px!important;
      }
      #page-contrato .r150-detail-grid{
        display:grid!important;
        grid-template-columns:minmax(0,1.2fr) minmax(0,.8fr)!important;
        gap:12px!important;
      }
      #page-contrato .r150-card{
        min-width:0!important;
        border:1px solid var(--line,#334155)!important;
        border-radius:10px!important;
        overflow:hidden!important;
        background:var(--panel,#0d141c)!important;
      }
      #page-contrato .r150-card h5{
        margin:0!important;
        padding:9px 11px!important;
        background:var(--panel2,#111923)!important;
        font-size:11px!important;
      }
      #page-contrato .r150-detail-table{
        width:100%!important;
        min-width:0!important;
        table-layout:auto!important;
        border-collapse:collapse!important;
      }
      #page-contrato .r150-detail-table th,
      #page-contrato .r150-detail-table td{
        padding:8px 10px!important;
        border-bottom:1px solid var(--line,#334155)!important;
        border-right:0!important;
        overflow:visible!important;
        text-overflow:clip!important;
        white-space:normal!important;
        overflow-wrap:anywhere!important;
        font-size:10px!important;
      }
      #page-contrato .r150-detail-table tr:last-child td{border-bottom:0!important}
      #page-contrato .r150-detail-table th{
        color:var(--muted,#94a3b8)!important;
        text-align:left!important;
        background:transparent!important;
      }
      #page-contrato .r150-detail-table .num{
        text-align:right!important;
        white-space:nowrap!important;
        font-variant-numeric:tabular-nums!important;
      }
      #page-contrato .r150-summary{
        display:grid!important;
        gap:0!important;
      }
      #page-contrato .r150-summary-row{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        gap:12px!important;
        align-items:center!important;
        padding:8px 10px!important;
        border-bottom:1px solid var(--line,#334155)!important;
        font-size:10px!important;
      }
      #page-contrato .r150-summary-row:last-child{border-bottom:0!important}
      #page-contrato .r150-summary-row strong{
        font-variant-numeric:tabular-nums!important;
        white-space:nowrap!important;
      }
      #page-contrato .r150-summary-row.total{
        font-size:12px!important;
        font-weight:800!important;
        background:rgba(239,91,42,.07)!important;
      }
      #page-contrato .r150-observation{
        margin-top:12px!important;
        padding:10px 12px!important;
        border:1px solid var(--line,#334155)!important;
        border-radius:10px!important;
        background:var(--panel,#0d141c)!important;
        white-space:pre-wrap!important;
        overflow-wrap:anywhere!important;
        line-height:1.45!important;
        font-size:11px!important;
      }
      #page-contrato .r150-empty{
        padding:10px 12px!important;
        color:var(--muted,#94a3b8)!important;
        font-size:10px!important;
      }
      @media(max-width:900px){
        #page-contrato .r80-list .actions{grid-template-columns:repeat(2,minmax(70px,1fr))!important}
        #page-contrato .r150-detail-grid{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(s);
  }

  function materialRows(row){
    const items=Array.isArray(row?.materiales)?row.materiales:[];
    if(!items.length)return '<div class="r150-empty">Sin materiales registrados.</div>';
    return `<table class="r150-detail-table"><thead><tr><th>Detalle</th><th>Cantidad</th><th>Unidad</th><th class="num">Precio unitario</th><th class="num">Total</th></tr></thead><tbody>${items.map(x=>{
      const total=num(x.cantidad)*num(x.precio_unitario);
      return `<tr><td>${esc(x.detalle||'—')}</td><td>${esc(num(x.cantidad).toLocaleString('es-CL'))}</td><td>${esc(x.unidad||'—')}</td><td class="num">${money(x.precio_unitario)}</td><td class="num"><b>${money(total)}</b></td></tr>`;
    }).join('')}</tbody></table>`;
  }

  function freightRows(row){
    const items=Array.isArray(row?.fletes)?row.fletes:[];
    if(!items.length)return '<div class="r150-empty">Sin fletes o transportes registrados.</div>';
    return `<table class="r150-detail-table"><thead><tr><th>Detalle</th><th>Cantidad</th><th class="num">Monto total</th></tr></thead><tbody>${items.map(x=>
      `<tr><td>${esc(x.detalle||'—')}</td><td>${esc(num(x.cantidad).toLocaleString('es-CL'))}</td><td class="num"><b>${money(x.monto_total)}</b></td></tr>`
    ).join('')}</tbody></table>`;
  }

  function detailHtml(row){
    return `
      <div class="r150-detail-panel">
        <div class="r150-detail-head">
          <div>
            <h4>Detalle · ${esc(row.codigo||'Presupuesto')}</h4>
            <div class="r150-detail-meta">${esc(row.equipo_nombre||'')} · Utilidad: ${num(row.utilidad_pct).toLocaleString('es-CL')}%</div>
          </div>
        </div>
        <div class="r150-detail-grid">
          <div style="display:grid;gap:12px">
            <div class="r150-card"><h5>Materiales</h5>${materialRows(row)}</div>
            <div class="r150-card"><h5>Fletes o transportes</h5>${freightRows(row)}</div>
          </div>
          <div class="r150-card">
            <h5>Resumen económico</h5>
            <div class="r150-summary">
              <div class="r150-summary-row"><span>Materiales</span><strong>${money(row.subtotal_materiales)}</strong></div>
              <div class="r150-summary-row"><span>Fletes</span><strong>${money(row.subtotal_fletes)}</strong></div>
              <div class="r150-summary-row"><span>Total costos netos</span><strong>${money(row.total_costos_netos)}</strong></div>
              <div class="r150-summary-row"><span>Utilidad (${num(row.utilidad_pct).toLocaleString('es-CL')}%)</span><strong>${money(row.utilidad)}</strong></div>
              <div class="r150-summary-row"><span>Venta neta</span><strong>${money(row.venta_neta)}</strong></div>
              <div class="r150-summary-row"><span>IVA (19%)</span><strong>${money(row.iva)}</strong></div>
              <div class="r150-summary-row total"><span>Total</span><strong>${money(row.total_final)}</strong></div>
            </div>
          </div>
        </div>
        ${row.observacion?`<div class="r150-observation"><b>Observación:</b> ${esc(row.observacion)}</div>`:''}
      </div>`;
  }

  function closeDetail(button,detailRow){
    detailRow.hidden=true;
    button.textContent='Detalle';
    button.setAttribute('aria-expanded','false');
  }

  function toggleDetail(button,id,sourceRow){
    const next=sourceRow.nextElementSibling;
    let detailRow=next?.classList?.contains('r150-detail-row')?next:null;
    if(detailRow&&!detailRow.hidden){
      closeDetail(button,detailRow);
      return;
    }
    document.querySelectorAll('#page-contrato .r150-detail-row:not([hidden])').forEach(row=>{
      const owner=row.previousElementSibling?.querySelector('[data-r150-detail]');
      if(owner)closeDetail(owner,row);
      else row.hidden=true;
    });
    const row=budget(id);
    if(!row)return window.toast?.('No se encontró el detalle de este presupuesto.','error');
    if(!detailRow){
      detailRow=document.createElement('tr');
      detailRow.className='r150-detail-row';
      const td=document.createElement('td');
      td.colSpan=5;
      detailRow.appendChild(td);
      sourceRow.insertAdjacentElement('afterend',detailRow);
    }
    detailRow.querySelector('td').innerHTML=detailHtml(row);
    detailRow.hidden=false;
    button.textContent='Ocultar';
    button.setAttribute('aria-expanded','true');
  }

  function decorate(){
    installStyle();
    const table=document.querySelector('#page-contrato .r80-list table');
    if(!table)return false;
    [...table.querySelectorAll('tbody tr')].forEach(tr=>{
      if(tr.classList.contains('r150-detail-row'))return;
      const actions=tr.querySelector('.actions');
      const pdf=actions?.querySelector('[data-pdf]');
      const id=pdf?.dataset?.pdf;
      if(!actions||!id||actions.querySelector('[data-r150-detail]'))return;
      const btn=document.createElement('button');
      btn.type='button';
      btn.className='btn';
      btn.dataset.r150Detail=id;
      btn.textContent='Detalle';
      btn.setAttribute('aria-expanded','false');
      const edit=actions.querySelector('[data-edit]');
      if(edit)actions.insertBefore(btn,edit);
      else actions.prepend(btn);
      btn.addEventListener('click',()=>toggleDetail(btn,id,tr));
    });
    return true;
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

  window.StainherPresupuestosHistoryR150=Object.freeze({install,decorate,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
