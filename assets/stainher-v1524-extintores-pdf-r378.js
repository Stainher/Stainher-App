/* Stainher App R378 · PDF completo Check List de Extintores */
(()=>{
 'use strict';
 if(window.StainherExtintorPdfR378)return;
 const fields=[
  ['manguera','Manguera'],['boquilla','Boquilla'],
  ['traslado','Manilla de traslado'],['manometro','Manómetro'],
  ['manijas','Manijas'],['senalizacion','Señalización'],['acceso','Acceso']
 ];
 const clean=v=>String(v??'').trim();
 const pageHeight=297,margin=14,contentWidth=182;
 function build(d={},blank=false){
  const C=window.jspdf?.jsPDF;
  if(typeof C!=='function')throw new Error('Motor PDF jsPDF no disponible');
  const doc=new C({orientation:'portrait',unit:'mm',format:'a4'});
  if(typeof doc.autoTable!=='function')throw new Error('Generador de tablas PDF no disponible');
  const rows=blank?[]:(Array.isArray(d.rows)?d.rows:[]);
  let y=34;
  const drawHeader=()=>{
   doc.setFillColor(16,34,53);doc.rect(0,0,210,22,'F');
   doc.setTextColor(255,255,255);doc.setFont('helvetica','bold');doc.setFontSize(12);
   doc.text('STAINHER ASCENSORES LTDA.',margin,10);
   doc.setFontSize(8);doc.text('CONTROL 05  |  CHECK LIST DE EXTINTORES',margin,17);
   doc.setTextColor(24,48,72);doc.setFontSize(9);
  };
  const newPage=()=>{doc.addPage();drawHeader();y=31};
  const space=(height=12)=>{if(y+height>pageHeight-20)newPage()};
  const table=(body,options={})=>{
   const start=y;space(options.minHeight||24);
   doc.autoTable({
    startY:y,margin:{left:margin,right:margin,top:31,bottom:22},
    theme:'grid',
    styles:{font:'helvetica',fontSize:8,cellPadding:2.4,overflow:'linebreak',valign:'middle',textColor:[24,48,72],lineColor:[184,201,219]},
    headStyles:{fillColor:[26,75,112],textColor:255,fontStyle:'bold'},
    body,...options.opts
   });
   y=(doc.lastAutoTable?.finalY||y)+6;
  };
  const title=(txt)=>{
   space(12);doc.setTextColor(17,61,98);doc.setFont('helvetica','bold');doc.setFontSize(10);
   doc.text(txt,margin,y);y+=6;doc.setFont('helvetica','normal');doc.setTextColor(24,48,72);
  };
  const info=(label,value)=>[label,blank?'':clean(value)||'—'];
  const paragraph=(label,value)=>{
   title(label);
   const lines=doc.splitTextToSize(blank?'':clean(value)||'Sin observaciones',contentWidth);
   for(const line of lines){
    space(5);doc.setFontSize(8.5);doc.text(String(line),margin,y);y+=4.5;
   }
   y+=3;
  };
  drawHeader();
  title('Datos generales de la inspección');
  table([
   info('Supervisor / inspector',d.supervisor_nombre),
   info('Fecha de inspección',d.fecha),
   info('Área / ubicación general',d.area),
   info('Extintores inspeccionados',rows.length)
  ]);
  if(!rows.length){
   title('No se registraron extintores en esta inspección.');
  }
  rows.forEach((row,index)=>{
   const n=clean(row.n)||String(index+1);
   // Bloque independiente por extintor: nunca limitar a cuatro filas.
   space(75);
   title('Extintor N.º '+n+' de '+rows.length);
   table([
    info('Ubicación',row.ubicacion),info('Clase',row.clase),
    info('Capacidad',row.capacidad),info('Fecha de carga',row.carga),
    info('Fecha de vencimiento',row.vence)
   ],{minHeight:38});
   table(fields.map(([key,label])=>info(label,row[key])),{
    minHeight:38,
    opts:{head:[['Verificación','Resultado']]}
   });
  });
  space(35);
  title('Cierre de la inspección');
  paragraph('Observaciones generales',d.observacion);
  paragraph('Plan de acción',d.plan);
  table([info('Responsable del plan',d.responsable),info('Fecha compromiso',d.fecha_accion)]);
  space(43);
  title('Firma del responsable');
  doc.setDrawColor(115,139,161);doc.rect(margin,y,93,29);
  if(!blank&&clean(d.firma)){
   try{doc.addImage(d.firma,'PNG',margin+3,y+2,87,24)}
   catch(err){console.warn('[R378] La firma no pudo insertarse',err)}
  }
  y+=33;
  const total=doc.internal.getNumberOfPages();
  for(let page=1;page<=total;page++){
   doc.setPage(page);doc.setFont('helvetica','normal');doc.setFontSize(7);
   doc.setTextColor(93,111,133);
   doc.text('STAINHER ASCENSORES  |  Check List de Extintores',margin,286);
   doc.text('Página '+page+' de '+total,196,286,{align:'right'});
  }
  return doc;
 }
 window.buildExtPdfV12=build;
 try{buildExtPdfV12=build}catch(_){}
 window.StainherExtintorPdfR378=Object.freeze({build,fields});
})();