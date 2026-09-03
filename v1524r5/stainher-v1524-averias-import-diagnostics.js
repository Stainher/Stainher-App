/* Stainher App V15.24 r5 · Diagnóstico de importación masiva de averías
 * Desarrollo 8
 * - Acepta horas Excel, HH:mm, HH:mm:ss y AM/PM.
 * - Valida equipo existente y cronología inicio/término.
 * - Muestra errores por fila con causa exacta antes de importar.
 */
(function installAveriasImportDiagnostics(){
  'use strict';
  if(window.__STAINHER_AVERIAS_IMPORT_DIAGNOSTICS__) return;
  window.__STAINHER_AVERIAS_IMPORT_DIAGNOSTICS__=true;

  const baseParseHora=window.parseHora;
  const baseMapAveriaRow=window.mapAveriaRow;
  const esc=value=>typeof window.esc==='function'
    ? window.esc(value==null?'':String(value))
    : String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function empty(v){return v===null||v===undefined||String(v).trim()==='';}
  function rawPick(raw,names){for(const name of names){if(Object.prototype.hasOwnProperty.call(raw,name))return raw[name];}return undefined;}
  function rawText(v){
    if(v instanceof Date&&!isNaN(v)) return v.toISOString();
    if(v===null||v===undefined||v==='') return '—';
    return String(v);
  }

  function parseHoraFlexible(v){
    if(v===null||v===undefined||v==='') return null;
    if(v instanceof Date&&!isNaN(v)){
      return `${String(v.getUTCHours()).padStart(2,'0')}:${String(v.getUTCMinutes()).padStart(2,'0')}`;
    }
    if(typeof v==='number'&&Number.isFinite(v)){
      if(v>=0&&v<1){
        const min=Math.round(v*24*60)%1440;
        return `${String(Math.floor(min/60)).padStart(2,'0')}:${String(min%60).padStart(2,'0')}`;
      }
      if(typeof baseParseHora==='function') return baseParseHora(v);
    }
    let x=String(v).trim().toUpperCase().replace(/HRS?|HORAS?/g,'').replace(/\s+/g,' ');
    x=x.replace(/\b(AM|PM)\b/g,' $1').replace(/\s+/g,' ').trim();
    const m=x.match(/^(\d{1,2})(?::(\d{1,2}))?(?::(\d{1,2})(?:\.\d+)?)?\s*(AM|PM)?$/);
    if(m){
      let h=Number(m[1]),min=Number(m[2]||0),sec=Number(m[3]||0);const ap=m[4]||'';
      if(min>59||sec>59) return null;
      if(ap){if(h<1||h>12)return null;if(ap==='PM'&&h<12)h+=12;if(ap==='AM'&&h===12)h=0;}
      else if(h>23) return null;
      return `${String(h).padStart(2,'0')}:${String(min).padStart(2,'0')}`;
    }
    return typeof baseParseHora==='function'?baseParseHora(v):null;
  }
  window.parseHora=parseHoraFlexible;

  function headerGroups(){
    return [
      {label:'Equipo',names:['Equipo']},
      {label:'Fecha inicio trabajo',names:['Fecha inicio trabajo']},
      {label:'Hora inicio trabajo',names:['Hora inicio trabajo']},
      {label:'Fecha término de trabajo',names:['Fecha término de trabajo','Fecha termino de trabajo']},
      {label:'Hora término de trabajo',names:['Hora término de trabajo','Hora termino de trabajo']}
    ];
  }
  function missingHeaders(raw){
    const keys=new Set(Object.keys(raw?.[0]||{}));
    return headerGroups().filter(g=>!g.names.some(n=>keys.has(n))).map(g=>g.label);
  }

  function diagnose(raw,row,rowNumber){
    const errors=[];
    const eqRaw=rawPick(raw,['Equipo']);
    const fiRaw=rawPick(raw,['Fecha inicio trabajo']);
    const hiRaw=rawPick(raw,['Hora inicio trabajo']);
    const ftRaw=rawPick(raw,['Fecha término de trabajo','Fecha termino de trabajo']);
    const htRaw=rawPick(raw,['Hora término de trabajo','Hora termino de trabajo']);

    if(empty(eqRaw)) errors.push('Equipo vacío.');
    else if(!row.equipo_id) errors.push(`Equipo no reconocido: “${rawText(eqRaw)}”. Debe coincidir con un equipo activo de Stainher App.`);

    if(empty(fiRaw)) errors.push('Fecha inicio trabajo vacía.');
    else if(!row.fecha_inicio) errors.push(`Fecha inicio inválida: “${rawText(fiRaw)}”. Use dd-mm-aaaa o una fecha válida de Excel.`);

    if(empty(hiRaw)) errors.push('Hora inicio trabajo vacía.');
    else if(!row.hora_inicio) errors.push(`Hora inicio inválida: “${rawText(hiRaw)}”. Use hh:mm o hh:mm:ss.`);

    if(empty(ftRaw)) errors.push('Fecha término de trabajo vacía.');
    else if(!row.fecha_termino) errors.push(`Fecha término inválida: “${rawText(ftRaw)}”. Use dd-mm-aaaa o una fecha válida de Excel.`);

    if(empty(htRaw)) errors.push('Hora término de trabajo vacía.');
    else if(!row.hora_termino) errors.push(`Hora término inválida: “${rawText(htRaw)}”. Use hh:mm o hh:mm:ss.`);

    if(row.fecha_inicio&&row.hora_inicio&&row.fecha_termino&&row.hora_termino&&row.duracion_minutos===null){
      errors.push('La fecha/hora de término es anterior a la fecha/hora de inicio.');
    }
    return {rowNumber,errors,raw,row};
  }

  function renderErrorTable(invalidDetails,headerErrors){
    if(!invalidDetails.length&&!headerErrors.length) return '';
    const head=headerErrors.length
      ? `<div class="notice" style="border-color:#7f1d1d;background:rgba(127,29,29,.18);color:#fecaca"><b>Error de estructura del archivo:</b> faltan las columnas obligatorias: ${headerErrors.map(esc).join(', ')}.</div>`
      : '';
    const rows=invalidDetails.slice(0,50).map(d=>{
      const r=d.row||{},raw=d.raw||{};
      const ini=`${rawText(rawPick(raw,['Fecha inicio trabajo']))} ${rawText(rawPick(raw,['Hora inicio trabajo']))}`;
      const fin=`${rawText(rawPick(raw,['Fecha término de trabajo','Fecha termino de trabajo']))} ${rawText(rawPick(raw,['Hora término de trabajo','Hora termino de trabajo']))}`;
      return `<tr><td><b>${d.rowNumber}</b></td><td>${esc(rawPick(raw,['Equipo'])||r._equipoNorm||'—')}</td><td>${esc(r.numero_guia||'—')}</td><td>${esc(ini)}</td><td>${esc(fin)}</td><td><div style="display:grid;gap:4px">${d.errors.map(e=>`<span class="error">• ${esc(e)}</span>`).join('')}</div></td></tr>`;
    }).join('');
    const more=invalidDetails.length>50?`<div class="muted" style="margin-top:8px">Se muestran las primeras 50 filas con error de ${invalidDetails.length}.</div>`:'';
    return `${head}<div class="panel" style="border-color:rgba(251,113,133,.45)"><h3 style="color:#fda4af">Detalle de registros con error</h3><div class="muted" style="margin:-6px 0 12px">Corrige estas filas en el Excel y vuelve a seleccionarlo. La columna “Fila Excel” corresponde al número visible en la hoja.</div><div style="overflow:auto"><table><thead><tr><th>Fila Excel</th><th>Equipo</th><th>Guía</th><th>Inicio original</th><th>Término original</th><th>Error detectado</th></tr></thead><tbody>${rows||'<tr><td colspan="6" class="empty">No hay errores por fila.</td></tr>'}</tbody></table></div>${more}</div>`;
  }

  async function previewAveriasFileDetailed(ev){
    try{
      const file=ev.target.files?.[0];if(!file)return;
      const buf=await file.arrayBuffer();
      const wb=window.XLSX.read(buf,{type:'array',cellDates:true});
      const ws=wb.Sheets[wb.SheetNames[0]];
      const raw=window.XLSX.utils.sheet_to_json(ws,{defval:'',raw:true});
      const headerErrors=missingHeaders(raw);
      const excludedRaw=[];const candidateRaw=[];
      raw.forEach((item,index)=>{
        if(typeof window.esRegistroNoCorrectivo==='function'&&window.esRegistroNoCorrectivo(item)) excludedRaw.push({item,index});
        else candidateRaw.push({item,index});
      });
      const mapped=candidateRaw.map(({item,index})=>{
        const row=typeof baseMapAveriaRow==='function'?baseMapAveriaRow(item):window.mapAveriaRow(item);
        const detail=diagnose(item,row,index+2);
        row._valido=detail.errors.length===0&&headerErrors.length===0;
        return {row,detail};
      });
      const invalidDetails=mapped.filter(x=>!x.row._valido).map(x=>x.detail);
      const valid=mapped.filter(x=>x.row._valido).map(x=>x.row);

      const keys=[...new Set(valid.map(r=>r.clave_unica))],existing=new Set();
      for(let i=0;i<keys.length;i+=80){
        const {data,error}=await window.sb.from('averias').select('clave_unica').in('clave_unica',keys.slice(i,i+80));
        if(error) throw error;
        (data||[]).forEach(x=>existing.add(x.clave_unica));
      }
      const uniqueInFile=new Set(),nuevos=[];let dup=0;
      valid.forEach(r=>{if(existing.has(r.clave_unica)||uniqueInFile.has(r.clave_unica)){dup++;return;}uniqueInFile.add(r.clave_unica);nuevos.push(r);});
      window.state.importDraft={fileName:file.name,total:raw.length,excluded:excludedRaw.length,invalid:invalidDetails.length,duplicates:dup,rows:nuevos,invalidDetails};

      const sample=nuevos.slice(0,10);
      const preview=document.getElementById('importPreview');if(!preview)return;
      preview.innerHTML=`<div class="grid-kpi" style="grid-template-columns:repeat(5,minmax(140px,1fr))"><div class="kpi"><span>Leídos</span><strong>${raw.length}</strong></div><div class="kpi"><span>Nuevos</span><strong>${nuevos.length}</strong></div><div class="kpi"><span>Duplicados</span><strong>${dup}</strong></div><div class="kpi"><span>Excluidos</span><strong>${excludedRaw.length}</strong></div><div class="kpi ${invalidDetails.length?'bad':''}"><span>Con error</span><strong>${invalidDetails.length}</strong></div></div>${renderErrorTable(invalidDetails,headerErrors)}<div class="panel"><h3>Vista previa de registros nuevos</h3><div style="overflow:auto"><table><thead><tr><th>Fecha</th><th>Equipo</th><th>Guía</th><th>Responsable</th><th>Duración</th><th>Estado</th></tr></thead><tbody>${sample.map(r=>`<tr><td>${esc(r.fecha_inicio)}</td><td>${esc(r._equipoNorm)}</td><td>${esc(r.numero_guia||'—')}</td><td>${esc(r.supervisor_tecnico||'—')}</td><td>${r.duracion_minutos==null?'—':(typeof window.fmtH==='function'?window.fmtH(r.duracion_minutos/60):`${r.duracion_minutos} min`)}</td><td>${esc(typeof window.normalizarEstado==='function'?window.normalizarEstado(r.estado_final):r.estado_final)}</td></tr>`).join('')||'<tr><td colspan="6" class="empty">No hay registros nuevos para importar.</td></tr>'}</tbody></table></div></div><button class="btn primary" ${nuevos.length?'':'disabled'} onclick="confirmImportAverias()">Importar ${nuevos.length} registros</button>`;
    }catch(error){
      console.error('[Averías import]',error);
      const preview=document.getElementById('importPreview');
      if(preview)preview.innerHTML=`<div class="notice" style="border-color:#7f1d1d;background:rgba(127,29,29,.18);color:#fecaca"><b>No se pudo analizar el archivo.</b><br>${esc(error?.message||String(error))}</div>`;
      window.toast?.(error?.message||String(error),'error');
    }
  }
  previewAveriasFileDetailed.__v1524ImportDiagnostics=true;
  window.previewAveriasFile=previewAveriasFileDetailed;

  function rebind(){
    const input=document.getElementById('averiasFile');
    if(input&&input.dataset.v1524ImportDiagnostics!=='1'){
      input.dataset.v1524ImportDiagnostics='1';
      input.onchange=previewAveriasFileDetailed;
    }
  }
  const observer=new MutationObserver(rebind);
  function boot(){
    rebind();
    const root=document.getElementById('modalRoot')||document.body;
    observer.observe(root,{childList:true,subtree:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
