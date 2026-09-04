/* Stainher App V15.24 · Desarrollo 8 · Correctivo Supervisor r12
 * Vista autoritativa: el Supervisor usa un flujo operativo independiente del
 * render histórico de KPI/Confiabilidad. Cargado al final de la cadena.
 */
(function installSupervisorCorrectivoR12(){
  if(window.__STAINHER_SUPERVISOR_CORRECTIVO_R12__)return;
  window.__STAINHER_SUPERVISOR_CORRECTIVO_R12__=true;

  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function role(){
    try{if(typeof v11Role==='function')return norm(v11Role())}catch(_){ }
    try{if(typeof window.v11Role==='function')return norm(window.v11Role())}catch(_){ }
    try{if(typeof state!=='undefined')return norm(state?.profile?.rol)}catch(_){ }
    try{return norm(window.state?.profile?.rol)}catch(_){return ''}
  }
  const isSupervisor=()=>role()==='supervisor';
  function appState(){try{if(typeof state!=='undefined')return state}catch(_){ }return window.state||null}
  function db(){try{if(typeof sb!=='undefined')return sb}catch(_){ }return window.sb||null}
  function toastMsg(msg,type=''){try{if(typeof toast==='function')return toast(msg,type)}catch(_){ }try{return window.toast?.(msg,type)}catch(_){ }}
  const pad=n=>String(n).padStart(2,'0');
  function iso(y,m,d){return `${y}-${pad(m)}-${pad(d)}`}
  function monthRange(y,m){return {from:iso(y,m,1),to:iso(y,m,new Date(y,m,0).getDate())}}
  function currentRange(){
    const st=appState(),now=new Date(),y=Number(st?.correctivoYear||now.getFullYear()),m=Number(st?.correctivoMonth||now.getMonth()+1);
    return monthRange(y,m);
  }
  function fmtHours(v){const n=Number(v);return Number.isFinite(n)?`${n.toFixed(1)} h`:'—'}
  function normalizeStatus(v){
    const x=norm(v);if(!x)return '—';
    if(x.includes('observ'))return 'Operativo con observaciones';
    if(x.includes('fuera')||x.includes('no operativo'))return 'Fuera de servicio';
    if(x.includes('oper'))return 'Operativo';
    return String(v||'—');
  }

  function installStyle(){
    if(document.getElementById('stainher-supervisor-correctivo-r12-style'))return;
    const s=document.createElement('style');s.id='stainher-supervisor-correctivo-r12-style';
    s.textContent=`
      #page-correctivo.stainher-supervisor-correctivo-r12{min-width:0}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-toolbar{display:grid;grid-template-columns:minmax(150px,1fr) minmax(150px,1fr) minmax(220px,1.4fr) auto;gap:10px;align-items:end;margin-bottom:16px}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-field{display:grid;gap:6px;min-width:0}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-field>span{font-size:11px;font-weight:700;color:var(--muted,#9aa6b5);text-transform:uppercase;letter-spacing:.04em}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-field .field{width:100%;min-width:0;max-width:100%}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-history{display:grid;gap:14px;min-width:0}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-head h3{margin:0;font-size:20px}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(285px,1fr));gap:12px;min-width:0}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-card{border:1px solid var(--line,#2b3644);border-radius:15px;background:var(--panel,#10151c);padding:14px;min-width:0;overflow:hidden}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-card-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;padding-bottom:10px;margin-bottom:5px;border-bottom:1px solid var(--line,#2b3644)}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-card-head b{font-size:16px;line-height:1.3;overflow-wrap:anywhere}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-card-head span{font-size:12px;color:var(--muted,#9aa6b5);white-space:nowrap}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-row{display:grid;grid-template-columns:minmax(92px,32%) minmax(0,1fr);gap:10px;padding:7px 0;border-bottom:1px solid rgba(148,163,184,.16);min-width:0}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-row:last-child{border-bottom:0}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-label{font-size:11px;font-weight:700;color:var(--muted,#9aa6b5);text-transform:uppercase;letter-spacing:.03em}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-value{font-size:14px;line-height:1.45;min-width:0;overflow-wrap:anywhere;white-space:normal}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-status{display:inline-block;padding:5px 9px;border-radius:999px;background:rgba(52,211,153,.13)}
      #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-empty{padding:28px;text-align:center;color:var(--muted,#9aa6b5);border:1px dashed var(--line,#2b3644);border-radius:14px}
      @media(max-width:900px){
        #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-toolbar{grid-template-columns:1fr 1fr}
        #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-toolbar .corr-r12-equipo{grid-column:1/-1}
        #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-toolbar>button{grid-column:1/-1;width:100%}
        #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-grid{grid-template-columns:1fr}
      }
      @media(max-width:520px){
        #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-toolbar{grid-template-columns:1fr}
        #page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-toolbar .corr-r12-equipo,#page-correctivo.stainher-supervisor-correctivo-r12 .corr-r12-toolbar>button{grid-column:auto}
      }
    `;document.head.appendChild(s);
  }

  function equipmentOptions(selected=''){
    const st=appState(),rows=(st?.equipos||[]).filter(e=>e?.estado!=='retirado');
    return rows.map(e=>`<option value="${esc(e.nombre||'')}" ${String(selected)===String(e.nombre||'')?'selected':''}>${esc(e.nombre||'Equipo')}</option>`).join('');
  }

  let range=currentRange(),selectedEquipment='',lastRows=[],rendering=false;
  function readFilters(){
    const f=document.getElementById('corrFromR12')?.value||range.from;
    const t=document.getElementById('corrToR12')?.value||range.to;
    const e=document.getElementById('corrEquipo')?.value||selectedEquipment||'';
    return {from:f,to:t,equipo:e};
  }

  function renderShell(){
    if(!isSupervisor())return false;
    const page=document.getElementById('page-correctivo');if(!page)return false;
    const old=readFilters();range={from:old.from||range.from,to:old.to||range.to};selectedEquipment=old.equipo||'';
    page.classList.add('stainher-supervisor-correctivo-r12');
    page.innerHTML=`<div class="topbar"><div><h2>Mantenimiento Correctivo</h2><p>Registro de averías e historial operativo.</p></div><div class="actions"><button type="button" class="btn primary" id="corrRegisterR12">+ Registrar avería</button></div></div>
      <div class="corr-r12-toolbar">
        <label class="corr-r12-field"><span>Desde</span><input id="corrFromR12" class="field" type="date" value="${esc(range.from)}"></label>
        <label class="corr-r12-field"><span>Hasta</span><input id="corrToR12" class="field" type="date" value="${esc(range.to)}"></label>
        <label class="corr-r12-field corr-r12-equipo"><span>Equipo</span><select id="corrEquipo" class="field"><option value="">Todos los equipos</option>${equipmentOptions(selectedEquipment)}</select></label>
        <button type="button" class="btn primary" id="corrRefreshR12">Actualizar</button>
      </div>
      <div id="corrBody"><div class="empty">Cargando…</div></div>`;
    document.getElementById('corrRegisterR12')?.addEventListener('click',openRegister);
    document.getElementById('corrRefreshR12')?.addEventListener('click',()=>loadSupervisor());
    return true;
  }

  function openRegister(){
    try{
      const fn=(typeof v15OpenCorrectiveMobile==='function'?v15OpenCorrectiveMobile:window.v15OpenCorrectiveMobile);
      if(typeof fn==='function'){fn();return}
    }catch(e){console.warn('[r12] registrar avería',e)}
    toastMsg('No fue posible abrir el formulario de avería.','error');
  }

  function row(label,value,raw=false){return `<div class="corr-r12-row"><div class="corr-r12-label">${esc(label)}</div><div class="corr-r12-value">${raw?value:esc(value||'—')}</div></div>`}
  function card(r){
    const status=esc(r.estado_normalizado||r.estado_final||'—');
    const when=[r.fecha_inicio,r.hora_inicio].filter(Boolean).join(' · ');
    return `<article class="corr-r12-card"><div class="corr-r12-card-head"><b>${esc(r.equipo||r.equipo_original||'Avería')}</b><span>${esc(when)}</span></div>
      ${row('Guía',r.guia||r.numero_guia||'—')}
      ${row('Responsable',r.responsable||r.supervisor_tecnico||'—')}
      ${row('Duración',fmtHours(r.duracion_horas))}
      ${row('Estado final',`<span class="corr-r12-status">${status}</span>`,true)}
      ${row('Observación',r.observaciones||'—')}
    </article>`;
  }

  function renderHistory(rows){
    if(!isSupervisor())return false;
    const body=document.getElementById('corrBody');if(!body)return false;
    const filters=readFilters();range={from:filters.from,to:filters.to};selectedEquipment=filters.equipo;
    let scoped=Array.isArray(rows)?rows.slice():[];
    if(selectedEquipment)scoped=scoped.filter(r=>String(r.equipo||'')===String(selectedEquipment));
    scoped.sort((a,b)=>`${b.fecha_inicio||''} ${b.hora_inicio||''}`.localeCompare(`${a.fecha_inicio||''} ${a.hora_inicio||''}`));
    lastRows=scoped.slice();rendering=true;
    body.innerHTML=`<section class="corr-r12-history"><div class="corr-r12-head"><div><h3>Historial del período correctivo</h3><div class="muted">${scoped.length} avería(s) entre ${esc(range.from)} y ${esc(range.to)}${selectedEquipment?' · '+esc(selectedEquipment):''}.</div></div></div><div class="corr-r12-grid">${scoped.length?scoped.map(card).join(''):'<div class="corr-r12-empty">Sin averías para el período seleccionado.</div>'}</div></section>`;
    rendering=false;return true;
  }

  function mapAveria(r){
    const eq=r?.equipos?.nombre||r?.equipo_original||'Sin equipo';
    return {...r,equipo:eq,guia:r?.numero_guia,responsable:r?.supervisor_tecnico,duracion_horas:(Number(r?.duracion_minutos)||0)/60,estado_normalizado:normalizeStatus(r?.estado_final),equipo_estado:r?.equipos?.estado||''};
  }

  let loading=false;
  async function loadSupervisor(){
    if(!isSupervisor())return false;if(loading)return true;
    const body=document.getElementById('corrBody');const filters=readFilters();
    if(!filters.from||!filters.to){toastMsg('Selecciona las fechas Desde y Hasta.','error');return true}
    if(filters.from>filters.to){toastMsg('La fecha Desde no puede ser posterior a Hasta.','error');return true}
    range={from:filters.from,to:filters.to};selectedEquipment=filters.equipo;loading=true;
    if(body)body.innerHTML='<div class="empty">Cargando historial…</div>';
    try{
      const client=db();if(!client)throw new Error('Conexión de datos no disponible');
      const cols='id,equipo_id,equipo_original,numero_guia,supervisor_tecnico,fecha_inicio,hora_inicio,fecha_termino,hora_termino,estado_final,observaciones,duracion_minutos,equipos(nombre,nombre_alternativo,estado)';
      const {data,error}=await client.from('averias').select(cols).gte('fecha_inicio',range.from).lte('fecha_inicio',range.to).order('fecha_inicio',{ascending:false}).order('hora_inicio',{ascending:false});
      if(error)throw error;
      const rows=(data||[]).map(mapAveria).filter(r=>r.equipo_estado!=='retirado');
      const st=appState();if(st)st.correctivo=rows;
      renderHistory(rows);
    }catch(e){console.error('[r12] historial supervisor',e);if(body)body.innerHTML=`<div class="notice error">${esc(e?.message||'No fue posible cargar el historial correctivo.')}</div>`}
    finally{loading=false}
    return true;
  }

  let baseShell=null,baseLoad=null,baseRender=null;
  function installOverrides(){
    try{
      if(typeof renderCorrectivoShell==='function'&&!renderCorrectivoShell.__stainherSupervisorR12){
        baseShell=renderCorrectivoShell;
        const fn=function(){if(isSupervisor()){renderShell();return}return baseShell.apply(this,arguments)};fn.__stainherSupervisorR12=true;fn.__base=baseShell;
        renderCorrectivoShell=fn;window.renderCorrectivoShell=fn;
      }
    }catch(e){console.warn('[r12] shell',e)}
    try{
      if(typeof loadCorrectivo==='function'&&!loadCorrectivo.__stainherSupervisorR12){
        baseLoad=loadCorrectivo;
        const fn=async function(home=false){if(isSupervisor()&&!home)return loadSupervisor();return baseLoad.apply(this,arguments)};fn.__stainherSupervisorR12=true;fn.__base=baseLoad;
        loadCorrectivo=fn;window.loadCorrectivo=fn;
      }
    }catch(e){console.warn('[r12] load',e)}
    try{
      if(typeof renderCorrectivo==='function'&&!renderCorrectivo.__stainherSupervisorR12){
        baseRender=renderCorrectivo;
        const fn=function(j){if(isSupervisor()){renderHistory(j?.rows||appState()?.correctivo||[]);return}return baseRender.apply(this,arguments)};fn.__stainherSupervisorR12=true;fn.__base=baseRender;
        renderCorrectivo=fn;window.renderCorrectivo=fn;
      }
    }catch(e){console.warn('[r12] render',e)}
  }

  function legacyVisible(page){
    if(!page||!isSupervisor())return false;
    return !!page.querySelector('#corrYear,#corrMonth,.corr-history-v8,#v153CorrReliability,#v153CorrHistory,#corrBody>.grid-kpi,#corrBody>.two-col,#corrBody>.trend-panel');
  }
  function reconcile(){
    if(!isSupervisor())return;
    const page=document.getElementById('page-correctivo');if(!page)return;
    installOverrides();
    if(legacyVisible(page)){renderShell();loadSupervisor();return}
    if(!page.classList.contains('stainher-supervisor-correctivo-r12')){renderShell();loadSupervisor()}
  }

  function boot(){
    installStyle();installOverrides();reconcile();
    const page=document.getElementById('page-correctivo')||document.body;let pending=false;
    new MutationObserver(()=>{if(rendering||loading||pending)return;pending=true;requestAnimationFrame(()=>{pending=false;reconcile()})}).observe(page,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',()=>setTimeout(reconcile,0));
    setTimeout(reconcile,250);setTimeout(reconcile,1200);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();