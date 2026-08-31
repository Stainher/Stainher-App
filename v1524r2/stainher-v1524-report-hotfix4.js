/* Stainher App V15.24 · Report Hotfix 4 (pendiente de publicación)
 * - Oculta la columna Suspendido por encierro del resumen principal.
 * - Agrega bajo la tabla la sumatoria global ET, EF, Día extra (DA), HE y HF.
 * - Mantiene Suspendido por encierro únicamente en el detalle de eventos.
 */
(function installV1524ReportHotfix4(){
  if(window.__STAINHER_V1524_REPORT_HOTFIX4__) return;
  window.__STAINHER_V1524_REPORT_HOTFIX4__=true;

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
    {code:'DA',label:'Día extra (DA)',value:r?.total?.diasAdicionales||0,unit:'días'},
    {code:'HE',label:'Horas extra',value:r?.total?.he||0,unit:'h'},
    {code:'HF',label:'Horas feriado',value:r?.total?.hf||0,unit:'h'}
  ];}

  function mountStyle(){
    if(document.getElementById('stainher-v1524-report-hotfix4-style')) return;
    const s=document.createElement('style');s.id='stainher-v1524-report-hotfix4-style';s.textContent=`
      .v1524-operational-totals{margin-top:10px;padding:10px;border:1px solid #2d3c4c;border-radius:10px;background:#0d151e}
      .v1524-operational-totals h5{margin:0 0 8px;color:#dbeafe;font-size:11px;text-transform:uppercase;letter-spacing:.04em}
      .v1524-operational-total-grid{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:7px}
      .v1524-operational-total{padding:8px;border:1px solid #2a3745;border-radius:8px;background:#111a24;min-width:0}
      .v1524-operational-total b{display:block;color:#fff;font-size:18px;line-height:1.1}.v1524-operational-total span{display:block;margin-top:3px;color:#9fb2c5;font-size:9px}.v1524-operational-total small{display:inline-block;margin-right:5px;color:#6ee7b7;font-weight:900}
      @media(max-width:700px){.v1524-operational-total-grid{grid-template-columns:repeat(2,minmax(0,1fr))}}
    `;document.head.appendChild(s);
  }

  function removeSuspendedColumn(table){
    if(!table) return;
    const heads=[...table.querySelectorAll('thead th')];
    const idx=heads.findIndex(th=>/suspendido/i.test(th.textContent||''));
    if(idx<0) return;
    table.querySelectorAll('tr').forEach(tr=>{const cells=tr.children;if(cells[idx]) cells[idx].remove();});
    table.querySelectorAll('[colspan]').forEach(td=>{const n=Number(td.getAttribute('colspan'));if(n>1)td.setAttribute('colspan',String(n-1));});
  }

  function operationalHtml(r){return `<div class="v1524-operational-totals"><h5>Totales operativos del período</h5><div class="v1524-operational-total-grid">${totals(r).map(x=>`<div class="v1524-operational-total"><small>${x.code}</small><b>${fmt(x.value)}${x.unit==='h'?' h':''}</b><span>${esc(x.label)}</span></div>`).join('')}</div></div>`;}

  function enhanceModal(){
    const r=window.state?.v1516TurnReport;
    if(!r) return;
    const modal=[...document.querySelectorAll('#modalRoot .modal')].find(x=>/Informe mensual/i.test(x.textContent||''));
    if(!modal) return;
    const summary=modal.querySelector('.v1524-report-summary');
    removeSuspendedColumn(summary?.querySelector('table'));
    if(summary&&!modal.querySelector('.v1524-operational-totals')) summary.insertAdjacentHTML('afterend',operationalHtml(r));
  }

  function exportExcel(){
    const r=window.state?.v1516TurnReport;if(!r||!window.XLSX)return;
    const summary=[...r.rows.map(x=>({'Colaborador':x.nombre,'Encierro dentro de turno':x.encDentro,'Encierro fuera de turno':x.encFuera,'Día extra (DA)':x.diasAdicionales,'Horas extra':x.he,'Horas feriado':x.hf,'Vacaciones':x.vacaciones,'Licencia médica':x.licencias,'Falta / ausencia':x.faltas,'Otros':x.otros})),{'Colaborador':'TOTAL GENERAL','Encierro dentro de turno':r.total.encDentro,'Encierro fuera de turno':r.total.encFuera,'Día extra (DA)':r.total.diasAdicionales,'Horas extra':r.total.he,'Horas feriado':r.total.hf,'Vacaciones':r.total.vacaciones,'Licencia médica':r.total.licencias,'Falta / ausencia':r.total.faltas,'Otros':r.total.otros}];
    const ops=totals(r).map(x=>({'Código':x.code,'Evento':x.label,'Total':x.value,'Unidad':x.unit}));
    const detail=[];r.rows.forEach(g=>g.eventos.forEach(ev=>detail.push({'Colaborador':g.nombre,'Fecha / rango':evRange(ev),'Turno base':ev.turno_base||'','Tipo de evento':eventLabel(ev.tipo),'Cantidad':Number(ev.cantidad||0),'Unidad':ev.unidad||'','Hora inicio':String(ev.hora_inicio||'').slice(0,5),'Hora término':String(ev.hora_fin||'').slice(0,5),'Detalle / motivo':ev.motivo||ev.observacion||''})));
    const wb=window.XLSX.utils.book_new();window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(summary),'Resumen por colaborador');window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(ops),'Totales operativos');window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(detail),'Detalle agrupado');window.XLSX.writeFile(wb,`Turnos_Novedades_${r.y}_${String(r.m).padStart(2,'0')}.xlsx`);
  }

  function exportPdf(){
    const r=window.state?.v1516TurnReport,C=typeof window.ensurePdf==='function'?window.ensurePdf():null;if(!r||!C)return window.toast?.('No se pudo cargar el generador PDF.','error');
    const doc=new C({orientation:'landscape',unit:'mm',format:'a4'}),month=window.MONTHS_ES?.[r.m-1]||String(r.m);window.pdfHeader?.(doc,'Informe Mensual de Turnos y Novedades',`${month} ${r.y}`);doc.setFontSize(10);doc.text('Resumen de eventos por colaborador',14,43);
    doc.autoTable({startY:47,head:[['Colaborador','Enc. dentro','Enc. fuera','Día extra (DA)','H. extra','H. feriado','Vac.','Lic. med.','Faltas','Otros']],body:[...r.rows.map(x=>[x.nombre,x.encDentro,x.encFuera,x.diasAdicionales,x.he.toFixed(1),x.hf.toFixed(1),x.vacaciones,x.licencias,x.faltas,x.otros]),['TOTAL GENERAL',r.total.encDentro,r.total.encFuera,r.total.diasAdicionales,r.total.he.toFixed(1),r.total.hf.toFixed(1),r.total.vacaciones,r.total.licencias,r.total.faltas,r.total.otros]],styles:{fontSize:7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});
    let y=(doc.lastAutoTable?.finalY||70)+7;doc.setFontSize(9);doc.setFont(undefined,'bold');doc.text('Totales operativos del período',14,y);doc.setFont(undefined,'normal');doc.autoTable({startY:y+3,head:[['ET','EF','Día extra (DA)','HE','HF']],body:[[r.total.encDentro,r.total.encFuera,r.total.diasAdicionales,`${r.total.he.toFixed(1)} h`,`${r.total.hf.toFixed(1)} h`]],styles:{fontSize:8,cellPadding:2,textColor:[25,31,40]},headStyles:{fillColor:[49,61,74],textColor:[255,255,255]}});
    doc.addPage();window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${month} ${r.y}`);y=44;r.rows.forEach(g=>{if(y>175){doc.addPage();window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${month} ${r.y}`);y=44}doc.setFontSize(9);doc.setFont(undefined,'bold');doc.text(g.nombre,14,y);doc.setFont(undefined,'normal');doc.autoTable({startY:y+3,head:[['Fecha','Turno','Evento','Cantidad','Horario','Detalle / motivo']],body:g.eventos.map(ev=>[evRange(ev),ev.turno_base||'—',eventLabel(ev.tipo),qty(ev),hours(ev),ev.motivo||ev.observacion||'Sin detalle']),styles:{fontSize:7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[49,61,74],textColor:[255,255,255]},columnStyles:{5:{cellWidth:96}}});y=(doc.lastAutoTable?.finalY||y+12)+7});doc.save(`Turnos_Novedades_${r.y}_${String(r.m).padStart(2,'0')}.pdf`);
  }

  let baseOpen=null;
  function install(){
    mountStyle();
    const current=window.v1516OpenTurnMonthlyReport||window.v1520TurnReport;
    if(typeof current==='function'&&!current.__v1524reportHotfix4){baseOpen=current;const wrapped=function(){const out=baseOpen.apply(this,arguments);setTimeout(enhanceModal,0);return out};wrapped.__v1524reportHotfix4=true;window.v1516OpenTurnMonthlyReport=wrapped;window.v1520TurnReport=wrapped;}
    window.v1524ExportVisibleReportExcel=exportExcel;window.v1524ExportVisibleReportPdf=exportPdf;
  }
  let tries=0;(function boot(){install();if((!baseOpen||!window.state)&&++tries<120)return setTimeout(boot,100)})();
})();
