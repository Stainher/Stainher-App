/* Stainher V15.24 · R148 · Horas y layout visible en Correctivo.
 * - Mantiene R147: Hora llegada y Fin actividad además de Duración.
 * - Evita textos cortados en historial: columnas más amplias, alineación consistente
 *   y observaciones multilínea completas.
 * - PDF mensual y Confiabilidad: alinea encabezados/celdas y conserva salto de línea.
 */
(()=>{
  'use strict';
  const BUILD='20261002-r148-corrective-layout';
  if(window.__STAINHER_CORRECTIVE_TIMES_R147__===BUILD)return;
  window.__STAINHER_CORRECTIVE_TIMES_R147__=BUILD;

  const norm=value=>String(value??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const clean=value=>String(value??'').replace(/\s+/g,' ').trim();
  const time=value=>{
    const text=clean(value);
    if(!text)return '—';
    const m=text.match(/^(\d{1,2}):(\d{2})/);
    return m?`${String(m[1]).padStart(2,'0')}:${m[2]}`:text;
  };
  const endTime=row=>{
    const hour=time(row?.hora_termino);
    const start=String(row?.fecha_inicio||'');
    const end=String(row?.fecha_termino||'');
    return end&&start&&end!==start?`${hour} · ${end}`:hour;
  };

  function page(){return document.getElementById('page-correctivo')}
  function historyTable(){
    const root=page();if(!root)return null;
    return [...root.querySelectorAll('table')].find(table=>{
      const h=[...table.querySelectorAll('thead th')].map(th=>norm(th.textContent));
      return h.includes('fecha')&&h.includes('equipo')&&h.some(x=>x.includes('duraci'))&&h.some(x=>x.includes('observ'));
    })||null;
  }
  function visibleRows(){
    let rows=[...(window.state?.correctivo||[])];
    const eq=document.getElementById('corrEquipo')?.value||'';
    if(eq)rows=rows.filter(row=>row.equipo===eq);
    return rows;
  }
  function insertCell(row,before,textValue,className){
    const td=document.createElement('td');td.className=className;td.textContent=textValue;row.insertBefore(td,before);return td;
  }
  function enhanceHistory(){
    const table=historyTable();if(!table)return false;
    const headers=[...table.querySelectorAll('thead th')];
    if(!headers.some(th=>norm(th.textContent).includes('hora llegada'))){
      const responsibleIndex=headers.findIndex(th=>norm(th.textContent).includes('respons'));
      const durationIndex=headers.findIndex(th=>norm(th.textContent).includes('duraci'));
      if(responsibleIndex<0||durationIndex<0)return false;
      const tr=table.querySelector('thead tr');
      const durationTh=tr.children[durationIndex];
      const arrival=document.createElement('th');arrival.textContent='Hora llegada';arrival.className='r147-col-arrival';
      const finish=document.createElement('th');finish.textContent='Fin actividad';finish.className='r147-col-finish';
      tr.insertBefore(arrival,durationTh);tr.insertBefore(finish,durationTh);
      const rows=visibleRows();
      [...table.querySelectorAll('tbody tr')].forEach((bodyRow,index)=>{
        if(bodyRow.querySelector('.empty')){
          const td=bodyRow.querySelector('td[colspan]');if(td)td.colSpan=Number(td.colSpan||0)+2;
          return;
        }
        const source=rows[index];
        const before=bodyRow.children[durationIndex];
        insertCell(bodyRow,before,time(source?.hora_inicio),'r147-col-arrival');
        insertCell(bodyRow,before,endTime(source),'r147-col-finish');
      });
    }
    table.classList.add('stainher-corr-times-r147','stainher-corr-layout-r148');
    return true;
  }

  function installStyle(){
    const old=document.getElementById('stainher-corrective-times-r147-style');
    old?.remove();
    if(document.getElementById('stainher-corrective-layout-r148-style'))return;
    const s=document.createElement('style');s.id='stainher-corrective-layout-r148-style';
    s.textContent=`
      #page-correctivo .stainher-corr-times-r147{
        width:max(100%,1750px)!important;
        min-width:1750px!important;
        table-layout:fixed!important;
        border-collapse:collapse!important;
      }
      #page-correctivo .stainher-corr-times-r147 th,
      #page-correctivo .stainher-corr-times-r147 td{
        box-sizing:border-box!important;
        padding:10px 12px!important;
        vertical-align:middle!important;
        line-height:1.35!important;
        white-space:normal!important;
        overflow:visible!important;
        text-overflow:clip!important;
        overflow-wrap:break-word!important;
        word-break:normal!important;
        hyphens:none!important;
      }
      #page-correctivo .stainher-corr-times-r147 thead th{
        font-weight:700!important;
        line-height:1.25!important;
        text-align:left!important;
      }
      #page-correctivo .stainher-corr-times-r147 .r118-col-fecha{width:104px!important;text-align:center!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-equipo{width:135px!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-guia{width:165px!important;overflow-wrap:anywhere!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-responsable{width:135px!important}
      #page-correctivo .stainher-corr-times-r147 .r147-col-arrival{width:96px!important;text-align:center!important;white-space:nowrap!important}
      #page-correctivo .stainher-corr-times-r147 .r147-col-finish{width:132px!important;text-align:center!important;white-space:normal!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-duracion{width:92px!important;text-align:center!important;white-space:nowrap!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-estado{width:110px!important;text-align:center!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-observacion{width:350px!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-excluir{width:92px!important;text-align:center!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-motivo{width:170px!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-accion{width:105px!important;text-align:center!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-motivo select,
      #page-correctivo .stainher-corr-times-r147 .inline-select{
        width:100%!important;
        min-width:145px!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      #page-correctivo .stainher-corr-times-r147 .status,
      #page-correctivo .stainher-corr-times-r147 .action-mini{
        white-space:nowrap!important;
      }
      #page-correctivo .stainher-corr-times-r147 .stainher-corr-observation-r118{
        grid-template-columns:minmax(0,1fr) auto!important;
        align-items:start!important;
      }
      #page-correctivo .stainher-corr-times-r147 .stainher-corr-observation-preview-r118{
        display:block!important;
        overflow:visible!important;
        -webkit-line-clamp:unset!important;
        -webkit-box-orient:initial!important;
        white-space:normal!important;
        overflow-wrap:break-word!important;
        line-height:1.4!important;
      }
      #page-correctivo .stainher-corr-times-r147 .stainher-corr-observation-more-r118{
        align-self:start!important;
        margin-top:1px!important;
      }
      @media(max-width:900px){
        #page-correctivo .stainher-corr-history-r118{overflow-x:auto!important;-webkit-overflow-scrolling:touch!important}
        #page-correctivo .stainher-corr-times-r147{min-width:1500px!important;width:1500px!important}
      }
    `;
    document.head.appendChild(s);
  }

  function tableWidths(labels){
    const widths={
      'fecha':20,'equipo':25,'guia':28,'responsable':25,
      'hora llegada':18,'fin actividad':24,'duracion':16,'estado':18,
      'excluir kpi':15,'motivo':28,'observacion':52
    };
    const centered=['fecha','hora llegada','fin actividad','duracion','estado','excluir kpi'];
    const out={};labels.forEach((label,index)=>{
      const key=norm(label);
      const hit=Object.entries(widths).find(([name])=>key.includes(name));
      if(hit)out[index]={cellWidth:hit[1],halign:centered.some(name=>key.includes(name))?'center':'left',valign:'middle'};
    });
    return out;
  }

  function enhanceAutoTableOptions(options,sourceRows){
    const head=options?.head?.[0];
    if(!Array.isArray(head))return options;
    const labels=head.map(norm);
    if(!labels.some(x=>x.includes('duraci'))||!labels.some(x=>x.includes('respons'))||labels.some(x=>x.includes('hora llegada')))return options;
    const responsibleIndex=labels.findIndex(x=>x.includes('respons'));
    const insertAt=responsibleIndex+1;
    head.splice(insertAt,0,'Hora llegada','Fin actividad');
    if(Array.isArray(options.body)){
      options.body.forEach((row,index)=>{
        if(!Array.isArray(row))return;
        const source=sourceRows?.[index];
        row.splice(insertAt,0,source?time(source.hora_inicio):'—',source?endTime(source):'—');
      });
    }
    options.columnStyles=tableWidths(head);
    options.styles={...(options.styles||{}),fontSize:Math.min(Number(options.styles?.fontSize||7),6.4),cellPadding:1.4,overflow:'linebreak',valign:'middle',minCellHeight:7};
    options.headStyles={...(options.headStyles||{}),halign:'center',valign:'middle',overflow:'linebreak'};
    options.margin={...(options.margin||{}),left:14,right:14};
    return options;
  }

  async function withAutoTableTimes(sourceRows,task){
    const API=window.jspdf?.jsPDF?.API;
    const original=API?.autoTable;
    if(typeof original!=='function')return await task();
    API.autoTable=function(options,...args){
      try{enhanceAutoTableOptions(options,sourceRows)}catch(error){console.warn('[R148] No se pudo alinear tabla PDF',error)}
      return original.call(this,options,...args);
    };
    try{return await task()}finally{API.autoTable=original}
  }

  function wrapMonthlyPdf(){
    const current=window.downloadCorrectivoReport;
    if(typeof current!=='function'||current.__stainherR147)return false;
    const wrapped=function(){
      const rows=visibleRows();
      return withAutoTableTimes(rows,()=>current.apply(this,arguments));
    };
    wrapped.__stainherR147=true;wrapped.__base=current;
    window.downloadCorrectivoReport=wrapped;
    try{downloadCorrectivoReport=wrapped}catch(_){ }
    return true;
  }

  function wrapReliabilityPdf(){
    const current=window.v158BuildReviewedReliabilityPdf;
    if(typeof current!=='function'||current.__stainherR147)return false;
    const wrapped=async function(){
      const rows=Array.isArray(window.state?.v158ReliabilityReview?.rows)?window.state.v158ReliabilityReview.rows:[];
      return await withAutoTableTimes(rows,()=>current.apply(this,arguments));
    };
    wrapped.__stainherR147=true;wrapped.__base=current;
    window.v158BuildReviewedReliabilityPdf=wrapped;
    return true;
  }

  let busy=false,pending=false;
  function enhance(){
    if(busy)return;busy=true;
    try{installStyle();enhanceHistory();wrapMonthlyPdf();wrapReliabilityPdf()}
    finally{busy=false}
  }
  function schedule(){if(pending)return;pending=true;requestAnimationFrame(()=>{pending=false;enhance()})}
  function install(){
    enhance();
    const root=page()||document.getElementById('appView')||document.body;
    new MutationObserver(()=>{if(!busy)schedule()}).observe(root,{childList:true,subtree:true});
    window.addEventListener('stainher:correctivo-history-r118-ready',schedule);
    window.addEventListener('stainher:reliability-pdf-r119-ready',schedule);
    window.addEventListener('stainher:modules-ready',schedule);
    setTimeout(schedule,100);setTimeout(schedule,500);setTimeout(schedule,1200);
  }

  window.StainherCorrectivoTimesR147=Object.freeze({install,enhance,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
