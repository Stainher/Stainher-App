/* Stainher V15.24 · R80 · Presupuestos técnico comerciales
 * Administración del Contrato -> Presupuestos
 * Código: NOMBRE-EQUIPO-PE-DD-MM-AA
 */
(()=>{
  'use strict';
  const BUILD='20260916-r80-presupuestos-final';
  if(window.__STAINHER_PRESUPUESTOS_R80__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_R80__=BUILD;

  const TABLE='presupuestos_tecnico_comerciales_v1524';
  const IVA=0.19;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Number(v)||0;
  const money=v=>typeof window.fmtCLP==='function'?window.fmtCLP(Math.round(num(v))):'$ '+Math.round(num(v)).toLocaleString('es-CL');
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const dateCL=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(v||'')};
  const slug=v=>String(v||'EQUIPO').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'EQUIPO';
  const codeFor=(equipment,date)=>{const m=String(date||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return `${slug(equipment)}-PE-${m?`${m[3]}-${m[2]}-${m[1].slice(-2)}`:'SIN-FECHA'}`};
  const uid=()=>String(window.state?.session?.user?.id||window.state?.user?.id||'');

  function state(){window.state=window.state||{};return window.state.r80Budgets||(window.state.r80Budgets={rows:[],equipment:[],editing:null})}
  function calc(d){
    const subtotal_materiales=(d.materiales||[]).reduce((a,x)=>a+num(x.cantidad)*num(x.precio_unitario),0);
    const subtotal_fletes=(d.fletes||[]).reduce((a,x)=>a+num(x.monto_total),0);
    const total_costos_netos=subtotal_materiales+subtotal_fletes;
    const utilidad=Math.round(total_costos_netos*num(d.utilidad_pct)/100);
    const venta_neta=Math.round(total_costos_netos+utilidad);
    const iva=Math.round(venta_neta*IVA);
    const total_final=venta_neta+iva;
    return {subtotal_materiales,subtotal_fletes,total_costos_netos,utilidad,venta_neta,iva,total_final};
  }
  function blank(){return{id:null,equipo_id:'',equipo_nombre:'',fecha:today(),utilidad_pct:7,materiales:[{detalle:'',cantidad:1,unidad:'Unidad',precio_unitario:0}],fletes:[{detalle:'Flete Terrestre',cantidad:1,monto_total:0}],observacion:'',estado:'borrador'}}
  function clone(r){return{...r,materiales:Array.isArray(r.materiales)?r.materiales.map(x=>({...x})):[],fletes:Array.isArray(r.fletes)?r.fletes.map(x=>({...x})):[]}}

  function mountStyle(){
    if(document.getElementById('stainher-presupuestos-r80-style'))return;
    const s=document.createElement('style');s.id='stainher-presupuestos-r80-style';s.textContent=`
      #page-contrato .r80-toolbar{display:flex;justify-content:space-between;align-items:center;gap:10px;flex-wrap:wrap;margin-bottom:12px}
      #page-contrato .r80-kpis{display:grid;grid-template-columns:repeat(4,minmax(150px,1fr));gap:9px;margin:10px 0 14px}
      #page-contrato .r80-kpi{border:1px solid var(--line);border-radius:11px;background:var(--panel,#0d141c);padding:11px;min-width:0}
      #page-contrato .r80-kpi span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase}.r80-kpi b{display:block;margin-top:5px;font-size:18px;overflow-wrap:anywhere}
      #page-contrato .r80-form{display:grid;gap:14px}
      #page-contrato .r80-head{display:grid;grid-template-columns:minmax(220px,1fr) 170px minmax(250px,1fr) 130px;gap:10px;align-items:end}
      #page-contrato .r80-head label,#page-contrato .r80-form>label{display:grid;gap:5px;color:var(--muted);font-size:10px}
      #page-contrato .r80-code{min-height:42px;display:flex;align-items:center;padding:8px 10px;border:1px solid var(--line);border-radius:9px;background:var(--panel2);font-weight:700;overflow-wrap:anywhere}
      #page-contrato .r80-lines-panel{border:1px solid var(--line);border-radius:11px;overflow:hidden;background:var(--panel,#0d141c)}
      #page-contrato .r80-lines-head{display:flex;justify-content:space-between;align-items:center;gap:8px;padding:10px 12px;background:var(--panel2)}
      #page-contrato .r80-lines-head h4{margin:0;font-size:13px}
      #page-contrato .r80-line{display:grid;gap:7px;align-items:center;padding:8px 10px;border-top:1px solid var(--line)}
      #page-contrato .r80-line:first-child{border-top:0}
      #page-contrato .r80-mat{grid-template-columns:minmax(220px,1.8fr) 86px 110px 140px 130px 42px}
      #page-contrato .r80-freight{grid-template-columns:minmax(260px,1.8fr) 86px 160px 42px}
      #page-contrato .r80-line .field{width:100%;min-width:0}.r80-line-total{text-align:right;font-weight:700;white-space:nowrap}.r80-remove{min-width:38px;padding:8px!important}
      #page-contrato .r80-summary{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      #page-contrato .r80-summary-card{border:1px solid var(--line);border-radius:11px;overflow:hidden;background:var(--panel,#0d141c)}
      #page-contrato .r80-summary-card h4{margin:0;padding:10px 12px;background:var(--panel2);font-size:12px}
      #page-contrato .r80-summary-row{display:grid;grid-template-columns:1fr auto;gap:12px;padding:8px 12px;border-top:1px solid var(--line);align-items:center}.r80-summary-row.total{font-weight:800}.r80-summary-row.grand{font-size:15px;background:rgba(239,91,42,.08)}
      #page-contrato .r80-actions{display:flex;justify-content:flex-end;gap:8px;flex-wrap:wrap}
      #page-contrato .r80-list{overflow:auto;border:1px solid var(--line);border-radius:11px}.r80-list table{width:100%;border-collapse:collapse;min-width:980px}
      #page-contrato .r80-list th,#page-contrato .r80-list td{padding:9px 10px;border-bottom:1px solid var(--line);font-size:10px;vertical-align:middle;text-align:left}.r80-list th{background:var(--panel2);color:var(--muted)}.r80-list td.money{text-align:right;font-variant-numeric:tabular-nums}.r80-list .actions{display:flex;gap:6px;justify-content:flex-end;white-space:nowrap}
      @media(max-width:900px){#page-contrato .r80-kpis{grid-template-columns:1fr 1fr}#page-contrato .r80-head{grid-template-columns:1fr 1fr}#page-contrato .r80-summary{grid-template-columns:1fr}#page-contrato .r80-mat,#page-contrato .r80-freight{grid-template-columns:1fr 1fr}#page-contrato .r80-mat>*:first-child,#page-contrato .r80-freight>*:first-child{grid-column:1/-1}}
      @media(max-width:520px){#page-contrato .r80-kpis,#page-contrato .r80-head{grid-template-columns:1fr}#page-contrato .r80-actions .btn{width:100%}}
    `;document.head.appendChild(s);
  }

  async function loadEquipment(){
    const s=state(),cached=(window.state?.equipos||[]).filter(x=>String(x.estado||'activo')!=='retirado').map(x=>({id:x.id,nombre:x.nombre,estado:x.estado}));
    if(cached.length){s.equipment=cached.sort((a,b)=>String(a.nombre).localeCompare(String(b.nombre),'es'));return}
    const out=await window.sb.from('equipos').select('id,nombre,estado').neq('estado','retirado').order('nombre');if(!out.error)s.equipment=out.data||[];
  }
  async function loadRows(){
    const out=await window.sb.from(TABLE).select('*').order('fecha',{ascending:false}).order('created_at',{ascending:false});
    if(out.error){const body=document.getElementById('r80Body');if(body)body.innerHTML=`<div class="notice error">${esc(out.error.message)}<br><small>La migración de Presupuestos aún no está aplicada en Supabase.</small></div>`;return}
    state().rows=out.data||[];renderList();
  }

  function mountTab(){
    const tabs=document.querySelector('#page-contrato .contract-tabs');if(!tabs)return;
    let btn=tabs.querySelector('[data-r80-tab]');
    if(!btn){btn=document.createElement('button');btn.type='button';btn.className='contract-tab';btn.dataset.r80Tab='1';btn.textContent='Presupuestos';btn.addEventListener('click',()=>{window.state.contractTab='presupuestos';window.renderContractTab?.()});const forecast=[...tabs.querySelectorAll('.contract-tab')].find(x=>/Forecast/i.test(x.textContent||''));forecast?tabs.insertBefore(btn,forecast):tabs.appendChild(btn)}
    tabs.querySelectorAll('.contract-tab').forEach(x=>{if(x===btn)x.classList.toggle('active',window.state?.contractTab==='presupuestos');else if(window.state?.contractTab==='presupuestos')x.classList.remove('active')});
  }
  function shell(){
    const c=document.getElementById('contractContent');if(!c)return;c.innerHTML=`<div class="r80-toolbar"><div><h3 style="margin:0 0 3px">Presupuestos técnico comerciales</h3><div class="muted">Propuestas por equipo · código automático · PDF con formato Stainher.</div></div><button class="btn primary" type="button" data-r80-new>+ Nuevo presupuesto</button></div><div id="r80Body"><div class="empty">Cargando presupuestos…</div></div>`;c.querySelector('[data-r80-new]')?.addEventListener('click',()=>openEditor())
  }
  function renderBudgetTab(){mountTab();shell();Promise.all([loadEquipment(),loadRows()]).catch(e=>window.toast?.(e.message||String(e),'error'))}

  function renderList(){
    const body=document.getElementById('r80Body');if(!body)return;const rows=state().rows,total=rows.reduce((a,x)=>a+num(x.total_final),0),issued=rows.filter(x=>x.estado==='emitido').length;
    body.innerHTML=`<div class="r80-kpis"><div class="r80-kpi"><span>Presupuestos</span><b>${rows.length}</b></div><div class="r80-kpi"><span>Emitidos</span><b>${issued}</b></div><div class="r80-kpi"><span>Valor total</span><b>${money(total)}</b></div><div class="r80-kpi"><span>Documento</span><b>PE · PDF</b></div></div><div class="r80-list"><table><thead><tr><th>Código</th><th>Equipo</th><th>Fecha</th><th>Estado</th><th style="text-align:right">Venta neta</th><th style="text-align:right">IVA</th><th style="text-align:right">Total</th><th style="text-align:right">Acciones</th></tr></thead><tbody>${rows.map(r=>`<tr><td><b>${esc(r.codigo)}</b></td><td>${esc(r.equipo_nombre)}</td><td>${esc(dateCL(r.fecha))}</td><td>${esc(r.estado||'borrador')}</td><td class="money">${money(r.venta_neta)}</td><td class="money">${money(r.iva)}</td><td class="money"><b>${money(r.total_final)}</b></td><td><div class="actions"><button class="btn" data-edit="${esc(r.id)}">Editar</button><button class="btn" data-pdf="${esc(r.id)}">PDF</button><button class="btn danger-btn" data-delete="${esc(r.id)}">Eliminar</button></div></td></tr>`).join('')||'<tr><td colspan="8"><div class="empty">Aún no hay presupuestos registrados.</div></td></tr>'}</tbody></table></div>`;
    body.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openEditor(b.dataset.edit)));body.querySelectorAll('[data-pdf]').forEach(b=>b.addEventListener('click',()=>downloadSavedPdf(b.dataset.pdf)));body.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>removeBudget(b.dataset.delete)));
  }

  function equipmentOptions(selected){return `<option value="">Seleccionar equipo</option>${state().equipment.map(e=>`<option value="${esc(e.id)}" data-name="${esc(e.nombre)}" ${String(e.id)===String(selected)?'selected':''}>${esc(e.nombre)}</option>`).join('')}`}
  function matRow(x={}){return `<div class="r80-line r80-mat" data-mat><input class="field" data-f="detalle" placeholder="Detalle" value="${esc(x.detalle||'')}"><input class="field" type="number" min="0" step="0.01" data-f="cantidad" value="${num(x.cantidad)||1}"><input class="field" data-f="unidad" value="${esc(x.unidad||'Unidad')}"><input class="field" type="number" min="0" step="1" data-f="precio_unitario" value="${Math.round(num(x.precio_unitario))}"><div class="r80-line-total" data-mat-total>${money(num(x.cantidad)*num(x.precio_unitario))}</div><button class="btn danger-btn r80-remove" type="button" data-remove-mat>×</button></div>`}
  function freightRow(x={}){return `<div class="r80-line r80-freight" data-freight><input class="field" data-f="detalle" placeholder="Detalle" value="${esc(x.detalle||'')}"><input class="field" type="number" min="0" step="0.01" data-f="cantidad" value="${num(x.cantidad)||1}"><input class="field" type="number" min="0" step="1" data-f="monto_total" value="${Math.round(num(x.monto_total))}"><button class="btn danger-btn r80-remove" type="button" data-remove-freight>×</button></div>`}

  function openEditor(id){const row=id?state().rows.find(x=>String(x.id)===String(id)):null;state().editing=row?clone(row):blank();renderEditor()}
  function renderEditor(){
    const body=document.getElementById('r80Body');if(!body)return;const d=state().editing||blank(),k=calc(d);
    body.innerHTML=`<div class="panel r80-form"><div class="row-between"><div><h3 style="margin:0">${d.id?'Editar':'Nuevo'} presupuesto</h3><div class="muted">Propuesta técnico comercial</div></div><button class="btn" type="button" data-back>← Historial</button></div><div class="r80-head"><label>Equipo<select class="field" id="r80Equipment">${equipmentOptions(d.equipo_id)}</select></label><label>Fecha<input class="field" id="r80Date" type="date" value="${esc(d.fecha||today())}"></label><label>Código del documento<div class="r80-code" id="r80Code">${esc(codeFor(d.equipo_nombre,d.fecha))}</div></label><label>Utilidad %<input class="field" id="r80Margin" type="number" min="0" step="0.1" value="${num(d.utilidad_pct)}"></label></div><div class="r80-lines-panel"><div class="r80-lines-head"><h4>Costo de materiales</h4><button class="btn" type="button" data-add-mat>+ Material</button></div><div id="r80Mats">${(d.materiales?.length?d.materiales:[{}]).map(matRow).join('')}</div></div><div class="r80-lines-panel"><div class="r80-lines-head"><h4>Costo de fletes o transportes</h4><button class="btn" type="button" data-add-freight>+ Flete</button></div><div id="r80Freights">${(d.fletes?.length?d.fletes:[{}]).map(freightRow).join('')}</div></div><label>Observación<textarea class="field" id="r80Observation" rows="3">${esc(d.observacion||'')}</textarea></label><div class="r80-summary"><div class="r80-summary-card"><h4>Resumen de costos</h4><div class="r80-summary-row"><span>Materiales</span><b id="r80MatSum">${money(k.subtotal_materiales)}</b></div><div class="r80-summary-row"><span>Fletes</span><b id="r80FreightSum">${money(k.subtotal_fletes)}</b></div><div class="r80-summary-row total"><span>Total costos netos</span><b id="r80Costs">${money(k.total_costos_netos)}</b></div><div class="r80-summary-row"><span>Utilidad</span><b id="r80Utility">${money(k.utilidad)}</b></div><div class="r80-summary-row total"><span>Subtotal</span><b id="r80Net">${money(k.venta_neta)}</b></div></div><div class="r80-summary-card"><h4>Venta final</h4><div class="r80-summary-row"><span>Total venta neta</span><b id="r80FinalNet">${money(k.venta_neta)}</b></div><div class="r80-summary-row"><span>IVA (19%)</span><b id="r80Iva">${money(k.iva)}</b></div><div class="r80-summary-row grand"><span>TOTAL</span><b id="r80Total">${money(k.total_final)}</b></div></div></div><div class="r80-actions"><button class="btn" type="button" data-preview>↓ Generar PDF</button><button class="btn primary" type="button" data-save>Guardar presupuesto</button></div></div>`;bindEditor();
  }

  function readDraft(){
    const sel=document.getElementById('r80Equipment'),opt=sel?.selectedOptions?.[0];
    return{id:state().editing?.id||null,equipo_id:sel?.value||'',equipo_nombre:opt?.dataset?.name||'',fecha:document.getElementById('r80Date')?.value||today(),utilidad_pct:num(document.getElementById('r80Margin')?.value),materiales:[...document.querySelectorAll('[data-mat]')].map(r=>({detalle:r.querySelector('[data-f="detalle"]')?.value?.trim()||'',cantidad:num(r.querySelector('[data-f="cantidad"]')?.value),unidad:r.querySelector('[data-f="unidad"]')?.value?.trim()||'Unidad',precio_unitario:num(r.querySelector('[data-f="precio_unitario"]')?.value)})).filter(x=>x.detalle||x.precio_unitario),fletes:[...document.querySelectorAll('[data-freight]')].map(r=>({detalle:r.querySelector('[data-f="detalle"]')?.value?.trim()||'',cantidad:num(r.querySelector('[data-f="cantidad"]')?.value),monto_total:num(r.querySelector('[data-f="monto_total"]')?.value)})).filter(x=>x.detalle||x.monto_total),observacion:document.getElementById('r80Observation')?.value?.trim()||'',estado:state().editing?.estado||'borrador'};
  }
  function sync(){
    const d=readDraft(),k=calc(d),set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};set('r80Code',codeFor(d.equipo_nombre,d.fecha));set('r80MatSum',money(k.subtotal_materiales));set('r80FreightSum',money(k.subtotal_fletes));set('r80Costs',money(k.total_costos_netos));set('r80Utility',money(k.utilidad));set('r80Net',money(k.venta_neta));set('r80FinalNet',money(k.venta_neta));set('r80Iva',money(k.iva));set('r80Total',money(k.total_final));document.querySelectorAll('[data-mat]').forEach(r=>{const total=r.querySelector('[data-mat-total]');if(total)total.textContent=money(num(r.querySelector('[data-f="cantidad"]')?.value)*num(r.querySelector('[data-f="precio_unitario"]')?.value))})
  }
  function bindRemovers(){
    document.querySelectorAll('[data-remove-mat]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{if(document.querySelectorAll('[data-mat]').length<=1)return window.toast?.('Debe quedar al menos una fila de materiales.','warn');b.closest('[data-mat]')?.remove();sync()})});
    document.querySelectorAll('[data-remove-freight]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{if(document.querySelectorAll('[data-freight]').length<=1)return window.toast?.('Debe quedar al menos una fila de fletes.','warn');b.closest('[data-freight]')?.remove();sync()})});
  }
  function bindEditor(){
    const body=document.getElementById('r80Body');if(!body)return;body.querySelector('[data-back]')?.addEventListener('click',renderList);body.querySelector('[data-add-mat]')?.addEventListener('click',()=>{document.getElementById('r80Mats')?.insertAdjacentHTML('beforeend',matRow({cantidad:1,unidad:'Unidad'}));bindRemovers();sync()});body.querySelector('[data-add-freight]')?.addEventListener('click',()=>{document.getElementById('r80Freights')?.insertAdjacentHTML('beforeend',freightRow({cantidad:1}));bindRemovers();sync()});body.addEventListener('input',sync);body.addEventListener('change',sync);body.querySelector('[data-save]')?.addEventListener('click',saveBudget);body.querySelector('[data-preview]')?.addEventListener('click',()=>makePdf(readDraft(),false));bindRemovers();
  }

  async function saveBudget(){
    const d=readDraft();if(!d.equipo_id||!d.equipo_nombre)return window.toast?.('Selecciona un equipo.','error');if(!d.fecha)return window.toast?.('Selecciona la fecha.','error');const k=calc(d),payload={codigo:codeFor(d.equipo_nombre,d.fecha),equipo_id:d.equipo_id,equipo_nombre:d.equipo_nombre,fecha:d.fecha,materiales:d.materiales,fletes:d.fletes,utilidad_pct:d.utilidad_pct,...k,observacion:d.observacion,estado:d.estado,updated_at:new Date().toISOString()};if(uid())payload.created_by=uid();let out;if(d.id)out=await window.sb.from(TABLE).update(payload).eq('id',d.id).select('*').single();else out=await window.sb.from(TABLE).insert(payload).select('*').single();if(out.error)return window.toast?.(out.error.code==='23505'?'Ya existe un presupuesto para ese equipo y fecha.':out.error.message||String(out.error),'error');window.toast?.('Presupuesto guardado correctamente.','success');state().editing=null;await loadRows();
  }
  async function removeBudget(id){if(!window.confirm?.('¿Eliminar este presupuesto?'))return;const out=await window.sb.from(TABLE).delete().eq('id',id);if(out.error)return window.toast?.(out.error.message||String(out.error),'error');window.toast?.('Presupuesto eliminado.','success');await loadRows()}
  async function signature(){try{const id=uid();if(!id)return null;const out=await window.sb.from('firmas_usuario_v1524').select('imagen_png').eq('user_id',id).maybeSingle();return out.error?null:String(out.data?.imagen_png||'')||null}catch(_){return null}}
  async function downloadSavedPdf(id){const row=state().rows.find(x=>String(x.id)===String(id));if(row)await makePdf(clone(row),true)}

  async function makePdf(d,markIssued){
    if(!d.equipo_nombre||!d.fecha)return window.toast?.('Selecciona equipo y fecha antes de generar el PDF.','error');const C=typeof window.ensurePdf==='function'?window.ensurePdf():window.jspdf?.jsPDF;if(!C)return window.toast?.('No se pudo cargar el generador PDF.','error');const k=calc(d),code=codeFor(d.equipo_nombre,d.fecha),doc=new C({orientation:'portrait',unit:'mm',format:'a4'});
    if(typeof window.pdfHeader==='function')window.pdfHeader(doc,'Propuesta Técnico Comercial',`${code} · ${d.equipo_nombre}`);else{doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('STAINHER',14,16);doc.setFontSize(14);doc.text('Propuesta Técnico Comercial',14,27);doc.setDrawColor(239,91,42);doc.line(14,38,196,38)}
    doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(`CÓDIGO: ${code}`,14,47);doc.text(`EQUIPO: ${d.equipo_nombre}`,14,54);
    doc.autoTable({startY:62,theme:'grid',head:[[{content:'COSTO DE MATERIALES',colSpan:5,styles:{halign:'center'}}],['Detalle','Cantidad','Unidad','Precio Unitario','Monto Total']],body:(d.materiales||[]).map(x=>[x.detalle||'',num(x.cantidad).toLocaleString('es-CL'),x.unidad||'',money(x.precio_unitario),money(num(x.cantidad)*num(x.precio_unitario))]).concat([['TOTAL','','','',money(k.subtotal_materiales)]]),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'center'},3:{halign:'right'},4:{halign:'right'}}});
    let y=doc.lastAutoTable.finalY+8;doc.autoTable({startY:y,theme:'grid',head:[[{content:'COSTO DE FLETES O TRANSPORTES',colSpan:3,styles:{halign:'center'}}],['Detalle','Cantidad','Monto Total']],body:(d.fletes||[]).map(x=>[x.detalle||'',num(x.cantidad).toLocaleString('es-CL'),money(x.monto_total)]).concat([['TOTAL','',money(k.subtotal_fletes)]]),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'center'},2:{halign:'right'}}});
    y=doc.lastAutoTable.finalY+8;doc.autoTable({startY:y,theme:'grid',head:[[{content:'RESUMEN DE COSTOS',colSpan:2,styles:{halign:'center'}}],['Detalle','Valor Neto']],body:[['Materiales',money(k.subtotal_materiales)],['Fletes',money(k.subtotal_fletes)],['TOTAL COSTOS NETOS',money(k.total_costos_netos)],[`UTILIDAD (${num(d.utilidad_pct).toFixed(1)}%)`,money(k.utilidad)],['SUBTOTAL',money(k.venta_neta)]],styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'right'}}});
    y=doc.lastAutoTable.finalY+8;doc.autoTable({startY:y,theme:'grid',head:[[{content:'VENTA FINAL',colSpan:2,styles:{halign:'center'}}]],body:[['TOTAL VENTA NETA',money(k.venta_neta)],['IVA (19%)',money(k.iva)],['TOTAL',money(k.total_final)]],styles:{fontSize:9,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'right'}}});
    y=doc.lastAutoTable.finalY+10;if(d.observacion){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(80);const lines=doc.splitTextToSize(`Observación: ${d.observacion}`,180);doc.text(lines,14,y);y+=lines.length*4+4;doc.setTextColor(0)}if(y>250){doc.addPage();y=35}
    const sig=window.__STAINHER_SAVED_SIGNATURE__||await signature(),name=window.state?.profile?.nombre||'Ismael Eduardo Gálvez Reyes',cargo=window.state?.profile?.cargo||'Administrador de Contrato';if(sig){try{doc.addImage(sig,'PNG',78,y,54,13);y+=14}catch(_){}}doc.setDrawColor(120);doc.line(65,y,145,y);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text(String(name),105,y+5,{align:'center'});doc.setFont('helvetica','normal');doc.text(String(cargo),105,y+9,{align:'center'});doc.text('Stainher Ascensores Limitada',105,y+13,{align:'center'});doc.setFontSize(7);doc.setTextColor(100);doc.text(`Generado ${new Date().toLocaleString('es-CL')} · Stainher App`,14,290);doc.save(`${code}.pdf`);
    if(markIssued&&d.id&&d.estado!=='emitido'){const out=await window.sb.from(TABLE).update({estado:'emitido',updated_at:new Date().toISOString()}).eq('id',d.id);if(!out.error){const row=state().rows.find(x=>String(x.id)===String(d.id));if(row)row.estado='emitido';renderList()}}
  }

  function install(){
    mountStyle();
    if(typeof window.renderContractTab==='function'&&!window.renderContractTab.__r80){const base=window.renderContractTab,wrapped=function(){mountTab();if(window.state?.contractTab==='presupuestos')return renderBudgetTab();const r=base.apply(this,arguments);requestAnimationFrame(mountTab);return r};wrapped.__r80=true;wrapped.__base=base;window.renderContractTab=wrapped}
    if(typeof window.renderContrato==='function'&&!window.renderContrato.__r80){const base=window.renderContrato,wrapped=function(){const r=base.apply(this,arguments);requestAnimationFrame(()=>{mountTab();if(window.state?.contractTab==='presupuestos')renderBudgetTab()});return r};wrapped.__r80=true;wrapped.__base=base;window.renderContrato=wrapped}
    mountTab();if(window.state?.contractTab==='presupuestos')renderBudgetTab();
  }
  install();window.addEventListener('stainher:modules-ready',install);
})();
