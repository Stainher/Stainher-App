/* Stainher V15.24 · R145 · Corrección informe PDF Estandarización.
 * - Elimina el pie manual de R144 y usa exclusivamente el pie corporativo transversal.
 * - Mantiene el gráfico total del dashboard en la app sin cambios.
 * - En el PDF representa el avance total como gráfico dona y mantiene barras por equipo.
 */
(()=>{
  'use strict';
  const BUILD='20261002-r145-standardization-pdf';
  if(window.__STAINHER_STANDARDIZATION_REPORT_R145__===BUILD)return;
  window.__STAINHER_STANDARDIZATION_REPORT_R145__=BUILD;

  const TABLE='estandarizacion_actividades_v141';
  let observer=null;
  let timer=null;

  const todayIso=()=>{
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const statusLabel=value=>value==='REALIZADO'?'Realizado':value==='EN PROCESO'?'En proceso':'No realizado';
  const stats=rows=>{
    const total=rows.length;
    const done=rows.filter(x=>x.estado==='REALIZADO').length;
    const process=rows.filter(x=>x.estado==='EN PROCESO').length;
    const pending=rows.filter(x=>x.estado==='NO REALIZADO').length;
    const pct=total?Math.round(done*1000/total)/10:0;
    return {total,done,process,pending,pct};
  };
  const groups=rows=>{
    const map=new Map();
    rows.forEach(row=>{
      const key=row.equipo||'Sin equipo';
      if(!map.has(key))map.set(key,[]);
      map.get(key).push(row);
    });
    return [...map.entries()]
      .sort((a,b)=>a[0].localeCompare(b[0],'es'))
      .map(([name,list])=>({name,rows:list,...stats(list)}));
  };

  async function loadRows(){
    const q=await window.sb.from(TABLE).select('*').eq('activo',true).order('orden',{ascending:true});
    if(q.error)throw q.error;
    return q.data||[];
  }

  function drawStackedBar(doc,x,y,w,h,values,total,colors){
    let cursor=x;
    const safeTotal=Math.max(1,total);
    values.forEach((value,i)=>{
      const width=w*(Number(value||0)/safeTotal);
      doc.setFillColor(...colors[i]);
      if(width>0)doc.rect(cursor,y,width,h,'F');
      cursor+=width;
    });
    doc.setDrawColor(190,195,202);
    doc.rect(x,y,w,h);
  }

  function donutImage(s){
    const canvas=document.createElement('canvas');
    canvas.width=520;
    canvas.height=520;
    const ctx=canvas.getContext('2d');
    const values=[s.done,s.process,s.pending];
    const colors=['#34d399','#fbbf24','#fb7185'];
    const total=Math.max(1,values.reduce((a,b)=>a+Number(b||0),0));
    const cx=260,cy=260,r=165;
    ctx.fillStyle='#ffffff';
    ctx.fillRect(0,0,canvas.width,canvas.height);
    ctx.lineWidth=105;
    ctx.lineCap='butt';
    let start=-Math.PI/2;
    values.forEach((value,i)=>{
      const angle=Math.PI*2*(Number(value||0)/total);
      if(angle>0){
        ctx.beginPath();
        ctx.strokeStyle=colors[i];
        ctx.arc(cx,cy,r,start,start+angle,false);
        ctx.stroke();
      }
      start+=angle;
    });
    if(values.every(v=>!Number(v))){
      ctx.beginPath();ctx.strokeStyle='#e5e7eb';ctx.arc(cx,cy,r,0,Math.PI*2);ctx.stroke();
    }
    ctx.fillStyle='#232b36';
    ctx.textAlign='center';
    ctx.textBaseline='middle';
    ctx.font='700 64px Arial';
    ctx.fillText(`${s.pct}%`,cx,cy-10);
    ctx.fillStyle='#6b7280';
    ctx.font='600 24px Arial';
    ctx.fillText('COMPLETADO',cx,cy+48);
    return canvas.toDataURL('image/png');
  }

  function installCorporateHeader(doc,title,subtitle){
    if(typeof window.installCorporatePdfV95==='function'){
      window.installCorporatePdfV95(doc,title,subtitle);
      doc.setTextColor(28,34,41);
      return;
    }
    if(typeof window.pdfHeader==='function'){
      window.pdfHeader(doc,title,subtitle);
      doc.setTextColor(28,34,41);
      return;
    }
    doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text(title,14,17);
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(90,98,108);doc.text(subtitle,14,24);
    doc.setTextColor(28,34,41);
  }

  async function generateReport(){
    let rows;
    try{
      rows=await loadRows();
    }catch(error){
      return window.toast?.('No se pudo obtener la información para el informe: '+(error.message||error),'error');
    }
    const JsPDF=window.jspdf?.jsPDF||window.jsPDF;
    if(typeof JsPDF!=='function')return window.toast?.('No se pudo cargar el generador PDF.','error');

    const s=stats(rows);
    const gs=groups(rows);
    const doc=new JsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const green=[52,211,153],yellow=[251,191,36],red=[251,113,133],dark=[35,43,54],light=[245,247,250];
    const issued=new Date().toLocaleString('es-CL',{dateStyle:'long',timeStyle:'short'});
    installCorporateHeader(doc,'Informe de Estandarización',`Estado consolidado · ${issued}`);

    const cards=[['Total',s.total,dark],['Realizadas',s.done,green],['En proceso',s.process,yellow],['No realizadas',s.pending,red],['Avance',`${s.pct}%`,dark]];
    cards.forEach((item,i)=>{
      const x=14+i*54;
      doc.setFillColor(...light);doc.setDrawColor(218,222,228);doc.roundedRect(x,32,49,18,2,2,'FD');
      doc.setTextColor(90,98,108);doc.setFont('helvetica','normal');doc.setFontSize(7.2);doc.text(item[0].toUpperCase(),x+3,38);
      doc.setTextColor(...item[2]);doc.setFont('helvetica','bold');doc.setFontSize(14);doc.text(String(item[1]),x+3,47);
    });

    doc.setTextColor(28,34,41);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Avance total',14,60);
    try{
      doc.addImage(donutImage(s),'PNG',15,64,47,47);
    }catch(error){
      console.warn('[Stainher R145] No fue posible insertar dona PDF',error);
    }
    const legends=[['Realizadas',s.done,green],['En proceso',s.process,yellow],['No realizadas',s.pending,red]];
    legends.forEach((item,i)=>{
      const y=72+i*12;
      doc.setFillColor(...item[2]);doc.roundedRect(68,y-4,4,4,1,1,'F');
      doc.setTextColor(75,82,92);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(item[0],75,y-1);
      doc.setTextColor(28,34,41);doc.setFont('helvetica','bold');doc.text(String(item[1]),119,y-1,{align:'right'});
    });
    doc.setTextColor(90,98,108);doc.setFont('helvetica','normal');doc.setFontSize(7.4);doc.text(`${s.done} de ${s.total} actividades realizadas`,68,108);

    doc.setTextColor(28,34,41);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Avance por equipo',150,60);
    let y=67;
    gs.forEach(g=>{
      doc.setFont('helvetica','normal');doc.setFontSize(7.2);doc.setTextColor(28,34,41);
      const label=doc.splitTextToSize(g.name,52)[0];
      doc.text(label,150,y+3);
      drawStackedBar(doc,204,y-1,60,5,[g.done,g.process,g.pending],g.total,[green,yellow,red]);
      doc.setFont('helvetica','bold');doc.text(`${g.pct}%`,267,y+3);
      y+=9;
    });
    doc.setFont('helvetica','normal');doc.setFontSize(6.8);doc.setTextColor(90,98,108);
    doc.text('Verde: realizadas · Amarillo: en proceso · Rojo: no realizadas',150,Math.max(112,y+1));

    if(typeof doc.autoTable==='function'){
      const detail=rows.map(row=>[
        row.equipo||'',row.actividad||'',row.alcance||'',statusLabel(row.estado),row.fecha_ejecucion||'',row.responsable||'',
        [row.observacion,row.detalle_ejecucion].filter(Boolean).join(' · ')
      ]);
      doc.autoTable({
        startY:Math.max(122,y+8),
        head:[['Equipo','Actividad','Alcance','Estado','Fecha','Responsable','Observación / avance']],
        body:detail,
        margin:{left:14,right:14,bottom:22},
        styles:{fontSize:6.4,cellPadding:1.8,overflow:'linebreak',valign:'top',textColor:[28,34,41]},
        headStyles:{fillColor:dark,textColor:[255,255,255],fontStyle:'bold'},
        alternateRowStyles:{fillColor:[248,249,251]},
        columnStyles:{0:{cellWidth:31},1:{cellWidth:48},2:{cellWidth:45},3:{cellWidth:21},4:{cellWidth:19},5:{cellWidth:28},6:{cellWidth:73}}
      });
    }

    /* R145: no se dibuja ningún pie manual. installCorporatePdfV95 agrega
     * una única línea corporativa, documento generado y paginación al guardar. */
    doc.save(`Informe_Estandarizacion_${todayIso()}.pdf`);
    window.toast?.('Informe de Estandarización generado.','success');
  }

  function bindButton(){
    const button=document.querySelector('#page-estandarizacion [data-std-report-r144]');
    if(!button)return false;
    if(button.dataset.stdReportR145==='1')return true;
    button.dataset.stdReportR145='1';
    button.onclick=generateReport;
    button.textContent='↓ Informe PDF';
    return true;
  }

  function scheduleBind(){
    clearTimeout(timer);
    timer=setTimeout(bindButton,80);
  }

  function observe(){
    const page=document.getElementById('page-estandarizacion');
    if(!page)return false;
    try{observer?.disconnect?.()}catch(_){}
    observer=new MutationObserver(scheduleBind);
    observer.observe(page,{childList:true,subtree:true});
    return true;
  }

  function install(){
    bindButton();
    observe();
    let tries=0;
    const retry=setInterval(()=>{
      tries++;
      const bound=bindButton();
      if(bound||tries>=120){clearInterval(retry);observe()}
    },100);
  }

  window.StainherStandardizationReportR145=Object.freeze({install,generateReport,bindButton,version:BUILD});
  window.addEventListener('stainher:standardization-dashboard-r144-ready',install);
  window.addEventListener('stainher:standardization-r141-ready',install);
  window.addEventListener('stainher:runtime-r142-ready',install);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
