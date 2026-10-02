/* Stainher V15.24 · R141 · Módulo Estandarización.
 * Control digital de actividades de normalización por equipo.
 * Precarga inicial: 55 actividades desde la planilla histórica.
 */
(()=>{
  'use strict';
  const BUILD='20261002-r141-standardization';
  if(window.__STAINHER_STANDARDIZATION_R141__===BUILD)return;
  window.__STAINHER_STANDARDIZATION_R141__=BUILD;

  const TABLE='estandarizacion_actividades_v141';
  const VIEW_ROLES=new Set(['administrador','gerente','planificador','confiabilidad','prevencion','supervisor']);
  const EDIT_ROLES=new Set(['administrador','planificador','confiabilidad','prevencion','supervisor']);
  const BASE_EQUIPMENT=[
    'JAULA ASEA',
    'JAULA ALIMAK',
    'NODO 3700',
    'Hilton 2 y 3 (Multiservicio)',
    'Ascensor EILA 1 y 2'
  ];

  const stdState={
    rows:[],
    equipment:'',
    status:'',
    search:'',
    loading:false
  };

  const esc=value=>{
    if(typeof window.esc==='function')return window.esc(value??'');
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  };
  const role=()=>{
    try{return String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase()}
    catch(_){return ''}
  };
  const canView=()=>VIEW_ROLES.has(role());
  const canEdit=()=>EDIT_ROLES.has(role());
  const fmtDate=value=>{
    if(!value)return '—';
    try{return new Date(String(value).slice(0,10)+'T12:00:00').toLocaleDateString('es-CL')}
    catch(_){return String(value)}
  };
  const todayIso=()=>{
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const statusClass=value=>value==='REALIZADO'?'std-ok':value==='EN PROCESO'?'std-warn':'std-bad';
  const statusLabel=value=>value==='REALIZADO'?'Realizado':value==='EN PROCESO'?'En proceso':'No realizado';

  function ensureStyles(){
    if(document.getElementById('stainher-standardization-r141-style'))return;
    const style=document.createElement('style');
    style.id='stainher-standardization-r141-style';
    style.textContent=`
      #page-estandarizacion .std-kpis{display:grid;grid-template-columns:repeat(5,minmax(135px,1fr));gap:12px;margin-bottom:18px}
      #page-estandarizacion .std-kpi{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:14px;padding:16px}
      #page-estandarizacion .std-kpi span{display:block;color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.05em}
      #page-estandarizacion .std-kpi strong{display:block;font-size:26px;margin-top:8px}
      #page-estandarizacion .std-kpi small{display:block;color:var(--muted);font-size:11px;margin-top:5px}
      #page-estandarizacion .std-equipment-grid{display:grid;grid-template-columns:repeat(5,minmax(170px,1fr));gap:10px;margin-bottom:18px}
      #page-estandarizacion .std-equipment-card{border:1px solid var(--line);background:var(--panel);color:var(--text);border-radius:12px;padding:13px;text-align:left;cursor:pointer}
      #page-estandarizacion .std-equipment-card:hover,#page-estandarizacion .std-equipment-card.active{border-color:#60a5fa;box-shadow:inset 0 0 0 1px rgba(96,165,250,.18)}
      #page-estandarizacion .std-equipment-card strong{display:block;font-size:13px;min-height:32px}
      #page-estandarizacion .std-equipment-card small{display:block;color:var(--muted);margin-top:6px}
      #page-estandarizacion .std-progress{height:7px;border-radius:99px;background:#242d39;overflow:hidden;margin-top:9px}
      #page-estandarizacion .std-progress>i{display:block;height:100%;background:var(--green)}
      #page-estandarizacion .std-toolbar{display:grid;grid-template-columns:minmax(180px,1.2fr) minmax(160px,.8fr) minmax(220px,1.4fr) auto;gap:10px;align-items:end;margin-bottom:16px}
      #page-estandarizacion .std-toolbar label{font-size:11px;color:var(--muted)}
      #page-estandarizacion .std-toolbar .field{width:100%;margin-top:5px}
      #page-estandarizacion .std-group{border:1px solid var(--line);border-radius:14px;background:var(--panel);margin-bottom:14px;overflow:hidden}
      #page-estandarizacion .std-group>summary{cursor:pointer;list-style:none;padding:14px 16px;background:var(--panel2);display:flex;align-items:center;justify-content:space-between;gap:12px}
      #page-estandarizacion .std-group>summary::-webkit-details-marker{display:none}
      #page-estandarizacion .std-group-head{display:flex;align-items:center;gap:10px;min-width:0}
      #page-estandarizacion .std-group-head strong{white-space:normal}
      #page-estandarizacion .std-group-meta{color:var(--muted);font-size:12px;white-space:nowrap}
      #page-estandarizacion .std-table-wrap{overflow:auto}
      #page-estandarizacion .std-table{min-width:1120px;margin:0}
      #page-estandarizacion .std-table th{position:sticky;top:0;background:var(--panel);z-index:2}
      #page-estandarizacion .std-table td{line-height:1.4}
      #page-estandarizacion .std-table .std-activity{min-width:235px;font-weight:700}
      #page-estandarizacion .std-table .std-scope{min-width:220px}
      #page-estandarizacion .std-table .std-observation{min-width:210px}
      #page-estandarizacion .std-table .std-detail{min-width:190px}
      #page-estandarizacion .std-status{display:inline-flex;align-items:center;justify-content:center;border-radius:99px;padding:5px 9px;font-size:11px;font-weight:800;white-space:nowrap}
      #page-estandarizacion .std-ok{background:rgba(52,211,153,.13);color:var(--green)}
      #page-estandarizacion .std-warn{background:rgba(251,191,36,.13);color:var(--yellow)}
      #page-estandarizacion .std-bad{background:rgba(251,113,133,.13);color:var(--red)}
      #page-estandarizacion .std-actions{display:flex;gap:7px;flex-wrap:wrap}
      #page-estandarizacion .std-empty{padding:28px;text-align:center;color:var(--muted)}
      #page-estandarizacion .std-source{font-size:11px;color:var(--muted);margin-top:10px}
      .std-modal-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}
      .std-modal-grid label{font-size:11px;color:var(--muted)}
      .std-modal-grid .field{width:100%;margin-top:5px}
      .std-modal-grid .std-full{grid-column:1/-1}
      @media(max-width:1250px){
        #page-estandarizacion .std-kpis{grid-template-columns:repeat(3,1fr)}
        #page-estandarizacion .std-equipment-grid{grid-template-columns:repeat(3,1fr)}
      }
      @media(max-width:820px){
        #page-estandarizacion .std-kpis{grid-template-columns:1fr 1fr}
        #page-estandarizacion .std-equipment-grid{grid-template-columns:1fr 1fr}
        #page-estandarizacion .std-toolbar{grid-template-columns:1fr 1fr}
      }
      @media(max-width:560px){
        #page-estandarizacion .std-kpis,#page-estandarizacion .std-equipment-grid,#page-estandarizacion .std-toolbar,.std-modal-grid{grid-template-columns:1fr}
        .std-modal-grid .std-full{grid-column:auto}
      }
    `;
    document.head.appendChild(style);
  }

  function ensurePage(){
    const main=document.querySelector('.main');
    if(!main)return null;
    let page=document.getElementById('page-estandarizacion');
    if(!page){
      page=document.createElement('section');
      page.id='page-estandarizacion';
      page.className='page hidden';
      const equipos=document.getElementById('page-equipos');
      if(equipos?.nextSibling)main.insertBefore(page,equipos.nextSibling);
      else main.appendChild(page);
    }
    return page;
  }

  function activatePage(){
    if(!canView())return;
    document.querySelectorAll('.nav button').forEach(x=>x.classList.remove('active'));
    document.querySelector('[data-page="estandarizacion"]')?.classList.add('active');
    document.querySelectorAll('.page').forEach(x=>x.classList.add('hidden'));
    const page=ensurePage();
    page?.classList.remove('hidden');
    render();
  }

  function ensureNav(){
    const nav=document.querySelector('.nav');
    if(!nav)return false;
    let button=nav.querySelector('[data-page="estandarizacion"]');
    if(!button){
      button=document.createElement('button');
      button.dataset.page='estandarizacion';
      button.className='v15-nav stainher-standardization-nav';
      button.innerHTML='◇ Estandarización';
      const equipment=nav.querySelector('[data-page="equipos"]');
      if(equipment?.nextSibling)nav.insertBefore(button,equipment.nextSibling);
      else nav.appendChild(button);
      button.addEventListener('click',event=>{
        event.preventDefault();
        activatePage();
      });
    }
    button.classList.toggle('hidden',!canView());
    return true;
  }

  async function loadRows(){
    stdState.loading=true;
    try{
      const q=await window.sb
        .from(TABLE)
        .select('*')
        .eq('activo',true)
        .order('orden',{ascending:true})
        .order('equipo',{ascending:true});
      if(q.error)throw q.error;
      stdState.rows=q.data||[];
      return stdState.rows;
    }finally{
      stdState.loading=false;
    }
  }

  function stats(rows=stdState.rows){
    const total=rows.length;
    const done=rows.filter(x=>x.estado==='REALIZADO').length;
    const process=rows.filter(x=>x.estado==='EN PROCESO').length;
    const pending=rows.filter(x=>x.estado==='NO REALIZADO').length;
    return {total,done,process,pending,pct:total?Math.round(done*1000/total)/10:0};
  }

  function equipmentNames(){
    const names=[...new Set([...BASE_EQUIPMENT,...stdState.rows.map(x=>x.equipo).filter(Boolean)])];
    return names.sort((a,b)=>a.localeCompare(b,'es'));
  }

  function filteredRows(){
    const search=stdState.search.trim().toLowerCase();
    return stdState.rows.filter(row=>{
      if(stdState.equipment&&row.equipo!==stdState.equipment)return false;
      if(stdState.status&&row.estado!==stdState.status)return false;
      if(search){
        const text=[row.equipo,row.actividad,row.alcance,row.observacion,row.responsable,row.detalle_ejecucion]
          .filter(Boolean).join(' ').toLowerCase();
        if(!text.includes(search))return false;
      }
      return true;
    });
  }

  function kpiHtml(){
    const s=stats();
    return `<div class="std-kpis">
      <div class="std-kpi"><span>Total actividades</span><strong>${s.total}</strong><small>Control activo</small></div>
      <div class="std-kpi"><span>Realizadas</span><strong style="color:var(--green)">${s.done}</strong><small>${s.pct}% de avance</small></div>
      <div class="std-kpi"><span>En proceso</span><strong style="color:var(--yellow)">${s.process}</strong><small>Trabajo iniciado</small></div>
      <div class="std-kpi"><span>No realizadas</span><strong style="color:var(--red)">${s.pending}</strong><small>Pendientes de intervención</small></div>
      <div class="std-kpi"><span>Avance global</span><strong>${s.pct}%</strong><div class="std-progress"><i style="width:${Math.min(100,s.pct)}%"></i></div></div>
    </div>`;
  }

  function equipmentCardsHtml(){
    return `<div class="std-equipment-grid">${equipmentNames().map(name=>{
      const rows=stdState.rows.filter(x=>x.equipo===name);
      const s=stats(rows);
      return `<button type="button" class="std-equipment-card ${stdState.equipment===name?'active':''}" onclick="StainherStandardizationR141.filterEquipment('${esc(name).replace(/'/g,'&#39;')}')">
        <strong>${esc(name)}</strong>
        <small>${s.done} de ${s.total} realizadas · ${s.pct}%</small>
        <div class="std-progress"><i style="width:${Math.min(100,s.pct)}%"></i></div>
      </button>`;
    }).join('')}</div>`;
  }

  function toolbarHtml(){
    return `<div class="panel">
      <div class="std-toolbar">
        <label>Equipo
          <select id="stdEquipmentFilter" class="field">
            <option value="">Todos los equipos</option>
            ${equipmentNames().map(name=>`<option value="${esc(name)}" ${stdState.equipment===name?'selected':''}>${esc(name)}</option>`).join('')}
          </select>
        </label>
        <label>Estado
          <select id="stdStatusFilter" class="field">
            <option value="">Todos</option>
            <option value="REALIZADO" ${stdState.status==='REALIZADO'?'selected':''}>Realizado</option>
            <option value="EN PROCESO" ${stdState.status==='EN PROCESO'?'selected':''}>En proceso</option>
            <option value="NO REALIZADO" ${stdState.status==='NO REALIZADO'?'selected':''}>No realizado</option>
          </select>
        </label>
        <label>Buscar
          <input id="stdSearchFilter" class="field" type="search" placeholder="Actividad, alcance, observación..." value="${esc(stdState.search)}">
        </label>
        <button class="btn" type="button" onclick="StainherStandardizationR141.clearFilters()">Limpiar filtros</button>
      </div>
    </div>`;
  }

  function groupsHtml(){
    const rows=filteredRows();
    if(!rows.length)return '<div class="panel std-empty">No hay actividades que coincidan con los filtros.</div>';
    const groups={};
    rows.forEach(row=>(groups[row.equipo]||(groups[row.equipo]=[])).push(row));
    return Object.entries(groups).map(([equipment,items])=>{
      const s=stats(items);
      return `<details class="std-group" open>
        <summary>
          <div class="std-group-head"><strong>${esc(equipment)}</strong><span class="std-status ${s.pending?'std-bad':s.process?'std-warn':'std-ok'}">${s.done}/${s.total} realizadas</span></div>
          <div class="std-group-meta">${s.pct}% avance</div>
        </summary>
        <div class="std-table-wrap">
          <table class="std-table">
            <thead><tr>
              <th>Actividad</th><th>Alcance</th><th>Observación</th><th>Estado</th>
              <th>Fecha ejecución</th><th>Responsable / detalle</th>${canEdit()?'<th>Acción</th>':''}
            </tr></thead>
            <tbody>
              ${items.map(row=>`<tr>
                <td class="std-activity">${esc(row.actividad)}</td>
                <td class="std-scope">${esc(row.alcance||'—')}</td>
                <td class="std-observation">${esc(row.observacion||'—')}</td>
                <td><span class="std-status ${statusClass(row.estado)}">${statusLabel(row.estado)}</span></td>
                <td>${fmtDate(row.fecha_ejecucion)}</td>
                <td class="std-detail">
                  ${row.responsable?'<b>'+esc(row.responsable)+'</b>':''}
                  ${row.responsable&&row.detalle_ejecucion?'<br>':''}
                  ${esc(row.detalle_ejecucion||(!row.responsable?'—':''))}
                </td>
                ${canEdit()?`<td><div class="std-actions"><button class="btn" type="button" onclick="StainherStandardizationR141.edit('${row.id}')">Editar</button></div></td>`:''}
              </tr>`).join('')}
            </tbody>
          </table>
        </div>
      </details>`;
    }).join('');
  }

  function bindFilters(){
    const equipment=document.getElementById('stdEquipmentFilter');
    const status=document.getElementById('stdStatusFilter');
    const search=document.getElementById('stdSearchFilter');
    if(equipment)equipment.onchange=()=>{stdState.equipment=equipment.value;renderLoaded()};
    if(status)status.onchange=()=>{stdState.status=status.value;renderLoaded()};
    if(search){
      let timer;
      search.oninput=()=>{
        clearTimeout(timer);
        timer=setTimeout(()=>{stdState.search=search.value;renderLoaded()},180);
      };
    }
  }

  function renderLoaded(){
    const page=ensurePage();
    if(!page||!canView())return;
    page.innerHTML=`
      <div class="topbar">
        <div><h2>Estandarización</h2><p>Control de actividades de normalización y cierre de brechas técnicas por equipo.</p></div>
        <div class="actions">
          <button class="btn" type="button" onclick="StainherStandardizationR141.exportCsv()">↓ Exportar CSV</button>
          <button class="btn" type="button" onclick="StainherStandardizationR141.refresh()">↻ Actualizar</button>
          ${canEdit()?'<button class="btn primary" type="button" onclick="StainherStandardizationR141.edit()">＋ Nueva actividad</button>':''}
        </div>
      </div>
      ${kpiHtml()}
      ${equipmentCardsHtml()}
      ${toolbarHtml()}
      <div id="stdGroups">${groupsHtml()}</div>
      <div class="std-source">Base inicial migrada desde “pendientes normalizacion equipos .xlsx”. Los cambios posteriores quedan guardados directamente en Stainher.</div>
    `;
    bindFilters();
  }

  async function render(){
    const page=ensurePage();
    if(!page||!canView())return;
    page.innerHTML='<div class="topbar"><div><h2>Estandarización</h2><p>Control de actividades de normalización por equipo.</p></div></div><div class="panel std-empty">Cargando control…</div>';
    try{
      await loadRows();
      renderLoaded();
    }catch(error){
      page.innerHTML=`<div class="topbar"><div><h2>Estandarización</h2><p>Control de actividades de normalización por equipo.</p></div></div>
        <div class="notice error">No fue posible cargar el módulo: ${esc(error.message||String(error))}</div>`;
    }
  }

  function openEditor(id=''){
    if(!canEdit())return;
    const row=id?stdState.rows.find(x=>String(x.id)===String(id)):null;
    if(id&&!row)return window.toast?.('Actividad no encontrada.','error');
    const modal=document.getElementById('modalRoot');
    if(!modal)return;
    const values=row||{
      equipo:stdState.equipment||BASE_EQUIPMENT[0],
      actividad:'',
      alcance:'',
      observacion:'',
      estado:'NO REALIZADO',
      fecha_ejecucion:null,
      responsable:'',
      detalle_ejecucion:''
    };
    const names=equipmentNames();
    modal.innerHTML=`<div class="modal-bg"><div class="modal">
      <div class="row-between"><div><h3>${row?'Editar actividad':'Nueva actividad de estandarización'}</h3><div class="muted">Actualiza el estado y los antecedentes de la normalización.</div></div><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div>
      <form id="stdEditForm" class="std-modal-grid" style="margin-top:16px">
        <label>Equipo
          <input class="field" name="equipo" list="stdEquipmentList" required value="${esc(values.equipo||'')}">
          <datalist id="stdEquipmentList">${names.map(name=>`<option value="${esc(name)}"></option>`).join('')}</datalist>
        </label>
        <label>Estado
          <select class="field" name="estado" required>
            <option value="NO REALIZADO" ${values.estado==='NO REALIZADO'?'selected':''}>No realizado</option>
            <option value="EN PROCESO" ${values.estado==='EN PROCESO'?'selected':''}>En proceso</option>
            <option value="REALIZADO" ${values.estado==='REALIZADO'?'selected':''}>Realizado</option>
          </select>
        </label>
        <label class="std-full">Actividad
          <textarea class="field" name="actividad" rows="2" required>${esc(values.actividad||'')}</textarea>
        </label>
        <label class="std-full">Alcance
          <textarea class="field" name="alcance" rows="2">${esc(values.alcance||'')}</textarea>
        </label>
        <label class="std-full">Observación / pendiente actual
          <textarea class="field" name="observacion" rows="2">${esc(values.observacion||'')}</textarea>
        </label>
        <label>Fecha de ejecución
          <input class="field" name="fecha_ejecucion" type="date" value="${esc(values.fecha_ejecucion||'')}">
        </label>
        <label>Responsable
          <input class="field" name="responsable" value="${esc(values.responsable||'')}" placeholder="Nombre de quien ejecutó">
        </label>
        <label class="std-full">Detalle de ejecución / avance
          <textarea class="field" name="detalle_ejecucion" rows="3">${esc(values.detalle_ejecucion||'')}</textarea>
        </label>
        <div class="std-full"><button class="btn primary" type="submit">${row?'Guardar cambios':'Crear actividad'}</button></div>
      </form>
    </div></div>`;

    const form=document.getElementById('stdEditForm');
    form.onsubmit=async event=>{
      event.preventDefault();
      const fd=new FormData(form);
      const estado=String(fd.get('estado')||'NO REALIZADO');
      let fecha=String(fd.get('fecha_ejecucion')||'').trim()||null;
      if(estado==='REALIZADO'&&!fecha)fecha=todayIso();
      if(estado!=='REALIZADO'&&row?.estado!=='REALIZADO')fecha=null;

      const payload={
        equipo:String(fd.get('equipo')||'').trim(),
        actividad:String(fd.get('actividad')||'').trim(),
        alcance:String(fd.get('alcance')||'').trim()||null,
        observacion:String(fd.get('observacion')||'').trim()||null,
        estado,
        fecha_ejecucion:fecha,
        responsable:String(fd.get('responsable')||'').trim()||null,
        detalle_ejecucion:String(fd.get('detalle_ejecucion')||'').trim()||null
      };
      if(!payload.equipo||!payload.actividad)return window.toast?.('Equipo y actividad son obligatorios.','error');

      const button=form.querySelector('button[type="submit"]');
      if(button){button.disabled=true;button.textContent='Guardando…';}
      try{
        let q;
        if(row){
          q=await window.sb.from(TABLE).update(payload).eq('id',row.id).select('*').single();
        }else{
          const maxOrder=stdState.rows.reduce((m,x)=>Math.max(m,Number(x.orden)||0),0);
          q=await window.sb.from(TABLE).insert({
            ...payload,
            orden:maxOrder+1,
            created_by:window.state?.session?.user?.id||null
          }).select('*').single();
        }
        if(q.error)throw q.error;

        try{
          window.v1512Audit?.('estandarizacion',row?'editar_actividad':'crear_actividad',String(q.data?.id||row?.id||''),{
            equipo:payload.equipo,
            actividad:payload.actividad,
            estado:payload.estado
          });
        }catch(_){}

        window.closeModal?.();
        await loadRows();
        renderLoaded();
        window.toast?.(row?'Actividad actualizada.':'Actividad creada.','success');
      }catch(error){
        if(button){button.disabled=false;button.textContent=row?'Guardar cambios':'Crear actividad';}
        window.toast?.('No se pudo guardar: '+(error.message||String(error)),'error');
      }
    };
  }

  function exportCsv(){
    const rows=filteredRows();
    const header=['Equipo','Actividad','Alcance','Observación','Estado','Fecha ejecución','Responsable','Detalle ejecución'];
    const quote=value=>'"'+String(value??'').replace(/"/g,'""')+'"';
    const lines=[header,...rows.map(row=>[
      row.equipo,row.actividad,row.alcance,row.observacion,statusLabel(row.estado),
      row.fecha_ejecucion||'',row.responsable||'',row.detalle_ejecucion||''
    ])].map(cols=>cols.map(quote).join(';'));
    const blob=new Blob(['\ufeff'+lines.join('\r\n')],{type:'text/csv;charset=utf-8;'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download='Estandarizacion_Stainher_'+todayIso()+'.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(()=>URL.revokeObjectURL(url),1000);
  }

  async function refresh(){
    try{await loadRows();renderLoaded();window.toast?.('Estandarización actualizada.','success')}
    catch(error){window.toast?.('No se pudo actualizar: '+(error.message||String(error)),'error')}
  }

  function filterEquipment(name){
    stdState.equipment=stdState.equipment===name?'':name;
    renderLoaded();
  }

  function clearFilters(){
    stdState.equipment='';
    stdState.status='';
    stdState.search='';
    renderLoaded();
  }

  function install(){
    ensureStyles();
    ensurePage();
    ensureNav();
    let attempts=0;
    const timer=setInterval(()=>{
      attempts++;
      const ok=ensureNav();
      if(ok||attempts>=100)clearInterval(timer);
    },100);
  }

  window.renderEstandarizacion=render;
  window.StainherStandardizationR141=Object.freeze({
    install,
    render,
    refresh,
    edit:openEditor,
    exportCsv,
    filterEquipment,
    clearFilters,
    canView,
    canEdit,
    version:BUILD
  });

  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:runtime-r140-ready',install);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
