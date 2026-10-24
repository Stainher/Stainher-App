/* Stainher App V15.24 · R126 · Informe mensual de Turnos
 * - Restaura la columna Suspendido por encierro en resumen y totales.
 * - Mantiene alineación exacta entre encabezado, filas y TOTAL SELECCIÓN.
 * - Agrega SE a Totales operativos y exportaciones.
 * - Corrige nombres reales usando la misma dotación visible de la malla.
 */
(function installV1524ReportHotfixR126(){
  if(window.__STAINHER_V1524_REPORT_HOTFIX_R126__) return;
  window.__STAINHER_V1524_REPORT_HOTFIX_R126__=true;

  const esc=v=>typeof window.esc==='function'?window.esc(v==null?'':String(v)):String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fmt=n=>Number(n||0).toLocaleString('es-CL',{maximumFractionDigits:1});
  const eventLabel=t=>window.v1520TurnTypeLabel?.(t)||String(t||'').replaceAll('_',' ');
  const fmtDate=v=>window.v1520Date?.(v)||window.fmtDateCL?.(v)||String(v||'');
  const evRange=ev=>{const a=fmtDate(ev.fecha_inicio),b=fmtDate(ev.fecha_fin||ev.fecha_inicio);return ev.fecha_fin&&ev.fecha_fin!==ev.fecha_inicio?`${a} al ${b}`:a};
  const qty=ev=>{const n=Number(ev.cantidad||0);return n?`${fmt(n)} ${ev.unidad||''}`.trim():'—'};
  const hours=ev=>{const a=String(ev.hora_inicio||'').slice(0,5),b=String(ev.hora_fin||'').slice(0,5);return a||b?`${a||'—'} a ${b||'—'}`:'—'};

  function totals(r){return [
    {code:'ET',label:'Encierro dentro de turno',value:r?.total?.encDentro||0,unit:'eventos'},
    {code:'EF',label:'Encierro fuera de turno',value:r?.total?.encFuera||0,unit:'eventos'},
    {code:'SE',label:'Suspendido por encierro',value:r?.total?.suspendido||0,unit:'eventos'},
    {code:'DA',label:'Día extra (DA)',value:r?.total?.diasAdicionales||0,unit:'días'},
    {code:'HE',label:'Horas extra',value:r?.total?.he||0,unit:'h'},
    {code:'HF',label:'Horas feriado',value:(r?.rows||[]).reduce((sum,row)=>sum+Number(row.hf||0),0),unit:'h'}
  ];}

  function mountStyle(){
    if(document.getElementById('stainher-v1524-report-hotfix4-style')) return;
    const s=document.createElement('style');s.id='stainher-v1524-report-hotfix4-style';s.textContent=`
      /* R248: readable row headings and footer in light/modern themes. */
      html:is([data-theme="light"],[data-theme="modern"]) body .v1524-report-summary table tbody tr > :first-child,
      html:is([data-theme="light"],[data-theme="modern"]) body .v1524-report-summary table tfoot tr > :first-child{
        color:#f4f8fc!important;-webkit-text-fill-color:#f4f8fc!important;
        background:#192b3d!important;font-weight:600!important;
      }
      html:is([data-theme="light"],[data-theme="modern"]) body .v1524-report-summary table tfoot tr > *{
        color:#f4f8fc!important;-webkit-text-fill-color:#f4f8fc!important;
        background:#192b3d!important;font-weight:700!important;
      }
      /* R255: light detail rows with readable foreground regardless of inherited dark theme. */
      #modalRoot .v1524-detail-group table tbody tr,
      #modalRoot .v1524-detail-group table tbody td{
        background:#f7fafc!important;color:#203a53!important;
        -webkit-text-fill-color:#203a53!important;
      }
      #modalRoot .v1524-detail-group table tbody tr:nth-child(even),
      #modalRoot .v1524-detail-group table tbody tr:nth-child(even) td{
        background:#edf4fa!important;color:#203a53!important;
        -webkit-text-fill-color:#203a53!important;
      }
      #modalRoot .v1524-detail-group table tbody td,
      #modalRoot .v1524-detail-group table tbody td *{
        color:#203a53!important;-webkit-text-fill-color:#203a53!important;
      }
      #modalRoot .v1524-detail-group table thead th{
        background:#dfeaf3!important;color:#244660!important;
        -webkit-text-fill-color:#244660!important;
      }
      /* R255: readable report detail tables. */
      #modalRoot .v1524-readable-event-table{background:#f8fafc!important;color:#17324d!important}
      #modalRoot .v1524-readable-event-table :is(tbody,tr,td){background:#f8fafc!important;color:#17324d!important;-webkit-text-fill-color:#17324d!important}
      #modalRoot .v1524-readable-event-table tbody tr:nth-child(even) td{background:#edf4fa!important}
      #modalRoot .v1524-readable-event-table :is(th,thead tr,thead td){background:#dce9f3!important;color:#24445f!important;-webkit-text-fill-color:#24445f!important}
      #modalRoot .v1524-readable-event-table td{border-color:#c6d6e3!important}
      /* R256: unificar contraste de todas las tablas del informe mensual. */
      #modalRoot .v1524-turn-report-readable table tbody tr:not(.v1524-report-total-row) td,
      #modalRoot .v1524-turn-report-readable table tbody tr:not(.v1524-report-total-row) th{
        background:#f7fafc!important;color:#203a53!important;-webkit-text-fill-color:#203a53!important;
      }
      #modalRoot .v1524-turn-report-readable table tbody tr:not(.v1524-report-total-row):nth-child(even) > :is(td,th){
        background:#edf4fa!important;
      }
      #modalRoot .v1524-turn-report-readable table tbody tr:not(.v1524-report-total-row) :is(td,th) *{
        color:#203a53!important;-webkit-text-fill-color:#203a53!important;
      }
      #modalRoot .v1524-turn-report-readable table thead :is(th,td){
        background:#dce9f3!important;color:#244660!important;-webkit-text-fill-color:#244660!important;
      }
      #modalRoot .v1524-turn-report-readable table .v1524-report-total-row > :is(th,td){
        background:#192b3d!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-weight:700!important;
      }
      #modalRoot .v1524-turn-report-readable table :is(th,td){border-color:#c6d6e3!important}
      /* R260: explicit pale blue backgrounds, not dynamic dark-color detection. */
      #modalRoot .v1524-operational-totals,
      #modalRoot .v1524-operational-total,
      #modalRoot .v1524-detail-group > :first-child:not(table),
      #modalRoot .v1524-detail-group > header{
        background:linear-gradient(100deg,#078fa6 0%,#1977ca 100%)!important;
        color:#fff!important;-webkit-text-fill-color:#fff!important;
        border-color:#b7d0e4!important;
      }
      #modalRoot .v1524-operational-totals :is(h5,b,small,span),
      #modalRoot .v1524-operational-total :is(b,small,span),
      #modalRoot .v1524-detail-group > :first-child:not(table) :is(h3,h4,h5,strong,span){
        color:#fff!important;-webkit-text-fill-color:#fff!important;
      }
      .v1524-operational-totals{margin-top:10px;padding:10px;border:1px solid #2d3c4c;border-radius:10px;background:#0d151e}
      .v1524-operational-totals h5{margin:0 0 8px;color:#dbeafe;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
      .v1524-operational-total-grid{display:grid;grid-template-columns:repeat(6,minmax(0,1fr));gap:7px}
      .v1524-operational-total{padding:8px;border:1px solid #2a3745;border-radius:8px;background:#111a24;min-width:0}
      .v1524-operational-total b{display:block;color:#fff;font-size:18px;line-height:1.1}.v1524-operational-total span{display:block;margin-top:3px;color:#9fb2c5;font-size:9px}.v1524-operational-total small{display:inline-block;margin-right:5px;color:#6ee7b7;font-weight:900}
      /* R261: gradient overrides existing dark operational tile declarations. */
      #modalRoot .v1524-operational-total{background:linear-gradient(100deg,#078fa6,#1977ca)!important;border-color:#60b9df!important}
      #modalRoot .v1524-operational-total :is(b,span,small){color:#fff!important;-webkit-text-fill-color:#fff!important}
      @media(max-width:700px){.v1524-operational-total-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;document.head.appendChild(s);
  }

  function ensureSuspendedColumn(table,r){
    if(!table||!r)return;
    const headRow=table.querySelector('thead tr');
    if(!headRow)return;
    let heads=[...headRow.children];
    let idx=heads.findIndex(th=>/suspendido/i.test(th.textContent||''));
    if(idx<0){
      const th=document.createElement('th');
      th.textContent='Suspendido encierro';
      const after=heads.findIndex(th=>/enc\. fuera/i.test(th.textContent||''));
      const at=after>=0?after+1:3;
      headRow.insertBefore(th,headRow.children[at]||null);
      idx=at;
    }
    table.querySelectorAll('tbody tr[data-v1524-report-user]').forEach(tr=>{
      const row=(r.rows||[]).find(x=>String(x.uid)===String(tr.dataset.v1524ReportUser));
      if(!row)return;
      let cell=tr.children[idx];
      const expectedColumns=headRow.children.length;
      if(tr.children.length<expectedColumns){
        cell=document.createElement('td');
        tr.insertBefore(cell,tr.children[idx]||null);
      }
      if(cell)cell.textContent=String(Number(row.suspendido||0));
    });
    const total=(String(window.state?.v1524TurnReportUser||'')
      ?(r.rows||[]).filter(x=>String(x.uid)===String(window.state.v1524TurnReportUser))
      :(r.rows||[])).reduce((sum,row)=>sum+Number(row.suspendido||0),0);
    const foot=table.querySelector('tfoot tr');
    if(foot){
      const expectedColumns=headRow.children.length;
      if(foot.children.length<expectedColumns){
        const td=document.createElement('td');
        foot.insertBefore(td,foot.children[idx]||null);
      }
      if(foot.children[idx])foot.children[idx].textContent=String(total);
    }
  }

  function operationalHtml(r){return `<div class="v1524-operational-totals"><h5>Totales operativos del período</h5><div class="v1524-operational-total-grid">${totals(r).map(x=>`<div class="v1524-operational-total"><small>${x.code}</small><b>${fmt(x.value)}${x.unit==='h'?' h':''}</b><span>${esc(x.label)}</span></div>`).join('')}</div></div>`;}

  function addPerson(map,p){
    if(!p||!p.nombre) return;
    const name=String(p.nombre).trim();
    if(!name) return;
    for(const key of [p.user_id,p.id,p.usuario_id,p.perfil_id]) if(key!=null&&String(key)) map.set(String(key),name);
  }

  function visibleNames(){
    const map=new Map();
    const a=window.state?.v1520TurnData,b=window.state?.v1512TurnData;
    for(const src of [a?.people,a?.allPeople,b?.people,b?.allPeople]) for(const p of src||[]) addPerson(map,p);
    for(const profiles of [a?.profiles,b?.profiles]){
      if(profiles instanceof Map){
        for(const [key,p] of profiles.entries()){
          if(p&&typeof p==='object') addPerson(map,{...p,user_id:p.user_id??key,id:p.id??key});
          else if(typeof p==='string'&&p.trim()) map.set(String(key),p.trim());
        }
      }
    }
    return map;
  }

  function patchReportNames(r,modal){
    if(!r?.rows?.length) return false;
    const names=visibleNames();
    let changed=false;
    for(const row of r.rows){
      const current=String(row.nombre||'').trim();
      const resolved=names.get(String(row.uid||''));
      if(resolved&&(!current||/^usuario$/i.test(current))){row.nombre=resolved;changed=true;}
    }
    if(!changed) return false;

    const select=modal?.querySelector('.v1524-report-user-filter select');
    select?.querySelectorAll('option[value]').forEach(opt=>{
      if(!opt.value) return;
      const row=r.rows.find(x=>String(x.uid)===String(opt.value));
      if(row?.nombre) opt.textContent=row.nombre;
    });

    modal?.querySelectorAll('#v1524ReportSummaryTable tbody tr[data-v1524-report-user]').forEach(tr=>{
      const row=r.rows.find(x=>String(x.uid)===String(tr.dataset.v1524ReportUser));
      if(row?.nombre&&tr.children[0]) tr.children[0].textContent=row.nombre;
    });

    modal?.querySelectorAll('.v1524-detail-group[data-v1524-report-user]').forEach(section=>{
      const row=r.rows.find(x=>String(x.uid)===String(section.dataset.v1524ReportUser));
      const h=section.querySelector('h4');
      if(row?.nombre&&h) h.textContent=`${row.nombre} · ${(row.eventos||[]).length} evento(s)`;
    });

    const selected=String(window.state?.v1524TurnReportUser||'');
    if(typeof window.v1524FilterTurnReport==='function') window.v1524FilterTurnReport(selected);
    return true;
  }


  function countPermitDays(ev,y,m){
    const start=String(ev.fecha_inicio||'').slice(0,10),end=String(ev.fecha_fin||ev.fecha_inicio||'').slice(0,10);
    if(!/^\d{4}-\d{2}-\d{2}$/.test(start)||!/^\d{4}-\d{2}-\d{2}$/.test(end))return 0;
    const a=Date.parse(start+'T12:00:00Z'),b=Date.parse(end+'T12:00:00Z');
    const from=Math.max(a,Date.UTC(y,m-1,1,12)),to=Math.min(b,Date.UTC(y,m,0,12));
    return Math.max(0,Math.round((to-from)/86400000)+1);
  }
  function normalizePermitCounts(r){
    if(!r?.rows?.length||r.__stainherPermitSeparated)return;
    r.__stainherPermitSeparated=true;
    for(const row of r.rows){
      const events=row.eventos||[];
      const permits=events.filter(e=>String(e.tipo||'').toLowerCase()==='permiso');
      row.permisos=permits.reduce((n,e)=>n+countPermitDays(e,r.y,r.m),0);
      const genuineAbsences=events.filter(e=>String(e.tipo||'').toLowerCase()==='falta')
        .reduce((n,e)=>n+countPermitDays(e,r.y,r.m),0);
      // Source eventos take precedence: permission days can never be treated as unjustified absences.
      if(row.permisos>0)row.faltas=genuineAbsences;
    }
    r.total.permisos=r.rows.reduce((n,row)=>n+Number(row.permisos||0),0);
    r.total.faltas=r.rows.reduce((n,row)=>n+Number(row.faltas||0),0);
  }
  function showPermitColumn(modal,r){
    const table=modal?.querySelector('.v1524-report-summary table');if(!table)return;
    const head=table.querySelector('thead tr');if(!head)return;
    let headers=[...head.children],absence=headers.findIndex(c=>/falta|ausencia/i.test(c.textContent||''));
    if(absence<0)return;
    if(!headers.some(c=>/^permisos$/i.test((c.textContent||'').trim()))){
      const th=document.createElement('th');th.textContent='Permisos';head.insertBefore(th,headers[absence]);
    }
    headers=[...head.children];
    const permitIndex=headers.findIndex(c=>/^permisos$/i.test((c.textContent||'').trim()));
    const absenceIndex=headers.findIndex(c=>/falta|ausencia/i.test(c.textContent||''));
    const nameKey=v=>String(v||'').normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').trim().toLowerCase().replace(/\\s+/g,' ');
    const byName=new Map((r.rows||[]).map(row=>[nameKey(row.nombre),row]));
    function put(tr,index,value){
      while(tr.children.length<=index)tr.appendChild(document.createElement('td'));
      const cell=tr.children[index],desired=String(value||0);
      if(cell.textContent!==desired)cell.textContent=desired;
    }
    for(const tr of table.querySelectorAll('tbody tr')){
      const row=(r.rows||[]).find(x=>String(x.uid)===String(tr.dataset.v1524ReportUser))
        ||byName.get(nameKey(tr.children[0]?.textContent));if(!row)continue;
      if(!tr.querySelector('[data-r252-permits],[data-r250-permits]')){
        const cell=document.createElement('td');cell.dataset.r252Permits='1';
        tr.insertBefore(cell,tr.children[permitIndex]||null);
      }
      put(tr,permitIndex,row.permisos);
      put(tr,absenceIndex,row.faltas);
    }
    // Some versions render TOTAL SELECCIÓN in tbody instead of tfoot.
    const totalRows=[...table.querySelectorAll('tfoot tr,tbody tr')]
      .filter(tr=>/TOTAL (SELECCI[OÓ]N|GENERAL)/i.test(tr.children[0]?.textContent||''));
    const permitsTotal=(r.rows||[]).reduce((n,row)=>n+Number(row.permisos||0),0);
    const absencesTotal=(r.rows||[]).reduce((n,row)=>n+Number(row.faltas||0),0);
    r.total.permisos=permitsTotal;
    r.total.faltas=absencesTotal;
    for(const totalRow of totalRows){
      // R254: legacy totals can have a merged/missing cell; rebuild by header names,
      // rather than assuming existing numeric cells correspond to column indices.
      const totalsByHeader={
        'enc. dentro turno':r.total.encDentro,'enc. fuera turno':r.total.encFuera,
        'suspendido encierro':r.total.suspendido,'dias adicionales':r.total.diasAdicionales,
        'horas extra':Number(r.total.he||0).toFixed(1)+' h',
        'horas feriado':Number(r.total.hf||0).toFixed(1)+' h',
        'vacaciones':r.total.vacaciones,'lic. medica':r.total.licencias,
        'permisos':permitsTotal,'falta / ausencia':absencesTotal,'otros':r.total.otros
      };
      const values=headers.map((th,index)=>{
        if(index===0)return 'TOTAL SELECCIÓN';
        const key=nameKey(th.textContent);
        if(key in totalsByHeader)return String(totalsByHeader[key]??0);
        if(key.includes('enc.')&&key.includes('dentro'))return String(r.total.encDentro||0);
        if(key.includes('enc.')&&key.includes('fuera'))return String(r.total.encFuera||0);
        return String(totalRow.children[index]?.textContent||'0');
      });
      const same=totalRow.children.length===values.length&&
        values.every((value,index)=>totalRow.children[index].textContent===value&&totalRow.children[index].colSpan===1);
      if(!same){
        totalRow.replaceChildren(...values.map(value=>{
          const td=document.createElement('td');td.textContent=value;return td;
        }));
      }
    }
  }
  let observedReport=null,reportRepairPending=false;
  function observeReport(modal){
    if(observedReport===modal)return;
    observedReport=modal;
    const summary=modal.querySelector('.v1524-report-summary');
    if(!summary)return;
    new MutationObserver(()=>{
      if(reportRepairPending)return;
      reportRepairPending=true;
      queueMicrotask(()=>{
        reportRepairPending=false;
        const r=window.state?.v1516TurnReport;
        if(r&&modal.isConnected){normalizePermitCounts(r);showPermitColumn(modal,r)}
      });
    }).observe(summary,{childList:true,subtree:true,characterData:true});
  }
  function markReadableEventTables(modal){
    const heading=[...modal.querySelectorAll('h2,h3,h4,h5,h6,strong')].find(n=>/^listado de eventos con detalle$/i.test((n.textContent||'').trim()));
    if(!heading)return;
    modal.querySelectorAll('table').forEach(table=>{if(heading.compareDocumentPosition(table)&Node.DOCUMENT_POSITION_FOLLOWING)table.classList.add('v1524-readable-event-table')});
  }
  function markReportTables(modal){
    if(!modal)return;
    const summary=modal.querySelector('.v1524-report-summary');
    if(summary)summary.classList.add('v1524-turn-report-readable');
    modal.querySelectorAll('.v1524-detail-group').forEach(group=>group.classList.add('v1524-turn-report-readable'));
    modal.querySelectorAll('.v1524-turn-report-readable table tbody tr').forEach(row=>{
      if(/^total\s+(selecci[oó]n|general)/i.test((row.cells?.[0]?.textContent||'').trim()))row.classList.add('v1524-report-total-row');
    });
  }
  function enhanceModal(){
    const r=window.state?.v1516TurnReport;
    if(!r) return;
    const modal=[...document.querySelectorAll('#modalRoot .modal')].find(x=>/Informe mensual/i.test(x.textContent||''));
    if(!modal) return;
    normalizePermitCounts(r);
    patchReportNames(r,modal);
    markReadableEventTables(modal);
    markReportTables(modal);
    const summary=modal.querySelector('.v1524-report-summary');
    ensureSuspendedColumn(summary?.querySelector('table'),r);
    showPermitColumn(modal,r);
    observeReport(modal);
    if(summary){
      const existing=modal.querySelector('.v1524-operational-totals');
      if(!existing)summary.insertAdjacentHTML('afterend',operationalHtml(r));
      else {const replacement=document.createElement('div');replacement.innerHTML=operationalHtml(r);existing.replaceWith(replacement.firstElementChild);}
    }
  }

  function exportExcel(){
    const r=window.state?.v1516TurnReport;if(!r||!window.XLSX)return;normalizePermitCounts(r);
    const summary=[...r.rows.map(x=>({'Colaborador':x.nombre,'Encierro dentro de turno':x.encDentro,'Encierro fuera de turno':x.encFuera,'Suspendido por encierro':x.suspendido,'Día extra (DA)':x.diasAdicionales,'Horas extra':x.he,'Horas feriado':x.hf,'Vacaciones':x.vacaciones,'Licencia médica':x.licencias,'Permisos':x.permisos||0,'Falta / ausencia':x.faltas,'Otros':x.otros})),{'Colaborador':'TOTAL GENERAL','Encierro dentro de turno':r.total.encDentro,'Encierro fuera de turno':r.total.encFuera,'Suspendido por encierro':r.total.suspendido,'Día extra (DA)':r.total.diasAdicionales,'Horas extra':r.total.he,'Horas feriado':r.total.hf,'Vacaciones':r.total.vacaciones,'Licencia médica':r.total.licencias,'Permisos':r.total.permisos||0,'Falta / ausencia':r.total.faltas,'Otros':r.total.otros}];
    const ops=totals(r).map(x=>({'Código':x.code,'Evento':x.label,'Total':x.value,'Unidad':x.unit}));
    const detail=[];r.rows.forEach(g=>g.eventos.forEach(ev=>detail.push({'Colaborador':g.nombre,'Fecha / rango':evRange(ev),'Turno base':ev.turno_base||'','Tipo de evento':eventLabel(ev.tipo),'Cantidad':Number(ev.cantidad||0),'Unidad':ev.unidad||'','Hora inicio':String(ev.hora_inicio||'').slice(0,5),'Hora término':String(ev.hora_fin||'').slice(0,5),'Detalle / motivo':ev.motivo||ev.observacion||''})));
    const wb=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(summary),'Resumen por colaborador');window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(ops),'Totales operativos');window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(detail),'Detalle agrupado');window.XLSX.writeFile(wb,`Turnos_Novedades_${r.y}_${String(r.m).padStart(2,'0')}.xlsx`);
  }

  function exportPdf(){
    const r=window.state?.v1516TurnReport;normalizePermitCounts(r);const C=typeof window.ensurePdf==='function'?window.ensurePdf():null;if(!r||!C)return window.toast?.('No se pudo cargar el generador PDF.','error');
    const doc=new C({orientation:'landscape',unit:'mm',format:'a4'}),month=window.MONTHS_ES?.[r.m-1]||String(r.m);window.pdfHeader?.(doc,'Informe Mensual de Turnos y Novedades',`${month} ${r.y}`);doc.setFontSize(10);doc.text('Resumen de eventos por colaborador',14,43);
    doc.autoTable({startY:47,head:[['Colaborador','Enc. dentro','Enc. fuera','Suspendido','Día extra (DA)','H. extra','H. feriado','Vac.','Lic. med.','Permisos','Faltas','Otros']],body:[...r.rows.map(x=>[x.nombre,x.encDentro,x.encFuera,x.suspendido,x.diasAdicionales,x.he.toFixed(1),x.hf.toFixed(1),x.vacaciones,x.licencias,x.permisos||0,x.faltas,x.otros]),['TOTAL GENERAL',r.total.encDentro,r.total.encFuera,r.total.suspendido,r.total.diasAdicionales,r.total.he.toFixed(1),r.total.hf.toFixed(1),r.total.vacaciones,r.total.licencias,r.total.permisos||0,r.total.faltas,r.total.otros]],styles:{fontSize:6.7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});
    let y=(doc.lastAutoTable?.finalY||70)+7;doc.setFontSize(9);doc.setFont(undefined,'bold');doc.text('Totales operativos del período',14,y);doc.setFont(undefined,'normal');doc.autoTable({startY:y+3,head:[['ET','EF','SE','Día extra (DA)','HE','HF']],body:[[r.total.encDentro,r.total.encFuera,r.total.suspendido,r.total.diasAdicionales,`${r.total.he.toFixed(1)} h`,`${r.total.hf.toFixed(1)} h`]],styles:{fontSize:8,cellPadding:2,textColor:[25,31,40]},headStyles:{fillColor:[49,61,74],textColor:[255,255,255]}});
    doc.addPage();window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${month} ${r.y}`);y=44;r.rows.forEach(g=>{if(y>175){doc.addPage();window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${month} ${r.y}`);y=44}doc.setFontSize(9);doc.setFont(undefined,'bold');doc.text(g.nombre,14,y);doc.setFont(undefined,'normal');doc.autoTable({startY:y+3,head:[['Fecha','Turno','Evento','Cantidad','Horario','Detalle / motivo']],body:g.eventos.map(ev=>[evRange(ev),ev.turno_base||'—',eventLabel(ev.tipo),qty(ev),hours(ev),ev.motivo||ev.observacion||'Sin detalle']),styles:{fontSize:7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[49,61,74],textColor:[255,255,255]},columnStyles:{5:{cellWidth:96}}});y=(doc.lastAutoTable?.finalY||y+12)+7});doc.save(`Turnos_Novedades_${r.y}_${String(r.m).padStart(2,'0')}.pdf`);
  }

  let baseOpen=null;
  function install(){
    mountStyle();
    const current=window.v1516OpenTurnMonthlyReport||window.v1520TurnReport;
    if(typeof current==='function'&&!current.__v1524reportHotfixR126){
      baseOpen=current;
      const wrapped=async function(){const out=await baseOpen.apply(this,arguments);requestAnimationFrame(enhanceModal);return out};
      wrapped.__v1524reportHotfixR126=true;
      window.v1516OpenTurnMonthlyReport=wrapped;
      window.v1520TurnReport=wrapped;
    }
    window.v1524ExportVisibleReportExcel=exportExcel;window.v1524ExportVisibleReportPdf=exportPdf;
  }
  let tries=0;(function boot(){install();if((!baseOpen||!window.state)&&++tries<120)return setTimeout(boot,100)})();
})();
