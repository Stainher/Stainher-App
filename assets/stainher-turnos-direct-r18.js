/* Stainher App V15.24 r18 · Turnos y Novedades autoritativo.
 * Bypassa la cadena histórica de wrappers de renderTurnosV15.
 * Usa v1520LoadTurnData solo como capa de datos; renderiza una vez con índices en memoria.
 */
(function installStainherTurnosDirectR18(){
  'use strict';
  if(window.__STAINHER_TURNOS_DIRECT_R18__)return;
  window.__STAINHER_TURNOS_DIRECT_R18__=true;

  const BUILD='20260904-r18-turnos-direct';
  const ABSENCE=new Set(['vacaciones','licencia_medica','falta','ausencia','permiso','permiso_ausencia','suspendido_encierro']);
  const LABELS={encierro_planificado:'Encierro dentro de turno',encierro_no_planificado:'Encierro fuera de turno',suspendido_encierro:'Suspendido por encierro',dia_adicional:'Día adicional',hora_extra:'Horas extra',feriado:'Horas feriado',vacaciones:'Vacaciones',licencia_medica:'Licencia médica',permiso:'Permiso / ausencia',falta:'Falta / ausencia',capacitacion:'Capacitación',otro:'Otra novedad',encierro:'Encierro'};
  const CODES={encierro_planificado:'ET',encierro_no_planificado:'EF',suspendido_encierro:'SE',dia_adicional:'DA',hora_extra:'HE',feriado:'HF',vacaciones:'V',licencia_medica:'LM',permiso:'P',falta:'F',capacitacion:'CAP',otro:'EV',encierro:'ENC'};
  let seq=0;

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const iso=(y,m,d)=>`${y}-${String(m).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
  const daysIn=(y,m)=>new Date(Number(y),Number(m),0).getDate();
  const monthName=(m)=>window.MONTHS_ES?.[Number(m)-1]||new Intl.DateTimeFormat('es-CL',{month:'long'}).format(new Date(2026,Number(m)-1,1));
  const fmtDate=value=>window.v1520Date?.(value)||window.fmtDateCL?.(value)||String(value||'');
  const canEdit=()=>Boolean(window.v1520CanEdit?.('turnos'));
  const label=t=>LABELS[String(t||'')]||window.v1520TurnTypeLabel?.(t)||String(t||'Evento').replaceAll('_',' ');
  const code=t=>CODES[String(t||'')]||window.v1520TurnTypeShort?.(t)||'EV';

  function mountStyle(){
    if(document.getElementById('stainher-turnos-direct-r18-style'))return;
    const s=document.createElement('style');s.id='stainher-turnos-direct-r18-style';s.textContent=`
      #page-turnos .r18-turn-meta{display:flex;align-items:center;gap:7px;flex-wrap:wrap;margin:0 0 10px;color:var(--muted);font-size:10px}
      #page-turnos .r18-turn-meta .status{font-size:9px}
      #page-turnos .r18-turn-toolbar{display:grid;grid-template-columns:auto minmax(130px,1fr) auto minmax(180px,260px);gap:8px;align-items:end;margin:10px 0}
      #page-turnos .r18-turn-toolbar .r18-month{display:flex;align-items:center;justify-content:center;min-height:42px;border:1px solid var(--line);border-radius:9px;background:var(--panel2);font-weight:800}
      #page-turnos .r18-turn-actions{display:flex;gap:8px;justify-content:flex-end;flex-wrap:wrap;margin-bottom:10px}
      #page-turnos .r18-kpis{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:9px;margin:10px 0}
      #page-turnos .r18-kpi{min-width:0;border:1px solid var(--line);border-radius:11px;padding:11px;background:var(--panel,#0d141c)}
      #page-turnos .r18-kpi span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase;letter-spacing:.03em}
      #page-turnos .r18-kpi b{display:block;margin-top:5px;font-size:25px;line-height:1;color:var(--text,#fff)}
      #page-turnos .r18-kpi small{display:block;margin-top:5px;color:var(--muted);font-size:9px}
      #page-turnos .r18-kpis-secondary{grid-template-columns:repeat(3,minmax(0,1fr))}
      #page-turnos .r18-turn-tabs{display:flex;gap:8px;margin:12px 0}
      #page-turnos .r18-matrix{width:100%;max-width:100%;overflow:auto;border:1px solid var(--line);border-radius:11px;background:var(--panel,#0d141c)}
      #page-turnos .r18-matrix table{border-collapse:collapse;min-width:1180px;width:100%;table-layout:fixed}
      #page-turnos .r18-matrix th,#page-turnos .r18-matrix td{border:1px solid var(--line);padding:4px;text-align:center;height:38px;font-size:9px;box-sizing:border-box}
      #page-turnos .r18-matrix th{background:var(--panel2,#151f2a);color:var(--muted);position:sticky;top:0;z-index:2}
      #page-turnos .r18-matrix th:first-child,#page-turnos .r18-matrix td:first-child{position:sticky;left:0;width:170px;min-width:170px;text-align:left;background:var(--panel,#0d141c);z-index:3;padding:6px 8px}
      #page-turnos .r18-matrix th:first-child{z-index:4;background:var(--panel2,#151f2a)}
      #page-turnos .r18-turn-cell.editable{cursor:pointer}
      #page-turnos .r18-turn-cell.editable:hover{outline:1px solid #60a5fa;outline-offset:-1px}
      #page-turnos .r18-shift{display:inline-flex;align-items:center;justify-content:center;min-width:25px;height:22px;border-radius:6px;border:1px solid currentColor;font-weight:900}
      #page-turnos .r18-shift.A{color:#93c5fd;background:rgba(59,130,246,.14)}#page-turnos .r18-shift.C{color:#86efac;background:rgba(34,197,94,.12)}#page-turnos .r18-shift.L{color:#cbd5e1;background:rgba(148,163,184,.12)}
      #page-turnos .r18-cell-events{display:flex;gap:2px;justify-content:center;flex-wrap:wrap;margin-top:2px}
      #page-turnos .r18-event-code{display:inline-flex;align-items:center;justify-content:center;min-width:20px;padding:1px 3px;border-radius:5px;border:1px solid #475569;color:#cbd5e1;font-size:7px;font-weight:900}
      #page-turnos .r18-events{display:grid;gap:8px}
      #page-turnos .r18-event-row{display:grid;grid-template-columns:105px minmax(150px,.9fr) minmax(160px,.9fr) 90px minmax(220px,1.5fr) auto;gap:9px;align-items:center;border:1px solid var(--line);border-radius:10px;padding:9px;background:var(--panel,#0d141c);font-size:10px}
      #page-turnos .r18-event-row small{display:block;color:var(--muted);margin-top:2px}
      #page-turnos .r18-mobile{display:none}
      #page-turnos .r18-mobile-person{border:1px solid var(--line);border-radius:11px;padding:9px;background:var(--panel,#0d141c);margin-bottom:9px}
      #page-turnos .r18-mobile-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;margin-top:7px}
      #page-turnos .r18-mobile-day{min-height:48px;border:1px solid var(--line);border-radius:7px;padding:4px;text-align:center;font-size:8px}
      @media(max-width:900px){#page-turnos .r18-kpis{grid-template-columns:repeat(2,minmax(0,1fr))}#page-turnos .r18-kpis-secondary{grid-template-columns:1fr 1fr 1fr}#page-turnos .r18-turn-toolbar{grid-template-columns:44px 1fr 44px}#page-turnos .r18-turn-toolbar label{grid-column:1/-1}#page-turnos .r18-event-row{grid-template-columns:1fr 1fr}#page-turnos .r18-event-row>*:nth-child(5){grid-column:1/-1}.r18-event-row .actions{grid-column:1/-1}.r18-desktop{display:none!important}#page-turnos .r18-mobile{display:block}}
      @media(max-width:520px){#page-turnos .r18-kpis,#page-turnos .r18-kpis-secondary{grid-template-columns:1fr 1fr}#page-turnos .r18-turn-actions .btn{width:100%}}
    `;document.head.appendChild(s);
  }

  function makeIndexes(d,y,m){
    const shifts=new Map(),byDate=new Map(),byUserDate=new Map(),profiles=d.profiles instanceof Map?d.profiles:new Map();
    for(const sh of d.shifts||[])shifts.set(`${sh.user_id}|${sh.fecha}`,sh);
    for(const ev of d.events||[]){
      let start=String(ev.fecha_inicio||''),end=String(ev.fecha_fin||ev.fecha_inicio||'');if(!start||!end)continue;
      if(start<d.range.start)start=d.range.start;if(end>d.range.end)end=d.range.end;if(start>end)continue;
      for(let dt=new Date(start+'T12:00:00'),last=new Date(end+'T12:00:00');dt<=last;dt.setDate(dt.getDate()+1)){
        const date=`${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`;
        if(!byDate.has(date))byDate.set(date,[]);byDate.get(date).push(ev);
        const key=`${ev.user_id}|${date}`;if(!byUserDate.has(key))byUserDate.set(key,[]);byUserDate.get(key).push(ev);
      }
    }
    const additional=new Set(),inside=new Set(),outside=new Set(),suspended=new Set();
    for(const [key,events] of byUserDate){
      if(events.some(e=>e.tipo==='dia_adicional'))additional.add(key);
      if(events.some(e=>e.tipo==='encierro_planificado'||(e.tipo==='encierro'&&['A','C'].includes(String(e.turno_base||'')))))inside.add(key);
      if(events.some(e=>e.tipo==='encierro_no_planificado'||(e.tipo==='encierro'&&String(e.turno_base||'')==='L')))outside.add(key);
      if(events.some(e=>e.tipo==='suspendido_encierro'))suspended.add(key);
    }
    return {shifts,byDate,byUserDate,profiles,additional,inside,outside,suspended};
  }

  function coverage(d,idx,date){
    const scheduled=(d.people||[]).filter(p=>['A','C'].includes(idx.shifts.get(`${p.user_id}|${date}`)?.turno_base));
    const events=idx.byDate.get(date)||[];
    const blocked=new Set(events.filter(e=>ABSENCE.has(String(e.tipo))).map(e=>String(e.user_id)));
    const extra=new Set(events.filter(e=>e.tipo==='dia_adicional'||e.tipo==='encierro_no_planificado'||(e.tipo==='encierro'&&String(e.turno_base)==='L')).map(e=>String(e.user_id)));
    const available=scheduled.filter(p=>!blocked.has(String(p.user_id))).length+extra.size;
    return {scheduled:scheduled.length,available,absent:scheduled.filter(p=>blocked.has(String(p.user_id))).length,pct:scheduled.length?Math.min(100,available/scheduled.length*100):100};
  }

  function eventBadges(events){return (events||[]).slice(0,3).map(ev=>`<span class="r18-event-code" title="${esc(label(ev.tipo))}${ev.motivo?' · '+esc(ev.motivo):''}">${esc(code(ev.tipo))}</span>`).join('')}

  function matrixHtml(d,idx,y,m,edit){
    const days=daysIn(y,m);
    const head=Array.from({length:days},(_,i)=>{const day=i+1,date=iso(y,m,day),dt=new Date(date+'T12:00:00');return `<th>${dt.toLocaleDateString('es-CL',{weekday:'short'}).slice(0,2)}<br>${day}</th>`}).join('');
    const rows=(d.people||[]).map(p=>`<tr><td><b>${esc(p.nombre||'')}</b><small>${esc(p.cargo||'')}</small></td>${Array.from({length:days},(_,i)=>{const date=iso(y,m,i+1),sh=idx.shifts.get(`${p.user_id}|${date}`),base=String(sh?.turno_base||'—'),events=idx.byUserDate.get(`${p.user_id}|${date}`)||[];return `<td class="r18-turn-cell ${edit?'editable':''}" data-r18-uid="${esc(p.user_id)}" data-r18-date="${date}"><span class="r18-shift ${esc(base)}">${esc(base)}</span>${events.length?`<div class="r18-cell-events">${eventBadges(events)}</div>`:''}</td>`}).join('')}</tr>`).join('');
    return `<div class="r18-matrix r18-desktop"><table><thead><tr><th>Colaborador</th>${head}</tr></thead><tbody>${rows||'<tr><td colspan="32">Sin personas en la malla.</td></tr>'}</tbody></table></div>${mobileHtml(d,idx,y,m,edit)}`;
  }

  function mobileHtml(d,idx,y,m,edit){
    const days=daysIn(y,m);
    return `<div class="r18-mobile">${(d.people||[]).map(p=>`<article class="r18-mobile-person"><b>${esc(p.nombre||'')}</b><small>${esc(p.cargo||'')}</small><div class="r18-mobile-days">${Array.from({length:days},(_,i)=>{const date=iso(y,m,i+1),sh=idx.shifts.get(`${p.user_id}|${date}`),base=String(sh?.turno_base||'—'),events=idx.byUserDate.get(`${p.user_id}|${date}`)||[];return `<div class="r18-mobile-day ${edit?'editable':''}" data-r18-uid="${esc(p.user_id)}" data-r18-date="${date}"><b>${i+1}</b><br><span class="r18-shift ${esc(base)}">${esc(base)}</span>${events.length?`<div class="r18-cell-events">${eventBadges(events)}</div>`:''}</div>`}).join('')}</div></article>`).join('')||'<div class="empty">Sin personas en la malla.</div>'}</div>`;
  }

  function eventsHtml(d,idx,edit){
    const rows=[...(d.events||[])].sort((a,b)=>String(b.fecha_inicio||'').localeCompare(String(a.fecha_inicio||'')));
    return `<div class="r18-events">${rows.map(ev=>{const p=(d.people||[]).find(x=>String(x.user_id)===String(ev.user_id)),creator=idx.profiles.get?.(String(ev.created_by))||'—';return `<article class="r18-event-row"><div><b>${esc(fmtDate(ev.fecha_inicio))}</b><small>${ev.fecha_fin&&ev.fecha_fin!==ev.fecha_inicio?'al '+esc(fmtDate(ev.fecha_fin)):''}</small></div><div><b>${esc(p?.nombre||'Usuario')}</b><small>${esc(p?.cargo||'')}</small></div><div><span class="r18-event-code">${esc(code(ev.tipo))}</span> ${esc(label(ev.tipo))}</div><div><b>${Number(ev.cantidad||0)} ${esc(ev.unidad||'')}</b><small>${esc(creator)}</small></div><div>${esc(ev.observacion||ev.motivo||'Sin detalle')}</div>${edit?`<div class="actions"><button class="btn" data-r18-edit-event="${esc(ev.id)}">Editar</button><button class="btn danger-btn" data-r18-delete-event="${esc(ev.id)}">Eliminar</button></div>`:'<div></div>'}</article>`}).join('')||'<div class="empty">Sin eventos registrados en el período.</div>'}</div>`;
  }

  function bind(page,d,edit){
    page.querySelectorAll('[data-r18-uid][data-r18-date]').forEach(cell=>cell.addEventListener('click',()=>{if(edit)window.v1520OpenShiftCell?.(cell.dataset.r18Uid,cell.dataset.r18Date)}));
    page.querySelector('[data-r18-prev]')?.addEventListener('click',()=>step(-1));
    page.querySelector('[data-r18-next]')?.addEventListener('click',()=>step(1));
    page.querySelector('[data-r18-today]')?.addEventListener('click',today);
    page.querySelector('[data-r18-group]')?.addEventListener('change',e=>{window.state.turnGroupV1512=e.target.value;directRender()});
    page.querySelector('[data-r18-tab="malla"]')?.addEventListener('click',()=>{window.state.v1520TurnTab='malla';directRender()});
    page.querySelector('[data-r18-tab="novedades"]')?.addEventListener('click',()=>{window.state.v1520TurnTab='novedades';directRender()});
    page.querySelector('[data-r18-template]')?.addEventListener('click',()=>window.v1514DownloadTurnTemplate?.());
    page.querySelector('[data-r18-import]')?.addEventListener('click',()=>window.v1514OpenTurnImport?.());
    page.querySelector('[data-r18-new]')?.addEventListener('click',()=>window.v1520OpenTurnEvent?.());
    page.querySelector('[data-r18-report]')?.addEventListener('click',()=>{if(typeof window.v1516OpenTurnMonthlyReport==='function')window.v1516OpenTurnMonthlyReport();else window.v1520TurnReport?.()});
    page.querySelector('[data-r18-publish]')?.addEventListener('click',()=>window.v1524PublishTurns?.());
    page.querySelectorAll('[data-r18-edit-event]').forEach(b=>b.addEventListener('click',()=>window.v1520OpenTurnEvent?.(b.dataset.r18EditEvent)));
    page.querySelectorAll('[data-r18-delete-event]').forEach(b=>b.addEventListener('click',()=>window.v1520DeleteTurnEvent?.(b.dataset.r18DeleteEvent)));
  }

  function step(delta){let y=Number(window.state.turnYearV1512||new Date().getFullYear()),m=Number(window.state.turnMonthV1512||new Date().getMonth()+1)+delta;while(m<1){m+=12;y--}while(m>12){m-=12;y++}window.state.turnYearV1512=y;window.state.turnMonthV1512=m;directRender()}
  function today(){const d=new Date();window.state.turnYearV1512=d.getFullYear();window.state.turnMonthV1512=d.getMonth()+1;directRender()}

  async function directRender(){
    if(!window.canViewV11?.('turnos'))return;
    const page=document.getElementById('page-turnos');if(!page)return;
    const token=++seq,start=performance.now();mountStyle();
    window.state.turnYearV1512=Number(window.state.turnYearV1512||new Date().getFullYear());
    window.state.turnMonthV1512=Number(window.state.turnMonthV1512||new Date().getMonth()+1);
    if(!['malla','novedades'].includes(String(window.state.v1520TurnTab||'')))window.state.v1520TurnTab='malla';
    page.innerHTML='<div class="empty">Cargando Turnos y Novedades…</div>';
    try{
      if(typeof window.v1520LoadTurnData!=='function')throw new Error('No está disponible la capa de datos de Turnos.');
      const loadStart=performance.now(),d=await window.v1520LoadTurnData();if(token!==seq)return;
      const loadMs=Math.round(performance.now()-loadStart);window.state.v1520TurnData=d;window.state.v1512TurnData=d;
      const y=Number(window.state.turnYearV1512),m=Number(window.state.turnMonthV1512),idx=makeIndexes(d,y,m),edit=canEdit();
      const now=new Date(),todayIso=iso(now.getFullYear(),now.getMonth()+1,now.getDate()),ref=todayIso>=d.range.start&&todayIso<=d.range.end?todayIso:d.range.start,cov=coverage(d,idx,ref);
      const buildStart=performance.now();
      const groupOptions=(d.groups||[]).map(([id,n])=>`<option value="${esc(id)}" ${String(window.state.turnGroupV1512||'')===String(id)?'selected':''}>${esc(n)}</option>`).join('');
      const tab=window.state.v1520TurnTab;
      const content=tab==='malla'?matrixHtml(d,idx,y,m,edit):eventsHtml(d,idx,edit);
      const html=`<div class="topbar"><div><h2>Turnos y Novedades</h2><p>Planifica y consulta la malla A/C/L y los eventos reales de la dotación.</p></div></div>
        <div class="r18-turn-meta"><span class="status ok">Turnos directos · r18</span><span>${(d.people||[]).length} colaborador(es) · ${loadMs} ms datos</span></div>
        <div class="r18-turn-actions">${edit?'<button class="btn" data-r18-template>↓ Plantilla anual</button><button class="btn" data-r18-import>↑ Importar Excel</button><button class="btn primary" data-r18-new>+ Nuevo evento</button>':''}<button class="btn" data-r18-report>↓ Informe</button>${edit?'<button class="btn" data-r18-publish>Publicar turnos</button>':''}</div>
        <div class="r18-turn-toolbar"><button class="btn" data-r18-prev>‹</button><div class="r18-month">${esc(monthName(m))} ${y}</div><button class="btn" data-r18-next>›</button><label>Grupo<select class="field" data-r18-group><option value="">Todos</option>${groupOptions}</select></label></div>
        <div class="r18-kpis"><div class="r18-kpi"><span>Programados · ${esc(fmtDate(ref))}</span><b>${cov.scheduled}</b></div><div class="r18-kpi"><span>Disponibles efectivos</span><b>${cov.available}</b></div><div class="r18-kpi"><span>Ausentes programados</span><b>${cov.absent}</b></div><div class="r18-kpi"><span>Días adicionales · mes</span><b>${idx.additional.size}</b><small>Acumulado del mes seleccionado</small></div><div class="r18-kpi"><span>Cobertura operativa</span><b>${cov.pct.toFixed(1)}%</b><small>No utiliza dotación contractual</small></div></div>
        <div class="r18-kpis r18-kpis-secondary"><div class="r18-kpi"><span>Encierro dentro de turno</span><b>${idx.inside.size}</b></div><div class="r18-kpi"><span>Encierro fuera de turno</span><b>${idx.outside.size}</b></div><div class="r18-kpi"><span>Suspendido por encierro</span><b>${idx.suspended.size}</b></div></div>
        <div class="r18-turn-tabs"><button class="btn ${tab==='malla'?'active':''}" data-r18-tab="malla">Malla</button><button class="btn ${tab==='novedades'?'active':''}" data-r18-tab="novedades">Eventos y novedades</button></div><div data-r18-content>${content}</div>`;
      const buildMs=Math.round(performance.now()-buildStart),domStart=performance.now();page.innerHTML=html;const domMs=Math.round(performance.now()-domStart);
      page.querySelector('.r18-turn-meta')?.insertAdjacentHTML('beforeend',`<span>render ${buildMs} ms · DOM ${domMs} ms · total ${Math.round(performance.now()-start)} ms</span>`);
      bind(page,d,edit);
      try{window.v1514SetGlobalHeader?.('turnos')}catch(_){ }
    }catch(error){if(token!==seq)return;console.error('[Turnos directos r18]',error);page.innerHTML=`<div class="notice error"><b>No fue posible cargar Turnos y Novedades.</b><br>${esc(error?.message||String(error))}<br><small>Renderizador directo r18 · ${BUILD}</small></div>`}
  }
  directRender.__r18Direct=true;

  function installAuthoritative(){
    mountStyle();
    window.renderTurnosV15=directRender;
    window.v1520TurnStep=step;window.v1520TurnToday=today;
    if(typeof window.v1523Renderer==='function'&&!window.v1523Renderer.__r18){const base=window.v1523Renderer;const fn=pg=>pg==='turnos'?directRender:base(pg);fn.__r18=true;fn.__base=base;window.v1523Renderer=fn}
    if(typeof window.v1519RenderModule==='function'&&!window.v1519RenderModule.__r18){const base=window.v1519RenderModule;const fn=pg=>pg==='turnos'?directRender():base(pg);fn.__r18=true;fn.__base=base;window.v1519RenderModule=fn}
    document.documentElement.dataset.stainherTurnosRenderer='r18-direct';
  }

  function boot(){installAuthoritative();window.addEventListener('stainher:modules-ready',installAuthoritative,{once:true});setTimeout(installAuthoritative,800)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
