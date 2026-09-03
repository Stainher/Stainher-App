/* Stainher App V15.24 · Desarrollo 8 · calendarios PDF en una sola hoja
 * - Calendario "Todos los colaboradores": una única hoja A3 horizontal.
 * - Calendario personal: una única hoja A4 horizontal, incluso en meses de 6 semanas.
 * - Ambos calendarios se dibujan directamente con jsPDF, sin AutoTable para la cuadrícula.
 * - Elimina la posibilidad de salto de página dentro del calendario.
 */
(function installV1524TurnReportOnePage(){
  'use strict';
  if(window.__STAINHER_V1524_TURN_REPORT_ONEPAGE__) return;
  window.__STAINHER_V1524_TURN_REPORT_ONEPAGE__=true;

  const LABELS={
    encierro_planificado:'Encierro dentro de turno',
    encierro_no_planificado:'Encierro fuera de turno',
    suspendido_encierro:'Suspendido por encierro',
    dia_adicional:'Día adicional',
    hora_extra:'Horas extra',
    feriado:'Horas feriado',
    vacaciones:'Vacaciones',
    licencia_medica:'Licencia médica',
    permiso:'Permiso / ausencia',
    falta:'Falta / ausencia',
    capacitacion:'Capacitación',
    otro:'Otra novedad'
  };
  const CODES={
    encierro_planificado:'ET',encierro_no_planificado:'EF',suspendido_encierro:'SE',dia_adicional:'DA',hora_extra:'HE',feriado:'HF',vacaciones:'V',licencia_medica:'LM',permiso:'P',falta:'F',capacitacion:'CAP',otro:'EV'
  };
  const codeFor=type=>CODES[type]||'EV';
  const labelFor=type=>LABELS[type]||window.v1520TurnTypeLabel?.(type)||String(type||'').replaceAll('_',' ');
  const fmtDate=value=>window.v1520Date?.(value)||window.fmtDateCL?.(value)||String(value||'');
  const dateRangeLabel=ev=>{const a=fmtDate(ev.fecha_inicio),b=fmtDate(ev.fecha_fin||ev.fecha_inicio);return ev.fecha_fin&&ev.fecha_fin!==ev.fecha_inicio?`${a} al ${b}`:a;};
  const qtyLabel=ev=>{const n=Number(ev.cantidad||0);return n?`${n} ${ev.unidad||''}`.trim():'—';};
  const hoursLabel=ev=>{const a=String(ev.hora_inicio||'').slice(0,5),b=String(ev.hora_fin||'').slice(0,5);return a||b?`${a||'—'} a ${b||'—'}`:'—';};
  const selectedRows=r=>{const uid=String(window.state?.v1524TurnReportUser||'');return uid?(r.rows||[]).filter(row=>String(row.uid)===uid):(r.rows||[]);};
  const eventCodesOn=(row,date)=>[...new Set((row.eventos||[]).filter(ev=>String(ev.fecha_inicio||'')<=date&&String(ev.fecha_fin||ev.fecha_inicio||'')>=date).map(ev=>codeFor(ev.tipo)))];
  const rowsTotal=rows=>rows.reduce((a,row)=>{for(const key of ['encDentro','encFuera','suspendido','diasAdicionales','he','hf','vacaciones','licencias','faltas','otros'])a[key]+=Number(row[key]||0);return a;},{encDentro:0,encFuera:0,suspendido:0,diasAdicionales:0,he:0,hf:0,vacaciones:0,licencias:0,faltas:0,otros:0});

  function calendarExportRows(r,row){
    const days=new Date(r.y,r.m,0).getDate(),out=[];
    for(let day=1;day<=days;day++){
      const date=`${r.y}-${String(r.m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      out.push({date,day,base:String(row.turnos?.get(date)||'—'),events:eventCodesOn(row,date).join(' · ')});
    }
    return out;
  }

  function drawCompactLegend(doc){
    const pageWidth=doc.internal.pageSize.getWidth();
    const left=6,right=6,items=Object.entries(LABELS).map(([type,label])=>({code:codeFor(type),label}));
    const columns=6,cellWidth=(pageWidth-left-right)/columns,rowHeight=5.2,startY=43;
    doc.setFont(undefined,'bold');doc.setFontSize(7);doc.setTextColor(25,31,40);doc.text('Glosa',left,startY-2);
    items.forEach((item,index)=>{
      const col=index%columns,row=Math.floor(index/columns),x=left+col*cellWidth,y=startY+row*rowHeight;
      doc.setDrawColor(211,218,227);doc.setFillColor(246,248,251);doc.rect(x,y,cellWidth,rowHeight,'FD');
      doc.setFont(undefined,'bold');doc.setFontSize(4.5);doc.setTextColor(35,43,54);doc.text(item.code,x+1.2,y+3.35);
      doc.setFont(undefined,'normal');doc.setFontSize(3.7);doc.setTextColor(78,91,112);doc.text(item.label,x+9,y+3.35,{maxWidth:cellWidth-10});
    });
    return startY+Math.ceil(items.length/columns)*rowHeight+2;
  }

  function drawConsolidatedCalendarOnePage(doc,r,rows,monthName){
    doc.addPage('a3','landscape');
    window.pdfHeader?.(doc,'Calendario completo de turnos',`${monthName} ${r.y} · Todos los colaboradores`);
    const gridTop=drawCompactLegend(doc);
    const pageWidth=doc.internal.pageSize.getWidth(),pageHeight=doc.internal.pageSize.getHeight();
    const left=5,right=5,bottom=6,nameWidth=44,days=new Date(r.y,r.m,0).getDate();
    const usableWidth=pageWidth-left-right,dayWidth=(usableWidth-nameWidth)/days;
    const headHeight=6.5,availableHeight=Math.max(20,pageHeight-gridTop-bottom-headHeight);
    const rowHeight=rows.length?Math.min(10,availableHeight/rows.length):10;
    const nameFont=Math.max(2.8,Math.min(4.6,rowHeight*.46));
    const baseFont=Math.max(2.6,Math.min(4.2,rowHeight*.43));
    const eventFont=Math.max(2.1,Math.min(3.2,rowHeight*.31));

    doc.setLineWidth(.12);doc.setDrawColor(185,196,208);doc.setFillColor(35,43,54);doc.setTextColor(255,255,255);doc.setFont(undefined,'bold');doc.setFontSize(3.6);
    doc.rect(left,gridTop,nameWidth,headHeight,'FD');doc.text('Colaborador',left+1.2,gridTop+4.2);
    for(let day=1;day<=days;day++){
      const x=left+nameWidth+(day-1)*dayWidth;
      doc.rect(x,gridTop,dayWidth,headHeight,'FD');doc.text(String(day),x+dayWidth/2,gridTop+4.2,{align:'center'});
    }

    rows.forEach((row,rowIndex)=>{
      const y=gridTop+headHeight+rowIndex*rowHeight;
      doc.setFillColor(255,255,255);doc.setDrawColor(200,209,219);doc.rect(left,y,nameWidth,rowHeight,'FD');
      doc.setFont(undefined,'normal');doc.setTextColor(25,31,40);doc.setFontSize(nameFont);
      const name=String(row.nombre||'Usuario');
      const nameLine=(doc.splitTextToSize?.(name,nameWidth-2)||[name])[0];
      doc.text(nameLine,left+1,y+rowHeight*.6,{maxWidth:nameWidth-2});
      for(let day=1;day<=days;day++){
        const date=`${r.y}-${String(r.m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
        const base=String(row.turnos?.get(date)||'—'),events=eventCodesOn(row,date).join('·');
        const x=left+nameWidth+(day-1)*dayWidth;
        if(base==='A')doc.setFillColor(232,241,255);else if(base==='C')doc.setFillColor(232,249,238);else if(base==='L')doc.setFillColor(241,244,247);else doc.setFillColor(255,255,255);
        doc.setDrawColor(200,209,219);doc.rect(x,y,dayWidth,rowHeight,'FD');
        doc.setFont(undefined,'bold');doc.setTextColor(25,31,40);doc.setFontSize(baseFont);
        const baseY=events&&rowHeight>=5.2?y+rowHeight*.42:y+rowHeight*.61;
        doc.text(base,x+dayWidth/2,baseY,{align:'center',maxWidth:Math.max(1,dayWidth-.5)});
        if(events&&rowHeight>=5.2){
          doc.setFont(undefined,'normal');doc.setTextColor(91,104,120);doc.setFontSize(eventFont);
          doc.text(events,x+dayWidth/2,y+rowHeight*.78,{align:'center',maxWidth:Math.max(1,dayWidth-.35)});
        }
      }
    });

    doc.setFont(undefined,'normal');doc.setFontSize(3.3);doc.setTextColor(91,104,120);
    doc.text(`Dotación incluida: ${rows.length} colaborador(es) · Calendario ajustado automáticamente a una sola hoja A3 horizontal.`,left,pageHeight-2.5);
  }

  function drawPersonalCalendar(doc,r,row,monthName){
    doc.addPage('a4','landscape');
    window.pdfHeader?.(doc,'Resumen calendario de turnos',`${row.nombre} · ${monthName} ${r.y}`);

    const gridTop=drawCompactLegend(doc);
    const days=calendarExportRows(r,row),offset=(new Date(r.y,r.m-1,1).getDay()+6)%7;
    const cells=[...Array(offset).fill(null),...days];
    while(cells.length%7)cells.push(null);
    const weeks=[];for(let index=0;index<cells.length;index+=7)weeks.push(cells.slice(index,index+7));

    const pageWidth=doc.internal.pageSize.getWidth(),pageHeight=doc.internal.pageSize.getHeight();
    const left=7,right=7,bottom=8,headHeight=7,usableWidth=pageWidth-left-right,colWidth=usableWidth/7;
    const availableHeight=Math.max(50,pageHeight-gridTop-bottom-headHeight);
    const rowHeight=availableHeight/Math.max(1,weeks.length);
    const weekdays=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

    doc.setLineWidth(.12);doc.setDrawColor(35,43,54);doc.setFillColor(35,43,54);doc.setTextColor(255,255,255);doc.setFont(undefined,'bold');doc.setFontSize(5.3);
    weekdays.forEach((name,col)=>{
      const x=left+col*colWidth;
      doc.rect(x,gridTop,colWidth,headHeight,'FD');
      doc.text(name,x+2,gridTop+4.6,{maxWidth:colWidth-4});
    });

    weeks.forEach((week,rowIndex)=>{
      const y=gridTop+headHeight+rowIndex*rowHeight;
      week.forEach((day,col)=>{
        const x=left+col*colWidth;
        doc.setDrawColor(211,218,227);
        if(rowIndex%2===0)doc.setFillColor(248,249,251);else doc.setFillColor(255,255,255);
        doc.rect(x,y,colWidth,rowHeight,'FD');
        if(!day)return;

        doc.setFont(undefined,'normal');doc.setFontSize(5.8);doc.setTextColor(78,91,112);
        doc.text(String(day.day),x+2,y+4.2);

        const badgeW=Math.min(11,colWidth*.30),badgeH=Math.min(7,Math.max(5,rowHeight*.30));
        const badgeX=x+colWidth/2-badgeW/2,badgeY=y+Math.max(5.2,rowHeight*.28);
        if(day.base==='A')doc.setFillColor(220,235,255);else if(day.base==='C')doc.setFillColor(220,247,231);else if(day.base==='L')doc.setFillColor(235,239,244);else doc.setFillColor(242,244,247);
        doc.setDrawColor(170,181,195);doc.roundedRect(badgeX,badgeY,badgeW,badgeH,1.4,1.4,'FD');
        doc.setFont(undefined,'bold');doc.setFontSize(6.8);doc.setTextColor(25,31,40);
        doc.text(day.base,x+colWidth/2,badgeY+badgeH*.69,{align:'center',maxWidth:badgeW-1});

        const lineY=y+rowHeight-7;
        doc.setDrawColor(211,218,227);doc.line(x+2,lineY,x+colWidth-2,lineY);
        doc.setFont(undefined,'normal');doc.setFontSize(4.7);doc.setTextColor(91,104,120);
        doc.text(day.events||' ',x+2,y+rowHeight-3,{maxWidth:colWidth-4});
      });
    });

    doc.setFont(undefined,'normal');doc.setFontSize(3.5);doc.setTextColor(91,104,120);
    doc.text(`Calendario personal completo · ${weeks.length} semanas · una sola hoja A4 horizontal.`,left,pageHeight-2.5);
  }

  function exportPdfOnePage(){
    const r=window.state?.v1516TurnReport,C=typeof window.ensurePdf==='function'?window.ensurePdf():null;
    if(!r||!C)return window.toast?.('No se pudo cargar el generador PDF.','error');
    const selected=selectedRows(r),total=rowsTotal(selected),doc=new C({orientation:'landscape',unit:'mm',format:'a4'});
    const monthName=window.MONTHS_ES?.[r.m-1]||String(r.m),selectionLabel=selected.length===1?` · ${selected[0].nombre}`:'';
    window.pdfHeader?.(doc,'Informe Mensual de Turnos y Novedades',`${monthName} ${r.y}${selectionLabel}`);
    doc.setFontSize(10);doc.text('Resumen de eventos por colaborador',14,43);
    doc.autoTable({startY:47,head:[['Colaborador','Enc. dentro','Enc. fuera','Suspendido','Días adic.','H. extra','H. feriado','Vac.','Lic. med.','Faltas','Otros']],body:[...selected.map(x=>[x.nombre,x.encDentro,x.encFuera,x.suspendido,x.diasAdicionales,Number(x.he||0).toFixed(1),Number(x.hf||0).toFixed(1),x.vacaciones,x.licencias,x.faltas,x.otros]),['TOTAL SELECCIÓN',total.encDentro,total.encFuera,total.suspendido,total.diasAdicionales,total.he.toFixed(1),total.hf.toFixed(1),total.vacaciones,total.licencias,total.faltas,total.otros]],styles:{fontSize:6.7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});

    if(selected.length===1)drawPersonalCalendar(doc,r,selected[0],monthName);
    else drawConsolidatedCalendarOnePage(doc,r,selected,monthName);

    doc.addPage('a4','landscape');window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${monthName} ${r.y}`);
    let y=44;
    selected.forEach(g=>{
      if(y>175){doc.addPage('a4','landscape');window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${monthName} ${r.y}`);y=44;}
      doc.setFontSize(9);doc.setFont(undefined,'bold');doc.text(g.nombre,14,y);doc.setFont(undefined,'normal');
      doc.autoTable({startY:y+3,head:[['Fecha','Turno','Evento','Cantidad','Horario','Detalle / motivo']],body:(g.eventos||[]).map(ev=>[dateRangeLabel(ev),ev.turno_base||'—',labelFor(ev.tipo),qtyLabel(ev),hoursLabel(ev),ev.motivo||ev.observacion||'Sin detalle']),styles:{fontSize:7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[49,61,74],textColor:[255,255,255]},columnStyles:{5:{cellWidth:96}}});
      y=(doc.lastAutoTable?.finalY||y+12)+7;
    });
    const suffix=selected.length===1?'_'+selected[0].nombre.replace(/[^a-z0-9]+/gi,'_'):'';
    doc.save(`Turnos_Novedades_${r.y}_${String(r.m).padStart(2,'0')}${suffix}.pdf`);
  }

  function install(){
    if(typeof window.v1516ExportTurnReportPdf!=='function'||!window.ensurePdf)return false;
    exportPdfOnePage.__v1524D8UnifiedOnePage=true;
    window.v1516ExportTurnReportPdf=exportPdfOnePage;
    return true;
  }
  let attempts=0;(function boot(){if(install())return;if(++attempts<240)setTimeout(boot,100);})();
})();
