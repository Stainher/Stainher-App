/* R321 - Exportacion Excel de planificacion preventiva visible, sin alterar PDF. */
(()=>{
'use strict';
if(window.__STAINHER_PREV_EXCEL_R321__)return;
window.__STAINHER_PREV_EXCEL_R321__=true;
function exportExcel(){
  try{
    const rows=window.state?.v1520PrevRows;
    if(!Array.isArray(rows))throw new Error('Primero carga la planificación preventiva.');
    if(!window.XLSX?.utils?.book_new)throw new Error('No está disponible la biblioteca Excel.');
    const value=r=>{try{return typeof window.v1520PrevComputed==='function'?window.v1520PrevComputed(r):null}catch(_){return null}};
    const data=rows.map(r=>({
      'Período EDP': [r.anio,r.mes].filter(Boolean).join('-'),
      'Equipo':r.equipos?.nombre||r.equipo_nombre||'',
      'Actividad':r.actividad||'',
      'Frecuencia':r.frecuencia||'',
      'Fecha programada':r.fecha_programada||'',
      'Fecha ejecución':r.fecha_ejecucion||'',
      'Estado':value(r)?.label||r.estado||'',
      'Cumplimiento':r.cumplimiento??'',
      'Observación':r.observacion||''
    }));
    const wb=window.XLSX.utils.book_new();
    const sheet=window.XLSX.utils.json_to_sheet(data.length?data:[{'Período EDP':'Sin actividades para los filtros seleccionados'}]);
    sheet['!cols']=[{wch:16},{wch:30},{wch:55},{wch:18},{wch:19},{wch:19},{wch:23},{wch:18},{wch:65}];
    window.XLSX.utils.book_append_sheet(wb,sheet,'Planificación preventiva');
    const from=String(window.state?.v1520PrevFrom||'inicio').replace(/[^0-9-]/g,'');
    const to=String(window.state?.v1520PrevTo||'fin').replace(/[^0-9-]/g,'');
    window.XLSX.writeFile(wb,`Preventivo_${from}_${to}.xlsx`);
  }catch(e){window.toast?.(e.message||String(e),'error');console.error('[Preventivo Excel]',e)}
}
function enhance(){
  const page=document.getElementById('page-preventivo');
  if(!page)return;
  const pdf=[...page.querySelectorAll('button')].find(b=>/Informe/.test(b.textContent||'')&&/v1520PrevReport/.test(b.getAttribute('onclick')||''));
  if(!pdf)return;
  pdf.textContent='↓ Informe PDF';
  if(page.querySelector('[data-prev-excel-r321]'))return;
  const b=document.createElement('button');b.className=pdf.className;b.type='button';
  b.dataset.prevExcelR321='1';b.textContent='↓ Informe Excel';
  b.addEventListener('click',exportExcel);
  pdf.insertAdjacentElement('afterend',b);
}
let scheduled=false;
function schedule(){if(scheduled)return;scheduled=true;requestAnimationFrame(()=>{scheduled=false;enhance()})}
const start=()=>{
  enhance();
  const page=document.getElementById('page-preventivo');
  if(page)new MutationObserver(schedule).observe(page,{childList:true,subtree:false});
};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',start,{once:true});else start();
window.StainherPreventivoExcelR321={exportExcel,enhance};
})();