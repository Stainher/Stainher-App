/* Stainher App V15.24 · consolidación Turnos/Novedades
 * 31-08-2026
 * - Resumen de Inicio con estado operacional real del turno del día.
 * - Contadores Encierro dentro/fuera de turno y suspendidos.
 * - Publicación de malla y visibilidad por usuario/grupo.
 * - Conecta la malla V15.20 con registro directo e informe V15.24.
 */
(function installStainherV1524Final(){
  if (window.__STAINHER_V1524_FINAL__) return;
  window.__STAINHER_V1524_FINAL__ = true;

  const VERSION = 'V15.24';
  const VERSION_DATE = '31-08-2026';
  const PERSONAL_ROLES = new Set(['supervisor','tecnico','prevencion']);
  const ABSENCE_TYPES = new Set(['vacaciones','licencia_medica','permiso','falta','ausencia','permiso_ausencia']);

  const escHtml = value => typeof window.esc === 'function'
    ? window.esc(value == null ? '' : String(value))
    : String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const role = () => String(window.v11Role?.() || window.state?.profile?.rol || '').toLowerCase();
  const userId = () => String(window.state?.session?.user?.id || '');
  const isAdmin = () => !!window.isAdmin?.();
  const canSeeDrafts = () => isAdmin() || (!!window.v1520CanEdit?.('turnos') && !window.state?.v15PreviewRole);
  const dateIso = d => typeof window.v1520DateIso === 'function'
    ? window.v1520DateIso(d)
    : `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const fmtDate = value => typeof window.v1520Date === 'function' ? window.v1520Date(value) : (window.fmtDateCL?.(value) || String(value || ''));

  function mountStyle(){
    if (document.getElementById('stainher-v1524-final-style')) return;
    const style = document.createElement('style');
    style.id = 'stainher-v1524-final-style';
    style.textContent = `
      .v1524-publish-state{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:8px 0 2px;color:var(--muted);font-size:11px}
      .v1524-publish-state .status{font-size:10px}
      .v1524-encierro-kpis{margin-top:10px!important}
      .v1524-encierro-kpis .v1520-kpi b{font-size:24px}
      .v1524-home-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:8px;margin:12px 0}
      .v1524-home-kpi{border:1px solid var(--line);border-radius:10px;background:#0e151d;padding:9px 10px;min-width:0}
      .v1524-home-kpi span{display:block;color:var(--muted);font-size:10px;line-height:1.2}
      .v1524-home-kpi b{display:block;margin-top:4px;font-size:20px;color:#fff}
      .v1524-home-shifts{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin-top:10px}
      .v1524-home-group{border:1px solid var(--line);border-radius:12px;background:#0d141c;overflow:hidden;min-width:0}
      .v1524-home-group h4{margin:0;padding:9px 11px;background:#151f2a;color:#dbeafe;font-size:12px}
      .v1524-home-grid{display:grid;gap:7px;padding:9px}
      .v1524-home-person{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:7px;align-items:center;padding:8px 9px;border:1px solid #273543;border-radius:9px;background:#0a1118;min-width:0}
      .v1524-home-person b{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
      .v1524-home-person small{display:block;color:var(--muted);margin-top:2px}
      .v1524-home-badge{display:inline-flex;align-items:center;justify-content:center;border-radius:999px;padding:4px 7px;font-size:9px;font-weight:800;white-space:nowrap;border:1px solid #334155}
      .v1524-home-badge.normal{color:#93c5fd;background:rgba(59,130,246,.12);border-color:#255b9d}
      .v1524-home-badge.inside{color:#6ee7b7;background:rgba(52,211,153,.12);border-color:#18795d}
      .v1524-home-badge.outside{color:#fdba74;background:rgba(251,146,60,.13);border-color:#9a5b10}
      .v1524-home-badge.suspended{color:#fda4af;background:rgba(244,63,94,.13);border-color:#9f2943}
      .v1524-home-badge.additional{color:#d8b4fe;background:rgba(168,85,247,.13);border-color:#6d3b9e}
      .v1524-home-person.suspended{opacity:.78;border-style:dashed}
      .v1524-turn-direct-note{margin:8px 0;padding:8px 10px;border:1px solid #2d4053;border-radius:9px;background:#101b26;color:#adc0d2;font-size:11px}
      .v1524-system-change{display:grid;grid-template-columns:140px 1fr;gap:10px;padding:9px 0;border-top:1px solid var(--line)}
      .v1524-system-change:first-child{border-top:0}
      .v1524-system-change b{color:#dbeafe}
      .v1524-system-change small{color:var(--muted);line-height:1.4}
      @media(max-width:900px){.v1524-home-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}.v1524-home-shifts{grid-template-columns:1fr}.v1524-system-change{grid-template-columns:1fr}.v1524-encierro-kpis{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media(max-width:520px){.v1524-home-kpis{grid-template-columns:1fr 1fr}.v1524-encierro-kpis{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(style);
  }

  function applyVersion(){
    document.title = `Stainher App ${VERSION}`;
    document.querySelectorAll('.v151-mobile-title small,.v1514-global-meta span:first-child,.version-chip,.v15-version-chip,.v1513-version-meta span:first-child').forEach(el => {
      const t = String(el.textContent || '');
      if (/V15\.\d+(?:\.\d+)*/.test(t)) el.textContent = t.replace(/V15\.\d+(?:\.\d+)*/g,VERSION);
    });
    document.querySelectorAll('[data-stainher-version]').forEach(el => { el.textContent = VERSION; });
  }

  function eventDates(ev, from, to){
    const out=[];
    let s=String(ev?.fecha_inicio||''),e=String(ev?.fecha_fin||ev?.fecha_inicio||'');
    if(!s||!e)return out;
    if(s<from)s=from;if(e>to)e=to;if(s>e)return out;
    for(let d=new Date(s+'T12:00:00'),last=new Date(e+'T12:00:00');d<=last;d.setDate(d.getDate()+1))out.push(dateIso(d));
    return out;
  }

  function eventHasPublishedDate(ev,publishedKeys,from,to){
    return eventDates(ev,from,to).some(date=>publishedKeys.has(`${ev.user_id}|${date}`));
  }

  function rebuildGroups(people){
    const groups=[];
    for(const p of people||[]){
      const isSup=/supervisor/i.test(p.cargo||'');
      const id=isSup?String(p.user_id):String(p.supervisor_user_id||'sin-grupo');
      const name=isSup?p.nombre:(p.supervisor_nombre||'Sin grupo');
      if(!groups.some(x=>x[0]===id))groups.push([id,name]);
    }
    return groups.sort((a,b)=>String(a[1]).localeCompare(String(b[1]),'es'));
  }

  function restrictPersonalRole(data){
    return data;
  }

  function installTurnDataVisibility(){
    if(typeof window.v1520LoadTurnData!=='function'||window.v1520LoadTurnData.__v1524visibility)return;
    const original=window.v1520LoadTurnData;
    const wrapped=async function(){
      let data=await original.apply(this,arguments);
      data=restrictPersonalRole(data||{});
      const ids=new Set((data.people||[]).map(p=>String(p.user_id)));
      data.shifts=(data.shifts||[]).filter(s=>ids.has(String(s.user_id)));
      data.events=(data.events||[]).filter(e=>ids.has(String(e.user_id)));
      const allVisibleShifts=[...data.shifts];
      data.publication={published:allVisibleShifts.filter(x=>x.estado_publicacion==='publicado').length,draft:allVisibleShifts.filter(x=>x.estado_publicacion!=='publicado').length};
      if(!canSeeDrafts()){
        data.shifts=allVisibleShifts.filter(x=>x.estado_publicacion==='publicado');
        const publishedKeys=new Set(data.shifts.map(s=>`${s.user_id}|${s.fecha}`));
        data.events=data.events.filter(ev=>eventHasPublishedDate(ev,publishedKeys,data.range.start,data.range.end));
      }
      return data;
    };
    wrapped.__v1524visibility=true;
    wrapped.__base=original;
    window.v1520LoadTurnData=wrapped;
  }

  function installCoverageLogic(){
    window.v1520TurnCoverage=function(data,date){
      const shifts=typeof window.v1520ShiftMap==='function'?window.v1520ShiftMap(data):new Map((data.shifts||[]).map(x=>[`${x.user_id}|${x.fecha}`,x]));
      const scheduled=(data.people||[]).filter(p=>['A','C'].includes(shifts.get(`${p.user_id}|${date}`)?.turno_base));
      const events=typeof window.v1520EventsOn==='function'?window.v1520EventsOn(data,date):(data.events||[]).filter(e=>date>=String(e.fecha_inicio||'')&&date<=String(e.fecha_fin||e.fecha_inicio||''));
      const blocked=new Set(events.filter(x=>ABSENCE_TYPES.has(String(x.tipo))||x.tipo==='suspendido_encierro').map(x=>String(x.user_id)));
      const extra=new Set(events.filter(x=>x.tipo==='dia_adicional'||x.tipo==='encierro_no_planificado'||(x.tipo==='encierro'&&x.turno_base==='L')).map(x=>String(x.user_id)));
      const available=scheduled.filter(p=>!blocked.has(String(p.user_id))).length+extra.size;
      const pct=scheduled.length?Math.min(100,available/scheduled.length*100):100;
      return {scheduled:scheduled.length,available,absent:scheduled.filter(p=>blocked.has(String(p.user_id))).length,additional:extra.size,pct};
    };
  }

  function countEventDays(data,kind){
    const set=new Set(),from=data.range.start,to=data.range.end;
    (data.events||[]).forEach(ev=>{
      const base=String(ev.turno_base||'');
      const match=kind==='inside'?(ev.tipo==='encierro_planificado'||(ev.tipo==='encierro'&&['A','C'].includes(base))):kind==='outside'?(ev.tipo==='encierro_no_planificado'||(ev.tipo==='encierro'&&base==='L')):ev.tipo==='suspendido_encierro';
      if(match)eventDates(ev,from,to).forEach(d=>set.add(`${ev.user_id}|${d}`));
    });
    return set.size;
  }

  function publicationHtml(data){
    if(!isAdmin())return '<span class="status ok">Malla publicada</span><span>Solo se muestran turnos publicados para tu usuario o grupo.</span>';
    const pub=Number(data.publication?.published||0),draft=Number(data.publication?.draft||0);
    return `<span class="status ${draft?'warn':'ok'}">${draft?'Borradores pendientes':'Publicado'}</span><span>${pub} día(s) publicados · ${draft} día(s) en borrador</span>`;
  }

  async function publishTurns(){
    if(!isAdmin())return window.toast?.('Solo el Administrador puede publicar turnos.','error');
    const data=window.state?.v1520TurnData;if(!data)return;
    const range=data.range||window.v1520TurnRange?.();if(!range)return;
    const selectedGroup=String(window.state?.turnGroupV1512||'');
    const ids=(data.people||[]).map(p=>String(p.user_id)).filter(Boolean);
    if(selectedGroup&&!ids.length)return window.toast?.('El grupo seleccionado no tiene usuarios asociados.','warn');
    const scope=selectedGroup?`el grupo seleccionado (${ids.length} persona(s))`:'todos los grupos';
    if(!window.confirm?.(`¿Publicar la malla de ${window.MONTHS_ES?.[Number(window.state?.turnMonthV1512||1)-1]||''} ${window.state?.turnYearV1512||''} para ${scope}?`))return;
    let q=window.sb.from('turnos_malla_v1512').update({estado_publicacion:'publicado',updated_at:new Date().toISOString()}).gte('fecha',range.start).lte('fecha',range.end);
    if(selectedGroup)q=q.in('user_id',ids);
    const out=await q.select('id');
    if(out.error)return window.toast?.(out.error.message||String(out.error),'error');
    try{window.v1512Audit?.('turnos','publicar_malla_v1524',`${window.state?.turnYearV1512}-${window.state?.turnMonthV1512}`,{...range,grupo:selectedGroup||null,registros:(out.data||[]).length});}catch(_){ }
    await window.renderTurnosV15?.();
    window.toast?.(`Turnos publicados correctamente · ${(out.data||[]).length} registro(s)`,'success');
  }
  window.v1524PublishTurns=publishTurns;
  window.v1512PublishTurnMonth=publishTurns;

  function installTypeLabels(){
    window.v1520TurnTypeLabel=function(type){
      return ({encierro_planificado:'Encierro dentro de turno',encierro_no_planificado:'Encierro fuera de turno',suspendido_encierro:'Suspendido por encierro',vacaciones:'Vacaciones',licencia_medica:'Licencia médica',permiso:'Permiso / ausencia',falta:'Falta / ausencia',encierro:'Encierro',dia_adicional:'Día adicional',hora_extra:'Horas extra',feriado:'Horas feriado',capacitacion:'Capacitación',otro:'Otra novedad'})[type]||String(type||'Evento').replaceAll('_',' ');
    };
    window.v1520TurnTypeShort=function(type){
      return ({encierro_planificado:'ET',encierro_no_planificado:'EF',suspendido_encierro:'SE',vacaciones:'VAC',licencia_medica:'LM',permiso:'PER',falta:'F',encierro:'ENC',dia_adicional:'DA',hora_extra:'HE',feriado:'HF',capacitacion:'CAP',otro:'OTR'})[type]||'EV';
    };
  }

  function connectDirectCellEditing(){
    if(typeof window.v1520OpenShiftCell!=='function'||window.v1520OpenShiftCell.__v1524direct)return;
    const original=window.v1520OpenShiftCell;
    const wrapped=function(uid,date){
      if(isAdmin()&&typeof window.v1512EditTurnCell==='function'){
        window.state.v1512TurnData=window.state.v1520TurnData;
        return window.v1512EditTurnCell(uid,date);
      }
      return original.apply(this,arguments);
    };
    wrapped.__v1524direct=true;
    window.v1520OpenShiftCell=wrapped;
  }

  function connectReport(){
    window.v1520TurnReport=function(){
      if(typeof window.v1516OpenTurnMonthlyReport==='function')return window.v1516OpenTurnMonthlyReport();
      window.toast?.('El informe V15.24 aún no está disponible.','error');
    };
  }

  function enhanceTurnosPage(){
    const page=document.getElementById('page-turnos'),data=window.state?.v1520TurnData;
    if(!page||!data)return;
    window.state.v1512TurnData=data;
    installTypeLabels();connectDirectCellEditing();connectReport();

    const actions=page.querySelector('.topbar .actions');
    if(actions&&isAdmin()&&!actions.querySelector('[data-v1524-publish]')){
      const btn=document.createElement('button');btn.className='btn primary';btn.dataset.v1524Publish='1';btn.textContent='Publicar turnos';btn.onclick=publishTurns;actions.appendChild(btn);
    }

    let pub=page.querySelector('.v1524-publish-state');
    if(!pub){pub=document.createElement('div');pub.className='v1524-publish-state';const toolbar=page.querySelector('.v1512-turn-toolbar');toolbar?.insertAdjacentElement('afterend',pub)}
    if(pub)pub.innerHTML=publicationHtml(data);

    const old=page.querySelector('.v1524-encierro-kpis');if(old)old.remove();
    const tabs=page.querySelector('.v1520-tabs');
    if(tabs){
      const box=document.createElement('div');box.className='v1520-kpis v1524-encierro-kpis';
      box.innerHTML=`<div class="v1520-kpi"><span>Encierro dentro de turno</span><b>${countEventDays(data,'inside')}</b><small>A/C + encierro</small></div><div class="v1520-kpi"><span>Encierro fuera de turno</span><b>${countEventDays(data,'outside')}</b><small>L + encierro</small></div><div class="v1520-kpi"><span>Suspendido por encierro</span><b>${countEventDays(data,'suspended')}</b><small>Turno A/C no disponible</small></div>`;
      tabs.insertAdjacentElement('beforebegin',box);
    }

    if(isAdmin()){
      const content=page.querySelector('#v1520TurnContent');
      if(content&&!page.querySelector('.v1524-turn-direct-note')){
        const note=document.createElement('div');note.className='v1524-turn-direct-note';note.innerHTML='<b>Registro directo:</b> en Malla A/C/L selecciona una casilla para editar el turno base y cargar Encierro, Suspendido por encierro, Día adicional, Horas extra u Horas feriado sin salir de la malla.';content.insertAdjacentElement('beforebegin',note);
      }
    }
    applyVersion();
  }

  async function visiblePeopleForHome(){
    const r=role(),uid=userId();let q;
    if(['supervisor','tecnico'].includes(r)){
      q=await window.sb.rpc('dotacion_grupo_visible_v159');
      if(q.error)q=await window.sb.rpc('dotacion_grupo_visible_v158');
    }else{
      q=await window.sb.from('dotacion_contrato').select('*').eq('estado','activo').eq('aplica_turnos',true).order('orden').order('nombre');
    }
    if(q.error)throw q.error;
    return (q.data||[]).filter(x=>x.estado==='activo'&&x.aplica_turnos===true&&x.user_id);
  }

  function homeRoleLabel(person){
    const cargo=String(person?.cargo||'');
    if(/supervisor/i.test(cargo))return 'Supervisor';
    if(/prevencion|apr/i.test(cargo))return 'APR';
    return cargo||'Técnico';
  }

  function homeStatus(person,base,events){
    const types=new Set(events.map(e=>String(e.tipo)));
    const absent=events.some(e=>ABSENCE_TYPES.has(String(e.tipo)));
    const suspended=types.has('suspendido_encierro');
    const inside=types.has('encierro_planificado')||(types.has('encierro')&&['A','C'].includes(base));
    const outside=types.has('encierro_no_planificado')||(types.has('encierro')&&base==='L');
    const additional=types.has('dia_adicional')&&base==='L';
    if(suspended&&['A','C'].includes(base))return {show:true,key:'suspended',label:'Suspendido por encierro',effective:false,section:base};
    if(absent)return {show:false,key:'absent',label:'Ausente',effective:false,section:base};
    if(inside&&['A','C'].includes(base))return {show:true,key:'inside',label:'Encierro dentro de turno',effective:true,section:base};
    if(outside&&base==='L')return {show:true,key:'outside',label:'Encierro fuera de turno',effective:true,section:'FUERA'};
    if(additional)return {show:true,key:'additional',label:'Día adicional',effective:true,section:'FUERA'};
    if(['A','C'].includes(base))return {show:true,key:'normal',label:`Turno normal ${base}`,effective:true,section:base};
    return {show:false,key:'free',label:'Libre',effective:false,section:'FUERA'};
  }

  async function enhanceHome(){
    const page=document.getElementById('page-inicio');if(!page||!window.state?.session)return;
    const host=page.querySelector('.v1521-home-turn');if(!host)return;
    try{
      const today=dateIso(new Date()),people=await visiblePeopleForHome(),ids=people.map(p=>String(p.user_id));
      if(!ids.length){host.innerHTML='<h3>Dotación en turno hoy</h3><div class="empty">No hay usuarios de turno asociados a este perfil.</div>';return}
      let sq=window.sb.from('turnos_malla_v1512').select('user_id,turno_base,estado_publicacion').eq('fecha',today).in('user_id',ids);
      const [shiftsQ,eventsQ]=await Promise.all([sq,window.sb.from('turnos_novedades_v15').select('user_id,tipo,turno_base,motivo,observacion').lte('fecha_inicio',today).gte('fecha_fin',today).in('user_id',ids)]);
      if(shiftsQ.error||eventsQ.error)throw(shiftsQ.error||eventsQ.error);
      let shifts=shiftsQ.data||[];
      if(!canSeeDrafts())shifts=shifts.filter(x=>x.estado_publicacion==='publicado');
      const shiftMap=new Map(shifts.map(x=>[String(x.user_id),x]));
      const eventsByUser=new Map();for(const ev of eventsQ.data||[]){const k=String(ev.user_id);if(!eventsByUser.has(k))eventsByUser.set(k,[]);eventsByUser.get(k).push(ev)}
      const priority=c=>/supervisor/i.test(c||'')?0:/prevencion|apr/i.test(c||'')?2:1;
      const rows=[];
      for(const p of people){const sh=shiftMap.get(String(p.user_id));if(!sh)continue;const st=homeStatus(p,String(sh.turno_base||''),eventsByUser.get(String(p.user_id))||[]);if(st.show)rows.push({...p,base:String(sh.turno_base||''),status:st})}
      rows.sort((a,b)=>String(a.status.section).localeCompare(String(b.status.section))||priority(a.cargo)-priority(b.cargo)||(Number(a.orden)||999)-(Number(b.orden)||999)||String(a.nombre).localeCompare(String(b.nombre),'es'));
      const count=key=>rows.filter(x=>x.status.key===key).length;
      const effective=rows.filter(x=>x.status.effective).length;
      const section=(key,title)=>{const arr=rows.filter(x=>x.status.section===key);return `<section class="v1524-home-group"><h4>${escHtml(title)} · ${arr.length}</h4><div class="v1524-home-grid">${arr.map(x=>`<div class="v1524-home-person ${x.status.key==='suspended'?'suspended':''}"><div><b>${escHtml(x.nombre)}</b><small>${escHtml(homeRoleLabel(x))} · Base ${escHtml(x.base)}</small></div><span class="v1524-home-badge ${x.status.key}">${escHtml(x.status.label)}</span></div>`).join('')||'<div class="empty">Sin personal.</div>'}</div></section>`};
      host.innerHTML=`<div class="row-between"><div><h3>Dotación en turno hoy</h3><div class="muted">${fmtDate(today)} · programación ${canSeeDrafts()?'publicada y borrador visible para gestión':'publicada'} · actualización automática</div></div>${window.canViewV11?.('turnos')?'<button class="btn" onclick="v1519Navigate(\'turnos\')">Ver programación</button>':''}</div><div class="v1524-home-kpis"><div class="v1524-home-kpi"><span>Operativos hoy</span><b>${effective}</b></div><div class="v1524-home-kpi"><span>Turno normal</span><b>${count('normal')}</b></div><div class="v1524-home-kpi"><span>Encierro dentro de turno</span><b>${count('inside')}</b></div><div class="v1524-home-kpi"><span>Encierro fuera de turno</span><b>${count('outside')}</b></div><div class="v1524-home-kpi"><span>Suspendidos por encierro</span><b>${count('suspended')}</b></div></div><div class="v1524-home-shifts">${section('A','Turno A')}${section('C','Turno C')}${section('FUERA','Fuera de turno / adicional')}</div>`;
    }catch(error){host.innerHTML=`<h3>Dotación en turno hoy</h3><div class="notice error">No se pudo cargar el detalle operacional: ${escHtml(error.message||String(error))}</div>`}
    applyVersion();
  }

  function enhanceSystem(){
    const page=document.getElementById('page-sistema');if(!page)return;
    applyVersion();
    if(!isAdmin())return;
    [...page.querySelectorAll('.panel')].forEach(x=>{if(/Últimas modificaciones/i.test(x.textContent||''))x.remove()});
    page.querySelectorAll('.v1524-changes').forEach(x=>x.remove());
    const details=document.createElement('details');details.className='panel v1513-changes v1524-changes';details.open=true;
    const changes=[
      ['Turnos y Novedades','Registro directo desde la malla, Encierro dentro/fuera de turno, Suspendido por encierro e informe agrupado por colaborador.'],
      ['Inicio','Dotación en turno hoy distingue turno normal, tipo de encierro y suspendidos por encierro.'],
      ['Publicación de turnos','Se recupera Publicar turnos; los perfiles de consulta solo ven la malla publicada y Supervisor/Técnico conservan la vista de su grupo.'],
      ['Cobertura','Suspendido por encierro descuenta disponibilidad y Encierro fuera de turno cuenta como presencia adicional efectiva.'],
      ['Móvil','Se mantienen los controles de fecha/mes corregidos para iOS de la revisión anterior.']
    ];
    details.innerHTML=`<summary>Últimas modificaciones · ${VERSION}</summary><div class="v1513-changes-body"><div class="v1513-version-meta"><span>Versión actual: ${VERSION}</span><span>Actualización: ${VERSION_DATE}</span></div>${changes.map(([a,b])=>`<div class="v1524-system-change"><b>${escHtml(a)}</b><small>${escHtml(b)}</small></div>`).join('')}</div>`;
    const top=page.querySelector('.topbar');if(top)top.insertAdjacentElement('afterend',details);else page.prepend(details);
  }

  function wrapRenderers(){
    if(typeof window.renderTurnosV15==='function'&&!window.renderTurnosV15.__v1524final){
      const base=window.renderTurnosV15;
      const fn=async function(){const out=await base.apply(this,arguments);enhanceTurnosPage();return out};fn.__v1524final=true;window.renderTurnosV15=fn;
    }
    if(typeof window.renderInicio==='function'&&!window.renderInicio.__v1524final){
      const base=window.renderInicio;
      const fn=async function(){const out=await base.apply(this,arguments);await enhanceHome();return out};fn.__v1524final=true;window.renderInicio=fn;
    }
    if(typeof window.renderSistema==='function'&&!window.renderSistema.__v1524final){
      const base=window.renderSistema;
      const fn=async function(){const out=await base.apply(this,arguments);enhanceSystem();return out};fn.__v1524final=true;window.renderSistema=fn;
    }
  }

  function installVersionAliases(){
    const f=applyVersion;
    ['v1523Version','v1522Version','v1521Version','v1520Version','v1519Version','v1518Version','v1517Version','v1516Version','v1515Version','v1514Version','v1513Version','v1512Version','v1511Version','v1510Version','v159Version','v158UpdateVersionLabels'].forEach(name=>{try{window[name]=f}catch(_){}});
  }

  let tries=0;
  function boot(){
    mountStyle();
    if(!window.sb||typeof window.renderTurnosV15!=='function'||typeof window.renderInicio!=='function'||!window.__STAINHER_TURNOS_V1524__){
      if(++tries<100)return setTimeout(boot,100);
    }
    installTurnDataVisibility();installCoverageLogic();installTypeLabels();connectDirectCellEditing();connectReport();installVersionAliases();wrapRenderers();applyVersion();
    if(document.getElementById('page-turnos')?.classList.contains('active'))window.renderTurnosV15?.();
    if(document.getElementById('page-inicio')?.classList.contains('active'))window.renderInicio?.();
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
