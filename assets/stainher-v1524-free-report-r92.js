/* Stainher V15.24 · R92/R93 · Comunicados e informes libres.
 * Genera documentos corporativos sin persistir contenido.
 * R93 expone el acceso desde Administración del Contrato.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_FREE_REPORT_R92__)return;
  window.__STAINHER_FREE_REPORT_R92__=true;

  const FORM_ID='stainherFreeReportFormR92';
  const SIG_ID='v1592FreeReportSig';
  const esc=v=>typeof window.esc==='function'?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function style(){
    if(document.getElementById('stainher-free-report-r92-style'))return;
    const s=document.createElement('style');s.id='stainher-free-report-r92-style';s.textContent=`
      .stainher-free-report-r92-form{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}
      .stainher-free-report-r92-form .full{grid-column:1/-1}
      .stainher-free-report-r92-form textarea{resize:vertical;min-height:110px}
      .stainher-free-report-r92-sign{margin-top:4px}
      .stainher-free-report-r92-sign canvas{width:100%;height:170px;background:#fff;border:1px solid var(--line);border-radius:10px;touch-action:none}
      .stainher-free-report-r92-note{font-size:12px;color:var(--muted);margin-top:5px}
      @media(max-width:700px){.stainher-free-report-r92-form{grid-template-columns:1fr}.stainher-free-report-r92-form .full{grid-column:1}}
    `;document.head.appendChild(s);
  }

  function todayIso(){try{return new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date())}catch(_){return new Date().toISOString().slice(0,10)}}
  function profileName(){return String(window.state?.profile?.nombre||window.state?.session?.user?.user_metadata?.nombre||window.state?.session?.user?.email||'Usuario Stainher').trim()}
  function profileRole(){return String(window.state?.profile?.rol||'').trim()}
  function signatureData(){const canvas=document.getElementById(SIG_ID);if(!canvas)return null;try{if(typeof window.v12SigData==='function'){const d=window.v12SigData(SIG_ID);if(d&&d.length>100)return d}const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return null;const px=ctx.getImageData(0,0,canvas.width,canvas.height).data;let mark=false;for(let i=3;i<px.length;i+=4){if(px[i]>8&&(px[i-3]<245||px[i-2]<245||px[i-1]<245)){mark=true;break}}return mark?canvas.toDataURL('image/png'):null}catch(_){return null}}
  function ensurePdfCtor(){if(typeof window.ensurePdf==='function'){const C=window.ensurePdf();if(C)return C}return window.jspdf?.jsPDF||window.jsPDF||null}
  function addCorporate(doc,title,code){if(typeof window.installCorporatePdfV95==='function')window.installCorporatePdfV95(doc,title,code);else{doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text('STAINHER',14,16);doc.setFontSize(11);doc.text(title,14,24);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text(code,14,29)}}
  function formatDate(v){if(typeof window.fmtDateCL==='function')return window.fmtDateCL(v);const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?`${m[3]}-${m[2]}-${m[1]}`:String(v||'')}
  function safeName(v){return String(v||'documento').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9_-]+/g,'_').replace(/^_+|_+$/g,'').slice(0,80)||'documento'}
  function addWrappedText(doc,text,x,y,maxWidth,lineHeight=5,bottom=270){for(const p of String(text||'').replace(/\r/g,'').split('\n')){const lines=doc.splitTextToSize(p||' ',maxWidth);for(const line of lines){if(y>bottom){doc.addPage();y=30}doc.text(line,x,y);y+=lineHeight}y+=1.5}return y}

  function buildPdf(data){const C=ensurePdfCtor();if(!C)throw new Error('El generador PDF no está disponible.');const doc=new C({unit:'mm',format:'a4'}),typeLabel=data.tipo==='comunicado'?'COMUNICADO':'INFORME',code=`${typeLabel}-${String(data.fecha||'').replaceAll('-','')}`;addCorporate(doc,`${typeLabel} · ${data.titulo}`,code);if(typeof doc.autoTable==='function'){doc.autoTable({startY:34,theme:'grid',styles:{fontSize:8,cellPadding:2,textColor:[28,34,41]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]},body:[['Tipo',typeLabel,'Fecha',formatDate(data.fecha)],['Emitido por',data.ejecutor,'Cargo / perfil',data.rol||'—'],['Destinatario / Área',data.destinatario||'—','','']]})}let y=doc.lastAutoTable?.finalY?doc.lastAutoTable.finalY+9:45;doc.setTextColor(28,34,41);doc.setFont('helvetica','bold');doc.setFontSize(13);doc.text(data.titulo,14,y,{maxWidth:182});y+=9;doc.setFont('helvetica','normal');doc.setFontSize(9.5);y=addWrappedText(doc,data.cuerpo,14,y,182,5.2,255);if(data.observaciones){if(y>245){doc.addPage();y=30}y+=3;doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Observaciones',14,y);y+=6;doc.setFont('helvetica','normal');doc.setFontSize(8.5);y=addWrappedText(doc,data.observaciones,14,y,182,4.8,245)}if(y>218){doc.addPage();y=35}else y+=10;doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Firma del responsable',14,y);doc.rect(14,y+4,98,38);if(data.firma)doc.addImage(data.firma,'PNG',18,y+7,90,31);doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(data.ejecutor,18,y+48);if(data.rol){doc.setFontSize(7.5);doc.text(data.rol,18,y+53)}return doc}

  function readForm(){const form=document.getElementById(FORM_ID);if(!form)throw new Error('Formulario no disponible.');const o=Object.fromEntries(new FormData(form));return {tipo:o.tipo||'informe',titulo:String(o.titulo||'').trim(),destinatario:String(o.destinatario||'').trim(),fecha:o.fecha||todayIso(),cuerpo:String(o.cuerpo||'').trim(),observaciones:String(o.observaciones||'').trim(),ejecutor:profileName(),rol:profileRole(),firma:signatureData()}}
  function validate(data){const missing=[];if(!data.titulo)missing.push('Título');if(!data.fecha)missing.push('Fecha');if(!data.cuerpo)missing.push('Contenido');if(!data.firma)missing.push('Firma');if(missing.length)throw new Error('Completa: '+missing.join(', ')+'.')}
  function preview(){try{const data=readForm();validate(data);const doc=buildPdf(data);window.open(doc.output('bloburl'),'_blank')}catch(e){window.toast?.(e.message||String(e),'error')}}
  function download(){try{const data=readForm();validate(data);const doc=buildPdf(data);const type=data.tipo==='comunicado'?'Comunicado':'Informe';doc.save(`${type}_${safeName(data.titulo)}_${data.fecha}.pdf`);window.toast?.(`${type} generado correctamente.`,'success')}catch(e){window.toast?.(e.message||String(e),'error')}}

  async function applySavedSignature(){const button=document.querySelector('#'+FORM_ID+' [data-use-saved-signature]');if(button)button.disabled=true;try{let data=window.__STAINHER_SAVED_SIGNATURE__||null;if(!data){const uid=window.state?.session?.user?.id||(await window.sb?.auth?.getUser?.())?.data?.user?.id;if(uid){const q=await window.sb.from('firmas_usuario_v1524').select('imagen_png').eq('user_id',uid).maybeSingle();if(!q.error)data=q.data?.imagen_png||null}}if(!data)throw new Error('No tienes una firma guardada. Puedes dibujarla en el recuadro o guardarla desde Mi cuenta.');const canvas=document.getElementById(SIG_ID),img=new Image();img.onload=()=>{const ctx=canvas.getContext('2d');ctx.clearRect(0,0,canvas.width,canvas.height);ctx.drawImage(img,0,0,canvas.width,canvas.height);try{if(typeof window.V12_SIG!=='undefined')window.V12_SIG[SIG_ID]=true}catch(_){ }window.toast?.('Firma personal aplicada.','success')};img.src=data}catch(e){window.toast?.(e.message||String(e),'error')}finally{if(button)button.disabled=false}}

  function openModal(){const root=document.getElementById('modalRoot');if(!root)return window.toast?.('No se pudo abrir el formulario.','error');root.innerHTML=`<div class="modal-bg"><div class="modal modal-wide-v9"><div class="row-between"><div><h3>Comunicado / Informe libre</h3><div class="muted">Documento corporativo con contenido libre y firma del ejecutor.</div></div><button type="button" class="btn" onclick="closeModal()">Cerrar</button></div><form id="${FORM_ID}" class="stainher-free-report-r92-form"><label>Tipo de documento<select class="field" name="tipo"><option value="informe">Informe</option><option value="comunicado">Comunicado</option></select></label><label>Fecha<input class="field" type="date" name="fecha" value="${todayIso()}" required></label><label class="full">Título / Asunto<input class="field" name="titulo" maxlength="180" required placeholder="Ej.: Informe de condición operacional"></label><label class="full">Destinatario / Área<input class="field" name="destinatario" maxlength="180" placeholder="Ej.: Administración de Contrato / Codelco División Andina"></label><label class="full">Contenido<textarea class="field" name="cuerpo" rows="10" required placeholder="Redacta libremente el contenido del comunicado o informe..."></textarea></label><label class="full">Observaciones adicionales<textarea class="field" name="observaciones" rows="4" placeholder="Opcional"></textarea></label><div class="full panel stainher-free-report-r92-sign"><div class="row-between"><div><h4 style="margin:0">Firma del responsable</h4><div class="stainher-free-report-r92-note">Ejecutor: ${esc(profileName())}${profileRole()?` · ${esc(profileRole())}`:''}</div></div><button type="button" class="btn" data-use-saved-signature>Usar firma guardada</button></div><canvas id="${SIG_ID}" class="v12-signature" width="1000" height="220"></canvas></div><div class="full actions" style="justify-content:flex-end"><button type="button" class="btn" data-preview>Vista previa PDF</button><button type="button" class="btn primary" data-download>Generar PDF</button></div></form></div></div>`;try{window.v12SetupSig?.(SIG_ID);window.v154InstallSignatureFullscreen?.(SIG_ID,'Firma del informe')}catch(_){ }root.querySelector('[data-use-saved-signature]')?.addEventListener('click',applySavedSignature);root.querySelector('[data-preview]')?.addEventListener('click',preview);root.querySelector('[data-download]')?.addEventListener('click',download);setTimeout(()=>applySavedSignature(),80)}

  function install(){style()}
  install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:signature-r91-ready',install);
  window.StainherFreeReportR92=Object.freeze({install,openModal,buildPdf});
})();
