/* Stainher App V15.24 r18 · Feriados automáticos en Turnos e Informe mensual.
 * - Destaca feriados de feriados_vacaciones en la malla.
 * - Calcula HF por solapamiento real del turno con el día feriado:
 *   A del feriado = 12 h (07:00-19:00)
 *   C iniciado el día anterior = 7 h (00:00-07:00)
 *   C iniciado el feriado = 5 h (19:00-00:00)
 *   C antes y después del feriado = 12 h.
 * - No duplica un día que ya tenga un evento HF manual: el registro manual prevalece.
 */
(function installStainherHolidayHoursR18(){
  'use strict';
  if(window.__STAINHER_HOLIDAY_HOURS_R18__)return;
  window.__STAINHER_HOLIDAY_HOURS_R18__=true;

  const BUILD='20260904-r18-auto-holiday-hours';
  const holidayCache=new Map();
  let observer=null,decorateQueued=false;

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const pad=n=>String(n).padStart(2,'0');
  const iso=(y,m,d)=>`${y}-${pad(m)}-${pad(d)}`;
  const addDays=(date,delta)=>{const d=new Date(String(date)+'T12:00:00');d.setDate(d.getDate()+delta);return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`};
  const fmtDate=value=>window.v1520Date?.(value)||window.fmtDateCL?.(value)||String(value||'');

  function mountStyle(){
    if(document.getElementById('stainher-turnos-holidays-r18-style'))return;
    const s=document.createElement('style');s.id='stainher-turnos-holidays-r18-style';s.textContent=`
      #page-turnos .r18-matrix thead th[data-r18-holiday]{background:rgba(245,158,11,.18)!important;color:#fbbf24!important;box-shadow:inset 0 -2px 0 #f59e0b}
      #page-turnos .r18-matrix thead th[data-r18-holiday]::after{content:'F';display:inline-flex;align-items:center;justify-content:center;margin-left:2px;min-width:12px;height:12px;border-radius:4px;background:#f59e0b;color:#111827;font-size:7px;font-weight:900;vertical-align:top}
      #page-turnos .r18-turn-cell[data-r18-holiday],#page-turnos .r18-mobile-day[data-r18-holiday]{background:rgba(245,158,11,.08)!important;box-shadow:inset 0 0 0 1px rgba(245,158,11,.38)}
      #page-turnos .r18-mobile-day[data-r18-holiday]>b:first-child{color:#fbbf24!important}
      .v1524-calendar-day[data-r18-holiday],.v1524-full-calendar th[data-r18-holiday],.v1524-full-calendar td[data-r18-holiday]{background:rgba(245,158,11,.10)!important;box-shadow:inset 0 0 0 1px rgba(245,158,11,.32)}
      .v1524-calendar-day[data-r18-holiday] .v1524-calendar-day-number,.v1524-full-calendar th[data-r18-holiday]{color:#fbbf24!important;font-weight:700!important}
      .r18-auto-holiday-note{margin:10px 0;padding:9px 11px;border:1px solid rgba(245,158,11,.38);border-radius:9px;background:rgba(245,158,11,.08);font-size:10px;line-height:1.45;color:var(--text,#e5edf5)}
      .r18-auto-holiday-note b{color:#fbbf24}
      .r18-auto-holiday-row td{background:rgba(245,158,11,.05)}
      html[data-theme="light"] #page-turnos .r18-matrix thead th[data-r18-holiday]{background:#fff0c2!important;color:#8a4b00!important;box-shadow:inset 0 -2px 0 #d97706}
      html[data-theme="light"] #page-turnos .r18-turn-cell[data-r18-holiday],html[data-theme="light"] #page-turnos .r18-mobile-day[data-r18-holiday],html[data-theme="light"] .v1524-calendar-day[data-r18-holiday],html[data-theme="light"] .v1524-full-calendar th[data-r18-holiday],html[data-theme="light"] .v1524-full-calendar td[data-r18-holiday]{background:#fff8e7!important;box-shadow:inset 0 0 0 1px #e0aa54}
      html[data-theme="light"] #page-turnos .r18-mobile-day[data-r18-holiday]>b:first-child,html[data-theme="light"] .v1524-calendar-day[data-r18-holiday] .v1524-calendar-day-number,html[data-theme="light"] .v1524-full-calendar th[data-r18-holiday]{color:#8a4b00!important}
      html[data-theme="light"] .r18-auto-holiday-note{background:#fff8e7;color:#3b2a12;border-color:#e0aa54}
      html[data-theme="light"] .r18-auto-holiday-note b{color:#8a4b00}
    `;document.head.appendChild(s);
  }

  async function loadHolidays(start,end){
    const key=`${start}|${end}`;
    if(holidayCache.has(key))return holidayCache.get(key);
    if(!window.sb)return [];
    const q=await window.sb.from('feriados_vacaciones').select('fecha,nombre').gte('fecha',start).lte('fecha',end).order('fecha',{ascending:true});
    if(q.error){console.warn('[r18 feriados] No se pudo leer feriados_vacaciones',q.error);return []}
    const rows=(q.data||[]).map(x=>({fecha:String(x.fecha),nombre:String(x.nombre||'Feriado')}));
    holidayCache.set(key,rows);return rows;
  }

  async function decorateTurnos(){
    const page=document.getElementById('page-turnos');if(!page||!window.sb)return;
    const y=Number(window.state?.turnYearV1512||new Date().getFullYear()),m=Number(window.state?.turnMonthV1512||new Date().getMonth()+1),days=new Date(y,m,0).getDate();
    const start=iso(y,m,1),end=iso(y,m,days),holidays=await loadHolidays(start,end),map=new Map(holidays.map(h=>[h.fecha,h.nombre]));
    page.querySelectorAll('[data-r18-date]').forEach(node=>{
      const name=map.get(String(node.dataset.r18Date||''));
      if(name){node.dataset.r18Holiday=name;node.title=name}else{delete node.dataset.r18Holiday;if(node.title&&holidays.some(h=>h.nombre===node.title))node.removeAttribute('title')}
    });
    const heads=page.querySelectorAll('.r18-matrix thead th');
    heads.forEach((th,index)=>{
      if(index===0)return;
      const date=iso(y,m,index),name=map.get(date);
      if(name){th.dataset.r18Holiday=name;th.title=name}else{delete th.dataset.r18Holiday;th.removeAttribute('title')}
    });
  }

  function scheduleTurnDecoration(){
    if(decorateQueued)return;decorateQueued=true;
    requestAnimationFrame(()=>{decorateQueued=false;decorateTurnos().catch(err=>console.warn('[r18 feriados] decoración',err))});
  }

  function observeTurnos(){
    const page=document.getElementById('page-turnos');if(!page||observer)return;
    observer=new MutationObserver(scheduleTurnDecoration);
    observer.observe(page,{childList:true,subtree:true});
    scheduleTurnDecoration();
  }

  function eventCovers(ev,date){
    const start=String(ev?.fecha_inicio||''),end=String(ev?.fecha_fin||ev?.fecha_inicio||'');
    return !!start&&start<=date&&end>=date;
  }

  function holidaySegments(uid,date,shiftMap){
    const prev=shiftMap.get(`${uid}|${addDays(date,-1)}`)||'',cur=shiftMap.get(`${uid}|${date}`)||'',segments=[];
    if(prev==='C')segments.push({hours:7,start:'00:00',end:'07:00',turno:'C',detalle:'Turno C iniciado el día anterior'});
    if(cur==='A')segments.push({hours:12,start:'07:00',end:'19:00',turno:'A',detalle:'Turno A del día feriado'});
    else if(cur==='C')segments.push({hours:5,start:'19:00',end:'00:00',turno:'C',detalle:'Turno C iniciado el día feriado'});
    return segments;
  }

  function syntheticEvent(row,holiday,segment,index){
    return {
      id:`r18-auto-hf-${row.uid}-${holiday.fecha}-${index}`,
      user_id:row.uid,
      tipo:'feriado',
      fecha_inicio:holiday.fecha,
      fecha_fin:holiday.fecha,
      cantidad:segment.hours,
      unidad:'horas',
      turno_base:segment.turno,
      hora_inicio:segment.start,
      hora_fin:segment.end,
      motivo:`${holiday.nombre} · cálculo automático`,
      observacion:`${segment.detalle} · ${segment.start} a ${segment.end}`,
      __r18AutoHoliday:true
    };
  }

  async function applyAutomaticHours(r){
    if(!r||r.__r18AutoHolidayApplied)return r;
    const prevStart=addDays(r.range.start,-1);
    const [holidays,shiftQuery]=await Promise.all([
      loadHolidays(r.range.start,r.range.end),
      window.sb.from('turnos_malla_v1512').select('user_id,fecha,turno_base').gte('fecha',prevStart).lte('fecha',r.range.end)
    ]);
    if(shiftQuery.error)throw shiftQuery.error;
    const shiftMap=new Map((shiftQuery.data||[]).map(x=>[`${x.user_id}|${x.fecha}`,String(x.turno_base||'')]));
    const autoEvents=[];
    for(const row of r.rows||[]){
      row.eventos=Array.isArray(row.eventos)?row.eventos:[];
      let autoHours=0;
      for(const holiday of holidays){
        const manual=row.eventos.some(ev=>ev.tipo==='feriado'&&!ev.__r18AutoHoliday&&eventCovers(ev,holiday.fecha));
        if(manual)continue;
        const segments=holidaySegments(String(row.uid),holiday.fecha,shiftMap);
        segments.forEach((segment,index)=>{
          autoHours+=segment.hours;
          const ev=syntheticEvent(row,holiday,segment,index);row.eventos.push(ev);autoEvents.push(ev);
        });
      }
      row.hf=Number(row.hf||0)+autoHours;
      row.eventos.sort((a,b)=>String(a.fecha_inicio||'').localeCompare(String(b.fecha_inicio||''))||String(a.hora_inicio||'').localeCompare(String(b.hora_inicio||'')));
    }
    r.total.hf=(r.rows||[]).reduce((sum,row)=>sum+Number(row.hf||0),0);
    r.__r18Holidays=holidays;r.__r18AutoHolidayEvents=autoEvents;r.__r18AutoHolidayApplied=true;
    return r;
  }

  function decorateReportCalendars(r){
    if(!r)return;
    const holidays=new Map((r.__r18Holidays||[]).map(h=>[h.fecha,h.nombre]));
    document.querySelectorAll('.v1524-calendar-day').forEach(day=>{
      const n=Number(day.querySelector('.v1524-calendar-day-number')?.textContent||0);if(!n)return;
      const date=iso(r.y,r.m,n),name=holidays.get(date);if(name){day.dataset.r18Holiday=name;day.title=name}else{delete day.dataset.r18Holiday}
    });
    const table=document.querySelector('.v1524-full-calendar table');if(table){
      const heads=table.querySelectorAll('thead th');heads.forEach((th,index)=>{if(index===0)return;const date=iso(r.y,r.m,index),name=holidays.get(date);if(name){th.dataset.r18Holiday=name;th.title=name;table.querySelectorAll(`tbody tr td:nth-child(${index+1})`).forEach(td=>{td.dataset.r18Holiday=name;td.title=name})}});
    }
  }

  function patchReportDom(r){
    const modal=[...document.querySelectorAll('#modalRoot .modal')].find(x=>/Informe mensual/i.test(x.textContent||''));if(!modal)return;
    const table=modal.querySelector('#v1524ReportSummaryTable');
    if(table){
      const heads=[...table.querySelectorAll('thead th')],hfIndex=heads.findIndex(th=>/Horas feriado/i.test(th.textContent||''));
      if(hfIndex>=0)table.querySelectorAll('tbody tr[data-v1524-report-user]').forEach(tr=>{const row=(r.rows||[]).find(x=>String(x.uid)===String(tr.dataset.v1524ReportUser));if(row&&tr.children[hfIndex])tr.children[hfIndex].textContent=`${Number(row.hf||0).toFixed(1)} h`});
      if(!modal.querySelector('.r18-auto-holiday-note'))table.closest('.v1524-report-summary')?.insertAdjacentHTML('beforebegin','<div class="r18-auto-holiday-note"><b>HF automáticas:</b> Turno A = 12 h (07:00–19:00). Turno C suma 7 h si venía trabajando desde la noche anterior (00:00–07:00) y 5 h si inicia turno esa noche (19:00–00:00). Si está en C antes y después del feriado, totaliza 12 h. Un registro HF manual existente para ese día prevalece y evita duplicación.</div>');
    }
    (r.__r18AutoHolidayEvents||[]).forEach(ev=>{
      const group=modal.querySelector(`.v1524-detail-group[data-v1524-report-user="${CSS.escape(String(ev.user_id))}"]`),tbody=group?.querySelector('tbody');if(!tbody)return;
      const tr=document.createElement('tr');tr.className='r18-auto-holiday-row';tr.innerHTML=`<td>${esc(fmtDate(ev.fecha_inicio))}</td><td>${esc(ev.turno_base||'—')}</td><td>Horas feriado · automático</td><td>${Number(ev.cantidad||0).toFixed(1)} h</td><td>${esc(ev.hora_inicio)} a ${esc(ev.hora_fin)}</td><td>${esc(ev.motivo)} · ${esc(ev.observacion)}</td>`;tbody.appendChild(tr);
    });
    const selected=String(window.state?.v1524TurnReportUser||'');
    try{window.v1524FilterTurnReport?.(selected)}catch(_){ }
    decorateReportCalendars(r);
  }

  function installReportFilterDecorator(){
    const current=window.v1524FilterTurnReport;if(typeof current!=='function'||current.__r18HolidayDecorator)return;
    const wrapped=function(){const out=current.apply(this,arguments);setTimeout(()=>decorateReportCalendars(window.state?.v1516TurnReport),0);return out};
    wrapped.__r18HolidayDecorator=true;wrapped.__base=current;window.v1524FilterTurnReport=wrapped;
  }

  function chainHasFlag(fn,flag){const seen=new Set();let cur=fn;while(typeof cur==='function'&&!seen.has(cur)){if(cur[flag])return true;seen.add(cur);cur=cur.__base}return false}

  function installReportWrapper(){
    const current=window.v1516OpenTurnMonthlyReport;if(typeof current!=='function'||chainHasFlag(current,'__r18HolidayHours'))return;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      try{
        const r=window.state?.v1516TurnReport;if(r){await applyAutomaticHours(r);installReportFilterDecorator();patchReportDom(r)}
      }catch(error){console.error('[r18 HF automático]',error);window.toast?.('El informe se generó, pero no fue posible calcular automáticamente las horas de feriado.','error')}
      return out;
    };
    wrapped.__r18HolidayHours=true;wrapped.__base=current;window.v1516OpenTurnMonthlyReport=wrapped;
    if(typeof window.v1520TurnReport==='function')window.v1520TurnReport=wrapped;
  }

  function boot(){
    mountStyle();observeTurnos();installReportWrapper();installReportFilterDecorator();
    window.addEventListener('stainher:modules-ready',()=>{installReportWrapper();installReportFilterDecorator();observeTurnos();scheduleTurnDecoration()});
    let tries=0;const retry=setInterval(()=>{installReportWrapper();installReportFilterDecorator();observeTurnos();if(++tries>30)clearInterval(retry)},250);
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();