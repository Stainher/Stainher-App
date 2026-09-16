/* Stainher V15.24 · R86 · Controles realizados: hora, descarga PDF y refuerzo correo.
 * - Hora de realización basada en liderazgo_cumplimiento.created_at (America/Santiago).
 * - Acción Descargar PDF en el historial de controles realizados.
 * - Refuerza instalación del correo obligatorio sin modificar destinatarios del backend.
 * - Sin MutationObserver global.
 */
(()=>{
  'use strict';
  const BUILD='20260916-r86-leadership-pdf-mail';
  if(window.__STAINHER_LEADERSHIP_RECORD_PDF_R86__===BUILD)return;
  window.__STAINHER_LEADERSHIP_RECORD_PDF_R86__=BUILD;
  const WRAP=Symbol('stainherLeadershipR86');
  const TZ='America/Santiago';

  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const fileSafe=v=>String(v||'Control_Stainher').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'')||'Control_Stainher';
  function dateCL(v){try{return typeof window.fmtDateCL==='function'?window.fmtDateCL(v):new Intl.DateTimeFormat('es-CL',{timeZone:TZ,day:'2-digit',month:'2-digit',year:'numeric'}).format(new Date(v))}catch(_){return String(v||'—')}}
  function hourCL(v){try{return new Intl.DateTimeFormat('es-CL',{timeZone:TZ,hour:'2-digit',minute:'2-digit',hour12:false}).format(v?new Date(v):new Date())}catch(_){const d=v?new Date(v):new Date();return `${String(d.getHours()).padStart(2,'0')}:${String(d.getMinutes()).padStart(2,'0')}`}}
  function stampHour(doc,when){
    if(!doc||typeof doc.text!=='function'||doc.__stainherLeadershipHourR86)return doc;
    doc.__stainherLeadershipHourR86=true;
    try{
      const W=doc.internal.pageSize.getWidth();
      doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.setTextColor(210,218,226);
      doc.text(`Hora realización: ${hourCL(when)}`,W-12,20,{align:'right'});
      doc.setTextColor(0);
    }catch(_){ }
    return doc;
  }

  function detailRows(row){
    const d=row?.detalle&&typeof row.detalle==='object'?row.detalle:{};
    if(Array.isArray(d.items)&&d.items.length)return d.items.map(x=>[String(x?.[0]??''),String(x?.[1]??'')]);
    if(Array.isArray(d.campos)&&d.campos.length)return d.campos.filter(x=>x?.tipo!=='seccion').map(x=>[String(x?.label||x?.id||''),String(x?.valor??'')]);
    const omit=new Set(['area','observaciones','firma','firma_data']);
    return Object.entries(d).filter(([k,v])=>!omit.has(k)&&v!=null&&typeof v!=='object').map(([k,v])=>[k.replace(/_/g,' '),String(v)]);
  }

  function buildRecordPdf(row){
    const C=typeof window.ensurePdf==='function'?window.ensurePdf():window.jspdf?.jsPDF;
    if(!C)throw new Error('No se pudo cargar el generador PDF.');
    const doc=new C({unit:'mm',format:'a4'}),name=row.control_nombre||row.control_codigo||'Control Stainher',code=row.control_codigo||'CONTROL';
    if(typeof window.installCorporatePdfV95==='function')window.installCorporatePdfV95(doc,name,`Control realizado · ${code}`);
    else if(typeof window.pdfHeader==='function')window.pdfHeader(doc,name,code);
    stampHour(doc,row.created_at);
    const d=row.detalle&&typeof row.detalle==='object'?row.detalle:{},user=row.ejecutado_por_nombre||row.supervisor_nombre||'—',role=typeof window.v1519RoleLabel==='function'?window.v1519RoleLabel(row.ejecutado_por_rol||''):row.ejecutado_por_rol||'—';
    doc.autoTable({startY:32,theme:'grid',styles:{fontSize:8,cellPadding:2,textColor:[28,34,41]},body:[
      ['Ejecutado por',user,'Perfil',role],
      ['Fecha',dateCL(row.fecha),'Hora realización',hourCL(row.created_at)],
      ['Área / Equipo',String(d.area||'—'),'Tipo',row.fuera_programacion?'Ejecución libre':'Programado']
    ]});
    const rows=detailRows(row);
    if(rows.length)doc.autoTable({startY:doc.lastAutoTable.finalY+6,head:[['Ítem','Respuesta / detalle']],body:rows,styles:{fontSize:8,cellPadding:2,textColor:[28,34,41]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]},columnStyles:{0:{cellWidth:115}}});
    let y=(doc.lastAutoTable?.finalY||58)+8;
    const obs=String(d.observaciones||d.observacion||'').trim();
    if(obs){doc.setFont('helvetica','normal');doc.setFontSize(8);doc.setTextColor(28,34,41);const lines=doc.splitTextToSize(`Observaciones: ${obs}`,180);doc.text(lines,14,y);y+=lines.length*4+6;}
    if(y>235){doc.addPage();y=35;}
    if(row.firma_data){
      doc.setFont('helvetica','bold');doc.setFontSize(8);doc.text('Firma del responsable',14,y);doc.rect(14,y+3,82,32);
      try{doc.addImage(row.firma_data,'PNG',18,y+6,74,25)}catch(_){ }
      doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.text(user,18,y+39);
    }
    return doc;
  }

  window.v1524DownloadLeadershipRecordPdf=async function(id){
    try{
      const q=await window.sb.from('liderazgo_cumplimiento').select('*').eq('id',id).single();
      if(q.error)throw q.error;
      const row=q.data,doc=buildRecordPdf(row),name=`${fileSafe(row.control_codigo||row.control_nombre)}_${String(row.fecha||'').replace(/-/g,'')}.pdf`;
      doc.save(name);
    }catch(error){window.toast?.(error?.message||'No se pudo descargar el PDF del control.','error')}
  };

  async function enhanceActions(){
    const section=document.getElementById('v1512Lead_indicadores');if(!section)return;
    const panel=[...section.querySelectorAll('.panel')].find(x=>x.querySelector('h3')?.textContent.trim()==='Controles realizados');
    const table=panel?.querySelector('table');if(!table)return;
    const data=typeof window.v1512LoadLeadershipData==='function'?await window.v1512LoadLeadershipData():null;
    if(!data||data.error)return;const rows=data.done||[];
    const head=table.querySelector('thead tr');
    let actionIndex=[...head?.children||[]].findIndex(x=>x.textContent.trim()==='Acciones');
    if(actionIndex<0&&head){const th=document.createElement('th');th.textContent='Acciones';head.appendChild(th);actionIndex=head.children.length-1;}
    table.querySelectorAll('tbody tr').forEach((tr,index)=>{
      const row=rows[index];if(!row)return;
      let td=actionIndex>=0?tr.children[actionIndex]:null;
      if(!td){td=document.createElement('td');tr.appendChild(td);}
      let box=td.querySelector('.v1523-lead-record-actions');
      if(!box){box=document.createElement('div');box.className='v1523-lead-record-actions';td.appendChild(box);}
      if(!box.querySelector('[data-r86-download]')){
        const b=document.createElement('button');b.type='button';b.className='action-mini';b.dataset.r86Download='1';b.textContent='PDF';b.title='Descargar PDF del control realizado';b.onclick=()=>window.v1524DownloadLeadershipRecordPdf(row.id);box.prepend(b);
      }
    });
  }

  function wrapRecordActions(){
    const current=window.v1523InstallLeadershipRecordActions;if(typeof current!=='function'||current[WRAP])return;
    const wrapped=async function(){const out=await current.apply(this,arguments);await enhanceActions();return out};wrapped[WRAP]=true;wrapped.__base=current;window.v1523InstallLeadershipRecordActions=wrapped;
  }
  function wrapRender(){
    const current=window.renderLiderazgoV95;if(typeof current!=='function'||current[WRAP])return;
    const wrapped=async function(){const out=await current.apply(this,arguments);try{await window.v1523InstallLeadershipRecordActions?.();await enhanceActions()}catch(error){console.warn('[Stainher R86] acciones PDF',error)}return out};wrapped[WRAP]=true;wrapped.__base=current;window.renderLiderazgoV95=wrapped;
  }
  function wrapGenericPdf(){
    const current=window.v1512GenericPdf;if(typeof current!=='function'||current[WRAP])return;
    const wrapped=function(){return stampHour(current.apply(this,arguments),new Date())};wrapped[WRAP]=true;wrapped.__base=current;window.v1512GenericPdf=wrapped;
  }
  function wrapGenerator(name){
    const current=window[name];if(typeof current!=='function'||current[WRAP])return;
    const wrapped=async function(){const proto=window.jspdf?.jsPDF?.prototype,save=proto?.save;if(!proto||typeof save!=='function')return current.apply(this,arguments);proto.save=function(){stampHour(this,new Date());return save.apply(this,arguments)};try{return await current.apply(this,arguments)}finally{proto.save=save}};wrapped[WRAP]=true;wrapped.__base=current;window[name]=wrapped;
  }
  function installMail(){try{window.StainherLeadershipMail?.install?.()}catch(error){console.warn('[Stainher R86] instalación correo',error)}}
  function install(){
    wrapRecordActions();wrapRender();wrapGenericPdf();
    ['generateVehiculoV13','generateExtV12','generateTerrainPdfV11','generateEppV12','generateEnvV12','generateProtV12'].forEach(wrapGenerator);
    installMail();
    if(document.getElementById('page-liderazgo')&&!document.getElementById('page-liderazgo').classList.contains('hidden'))enhanceActions().catch(()=>{});
  }
  window.StainherLeadershipR86=Object.freeze({install,download:window.v1524DownloadLeadershipRecordPdf,buildRecordPdf,hourCL});
  install();window.addEventListener('stainher:modules-ready',()=>{install();setTimeout(install,120);setTimeout(install,900)},{once:true});
  [300,900,1800,3200].forEach(ms=>setTimeout(install,ms));
})();
