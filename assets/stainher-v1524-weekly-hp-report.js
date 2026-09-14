/* Stainher V15.24 · R66 · Reporte Semanal HP simplificado dentro de Turnos y Novedades.
 * - Sin clasificación mensual Operaciones/Inversiones.
 * - ADC, Gerente y Confiabilidad: horas administrativas manuales.
 * - Planificador y Experta en Prevención: horas administrativas automáticas según malla.
 * - Resto de la dotación: horas operativas automáticas según malla.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_WEEKLY_HP_REPORT__)return;
  window.__STAINHER_WEEKLY_HP_REPORT__=true;

  const PAGE_ID='reporte-hp';
  const VIEW_ROLES=new Set(['administrador','gerente','confiabilidad','planificador','prevencion','recursos_humanos']);
  const EDIT_ROLES=new Set(['administrador','planificador']);
  const MANUAL_ADMIN_ROLES=new Set(['administrador','gerente','confiabilidad']);
  const AUTO_ADMIN_ROLES=new Set(['planificador','planificacion','programacion','prevencion','experto_prevencion','experta_prevencion']);
  const CONTRACT='4600029879';
  const BLOCK_TYPES=['vacaciones','licencia_medica','permiso_no_remunerado','permiso','falta','suspendido_encierro'];

  const norm=v=>String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'_');
  const role=()=>norm(typeof window.v11Role==='function'?window.v11Role():(window.state?.profile?.rol||window.state?.user?.rol||window.currentProfile?.rol||''));
  const canView=()=>VIEW_ROLES.has(role());
  const canEdit=()=>EDIT_ROLES.has(role());
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot',"'":'&#039;'}[c]));
  const iso=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
  const dplus=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
  const inRange=(d,a,b)=>d>=a&&d<=b;
  const monthName=(y,m)=>new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
  const sum=(arr,key)=>arr.reduce((a,x)=>a+Number(x[key]||0),0);

  const state={year:new Date().getFullYear(),month:new Date().getMonth()+1,periods:[],people:[],profiles:new Map(),malla:[],nov:[],adjust:[],rows:[]};

  function defaultPeriods(y,m){
    const last=new Date(y,m,0).getDate(),mm=String(m).padStart(2,'0');
    const mk=(o,a,b)=>({orden:o,fecha_inicio:`${y}-${mm}-${String(a).padStart(2,'0')}`,fecha_fin:`${y}-${mm}-${String(Math.min(b,last)).padStart(2,'0')}`,etiqueta:''});
    return [mk(1,1,12),mk(2,13,19),mk(3,20,26),mk(4,27,last)];
  }
  function periodLabel(p){
    if(p.etiqueta)return p.etiqueta;
    const a=Number(p.fecha_inicio.slice(-2)),b=Number(p.fecha_fin.slice(-2));
    const mn=new Intl.DateTimeFormat('es-CL',{month:'long'}).format(new Date(p.fecha_inicio+'T12:00:00'));
    return `${String(a).padStart(2,'0')} al ${String(b).padStart(2,'0')} de ${mn}`;
  }

  function installRenderer(){
    try{
      const current=typeof window.v1523Renderer==='function'?window.v1523Renderer:(typeof v1523Renderer==='function'?v1523Renderer:null);
      if(typeof current!=='function'||current.__stainherHpR66)return;
      const hpRenderer=function(page){return page===PAGE_ID?render:current(page)};
      hpRenderer.__stainherHpR66=true;
      hpRenderer.__stainherHpBase=current;
      window.v1523Renderer=hpRenderer;
      try{v1523Renderer=hpRenderer}catch(_e){}
    }catch(error){console.error('[Stainher HP R66] No fue posible registrar el renderer HP.',error)}
  }

  function personRole(person){return norm(state.profiles.get(String(person?.user_id))?.rol||'')}
  function isManualAdminPerson(person){
    const r=personRole(person),cargo=norm(person?.cargo||'');
    return MANUAL_ADMIN_ROLES.has(r)||cargo==='adc'||cargo.includes('administrador_de_contrato')||cargo.includes('gerente')||cargo.includes('confiabilidad');
  }
  function isAutoAdminPerson(person){
    const r=personRole(person),cargo=norm(person?.cargo||'');
    return AUTO_ADMIN_ROLES.has(r)||cargo.includes('planific')||cargo.includes('programa')||cargo.includes('experta_en_prevencion')||cargo.includes('experto_en_prevencion');
  }
  function manualAdminPeople(){return state.people.filter(isManualAdminPerson)}

  async function load(){
    const y=state.year,m=state.month;
    const p=await window.sb.from('hp_periodos_codelco').select('*').eq('anio',y).eq('mes',m).order('orden');
    state.periods=p.error||!p.data?.length?defaultPeriods(y,m):p.data;
    const min=state.periods[0].fecha_inicio,max=state.periods[state.periods.length-1].fecha_fin;
    const [dot,prof,mal,nov,adj]=await Promise.all([
      window.sb.from('dotacion_contrato').select('id,user_id,nombre,cargo,rut,estado,aplica_turnos,orden').eq('estado','activo').order('orden',{ascending:true}),
      window.sb.from('perfiles').select('id,nombre,rol,activo').eq('activo',true),
      window.sb.from('turnos_malla_v1512').select('user_id,fecha,turno_base,estado_publicacion').gte('fecha',dplus(min,-1)).lte('fecha',max).eq('estado_publicacion','publicado'),
      window.sb.from('turnos_novedades_v15').select('user_id,tipo,fecha_inicio,fecha_fin').lte('fecha_inicio',max).gte('fecha_fin',min),
      window.sb.from('hp_ajustes_manuales').select('*').eq('tipo','terreno_administrativo').gte('fecha',min).lte('fecha',max)
    ]);
    if(dot.error)throw dot.error;if(prof.error)throw prof.error;if(mal.error)throw mal.error;if(nov.error)throw nov.error;
    state.people=(dot.data||[]).filter(x=>x.user_id);
    state.profiles=new Map((prof.data||[]).map(x=>[String(x.id),x]));
    state.malla=mal.data||[];
    state.nov=nov.data||[];
    state.adjust=adj.error?[]:(adj.data||[]);
    state.rows=state.people.map(calcPerson);
  }

  function blocked(uid,date){return state.nov.some(n=>String(n.user_id)===String(uid)&&BLOCK_TYPES.some(t=>String(n.tipo||'').includes(t))&&inRange(date,n.fecha_inicio,n.fecha_fin||n.fecha_inicio))}
  function turn(uid,date){return state.malla.find(r=>String(r.user_id)===String(uid)&&r.fecha===date)?.turno_base||''}
  function manualAdmin(uid,a,b){return state.adjust.filter(x=>String(x.user_id)===String(uid)&&x.tipo==='terreno_administrativo'&&inRange(x.fecha,a,b)).reduce((s,x)=>s+Number(x.horas||0),0)}
  function autoAdminHours(uid,date){
    const t=turn(uid,date);if(!t||t==='L')return 0;
    const dow=new Date(date+'T12:00:00').getDay();
    if(dow>=1&&dow<=3)return 12;
    if(dow===4)return 6;
    return 0;
  }

  function calcPeriod(person,p){
    let admin=0,oper=0;
    if(isManualAdminPerson(person)){
      admin=manualAdmin(person.user_id,p.fecha_inicio,p.fecha_fin);
    }else if(isAutoAdminPerson(person)){
      for(let d=p.fecha_inicio;d<=p.fecha_fin;d=dplus(d,1)){
        if(blocked(person.user_id,d))continue;
        admin+=autoAdminHours(person.user_id,d);
      }
    }else{
      for(let d=p.fecha_inicio;d<=p.fecha_fin;d=dplus(d,1)){
        if(blocked(person.user_id,d))continue;
        const td=turn(person.user_id,d),prev=turn(person.user_id,dplus(d,-1));
        if(td==='A')oper+=12;
        if(td==='C')oper+=5;
        if(prev==='C'&&!blocked(person.user_id,d))oper+=7;
      }
    }
    return {admin,oper,spor:0};
  }
  function calcPerson(person){
    const periods=state.periods.map(p=>calcPeriod(person,p)),admin=sum(periods,'admin'),oper=sum(periods,'oper'),spor=0;
    return {...person,periods,admin,oper,spor,total:admin+oper};
  }

  function monthlySummary(){
    const admin=sum(state.rows,'admin'),oper=sum(state.rows,'oper'),spor=0,total=admin+oper,fte=state.rows.filter(r=>r.total>0).length;
    return {admin,oper,spor,total,fte};
  }
  function summaryHtml(){
    const s=monthlySummary(),fmt=n=>Number(n||0).toLocaleString('es-CL',{maximumFractionDigits:2});
    return `<div class="hp-summary-wrap"><table class="hp-summary"><thead><tr><th>RESUMEN MENSUAL</th><th>Total</th></tr></thead><tbody><tr><th>TOTAL HH Administrativas</th><td>${fmt(s.admin)}</td></tr><tr><th>TOTAL HH Operativas</th><td>${fmt(s.oper)}</td></tr><tr><th>TOTAL HH Esporádicas</th><td>${fmt(s.spor)}</td></tr><tr class="hp-summary-strong"><th>TOTAL HH EN FAENA</th><td>${fmt(s.total)}</td></tr><tr class="hp-summary-strong"><th>Total FTE</th><td>${s.fte}</td></tr></tbody></table></div>`;
  }

  function renderTable(){
    const head1=state.periods.map(p=>`<th colspan="3">${esc(periodLabel(p))}</th>`).join('');
    const head2=state.periods.map(()=>'<th>Horas Administrativas</th><th>Horas Operativas</th><th>Horas Operativas Esporádicas</th>').join('');
    const body=state.rows.map(r=>`<tr><td>${CONTRACT}</td><td>${esc((r.cargo||'').toUpperCase())}</td><td>${esc(r.rut||'')}</td><td>${esc(r.nombre)}</td>${r.periods.map(x=>`<td>${x.admin||0}</td><td>${x.oper||0}</td><td>${x.spor||0}</td>`).join('')}</tr>`).join('');
    return `<div class="hp-table-wrap"><table class="hp-table"><thead><tr><th rowspan="2">Número Contrato</th><th rowspan="2">Gerencia Origen</th><th rowspan="2">Rut Trabajador</th><th rowspan="2">Nombre Trabajador</th>${head1}</tr><tr>${head2}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function periodEditor(){
    return `<div class="panel"><div class="row-between"><div><h3>Rangos Codelco</h3><div class="muted">Los cortes son editables y se guardan por mes.</div></div>${canEdit()?'<button class="btn primary" id="hpSavePeriods">Guardar rangos</button>':''}</div><div class="hp-period-grid">${state.periods.map((p,i)=>`<div class="hp-period-card"><b>Período ${i+1}</b><label>Desde<input class="field hp-p-start" type="date" value="${p.fecha_inicio}" ${canEdit()?'':'disabled'}></label><label>Hasta<input class="field hp-p-end" type="date" value="${p.fecha_fin}" ${canEdit()?'':'disabled'}></label><label>Glosa<input class="field hp-p-label" value="${esc(p.etiqueta||'')}" placeholder="Opcional" ${canEdit()?'':'disabled'}></label></div>`).join('')}</div></div>`;
  }
  function rulesHtml(){
    return `<div class="notice hp-rules"><b>Reglas de cálculo HP:</b> Administrador de Contrato (ADC), Gerente y Confiabilidad usan horas administrativas ingresadas manualmente. Planificador y Experta en Prevención generan siempre horas administrativas desde su malla de turnos. El resto de la dotación genera horas operativas desde la malla.</div>`;
  }
  function adjustmentsHtml(){
    if(!canEdit())return'';
    const people=manualAdminPeople();
    if(!people.length)return `<div class="panel"><h3>Horas administrativas manuales</h3><div class="notice warn">No hay ADC, Gerente o personal de Confiabilidad activo disponible para registrar horas.</div></div>`;
    return `<div class="panel"><div><h3>Horas administrativas manuales</h3><div class="muted">Disponible únicamente para Administrador de Contrato (ADC), Gerente y Confiabilidad.</div></div><form id="hpAdjForm" class="hp-adjust-grid"><label>Persona<select class="field" name="user_id" required><option value="">Seleccionar</option>${people.map(p=>`<option value="${p.user_id}">${esc(p.nombre)}</option>`).join('')}</select></label><label>Fecha<input class="field" name="fecha" type="date" required></label><label>Horas administrativas<input class="field" name="horas" type="number" min="0" step="0.5" value="12" required></label><label class="hp-adj-ob">Observación<input class="field" name="observacion"></label><button class="btn primary" type="submit">Guardar horas</button></form></div>`;
  }

  async function render(){
    const page=document.getElementById(`page-${PAGE_ID}`);if(!page)return;
    if(!canView()){page.innerHTML='<div class="notice warn">No tienes permisos para consultar Reporte Semanal HP.</div>';return}
    page.innerHTML='<div class="empty">Cargando Reporte Semanal HP…</div>';
    try{
      await load();
      page.innerHTML=`<div class="topbar"><div><h2>Reporte Semanal HP</h2><p>Horas administrativas y operativas según cortes semanales informados por Codelco.</p></div><div class="actions"><button class="btn" id="hpExport">Exportar Excel</button></div></div><div class="hp-toolbar"><label>Mes<input id="hpMonth" class="field" type="month" value="${state.year}-${String(state.month).padStart(2,'0')}"></label><span class="status ok">División Andina · ${esc(monthName(state.year,state.month))}</span></div>${rulesHtml()}${periodEditor()}${adjustmentsHtml()}<div class="panel"><h3>HP Trabajador</h3>${renderTable()}</div><div class="panel"><h3>Resumen Mensual</h3>${summaryHtml()}</div>`;
      bind();
    }catch(e){page.innerHTML=`<div class="notice error">No fue posible cargar Reporte Semanal HP: ${esc(e.message||e)}</div>`}
  }

  function bind(){
    document.getElementById('hpMonth')?.addEventListener('change',e=>{const [y,m]=e.target.value.split('-').map(Number);state.year=y;state.month=m;render()});
    document.getElementById('hpSavePeriods')?.addEventListener('click',savePeriods);
    document.getElementById('hpAdjForm')?.addEventListener('submit',saveAdjustment);
    document.getElementById('hpExport')?.addEventListener('click',exportExcel);
  }
  async function savePeriods(){
    const cards=[...document.querySelectorAll('.hp-period-card')];
    const rows=cards.map((c,i)=>({anio:state.year,mes:state.month,orden:i+1,fecha_inicio:c.querySelector('.hp-p-start').value,fecha_fin:c.querySelector('.hp-p-end').value,etiqueta:c.querySelector('.hp-p-label').value||null,created_by:window.state.session.user.id,updated_at:new Date().toISOString()}));
    if(rows.some(x=>!x.fecha_inicio||!x.fecha_fin||x.fecha_fin<x.fecha_inicio))return window.toast?.('Revisa los rangos ingresados.','error');
    const {error}=await window.sb.from('hp_periodos_codelco').upsert(rows,{onConflict:'anio,mes,orden'});
    if(error)return window.toast?.(error.message,'error');
    window.toast?.('Rangos Codelco actualizados.','success');await render();
  }
  async function saveAdjustment(e){
    e.preventDefault();
    const o=Object.fromEntries(new FormData(e.target));
    const person=state.people.find(p=>String(p.user_id)===String(o.user_id));
    if(!person||!isManualAdminPerson(person))return window.toast?.('Solo se pueden registrar horas administrativas para ADC, Gerente o Confiabilidad.','error');
    o.tipo='terreno_administrativo';o.horas=Number(o.horas)||0;o.observacion=o.observacion||null;o.created_by=window.state.session.user.id;o.updated_at=new Date().toISOString();
    const {error}=await window.sb.from('hp_ajustes_manuales').upsert(o,{onConflict:'user_id,fecha,tipo'});
    if(error)return window.toast?.(error.message,'error');
    window.toast?.('Horas administrativas guardadas.','success');await render();
  }
  function exportExcel(){
    if(!window.XLSX)return window.toast?.('No está disponible el exportador Excel.','error');
    const detail=state.rows.map(r=>{
      const o={'Número Contrato':CONTRACT,'Gerencia Origen':(r.cargo||'').toUpperCase(),'Rut Trabajador':r.rut||'','Nombre Trabajador':r.nombre};
      state.periods.forEach((p,i)=>{const l=periodLabel(p),x=r.periods[i];o[`${l} · Horas Administrativas`]=x.admin;o[`${l} · Horas Operativas`]=x.oper;o[`${l} · Horas Operativas Esporádicas`]=x.spor});
      return o;
    });
    const s=monthlySummary(),summary=[['RESUMEN MENSUAL','Total'],['TOTAL HH Administrativas',s.admin],['TOTAL HH Operativas',s.oper],['TOTAL HH Esporádicas',s.spor],['TOTAL HH EN FAENA',s.total],['Total FTE',s.fte]];
    const wb=XLSX.utils.book_new(),ws1=XLSX.utils.json_to_sheet(detail),ws2=XLSX.utils.ao_to_sheet(summary);
    XLSX.utils.book_append_sheet(wb,ws1,'HP Trabajador');XLSX.utils.book_append_sheet(wb,ws2,'Resumen Mensual');
    XLSX.writeFile(wb,`Reporte_Semanal_HP_${state.year}_${String(state.month).padStart(2,'0')}.xlsx`);
  }

  const style=document.createElement('style');
  style.id='stainher-weekly-hp-style';
  style.textContent=`#page-reporte-hp{min-width:0}.hp-toolbar{display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:14px}.hp-toolbar label{min-width:210px}.hp-rules{margin-bottom:14px}.hp-period-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}.hp-period-card{border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--panel2);display:grid;gap:8px}.hp-period-card label{display:grid;gap:4px;font-size:11px;color:var(--muted)}.hp-table-wrap,.hp-summary-wrap{overflow:auto;max-width:100%;border:1px solid var(--line);border-radius:12px}.hp-table{border-collapse:collapse;min-width:1450px;width:max-content}.hp-table th,.hp-table td,.hp-summary th,.hp-summary td{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:8px 10px;white-space:nowrap;text-align:center}.hp-table th,.hp-summary th{background:var(--panel2)}.hp-table td:nth-child(-n+4){text-align:left}.hp-summary{border-collapse:collapse;min-width:420px;width:min(100%,620px)}.hp-summary tbody th{text-align:left}.hp-summary-strong th,.hp-summary-strong td{font-weight:800}.hp-adjust-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1.6fr auto;gap:10px;align-items:end;margin-top:14px}.hp-adjust-grid label{display:grid;gap:5px;font-size:11px;color:var(--muted)}@media(max-width:1000px){.hp-period-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hp-adjust-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hp-adjust-grid button{width:100%}}@media(max-width:600px){.hp-period-grid,.hp-adjust-grid{grid-template-columns:1fr}.hp-toolbar label{min-width:0;width:100%}.hp-summary{min-width:380px}}`;
  document.head.appendChild(style);

  window.StainherWeeklyHP={render};
  function boot(){installRenderer();window.addEventListener('stainher:modules-ready',installRenderer);window.addEventListener('stainher:profile-ready',installRenderer)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();