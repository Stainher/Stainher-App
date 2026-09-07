/* Stainher App V15.24 · Confiabilidad: descarga directa
 * - Aprobar y generar informe descarga el PDF localmente.
 * - El flujo de correo queda eliminado de Confiabilidad.
 * - La barra de acciones se mantiene dentro del flujo y no tapa contenido móvil.
 */
(function bootstrapStainherReliabilityActions(){
  const EMERGENCY_STYLE_ID = 'stainher-reliability-actions-flow-guard';
  if (!document.getElementById(EMERGENCY_STYLE_ID)) {
    const guard = document.createElement('style');
    guard.id = EMERGENCY_STYLE_ID;
    guard.textContent = '#modalRoot .v158-review-modal{display:block!important;overflow-x:hidden!important;overflow-y:auto!important}#modalRoot .v158-review-modal>.v158-review-grid{overflow:visible!important;flex:none!important;min-height:auto!important;max-height:none!important}#modalRoot .v158-review-modal>.v158-review-actions{position:static!important;inset:auto!important;z-index:auto!important;width:100%!important;box-sizing:border-box!important;margin-top:14px!important;padding:14px 0 0!important;background:transparent!important}';
    document.head.appendChild(guard);
  }
  if (window.__STAINHER_RELIABILITY_ACTIONS__) return;
  const ready = typeof window.renderCorrectivoShell === 'function'
    && typeof window.loadCorrectivo === 'function';
  if (!ready) {
    setTimeout(bootstrapStainherReliabilityActions, 250);
    return;
  }
  window.__STAINHER_RELIABILITY_ACTIONS__ = true;

  const STYLE_ID = 'stainher-reliability-actions-style';

  function mountStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #page-correctivo .v1524-reliability-toolbar{
        position:static!important;
        inset:auto!important;
        z-index:auto!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #page-correctivo .v1524-reliability-toolbar .btn{
        min-width:0!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      #modalRoot .v158-review-modal{
        display:block!important;
        overflow-x:hidden!important;
        overflow-y:auto!important;
      }
      #modalRoot .v158-review-modal>.v158-review-grid{
        overflow:visible!important;
        flex:none!important;
        min-height:auto!important;
        max-height:none!important;
      }
      #modalRoot .v158-review-modal>.v158-review-actions{
        position:static!important;
        inset:auto!important;
        z-index:auto!important;
        width:100%!important;
        box-sizing:border-box!important;
        margin-top:14px!important;
        padding:14px 0 0!important;
        background:transparent!important;
      }
      @media(max-width:900px){
        #page-correctivo{
          padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))!important;
          min-width:0!important;
          max-width:100%!important;
          overflow-x:hidden!important;
        }
        #page-correctivo .v1524-reliability-toolbar{
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:8px!important;
          align-items:stretch!important;
          margin:0 0 14px!important;
          overflow:visible!important;
        }
        #page-correctivo .v1524-reliability-toolbar .btn{
          width:100%!important;
          min-height:44px!important;
          padding:9px 10px!important;
          white-space:normal!important;
          overflow-wrap:anywhere!important;
          line-height:1.2!important;
        }
      }
      @media(max-width:420px){
        #page-correctivo .v1524-reliability-toolbar{
          grid-template-columns:minmax(0,1fr)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function addReliabilityChart(doc, canvasId, title, xLabel, yLabel, analysis, y, hasData){
    if (y > 125) { doc.addPage(); y = 20; }
    const leftX = 14, leftW = 165, rightX = 186, rightW = 97;
    doc.setTextColor(28,34,41); doc.setFont('helvetica','bold'); doc.setFontSize(10.5); doc.text(title,leftX,y);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5); doc.setTextColor(68,76,86);
    doc.text(`Eje X: ${xLabel}`,leftX,y+5); doc.text(`Eje Y: ${yLabel}`,leftX+75,y+5);
    const canvas = document.getElementById(canvasId);
    let embedded = false;
    if (hasData && canvas && canvas.width > 0 && canvas.height > 0) {
      try {
        const image = canvas.toDataURL('image/png',1);
        if (image && image.length > 100) { doc.addImage(image,'PNG',leftX,y+9,leftW,63); embedded = true; }
      } catch (error) { console.warn(`[Confiabilidad PDF] No se pudo capturar ${canvasId}`,error); }
    }
    if (!embedded) {
      doc.setDrawColor(190,196,204); doc.setFillColor(246,248,250); doc.roundedRect(leftX,y+9,leftW,63,2,2,'FD');
      doc.setTextColor(94,103,114); doc.setFont('helvetica','bold'); doc.setFontSize(12);
      doc.text(hasData?'Gráfico no disponible':'Sin datos válidos para graficar',leftX+leftW/2,y+38,{align:'center'});
      doc.setFont('helvetica','normal'); doc.setFontSize(8);
      doc.text(hasData?'Actualiza la vista de Confiabilidad y genera nuevamente el informe.':'El gráfico se completará cuando existan atenciones válidas en el período.',leftX+leftW/2,y+45,{align:'center'});
    }
    doc.setTextColor(28,34,41); doc.setFont('helvetica','bold'); doc.setFontSize(9); doc.text('Análisis técnico preliminar',rightX,y);
    doc.setFont('helvetica','normal'); doc.setFontSize(7.6); doc.setTextColor(35,42,50);
    const lines = doc.splitTextToSize(analysis||'',rightW);
    doc.text(lines,rightX,y+7,{maxWidth:rightW,lineHeightFactor:1.22});
    return y + Math.max(76,lines.length*4+12);
  }

  async function prepareReliabilityCharts(){
    const details=[],seen=new Set();
    ['chartEq','chartHours','chartTrend'].forEach(id=>{
      const canvas=document.getElementById(id),panel=canvas?.closest?.('details');
      if(panel&&!seen.has(panel)){seen.add(panel);details.push([panel,panel.open]);panel.open=true}
    });
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    await new Promise(resolve=>setTimeout(resolve,80));
    ['chartEq','chartHours','chartTrend'].forEach(id=>{
      const canvas=document.getElementById(id);
      const chart=canvas&&window.Chart?(typeof Chart.getChart==='function'?Chart.getChart(canvas):Object.values(Chart.instances||{}).find(item=>item?.canvas===canvas)):null;
      try{chart?.resize?.();chart?.update?.('none')}catch(error){console.warn(`[Confiabilidad PDF] No se pudo preparar ${id}`,error)}
    });
    await new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve)));
    return ()=>details.forEach(([panel,open])=>{panel.open=open});
  }

  function sectionTitle(doc,title,y){
    doc.setFillColor(239,244,249);doc.roundedRect(14,y-4,268,9,1.5,1.5,'F');
    doc.setFillColor(41,103,157);doc.rect(14,y-4,2.2,9,'F');
    doc.setTextColor(28,34,41);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text(title,19,y+1);
    return y+8;
  }

  function drawParetoChart(doc,rank,y){
    const items=(rank||[]).slice(0,10),total=items.reduce((sum,[,item])=>sum+Number(item.n||0),0);
    if(!items.length||!total)return y;
    if(y>105){doc.addPage();y=20}
    y=sectionTitle(doc,'Gráfico Pareto 80/20 · recurrencia por equipo',y);
    const left=22,top=y+8,width=250,height=48,bottom=top+height,max=Math.max(...items.map(([,item])=>Number(item.n||0)),1),slot=width/items.length,barWidth=Math.min(22,slot*.56);
    doc.setFont('helvetica','normal');doc.setFontSize(6.5);doc.setTextColor(75,85,96);
    doc.text('Eventos',14,top-3);doc.text('% acumulado',282,top-3,{align:'right'});
    doc.setDrawColor(207,215,224);doc.setLineWidth(.25);
    for(let step=0;step<=4;step++){
      const py=bottom-height*step/4;doc.line(left,py,left+width,py);
      doc.text(String(Math.round(max*step/4)),left-3,py+1.5,{align:'right'});
      doc.text(`${step*25}%`,left+width+3,py+1.5);
    }
    const y80=bottom-height*.8;doc.setDrawColor(220,74,64);doc.setLineWidth(.65);doc.setLineDashPattern([2,1],0);doc.line(left,y80,left+width,y80);doc.setLineDashPattern([],0);doc.setTextColor(190,45,38);doc.setFont('helvetica','bold');doc.text('80%',left+width-1,y80-1.5,{align:'right'});
    let cumulative=0,previous=null;
    items.forEach(([name,item],index)=>{
      const count=Number(item.n||0),center=left+slot*(index+.5),barHeight=height*count/max;
      const priority=cumulative/total<.8;
      doc.setFillColor(...(priority?[72,142,196]:[174,187,201]));doc.setDrawColor(...(priority?[45,102,151]:[128,143,158]));doc.roundedRect(center-barWidth/2,bottom-barHeight,barWidth,barHeight,1,1,'FD');
      doc.setTextColor(35,51,67);doc.setFont('helvetica','bold');doc.setFontSize(6.5);doc.text(String(count),center,bottom-barHeight-1.5,{align:'center'});
      cumulative+=count;const percent=cumulative/total*100,pointY=bottom-height*percent/100;
      if(previous){doc.setDrawColor(239,147,39);doc.setLineWidth(.8);doc.line(previous.x,previous.y,center,pointY)}
      doc.setFillColor(239,147,39);doc.circle(center,pointY,1.35,'F');previous={x:center,y:pointY};
      const label=String(name||'Equipo');doc.setTextColor(65,74,84);doc.setFont('helvetica','normal');doc.setFontSize(5.8);doc.text(label.length>15?label.slice(0,14)+'…':label,center,bottom+5,{align:'center'});
    });
    doc.setFontSize(6.5);doc.setTextColor(72,142,196);doc.setFont('helvetica','bold');doc.text('■ Prioridad hasta 80%',left,bottom+12);
    doc.setTextColor(220,130,25);doc.text('● % acumulado',left+53,bottom+12);
    doc.setTextColor(190,45,38);doc.text('--- Umbral 80%',left+97,bottom+12);
    return bottom+18;
  }

  function median(values){
    const sorted=values.filter(Number.isFinite).sort((a,b)=>a-b),middle=Math.floor(sorted.length/2);
    return sorted.length?(sorted.length%2?sorted[middle]:(sorted[middle-1]+sorted[middle])/2):0;
  }

  function drawRepairFrequencyScatter(doc,rank,y){
    const items=(rank||[]).map(([name,item])=>({name:String(name||'Equipo'),failures:Number(item.n||0),mttr:Number(item.n)>0?Number(item.h||0)/Number(item.n):0})).filter(item=>item.failures>0&&Number.isFinite(item.mttr));
    if(!items.length)return y;
    if(y>98){doc.addPage();y=20}
    y=sectionTitle(doc,'Matriz de criticidad · frecuencia de fallas vs tiempo de reparación',y);
    const left=29,top=y+10,width=238,height=63,bottom=top+height,right=left+width;
    const maxX=Math.max(...items.map(item=>item.failures),1)*1.12,maxY=Math.max(...items.map(item=>item.mttr),1)*1.15;
    const cutX=Math.max(median(items.map(item=>item.failures)),.5),cutY=Math.max(median(items.map(item=>item.mttr)),.1);
    const splitX=left+width*Math.min(cutX/maxX,.92),splitY=bottom-height*Math.min(cutY/maxY,.92);
    doc.setFillColor(241,246,242);doc.rect(left,splitY,splitX-left,bottom-splitY,'F');
    doc.setFillColor(255,247,229);doc.rect(splitX,splitY,right-splitX,bottom-splitY,'F');
    doc.setFillColor(255,239,238);doc.rect(left,top,splitX-left,splitY-top,'F');
    doc.setFillColor(253,231,232);doc.rect(splitX,top,right-splitX,splitY-top,'F');
    doc.setFont('helvetica','bold');doc.setFontSize(7);
    doc.setTextColor(84,107,91);doc.text('SIN RELEVANCIA',left+3,bottom-3);
    doc.setTextColor(166,109,20);doc.text('CRÓNICAS',splitX+3,bottom-3);
    doc.setTextColor(176,75,67);doc.text('AGUDAS',left+3,top+6);
    doc.setTextColor(157,43,52);doc.text('AGUDAS Y CRÓNICAS',splitX+3,top+6);
    doc.setDrawColor(142,154,168);doc.setLineWidth(.35);doc.line(left,bottom,right,bottom);doc.line(left,top,left,bottom);
    doc.setDrawColor(105,117,130);doc.setLineDashPattern([2,1],0);doc.line(splitX,top,splitX,bottom);doc.line(left,splitY,right,splitY);doc.setLineDashPattern([],0);
    doc.setFont('helvetica','normal');doc.setFontSize(6.3);doc.setTextColor(67,77,88);
    doc.text(`Corte: ${cutX.toFixed(1)} fallas`,splitX,bottom+5,{align:'center'});
    doc.text(`Corte: ${cutY.toFixed(1)} h`,left-2,splitY+1,{align:'right'});
    doc.text('Cantidad de fallas',left+width/2,bottom+11,{align:'center'});
    doc.text('Tiempo medio de reparación [h]',14,top+height/2,{angle:90,align:'center'});
    items.forEach((item,index)=>{
      const px=left+width*Math.min(item.failures/maxX,1),py=bottom-height*Math.min(item.mttr/maxY,1);
      const highX=item.failures>=cutX,highY=item.mttr>=cutY;
      const color=highX&&highY?[190,52,62]:highY?[224,111,75]:highX?[226,151,46]:[87,151,112];
      doc.setFillColor(...color);doc.setDrawColor(255,255,255);doc.circle(px,py,2.25,'FD');
      const label=item.name.length>18?item.name.slice(0,17)+'…':item.name;
      doc.setTextColor(38,48,59);doc.setFontSize(5.8);doc.setFont('helvetica','bold');
      doc.text(label,px+(index%2?2.8:-2.8),py-2.8,{align:index%2?'left':'right'});
    });
    doc.setFont('helvetica','normal');doc.setFontSize(6.2);doc.setTextColor(80,89,99);
    doc.text('Cada punto representa un equipo. Los cortes corresponden a las medianas del período seleccionado.',left,bottom+17);
    return bottom+23;
  }

  function downloadPdf(doc,fileName){
    try {
      const blob=doc.output('blob');
      const url=URL.createObjectURL(blob);
      const link=document.createElement('a');
      link.href=url;link.download=fileName;link.rel='noopener';link.style.display='none';
      document.body.appendChild(link);link.click();link.remove();
      setTimeout(()=>URL.revokeObjectURL(url),1500);
      return true;
    } catch (error) {
      console.warn('[Confiabilidad PDF] Descarga por Blob no disponible',error);
      try { doc.save(fileName); return true; }
      catch (fallbackError) { console.error('[Confiabilidad PDF] No se pudo descargar',fallbackError); return false; }
    }
  }

  /* Esta implementación incorpora los tres canvas y descarga el archivo
   * mediante un Blob, con respaldo al mecanismo nativo de jsPDF. */
  window.v158BuildReviewedReliabilityPdf = async function(){
    const r = window.state?.v158ReliabilityReview;
    if (!r) return;
    const C = window.ensurePdf?.();
    if (!C) return window.toast?.('No se pudo cargar el generador PDF','error');
    const c = r.content || {}, opt = r.opt || {};
    const restoreCharts=opt.graficos===true?await prepareReliabilityCharts():()=>{};
    const doc = new C({orientation:'landscape',unit:'mm',format:'a4'});
    window.pdfHeader?.(doc,'Informe Técnico de Confiabilidad',`${window.v1512RangeLabel(window.state.correctivoFrom,window.state.correctivoTo)} · ${r.eq||'Todos los equipos'}`);
    doc.setTextColor(28,34,41); let y = 45;
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
    doc.text(`Revisión técnica: ${window.state.profile?.nombre||window.state.session?.user?.email||'—'} · ${new Date().toLocaleString('es-CL')}`,14,y); y += 7;
    if(opt.resumen===true){
      y=sectionTitle(doc,'Resumen ejecutivo',y);
      doc.setFont('helvetica','normal'); doc.setFontSize(8);
      const summary = doc.splitTextToSize(c.resumen||'',268); doc.text(summary,14,y,{maxWidth:268,lineHeightFactor:1.22}); y += summary.length*4+7;
    }
    if(opt.kpis===true){
      doc.autoTable({startY:y,body:[
        [`Atenciones válidas: ${r.valid.length}`,`Horas de intervención: ${r.hours.toFixed(1)} h`,`MTTR: ${r.rel.ready?r.rel.mttr.toFixed(1)+' h':'N/D'}`],
        [`MTBF: ${r.rel.ready?r.rel.mtbf.toFixed(1)+' h':'N/D'}`,`Disponibilidad: ${r.rel.ready?r.rel.disponibilidad.toFixed(1)+'%':'N/D'}`,`Mayor recurrencia: ${r.top?r.top[0]:'N/D'}`]
      ],theme:'grid',styles:{fontSize:8,textColor:[28,34,41]}}); y = doc.lastAutoTable.finalY + 8;
    }
    if (opt.graficos===true) {
      const hasData = r.valid.length > 0;
      y = addReliabilityChart(doc,'chartEq','Distribución de fallas por equipo','Equipo','Número de fallas [eventos]',c.fallas,y,hasData);
      y = addReliabilityChart(doc,'chartHours','Horas de intervención por equipo','Equipo','Horas de intervención [h]',c.horas,y,hasData);
      y = addReliabilityChart(doc,'chartTrend','Tendencia de indicadores de confiabilidad','Período','Indicador de confiabilidad',c.tendencia,y,hasData);
    }
    const textSection = (title,value)=>{if(y>135){doc.addPage();y=20}y=sectionTitle(doc,title,y);doc.setFont('helvetica','normal');doc.setFontSize(8);const lines=doc.splitTextToSize(value||'',268);doc.text(lines,14,y,{maxWidth:268,lineHeightFactor:1.22});y+=lines.length*4+7};
    if(opt.kpis===true){
      textSection('Análisis de disponibilidad',c.disponibilidad);
      let cumulative=0,total=r.valid.length||1;
      const pareto=r.rank.slice(0,10).map(([name,item],index)=>{cumulative+=item.n;return[index+1,name,item.n,item.h.toFixed(1),(item.n/total*100).toFixed(1)+'%',(cumulative/total*100).toFixed(1)+'%']});
      y=drawParetoChart(doc,r.rank,y);
      if(y>120){doc.addPage();y=20}doc.setTextColor(28,34,41);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Pareto de recurrencia por equipo',14,y);y+=4;
      doc.autoTable({startY:y,head:[['#','Equipo','Eventos','Horas','% eventos','% acumulado']],body:pareto.length?pareto:[['—','Sin datos','0','0','0%','0%']],styles:{fontSize:7.5,textColor:[28,34,41]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});y=doc.lastAutoTable.finalY+6;
      textSection('Análisis Pareto',c.pareto);
      y=drawRepairFrequencyScatter(doc,r.rank,y);
    }
    if(opt.resumen===true){textSection('Hallazgos',c.hallazgos);textSection('Hipótesis de causa raíz',c.hipotesis);textSection('Recomendaciones técnicas',c.recomendaciones);textSection('Conclusiones',c.conclusiones)}
    if(opt.historial===true){if(y>115){doc.addPage();y=20}doc.autoTable({startY:y,head:[['Fecha','Equipo','Guía','Responsable','Duración','Estado','Observación']],body:r.rows.map(item=>[item.fecha_inicio||'',item.equipo||'',item.guia||'—',item.responsable||'—',window.fmtH(item.duracion_horas),item.estado_normalizado||'',item.observaciones||'']),styles:{fontSize:6.8,textColor:[28,34,41]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]},columnStyles:{6:{cellWidth:75}}})}
    if(opt.metodologia===true){textSection('Metodología de cálculo','MTTR = horas totales de intervención ÷ fallas válidas. MTBF = horas operativas ÷ fallas válidas. Disponibilidad = horas operativas ÷ horas calendario × 100. Los registros marcados como excluidos por causa externa permanecen en el historial, pero no afectan los indicadores.')}
    const fileName=`Stainher_App_Confiabilidad_${window.state.correctivoFrom}_${window.state.correctivoTo}.pdf`;
    if(!downloadPdf(doc,fileName)){restoreCharts();return window.toast?.('El informe se generó, pero el navegador bloqueó la descarga. Habilita las descargas para este sitio e inténtalo nuevamente.','error')}
    restoreCharts();
    window.closeModal?.(); window.toast?.('Informe aprobado y PDF descargado','success');
  };

  function ensureActions(){
    mountStyle();
    const page = document.getElementById('page-correctivo');
    if (!page) return;
    const tabs = page.querySelector('.v1519-corr-tabs')
      || page.querySelector('.v1518-corr-actions,.v1516-corr-top-tabs');
    if (!tabs) return;
    tabs.classList.add('v1524-reliability-toolbar');
    page.querySelectorAll('[data-v1524-reliability-email]').forEach(button => button.remove());

    page.querySelectorAll('.v153-corr-tabs,.v154-corr-tabs-fixed,.v1516-corr-top-tabs,.v1518-corr-actions,.v1519-corr-tabs').forEach(group => {
      if (group === tabs) return;
      const labels = [...group.querySelectorAll('button')].map(button => button.textContent || '').join(' ');
      if (/Confiabilidad/i.test(labels) && /Historial/i.test(labels) && /Generar informe/i.test(labels)) group.remove();
    });
  }

  function ensureReviewActions(){
    const modal = document.querySelector('#modalRoot .v158-review-modal');
    const actions = modal?.querySelector('.v158-review-actions');
    if (!actions) return;

    const approve = [...actions.querySelectorAll('button')].find(button => /Aprobar.*generar PDF/i.test(button.textContent || ''));
    if (approve) approve.textContent = 'Aprobar y generar PDF';

    actions.querySelectorAll('[data-v1524-reliability-email]').forEach(button=>button.remove());
    [...actions.querySelectorAll('button')].filter(button=>/Enviar por correo/i.test(button.textContent||'')).forEach(button=>button.remove());
  }

  function wrapRender(name){
    const fn = window[name];
    if (typeof fn !== 'function' || fn.__v1524ReliabilityActions) return;
    const wrapped = function(){
      const out = fn.apply(this, arguments);
      Promise.resolve(out).finally(() => setTimeout(ensureActions, 0));
      return out;
    };
    wrapped.__v1524ReliabilityActions = true;
    wrapped.__base = fn;
    window[name] = wrapped;
  }

  const originalCloseModal = window.closeModal;
  window.closeModal = function(){
    if (window.__STAINHER_KEEP_RELIABILITY_REVIEW__ && document.querySelector('#modalRoot .v158-review-modal')) return;
    return originalCloseModal.apply(this, arguments);
  };

  window.v158ApproveReliabilityReport = async function(){
    const currentRole=String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase();
    if(!['administrador','confiabilidad'].includes(currentRole))return window.toast?.('La aprobación requiere perfil Administrador o Confiabilidad.','error');
    const review=window.state?.v158ReliabilityReview;if(!review)return;
    review.content=typeof window.v158CollectReview==='function'?window.v158CollectReview():review.content;
    /* La descarga se inicia dentro del gesto del usuario, antes de esperar la
     * escritura remota. Así Safari y la aplicación de escritorio no la bloquean. */
    window.__STAINHER_KEEP_RELIABILITY_REVIEW__=true;
    try{
      await window.v158BuildReviewedReliabilityPdf();
      if(typeof window.v158SaveReliabilityDraft==='function')await window.v158SaveReliabilityDraft('aprobado');
    }finally{
      window.__STAINHER_KEEP_RELIABILITY_REVIEW__=false;
      window.closeModal?.();
      setTimeout(ensureReviewActions,200);
    }
  };

  mountStyle();
  wrapRender('renderCorrectivoShell');
  wrapRender('loadCorrectivo');
  let observerQueued = false;
  const observer = new MutationObserver(() => {
    if (observerQueued) return;
    observerQueued = true;
    setTimeout(() => {
      observerQueued = false;
      ensureActions();
      ensureReviewActions();
    }, 0);
  });
  observer.observe(document.body, { childList:true, subtree:true });
  setTimeout(ensureActions, 0);
})();
