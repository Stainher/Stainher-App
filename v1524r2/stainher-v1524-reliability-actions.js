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
    try { doc.text(lines,rightX,y+7,{maxWidth:rightW,align:'justify'}); } catch (_) { doc.text(lines,rightX,y+7); }
    return y + Math.max(76,lines.length*4+12);
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
    const c = r.content || {}, doc = new C({orientation:'landscape',unit:'mm',format:'a4'});
    window.pdfHeader?.(doc,'Informe Técnico de Confiabilidad',`${window.v1512RangeLabel(window.state.correctivoFrom,window.state.correctivoTo)} · ${r.eq||'Todos los equipos'}`);
    doc.setTextColor(28,34,41); let y = 45;
    doc.setFont('helvetica','normal'); doc.setFontSize(7.5);
    doc.text(`Revisión técnica: ${window.state.profile?.nombre||window.state.session?.user?.email||'—'} · ${new Date().toLocaleString('es-CL')}`,14,y); y += 7;
    doc.setFont('helvetica','bold'); doc.setFontSize(11); doc.text('Resumen ejecutivo',14,y); y += 5;
    doc.setFont('helvetica','normal'); doc.setFontSize(8);
    const summary = doc.splitTextToSize(c.resumen||'',268); doc.text(summary,14,y,{maxWidth:268,align:'justify'}); y += summary.length*4+7;
    doc.autoTable({startY:y,body:[
      [`Atenciones válidas: ${r.valid.length}`,`Horas de intervención: ${r.hours.toFixed(1)} h`,`MTTR: ${r.rel.ready?r.rel.mttr.toFixed(1)+' h':'N/D'}`],
      [`MTBF: ${r.rel.ready?r.rel.mtbf.toFixed(1)+' h':'N/D'}`,`Disponibilidad: ${r.rel.ready?r.rel.disponibilidad.toFixed(1)+'%':'N/D'}`,`Mayor recurrencia: ${r.top?r.top[0]:'N/D'}`]
    ],theme:'grid',styles:{fontSize:8,textColor:[28,34,41]}}); y = doc.lastAutoTable.finalY + 8;
    if (r.opt?.graficos !== false) {
      const hasData = r.valid.length > 0;
      y = addReliabilityChart(doc,'chartEq','Distribución de fallas por equipo','Equipo','Número de fallas [eventos]',c.fallas,y,hasData);
      y = addReliabilityChart(doc,'chartHours','Horas de intervención por equipo','Equipo','Horas de intervención [h]',c.horas,y,hasData);
      y = addReliabilityChart(doc,'chartTrend','Tendencia de indicadores de confiabilidad','Período','Indicador de confiabilidad',c.tendencia,y,hasData);
    }
    const textSection = (title,value)=>{if(y>135){doc.addPage();y=20}doc.setTextColor(28,34,41);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text(title,14,y);y+=5;doc.setFont('helvetica','normal');doc.setFontSize(8);const lines=doc.splitTextToSize(value||'',268);doc.text(lines,14,y,{maxWidth:268,align:'justify'});y+=lines.length*4+7};
    textSection('Análisis de disponibilidad',c.disponibilidad);
    let cumulative=0,total=r.valid.length||1;
    const pareto=r.rank.slice(0,10).map(([name,item],index)=>{cumulative+=item.n;return[index+1,name,item.n,item.h.toFixed(1),(item.n/total*100).toFixed(1)+'%',(cumulative/total*100).toFixed(1)+'%']});
    if(y>120){doc.addPage();y=20}doc.setTextColor(28,34,41);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Pareto de recurrencia por equipo',14,y);y+=4;
    doc.autoTable({startY:y,head:[['#','Equipo','Eventos','Horas','% eventos','% acumulado']],body:pareto.length?pareto:[['—','Sin datos','0','0','0%','0%']],styles:{fontSize:7.5,textColor:[28,34,41]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});y=doc.lastAutoTable.finalY+6;
    textSection('Análisis Pareto',c.pareto); textSection('Hallazgos',c.hallazgos); textSection('Hipótesis de causa raíz',c.hipotesis); textSection('Recomendaciones técnicas',c.recomendaciones); textSection('Conclusiones',c.conclusiones);
    if(r.opt?.historial){if(y>115){doc.addPage();y=20}doc.autoTable({startY:y,head:[['Fecha','Equipo','Guía','Responsable','Duración','Estado','Observación']],body:r.rows.map(item=>[item.fecha_inicio||'',item.equipo||'',item.guia||'—',item.responsable||'—',window.fmtH(item.duracion_horas),item.estado_normalizado||'',item.observaciones||'']),styles:{fontSize:6.8,textColor:[28,34,41]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]},columnStyles:{6:{cellWidth:75}}})}
    const fileName=`Stainher_App_Confiabilidad_${window.state.correctivoFrom}_${window.state.correctivoTo}.pdf`;
    if(!downloadPdf(doc,fileName))return window.toast?.('El informe se generó, pero el navegador bloqueó la descarga. Habilita las descargas para este sitio e inténtalo nuevamente.','error');
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

  const originalApprove = window.v158ApproveReliabilityReport;
  if (typeof originalApprove === 'function') {
    window.v158ApproveReliabilityReport = async function(){
      window.__STAINHER_KEEP_RELIABILITY_REVIEW__ = true;
      try { return await originalApprove.apply(this, arguments); }
      finally {
        window.__STAINHER_KEEP_RELIABILITY_REVIEW__ = false;
        setTimeout(ensureReviewActions, 200);
      }
    };
  }

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
