/* Stainher V15.24 · R80 · Presupuestos técnico comerciales
 * Administración del Contrato -> Presupuestos
 * Código: NOMBRE-EQUIPO-PE-DD-MM-AA
 */
(()=>{
  'use strict';
  const BUILD='20260916-r80-presupuestos';
  if(window.__STAINHER_PRESUPUESTOS_R80__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_R80__=BUILD;

  const TABLE='presupuestos_tecnico_comerciales_v1524';
  const IVA=0.19;
  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const n=value=>Number(value)||0;
  const clp=value=>typeof window.fmtCLP==='function'?window.fmtCLP(Math.round(n(value))):'$ '+Math.round(n(value)).toLocaleString('es-CL');
  const todayIso=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const fmtDate=value=>{const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(value||'')};
  const slug=value=>String(value||'EQUIPO').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'EQUIPO';
  const codeFor=(equipment,date)=>`${slug(equipment)}-PE-${fmtDate(date).slice(0,8)}`;
  const currentUserId=()=>String(window.state?.session?.user?.id||window.state?.user?.id||'');

  function mountStyle(){
    if(document.getElementById('stainher-presupuestos-r80-style'))return;
    const s=document.createElement('style');s.id='stainher-presupuestos-r80-style';s.textContent=`
      #page-contrato .r80-budget-toolbar{display:flex;gap:8px;align-items:center;justify-content:space-between;flex-wrap:wrap;margin-bottom:12px}
      #page-contrato .r80-budget-kpis{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:9px;margin:10px 0 14px}
      #page-contrato .r80-budget-kpi{border:1px solid var(--line);border-radius:11px;padding:11px;background:var(--panel,#0d141c);min-width:0}
      #page-contrato .r80-budget-kpi span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase}
      #page-contrato .r80-budget-kpi b{display:block;margin-top:5px;font-size:18px;overflow-wrap:anywhere}
      #page-contrato .r80-budget-form{display:grid;gap:14px}
      #page-contrato .r80-budget-head{display:grid;grid-template-columns:minmax(200px,1fr) 180px minmax(240px,1fr) 140px;gap:10px;align-items:end}
      #page-contrato .r80-budget-head label,#page-contrato .r80-budget-form label{display:grid;gap:5px;color:var(--muted);font-size:10px}
      #page-contrato .r80-budget-code{min-height:42px;display:flex;align-items:center;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:var(--panel2);font-weight:700;overflow-wrap:anywhere}
      #page-contrato .r80-line-panel{border:1px solid var(--line);border-radius:11px;overflow:hidden;background:var(--panel,#0d141c)}
      #page-contrato .r80-line-head{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px 12px;background:var(--panel2)}
      #page-contrato .r80-line-head h4{margin:0;font-size:13px}
      #page-contrato .r80-lines{display:grid}
      #page-contrato .r80-line{display:grid;gap:7px;align-items:center;padding:8px 10px;border-top:1px solid var(--line)}
      #page-contrato .r80-material{grid-template-columns:minmax(220px,1.8fr) 90px 120px 140px 130px 42px}
      #page-contrato .r80-freight{grid-template-columns:minmax(260px,1.8fr) 90px 160px 42px}
      #page-contrato .r80-line:first-child{border-top:0}
      #page-contrato .r80-line .field{min-width:0;width:100%}
      #page-contrato .r80-line-total{text-align:right;font-weight:700;white-space:nowrap}
      #page-contrato .r80-remove{min-width:38px;padding:8px!important}
      #page-contrato .r80-summary{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      #page-contrato .r80-summary-card{border:1px solid var(--line);border-radius:11px;overflow:hidden;background:var(--panel,#0d141c)}
      #page-contrato .r80-summary-card h4{margin:0;padding:10px 12px;background:var(--panel2);font-size:12px}
      #page-contrato .r80-summary-row{display:grid;grid-template-columns:1fr auto;gap:12px;padding:8px 12px;border-top:1px solid var(--line);align-items:center}
      #page-contrato .r80-summary-row:first-of-type{border-top:0}
      #page-contrato .r80-summary-row.total{font-weight:800}
      #page-contrato .r80-summary-row.grand{font-size:15px;background:rgba(239,91,42,.08)}
      #page-contrato .r80-budget-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
      #page-contrato .r80-budget-list{overflow:auto;border:1px solid var(--line);border-radius:11px}
      #page-contrato .r80-budget-list table{width:100%;border-collapse:collapse;min-width:980px}
      #page-contrato .r80-budget-list th,#page-contrato .r80-budget-list td{padding:9px 10px;border-bottom:1px solid var(--line);text-align:left;font-size:10px;vertical-align:middle}
      #page-contrato .r80-budget-list th{background:var(--panel2);color:var(--muted);position:sticky;top:0}
      #page-contrato .r80-budget-list td.money{text-align:right;font-variant-numeric:tabular-nums}
      #page-contrato .r80-budget-list .actions{display:flex;gap:6px;justify-content:flex-end;white-space:nowrap}
      #page-contrato .r80-empty{padding:22px;text-align:center;color:var(--muted)}
      @media(max-width:900px){
        #page-contrato .r80-budget-kpis{grid-template-columns:1fr 1fr}
        #page-contrato .r80-budget-head{grid-template-columns:1fr 1fr}
        #page-contrato .r80-summary{grid-template-columns:1fr}
        #page-contrato .r80-material{grid-template-columns:1fr 1fr}
        #page-contrato .r80-material>*:first-child{grid-column:1/-1}
        #page-contrato .r80-material .r80-line-total{grid-column:1/2;text-align:left}
        #page-contrato .r80-freight{grid-template-columns:1fr 1fr}
        #page-contrato .r80-freight>*:first-child{grid-column:1/-1}
      }
      @media(max-width:520px){#page-contrato .r80-budget-kpis,#page-contrato .r80-budget-head{grid-template-columns:1fr}#page-contrato .r80-budget-actions .btn{width:100%}}
    `;document.head.appendChild(s);
  }

  function store(){
    window.state=window.state||{};
    window.state.r80Budgets=window.state.r80Budgets||{rows:[],equipment:[],editing:null,loading:false};
    return window.state.r80Budgets;
  }

  function calc(draft){
    const subtotal_materiales=(draft.materiales||[]).reduce((a,x)=>a+n(x.cantidad)*n(x.precio_unitario),0);
    const subtotal_fletes=(draft.fletes||[]).reduce((a,x)=>a+n(x.monto_total),0);
    const total_costos_netos=subtotal_materiales+subtotal_fletes;
    const utilidad=Math.round(total_costos_netos*n(draft.utilidad_pct)/100);
    const venta_neta=Math.round(total_costos_netos+utilidad);
    const iva=Math.round(venta_neta*IVA);
    const total_final=venta_neta+iva;
    return {subtotal_materiales,subtotal_fletes,total_costos_netos,utilidad,venta_neta,iva,total_final};
  }

  function emptyDraft(){return {id:null,equipo_id:'',equipo_nombre:'',fecha:todayIso(),utilidad_pct:7,materiales:[{detalle:'',cantidad:1,unidad:'Unidad',precio_unitario:0}],fletes:[{detalle:'Flete Terrestre',cantidad:1,monto_total:0}],observacion:'',estado:'borrador'}}
  function cloneBudget(row){return {...row,materiales:Array.isArray(row.materiales)?row.materiales.map(x=>({...x})):[],fletes:Array.isArray(row.fletes)?row.fletes.map(x=>({...x})):[]}}

  async function loadEquipment(){
    const s=store();
    const cached=(window.state?.equipos||[]).filter(x=>String(x.estado||'activo')!=='retirado').map(x=>({id:x.id,nombre:x.nombre,estado:x.estado}));
    if(cached.length){s.equipment=cached.sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre),'es'));return}
    const out=await window.sb.from('equipos').select('id,nombre,estado').neq('estado','retirado').order('nombre');
    if(!out.error)s.equipment=out.data||[];
  }

  async function loadRows(){
    const s=store();s.loading=true;
    const out=await window.sb.from(TABLE).select('*').order('fecha',{ascending:false}).order('created_at',{ascending:false});
    s.loading=false;
    if(out.error){
      const body=document.getElementById('r80BudgetBody');
      if(body)body.innerHTML=`<div class="notice error">${esc(out.error.message)}<br><small>La migración de Presupuestos aún no está aplicada en Supabase.</small></div>`;
      return;
    }
    s.rows=out.data||[];
    renderList();
  }

  function mountTab(){
    const tabs=document.querySelector('#page-contrato .contract-tabs');if(!tabs)return;
    let btn=tabs.querySelector('[data-r80-budget-tab]');
    if(!btn){btn=document.createElement('button');btn.type='button';btn.className='contract-tab';btn.dataset.r80BudgetTab='1';btn.textContent='Presupuestos';btn.addEventListener('click',()=>{window.state.contractTab='presupuestos';window.renderContractTab?.()});const forecast=[...tabs.querySelectorAll('.contract-tab')].find(x=>/Forecast/i.test(x.textContent||''));forecast?tabs.insertBefore(btn,forecast):tabs.appendChild(btn)}
    tabs.querySelectorAll('.contract-tab').forEach(x=>x.classList.toggle('active',x===btn?window.state?.contractTab==='presupuestos':x.classList.contains('active')&&window.state?.contractTab!=='presupuestos'));
  }

  function renderShell(){
    const c=document.getElementById('contractContent');if(!c)return;
    c.innerHTML=`<div class="r80-budget-toolbar"><div><h3 style="margin:0 0 3px">Presupuestos técnico comerciales</h3><div class="muted">Crea propuestas por equipo y genera PDF con el formato de informes Stainher.</div></div><button class="btn primary" type="button" data-r80-new>+ Nuevo presupuesto</button></div><div id="r80BudgetBody"><div class="empty">Cargando presupuestos…</div></div>`;
    c.querySelector('[data-r80-new]')?.addEventListener('click',()=>openEditor());
  }

  function renderBudgetTab(){mountTab();renderShell();Promise.all([loadEquipment(),loadRows()]).catch(error=>window.toast?.(error.message||String(error),'error'))}

  function renderList(){
    const body=document.getElementById('r80BudgetBody');if(!body)return;
    const s=store(),rows=s.rows||[],total=rows.reduce((a,x)=>a+n(x.total_final),0),emitidos=rows.filter(x=>x.estado==='emitido').length;
    body.innerHTML=`<div class="r80-budget-kpis"><div class="r80-budget-kpi"><span>Presupuestos</span><b>${rows.length}</b></div><div class="r80-budget-kpi"><span>Emitidos</span><b>${emitidos}</b></div><div class="r80-budget-kpi"><span>Valor total registrado</span><b>${clp(total)}</b></div><div class="r80-budget-kpi"><span>Formato</span><b>PE · PDF</b></div></div><div class="r80-budget-list"><table><thead><tr><th>Código</th><th>Equipo</th><th>Fecha</th><th>Estado</th><th style="text-align:right">Venta neta</th><th style="text-align:right">IVA</th><th style="text-align:right">Total</th><th style="text-align:right">Acciones</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.codigo)}</b></td><td>${esc(r.equipo_nombre)}</td><td>${esc(fmtDate(r.fecha))}</td><td>${esc(r.estado||'borrador')}</td><td class="money">${clp(r.venta_neta)}</td><td class="money">${clp(r.iva)}</td><td class="money"><b>${clp(r.total_final)}</b></td><td><div class="actions"><button class="btn" data-r80-edit="${esc(r.id)}">Editar</button><button class="btn" data-r80-pdf="${esc(r.id)}">PDF</button><button class="btn danger-btn" data-r80-delete="${esc(r.id)}">Eliminar</button></div></td></tr>`).join('')||'<tr><td colspan="8"><div class="r80-empty">Aún no hay presupuestos registrados.</div></td></tr>'}</tbody></table></div>`;
    body.querySelectorAll('[data-r80-edit]').forEach(b=>b.addEventListener('click',()=>openEditor(b.dataset.r80Edit)));
    body.querySelectorAll('[data-r80-pdf]').forEach(b=>b.addEventListener('click',()=>downloadPdf(b.dataset.r80Pdf)));
    body.querySelectorAll('[data-r80-delete]').forEach(b=>b.addEventListener('click',()=>deleteBudget(b.dataset.r80Delete)));
  }

  function equipmentOptions(selected){return `<option value="">Seleccionar equipo</option>${store().equipment.map(e=>`<option value="${esc(e.id)}" data-name="${esc(e.nombre)}" ${String(e.id)===String(selected)?'selected':''}>${esc(e.nombre)}</option>`).join('')}`}
  function matRow(x={},i=0){return `<div class="r80-line r80-material" data-r80-mat-row><input class="field" data-field="detalle" value="${esc(x.detalle||'')}" placeholder="Detalle"><input class="field" type="number" min="0" step="0.01" data-field="cantidad" value="${n(x.cantidad)||1}"><input class="field" data-field="unidad" value="${esc(x.unidad||'Unidad')}"><input class="field" type="number" min="0" step="1" data-field="precio_unitario" value="${Math.round(n(x.precio_unitario))}"><div class="r80-line-total" data-r80-mat-total>${clp(n(x.cantidad)*n(x.precio_unitario))}</div><button class="btn danger-btn r80-remove" type="button" data-r80-remove-mat title="Eliminar">×</button></div>`}
  function freightRow(x={},i=0){return `<div class="r80-line r80-freight" data-r80-freight-row><input class="field" data-field="detalle" value="${esc(x.detalle||'')}" placeholder="Detalle"><input class="field" type="number" min="0" step="0.01" data-field="cantidad" value="${n(x.cantidad)||1}"><input class="field" type="number" min="0" step="1" data-field="monto_total" value="${Math.round(n(x.monto_total))}"><button class="btn danger-btn r80-remove" type="button" data-r80-remove-freight title="Eliminar">×</button></div>`}

  function openEditor(id){
    const s=store(),row=id?s.rows.find(x=>String(x.id)===String(id)):null;s.editing=row?cloneBudget(row):emptyDraft();renderEditor();
  }

  function renderEditor(){
    const body=document.getElementById('r80BudgetBody');if(!body)return;const d=store().editing||emptyDraft(),code=codeFor(d.equipo_nombre,d.fecha),k=calc(d);
    body.innerHTML=`<div class="panel r80-budget-form"><div class="row-between"><div><h3 style="margin:0">${d.id?'Editar':'Nuevo'} presupuesto</h3><div class="muted">Propuesta técnico comercial</div></div><button class="btn" type="button" data-r80-back>← Volver al historial</button></div><div class="r80-budget-head"><label>Equipo<select class="field" id="r80BudgetEquipment">${equipmentOptions(d.equipo_id)}</select></label><label>Fecha<input class="field" id="r80BudgetDate" type="date" value="${esc(d.fecha||todayIso())}"></label><label>Código del documento<div class="r80-budget-code" id="r80BudgetCode">${esc(code)}</div></label><label>Utilidad %<input class="field" id="r80BudgetMargin" type="number" min="0" step="0.1" value="${n(d.utilidad_pct)}"></label></div><div class="r80-line-panel"><div class="r80-line-head"><h4>Costo de materiales</h4><button class="btn" type="button" data-r80-add-mat>+ Agregar material</button></div><div class="r80-lines" id="r80MaterialLines">${(d.materiales?.length?d.materiales:[{}]).map(matRow).join('')}</div></div><div class="r80-line-panel"><div class="r80-line-head"><h4>Costo de fletes o transportes</h4><button class="btn" type="button" data-r80-add-freight>+ Agregar flete</button></div><div class="r80-lines" id="r80FreightLines">${(d.fletes?.length?d.fletes:[{}]).map(freightRow).join('')}</div></div><label>Observación<textarea class="field" id="r80BudgetObservation" rows="3" placeholder="Observación opcional">${esc(d.observacion||'')}</textarea></label><div class="r80-summary"><div class="r80-summary-card"><h4>Resumen de costos</h4><div class="r80-summary-row"><span>Materiales</span><b id="r80SumMaterials">${clp(k.subtotal_materiales)}</b></div><div class="r80-summary-row"><span>Fletes</span><b id="r80SumFreight">${clp(k.subtotal_fletes)}</b></div><div class="r80-summary-row total"><span>Total costos netos</span><b id="r80SumCosts">${clp(k.total_costos_netos)}</b></div><div class="r80-summary-row"><span>Utilidad</span><b id="r80SumMargin">${clp(k.utilidad)}</b></div><div class="r80-summary-row total"><span>Subtotal</span><b id="r80SumNet">${clp(k.venta_neta)}</b></div></div><div class="r80-summary-card"><h4>Venta final</h4><div class="r80-summary-row"><span>Total venta neta</span><b id="r80FinalNet">${clp(k.venta_neta)}</b></div><div class="r80-summary-row"><span>IVA (19%)</span><b id="r80FinalIva">${clp(k.iva)}</b></div><div class="r80-summary-row grand"><span>TOTAL</span><b id="r80FinalTotal">${clp(k.total_final)}</b></div></div></div><div class="r80-budget-actions"><button class="btn" type="button" data-r80-preview>↓ Generar PDF</button><button class="btn primary" type="button" data-r80-save>Guardar presupuesto</button></div></div>`;
    bindEditor();
  }

  function readDraft(){
    const select=document.getElementById('r80BudgetEquipment'),opt=select?.selectedOptions?.[0];
    return {id:store().editing?.id||null,equipo_id:select?.value||'',equipo_nombre:opt?.dataset?.name||opt?.textContent||'',fecha:document.getElementById('r80BudgetDate')?.value||todayIso(),utilidad_pct:n(document.getElementById('r80BudgetMargin')?.value),materiales:[...document.querySelectorAll('[data-r80-mat-row]')].map(row=>({detalle:row.querySelector('[data-field="detalle"]')?.value?.trim()||'',cantidad:n(row.querySelector('[data-field="cantidad"]')?.value),unidad:row.querySelector('[data-field="unidad"]')?.value?.trim()||'Unidad',precio_unitario:n(row.querySelector('[data-field="precio_unitario"]')?.value)})).filter(x=>x.detalle||x.precio_unitario),fletes:[...document.querySelectorAll('[data-r80-freight-row]')].map(row=>({detalle:row.querySelector('[data-field="detalle"]')?.value?.trim()||'',cantidad:n(row.querySelector('[data-field="cantidad"]')?.value),monto_total:n(row.querySelector('[data-field="monto_total"]')?.value)})).filter(x=>x.detalle||x.monto_total),observacion:document.getElementById('r80BudgetObservation')?.value?.trim()||'',estado:store().editing?.estado||'borrador'};
  }

  function syncSummary(){
    const d=readDraft(),k=calc(d),code=codeFor(d.equipo_nombre,d.fecha);const set=(id,val)=>{const el=document.getElementById(id);if(el)el.textContent=val};
    set('r80BudgetCode',code);set('r80SumMaterials',clp(k.subtotal_materiales));set('r80SumFreight',clp(k.subtotal_fletes));set('r80SumCosts',clp(k.total_costos_netos));set('r80SumMargin',clp(k.utilidad));set('r80SumNet',clp(k.venta_neta));set('r80FinalNet',clp(k.venta_neta));set('r80FinalIva',clp(k.iva));set('r80FinalTotal',clp(k.total_final));
    document.querySelectorAll('[data-r80-mat-row]').forEach(row=>{const qty=n(row.querySelector('[data-field="cantidad"]')?.value),price=n(row.querySelector('[data-field="precio_unitario"]')?.value),total=row.querySelector('[data-r80-mat-total]');if(total)total.textContent=clp(qty*price)});
  }

  function bindEditor(){
    const body=document.getElementById('r80BudgetBody');if(!body)return;
    body.querySelector('[data-r80-back]')?.addEventListener('click',renderList);
    body.querySelector('[data-r80-add-mat]')?.addEventListener('click',()=>{document.getElementById('r80MaterialLines')?.insertAdjacentHTML('beforeend',matRow({cantidad:1,unidad:'Unidad'}));bindLineRemovers();syncSummary()});
    body.querySelector('[data-r80-add-freight]')?.addEventListener('click',()=>{document.getElementById('r80FreightLines')?.insertAdjacentHTML('beforeend',freightRow({cantidad:1}));bindLineRemovers();syncSummary()});
    body.addEventListener('input',e=>{if(e.target.matches('input,select,textarea'))syncSummary()});
    body.addEventListener('change',e=>{if(e.target.matches('input,select,textarea'))syncSummary()});
    body.querySelector('[data-r80-save]')?.addEventListener('click',saveBudget);
    body.querySelector('[data-r80-preview]')?.addEventListener('click',()=>downloadPdfFromDraft(readDraft()));
    bindLineRemovers();
  }
  function bindLineRemovers(){
    document.querySelectorAll('[data-r80-remove-mat]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{const rows=document.querySelectorAll('[data-r80-mat-row]');if(rows.length<=1)return window.toast?.('Debe quedar al menos una fila de materiales.','warn');b.closest('[data-r80-mat-row]')?.remove();syncSummary()})});
    document.querySelectorAll('[data-r80-remove-freight]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{const rows=document.querySelectorAll('[data-r80-freight-row]');if(rows.length<=1)return window.toast?.('Debe quedar al menos una fila de fletes.','warn');b.closest('[data-r80-freight-row]')?.remove();syncSummary()})});
  }

  async function saveBudget(){
    const d=readDraft();if(!d.equipo_id||!d.equipo_nombre)return window.toast?.('Selecciona un equipo.','error');if(!d.fecha)return window.toast?.('Selecciona la fecha del presupuesto.','error');
    const k=calc(d),payload={codigo:codeFor(d.equipo_nombre,d.fecha),equipo_id:d.equipo_id,equipo_nombre:d.equipo_nombre,fecha:d.fecha,materiales:d.materiales,fletes:d.fletes,utilidad_pct:d.utilidad_pct,...k,observacion:d.observacion,estado:d.estado,created_by:currentUserId(),updated_at:new Date().toISOString()};
    let out;if(d.id)out=await window.sb.from(TABLE).update(payload).eq('id',d.id).select('*').single();else out=await window.sb.from(TABLE).insert(payload).select('*').single();
    if(out.error)return window.toast?.(out.error.code==='23505'?'Ya existe un presupuesto para ese equipo y fecha.':out.error.message||String(out.error),'error');
    window.toast?.('Presupuesto guardado correctamente.','success');store().editing=null;await loadRows();
  }

  async function deleteBudget(id){if(!window.confirm?.('¿Eliminar este presupuesto?'))return;const out=await window.sb.from(TABLE).delete().eq('id',id);if(out.error)return window.toast?.(out.error.message||String(out.error),'error');window.toast?.('Presupuesto eliminado.','success');await loadRows()}

  async function savedSignature(){
    try{const uid=currentUserId();if(!uid)return null;const out=await window.sb.from('firmas_usuario_v1524').select('imagen_png').eq('user_id',uid).maybeSingle();return out.error?null:String(out.data?.imagen_png||'')||null}catch(_){return null}
  }

  async function downloadPdf(id){const row=store().rows.find(x=>String(x.id)===String(id));if(!row)return;await downloadPdfFromDraft(cloneBudget(row),true)}
  async function downloadPdfFromDraft(draft,markIssued=false){
    if(!draft.equipo_nombre||!draft.fecha)return window.toast?.('Selecciona equipo y fecha antes de generar el PDF.','error');
    const C=typeof window.ensurePdf==='function'?window.ensurePdf():window.jspdf?.jsPDF;if(!C)return window.toast?.('No se pudo cargar el generador PDF.','error');
    const k=calc(draft),code=codeFor(draft.equipo_nombre,draft.fecha),doc=new C({orientation:'portrait',unit:'mm',format:'a4'});
    if(typeof window.pdfHeader==='function')window.pdfHeader(doc,'Propuesta Técnico Comercial',`${code} · ${draft.equipo_nombre}`);else{doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('STAINHER',14,16);doc.setFontSize(14);doc.text('Propuesta Técnico Comercial',14,27);doc.setDrawColor(239,91,42);doc.line(14,38,196,38)}
    doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(`CÓDIGO: ${code}`,14,47);doc.text(`EQUIPO: ${draft.equipo_nombre}`,14,54);
    doc.autoTable({startY:62,theme:'grid',head:[[{content:'COSTO DE MATERIALES',colSpan:5,styles:{halign:'center'}}],['Detalle','Cantidad','Unidad','Precio Unitario','Monto Total']],body:(draft.materiales||[]).map(x=>[x.detalle||'',n(x.cantidad).toLocaleString('es-CL'),x.unidad||'',clp(x.precio_unitario),clp(n(x.cantidad)*n(x.precio_unitario))]).concat([['TOTAL','','','',clp(k.subtotal_materiales)]]),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'center'},3:{halign:'right'},4:{halign:'right'}}});
    let y=doc.lastAutoTable.finalY+8;
    doc.autoTable({startY:y,theme:'grid',head:[[{content:'COSTO DE FLETES O TRANSPORTES',colSpan:3,styles:{halign:'center'}}],['Detalle','Cantidad','Monto Total']],body:(draft.fletes||[]).map(x=>[x.detalle||'',n(x.cantidad).toLocaleString('es-CL'),clp(x.monto_total)]).concat([['TOTAL','',clp(k.subtotal_fletes)]]),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'center'},2:{halign:'right'}}});
    y=doc.lastAutoTable.finalY+8;
    doc.autoTable({startY:y,theme:'grid',head:[[{content:'RESUMEN DE COSTOS',colSpan:2,styles:{halign:'center'}}],['Detalle','Valor Neto']],body:[['Materiales',clp(k.subtotal_materiales)],['Fletes',clp(k.subtotal_fletes)],['TOTAL COSTOS NETOS',clp(k.total_costos_netos)],[`UTILIDAD (${n(draft.utilidad_pct).toFixed(1)}%)`,clp(k.utilidad)],['SUBTOTAL',clp(k.venta_neta)]],styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'right'}}});
    y=doc.lastAutoTable.finalY+8;
    doc.autoTable({startY:y,theme:'grid',head:[[{content:'VENTA FINAL',colSpan:2,styles:{halign:'center'}}]],body:[['TOTAL VENTA NETA',clp(k.venta_neta)],['IVA (19%)',clp(k.iva)],['TOTAL',clp(k.total_final)]],styles:{fontSize:9,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'right'}},didParseCell:data=>{if(data.section==='body'&&data.row.index===2)data.cell.styles.fontStyle='bold'}});
    y=doc.lastAutoTable.finalY+10;
    if(draft.observacion){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(80);const lines=doc.splitTextToSize(`Observación: ${draft.observacion}`,180);doc.text(lines,14,y);y+=lines.length*4+4;doc.setTextColor(0)}
    const sig=window.__STAINHER_SAVED_SIGNATURE__||await savedSignature();const name=window.state?.profile?.nombre||'Ismael Eduardo Gálvez Reyes',cargo=window.state?.profile?.cargo||'Administrador de Contrato';
    if(y>250){doc.addPage();y=35}
    if(sig){try{doc.addImage(sig,'PNG',78,y,54,13);y+=14}catch(_){}}
    doc.setDrawColor(120);doc.line(65,y,145,y);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text(String(name),105,y+5,{align:'center'});doc.setFont('helvetica','normal');doc.text(String(cargo),105,y+9,{align:'center'});doc.text('Stainher Ascensores Limitada',105,y+13,{align:'center'});
    doc.setFontSize(7);doc.setTextColor(100);doc.text(`Generado ${new Date().toLocaleString('es-CL')} · Stainher App`,14,290);doc.save(`${code}.pdf`);
    if(markIssued&&draft.id&&draft.estado!=='emitido'){
      const out=await window.sb.from(TABLE).update({estado:'emitido',updated_at:new Date().toISOString()}).eq('id',draft.id);if(!out.error){const row=store().rows.find(x=>String(x.id)===String(draft.id));if(row)row.estado='emitido';renderList()}
    }
  }

  function install(){
    mountStyle();
    if(typeof window.renderContractTab==='function'&&!window.renderContractTab.__r80Budget){const base=window.renderContractTab;const wrapped=function(){mountTab();if(window.state?.contractTab==='presupuestos')return renderBudgetTab();const result=base.apply(this,arguments);requestAnimationFrame(mountTab);return result};wrapped.__r80Budget=true;wrapped.__base=base;window.renderContractTab=wrapped}
    if(typeof window.renderContrato==='function'&&!window.renderContrato.__r80Budget){const base=window.renderContrato;const wrapped=function(){const result=base.apply(this,arguments);requestAnimationFrame(()=>{mountTab();if(window.state?.contractTab==='presupuestos')renderBudgetTab()});return result};wrapped.__r80Budget=true;wrapped.__base=base;window.renderContrato=wrapped}
    mountTab();if(window.state?.contractTab==='presupuestos')renderBudgetTab();
  }

  install();
  window.addEventListener('stainher:modules-ready',install);
})();
