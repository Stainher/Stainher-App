/* Stainher App V15.24 · R118 · Historial Correctivo
 * - Alinea columnas del Historial del período en escritorio.
 * - Permite abrir la observación completa sin perder el resumen de tabla.
 * - Descarga el historial visible del período/mes seleccionado en Excel, con respaldo CSV.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_CORRECTIVO_HISTORY_VERSION__==='R118')return;
  window.__STAINHER_CORRECTIVO_HISTORY_VERSION__='R118';

  const STYLE_ID='stainher-correctivo-history-r118-style';
  const MODAL_ID='stainher-correctivo-observation-r118';
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function page(){return document.getElementById('page-correctivo')}

  function headerText(th){return clean(th?.textContent||'')}

  function findHistoryTable(){
    const host=page();if(!host)return null;
    const heading=[...host.querySelectorAll('summary,h2,h3,h4')].find(el=>/Historial del per[ií]odo/i.test(el.textContent||''));
    let panel=heading?.closest?.('details,.panel,section,article')||heading?.parentElement||null;
    let table=panel?.querySelector?.('table')||null;
    if(!table){
      table=[...host.querySelectorAll('table')].find(t=>{
        const labels=[...t.querySelectorAll('thead th')].map(headerText).join('|');
        return /Fecha/i.test(labels)&&/Equipo/i.test(labels)&&/Observaci[oó]n/i.test(labels)&&(/Duraci/i.test(labels)||/Estado/i.test(labels));
      })||null;
      panel=table?.closest?.('details,.panel,section,article')||table?.parentElement||null;
    }
    return table&&panel?{panel,table,heading}:null;
  }

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #page-correctivo .stainher-corr-history-r118{min-width:0!important}
      #page-correctivo .stainher-corr-history-r118 table{
        width:100%!important;
        min-width:1180px!important;
        table-layout:fixed!important;
        border-collapse:collapse!important;
      }
      #page-correctivo .stainher-corr-history-r118 th,
      #page-correctivo .stainher-corr-history-r118 td{
        box-sizing:border-box!important;
        vertical-align:middle!important;
        word-break:normal!important;
        overflow-wrap:break-word!important;
        hyphens:none!important;
      }
      #page-correctivo .stainher-corr-history-r118 thead th{
        white-space:normal!important;
        line-height:1.2!important;
        text-align:left!important;
      }
      #page-correctivo .stainher-corr-history-r118 .r118-col-fecha{width:7%!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-equipo{width:8.5%!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-guia{width:11.5%!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-responsable{width:9%!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-duracion{width:6%!important;text-align:center!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-estado{width:7%!important;text-align:center!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-observacion{width:33%!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-excluir{width:7%!important;text-align:center!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-motivo{width:5.5%!important}
      #page-correctivo .stainher-corr-history-r118 .r118-col-accion{width:5.5%!important;text-align:center!important}
      #page-correctivo .stainher-corr-observation-r118{
        display:grid!important;
        grid-template-columns:minmax(0,1fr) auto!important;
        gap:8px!important;
        align-items:center!important;
        width:100%!important;
        min-width:0!important;
        padding:0!important;
        border:0!important;
        background:transparent!important;
        color:inherit!important;
        font:inherit!important;
        text-align:left!important;
        cursor:pointer!important;
      }
      #page-correctivo .stainher-corr-observation-preview-r118{
        display:-webkit-box!important;
        min-width:0!important;
        overflow:hidden!important;
        -webkit-line-clamp:2!important;
        -webkit-box-orient:vertical!important;
        line-height:1.35!important;
      }
      #page-correctivo .stainher-corr-observation-more-r118{
        color:#8ec5ff!important;
        font-size:10px!important;
        font-weight:800!important;
        white-space:nowrap!important;
      }
      #page-correctivo .stainher-corr-observation-r118:hover .stainher-corr-observation-preview-r118,
      #page-correctivo .stainher-corr-observation-r118:focus-visible .stainher-corr-observation-preview-r118{
        text-decoration:underline!important;
        text-underline-offset:2px!important;
      }
      #page-correctivo .stainher-corr-history-tools-r118{
        display:flex!important;
        justify-content:flex-end!important;
        align-items:center!important;
        gap:8px!important;
        margin:10px 0 12px!important;
      }
      #page-correctivo .stainher-corr-history-tools-r118 .btn{min-height:40px!important}
      #${MODAL_ID}{
        position:fixed!important;
        inset:0!important;
        z-index:10050!important;
        display:flex!important;
        align-items:center!important;
        justify-content:center!important;
        padding:20px!important;
        background:rgba(0,0,0,.68)!important;
      }
      #${MODAL_ID}[hidden]{display:none!important}
      #${MODAL_ID} .stainher-corr-observation-dialog-r118{
        width:min(720px,100%)!important;
        max-height:min(78vh,720px)!important;
        overflow:auto!important;
        border:1px solid var(--line,#334155)!important;
        border-radius:16px!important;
        background:var(--panel,#0f1720)!important;
        color:var(--text,#f8fafc)!important;
        box-shadow:0 24px 80px rgba(0,0,0,.45)!important;
      }
      #${MODAL_ID} .stainher-corr-observation-head-r118{
        position:sticky!important;
        top:0!important;
        z-index:2!important;
        display:flex!important;
        justify-content:space-between!important;
        gap:12px!important;
        align-items:flex-start!important;
        padding:16px 18px!important;
        border-bottom:1px solid var(--line,#334155)!important;
        background:var(--panel,#0f1720)!important;
      }
      #${MODAL_ID} .stainher-corr-observation-head-r118 h3{margin:0!important;font-size:18px!important}
      #${MODAL_ID} .stainher-corr-observation-meta-r118{margin-top:4px!important;color:var(--muted,#94a3b8)!important;font-size:12px!important}
      #${MODAL_ID} .stainher-corr-observation-text-r118{
        padding:18px!important;
        white-space:pre-wrap!important;
        overflow-wrap:anywhere!important;
        line-height:1.6!important;
        font-size:15px!important;
      }
      #${MODAL_ID} .stainher-corr-observation-close-r118{min-width:42px!important}
      @media(max-width:900px){
        #page-correctivo .stainher-corr-history-tools-r118{justify-content:stretch!important}
        #page-correctivo .stainher-corr-history-tools-r118 .btn{width:100%!important}
        #${MODAL_ID}{padding:10px!important;align-items:flex-end!important}
        #${MODAL_ID} .stainher-corr-observation-dialog-r118{max-height:88vh!important;border-radius:16px 16px 0 0!important}
      }
    `;
    document.head.appendChild(style);
  }

  function classForHeader(label){
    const x=norm(label);
    if(x.includes('fecha'))return'r118-col-fecha';
    if(x.includes('equipo'))return'r118-col-equipo';
    if(x.includes('guia'))return'r118-col-guia';
    if(x.includes('respons'))return'r118-col-responsable';
    if(x.includes('duraci'))return'r118-col-duracion';
    if(x.includes('estado'))return'r118-col-estado';
    if(x.includes('observ'))return'r118-col-observacion';
    if(x.includes('excluir'))return'r118-col-excluir';
    if(x.includes('motivo'))return'r118-col-motivo';
    if(x.includes('accion'))return'r118-col-accion';
    return'';
  }

  function alignColumns(table){
    const headers=[...table.querySelectorAll('thead th')];
    if(!headers.length)return;
    headers.forEach((th,index)=>{
      const cls=classForHeader(headerText(th));
      if(cls)th.classList.add(cls);
      table.querySelectorAll('tbody tr').forEach(tr=>{
        const cell=tr.children[index];
        if(cell&&cls)cell.classList.add(cls);
      });
    });
  }

  function modal(){
    let root=document.getElementById(MODAL_ID);
    if(root)return root;
    root=document.createElement('div');
    root.id=MODAL_ID;
    root.hidden=true;
    root.setAttribute('role','dialog');
    root.setAttribute('aria-modal','true');
    root.setAttribute('aria-labelledby','stainher-corr-observation-title-r118');
    root.innerHTML=`<div class="stainher-corr-observation-dialog-r118">
      <div class="stainher-corr-observation-head-r118">
        <div><h3 id="stainher-corr-observation-title-r118">Observación completa</h3><div class="stainher-corr-observation-meta-r118" data-r118-observation-meta></div></div>
        <button type="button" class="btn stainher-corr-observation-close-r118" data-r118-observation-close aria-label="Cerrar">✕</button>
      </div>
      <div class="stainher-corr-observation-text-r118" data-r118-observation-text></div>
    </div>`;
    document.body.appendChild(root);
    root.addEventListener('click',event=>{
      if(event.target===root||event.target.closest?.('[data-r118-observation-close]'))closeObservation();
    });
    return root;
  }

  function closeObservation(){
    const root=document.getElementById(MODAL_ID);
    if(!root)return;
    root.hidden=true;
    document.body.classList.remove('stainher-corr-observation-open-r118');
  }

  function openObservation(button){
    const root=modal();
    const row=button.closest('tr');
    const table=button.closest('table');
    const headers=[...table.querySelectorAll('thead th')].map(headerText);
    const cells=[...(row?.children||[])];
    const get=key=>{
      const index=headers.findIndex(h=>norm(h).includes(norm(key)));
      return index>=0?clean(cells[index]?.textContent||''):'';
    };
    const full=button.dataset.fullObservation||'';
    root.querySelector('[data-r118-observation-text]').textContent=full||'Sin observación registrada.';
    const meta=[get('equipo'),get('fecha'),get('guia')].filter(Boolean).join(' · ');
    root.querySelector('[data-r118-observation-meta]').textContent=meta;
    root.hidden=false;
    document.body.classList.add('stainher-corr-observation-open-r118');
    setTimeout(()=>root.querySelector('[data-r118-observation-close]')?.focus(),0);
  }

  function decorateObservations(table){
    const headers=[...table.querySelectorAll('thead th')].map(headerText);
    const index=headers.findIndex(h=>norm(h).includes('observ'));
    if(index<0)return;
    table.querySelectorAll('tbody tr').forEach(row=>{
      const cell=row.children[index];if(!cell||cell.dataset.r118Observation==='1')return;
      const full=String(cell.textContent||'').trim();
      cell.dataset.r118Observation='1';
      cell.dataset.r118ObservationFull=full;
      if(!full||full==='—'||full==='-')return;
      const button=document.createElement('button');
      button.type='button';
      button.className='stainher-corr-observation-r118';
      button.dataset.fullObservation=full;
      button.setAttribute('aria-label','Ver observación completa');
      const preview=document.createElement('span');preview.className='stainher-corr-observation-preview-r118';preview.textContent=full;
      const more=document.createElement('span');more.className='stainher-corr-observation-more-r118';more.textContent='Ver completo';
      button.append(preview,more);
      cell.replaceChildren(button);
    });
  }

  function selectedRange(table){
    const st=window.state||{};
    const host=page();
    const fromInput=host?.querySelector('#corrFromV1519,#corrFrom,#corrFromR12,input[id*="corrFrom"]');
    const toInput=host?.querySelector('#corrToV1519,#corrTo,#corrToR12,input[id*="corrTo"]');
    let from=String(st.correctivoFrom||fromInput?.value||'').slice(0,10);
    let to=String(st.correctivoTo||toInput?.value||'').slice(0,10);
    if(!from||!to){
      const headers=[...table.querySelectorAll('thead th')].map(headerText);
      const dateIndex=headers.findIndex(h=>norm(h).includes('fecha'));
      const dates=[...table.querySelectorAll('tbody tr')].map(row=>clean(row.children[dateIndex]?.textContent||'').match(/\d{4}-\d{2}-\d{2}/)?.[0]).filter(Boolean).sort();
      if(!from)from=dates[0]||'';
      if(!to)to=dates.at(-1)||'';
    }
    const key=from&&to&&from.slice(0,7)===to.slice(0,7)?from.slice(0,7):'';
    const label=key
      ?new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(key+'-01T12:00:00'))
      :(from&&to?`${from} a ${to}`:'período seleccionado');
    const fileKey=key||[from,to].filter(Boolean).join('_')||'periodo';
    return {from,to,key,label,fileKey};
  }

  function extractHistory(table){
    const headers=[...table.querySelectorAll('thead th')].map(headerText);
    const keep=headers.map((label,index)=>({label,index})).filter(x=>!norm(x.label).includes('accion'));
    const rows=[...table.querySelectorAll('tbody tr')].map(row=>keep.map(({label,index})=>{
      const cell=row.children[index];if(!cell)return'';
      if(norm(label).includes('observ'))return cell.dataset.r118ObservationFull||clean(cell.textContent||'');
      const checkbox=cell.querySelector('input[type="checkbox"]');
      if(checkbox)return checkbox.checked?'Sí':'No';
      const select=cell.querySelector('select');
      if(select)return clean(select.selectedOptions?.[0]?.textContent||select.value||'');
      const input=cell.querySelector('input:not([type="checkbox"]),textarea');
      if(input)return clean(input.value||'');
      return clean(cell.textContent||'');
    }));
    return {headers:keep.map(x=>x.label),rows};
  }

  function csvCell(value){
    const text=String(value??'');
    return /[;"\n\r]/.test(text)?`"${text.replace(/"/g,'""')}"`:text;
  }

  function downloadCsv(data,range){
    const lines=[
      ['Historial de mantenimiento correctivo'],
      ['Período',range.label],
      ['Eventos',data.rows.length],
      [],
      data.headers,
      ...data.rows
    ].map(row=>row.map(csvCell).join(';')).join('\r\n');
    const blob=new Blob(['\ufeff'+lines],{type:'text/csv;charset=utf-8'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');a.href=url;a.download=`Historial_Correctivo_${range.fileKey}.csv`;a.style.display='none';
    document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),1500);
  }

  function downloadHistory(table){
    const data=extractHistory(table),range=selectedRange(table);
    const excludedIndex=data.headers.findIndex(h=>norm(h).includes('excluir'));
    const excluded=excludedIndex>=0?data.rows.filter(row=>row[excludedIndex]==='Sí').length:0;
    const X=window.XLSX;
    if(X?.utils?.aoa_to_sheet&&X?.utils?.book_new&&typeof X.writeFile==='function'){
      const aoa=[
        ['Historial de mantenimiento correctivo'],
        ['Período',range.label],
        ['Eventos',data.rows.length],
        ['Eventos excluidos de KPI',excluded],
        [],
        data.headers,
        ...data.rows
      ];
      const ws=X.utils.aoa_to_sheet(aoa);
      ws['!cols']=data.headers.map(label=>{
        const x=norm(label);
        if(x.includes('observ'))return{wch:70};
        if(x.includes('guia'))return{wch:22};
        if(x.includes('respons'))return{wch:24};
        if(x.includes('equipo'))return{wch:22};
        if(x.includes('motivo'))return{wch:28};
        return{wch:16};
      });
      const wb=X.utils.book_new();
      X.utils.book_append_sheet(wb,ws,'Historial Correctivo');
      X.writeFile(wb,`Historial_Correctivo_${range.fileKey}.xlsx`,{bookType:'xlsx',compression:true});
      window.toast?.(`Historial descargado · ${data.rows.length} evento(s).`,'success');
      return;
    }
    downloadCsv(data,range);
    window.toast?.(`Historial descargado en CSV · ${data.rows.length} evento(s).`,'success');
  }

  function ensureDownload(panel,table){
    let tools=panel.querySelector('.stainher-corr-history-tools-r118');
    if(!tools){
      tools=document.createElement('div');
      tools.className='stainher-corr-history-tools-r118';
      const button=document.createElement('button');
      button.type='button';button.className='btn';button.dataset.r118DownloadHistory='1';
      button.textContent='⇩ Descargar historial';
      tools.appendChild(button);
      const summary=panel.querySelector(':scope > summary');
      if(summary)summary.insertAdjacentElement('afterend',tools);else panel.prepend(tools);
    }
    const button=tools.querySelector('[data-r118-download-history]');
    if(button&&!button.dataset.r118Bound){
      button.dataset.r118Bound='1';
      button.addEventListener('click',()=>downloadHistory(table));
    }
  }

  let busy=false,pending=false,installed=false;
  function enhance(){
    if(busy)return;
    const found=findHistoryTable();if(!found)return;
    busy=true;
    try{
      found.panel.classList.add('stainher-corr-history-r118');
      alignColumns(found.table);
      decorateObservations(found.table);
      ensureDownload(found.panel,found.table);
    }finally{busy=false}
  }

  function schedule(){
    if(pending)return;
    pending=true;
    requestAnimationFrame(()=>{pending=false;enhance()});
  }

  function install(){
    if(installed)return;installed=true;
    installStyle();modal();enhance();
    const host=page()||document.getElementById('appView')||document.body;
    new MutationObserver(()=>{if(!busy)schedule()}).observe(host,{childList:true,subtree:true});
    document.addEventListener('click',event=>{
      const button=event.target?.closest?.('.stainher-corr-observation-r118');
      if(button){event.preventDefault();openObservation(button)}
    });
    document.addEventListener('keydown',event=>{if(event.key==='Escape'&&!document.getElementById(MODAL_ID)?.hidden)closeObservation()});
    window.addEventListener('stainher:modules-ready',schedule);
    setTimeout(schedule,250);setTimeout(schedule,1000);
  }

  window.StainherCorrectivoHistoryR118={install,enhance,downloadHistory};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();