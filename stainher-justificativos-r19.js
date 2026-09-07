(function(){
  'use strict';
  const BUILD='20260907-d18-r19-descargo-saldo-vacaciones';
  const LEGAL_REPRESENTATIVE={name:'Luis Poblete López',role:'Representante Legal'};
  const MODULE_URL=document.currentScript?.src||location.href;
  const LEGAL_SIGNATURE_URL=new URL('assets/firma-timbre-luis-poblete.png',MODULE_URL).href+`?build=${BUILD}`;
  let legalSignatureData='';
  let legalSignaturePromise=null;
  const isJust=x=>x?.tipo==='justificativo';
  const role=()=>String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  const canRequestJustification=()=>['tecnico','supervisor'].includes(role())||/^(tecnico|supervisor)(?:_|\b)/.test(role());
  const row=id=>(window.state?.v154Requests||[]).find(x=>String(x.id)===String(id));
  const safe=v=>window.esc?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=v=>window.fmtDateCL?.(v)||v||'—';
  const personName=x=>String(x?.solicitante_nombre||x?.perfiles?.nombre||'').trim()||'Trabajador no identificado';
  const roleName=x=>String(x?.solicitante_rol||x?.perfiles?.rol||'trabajador').replaceAll('_',' ').replace(/\b\w/g,c=>c.toUpperCase());
  const issueDate=x=>date(x?.justificativo_emitido_at||new Date().toISOString());
  const legalSignature=()=>legalSignatureData;
  function preloadLegalSignature(){
    if(legalSignatureData)return Promise.resolve(legalSignatureData);
    if(legalSignaturePromise)return legalSignaturePromise;
    legalSignaturePromise=fetch(LEGAL_SIGNATURE_URL,{cache:'no-store'}).then(response=>{if(!response.ok)throw new Error(`HTTP ${response.status}`);return response.blob()}).then(blob=>new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(String(reader.result||''));reader.onerror=()=>reject(reader.error||new Error('No se pudo leer la firma institucional.'));reader.readAsDataURL(blob)})).then(data=>{if(!data.startsWith('data:image/png;base64,'))throw new Error('El archivo de firma no es un PNG válido.');legalSignatureData=data;return data}).catch(error=>{legalSignaturePromise=null;console.error('No se pudo cargar la firma institucional del representante legal.',error);throw error});
    return legalSignaturePromise;
  }

  function installStyle(){
    if(document.getElementById('stainher-justificativos-r19-style'))return;
    const s=document.createElement('style');s.id='stainher-justificativos-r19-style';s.textContent=`
      .v1524-just-fields{display:contents}.v1524-just-card{border-left:4px solid #38bdf8!important}.v1524-just-detail{display:grid;gap:5px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:rgba(56,189,248,.07)}
      .v1524-letter-preview{padding:20px;border:1px solid var(--line);border-radius:12px;background:#fff;color:#172033;line-height:1.55}.v1524-letter-preview p{margin:0 0 12px}.v1524-legal-signature{display:grid;justify-items:center;width:260px;margin:24px auto 0;border-top:1px solid #94a3b8;padding-top:8px}.v1524-legal-signature img{display:block;width:190px;height:70px;object-fit:contain;margin:-78px 0 0}.v1524-legal-signature span{font-size:11px;font-weight:700}
      @media(max-width:760px){.v1524-letter-preview{padding:14px;font-size:13px}}
    `;document.head.appendChild(s);
  }

  const baseLabel=window.v152RequestLabel;
  window.v152RequestLabel=function(type){return type==='justificativo'?'Justificativo laboral':baseLabel?.(type)||String(type||'Solicitud')};
  const baseStatus=window.v1517RequestStatus;
  window.v1517RequestStatus=function(x){if(isJust(x)&&x.estado==='pendiente_rrhh')return ['warn','Pendiente de visado RR.HH.'];if(isJust(x)&&x.estado==='aprobada')return ['ok','Emitido'];return baseStatus?.(x)||['warn',x?.estado||'Pendiente']};

  const baseModal=window.v154RequestModal;
  window.v154RequestModal=async function(...args){
    const out=await baseModal?.(...args),form=document.getElementById('v1522ReqForm');
    if(!form||!canRequestJustification())return out;
    if(form.tipo.querySelector('option[value="justificativo"]'))return out;
    const option=document.createElement('option');option.value='justificativo';option.textContent='Justificativo laboral';form.tipo.appendChild(option);
    const comment=form.comentario?.closest('label');if(!comment)return out;
    const fields=document.createElement('div');fields.className='v1524-just-fields';fields.innerHTML=`<label class="full hidden" data-just-institution>Institución o destinatario<input class="field" name="justificativo_institucion" maxlength="180" placeholder="Ej.: Universidad Andrés Bello" autocomplete="organization"></label><label class="full hidden" data-just-text>Antecedente complementario para RR.HH.<textarea class="field" name="justificativo_texto" maxlength="2000" rows="3" placeholder="Información adicional que deba considerarse en la revisión (opcional)"></textarea></label><div class="full hidden notice" data-just-info>El documento será revisado por Recursos Humanos y emitido con la firma del representante legal. No requiere firma del solicitante.</div>`;comment.before(fields);
    const baseSync=form.tipo.onchange;
    const sync=()=>{
      baseSync?.();const active=form.tipo.value==='justificativo',end=form.fecha_fin?.closest('label'),start=form.fecha_inicio?.closest('label');
      form.querySelector('[data-just-institution]')?.classList.toggle('hidden',!active);form.querySelector('[data-just-text]')?.classList.toggle('hidden',!active);form.querySelector('[data-just-info]')?.classList.toggle('hidden',!active);
      if(form.justificativo_institucion)form.justificativo_institucion.required=active;
      comment.classList.toggle('hidden',active);form.comentario.required=!active;
      if(active){start?.classList.remove('hidden');end?.classList.add('hidden');form.fecha_inicio.required=true;form.fecha_inicio.removeAttribute('min');form.fecha_fin.required=false}
      else{form.fecha_inicio?.setAttribute('min',new Date().toISOString().slice(0,10));form.comentario.placeholder=''}
    };
    form.tipo.onchange=sync;
    const baseSubmit=form.onsubmit;
    form.onsubmit=async event=>{
      if(form.tipo.value!=='justificativo')return baseSubmit?.call(form,event);
      event.preventDefault();event.stopImmediatePropagation();if(window.state?.v15PreviewRole)return window.toast?.('Modo simulación: inicia sesión con el usuario real para guardar.','warn');
      const values=Object.fromEntries(new FormData(form));if(!values.fecha_inicio)return window.toast?.('Selecciona la fecha que se justificará.','error');
      const button=form.querySelector('[type="submit"]');if(button?.disabled)return;if(button){button.disabled=true;button.textContent='Enviando a RR.HH.…'}
      try{
        const q=await window.sb.rpc('crear_justificativo_firmado_v1524',{p_fecha:values.fecha_inicio,p_institucion:values.justificativo_institucion,p_motivo:null,p_texto:values.justificativo_texto||null,p_firma:null});if(q.error)throw q.error;
        window.closeModal?.();await window.renderSolicitudesV15?.();await window.v15LoadNotifications?.();window.toast?.('Justificativo enviado directamente a Recursos Humanos.','success');
      }catch(error){window.v1523RecordError?.('solicitudes/justificativo',error);window.toast?.('No se pudo enviar el justificativo: '+(error.message||String(error)),'error');if(button&&document.body.contains(button)){button.disabled=false;button.textContent='Enviar solicitud'}}
    };
    sync();return out;
  };
  window.v152RequestModal=window.v154RequestModal;window.v15VacationModal=window.v154RequestModal;

  const baseActions=window.v1517RequestActions;
  window.v1517RequestActions=function(x){
    if(!isJust(x))return baseActions?.(x)||'';
    const assigned=String(x.rrhh_user_id||'')===String(window.state?.session?.user?.id||'');let html='';
    if(x.estado==='pendiente_rrhh'&&x.etapa==='rrhh'&&role()==='recursos_humanos'&&assigned)html=`<button class="btn primary" onclick="v1524OpenJustificationVisa('${x.id}')">Revisar y visar</button><button class="btn" onclick="v1524RejectJustification('${x.id}')">Rechazar</button>`;
    if(x.estado==='aprobada')html+=`<button class="btn" onclick="v1524DownloadJustification('${x.id}')">Descargar PDF</button>`;
    return html;
  };

  function defaultLetterText(x){return `Por medio de la presente, Stainher Ascensores Ltda., en su calidad de empleador, certifica que don(a) ${personName(x)}, quien se desempeña como ${roleName(x)} en el Contrato 4600029879 – Codelco División Andina, se encontraba cumpliendo funciones laborales y el turno asignado el día ${date(x.fecha_inicio)}. El presente certificado se emite para acreditar formalmente dicha circunstancia laboral ante la institución destinataria.`}
  function letterText(x){return String(x.justificativo_cuerpo||'').trim()||defaultLetterText(x)}
  function letterPreview(x){const institution=safe(x.justificativo_institucion||'Institución destinataria');return `<p><b>Fecha de emisión:</b> ${safe(issueDate(x))}</p><p><b>Señores<br>${institution}<br>Presente</b></p><p>De nuestra consideración:</p><p>${safe(letterText(x))}</p>${x.comentario?`<p><b>Antecedente informado:</b> ${safe(x.comentario)}</p>`:''}${x.justificativo_texto?`<p><b>Información complementaria:</b> ${safe(x.justificativo_texto)}</p>`:''}<p>El presente certificado se extiende a solicitud del interesado, para ser presentado ante ${institution} y acreditar formalmente la circunstancia laboral antes señalada.</p><p>Sin otro particular, saluda atentamente,</p><div class="v1524-legal-signature"><img src="${safe(LEGAL_SIGNATURE_URL)}" alt="Firma y timbre del representante legal"><span>${safe(LEGAL_REPRESENTATIVE.name)}</span><small>${safe(LEGAL_REPRESENTATIVE.role)}<br>Stainher Ascensores Ltda.</small></div>`}

  window.v1524OpenJustificationVisa=function(id){
    const x=row(id);if(!x||!isJust(x)||role()!=='recursos_humanos')return window.toast?.('No tienes autorización para visar este documento.','error');
    const draft={...x,justificativo_cuerpo:letterText(x)};
    document.getElementById('modalRoot').innerHTML=`<div class="modal-bg"><div class="modal"><div class="row-between"><h3>Revisar justificativo laboral</h3><button class="btn" onclick="closeModal()">Cerrar</button></div><form id="v1524JustVisaForm" class="form-grid"><label class="full">Institución destinataria<input class="field" name="institucion" maxlength="180" value="${safe(draft.justificativo_institucion||'')}"></label><label class="full">Texto del certificado<textarea class="field" name="cuerpo" maxlength="4000" rows="7" required>${safe(draft.justificativo_cuerpo)}</textarea></label><div class="full"><div class="row-between"><h4>Vista preliminar</h4><small class="muted">Se actualiza mientras editas</small></div><div class="v1524-letter-preview" data-just-preview>${letterPreview(draft)}</div></div><div class="full notice">Al visar, se guardará este texto y el documento quedará emitido con la firma institucional de ${safe(LEGAL_REPRESENTATIVE.name)}, ${safe(LEGAL_REPRESENTATIVE.role)}.</div><div class="full"><button class="btn primary" type="submit">Visar y emitir PDF</button></div></form></div></div>`;
    const form=document.getElementById('v1524JustVisaForm'),refresh=()=>{draft.justificativo_institucion=form.institucion.value.trim();draft.justificativo_cuerpo=form.cuerpo.value.trim();form.querySelector('[data-just-preview]').innerHTML=letterPreview(draft)};form.institucion.addEventListener('input',refresh);form.cuerpo.addEventListener('input',refresh);
    form.onsubmit=async event=>{event.preventDefault();refresh();if(draft.justificativo_institucion.length<2)return window.toast?.('Indica la institución destinataria.','error');if(draft.justificativo_cuerpo.length<80)return window.toast?.('El texto del certificado debe contener al menos 80 caracteres.','error');const button=event.currentTarget.querySelector('[type="submit"]');button.disabled=true;button.textContent='Incorporando firma…';try{await preloadLegalSignature();button.textContent='Emitiendo PDF…';const q=await window.sb.rpc('editar_y_resolver_justificativo_v1524',{p_id:String(id),p_accion:'visar',p_motivo:null,p_institucion:draft.justificativo_institucion,p_cuerpo:draft.justificativo_cuerpo});if(q.error)throw q.error;Object.assign(x,draft,{estado:'aprobada',justificativo_emitido_at:new Date().toISOString()});window.v1524BuildJustificationPdf(x).save(window.v1524JustificationFilename(x));window.closeModal?.();await window.renderSolicitudesV15?.();await window.v15LoadNotifications?.();window.toast?.('Justificativo visado y PDF emitido.','success')}catch(error){window.toast?.(error.message||String(error),'error');button.disabled=false;button.textContent='Visar y emitir PDF'}};
  };
  window.v1524RejectJustification=async function(id){const motive=prompt('Motivo del rechazo del justificativo:');if(motive===null)return;if(motive.trim().length<5)return window.toast?.('Indica un motivo de al menos 5 caracteres.','error');try{const q=await window.sb.rpc('resolver_justificativo_laboral_v1524',{p_id:String(id),p_accion:'rechazar',p_motivo:motive.trim(),p_firma:null});if(q.error)throw q.error;await window.renderSolicitudesV15?.();await window.v15LoadNotifications?.();window.toast?.('Justificativo rechazado y solicitante notificado.','success')}catch(error){window.toast?.(error.message||String(error),'error')}};

  window.v1524JustificationFilename=x=>`Justificativo_Laboral_${personName(x).replace(/[^a-z0-9áéíóúñ]+/gi,'_')}_${x.fecha_inicio||'fecha'}.pdf`;
  window.v1524BuildJustificationPdf=function(x){
    const C=window.ensurePdf(),doc=new C({unit:'mm',format:'a4'});window.installCorporatePdfV95?.(doc,'Justificativo Laboral','Documento visado por Recursos Humanos');let y=43;
    doc.setTextColor(25,31,40);doc.setFont('helvetica','normal');doc.setFontSize(9);doc.text(`Fecha de emisión: ${issueDate(x)}`,196,y,{align:'right'});y+=12;doc.setFont('helvetica','bold');doc.setFontSize(11);doc.text(['Señores',x.justificativo_institucion||'Institución destinataria','Presente'],14,y);y+=20;doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setLineHeightFactor(1.45);
    const paragraphs=['De nuestra consideración:',letterText(x),x.comentario?`Antecedente informado: ${x.comentario}`:'',x.justificativo_texto?`Información complementaria: ${x.justificativo_texto}`:'',`El presente certificado se extiende a solicitud del interesado, para ser presentado ante ${x.justificativo_institucion||'la institución destinataria'} y acreditar formalmente la circunstancia laboral antes señalada.`,'Sin otro particular, saluda atentamente,'].filter(Boolean);
    for(const paragraph of paragraphs){const lines=doc.splitTextToSize(paragraph,180);doc.text(lines,14,y);y+=lines.length*5+5}
    y=Math.max(y+8,165);const sig=legalSignature();if(sig)try{doc.addImage(sig,'PNG',75,y,60,24)}catch(_){}doc.setDrawColor(130,145,165);doc.line(70,y+27,140,y+27);doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(LEGAL_REPRESENTATIVE.name,105,y+33,{align:'center'});doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text([LEGAL_REPRESENTATIVE.role,'Stainher Ascensores Ltda.'],105,y+38,{align:'center'});doc.setFontSize(7);doc.text(`Folio: ${String(x.id||'').slice(0,8).toUpperCase()}`,14,275);return doc;
  };
  window.v1524DownloadJustification=async function(id){const x=row(id);if(x?.estado!=='aprobada')return window.toast?.('El justificativo todavía no ha sido visado por Recursos Humanos.','warn');try{await preloadLegalSignature();window.v1524BuildJustificationPdf(x).save(window.v1524JustificationFilename(x))}catch(error){window.toast?.('No se pudo incorporar la firma institucional: '+(error.message||String(error)),'error')}};

  const baseRender=window.renderSolicitudesV15;
  window.renderSolicitudesV15=async function(...args){const out=await baseRender?.(...args);const rows=window.state?.v154Requests||[],cards=[...document.querySelectorAll('#page-solicitudes .v152-request-card')];cards.forEach((card,index)=>{const x=rows[index];if(!isJust(x))return;card.classList.add('v1524-just-card');const wide=card.querySelector('.wide'),detail=document.createElement('div');detail.className='wide v1524-just-detail';detail.innerHTML=`<small>Destinatario del justificativo</small><b>${safe(x.justificativo_institucion||'—')}</b><span><b>Fecha a justificar:</b> ${safe(date(x.fecha_inicio))}</span>${x.justificativo_texto?`<span><b>Antecedente complementario:</b> ${safe(x.justificativo_texto)}</span>`:''}`;wide?.before(detail);if(!x.comentario)wide?.classList.add('hidden')});return out};

  preloadLegalSignature().catch(()=>{});installStyle();window.STAINHER_JUSTIFICATIVOS={build:BUILD,ready:true};
})();