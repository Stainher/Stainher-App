/* Stainher V15.24 · R110 · Presupuestos técnico comerciales
 * Administración del Contrato -> Presupuestos
 * Código: NOMBRE-EQUIPO-PE-DD-MM-AA
 */
(()=>{
  'use strict';
  const BUILD='20261019-r160-presupuestos-analytics';
  if(window.__STAINHER_PRESUPUESTOS_R80__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_R80__=BUILD;

  const TABLE='presupuestos_tecnico_comerciales_v1524';
  const IVA=0.19;
  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const num=v=>Number(v)||0;
  const money=v=>typeof window.fmtCLP==='function'?window.fmtCLP(Math.round(num(v))):'$ '+Math.round(num(v)).toLocaleString('es-CL');
  const today=()=>{const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`};
  const dateCL=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(v||'')};
  const qtyText=v=>{
    const n=Number(v)||0;
    return Number.isInteger(n)?String(n):n.toLocaleString('es-CL',{maximumFractionDigits:2});
  };
  function historyDetail(r){
    const lines=(Array.isArray(r?.materiales)?r.materiales:[])
      .map(x=>{
        const name=String(x?.detalle||'').trim();
        if(!name)return '';
        const qty=Number(x?.cantidad)||0,unit=String(x?.unidad||'').trim();
        if(qty<=0)return name;
        if(unit.toLowerCase()==='unidad')return `${name} (${qtyText(qty)} ${qty===1?'unidad':'unidades'})`;
        return unit?`${name} (${qtyText(qty)} ${unit})`:`${name} (${qtyText(qty)})`;
      })
      .filter(Boolean);
    if(lines.length)return lines.join('\n');
    const historical=String(r?.observacion||'').trim();
    return historical||'—';
  }
  const slug=v=>String(v||'EQUIPO').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toUpperCase().replace(/[^A-Z0-9]+/g,'-').replace(/^-+|-+$/g,'')||'EQUIPO';
  const baseCodeFor=(equipment,date)=>{const m=String(date||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return `${slug(equipment)}-PE-${m?`${m[3]}-${m[2]}-${m[1].slice(-2)}`:'SIN-FECHA'}`};
  const regexEscape=v=>String(v||'').replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
  function nextCodeFromRows(equipment,date,rows,excludeId=''){
    const base=baseCodeFor(equipment,date),rx=new RegExp(`^${regexEscape(base)}(?:-(\\d+))?$`);
    let found=false,maxSuffix=0;
    (Array.isArray(rows)?rows:[]).forEach(row=>{
      if(excludeId&&String(row?.id)===String(excludeId))return;
      const match=String(row?.codigo||'').match(rx);
      if(!match)return;
      found=true;
      if(match[1])maxSuffix=Math.max(maxSuffix,Number(match[1])||0);
    });
    return found?`${base}-${maxSuffix+1}`:base;
  }
  const nextCodeFor=(equipment,date,excludeId='')=>nextCodeFromRows(equipment,date,state().rows,excludeId);
  function documentCode(d){
    if(d?.codigo)return String(d.codigo);
    if(d?.id){
      const stored=state().rows.find(x=>String(x.id)===String(d.id));
      if(stored?.codigo)return String(stored.codigo);
    }
    return nextCodeFor(d?.equipo_nombre,d?.fecha,d?.id);
  }
  const uid=()=>String(window.state?.session?.user?.id||window.state?.user?.id||'');
  const role=()=>String(window.state?.profile?.rol||'').trim().toLowerCase();
  const canUse=()=>!window.state?.v15PreviewRole&&['administrador','confiabilidad'].includes(role());
  const canDelete=()=>canUse()&&role()==='administrador';
  const canEdit=row=>canUse()&&(role()==='administrador'||String(row?.created_by||'')===uid());

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
      #page-contrato .r80-list th,#page-contrato .r80-list td{padding:13px 12px;border-bottom:1px solid var(--line);vertical-align:middle;text-align:left}.r80-list th{background:var(--panel2);color:var(--muted);font-size:12px;font-weight:700;text-transform:uppercase;letter-spacing:.02em}.r80-list td{font-size:14px;line-height:1.35}.r80-list td.money{text-align:right;font-variant-numeric:tabular-nums;font-size:15px}.r80-list .actions{display:flex;gap:7px;justify-content:flex-end;white-space:nowrap}
      #page-contrato .r155-history-detail{white-space:pre-line!important;line-height:1.4!important;overflow-wrap:anywhere!important}
      #page-contrato .r160-budget-tools{display:grid;grid-template-columns:minmax(240px,1.5fr) repeat(3,minmax(150px,.7fr)) auto;gap:9px;align-items:end;margin:0 0 12px}
      #page-contrato .r160-budget-tools label{display:grid;gap:5px;color:var(--muted);font-size:10px;text-transform:uppercase}
      #page-contrato .r160-budget-tools .field{width:100%;min-width:0}
      #page-contrato .r160-results-line{display:flex;justify-content:space-between;gap:10px;align-items:center;margin:0 0 10px;color:var(--muted);font-size:11px}
      #page-contrato .r160-budget-charts{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin:0 0 14px}
      #page-contrato .r160-chart-card{border:1px solid var(--line);border-radius:11px;background:var(--panel,#0d141c);overflow:hidden;min-width:0}
      #page-contrato .r160-chart-card h4{margin:0;padding:10px 12px;background:var(--panel2);font-size:12px}
      #page-contrato .r160-chart-body{display:grid;gap:9px;padding:11px 12px;max-height:300px;overflow:auto}
      #page-contrato .r160-chart-row{display:grid;grid-template-columns:minmax(110px,.9fr) minmax(120px,1.5fr) auto;gap:9px;align-items:center;min-width:0}
      #page-contrato .r160-chart-label{font-size:11px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #page-contrato .r160-chart-track{height:10px;border-radius:999px;background:var(--panel2);overflow:hidden;border:1px solid var(--line)}
      #page-contrato .r160-chart-bar{display:block;height:100%;min-width:2px;background:var(--accent,#ef5b2a);border-radius:999px}
      #page-contrato .r160-chart-value{font-size:11px;font-weight:700;white-space:nowrap;font-variant-numeric:tabular-nums}
      #page-contrato .r160-chart-empty{padding:18px 12px;color:var(--muted);font-size:11px;text-align:center}
      @media(max-width:1100px){#page-contrato .r160-budget-tools{grid-template-columns:1fr 1fr}#page-contrato .r160-budget-tools [data-r160-clear]{width:100%}}
      @media(max-width:850px){#page-contrato .r160-budget-charts{grid-template-columns:1fr}}
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
    if(!canUse()){btn?.remove();return}
    if(!btn){btn=document.createElement('button');btn.type='button';btn.className='contract-tab';btn.dataset.r80Tab='1';btn.textContent='Presupuestos';btn.addEventListener('click',()=>{window.state.contractTab='presupuestos';window.renderContractTab?.()});const forecast=[...tabs.querySelectorAll('.contract-tab')].find(x=>/Forecast/i.test(x.textContent||''));forecast?tabs.insertBefore(btn,forecast):tabs.appendChild(btn)}
    tabs.querySelectorAll('.contract-tab').forEach(x=>{if(x===btn)x.classList.toggle('active',window.state?.contractTab==='presupuestos');else if(window.state?.contractTab==='presupuestos')x.classList.remove('active')});
  }
  function shell(){
    const c=document.getElementById('contractContent');if(!c)return;c.innerHTML=`<div class="r80-toolbar"><div><h3 style="margin:0 0 3px">Presupuestos técnico comerciales</h3><div class="muted">Histórico compartido · PDF con firma institucional del Administrador.</div></div>${canUse()?'<button class="btn primary" type="button" data-r80-new>+ Nuevo presupuesto</button>':''}</div><div id="r80Body"><div class="empty">Cargando presupuestos…</div></div>`;c.querySelector('[data-r80-new]')?.addEventListener('click',()=>openEditor())
  }
  function renderBudgetTab(){mountTab();shell();Promise.all([loadEquipment(),loadRows()]).catch(e=>window.toast?.(e.message||String(e),'error'))}

  const normSearch=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  function listFilters(){
    const s=state();
    return s.filters||(s.filters={search:'',equipment:'',destination:'',ep:''});
  }
  function contractEps(){return Array.isArray(window.state?.contractData?.edp)?window.state.contractData.edp:[]}
  function filteredBudgetRows(){
    const f=listFilters(),q=normSearch(f.search);
    return state().rows.filter(row=>{
      if(f.equipment&&String(row.equipo_nombre||'')!==f.equipment)return false;
      if(f.destination==='sin_asignar'&&row.estado_pago_id)return false;
      if(f.destination&&f.destination!=='sin_asignar'&&String(row.tipo_imputacion||'')!==f.destination)return false;
      if(f.ep&&String(row.estado_pago_id||'')!==String(f.ep))return false;
      if(q){
        const haystack=normSearch([row.codigo,row.equipo_nombre,historyDetail(row),row.observacion,dateCL(row.fecha)].join(' '));
        if(!haystack.includes(q))return false;
      }
      return true;
    });
  }
  function budgetTableRows(rows){
    return rows.map(r=>`<tr><td>${esc(dateCL(r.fecha))}</td><td><b>${esc(r.codigo)}</b></td><td>${esc(r.equipo_nombre||'—')}</td><td class="r155-history-detail">${esc(historyDetail(r))}</td><td class="money"><b>${money(r.total_final)}</b></td><td><div class="actions">${canEdit(r)?`<button class="btn" data-edit="${esc(r.id)}">Editar</button>`:''}<button class="btn" data-pdf="${esc(r.id)}">PDF</button>${canDelete()?`<button class="btn danger-btn" data-delete="${esc(r.id)}">Eliminar</button>`:''}</div></td></tr>`).join('')||'<tr><td colspan="6"><div class="empty">No hay presupuestos para los filtros seleccionados.</div></td></tr>';
  }
  function aggregateEquipment(rows){
    const map=new Map();
    rows.forEach(row=>{
      const name=String(row.equipo_nombre||'Sin equipo').trim()||'Sin equipo';
      const item=map.get(name)||{name,count:0,total:0};
      item.count+=1;item.total+=num(row.total_final);map.set(name,item);
    });
    return [...map.values()];
  }
  function chartRows(groups,mode){
    const sorted=[...groups].sort((a,b)=>(mode==='count'?b.count-a.count:b.total-a.total)||a.name.localeCompare(b.name,'es'));
    const max=Math.max(1,...sorted.map(x=>mode==='count'?x.count:x.total));
    if(!sorted.length)return '<div class="r160-chart-empty">Sin datos para graficar.</div>';
    return sorted.map(x=>{
      const value=mode==='count'?x.count:x.total;
      const pct=Math.max(2,Math.round(value/max*100));
      const label=mode==='count'?String(x.count):money(x.total);
      return `<div class="r160-chart-row" title="${esc(x.name)}"><span class="r160-chart-label">${esc(x.name)}</span><span class="r160-chart-track"><i class="r160-chart-bar" style="width:${pct}%"></i></span><strong class="r160-chart-value">${esc(label)}</strong></div>`;
    }).join('');
  }
  function bindBudgetRowActions(root){
    root.querySelectorAll('[data-edit]').forEach(b=>b.addEventListener('click',()=>openEditor(b.dataset.edit)));
    root.querySelectorAll('[data-pdf]').forEach(b=>b.addEventListener('click',()=>downloadSavedPdf(b.dataset.pdf)));
    root.querySelectorAll('[data-delete]').forEach(b=>b.addEventListener('click',()=>removeBudget(b.dataset.delete)));
  }
  function refreshBudgetResults(){
    const rows=filteredBudgetRows(),all=state().rows;
    const tbody=document.getElementById('r160BudgetRows'),charts=document.getElementById('r160BudgetCharts'),summary=document.getElementById('r160BudgetResultCount');
    if(tbody){tbody.innerHTML=budgetTableRows(rows);bindBudgetRowActions(tbody)}
    if(summary)summary.textContent=`Mostrando ${rows.length} de ${all.length} presupuestos`;
    if(charts){
      const groups=aggregateEquipment(rows);
      charts.innerHTML=`<div class="r160-chart-card"><h4>Cantidad de presupuestos por equipo</h4><div class="r160-chart-body">${chartRows(groups,'count')}</div></div><div class="r160-chart-card"><h4>Valor por equipo · IVA incluido</h4><div class="r160-chart-body">${chartRows(groups,'total')}</div></div>`;
    }
  }
  function renderList(){
    const body=document.getElementById('r80Body');if(!body)return;
    const rows=state().rows,total=rows.reduce((a,x)=>a+num(x.total_final),0),issued=rows.filter(x=>x.estado==='emitido').length,f=listFilters();
    const equipments=[...new Set(rows.map(x=>String(x.equipo_nombre||'').trim()).filter(Boolean))].sort((a,b)=>a.localeCompare(b,'es'));
    const epOptions=contractEps().slice().sort((a,b)=>Number(b.ep_num)-Number(a.ep_num)).map(ep=>`<option value="${esc(ep.id)}" ${String(f.ep)===String(ep.id)?'selected':''}>EP${esc(ep.ep_num)}</option>`).join('');
    body.innerHTML=`<div class="r80-kpis"><div class="r80-kpi"><span>Presupuestos</span><b>${rows.length}</b></div><div class="r80-kpi"><span>Emitidos</span><b>${issued}</b></div><div class="r80-kpi"><span>Valor total</span><b>${money(total)}</b></div><div class="r80-kpi"><span>Documento</span><b>PE · PDF</b></div></div>
      <div class="r160-budget-tools">
        <label>Buscar<input class="field" id="r160BudgetSearch" type="search" placeholder="Código, equipo o detalle" value="${esc(f.search)}"></label>
        <label>Equipo<select class="field" id="r160BudgetEquipment"><option value="">Todos</option>${equipments.map(name=>`<option value="${esc(name)}" ${f.equipment===name?'selected':''}>${esc(name)}</option>`).join('')}</select></label>
        <label>Destino<select class="field" id="r160BudgetDestination"><option value="">Todos</option><option value="sin_asignar" ${f.destination==='sin_asignar'?'selected':''}>Sin asignar</option><option value="gasto_reembolsable" ${f.destination==='gasto_reembolsable'?'selected':''}>GGRR</option><option value="estandarizacion" ${f.destination==='estandarizacion'?'selected':''}>Estandarización</option></select></label>
        <label>Estado de Pago<select class="field" id="r160BudgetEp"><option value="">Todos</option>${epOptions}</select></label>
        <button class="btn" type="button" data-r160-clear>Limpiar</button>
      </div>
      <div class="r160-results-line"><span id="r160BudgetResultCount"></span><span>Los gráficos consideran los filtros aplicados.</span></div>
      <div class="r160-budget-charts" id="r160BudgetCharts"></div>
      <div class="r80-list"><table><thead><tr><th>Fecha</th><th>Código</th><th>Equipo</th><th>Detalle</th><th style="text-align:right">Total (Iva Incluido)</th><th style="text-align:right">Acciones</th></tr></thead><tbody id="r160BudgetRows"></tbody></table></div>`;
    const search=document.getElementById('r160BudgetSearch'),equipment=document.getElementById('r160BudgetEquipment'),destination=document.getElementById('r160BudgetDestination'),ep=document.getElementById('r160BudgetEp');
    search?.addEventListener('input',()=>{f.search=search.value;refreshBudgetResults()});
    equipment?.addEventListener('change',()=>{f.equipment=equipment.value;refreshBudgetResults()});
    destination?.addEventListener('change',()=>{f.destination=destination.value;refreshBudgetResults()});
    ep?.addEventListener('change',()=>{f.ep=ep.value;refreshBudgetResults()});
    body.querySelector('[data-r160-clear]')?.addEventListener('click',()=>{f.search='';f.equipment='';f.destination='';f.ep='';renderList()});
    refreshBudgetResults();
  }

  function equipmentOptions(selected){return `<option value="">Seleccionar equipo</option>${state().equipment.map(e=>`<option value="${esc(e.id)}" data-name="${esc(e.nombre)}" ${String(e.id)===String(selected)?'selected':''}>${esc(e.nombre)}</option>`).join('')}`}
  function matRow(x={}){return `<div class="r80-line r80-mat" data-mat><input class="field" data-f="detalle" placeholder="Detalle" value="${esc(x.detalle||'')}"><input class="field" type="number" min="0" step="0.01" data-f="cantidad" value="${num(x.cantidad)||1}"><input class="field" data-f="unidad" value="${esc(x.unidad||'Unidad')}"><input class="field" type="number" min="0" step="1" data-f="precio_unitario" value="${Math.round(num(x.precio_unitario))}"><div class="r80-line-total" data-mat-total>${money(num(x.cantidad)*num(x.precio_unitario))}</div><button class="btn danger-btn r80-remove" type="button" data-remove-mat>×</button></div>`}
  function freightRow(x={}){return `<div class="r80-line r80-freight" data-freight><input class="field" data-f="detalle" placeholder="Detalle" value="${esc(x.detalle||'')}"><input class="field" type="number" min="0" step="0.01" data-f="cantidad" value="${num(x.cantidad)||1}"><input class="field" type="number" min="0" step="1" data-f="monto_total" value="${Math.round(num(x.monto_total))}"><button class="btn danger-btn r80-remove" type="button" data-remove-freight>×</button></div>`}

  function openEditor(id){const row=id?state().rows.find(x=>String(x.id)===String(id)):null;if(!canUse()||(row&&!canEdit(row)))return window.toast?.('No tienes permiso para editar este presupuesto.','error');state().editing=row?clone(row):blank();renderEditor()}
  function renderEditor(){
    const body=document.getElementById('r80Body');if(!body)return;const d=state().editing||blank(),k=calc(d);
    body.innerHTML=`<div class="panel r80-form" data-no-collapse="1"><div class="row-between"><div><h3 style="margin:0">${d.id?'Editar':'Nuevo'} presupuesto</h3><div class="muted">Propuesta técnico comercial</div></div><button class="btn" type="button" data-back>← Historial</button></div><div class="r80-head"><label>Equipo<select class="field" id="r80Equipment">${equipmentOptions(d.equipo_id)}</select></label><label>Fecha<input class="field" id="r80Date" type="date" value="${esc(d.fecha||today())}"></label><label>Código del documento<div class="r80-code" id="r80Code">${esc(documentCode(d))}</div></label><label>Utilidad %<input class="field" id="r80Margin" type="number" min="0" step="0.1" value="${num(d.utilidad_pct)}"></label></div><div class="r80-lines-panel"><div class="r80-lines-head"><h4>Costo de materiales</h4><button class="btn" type="button" data-add-mat>+ Material</button></div><div id="r80Mats">${(d.materiales?.length?d.materiales:[{}]).map(matRow).join('')}</div></div><div class="r80-lines-panel"><div class="r80-lines-head"><h4>Costo de fletes o transportes</h4><button class="btn" type="button" data-add-freight>+ Flete</button></div><div id="r80Freights">${(d.fletes?.length?d.fletes:[{}]).map(freightRow).join('')}</div></div><label>Observación<textarea class="field" id="r80Observation" rows="3">${esc(d.observacion||'')}</textarea></label><div class="r80-summary"><div class="r80-summary-card"><h4>Resumen de costos</h4><div class="r80-summary-row"><span>Materiales</span><b id="r80MatSum">${money(k.subtotal_materiales)}</b></div><div class="r80-summary-row"><span>Fletes</span><b id="r80FreightSum">${money(k.subtotal_fletes)}</b></div><div class="r80-summary-row total"><span>Total costos netos</span><b id="r80Costs">${money(k.total_costos_netos)}</b></div><div class="r80-summary-row"><span>Utilidad</span><b id="r80Utility">${money(k.utilidad)}</b></div><div class="r80-summary-row total"><span>Subtotal</span><b id="r80Net">${money(k.venta_neta)}</b></div></div><div class="r80-summary-card"><h4>Venta final</h4><div class="r80-summary-row"><span>Total venta neta</span><b id="r80FinalNet">${money(k.venta_neta)}</b></div><div class="r80-summary-row"><span>IVA (19%)</span><b id="r80Iva">${money(k.iva)}</b></div><div class="r80-summary-row grand"><span>TOTAL</span><b id="r80Total">${money(k.total_final)}</b></div></div></div><div class="r80-actions"><button class="btn" type="button" data-preview>↓ Generar PDF</button><button class="btn primary" type="button" data-save>Guardar presupuesto</button></div></div>`;bindEditor();
  }

  function readDraft(){
    const sel=document.getElementById('r80Equipment'),opt=sel?.selectedOptions?.[0];
    return{id:state().editing?.id||null,equipo_id:sel?.value||'',equipo_nombre:opt?.dataset?.name||'',fecha:document.getElementById('r80Date')?.value||today(),utilidad_pct:num(document.getElementById('r80Margin')?.value),materiales:[...document.querySelectorAll('[data-mat]')].map(r=>({detalle:r.querySelector('[data-f="detalle"]')?.value?.trim()||'',cantidad:num(r.querySelector('[data-f="cantidad"]')?.value),unidad:r.querySelector('[data-f="unidad"]')?.value?.trim()||'Unidad',precio_unitario:num(r.querySelector('[data-f="precio_unitario"]')?.value)})).filter(x=>x.detalle||x.precio_unitario),fletes:[...document.querySelectorAll('[data-freight]')].map(r=>({detalle:r.querySelector('[data-f="detalle"]')?.value?.trim()||'',cantidad:num(r.querySelector('[data-f="cantidad"]')?.value),monto_total:num(r.querySelector('[data-f="monto_total"]')?.value)})).filter(x=>x.detalle||x.monto_total),observacion:document.getElementById('r80Observation')?.value?.trim()||'',estado:state().editing?.estado||'borrador'};
  }
  function sync(){
    const d=readDraft(),k=calc(d),set=(id,v)=>{const el=document.getElementById(id);if(el)el.textContent=v};set('r80Code',documentCode(d));set('r80MatSum',money(k.subtotal_materiales));set('r80FreightSum',money(k.subtotal_fletes));set('r80Costs',money(k.total_costos_netos));set('r80Utility',money(k.utilidad));set('r80Net',money(k.venta_neta));set('r80FinalNet',money(k.venta_neta));set('r80Iva',money(k.iva));set('r80Total',money(k.total_final));document.querySelectorAll('[data-mat]').forEach(r=>{const total=r.querySelector('[data-mat-total]');if(total)total.textContent=money(num(r.querySelector('[data-f="cantidad"]')?.value)*num(r.querySelector('[data-f="precio_unitario"]')?.value))})
  }
  function bindRemovers(){
    document.querySelectorAll('[data-remove-mat]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{if(document.querySelectorAll('[data-mat]').length<=1)return window.toast?.('Debe quedar al menos una fila de materiales.','warn');b.closest('[data-mat]')?.remove();sync()})});
    document.querySelectorAll('[data-remove-freight]').forEach(b=>{if(b.dataset.bound)return;b.dataset.bound='1';b.addEventListener('click',()=>{if(document.querySelectorAll('[data-freight]').length<=1)return window.toast?.('Debe quedar al menos una fila de fletes.','warn');b.closest('[data-freight]')?.remove();sync()})});
  }
  function bindEditor(){
    const body=document.getElementById('r80Body');if(!body)return;body.querySelector('[data-back]')?.addEventListener('click',renderList);body.querySelector('[data-add-mat]')?.addEventListener('click',()=>{document.getElementById('r80Mats')?.insertAdjacentHTML('beforeend',matRow({cantidad:1,unidad:'Unidad'}));bindRemovers();sync()});body.querySelector('[data-add-freight]')?.addEventListener('click',()=>{document.getElementById('r80Freights')?.insertAdjacentHTML('beforeend',freightRow({cantidad:1}));bindRemovers();sync()});body.addEventListener('input',sync);body.addEventListener('change',sync);body.querySelector('[data-save]')?.addEventListener('click',saveBudget);body.querySelector('[data-preview]')?.addEventListener('click',()=>makePdf(readDraft(),false));bindRemovers();
  }

  async function saveBudget(){
    const d=readDraft(),existing=d.id?state().rows.find(x=>String(x.id)===String(d.id)):null;
    if(!canUse()||(existing&&!canEdit(existing)))return window.toast?.('No tienes permiso para guardar este presupuesto.','error');
    if(!d.equipo_id||!d.equipo_nombre)return window.toast?.('Selecciona un equipo.','error');
    if(!d.fecha)return window.toast?.('Selecciona la fecha.','error');
    const k=calc(d),basePayload={equipo_id:d.equipo_id,equipo_nombre:d.equipo_nombre,fecha:d.fecha,materiales:d.materiales,fletes:d.fletes,utilidad_pct:d.utilidad_pct,...k,observacion:d.observacion,estado:d.estado,updated_at:new Date().toISOString()};
    let out;
    if(d.id){
      out=await window.sb.from(TABLE).update({codigo:existing?.codigo||documentCode(d),...basePayload}).eq('id',d.id).select('*').single();
    }else{
      let candidates=state().rows;
      for(let attempt=0;attempt<6;attempt++){
        const codigo=nextCodeFromRows(d.equipo_nombre,d.fecha,candidates);
        out=await window.sb.from(TABLE).insert({codigo,...basePayload,created_by:uid()}).select('*').single();
        if(!out.error||out.error.code!=='23505')break;
        const latest=await window.sb.from(TABLE).select('id,codigo');
        if(latest.error)break;
        candidates=latest.data||candidates;
      }
    }
    if(out?.error)return window.toast?.(out.error.code==='23505'?'No fue posible generar un código correlativo único. Actualiza e intenta nuevamente.':out.error.message||String(out.error),'error');
    window.toast?.('Presupuesto guardado correctamente.','success');
    state().editing=null;
    await loadRows();
  }
  async function removeBudget(id){if(!canDelete())return window.toast?.('Solo el Administrador puede eliminar presupuestos.','error');if(!window.confirm?.('¿Eliminar este presupuesto?'))return;const out=await window.sb.from(TABLE).delete().eq('id',id);if(out.error)return window.toast?.(out.error.message||String(out.error),'error');window.toast?.('Presupuesto eliminado.','success');await loadRows()}
  async function administratorSignature(){
    const cached=state().administratorSignature;if(cached)return cached;
    const out=await window.sb.rpc('presupuesto_firma_administrador_v110');
    if(out.error)throw out.error;
    const signer=Array.isArray(out.data)?out.data[0]:out.data;
    if(!signer?.imagen_png)throw new Error('El Administrador no tiene una firma institucional guardada.');
    state().administratorSignature=signer;return signer;
  }
  async function downloadSavedPdf(id){const row=state().rows.find(x=>String(x.id)===String(id));if(row)await makePdf(clone(row),true)}

  async function makePdf(d,markIssued){
    if(!canUse())return window.toast?.('No tienes permiso para generar presupuestos.','error');if(!d.equipo_nombre||!d.fecha)return window.toast?.('Selecciona equipo y fecha antes de generar el PDF.','error');let signer;try{signer=await administratorSignature()}catch(error){return window.toast?.(error.message||String(error),'error')}const C=typeof window.ensurePdf==='function'?window.ensurePdf():window.jspdf?.jsPDF;if(!C)return window.toast?.('No se pudo cargar el generador PDF.','error');const k=calc(d),code=documentCode(d),doc=new C({orientation:'portrait',unit:'mm',format:'a4'});
    if(typeof window.pdfHeader==='function')window.pdfHeader(doc,'Propuesta Técnico Comercial',`${code} · ${d.equipo_nombre}`);else{doc.setFont('helvetica','bold');doc.setFontSize(18);doc.text('STAINHER',14,16);doc.setFontSize(14);doc.text('Propuesta Técnico Comercial',14,27);doc.setDrawColor(239,91,42);doc.line(14,38,196,38)}
    doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(`CÓDIGO: ${code}`,14,47);doc.text(`EQUIPO: ${d.equipo_nombre}`,14,54);
    doc.autoTable({startY:62,theme:'grid',head:[[{content:'COSTO DE MATERIALES',colSpan:5,styles:{halign:'center'}}],['Detalle','Cantidad','Unidad','Precio Unitario','Monto Total']],body:(d.materiales||[]).map(x=>[x.detalle||'',num(x.cantidad).toLocaleString('es-CL'),x.unidad||'',money(x.precio_unitario),money(num(x.cantidad)*num(x.precio_unitario))]).concat([['TOTAL','','','',money(k.subtotal_materiales)]]),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'center'},3:{halign:'right'},4:{halign:'right'}}});
    let y=doc.lastAutoTable.finalY+8;doc.autoTable({startY:y,theme:'grid',head:[[{content:'COSTO DE FLETES O TRANSPORTES',colSpan:3,styles:{halign:'center'}}],['Detalle','Cantidad','Monto Total']],body:(d.fletes||[]).map(x=>[x.detalle||'',num(x.cantidad).toLocaleString('es-CL'),money(x.monto_total)]).concat([['TOTAL','',money(k.subtotal_fletes)]]),styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'center'},2:{halign:'right'}}});
    y=doc.lastAutoTable.finalY+8;doc.autoTable({startY:y,theme:'grid',head:[[{content:'RESUMEN DE COSTOS',colSpan:2,styles:{halign:'center'}}],['Detalle','Valor Neto']],body:[['Materiales',money(k.subtotal_materiales)],['Fletes',money(k.subtotal_fletes)],['TOTAL COSTOS NETOS',money(k.total_costos_netos)],[`UTILIDAD (${num(d.utilidad_pct).toFixed(1)}%)`,money(k.utilidad)],['SUBTOTAL',money(k.venta_neta)]],styles:{fontSize:8,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'right'}}});
    y=doc.lastAutoTable.finalY+8;doc.autoTable({startY:y,theme:'grid',head:[[{content:'VENTA FINAL',colSpan:2,styles:{halign:'center'}}]],body:[['TOTAL VENTA NETA',money(k.venta_neta)],['IVA (19%)',money(k.iva)],['TOTAL',money(k.total_final)]],styles:{fontSize:9,cellPadding:2},headStyles:{fillColor:[35,43,54]},columnStyles:{1:{halign:'right'}}});
    y=doc.lastAutoTable.finalY+10;if(d.observacion){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(80);const lines=doc.splitTextToSize(`Observación: ${d.observacion}`,180);doc.text(lines,14,y);y+=lines.length*4+4;doc.setTextColor(0)}if(y>250){doc.addPage();y=35}
    const sig=String(signer.imagen_png||''),name=signer.nombre||'Administrador',cargo=signer.cargo||'Administrador de Contrato';if(sig){try{doc.addImage(sig,'PNG',78,y,54,13);y+=14}catch(_){}}doc.setDrawColor(120);doc.line(65,y,145,y);doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text(String(name),105,y+5,{align:'center'});doc.setFont('helvetica','normal');doc.text(String(cargo),105,y+9,{align:'center'});doc.text('Stainher Ascensores Limitada',105,y+13,{align:'center'});doc.setFontSize(7);doc.setTextColor(100);doc.text(`Generado ${new Date().toLocaleString('es-CL')} · Stainher App`,14,290);doc.save(`${code}.pdf`);
    if(markIssued&&d.id&&d.estado!=='emitido'){const out=await window.sb.from(TABLE).update({estado:'emitido',updated_at:new Date().toISOString()}).eq('id',d.id);if(!out.error){const row=state().rows.find(x=>String(x.id)===String(d.id));if(row)row.estado='emitido';renderList()}}
  }

  function install(){
    mountStyle();
    if(typeof window.renderContractTab==='function'&&!window.renderContractTab.__r110){const base=window.renderContractTab,wrapped=function(){mountTab();if(window.state?.contractTab==='presupuestos')return renderBudgetTab();const r=base.apply(this,arguments);requestAnimationFrame(mountTab);return r};wrapped.__r110=true;wrapped.__base=base;window.renderContractTab=wrapped}
    if(typeof window.renderContrato==='function'&&!window.renderContrato.__r110){const base=window.renderContrato,wrapped=function(){const r=base.apply(this,arguments);requestAnimationFrame(()=>{mountTab();if(window.state?.contractTab==='presupuestos')renderBudgetTab()});return r};wrapped.__r110=true;wrapped.__base=base;window.renderContrato=wrapped}
    mountTab();if(window.state?.contractTab==='presupuestos')renderBudgetTab();
  }
  install();window.addEventListener('stainher:modules-ready',install);
})();
