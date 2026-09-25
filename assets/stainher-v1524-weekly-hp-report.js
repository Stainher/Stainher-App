/* Stainher V15.24 · R116 · Reporte Semanal HP dentro de Turnos y Novedades.
 * - Consolida la metodología histórica de reportabilidad HP.
 * - Turno A: 12 h. Turno C: 4 h al inicio + 8 h al día siguiente.
 * - Encierro dentro de turno no agrega horas esporádicas.
 * - Día adicional / encierro fuera de turno siempre conservan su naturaleza esporádica (12 h).
 * - Si una cobertura esporádica compensa una suspensión por encierro, la suspensión descuenta
 *   las horas base del trabajador suspendido y la cobertura permanece en Esporádicas.
 * - Horas extra quedan fuera del cálculo HP.
 * - Teletrabajo descuenta las horas correspondientes del cálculo HP en faena.
 * - FTE Codelco = Total HH en faena / 182,7.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_WEEKLY_HP_REPORT_VERSION__==='R116')return;
  window.__STAINHER_WEEKLY_HP_REPORT__=true;
  window.__STAINHER_WEEKLY_HP_REPORT_VERSION__='R116';

  const PAGE_ID='reporte-hp';
  const VIEW_ROLES=new Set(['administrador','gerente','confiabilidad','planificador','prevencion','recursos_humanos']);
  const EDIT_ROLES=new Set(['administrador','planificador']);
  const MANUAL_ADMIN_ROLES=new Set(['administrador','gerente','confiabilidad']);
  const AUTO_ADMIN_ROLES=new Set(['planificador','planificacion','programacion']);
  const CONTRACT='4600029879';
  const FTE_DIVISOR=182.7;
  const ABSENCE_TYPES=['vacaciones','licencia_medica','permiso_no_remunerado','permiso','falta'];

  const norm=v=>String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'_');
  const role=()=>norm(typeof window.v11Role==='function'?window.v11Role():(window.state?.profile?.rol||window.state?.user?.rol||window.currentProfile?.rol||''));
  const canView=()=>VIEW_ROLES.has(role());
  const canEdit=()=>EDIT_ROLES.has(role());
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const iso=d=>{const x=new Date(d);return `${x.getFullYear()}-${String(x.getMonth()+1).padStart(2,'0')}-${String(x.getDate()).padStart(2,'0')}`};
  const dplus=(s,n)=>{const d=new Date(s+'T12:00:00');d.setDate(d.getDate()+n);return iso(d)};
  const inRange=(d,a,b)=>d>=a&&d<=b;
  const monthName=(y,m)=>new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
  const sum=(arr,key)=>arr.reduce((a,x)=>a+Number(x[key]||0),0);

  const state={year:new Date().getFullYear(),month:new Date().getMonth()+1,periods:[],people:[],profiles:new Map(),malla:[],nov:[],adjust:[],rows:[],coverage:null};

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
  function periodScreenLabel(p){
    const a=String(Number(p.fecha_inicio.slice(-2))).padStart(2,'0');
    const b=String(Number(p.fecha_fin.slice(-2))).padStart(2,'0');
    const mn=new Intl.DateTimeFormat('es-CL',{month:'short'}).format(new Date(p.fecha_inicio+'T12:00:00')).replace('.','');
    return `${a}–${b} ${mn}`;
  }

  function installRenderer(){
    try{
      const current=typeof window.v1523Renderer==='function'?window.v1523Renderer:(typeof v1523Renderer==='function'?v1523Renderer:null);
      if(typeof current!=='function'||current.__stainherHpR116)return;
      const base=current.__stainherHpBase||current;
      const hpRenderer=function(page){return page===PAGE_ID?render:base(page)};
      hpRenderer.__stainherHpR116=true;
      hpRenderer.__stainherHpBase=base;
      window.v1523Renderer=hpRenderer;
      try{v1523Renderer=hpRenderer}catch(_e){}
    }catch(error){console.error('[Stainher HP R75] No fue posible registrar el renderer HP.',error)}
  }

  function personRole(person){return norm(state.profiles.get(String(person?.user_id))?.rol||'')}
  function isManualAdminPerson(person){
    const r=personRole(person),cargo=norm(person?.cargo||'');
    return MANUAL_ADMIN_ROLES.has(r)||cargo==='adc'||cargo.includes('administrador_de_contrato')||cargo.includes('gerente')||cargo.includes('confiabilidad');
  }
  function isAutoAdminPerson(person){
    const r=personRole(person),cargo=norm(person?.cargo||'');
    const isPlanning=AUTO_ADMIN_ROLES.has(r)||cargo.includes('planific')||cargo.includes('programa');
    const isPreventionExpert=cargo.includes('experta_en_prevencion')||cargo.includes('experto_en_prevencion');
    return isPlanning||isPreventionExpert;
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
      window.sb.from('turnos_novedades_v15').select('id,user_id,tipo,fecha_inicio,fecha_fin,turno_base,clasificacion_auto,cantidad,unidad').lte('fecha_inicio',max).or(`fecha_fin.gte.${min},fecha_fin.is.null`),
      window.sb.from('hp_ajustes_manuales').select('*').eq('tipo','terreno_administrativo').gte('fecha',min).lte('fecha',max)
    ]);
    if(dot.error)throw dot.error;if(prof.error)throw prof.error;if(mal.error)throw mal.error;if(nov.error)throw nov.error;
    state.people=(dot.data||[]).filter(x=>x.user_id);
    state.profiles=new Map((prof.data||[]).map(x=>[String(x.id),x]));
    state.malla=mal.data||[];
    state.nov=(nov.data||[]).map((x,i)=>({...x,__hpIndex:i}));
    state.adjust=adj.error?[]:(adj.data||[]);
    state.coverage=buildCoverageAllocation(min,max);
    state.rows=state.people.map(calcPerson);
  }

  function novelties(uid,date){
    return state.nov.filter(n=>String(n.user_id)===String(uid)&&inRange(date,n.fecha_inicio,n.fecha_fin||n.fecha_inicio));
  }
  function isTeleworkNovelty(n){
    const tipo=norm(n?.tipo),cls=norm(n?.clasificacion_auto);
    return tipo==='teletrabajo'||tipo==='permiso_teletrabajo'||cls==='teletrabajo';
  }
  function telework(uid,date){return novelties(uid,date).some(isTeleworkNovelty)}
  function blocked(uid,date){
    return novelties(uid,date).some(n=>ABSENCE_TYPES.some(t=>String(n.tipo||'').includes(t)));
  }
  function suspended(uid,date){
    return novelties(uid,date).some(n=>norm(n.tipo)==='suspendido_encierro'||norm(n.clasificacion_auto)==='suspendido_por_encierro');
  }
  function isSuspensionNovelty(n){
    return norm(n?.tipo)==='suspendido_encierro'||norm(n?.clasificacion_auto)==='suspendido_por_encierro';
  }
  function turn(uid,date){return state.malla.find(r=>String(r.user_id)===String(uid)&&r.fecha===date)?.turno_base||''}
  function isOperationalPerson(person){return !!person&&!isManualAdminPerson(person)&&!isAutoAdminPerson(person)}
  function coverageExtraNovelty(n,uid,date){
    const tipo=norm(n?.tipo),cls=norm(n?.clasificacion_auto);
    if(tipo==='hora_extra')return false;
    const candidate=tipo==='dia_adicional'||tipo==='encierro_no_planificado'||cls==='encierro_fuera_de_turno';
    if(!candidate)return false;
    const base=norm(turn(uid,date)||n?.turno_base);
    return !base||base==='l';
  }
  function buildCoverageAllocation(min,max){
    const out={transferred:new Set(),matchedSuspensions:0,unmatchedSuspensions:0};
    for(let d=min;d<=max;d=dplus(d,1)){
      const suspensions=[],seenSuspensions=new Set();
      for(const n of state.nov){
        if(!isSuspensionNovelty(n)||!inRange(d,n.fecha_inicio,n.fecha_fin||n.fecha_inicio))continue;
        const uid=String(n.user_id||''),person=state.people.find(p=>String(p.user_id)===uid);
        if(!uid||!isOperationalPerson(person)||seenSuspensions.has(uid))continue;
        const shift=String(turn(uid,d)||n.turno_base||'').toUpperCase();
        if(!['A','C'].includes(shift))continue;
        seenSuspensions.add(uid);suspensions.push({uid,shift});
      }
      const extras=[],seenExtras=new Set();
      for(const n of state.nov){
        const uid=String(n.user_id||''),person=state.people.find(p=>String(p.user_id)===uid);
        if(!uid||!isOperationalPerson(person)||!inRange(d,n.fecha_inicio,n.fecha_fin||n.fecha_inicio)||!coverageExtraNovelty(n,uid,d))continue;
        if(seenExtras.has(uid))continue;
        seenExtras.add(uid);extras.push({uid,event:n});
      }
      suspensions.sort((a,b)=>a.shift.localeCompare(b.shift)||a.uid.localeCompare(b.uid));
      extras.sort((a,b)=>{
        const ap=norm(a.event?.tipo)==='encierro_no_planificado'||norm(a.event?.clasificacion_auto)==='encierro_fuera_de_turno'?0:1;
        const bp=norm(b.event?.tipo)==='encierro_no_planificado'||norm(b.event?.clasificacion_auto)==='encierro_fuera_de_turno'?0:1;
        return ap-bp||a.uid.localeCompare(b.uid);
      });
      const pairs=Math.min(suspensions.length,extras.length);
      for(let i=0;i<pairs;i++){
        const s=suspensions[i];
        out.transferred.add(`${s.uid}|${d}`);
        out.matchedSuspensions++;
      }
      out.unmatchedSuspensions+=Math.max(0,suspensions.length-pairs);
    }
    return out;
  }
  function suspensionTransferred(uid,date){return !!state.coverage?.transferred?.has(`${uid}|${date}`)}
  function sporadicOperationalHours(uid,date){
    const person=state.people.find(p=>String(p.user_id)===String(uid));
    if(!isOperationalPerson(person))return 0;
    return novelties(uid,date).some(n=>coverageExtraNovelty(n,uid,date))?12:0;
  }
  function manualAdmin(uid,a,b){
    return state.adjust.filter(x=>String(x.user_id)===String(uid)&&x.tipo==='terreno_administrativo'&&inRange(x.fecha,a,b)&&!telework(uid,x.fecha)).reduce((s,x)=>s+Number(x.horas||0),0);
  }
  function autoAdminHours(uid,date){
    const t=turn(uid,date);if(!t||t==='L')return 0;
    const dow=new Date(date+'T12:00:00').getDay();
    if(dow>=1&&dow<=3)return 12;
    if(dow===4)return 6;
    return 0;
  }

  function calcPeriod(person,p){
    let admin=0,oper=0,spor=0;
    if(isManualAdminPerson(person)){
      admin=manualAdmin(person.user_id,p.fecha_inicio,p.fecha_fin);
    }else if(isAutoAdminPerson(person)){
      for(let d=p.fecha_inicio;d<=p.fecha_fin;d=dplus(d,1)){
        if(blocked(person.user_id,d)||suspended(person.user_id,d)||telework(person.user_id,d))continue;
        admin+=autoAdminHours(person.user_id,d);
      }
    }else{
      for(let d=p.fecha_inicio;d<=p.fecha_fin;d=dplus(d,1)){
        const uid=person.user_id,prevDate=dplus(d,-1),td=turn(uid,d),prev=turn(uid,prevDate);
        spor+=sporadicOperationalHours(uid,d);

        if(!blocked(uid,d)){
          const currentSuspensionBlocks=suspended(uid,d)&&suspensionTransferred(uid,d);
          if(td==='A'&&!currentSuspensionBlocks&&!telework(uid,d))oper+=12;
          if(td==='C'&&!currentSuspensionBlocks&&!telework(uid,d))oper+=4;
        }

        if(prev==='C'&&!blocked(uid,prevDate)){
          const previousSuspensionBlocks=suspended(uid,prevDate)&&suspensionTransferred(uid,prevDate);
          if(!previousSuspensionBlocks&&!telework(uid,prevDate))oper+=8;
        }
      }
    }
    return {admin,oper,spor};
  }
  function calcPerson(person){
    const periods=state.periods.map(p=>calcPeriod(person,p)),admin=sum(periods,'admin'),oper=sum(periods,'oper'),spor=sum(periods,'spor');
    return {...person,periods,admin,oper,spor,total:admin+oper+spor};
  }

  function monthlySummary(){
    const admin=sum(state.rows,'admin'),oper=sum(state.rows,'oper'),spor=sum(state.rows,'spor'),total=admin+oper+spor,fte=total/FTE_DIVISOR;
    return {admin,oper,spor,total,fte};
  }
  function summaryHtml(){
    const s=monthlySummary(),fmt=n=>Number(n||0).toLocaleString('es-CL',{maximumFractionDigits:2}),fmtFte=n=>Number(n||0).toLocaleString('es-CL',{minimumFractionDigits:1,maximumFractionDigits:1});
    return `<div class="hp-summary-wrap"><table class="hp-summary"><thead><tr><th>RESUMEN MENSUAL</th><th>Total</th></tr></thead><tbody><tr><th>TOTAL HH Administrativas</th><td>${fmt(s.admin)}</td></tr><tr><th>TOTAL HH Operativas</th><td>${fmt(s.oper)}</td></tr><tr><th>TOTAL HH Esporádicas</th><td>${fmt(s.spor)}</td></tr><tr class="hp-summary-strong"><th>TOTAL HH EN FAENA</th><td>${fmt(s.total)}</td></tr><tr class="hp-summary-strong"><th>Total FTE</th><td>${fmtFte(s.fte)}</td></tr></tbody></table></div>`;
  }

  function renderTable(){
    const head1=state.periods.map(p=>`<th colspan="3" title="${esc(periodLabel(p))}">${esc(periodScreenLabel(p))}</th>`).join('');
    const head2=state.periods.map(()=>'<th title="Horas Administrativas">Adm.</th><th title="Horas Operativas">Oper.</th><th title="Horas Operativas Esporádicas">Espor.</th>').join('');
    const cols='<col class="hp-col-role"><col class="hp-col-name">'+state.periods.map(()=>'<col class="hp-col-hour"><col class="hp-col-hour"><col class="hp-col-hour">').join('');
    const body=state.rows.map(r=>`<tr><td class="hp-role-cell">${esc((r.cargo||'').toUpperCase())}</td><td class="hp-name-cell">${esc(r.nombre)}</td>${r.periods.map(x=>`<td>${x.admin||0}</td><td>${x.oper||0}</td><td>${x.spor||0}</td>`).join('')}</tr>`).join('');
    return `<div class="hp-table-wrap"><table class="hp-table"><colgroup>${cols}</colgroup><thead><tr><th rowspan="2">Cargo</th><th rowspan="2">Nombre Trabajador</th>${head1}</tr><tr>${head2}</tr></thead><tbody>${body}</tbody></table></div>`;
  }
  function periodEditor(){
    return `<div class="panel"><div class="row-between"><div><h3>Rangos Codelco</h3><div class="muted">Los cortes son editables y se guardan por mes.</div></div>${canEdit()?'<button class="btn primary" id="hpSavePeriods">Guardar rangos</button>':''}</div><div class="hp-period-grid">${state.periods.map((p,i)=>`<div class="hp-period-card"><b>Período ${i+1}</b><label>Desde<input class="field hp-p-start" type="date" value="${p.fecha_inicio}" ${canEdit()?'':'disabled'}></label><label>Hasta<input class="field hp-p-end" type="date" value="${p.fecha_fin}" ${canEdit()?'':'disabled'}></label><label>Glosa<input class="field hp-p-label" value="${esc(p.etiqueta||'')}" placeholder="Opcional" ${canEdit()?'':'disabled'}></label></div>`).join('')}</div></div>`;
  }
  function rulesHtml(){
    const matched=Number(state.coverage?.matchedSuspensions||0),pending=Number(state.coverage?.unmatchedSuspensions||0);
    return `<div class="notice hp-rules"><b>Reglas de cálculo HP R116:</b> Turno A = 12 h. Turno C = 4 h al inicio + 8 h al día siguiente. Encierro dentro de turno no agrega horas. Día adicional y encierro fuera de turno siempre registran 12 h esporádicas. Cuando una de estas coberturas compensa un <b>SE</b>, las horas base se descuentan al trabajador suspendido y se mantienen como esporádicas en quien cubre, conservando la cobertura contractual sin alterar la naturaleza del evento. Las horas extra no participan del HP. <b>TT</b> descuenta HP en faena. <span class="muted">Coberturas SE conciliadas: ${matched}${pending?` · SE sin cobertura identificada: ${pending}`:''}.</span></div>`;
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

  async function styledExcelWriter(){
    const base=window.XLSX;
    if(!base)return null;
    if(base.style_version)return base;
    if(window.__STAINHER_XLSX_STYLE__)return window.__STAINHER_XLSX_STYLE__;
    if(window.__STAINHER_XLSX_STYLE_PROMISE__)return window.__STAINHER_XLSX_STYLE_PROMISE__;

    window.__STAINHER_XLSX_STYLE_PROMISE__=new Promise(resolve=>{
      const finish=writer=>{
        window.XLSX=base;
        window.__STAINHER_XLSX_STYLE__=writer||base;
        resolve(window.__STAINHER_XLSX_STYLE__);
      };
      const script=document.createElement('script');
      script.id='stainher-xlsx-style-runtime';
      script.src='https://cdn.jsdelivr.net/npm/xlsx-js-style@1.2.0/dist/xlsx.min.js';
      script.async=true;
      script.onload=()=>finish(window.XLSX&&window.XLSX.style_version?window.XLSX:base);
      script.onerror=()=>finish(base);
      document.head.appendChild(script);
    });
    return window.__STAINHER_XLSX_STYLE_PROMISE__;
  }

  async function exportExcel(){
    const X=await styledExcelWriter();
    if(!X)return window.toast?.('No está disponible el exportador Excel.','error');

    const monthTokens=['ene','feb','mar','abr','may','jun','jul','ago','sept','oct','nov','dic'];
    const periodCode=`${monthTokens[state.month-1]||String(state.month).padStart(2,'0')}-${String(state.year).slice(-2)}`;
    const monthUpper=new Intl.DateTimeFormat('es-CL',{month:'long'}).format(new Date(state.year,state.month-1,1)).toUpperCase();
    const periodCount=state.periods.length;
    const identityCols=5;
    const hpStart=identityCols;
    const totalStart=hpStart+periodCount*3;
    const lastCol=totalStart+2;
    const topHeaderRow=6;
    const periodHeaderRow=7;
    const detailHeaderRow=8;
    const firstDataRow=9;
    const colName=i=>X.utils.encode_col(i);
    const daysCount=p=>Math.max(0,Math.round((new Date(`${p.fecha_fin}T12:00:00`)-new Date(`${p.fecha_inicio}T12:00:00`))/86400000)+1);

    const aoa=Array.from({length:firstDataRow},()=>Array(lastCol+1).fill(''));
    aoa[0][0]='REPORTE FTE CODELCO';
    aoa[1][0]='Reporte FTE Trabajadores';
    state.periods.slice(0,4).forEach((p,i)=>{aoa[i][hpStart]=`${periodLabel(p)} (${daysCount(p)} días)`});
    aoa[4][0]='Centro de trabajo';
    aoa[4][1]='División Andina';
    aoa[5][0]='Periodo';
    aoa[5][1]=periodCode;
    aoa[topHeaderRow][hpStart]='HP Trabajador';
    aoa[topHeaderRow][totalStart]=`Total HP ${monthUpper}`;

    ['Nombre Empresa','Número Contrato','Gerencia Origen','Rut Trabajador','Nombre Trabajador'].forEach((label,i)=>{aoa[periodHeaderRow][i]=label});
    state.periods.forEach((p,i)=>{aoa[periodHeaderRow][hpStart+i*3]=periodLabel(p)});
    const subHeaders=['Horas Administrativas','Horas Operativas','Horas Operativas Esporádicas'];
    for(let i=0;i<periodCount;i++)subHeaders.forEach((label,j)=>{aoa[detailHeaderRow][hpStart+i*3+j]=label});
    subHeaders.forEach((label,j)=>{aoa[detailHeaderRow][totalStart+j]=label});

    state.rows.forEach(r=>{
      const row=Array(lastCol+1).fill('');
      row[0]='STAINHER';
      row[1]=CONTRACT;
      row[2]=(r.cargo||'').toUpperCase();
      row[3]=r.rut||'';
      row[4]=r.nombre||'';
      r.periods.forEach((x,i)=>{
        row[hpStart+i*3]=Number(x.admin||0);
        row[hpStart+i*3+1]=Number(x.oper||0);
        row[hpStart+i*3+2]=Number(x.spor||0);
      });
      row[totalStart]=Number(r.admin||0);
      row[totalStart+1]=Number(r.oper||0);
      row[totalStart+2]=Number(r.spor||0);
      aoa.push(row);
    });

    const ws=X.utils.aoa_to_sheet(aoa);
    const merges=[];
    for(let i=0;i<Math.min(4,state.periods.length);i++)merges.push({s:{r:i,c:hpStart},e:{r:i,c:lastCol}});
    if(totalStart>hpStart)merges.push({s:{r:topHeaderRow,c:hpStart},e:{r:topHeaderRow,c:totalStart-1}});
    merges.push({s:{r:topHeaderRow,c:totalStart},e:{r:periodHeaderRow,c:lastCol}});
    for(let c=0;c<identityCols;c++)merges.push({s:{r:periodHeaderRow,c},e:{r:detailHeaderRow,c}});
    state.periods.forEach((p,i)=>merges.push({s:{r:periodHeaderRow,c:hpStart+i*3},e:{r:periodHeaderRow,c:hpStart+i*3+2}}));
    ws['!merges']=merges;

    ws['!cols']=[
      {wch:19},{wch:15},{wch:20},{wch:16},{wch:28},
      ...Array.from({length:periodCount*3+3},(_,i)=>({wch:i%3===2?17:14}))
    ];
    ws['!rows']=Array.from({length:firstDataRow+state.rows.length},(_,i)=>({hpt:i===detailHeaderRow?38:(i===periodHeaderRow?28:18)}));

    const thin={style:'thin',color:{rgb:'000000'}};
    const border={top:thin,bottom:thin,left:thin,right:thin};
    const headerStyle={font:{bold:true,color:{rgb:'000000'}},fill:{patternType:'solid',fgColor:{rgb:'D9D9D9'}},alignment:{horizontal:'center',vertical:'center',wrapText:true},border};
    const identityStyle={font:{bold:true,color:{rgb:'000000'}},fill:{patternType:'solid',fgColor:{rgb:'D9D9D9'}},alignment:{horizontal:'center',vertical:'center',wrapText:true},border};
    const dataTextStyle={alignment:{horizontal:'left',vertical:'center',wrapText:true},border};
    const dataNumberStyle={alignment:{horizontal:'right',vertical:'center'},border,numFmt:'0.##'};
    const titleStyle={font:{bold:true,color:{rgb:'000000'}},alignment:{horizontal:'left',vertical:'center'}};
    const noteStyle={font:{color:{rgb:'B7B7B7'}},alignment:{horizontal:'left',vertical:'center'}};

    const applyStyle=(r1,c1,r2,c2,style)=>{
      for(let r=r1;r<=r2;r++)for(let c=c1;c<=c2;c++){
        const addr=X.utils.encode_cell({r,c});
        if(!ws[addr])ws[addr]={t:'s',v:''};
        ws[addr].s=style;
      }
    };

    applyStyle(0,0,1,0,titleStyle);
    for(let i=0;i<Math.min(4,state.periods.length);i++)applyStyle(i,hpStart,i,lastCol,noteStyle);
    applyStyle(topHeaderRow,hpStart,topHeaderRow,lastCol,headerStyle);
    applyStyle(periodHeaderRow,0,detailHeaderRow,lastCol,headerStyle);
    applyStyle(periodHeaderRow,0,detailHeaderRow,identityCols-1,identityStyle);
    for(let r=firstDataRow;r<firstDataRow+state.rows.length;r++){
      applyStyle(r,0,r,identityCols-1,dataTextStyle);
      applyStyle(r,hpStart,r,lastCol,dataNumberStyle);
    }

    const labelStyle={font:{bold:true,color:{rgb:'000000'}},alignment:{horizontal:'left',vertical:'center'},border};
    const valueStyle={alignment:{horizontal:'left',vertical:'center'},border};
    applyStyle(4,0,5,0,labelStyle);
    applyStyle(4,1,5,1,valueStyle);

    state.rows.forEach((r,idx)=>{
      const excelRow=firstDataRow+idx+1;
      const adminRefs=state.periods.map((_,i)=>`${colName(hpStart+i*3)}${excelRow}`);
      const operRefs=state.periods.map((_,i)=>`${colName(hpStart+i*3+1)}${excelRow}`);
      const sporRefs=state.periods.map((_,i)=>`${colName(hpStart+i*3+2)}${excelRow}`);
      const totalCells=[
        [totalStart,adminRefs,Number(r.admin||0)],
        [totalStart+1,operRefs,Number(r.oper||0)],
        [totalStart+2,sporRefs,Number(r.spor||0)]
      ];
      totalCells.forEach(([c,refs,v])=>{
        const addr=`${colName(c)}${excelRow}`;
        ws[addr]={t:'n',v,f:`SUM(${refs.join(',')})`,z:'0.##',s:dataNumberStyle};
      });
    });

    const wb=X.utils.book_new();
    wb.Workbook=wb.Workbook||{};
    wb.Workbook.CalcPr={calcMode:'auto',fullCalcOnLoad:'1',forceFullCalc:'1'};
    X.utils.book_append_sheet(wb,ws,'Reporte FTE Trabajadores');
    X.writeFile(wb,`Reporte_FTE_Codelco_${state.year}_${String(state.month).padStart(2,'0')}.xlsx`,{bookType:'xlsx',cellStyles:true,compression:true});
  }

  const oldStyle=document.getElementById('stainher-weekly-hp-style');
  oldStyle?.remove();
  const style=document.createElement('style');
  style.id='stainher-weekly-hp-style';
  style.textContent=`#page-reporte-hp{min-width:0}.hp-toolbar{display:flex;gap:12px;align-items:end;flex-wrap:wrap;margin-bottom:14px}.hp-toolbar label{min-width:210px}.hp-rules{margin-bottom:14px}.hp-period-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin-top:14px}.hp-period-card{border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--panel2);display:grid;gap:8px}.hp-period-card label{display:grid;gap:4px;font-size:11px;color:var(--muted)}.hp-table-wrap,.hp-summary-wrap{overflow:auto;max-width:100%;border:1px solid var(--line);border-radius:12px}.hp-table-wrap{overflow-x:auto}.hp-table{border-collapse:collapse;width:100%;min-width:920px;table-layout:fixed}.hp-table .hp-col-role{width:12%}.hp-table .hp-col-name{width:16%}.hp-table .hp-col-hour{width:6%}.hp-table th,.hp-table td,.hp-summary th,.hp-summary td{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:6px 4px;text-align:center}.hp-table th{background:var(--panel2);font-size:10.5px;line-height:1.15;white-space:normal}.hp-table td{font-size:11px;line-height:1.15;white-space:nowrap}.hp-table .hp-role-cell,.hp-table .hp-name-cell{text-align:left;white-space:normal;overflow-wrap:anywhere}.hp-table .hp-role-cell{font-size:10.5px}.hp-table .hp-name-cell{font-size:11px}.hp-summary th{background:var(--panel2)}.hp-summary{border-collapse:collapse;min-width:420px;width:min(100%,620px)}.hp-summary tbody th{text-align:left}.hp-summary-strong th,.hp-summary-strong td{font-weight:800}.hp-adjust-grid{display:grid;grid-template-columns:1.3fr 1fr 1fr 1.6fr auto;gap:10px;align-items:end;margin-top:14px}.hp-adjust-grid label{display:grid;gap:5px;font-size:11px;color:var(--muted)}@media(max-width:1180px){.hp-table{min-width:860px}.hp-table th,.hp-table td{padding:5px 3px}.hp-table th{font-size:10px}.hp-table td{font-size:10.5px}}@media(max-width:1000px){.hp-period-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hp-adjust-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.hp-adjust-grid button{width:100%}}@media(max-width:600px){.hp-period-grid,.hp-adjust-grid{grid-template-columns:1fr}.hp-toolbar label{min-width:0;width:100%}.hp-summary{min-width:380px}.hp-table{min-width:860px}}`;
  document.head.appendChild(style);

  window.StainherWeeklyHP={render,version:'R116'};
  function boot(){installRenderer();window.addEventListener('stainher:modules-ready',installRenderer);window.addEventListener('stainher:profile-ready',installRenderer)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();