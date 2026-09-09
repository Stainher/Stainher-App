/* Stainher App V15.24 r18 · contraste de Turnos para tema claro.
 * Capa visual y de compatibilidad de presentación; no modifica registros de turnos ni novedades.
 */
(function installTurnosLightContrastR18(){
  'use strict';
  if(window.__STAINHER_TURNOS_LIGHT_CONTRAST_R18__)return;
  window.__STAINHER_TURNOS_LIGHT_CONTRAST_R18__=true;
  const id='stainher-turnos-light-contrast-r18-style';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    html[data-theme="light"] #page-turnos .r18-matrix{
      background:#fff!important;
      border-color:#b9c5d3!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix th,
    html[data-theme="light"] #page-turnos .r18-matrix td{
      border-color:#cbd5e1!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix th{
      background:#e7edf4!important;
      color:#344054!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix th:first-child,
    html[data-theme="light"] #page-turnos .r18-matrix td:first-child{
      background:#f8fafc!important;
      color:#182230!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix td:first-child b,
    html[data-theme="light"] #page-turnos .r18-mobile-person > b{
      color:#101828!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix td:first-child small,
    html[data-theme="light"] #page-turnos .r18-mobile-person > small{
      color:#5b6878!important;
    }
    html[data-theme="light"] #page-turnos .r18-shift{
      box-shadow:0 1px 1px rgba(16,24,40,.06);
      font-weight:800!important;
    }
    html[data-theme="light"] #page-turnos .r18-shift.A{
      color:#155eef!important;
      background:#e8f1ff!important;
      border-color:#72a7df!important;
    }
    html[data-theme="light"] #page-turnos .r18-shift.C{
      color:#067647!important;
      background:#e7f8f1!important;
      border-color:#69b99d!important;
    }
    html[data-theme="light"] #page-turnos .r18-shift.L{
      color:#475467!important;
      background:#eef2f6!important;
      border-color:#98a2b3!important;
    }
    html[data-theme="light"] #page-turnos .r18-event-code{
      color:#344054!important;
      background:#f8fafc!important;
      border-color:#98a2b3!important;
      font-weight:800!important;
      box-shadow:0 1px 1px rgba(16,24,40,.04);
    }
    html[data-theme="light"] #page-turnos .r18-turn-cell.editable:hover,
    html[data-theme="light"] #page-turnos .r18-mobile-day.editable:hover{
      background:#f4f8fd!important;
      outline-color:#3b82f6!important;
    }
    html[data-theme="light"] #page-turnos .r18-mobile-person,
    html[data-theme="light"] #page-turnos .r18-mobile-day,
    html[data-theme="light"] #page-turnos .r18-event-row{
      background:#fff!important;
      color:#182230!important;
      border-color:#cbd5e1!important;
    }
  `;
  document.head.appendChild(style);
})();

/* V15.24 r30 · restaura la glosa y la superposición visible de novedades.
 * El renderizador directo r18 reemplaza al render histórico después de que se
 * instala la antigua glosa. Esta capa vuelve a colocar la glosa sobre la vista
 * activa y reconstruye los badges desde los datos ya autorizados para el perfil.
 * También recupera novedades históricas de un solo día con fecha_fin NULL,
 * respetando la visibilidad de malla publicada para perfiles sin edición.
 */
(function installTurnosGlossEventsR30(){
  'use strict';
  if(window.__STAINHER_TURNOS_GLOSS_EVENTS_R30__)return;
  window.__STAINHER_TURNOS_GLOSS_EVENTS_R30__=true;

  const BUILD='20260909-r30-turn-gloss-events';
  const LABELS={
    encierro_planificado:'Encierro dentro de turno',encierro_no_planificado:'Encierro fuera de turno',
    suspendido_encierro:'Suspendido por encierro',dia_adicional:'Día adicional',hora_extra:'Horas extra',
    feriado:'Horas feriado',vacaciones:'Vacaciones',licencia_medica:'Licencia médica',
    permiso:'Permiso no remunerado',permiso_ausencia:'Permiso no remunerado',falta:'Falta / ausencia',
    ausencia:'Ausencia',capacitacion:'Capacitación',otro:'Otra novedad',encierro:'Encierro'
  };
  const CODES={
    encierro_planificado:'ET',encierro_no_planificado:'EF',suspendido_encierro:'SE',dia_adicional:'DA',
    hora_extra:'HE',feriado:'HF',vacaciones:'V',licencia_medica:'LM',permiso:'P',permiso_ausencia:'P',
    falta:'F',ausencia:'F',capacitacion:'CAP',otro:'EV',encierro:'ENC'
  };
  const LEGEND=[
    ['A','Turno A','shift'],['C','Turno C','shift'],['L','Libre','shift'],
    ['ET','Encierro dentro de turno'],['EF','Encierro fuera de turno'],['SE','Suspendido por encierro'],
    ['DA','Día adicional'],['HE','Horas extra'],['HF','Horas feriado'],['V','Vacaciones'],
    ['LM','Licencia médica'],['P','Permiso no remunerado'],['F','Falta / ausencia'],
    ['CAP','Capacitación'],['EV','Otra novedad']
  ];

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const label=type=>LABELS[String(type||'')]||window.v1520TurnTypeLabel?.(type)||String(type||'Evento').replaceAll('_',' ');
  const code=type=>CODES[String(type||'')]||window.v1520TurnTypeShort?.(type)||'EV';
  const eventEnd=ev=>String(ev?.fecha_fin||ev?.fecha_inicio||'');
  const eventCovers=(ev,date)=>String(ev?.fecha_inicio||'')<=date&&eventEnd(ev)>=date;
  const canSeeDrafts=()=>{
    try{return !!window.isAdmin?.()||(!!window.v1520CanEdit?.('turnos')&&!window.state?.v15PreviewRole)}catch(_){return false}
  };

  function mountR30Style(){
    if(document.getElementById('stainher-turnos-gloss-events-r30-style'))return;
    const style=document.createElement('style');style.id='stainher-turnos-gloss-events-r30-style';style.textContent=`
      #page-turnos .r30-turn-legend{display:flex;align-items:center;gap:7px 10px;flex-wrap:wrap;margin:4px 0 12px;padding:9px 10px;border:1px solid var(--line);border-radius:10px;background:var(--panel,#0d141c);color:var(--muted);font-size:9px}
      #page-turnos .r30-turn-legend>strong{color:var(--text,#fff);font-size:10px;font-weight:600!important;margin-right:2px}
      #page-turnos .r30-turn-legend-item{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
      #page-turnos .r30-turn-legend .r18-shift{min-width:23px;height:20px;font-size:8px}
      #page-turnos .r30-turn-legend .r18-event-code{min-width:23px;min-height:18px;font-size:7px}
      #page-turnos .r30-restored-events{display:flex!important;gap:2px!important;justify-content:center!important;align-items:center!important;flex-wrap:wrap!important;margin-top:3px!important;max-width:100%!important}
      #page-turnos .r30-restored-events .r18-event-code{min-width:20px!important;max-width:100%!important;padding:1px 3px!important;line-height:1.15!important;white-space:nowrap!important}
      #page-turnos .r18-turn-cell,#page-turnos .r18-mobile-day{height:auto!important;min-height:42px!important;vertical-align:middle!important}
      html[data-theme="light"] #page-turnos .r30-turn-legend{background:#fff!important;color:#475467!important;border-color:#cbd5e1!important}
      html[data-theme="light"] #page-turnos .r30-turn-legend>strong{color:#182230!important}
      @media(max-width:900px){#page-turnos .r30-turn-legend{gap:6px 8px;padding:8px;font-size:8px}#page-turnos .r30-turn-legend-item{white-space:normal}}
    `;document.head.appendChild(style);
  }

  function legendHtml(){
    return `<div class="r30-turn-legend" data-r30-turn-legend><strong>Glosa:</strong>${LEGEND.map(([key,text,kind])=>`<span class="r30-turn-legend-item">${kind==='shift'?`<i class="r18-shift ${esc(key)}">${esc(key)}</i>`:`<i class="r18-event-code">${esc(key)}</i>`}<span>${esc(text)}</span></span>`).join('')}</div>`;
  }

  function eventBadge(ev){
    const c=code(ev?.tipo),qty=Number(ev?.cantidad||0),isHours=['hora_extra','feriado'].includes(String(ev?.tipo||''));
    const suffix=isHours&&qty?` ${Number.isInteger(qty)?qty:qty.toFixed(1)}h`:'';
    const detail=[label(ev?.tipo),ev?.motivo||ev?.observacion||'',isHours&&qty?`${qty} horas`:'' ].filter(Boolean).join(' · ');
    return `<span class="r18-event-code" title="${esc(detail)}">${esc(c+suffix)}</span>`;
  }

  function restoreLegend(page){
    if(!page||page.querySelector('[data-r30-turn-legend]'))return;
    const tabs=page.querySelector('.r18-turn-tabs');
    if(tabs)tabs.insertAdjacentHTML('afterend',legendHtml());
    else page.querySelector('[data-r18-content]')?.insertAdjacentHTML('beforebegin',legendHtml());
  }

  function restoreCellEvents(page){
    const data=window.state?.v1520TurnData||window.state?.v1512TurnData;
    if(!page||!data)return;
    const events=Array.isArray(data.events)?data.events:[];
    page.querySelectorAll('[data-r18-uid][data-r18-date]').forEach(cell=>{
      const uid=String(cell.dataset.r18Uid||''),date=String(cell.dataset.r18Date||'');
      const dayEvents=events.filter(ev=>String(ev.user_id)===uid&&eventCovers(ev,date));
      cell.querySelectorAll(':scope > .r18-cell-events').forEach(node=>node.remove());
      if(!dayEvents.length)return;
      const host=document.createElement('div');host.className='r18-cell-events r30-restored-events';
      host.innerHTML=dayEvents.map(eventBadge).join('');cell.appendChild(host);
    });
  }

  let decorating=false;
  function decorate(){
    if(decorating)return;decorating=true;
    requestAnimationFrame(()=>{
      try{const page=document.getElementById('page-turnos');if(page){restoreLegend(page);restoreCellEvents(page)}}finally{decorating=false}
    });
  }

  function mergeMissingSingleDayEvents(data,rows){
    if(!data||!Array.isArray(rows)||!rows.length)return data;
    const ids=new Set((data.people||[]).map(p=>String(p.user_id||'')).filter(Boolean));
    const published=new Set((data.shifts||[]).map(sh=>`${sh.user_id}|${sh.fecha}`));
    const allowDrafts=canSeeDrafts();
    const existing=new Set((data.events||[]).map(ev=>String(ev.id||`${ev.user_id}|${ev.tipo}|${ev.fecha_inicio}|${ev.created_at||''}`)));
    const extra=rows.filter(ev=>ids.has(String(ev.user_id))&&(allowDrafts||published.has(`${ev.user_id}|${ev.fecha_inicio}`))).filter(ev=>{
      const key=String(ev.id||`${ev.user_id}|${ev.tipo}|${ev.fecha_inicio}|${ev.created_at||''}`);if(existing.has(key))return false;existing.add(key);return true;
    });
    if(extra.length)data.events=[...(data.events||[]),...extra];
    return data;
  }

  function patchLoader(){
    const current=window.v1520LoadTurnData;
    if(typeof current!=='function'||current.__r30NullEndEvents)return;
    const wrapped=async function(){
      const data=await current.apply(this,arguments);
      try{
        if(!window.sb||!data?.range)return data;
        const ids=(data.people||[]).map(p=>String(p.user_id||'')).filter(Boolean);if(!ids.length)return data;
        const query=await window.sb.from('turnos_novedades_v15').select('*').is('fecha_fin',null).gte('fecha_inicio',data.range.start).lte('fecha_inicio',data.range.end).in('user_id',ids).order('fecha_inicio');
        if(!query.error)mergeMissingSingleDayEvents(data,query.data||[]);
      }catch(error){console.warn('[Turnos r30] recuperación eventos históricos',error)}
      return data;
    };
    wrapped.__r30NullEndEvents=true;wrapped.__base=current;window.v1520LoadTurnData=wrapped;
  }

  function boot(){
    mountR30Style();patchLoader();decorate();
    const attach=()=>{const page=document.getElementById('page-turnos');if(page&&!page.dataset.r30Observer){page.dataset.r30Observer='1';new MutationObserver(decorate).observe(page,{childList:true,subtree:true})}};
    attach();setTimeout(()=>{patchLoader();attach();decorate()},900);setTimeout(()=>{patchLoader();attach();decorate()},1800);
    window.addEventListener('stainher:modules-ready',()=>setTimeout(()=>{patchLoader();attach();decorate()},0));
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.STAINHER_TURNOS_GLOSS_EVENTS={build:BUILD,ready:true};
})();
