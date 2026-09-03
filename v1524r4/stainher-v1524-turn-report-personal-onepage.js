/* Stainher App V15.24 · Desarrollo 8 · calendario personal PDF en una sola hoja
 * Corrige meses de seis semanas: el calendario individual se dibuja manualmente
 * en una sola hoja A4 horizontal, sin depender del salto de página de AutoTable.
 */
(function installV1524PersonalTurnCalendarOnePage(){
  'use strict';
  if(window.__STAINHER_V1524_PERSONAL_TURN_CALENDAR_ONEPAGE__) return;
  window.__STAINHER_V1524_PERSONAL_TURN_CALENDAR_ONEPAGE__=true;

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
  const eventCodesOn=(row,date)=>[...new Set((row.eventos||[]).filter(ev=>String(ev.fecha_inicio||'')<=date&&String(ev.fecha_fin||ev.fecha_inicio||'')>=date).map(ev=>codeFor(ev.tipo)))];

  function personalRow(r){
    const uid=String(window.state?.v1524TurnReportUser||'');
    if(!uid) return null;
    return (r.rows||[]).find(row=>String(row.uid)===uid)||null;
  }

  function drawLegend(doc){
    const pageWidth=doc.internal.pageSize.getWidth(),left=8,right=8,startY=43;
    const items=Object.entries(LABELS).map(([type,label])=>({code:codeFor(type),label}));
    const columns=6,rowHeight=5.2,cellWidth=(pageWidth-left-right)/columns;
    doc.setFont(undefined,'bold');doc.setFontSize(7);doc.setTextColor(25,31,40);doc.text('Glosa',left,startY-2);
    items.forEach((item,index)=>{
      const col=index%columns,row=Math.floor(index/columns),x=left+col*cellWidth,y=startY+row*rowHeight;
      doc.setDrawColor(211,218,227);doc.setFillColor(246,248,251);doc.rect(x,y,cellWidth,rowHeight,'FD');
      doc.setFont(undefined,'bold');doc.setFontSize(4.5);doc.setTextColor(35,43,54);doc.text(item.code,x+1.2,y+3.35);
      doc.setFont(undefined,'normal');doc.setFontSize(3.7);doc.setTextColor(78,91,112);doc.text(item.label,x+9,y+3.35,{maxWidth:cellWidth-10});
    });
    return startY+Math.ceil(items.length/columns)*rowHeight+3;
  }

  function monthCells(r,row){
    const days=new Date(r.y,r.m,0).getDate(),offset=(new Date(r.y,r.m-1,1).getDay()+6)%7;
    const cells=Array(offset).fill(null);
    for(let day=1;day<=days;day++){
      const date=`${r.y}-${String(r.m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      cells.push({day,date,base:String(row.turnos?.get(date)||'—'),events:eventCodesOn(row,date).join(' · ')});
    }
    while(cells.length%7)cells.push(null);
    const weeks=[];for(let i=0;i<cells.length;i+=7)weeks.push(cells.slice(i,i+7));
    return weeks;
  }

  function drawPersonalCalendar(doc,r,row,monthName){
    doc.addPage('a4','landscape');
    window.pdfHeader?.(doc,'Resumen calendario de turnos',`${row.nombre} · ${monthName} ${r.y}`);
    const gridTop=drawLegend(doc),weeks=monthCells(r,row);
    const pageWidth=doc.internal.pageSize.getWidth(),pageHeight=doc.internal.pageSize.getHeight();
    const left=8,right=8,bottom=14,headHeight=7,usableWidth=pageWidth-left-right,colWidth=usableWidth/7;
    const availableHeight=Math.max(60,pageHeight-gridTop-bottom-headHeight),rowHeight=Math.min(22,availableHeight/Math.max(1,weeks.length));
    const weekdays=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

    doc.setLineWidth(.12);doc.setFont(undefined,'bold');doc.setFontSize(5.2);doc.setFillColor(35,43,54);doc.setTextColor(255,255,255);doc.setDrawColor(35,43,54);
    weekdays.forEach((name,col)=>{const x=left+col*colWidth;doc.rect(x,gridTop,colWidth,headHeight,'FD');doc.text(name,x+2,gridTop+4.6);});

    weeks.forEach((week,rowIndex)=>{
      const y=gridTop+headHeight+rowIndex*rowHeight;
      week.forEach((day,col)=>{
        const x=left+col*colWidth;
        doc.setDrawColor(211,218,227);doc.setFillColor(day&&rowIndex%2===0?248:255,day&&rowIndex%2===0?249:255,day&&rowIndex%2===0?251:255);doc.rect(x,y,colWidth,rowHeight,'FD');
        if(!day)return;
        doc.setFont(undefined,'normal');doc.setFontSize(5.6);doc.setTextColor(78,91,112);doc.text(String(day.day),x+2,y+4);
        const badgeW=Math.min(11,colWidth*.28),badgeH=Math.min(7,rowHeight*.34),badgeX=x+colWidth/2-badgeW/2,badgeY=y+Math.max(5,rowHeight*.30);
        if(day.base==='A')doc.setFillColor(220,235,255);else if(day.base==='C')doc.setFillColor(220,247,231);else if(day.base==='L')doc.setFillColor(235,239,244);else doc.setFillColor(242,244,247);
        doc.setDrawColor(170,181,195);doc.roundedRect(badgeX,badgeY,badgeW,badgeH,1.4,1.4,'FD');
        doc.setFont(undefined,'bold');doc.setFontSize(6.8);doc.setTextColor(25,31,40);doc.text(day.base,x+colWidth/2,badgeY+badgeH*.69,{align:'center'});
        const lineY=y+rowHeight-7;doc.setDrawColor(211,218,227);doc.line(x+2,lineY,x+colWidth-2,lineY);
        doc.setFont(undefined,'normal');doc.setFontSize(4.7);doc.setTextColor(91,104,120);doc.text(day.events||' ',x+2,y+rowHeight-3,{maxWidth:colWidth-4});
      });
    });
  }

  function exportPersonalPdf(r,row){
    const C=typeof window.ensurePdf==='function'?window.ensurePdf():null;if(!C)return window.toast?.('No se pudo cargar el generador PDF.','error');
    const doc=new C({orientation:'landscape',unit:'mm',format:'a4'}),monthName=window.MONTHS_ES?.[r.m-1]||String(r.m);
    window.pdfHeader?.(doc,'Informe Mensual de Turnos y Novedades',`${monthName} ${r.y} · ${row.nombre}`);
    doc.setFontSize(10);doc.text('Resumen de eventos por colaborador',14,43);
    doc.autoTable({startY:47,head:[['Colaborador','Enc. dentro','Enc. fuera','Suspendido','Días adic.','H. extra','H. feriado','Vac.','Lic. med.','Faltas','Otros']],body:[[row.nombre,row.encDentro,row.encFuera,row.suspendido,row.diasAdicionales,Number(row.he||0).toFixed(1),Number(row.hf||0).toFixed(1),row.vacaciones,row.licencias,row.faltas,row.otros],['TOTAL SELECCIÓN',row.encDentro,row.encFuera,row.suspendido,row.diasAdicionales,Number(row.he||0).toFixed(1),Number(row.hf||0).toFixed(1),row.vacaciones,row.licencias,row.faltas,row.otros]],styles:{fontSize:6.7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});
    drawPersonalCalendar(doc,r,row,monthName);
    doc.addPage('a4','landscape');window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${monthName} ${r.y}`);
    doc.setFontSize(9);doc.setFont(undefined,'bold');doc.text(row.nombre,14,44);doc.setFont(undefined,'normal');
    doc.autoTable({startY:47,head:[['Fecha','Turno','Evento','Cantidad','Horario','Detalle / motivo']],body:(row.eventos||[]).map(ev=>[dateRangeLabel(ev),ev.turno_base||'—',labelFor(ev.tipo),qtyLabel(ev),hoursLabel(ev),ev.motivo||ev.observacion||'Sin detalle']),styles:{fontSize:7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[49,61,74],textColor:[255,255,255]},columnStyles:{5:{cellWidth:96}}});
    doc.save(`Turnos_Novedades_${r.y}_${String(r.m).padStart(2,'0')}_${row.nombre.replace(/[^a-z0-9]+/gi,'_')}.pdf`);
  }

  let baseExport=null;
  function install(){
    const current=window.v1516ExportTurnReportPdf;
    if(typeof current!=='function')return false;
    if(current.__v1524PersonalOnePage)return true;
    baseExport=current;
    const wrapped=function(){
      const r=window.state?.v1516TurnReport,row=r?personalRow(r):null;
      if(row)return exportPersonalPdf(r,row);
      return baseExport.apply(this,arguments);
    };
    wrapped.__v1524PersonalOnePage=true;wrapped.__base=baseExport;
    window.v1516ExportTurnReportPdf=wrapped;
    return true;
  }
  let attempts=0;(function boot(){if(install())return;if(++attempts<240)setTimeout(boot,100);})();
})();
