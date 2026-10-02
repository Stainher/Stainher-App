/* Stainher V15.24 · R147 · Horas visibles en Correctivo.
 * - Historial: Hora llegada y Fin actividad además de Duración.
 * - Descarga de historial: conserva ambas horas porque R118 exporta las columnas visibles.
 * - Informe mensual PDF y PDF técnico de Confiabilidad: incorpora ambas horas sin cambiar KPI.
 */
(()=>{
  'use strict';
  const BUILD='20261002-r147-corrective-times';
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
    if(headers.some(th=>norm(th.textContent).includes('hora llegada')))return true;
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
    table.classList.add('stainher-corr-times-r147');
    return true;
  }

  function installStyle(){
    if(document.getElementById('stainher-corrective-times-r147-style'))return;
    const s=document.createElement('style');s.id='stainher-corrective-times-r147-style';
    s.textContent=`
      #page-correctivo .stainher-corr-times-r147{min-width:1400px!important;table-layout:fixed!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-fecha{width:6%!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-equipo{width:7.5%!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-guia{width:10%!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-responsable{width:8%!important}
      #page-correctivo .stainher-corr-times-r147 .r147-col-arrival{width:6%!important;text-align:center!important;white-space:nowrap!important}
      #page-correctivo .stainher-corr-times-r147 .r147-col-finish{width:7%!important;text-align:center!important;white-space:normal!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-duracion{width:5.5%!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-estado{width:6.5%!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-observacion{width:27%!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-excluir{width:6%!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-motivo{width:5%!important}
      #page-correctivo .stainher-corr-times-r147 .r118-col-accion{width:5.5%!important}
    `;
    document.head.appendChild(s);
  }

  function tableWidths(labels){
    const widths={
      'fecha':20,'equipo':26,'guia':30,'responsable':26,
      'hora llegada':17,'fin actividad':19,'duracion':15,'estado':18,
      'excluir kpi':15,'motivo':30,'observacion':53
    };
    const out={};labels.forEach((label,index)=>{
      const key=norm(label);
      const hit=Object.entries(widths).find(([name])=>key.includes(name));
      if(hit)out[index]={cellWidth:hit[1]};
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
    options.styles={...(options.styles||{}),fontSize:Math.min(Number(options.styles?.fontSize||7),6.6),cellPadding:1.5,overflow:'linebreak'};
    return options;
  }

  async function withAutoTableTimes(sourceRows,task){
    const API=window.jspdf?.jsPDF?.API;
    const original=API?.autoTable;
    if(typeof original!=='function')return await task();
    API.autoTable=function(options,...args){
      try{enhanceAutoTableOptions(options,sourceRows)}catch(error){console.warn('[R147] No se pudo enriquecer tabla PDF',error)}
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
