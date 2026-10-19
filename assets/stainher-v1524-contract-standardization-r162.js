/* Stainher V15.24 · R162 · Administración del Contrato: Estandarización e Innovación.
 * - Agrega una ficha propia inmediatamente después de Gastos Reembolsables.
 * - Lista presupuestos imputados como estandarización por Estado de Pago.
 * - Resume monto neto, IVA y total IVA incluido sin duplicar partidas.
 */
(()=>{
  'use strict';
  const BUILD='20261019-r170-estandarizacion-pdf-fotos';
  if(window.__STAINHER_CONTRACT_STANDARDIZATION_R162__===BUILD)return;
  window.__STAINHER_CONTRACT_STANDARDIZATION_R162__=BUILD;

  const TAB='estandarizacion_innovacion';
  const TABLE='presupuestos_tecnico_comerciales_v1524';
  const STYLE_ID='stainher-contract-standardization-r162-style';
  let observer=null,loading=false;

  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const num=v=>Number(v)||0;
  const money=v=>typeof window.fmtCLP==='function'?window.fmtCLP(Math.round(num(v))):'$'+Math.round(num(v)).toLocaleString('es-CL');
  const dateCL=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(v||'')};
  const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const s=document.createElement('style');
    s.id=STYLE_ID;
    s.textContent=`
      #page-contrato .r162-toolbar{display:flex;align-items:flex-end;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:12px}
      #page-contrato .r162-toolbar label{display:grid;gap:5px;color:var(--muted);font-size:10px;text-transform:uppercase;min-width:260px}
      #page-contrato .r165-report-controls{display:flex;gap:10px;align-items:flex-end;flex-wrap:wrap}
      #page-contrato .r165-report-controls .btn{white-space:nowrap}
      #page-contrato .r165-edp-legend{font-size:10px;color:var(--muted);text-transform:none;line-height:1.2}
      #page-contrato .r170-photo-panel{border:1px solid var(--line);border-radius:11px;background:var(--panel,#0d141c);padding:11px 12px;margin:0 0 14px}
      #page-contrato .r170-photo-head{display:flex;align-items:center;justify-content:space-between;gap:10px;flex-wrap:wrap}
      #page-contrato .r170-photo-head h4{margin:0 0 3px;font-size:12px}
      #page-contrato .r170-photo-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      #page-contrato .r170-photo-count{font-size:10px;color:var(--muted)}
      #page-contrato .r170-photo-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(135px,1fr));gap:9px;margin-top:10px}
      #page-contrato .r170-photo-card{position:relative;border:1px solid var(--line);border-radius:9px;overflow:hidden;background:var(--panel2)}
      #page-contrato .r170-photo-card img{display:block;width:100%;height:95px;object-fit:cover;background:#fff}
      #page-contrato .r170-photo-name{padding:6px 28px 6px 7px;font-size:9px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
      #page-contrato .r170-photo-remove{position:absolute;right:5px;bottom:4px;width:22px;height:22px;min-width:22px!important;padding:0!important;border-radius:999px!important}
      #page-contrato .r170-photo-empty{margin-top:8px;padding:10px;border:1px dashed var(--line);border-radius:8px;color:var(--muted);font-size:10px;text-align:center}
      #page-contrato .r162-kpis{display:grid;grid-template-columns:repeat(4,minmax(160px,1fr));gap:10px;margin:0 0 14px}
      #page-contrato .r162-kpi{border:1px solid var(--line);border-radius:11px;background:var(--panel,#0d141c);padding:11px;min-width:0}
      #page-contrato .r162-kpi span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase}
      #page-contrato .r162-kpi b{display:block;margin-top:5px;font-size:18px;overflow-wrap:anywhere}
      #page-contrato .r162-note{margin:0 0 14px}
      #page-contrato .r162-table{overflow:auto;border:1px solid var(--line);border-radius:11px}
      #page-contrato .r162-table table{width:100%;border-collapse:collapse;min-width:980px;table-layout:fixed}
      #page-contrato .r162-table th,#page-contrato .r162-table td{padding:12px;border-bottom:1px solid var(--line);vertical-align:top;text-align:left}
      #page-contrato .r162-table th{background:var(--panel2);color:var(--muted);font-size:11px;text-transform:uppercase;letter-spacing:.02em}
      #page-contrato .r162-table td{font-size:13px;line-height:1.35}
      #page-contrato .r162-table th:nth-child(1),#page-contrato .r162-table td:nth-child(1){width:12%}
      #page-contrato .r162-table th:nth-child(2),#page-contrato .r162-table td:nth-child(2){width:20%}
      #page-contrato .r162-table th:nth-child(3),#page-contrato .r162-table td:nth-child(3){width:16%}
      #page-contrato .r162-table th:nth-child(4),#page-contrato .r162-table td:nth-child(4){width:28%}
      #page-contrato .r162-table th:nth-child(5),#page-contrato .r162-table td:nth-child(5),
      #page-contrato .r162-table th:nth-child(6),#page-contrato .r162-table td:nth-child(6){width:12%;text-align:right}
      #page-contrato .r162-detail{white-space:pre-line;overflow-wrap:anywhere}
      #page-contrato .r162-empty{padding:26px 14px;text-align:center;color:var(--muted)}
      @media(max-width:850px){#page-contrato .r162-kpis{grid-template-columns:1fr 1fr}}
      @media(max-width:520px){#page-contrato .r162-kpis{grid-template-columns:1fr}#page-contrato .r162-toolbar label{min-width:100%;width:100%}}
    `;
    document.head.appendChild(s);
  }

  function eps(){
    return Array.isArray(window.state?.contractData?.edp)?window.state.contractData.edp:[];
  }

  function budgetDetail(row){
    const lines=(Array.isArray(row?.materiales)?row.materiales:[]).map(x=>{
      const name=String(x?.detalle||'').trim();
      if(!name)return '';
      const qty=Number(x?.cantidad)||0,unit=String(x?.unidad||'').trim();
      if(qty<=0)return name;
      const q=Number.isInteger(qty)?String(qty):qty.toLocaleString('es-CL',{maximumFractionDigits:2});
      if(unit.toLowerCase()==='unidad')return `${name} (${q} ${qty===1?'unidad':'unidades'})`;
      return unit?`${name} (${q} ${unit})`:`${name} (${q})`;
    }).filter(Boolean);
    if(lines.length)return lines.join('\n');
    const obs=String(row?.observacion||'').trim();
    return obs||'—';
  }

  function photoStore(){
    window.state=window.state||{};
    return window.state.r170StandardizationPhotos||(window.state.r170StandardizationPhotos={});
  }
  function photosForEp(epId){
    const store=photoStore(),key=String(epId||'');
    return store[key]||(store[key]=[]);
  }
  function readFileDataUrl(file){
    return new Promise((resolve,reject)=>{
      const reader=new FileReader();
      reader.onload=()=>resolve(String(reader.result||''));
      reader.onerror=()=>reject(reader.error||new Error('No fue posible leer la fotografía.'));
      reader.readAsDataURL(file);
    });
  }
  function loadBrowserImage(src){
    return new Promise((resolve,reject)=>{
      const img=new Image();
      img.onload=()=>resolve(img);
      img.onerror=()=>reject(new Error('Formato de imagen no compatible.'));
      img.src=src;
    });
  }
  async function normalizePhoto(file){
    if(!String(file?.type||'').startsWith('image/'))throw new Error(`${file?.name||'Archivo'} no es una imagen válida.`);
    const src=await readFileDataUrl(file),img=await loadBrowserImage(src);
    const maxSide=1600,scale=Math.min(1,maxSide/Math.max(img.naturalWidth||1,img.naturalHeight||1));
    const width=Math.max(1,Math.round((img.naturalWidth||1)*scale)),height=Math.max(1,Math.round((img.naturalHeight||1)*scale));
    const canvas=document.createElement('canvas');canvas.width=width;canvas.height=height;
    const ctx=canvas.getContext('2d');if(!ctx)throw new Error('No fue posible procesar la fotografía.');
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,width,height);ctx.drawImage(img,0,0,width,height);
    return {
      id:`r170-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      name:String(file.name||'Fotografía'),
      dataUrl:canvas.toDataURL('image/jpeg',0.84),
      width,
      height
    };
  }
  async function addPhotoFiles(epId,fileList){
    const current=photosForEp(epId),files=[...Array.from(fileList||[])];
    if(!files.length)return;
    const room=Math.max(0,20-current.length);
    if(!room)return window.toast?.('Puedes incorporar hasta 20 fotografías por informe.','warn');
    const accepted=files.slice(0,room);
    let added=0;
    for(const file of accepted){
      try{current.push(await normalizePhoto(file));added++}
      catch(error){window.toast?.(`${file?.name||'Imagen'}: ${error?.message||error}`,'error')}
    }
    if(files.length>accepted.length)window.toast?.('Se alcanzó el máximo de 20 fotografías para este EDP.','warn');
    if(added)window.toast?.(`${added} fotografía${added===1?'':'s'} agregada${added===1?'':'s'} al informe.`,'success');
  }
  function removePhoto(epId,id){
    const photos=photosForEp(epId),index=photos.findIndex(x=>String(x.id)===String(id));
    if(index>=0)photos.splice(index,1);
  }
  function photoPanelHtml(epId){
    const photos=photosForEp(epId);
    return `<div class="r170-photo-panel">
      <div class="r170-photo-head">
        <div><h4>Registro fotográfico del informe</h4><div class="muted" style="font-size:10px">Selecciona fotografías desde tu PC. Se incorporan al PDF actual y no se almacenan en la plataforma.</div></div>
        <div class="r170-photo-actions">
          <span class="r170-photo-count">${photos.length} fotografía${photos.length===1?'':'s'}</span>
          <input id="r170PhotoInput" type="file" accept="image/*" multiple hidden>
          <button class="btn" type="button" data-r170-add-photo>+ Agregar fotografías</button>
        </div>
      </div>
      ${photos.length?`<div class="r170-photo-grid">${photos.map(photo=>`<div class="r170-photo-card"><img src="${esc(photo.dataUrl)}" alt="${esc(photo.name)}"><div class="r170-photo-name" title="${esc(photo.name)}">${esc(photo.name)}</div><button class="btn danger-btn r170-photo-remove" type="button" data-r170-remove-photo="${esc(photo.id)}" title="Quitar fotografía">×</button></div>`).join('')}</div>`:'<div class="r170-photo-empty">Aún no has agregado fotografías para este EDP.</div>'}
    </div>`;
  }
  function fitPhoto(photo,maxW,maxH){
    const w=Math.max(1,Number(photo?.width)||1),h=Math.max(1,Number(photo?.height)||1),scale=Math.min(maxW/w,maxH/h);
    return {w:w*scale,h:h*scale};
  }
  function requireCorporatePdf(){
    const C=typeof window.ensurePdf==='function'?window.ensurePdf():null;
    if(!C)throw new Error('No se pudo cargar el generador PDF corporativo de Stainher App.');
    if(typeof window.pdfHeader!=='function')throw new Error('No se pudo cargar el formato corporativo de Stainher App.');
    return C;
  }
  function corporateHeader(doc,title,subtitle){
    window.pdfHeader(doc,title,subtitle);
  }

  async function fetchRows(){
    const q=await window.sb.from(TABLE)
      .select('id,codigo,equipo_nombre,fecha,materiales,observacion,venta_neta,iva,total_final,estado_pago_id,tipo_imputacion,created_at')
      .eq('tipo_imputacion','estandarizacion')
      .not('estado_pago_id','is',null)
      .order('fecha',{ascending:false})
      .order('created_at',{ascending:false});
    if(q.error)throw q.error;
    return q.data||[];
  }

  function selectedEpId(rows){
    const available=new Set((rows||[]).map(x=>String(x.estado_pago_id||'')).filter(Boolean));
    const current=String(window.state?.r162StandardizationEpId||'');
    if(current&&available.has(current))return current;
    const ordered=[...eps()].sort((a,b)=>Number(b.ep_num)-Number(a.ep_num));
    const withRows=ordered.find(ep=>available.has(String(ep.id)));
    return String(withRows?.id||ordered[0]?.id||'');
  }

  function epOptionHtml(selected,rows=[]){
    const counts=new Map();
    (Array.isArray(rows)?rows:[]).forEach(row=>{
      const id=String(row?.estado_pago_id||'');
      if(id)counts.set(id,(counts.get(id)||0)+1);
    });
    return [...eps()].sort((a,b)=>Number(b.ep_num)-Number(a.ep_num)).map(ep=>{
      const count=counts.get(String(ep.id))||0;
      const mark=count?'● ':'';
      const label=`${mark}EP${ep.ep_num} · ${months[Number(ep.mes_edp)-1]||ep.mes_edp} ${ep.anio_edp}`;
      return `<option value="${esc(ep.id)}" ${String(ep.id)===String(selected)?'selected':''}>${esc(label)}</option>`;
    }).join('');
  }

  async function downloadReport(){
    try{
      const C=requireCorporatePdf();
      const rows=await fetchRows();
      const epId=String(window.state?.r162StandardizationEpId||selectedEpId(rows));
      const ep=eps().find(x=>String(x.id)===epId)||null;
      const filtered=rows.filter(x=>String(x.estado_pago_id)===epId);
      if(!ep)return window.toast?.('Selecciona un Estado de Pago.','error');
      if(!filtered.length)return window.toast?.('No hay presupuestos de Estandarización e Innovación para este EDP.','warn');

      const net=filtered.reduce((s,x)=>s+num(x.venta_neta),0);
      const iva=filtered.reduce((s,x)=>s+num(x.iva),0);
      const total=filtered.reduce((s,x)=>s+num(x.total_final),0);
      const photos=photosForEp(epId);
      const subtitle=`EP${ep.ep_num} · ${months[Number(ep.mes_edp)-1]||ep.mes_edp} ${ep.anio_edp} · ${dateCL(ep.periodo_inicio)} - ${dateCL(ep.periodo_fin)}`;
      const doc=new C({orientation:'landscape',unit:'mm',format:'a4'});
      corporateHeader(doc,'Informe de Estandarización e Innovación',subtitle);

      if(typeof doc.autoTable!=='function')throw new Error('No se pudo cargar el generador de tablas PDF de Stainher App.');

      doc.autoTable({
        startY:42,
        theme:'grid',
        head:[['Presupuestos asignados','Monto neto','IVA','Total IVA incluido']],
        body:[[String(filtered.length),money(net),money(iva),money(total)]],
        styles:{fontSize:9,cellPadding:3,textColor:[25,31,40]},
        headStyles:{fillColor:[35,43,54],textColor:[255,255,255],fontStyle:'bold',halign:'center'},
        bodyStyles:{fontStyle:'bold',halign:'center'},
        margin:{left:14,right:14,top:42,bottom:22}
      });

      doc.autoTable({
        startY:(doc.lastAutoTable?.finalY||58)+7,
        head:[['Fecha','Código','Equipo','Detalle','Monto neto','Total IVA incluido']],
        body:filtered.map(row=>[
          dateCL(row.fecha),
          row.codigo||'—',
          row.equipo_nombre||'—',
          budgetDetail(row),
          money(row.venta_neta),
          money(row.total_final)
        ]),
        styles:{fontSize:8,cellPadding:2,overflow:'linebreak'},
        headStyles:{fillColor:[35,43,54]},
        columnStyles:{
          0:{cellWidth:24},
          1:{cellWidth:48},
          2:{cellWidth:38},
          3:{cellWidth:92},
          4:{cellWidth:32,halign:'right'},
          5:{cellWidth:34,halign:'right'}
        },
        margin:{left:14,right:14,top:42,bottom:22},
        didDrawPage:data=>{if(data.pageNumber>1)corporateHeader(doc,'Informe de Estandarización e Innovación',subtitle)}
      });

      if(photos.length){
        for(let index=0;index<photos.length;index+=2){
          doc.addPage('a4','landscape');
          corporateHeader(doc,'Registro fotográfico - Estandarización e Innovación',subtitle);
          const pair=photos.slice(index,index+2),boxW=126,boxH=112,gap=8,totalW=pair.length===1?boxW:(boxW*2+gap),startX=(297-totalW)/2;
          pair.forEach((photo,pos)=>{
            const x=startX+pos*(boxW+gap),y=48,size=fitPhoto(photo,boxW,boxH);
            const imageX=x+(boxW-size.w)/2,imageY=y+(boxH-size.h)/2;
            doc.setDrawColor(205,214,224);doc.setFillColor(248,250,252);doc.roundedRect(x,y,boxW,boxH,2,2,'FD');
            try{doc.addImage(photo.dataUrl,'JPEG',imageX,imageY,size.w,size.h,'','FAST')}catch(error){console.warn('[Stainher R170] fotografía PDF',error)}
            doc.setFont('helvetica','normal');doc.setFontSize(7);doc.setTextColor(75,85,99);
            const caption=doc.splitTextToSize(String(photo.name||`Fotografía ${index+pos+1}`),boxW-4);
            doc.text(caption,x+2,y+boxH+5,{maxWidth:boxW-4});
            doc.setTextColor(0);
          });
        }
      }

      doc.save(`Estandarizacion_Innovacion_EP${ep.ep_num}.pdf`);
      return true;
    }catch(error){
      console.error('[Stainher R165] Informe Estandarización e Innovación',error);
      window.toast?.(error?.message||String(error),'error');
      return false;
    }
  }

  async function render(){
    if(window.state?.contractTab!==TAB)return false;
    const host=document.getElementById('contractContent');
    if(!host||loading)return false;
    loading=true;
    installStyle();
    host.innerHTML='<div class="empty">Cargando Estandarización e Innovación…</div>';
    try{
      const rows=await fetchRows();
      if(window.state?.contractTab!==TAB||!host.isConnected)return false;
      const epId=selectedEpId(rows);
      window.state.r162StandardizationEpId=epId;
      const ep=eps().find(x=>String(x.id)===String(epId))||null;
      const filtered=rows.filter(x=>String(x.estado_pago_id)===String(epId));
      const net=filtered.reduce((s,x)=>s+num(x.venta_neta),0);
      const iva=filtered.reduce((s,x)=>s+num(x.iva),0);
      const total=filtered.reduce((s,x)=>s+num(x.total_final),0);
      host.innerHTML=`
        <div class="r162-toolbar">
          <div>
            <h3 style="margin:0 0 3px">Estandarización e Innovación</h3>
            <div class="muted">Presupuestos imputados al Estado de Pago seleccionado como Estandarización e Innovación.</div>
          </div>
          <div class="r165-report-controls">
            <label>Estado de Pago
              <select class="field" id="r162EpSelect">${epOptionHtml(epId,rows)}</select>
              <span class="r165-edp-legend">● = contiene datos</span>
            </label>
            <button class="btn primary" type="button" data-r165-report>Generar informe</button>
          </div>
        </div>
        <div class="r162-kpis">
          <div class="r162-kpi"><span>Presupuestos asignados</span><b>${filtered.length}</b></div>
          <div class="r162-kpi"><span>Monto neto</span><b>${money(net)}</b></div>
          <div class="r162-kpi"><span>IVA</span><b>${money(iva)}</b></div>
          <div class="r162-kpi"><span>Total IVA incluido</span><b>${money(total)}</b></div>
        </div>
        <div class="notice r162-note">
          ${ep?`EP${esc(ep.ep_num)} · ${esc(months[Number(ep.mes_edp)-1]||ep.mes_edp)} ${esc(ep.anio_edp)} · ${esc(dateCL(ep.periodo_inicio))} → ${esc(dateCL(ep.periodo_fin))}`:'Sin Estado de Pago seleccionado'}.
          Los montos se obtienen automáticamente desde los presupuestos asignados; no se duplican dentro de Gastos Reembolsables.
        </div>
        ${photoPanelHtml(epId)}
        <div class="r162-table"><table>
          <thead><tr><th>Fecha</th><th>Código</th><th>Equipo</th><th>Detalle</th><th>Monto neto</th><th>Total IVA incluido</th></tr></thead>
          <tbody>${filtered.map(row=>`
            <tr>
              <td>${esc(dateCL(row.fecha))}</td>
              <td><b>${esc(row.codigo||'—')}</b></td>
              <td>${esc(row.equipo_nombre||'—')}</td>
              <td class="r162-detail">${esc(budgetDetail(row))}</td>
              <td><b>${money(row.venta_neta)}</b></td>
              <td><b>${money(row.total_final)}</b></td>
            </tr>`).join('')||'<tr><td colspan="6"><div class="r162-empty">No hay presupuestos asignados a Estandarización e Innovación para este EDP.</div></td></tr>'}
          </tbody>
        </table></div>`;
      host.querySelector('#r162EpSelect')?.addEventListener('change',event=>{
        window.state.r162StandardizationEpId=event.target.value;
        render();
      });
      host.querySelector('[data-r165-report]')?.addEventListener('click',downloadReport);
      const photoInput=host.querySelector('#r170PhotoInput');
      host.querySelector('[data-r170-add-photo]')?.addEventListener('click',()=>photoInput?.click());
      photoInput?.addEventListener('change',async event=>{
        await addPhotoFiles(epId,event.target.files);
        event.target.value='';
        render();
      });
      host.querySelectorAll('[data-r170-remove-photo]').forEach(button=>button.addEventListener('click',()=>{
        removePhoto(epId,button.dataset.r170RemovePhoto);
        render();
      }));
      return true;
    }catch(error){
      if(host.isConnected)host.innerHTML=`<div class="notice error">No fue posible cargar Estandarización e Innovación: ${esc(error?.message||error||'Error desconocido')}</div>`;
      return false;
    }finally{
      loading=false;
    }
  }

  function tabRoot(){
    return document.querySelector('#page-contrato .v1520-tabs')
      || document.querySelector('#page-contrato #v1519ContractTabs')
      || document.querySelector('#page-contrato .v1516-contract-tabs')
      || document.querySelector('#page-contrato .contract-tabs');
  }

  function decorateTabs(){
    const tabs=tabRoot();
    if(!tabs)return false;
    let btn=tabs.querySelector('[data-r162-standardization-tab]');
    if(!btn){
      btn=document.createElement('button');
      btn.type='button';
      btn.className=tabs.classList.contains('v1520-tabs')?'btn':'contract-tab';
      btn.dataset.r162StandardizationTab='1';
      btn.textContent='Estandarización e Innovación';
      btn.addEventListener('click',()=>{
        window.state=window.state||{};
        window.state.contractTab=TAB;
        tabs.querySelectorAll('button').forEach(x=>x.classList.toggle('active',x===btn));
        render();
      });
    }
    const ggrr=[...tabs.querySelectorAll('button')].find(x=>norm(x.textContent)==='gastos reembolsables');
    if(ggrr&&ggrr.nextElementSibling!==btn)ggrr.insertAdjacentElement('afterend',btn);
    else if(!btn.isConnected)tabs.appendChild(btn);
    const selected=window.state?.contractTab===TAB;
    tabs.querySelectorAll('button').forEach(x=>{
      if(x===btn)x.classList.toggle('active',selected);
      else if(selected)x.classList.remove('active');
    });
    return true;
  }

  function wrapSetContractTab(){
    const current=window.setContractTab;
    if(typeof current!=='function'||current.__r164Standardization)return false;
    const wrapped=async function(tab){
      if(tab===TAB){
        window.state=window.state||{};
        window.state.contractTab=TAB;
        decorateTabs();
        return render();
      }
      const out=await current.apply(this,arguments);
      decorateTabs();
      return out;
    };
    wrapped.__r164Standardization=true;
    wrapped.__base=current;
    window.setContractTab=wrapped;
    try{setContractTab=wrapped}catch(_){}
    return true;
  }

  function wrapRenderContractTab(){
    const current=window.renderContractTab;
    if(typeof current!=='function')return false;
    if(current.__r162)return true;
    const wrapped=function(){
      decorateTabs();
      if(window.state?.contractTab===TAB)return render();
      const out=current.apply(this,arguments);
      requestAnimationFrame(decorateTabs);
      return out;
    };
    wrapped.__r162=true;
    wrapped.__base=current;
    window.renderContractTab=wrapped;
    try{renderContractTab=wrapped}catch(_){}
    return true;
  }

  function wrapRenderContrato(){
    const current=window.renderContrato;
    if(typeof current!=='function')return false;
    if(current.__r162)return true;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      requestAnimationFrame(()=>{decorateTabs();if(window.state?.contractTab===TAB)render()});
      return out;
    };
    wrapped.__r162=true;
    wrapped.__base=current;
    window.renderContrato=wrapped;
    try{renderContrato=wrapped}catch(_){}
    return true;
  }

  function install(){
    installStyle();
    wrapRenderContrato();
    wrapRenderContractTab();
    wrapSetContractTab();
    decorateTabs();
    if(window.state?.contractTab===TAB)render();
    if(!observer){
      const root=document.getElementById('page-contrato')||document.body;
      observer=new MutationObserver(()=>requestAnimationFrame(decorateTabs));
      observer.observe(root,{childList:true,subtree:true});
    }
  }

  window.StainherContractStandardizationR162=Object.freeze({install,render,decorateTabs,downloadReport,addPhotoFiles,removePhoto,photosForEp,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:runtime-r142-ready',install);
  window.addEventListener('stainher:runtime-r163-ready',install);
})();
