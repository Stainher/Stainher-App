(function(){
  'use strict';
  const BUILD='20260907-d12-r19-restauracion-integral-firma-justificativo';
  const isJust=x=>x?.tipo==='justificativo';
  const role=()=>String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
  const canRequestJustification=()=>['tecnico','supervisor'].includes(role())||/^(tecnico|supervisor)(?:_|\b)/.test(role());
  const row=id=>(window.state?.v154Requests||[]).find(x=>String(x.id)===String(id));
  const safe=v=>window.esc?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const date=v=>window.fmtDateCL?.(v)||v||'—';

  function installStyle(){
    if(document.getElementById('stainher-justificativos-r19-style'))return;
    const s=document.createElement('style');s.id='stainher-justificativos-r19-style';s.textContent=`
      .v1524-just-fields{display:contents}.v1524-just-card{border-left:4px solid #38bdf8!important}.v1524-just-detail{display:grid;gap:5px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:rgba(56,189,248,.07)}
      .v1524-letter-preview{padding:20px;border:1px solid var(--line);border-radius:12px;background:#fff;color:#172033;line-height:1.55}.v1524-letter-preview p{margin:0 0 12px}.v1524-letter-preview h4{color:#172033}.v1524-applicant-signature{display:grid;justify-items:center;width:230px;margin:14px 0 0 auto;border-top:1px solid #94a3b8;padding-top:8px}.v1524-applicant-signature img{width:190px;height:62px;object-fit:contain}.v1524-applicant-signature span{font-size:11px;font-weight:700}
      @media(max-width:760px){.v1524-letter-preview{padding:14px;font-size:13px}}
    `;document.head.appendChild(s);
  }

  const baseLabel=window.v152RequestLabel;
  window.v152RequestLabel=function(type){return type==='justificativo'?'Justificativo laboral':baseLabel?.(type)||String(type||'Solicitud')};
  const baseStatus=window.v1517RequestStatus;
  window.v1517RequestStatus=function(x){if(isJust(x)&&x.estado==='pendiente_rrhh')return ['warn','Pendiente de visado RR.HH.'];if(isJust(x)&&x.estado==='aprobada')return ['ok','Visado por RR.HH.'];return baseStatus?.(x)||['warn',x?.estado||'Pendiente']};

  const baseModal=window.v154RequestModal;
  window.v154RequestModal=async function(...args){
    const out=await baseModal?.(...args),form=document.getElementById('v1522ReqForm');
    if(!form||!canRequestJustification())return out;
    if(form.tipo.querySelector('option[value="justificativo"]'))return out;
    const option=document.createElement('option');option.value='justificativo';option.textContent='Justificativo laboral';form.tipo.appendChild(option);
    const comment=form.comentario?.closest('label');if(!comment)return out;
    const fields=document.createElement('div');fields.className='v1524-just-fields';fields.innerHTML=`<label class="full hidden" data-just-institution>Institución o destinatario<input class="field" name="justificativo_institucion" maxlength="180" placeholder="Ej.: Universidad, instituto u otra institución"></label><label class="full hidden" data-just-text>Texto complementario para el documento<textarea class="field" name="justificativo_texto" maxlength="2000" rows="3" placeholder="Información adicional que RR.HH. debe considerar (opcional)"></textarea></label><div class="full hidden" data-just-sign><h4>Firma personal</h4><p class="muted">Utiliza tu firma guardada, dibuja o carga una firma PNG transparente.</p><canvas id="v1524JustificationApplicantSig" class="v12-signature" width="1000" height="220"></canvas><div class="v154-signature-state">Firma pendiente</div></div>`;comment.before(fields);
    const baseSync=form.tipo.onchange;
    const sync=()=>{baseSync?.();const active=form.tipo.value==='justificativo',end=form.fecha_fin?.closest('label'),start=form.fecha_inicio?.closest('label'),institution=form.querySelector('[data-just-institution]'),extra=form.querySelector('[data-just-text]'),signature=form.querySelector('[data-just-sign]');institution?.classList.toggle('hidden',!active);extra?.classList.toggle('hidden',!active);signature?.classList.toggle('hidden',!active);if(form.justificativo_institucion)form.justificativo_institucion.required=active;if(active){start?.classList.remove('hidden');end?.classList.add('hidden');form.fecha_inicio.required=true;form.fecha_inicio.removeAttribute('min');form.fecha_fin.required=false;form.comentario.placeholder='Ej.: asistencia a turno de trabajo en la fecha seleccionada.';window.v12SetupSig?.('v1524JustificationApplicantSig');window.v154InstallSignatureFullscreen?.('v1524JustificationApplicantSig','Firma personal del justificativo')}else{form.fecha_inicio?.setAttribute('min',new Date().toISOString().slice(0,10));form.comentario.placeholder=''}};
    form.tipo.onchange=sync;
    const baseSubmit=form.onsubmit;
    form.onsubmit=async event=>{
      if(form.tipo.value!=='justificativo')return baseSubmit?.call(form,event);
      event.preventDefault();event.stopImmediatePropagation();if(window.state?.v15PreviewRole)return window.toast?.('Modo simulación: inicia sesión con el usuario real para guardar.','warn');
      const values=Object.fromEntries(new FormData(form));if(!values.fecha_inicio)return window.toast?.('Selecciona la fecha que se justificará.','error');const signed=typeof V12_SIG!=='undefined'&&V12_SIG.v1524JustificationApplicantSig;if(!signed)return window.toast?.('Debes incorporar tu firma personal al justificativo.','error');const applicantSignature=window.v12SigData?.('v1524JustificationApplicantSig');
      const button=form.querySelector('[type="submit"]');if(button?.disabled)return;if(button){button.disabled=true;button.textContent='Enviando a RR.HH.…'}
      try{
        const q=await window.sb.rpc('crear_justificativo_firmado_v1524',{p_fecha:values.fecha_inicio,p_institucion:values.justificativo_institucion,p_motivo:values.comentario,p_texto:values.justificativo_texto||null,p_firma:applicantSignature});if(q.error)throw q.error;
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
    if(x.estado==='pendiente_rrhh'&&x.etapa==='rrhh'&&role()==='recursos_humanos'&&assigned)html=`<button class="btn primary" onclick="v1524OpenJustificationVisa('${x.id}')">Visar justificativo</button><button class="btn" onclick="v1524RejectJustification('${x.id}')">Rechazar</button>`;
    if(x.estado==='aprobada')html+=`<button class="btn" onclick="v1524DownloadJustification('${x.id}')">Descargar PDF</button>`;
    return html;
  };

  function letterText(x){const person=x.perfiles?.nombre||'el/la trabajador(a)',institution=x.justificativo_institucion||'la institución indicada';return `Stainher Ascensores Ltda. deja constancia de que ${person}, quien se desempeña como ${String(x.solicitante_rol||'trabajador').replaceAll('_',' ')}, se encontraba cumpliendo funciones laborales y turno asignado el día ${date(x.fecha_inicio)}. El presente justificativo se emite a solicitud del interesado para ser presentado ante ${institution}.`;}
  window.v1524OpenJustificationVisa=function(id){
    const x=row(id);if(!x||!isJust(x)||role()!=='recursos_humanos')return window.toast?.('No tienes autorización para visar este documento.','error');
    document.getElementById('modalRoot').innerHTML=`<div class="modal-bg"><div class="modal"><div class="row-between"><h3>Visar justificativo laboral</h3><button class="btn" onclick="closeModal()">Cerrar</button></div><div class="v1524-letter-preview"><h4>${safe(x.justificativo_institucion||'A quien corresponda')}</h4><p>${safe(letterText(x))}</p><p><b>Motivo informado:</b> ${safe(x.comentario||'—')}</p>${x.justificativo_texto?`<p>${safe(x.justificativo_texto)}</p>`:''}${x.firma_solicitante?`<div class="v1524-applicant-signature"><img src="${safe(x.firma_solicitante)}" alt="Firma personal del solicitante"><span>${safe(x.perfiles?.nombre||'Solicitante')}</span><small>Firma del solicitante</small></div>`:'<div class="notice warn">Este justificativo no contiene la firma personal del solicitante.</div>'}</div><form id="v1524JustVisaForm"><div class="full" style="margin-top:14px"><h4>Firma y visado de Recursos Humanos</h4><canvas id="v1524JustificationHrSig" class="v12-signature" width="1000" height="220"></canvas><div class="v154-signature-state">Firma pendiente</div></div><div style="margin-top:12px"><button class="btn primary" type="submit">Visar y generar PDF</button></div></form></div></div>`;
    window.v12SetupSig?.('v1524JustificationHrSig');window.v154InstallSignatureFullscreen?.('v1524JustificationHrSig','Firma de Recursos Humanos');
    document.getElementById('v1524JustVisaForm').onsubmit=async event=>{event.preventDefault();const signed=typeof V12_SIG!=='undefined'&&V12_SIG.v1524JustificationHrSig;if(!signed)return window.toast?.('Debes firmar el visado de Recursos Humanos.','error');const sig=window.v12SigData?.('v1524JustificationHrSig'),button=event.currentTarget.querySelector('[type="submit"]');button.disabled=true;try{const q=await window.sb.rpc('resolver_justificativo_laboral_v1524',{p_id:String(id),p_accion:'visar',p_motivo:null,p_firma:sig});if(q.error)throw q.error;x.firma_rrhh=sig;x.rrhh_nombre=window.state?.profile?.nombre||'Recursos Humanos';x.estado='aprobada';x.firmado_rrhh_at=new Date().toISOString();window.v1524BuildJustificationPdf(x).save(window.v1524JustificationFilename(x));window.closeModal?.();await window.renderSolicitudesV15?.();await window.v15LoadNotifications?.();window.toast?.('Justificativo visado y PDF generado.','success')}catch(error){window.toast?.(error.message||String(error),'error');button.disabled=false}};
  };
  window.v1524RejectJustification=async function(id){const motive=prompt('Motivo del rechazo del justificativo:');if(motive===null)return;if(motive.trim().length<5)return window.toast?.('Indica un motivo de al menos 5 caracteres.','error');try{const q=await window.sb.rpc('resolver_justificativo_laboral_v1524',{p_id:String(id),p_accion:'rechazar',p_motivo:motive.trim(),p_firma:null});if(q.error)throw q.error;await window.renderSolicitudesV15?.();await window.v15LoadNotifications?.();window.toast?.('Justificativo rechazado y solicitante notificado.','success')}catch(error){window.toast?.(error.message||String(error),'error')}};

  window.v1524JustificationFilename=x=>`Justificativo_Laboral_${String(x.perfiles?.nombre||'trabajador').replace(/[^a-z0-9áéíóúñ]+/gi,'_')}_${x.fecha_inicio||'fecha'}.pdf`;
  window.v1524BuildJustificationPdf=function(x){
    const C=window.ensurePdf(),doc=new C({unit:'mm',format:'a4'});window.installCorporatePdfV95?.(doc,'Justificativo Laboral','Documento visado por Recursos Humanos');let y=43;
    doc.setTextColor(25,31,40);doc.setFont('helvetica','bold');doc.setFontSize(12);doc.text(x.justificativo_institucion||'A quien corresponda',14,y);y+=12;doc.setFont('helvetica','normal');doc.setFontSize(10);doc.setLineHeightFactor(1.45);
    const paragraphs=[letterText(x),`Motivo informado: ${x.comentario||'Sin detalle adicional.'}`,x.justificativo_texto||'',`Se extiende el presente documento en la fecha ${new Date().toLocaleDateString('es-CL')}, para los fines que la persona interesada estime convenientes.`].filter(Boolean);
    for(const paragraph of paragraphs){const lines=doc.splitTextToSize(paragraph,180);doc.text(lines,14,y);y+=lines.length*5+5}
    y=Math.max(y+10,145);const signer=x.rrhh_nombre||(role()==='recursos_humanos'&&String(x.rrhh_user_id||'')===String(window.state?.session?.user?.id||'')?window.state?.profile?.nombre:'Recursos Humanos'),boxes=[{x:15,label:'Solicitante',name:x.perfiles?.nombre||'Trabajador',sig:x.firma_solicitante},{x:125,label:'Visado Recursos Humanos',name:signer||'Recursos Humanos',sig:x.firma_rrhh}];for(const box of boxes){doc.setDrawColor(130,145,165);doc.rect(box.x,y,70,38);if(box.sig)try{doc.addImage(box.sig,'PNG',box.x+5,y+3,60,24)}catch(_){}doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text(box.name,box.x+35,y+30,{align:'center',maxWidth:66});doc.setFont('helvetica','normal');doc.setFontSize(8);doc.text(box.label,box.x+35,y+35,{align:'center',maxWidth:66})}doc.setFontSize(7);doc.text(`Folio: ${String(x.id||'').slice(0,8).toUpperCase()}`,14,275);return doc;
  };
  window.v1524DownloadJustification=function(id){const x=row(id);if(!x?.firma_rrhh)return window.toast?.('El justificativo todavía no cuenta con firma de Recursos Humanos.','warn');window.v1524BuildJustificationPdf(x).save(window.v1524JustificationFilename(x))};

  const baseRender=window.renderSolicitudesV15;
  window.renderSolicitudesV15=async function(...args){const out=await baseRender?.(...args);const rows=window.state?.v154Requests||[],cards=[...document.querySelectorAll('#page-solicitudes .v152-request-card')];cards.forEach((card,index)=>{const x=rows[index];if(!isJust(x))return;card.classList.add('v1524-just-card');const wide=card.querySelector('.wide'),detail=document.createElement('div');detail.className='wide v1524-just-detail';detail.innerHTML=`<small>Destinatario del justificativo</small><b>${safe(x.justificativo_institucion||'—')}</b><span><b>Fecha a justificar:</b> ${safe(date(x.fecha_inicio))}</span>${x.justificativo_texto?`<span><b>Texto complementario:</b> ${safe(x.justificativo_texto)}</span>`:''}`;wide?.before(detail)});return out};

  installStyle();window.STAINHER_JUSTIFICATIVOS={build:BUILD,ready:true};
})();
