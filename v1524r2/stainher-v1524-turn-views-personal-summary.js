/* Stainher App V15.24 · Turnos: solo Malla/Eventos + resumen personal en Inicio
 * - Elimina Calendario de la vista accesible de Turnos y Novedades.
 * - Conserva Malla y Eventos/Novedades.
 * - Muestra en Inicio HE, ET, EF y DA del usuario conectado para el mes actual.
 */
(function installTurnViewsAndPersonalSummary(){
  if(window.__STAINHER_V1524_TURN_VIEWS_PERSONAL__) return;
  window.__STAINHER_V1524_TURN_VIEWS_PERSONAL__=true;

  const PERSONAL_ROLES=new Set(['supervisor','tecnico','prevencion','apr']);
  let summaryScheduled=false;
  let summarySeq=0;

  const esc=value=>typeof window.esc==='function'
    ? window.esc(value==null?'':String(value))
    : String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function role(){return String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase()}
  function uid(){return String(window.state?.session?.user?.id||'')}
  function canSeeTurns(){try{return !!window.canViewV11?.('turnos')}catch(_){return false}}

  function mountStyle(){
    if(document.getElementById('stainher-v1524-turn-views-personal-style')) return;
    const s=document.createElement('style');
    s.id='stainher-v1524-turn-views-personal-style';
    s.textContent=`
      #page-turnos .v1520-turn-calendar,#page-turnos .v1520-cal-scroll{display:none!important}
      .v1524-personal-work-summary{margin-bottom:14px}
      .v1524-personal-work-head{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;flex-wrap:wrap;margin-bottom:10px}
      .v1524-personal-work-head h3{margin:0}
      .v1524-personal-work-head .muted{font-size:10px}
      .v1524-personal-work-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:8px}
      .v1524-personal-work-kpi{min-width:0;border:1px solid var(--line);border-radius:10px;background:#0d151d;padding:10px 11px}
      .v1524-personal-work-kpi span{display:block;font-size:10px;color:var(--muted);line-height:1.2}
      .v1524-personal-work-kpi b{display:block;margin-top:5px;font-size:23px;line-height:1;color:#fff;font-variant-numeric:tabular-nums}
      .v1524-personal-work-kpi small{display:block;margin-top:5px;font-size:9px;color:var(--muted)}
      .v1524-personal-work-kpi.he{border-color:#7b651c;background:rgba(234,179,8,.07)}
      .v1524-personal-work-kpi.he b{color:#fde68a}
      .v1524-personal-work-kpi.et{border-color:#18795d;background:rgba(52,211,153,.07)}
      .v1524-personal-work-kpi.et b{color:#6ee7b7}
      .v1524-personal-work-kpi.ef{border-color:#9a5b10;background:rgba(251,146,60,.08)}
      .v1524-personal-work-kpi.ef b{color:#fdba74}
      .v1524-personal-work-kpi.da{border-color:#256e91;background:rgba(56,189,248,.07)}
      .v1524-personal-work-kpi.da b{color:#7dd3fc}
      @media(max-width:760px){.v1524-personal-work-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
      @media(max-width:420px){.v1524-personal-work-kpi{padding:9px}.v1524-personal-work-kpi b{font-size:21px}}
    `;
    document.head.appendChild(s);
  }

  function normalizeTurnTabs(){
    if(!window.state) return;
    if(!['malla','novedades'].includes(String(window.state.v1520TurnTab||''))) window.state.v1520TurnTab='malla';
    if(!['malla','novedades'].includes(String(window.state.turnTabV1512||''))) window.state.turnTabV1512='malla';
  }

  function cleanTurnView(){
    const page=document.getElementById('page-turnos');
    if(!page) return;
    normalizeTurnTabs();
    page.querySelectorAll('.v1520-tabs button,.v1512-turn-tabs button').forEach(btn=>{
      const text=String(btn.textContent||'').trim().toLowerCase();
      if(text==='calendario') btn.remove();
      else if(text==='malla a/c/l'||text==='malla de turnos') btn.textContent='Malla';
      else if(text==='eventos / novedades'||text==='novedades') btn.textContent='Eventos y novedades';
    });
    page.querySelectorAll('.v1520-turn-calendar,.v1520-cal-scroll').forEach(el=>el.remove());
  }

  function wrapTurnRenderer(){
    const current=window.renderTurnosV15;
    if(typeof current!=='function'||current.__v1524NoCalendar) return false;
    const wrapped=async function(){
      normalizeTurnTabs();
      const out=await current.apply(this,arguments);
      cleanTurnView();
      return out;
    };
    wrapped.__v1524NoCalendar=true;
    wrapped.__base=current;
    window.renderTurnosV15=wrapped;
    return true;
  }

  function monthRange(){
    const d=new Date(),y=d.getFullYear(),m=d.getMonth()+1;
    const start=`${y}-${String(m).padStart(2,'0')}-01`;
    const last=new Date(y,m,0).getDate();
    const end=`${y}-${String(m).padStart(2,'0')}-${String(last).padStart(2,'0')}`;
    const label=new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
    return {y,m,start,end,label};
  }

  function dateIso(d){return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function overlapDays(ev,start,end){
    let a=String(ev?.fecha_inicio||''),b=String(ev?.fecha_fin||ev?.fecha_inicio||'');
    if(!a||!b) return [];
    if(a<start)a=start;if(b>end)b=end;if(a>b)return [];
    const out=[];
    for(let d=new Date(a+'T12:00:00'),last=new Date(b+'T12:00:00');d<=last;d.setDate(d.getDate()+1))out.push(dateIso(d));
    return out;
  }
  function countDays(rows,predicate,start,end){
    const days=new Set();
    rows.filter(predicate).forEach(ev=>overlapDays(ev,start,end).forEach(day=>days.add(day)));
    return days.size;
  }
  function fmtHours(n){return new Intl.NumberFormat('es-CL',{minimumFractionDigits:0,maximumFractionDigits:1}).format(Number(n)||0)}

  function personalHost(){
    const page=document.getElementById('page-inicio');
    if(!page) return null;
    const anchor=page.querySelector('.v1521-home-turn');
    if(!anchor) return null;
    let box=page.querySelector('#v1524PersonalWorkSummary');
    if(!box){
      box=document.createElement('section');
      box.id='v1524PersonalWorkSummary';
      box.className='panel v1524-personal-work-summary';
      anchor.insertAdjacentElement('beforebegin',box);
    }
    return box;
  }

  function shouldShowPersonal(){
    return !!uid()&&canSeeTurns()&&PERSONAL_ROLES.has(role());
  }

  async function renderPersonalSummary(){
    summaryScheduled=false;
    const page=document.getElementById('page-inicio');
    if(!page) return;
    if(!shouldShowPersonal()){
      page.querySelector('#v1524PersonalWorkSummary')?.remove();
      return;
    }
    const host=personalHost();
    if(!host||!window.sb) return;
    const seq=++summarySeq,r=monthRange(),userId=uid();
    host.innerHTML=`<div class="v1524-personal-work-head"><div><h3>Mi control de turnos</h3><div class="muted">${esc(r.label)} · solo mis registros</div></div></div><div class="empty">Actualizando resumen…</div>`;
    try{
      const q=await window.sb.from('turnos_novedades_v15')
        .select('id,tipo,fecha_inicio,fecha_fin,cantidad,unidad,turno_base,clasificacion_auto')
        .eq('user_id',userId)
        .lte('fecha_inicio',r.end)
        .gte('fecha_fin',r.start)
        .order('fecha_inicio',{ascending:true});
      if(q.error) throw q.error;
      if(seq!==summarySeq||uid()!==userId) return;
      const rows=q.data||[];
      const he=rows.filter(x=>String(x.tipo)==='hora_extra').reduce((a,x)=>a+(Number(x.cantidad)||0),0);
      const et=countDays(rows,x=>String(x.tipo)==='encierro_planificado'||(String(x.tipo)==='encierro'&&['A','C'].includes(String(x.turno_base||''))),r.start,r.end);
      const ef=countDays(rows,x=>String(x.tipo)==='encierro_no_planificado'||(String(x.tipo)==='encierro'&&String(x.turno_base||'')==='L'),r.start,r.end);
      const da=countDays(rows,x=>String(x.tipo)==='dia_adicional',r.start,r.end);
      host.innerHTML=`<div class="v1524-personal-work-head"><div><h3>Mi control de turnos</h3><div class="muted">${esc(r.label)} · acumulado personal, no incluye al grupo</div></div><div class="muted">Actualizado ${new Intl.DateTimeFormat('es-CL',{day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date())}</div></div><div class="v1524-personal-work-grid"><div class="v1524-personal-work-kpi he"><span>HE · Horas extra</span><b>${fmtHours(he)} h</b><small>Horas registradas</small></div><div class="v1524-personal-work-kpi et"><span>ET · Encierro dentro de turno</span><b>${et}</b><small>Día(s) del mes</small></div><div class="v1524-personal-work-kpi ef"><span>EF · Encierro fuera de turno</span><b>${ef}</b><small>Día(s) del mes</small></div><div class="v1524-personal-work-kpi da"><span>DA · Día extra</span><b>${da}</b><small>Día(s) adicional(es)</small></div></div>`;
    }catch(error){
      if(seq!==summarySeq) return;
      host.innerHTML=`<div class="v1524-personal-work-head"><div><h3>Mi control de turnos</h3><div class="muted">${esc(r.label)} · solo mis registros</div></div></div><div class="notice error">No se pudo actualizar el resumen personal: ${esc(error?.message||String(error))}</div>`;
    }
  }

  function scheduleSummary(){
    if(summaryScheduled) return;
    summaryScheduled=true;
    setTimeout(renderPersonalSummary,80);
  }

  function boot(){
    mountStyle();
    normalizeTurnTabs();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      if(wrapTurnRenderer()||tries>30) clearInterval(timer);
    },120);
    cleanTurnView();
    scheduleSummary();
    const root=document.getElementById('appView')||document.body;
    new MutationObserver(mutations=>{
      let turn=false,home=false;
      for(const m of mutations){
        const target=m.target?.nodeType===1?m.target:m.target?.parentElement;
        if(target?.closest?.('#page-turnos')) turn=true;
        if(target?.closest?.('#page-inicio')) home=true;
        if(turn&&home) break;
      }
      if(turn) cleanTurnView();
      if(home) scheduleSummary();
    }).observe(root,{childList:true,subtree:true});
    window.addEventListener('focus',scheduleSummary,{passive:true});
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
