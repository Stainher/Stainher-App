/* Stainher App V15.24 · r11 · Historial Correctivo directo para Supervisor
 * Renderiza el historial desde j.rows y no depende de pestañas/DOM heredados.
 */
(function installSupervisorHistoryDirectR11(){
  if(window.__STAINHER_SUPERVISOR_HISTORY_DIRECT_R11__)return;
  window.__STAINHER_SUPERVISOR_HISTORY_DIRECT_R11__=true;

  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isSupervisor=()=>{try{return norm(window.v11Role?.()||window.state?.profile?.rol||'')==='supervisor'}catch(_){return false}};
  const canEdit=()=>{try{return typeof window.v1524CanEditCorrectivo==='function'?!!window.v1524CanEditCorrectivo():!!window.canEditV11?.('correctivo')}catch(_){return false}};
  const fmtHours=v=>{const n=Number(v);return Number.isFinite(n)?`${n.toFixed(1)} h`:'—'};

  function style(){
    if(document.getElementById('stainher-supervisor-history-direct-r11-style'))return;
    const s=document.createElement('style');s.id='stainher-supervisor-history-direct-r11-style';
    s.textContent=`
      #page-correctivo .stainher-supervisor-direct-history-r11{display:grid;gap:14px;min-width:0}
      #page-correctivo .stainher-supervisor-direct-head-r11{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap}
      #page-correctivo .stainher-supervisor-direct-head-r11 h3{margin:0;font-size:22px}
      #page-correctivo .stainher-supervisor-direct-grid-r11{display:grid;gap:12px;grid-template-columns:repeat(auto-fit,minmax(280px,1fr));min-width:0}
      #page-correctivo .stainher-supervisor-direct-card-r11{border:1px solid var(--line,#d2dbe6);border-radius:16px;padding:14px;background:var(--panel,#fff);min-width:0;overflow:hidden}
      #page-correctivo .stainher-supervisor-direct-card-head-r11{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;padding-bottom:10px;margin-bottom:6px;border-bottom:1px solid var(--line,#d2dbe6)}
      #page-correctivo .stainher-supervisor-direct-card-head-r11 b{font-size:17px;overflow-wrap:anywhere}
      #page-correctivo .stainher-supervisor-direct-card-head-r11 span{font-size:13px;color:var(--muted,#64748b);white-space:nowrap}
      #page-correctivo .stainher-supervisor-direct-field-r11{display:grid;grid-template-columns:minmax(95px,32%) minmax(0,1fr);gap:10px;padding:7px 0;border-bottom:1px solid rgba(148,163,184,.18)}
      #page-correctivo .stainher-supervisor-direct-field-r11:last-child{border-bottom:0}
      #page-correctivo .stainher-supervisor-direct-label-r11{font-size:11px;font-weight:700;color:var(--muted,#64748b);text-transform:uppercase;letter-spacing:.03em}
      #page-correctivo .stainher-supervisor-direct-value-r11{font-size:14px;line-height:1.45;overflow-wrap:anywhere;white-space:normal}
      #page-correctivo .stainher-supervisor-direct-status-r11{display:inline-block;padding:5px 10px;border-radius:999px;background:rgba(16,185,129,.12)}
      #page-correctivo .stainher-supervisor-direct-empty-r11{padding:24px;text-align:center;color:var(--muted,#64748b);border:1px dashed var(--line,#d2dbe6);border-radius:14px}
      @media(max-width:900px){
        #page-correctivo .stainher-supervisor-direct-grid-r11{grid-template-columns:1fr}
        #page-correctivo .stainher-supervisor-direct-head-r11 h3{font-size:20px}
      }
    `;document.head.appendChild(s);
  }

  function field(label,value,raw=false){
    return `<div class="stainher-supervisor-direct-field-r11"><div class="stainher-supervisor-direct-label-r11">${esc(label)}</div><div class="stainher-supervisor-direct-value-r11">${raw?value:esc(value||'—')}</div></div>`;
  }

  function card(r){
    const status=esc(r.estado_normalizado||r.estado_final||'—');
    return `<article class="stainher-supervisor-direct-card-r11">
      <div class="stainher-supervisor-direct-card-head-r11"><b>${esc(r.equipo||r.equipo_original||'Avería')}</b><span>${esc(r.fecha_inicio||'')}</span></div>
      ${field('Guía',r.guia||r.numero_guia||'—')}
      ${field('Responsable',r.responsable||r.supervisor_tecnico||'—')}
      ${field('Duración',fmtHours(r.duracion_horas))}
      ${field('Estado final',`<span class="stainher-supervisor-direct-status-r11">${status}</span>`,true)}
      ${field('Observación',r.observaciones||'—')}
    </article>`;
  }

  function renderSupervisor(j){
    const body=document.getElementById('corrBody');if(!body)return;
    let rows=Array.isArray(j?.rows)?j.rows.slice():[];
    const eq=document.getElementById('corrEquipo')?.value||'';
    if(eq)rows=rows.filter(r=>String(r.equipo||'')===String(eq));
    rows.sort((a,b)=>String(b.fecha_inicio||'').localeCompare(String(a.fecha_inicio||'')));
    body.dataset.v153tabs='';
    body.innerHTML=`<section class="stainher-supervisor-direct-history-r11">
      <div class="stainher-supervisor-direct-head-r11"><div><h3>Historial del período correctivo</h3><div class="muted">Detalle de las averías e intervenciones registradas en el período seleccionado.</div></div>${canEdit()?'<button type="button" class="btn primary" id="stainherSupervisorRegisterR11">+ Registrar avería / incidente</button>':''}</div>
      <div class="stainher-supervisor-direct-grid-r11">${rows.length?rows.map(card).join(''):'<div class="stainher-supervisor-direct-empty-r11">Sin averías para el período seleccionado.</div>'}</div>
    </section>`;
    const btn=document.getElementById('stainherSupervisorRegisterR11');
    if(btn)btn.onclick=()=>window.v15OpenCorrectiveMobile?.();
  }

  let baseRender=null;
  function install(){
    style();
    const current=window.renderCorrectivo;
    if(typeof current!=='function')return false;
    if(current.__stainherSupervisorHistoryDirectR11)return true;
    baseRender=current;
    const wrapped=function(j){
      if(isSupervisor()){renderSupervisor(j||{});return}
      return baseRender.apply(this,arguments);
    };
    wrapped.__stainherSupervisorHistoryDirectR11=true;
    wrapped.__base=baseRender;
    window.renderCorrectivo=wrapped;
    try{renderCorrectivo=wrapped}catch(_){ }
    return true;
  }

  function boot(){
    install();
    let n=0;const timer=setInterval(()=>{install();if(++n>80)clearInterval(timer)},125);
    window.addEventListener('stainher:modules-ready',()=>setTimeout(install,0));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();