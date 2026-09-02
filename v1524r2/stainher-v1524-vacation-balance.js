(function(){
  'use strict';
  const w=window;
  function escAttr(v){return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
  function installVacationStyles(){
    if(document.getElementById('stainher-vacation-flow-style'))return;
    const style=document.createElement('style');style.id='stainher-vacation-flow-style';style.textContent=`
      #vacationRequestPreview{width:100%;max-width:100%;min-width:0;overflow:hidden;box-sizing:border-box}
      #vacationRequestPreview>.row-between{flex-wrap:wrap;align-items:flex-start}
      #vacationRequestPreview .v15-summary-grid{display:grid!important;grid-template-columns:repeat(auto-fit,minmax(min(120px,100%),1fr))!important;width:100%!important;max-width:100%!important;min-width:0!important;gap:10px!important;overflow:visible!important}
      #vacationRequestPreview .v15-summary-card{width:auto!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;overflow:hidden!important}
      #vacationRequestPreview .v15-summary-card span{display:block;white-space:normal;overflow-wrap:anywhere}
      #page-solicitudes .v152-request-card{display:grid!important;grid-template-columns:repeat(4,minmax(0,1fr))!important;gap:16px 20px!important;align-items:start!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important}
      #page-solicitudes .v152-request-card>.v1524-request-field{min-width:0!important;max-width:100%!important;overflow-wrap:anywhere}
      #page-solicitudes .v152-request-card>.v1524-request-period{grid-column:1}
      #page-solicitudes .v152-request-card>.v1524-request-person{grid-column:2}
      #page-solicitudes .v152-request-card>.v1524-request-type{grid-column:3}
      #page-solicitudes .v152-request-card>.v1524-request-approval{grid-column:4}
      #page-solicitudes .v152-request-card>.v1524-request-subject{grid-column:1/2}
      #page-solicitudes .v152-request-card>.v1524-request-description{grid-column:2/-1}
      #page-solicitudes .v152-request-card.v1524-request-no-subject>.v1524-request-description{grid-column:1/-1}
      #page-solicitudes .v152-request-card>.v1524-request-status{grid-column:1}
      #page-solicitudes .v152-request-card>.v154-request-actions{grid-column:2/-1!important;display:flex!important;flex-wrap:wrap!important;justify-content:flex-end!important;align-items:center!important;gap:8px!important;min-width:0!important}
      #page-solicitudes .v152-request-card>.v154-request-actions .btn{margin:0!important}
      #page-solicitudes .v152-request-card>.v1524-request-status .status{display:inline-flex!important;width:max-content!important;max-width:100%!important}
      @media(max-width:900px){
        #page-solicitudes .v152-request-card{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #page-solicitudes .v152-request-card>.v1524-request-period,#page-solicitudes .v152-request-card>.v1524-request-type,#page-solicitudes .v152-request-card>.v1524-request-status{grid-column:1}
        #page-solicitudes .v152-request-card>.v1524-request-person,#page-solicitudes .v152-request-card>.v1524-request-approval{grid-column:2}
        #page-solicitudes .v152-request-card>.v1524-request-subject,#page-solicitudes .v152-request-card>.v1524-request-description{grid-column:1/-1}
        #page-solicitudes .v152-request-card>.v154-request-actions{grid-column:2/-1!important}
      }
      @media(max-width:560px){#vacationRequestPreview .v15-summary-grid{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media(max-width:560px){
        #page-solicitudes .v152-request-card{grid-template-columns:1fr!important;gap:12px!important}
        #page-solicitudes .v152-request-card>.v1524-request-field,#page-solicitudes .v152-request-card>.v154-request-actions{grid-column:1!important}
        #page-solicitudes .v152-request-card>.v154-request-actions{justify-content:stretch!important}
        #page-solicitudes .v152-request-card>.v154-request-actions .btn{flex:1 1 120px!important}
      }
    `;document.head.appendChild(style);
  }
  async function addEditField(uid){
    const form=document.getElementById('editUserFormV1517');
    if(!form||form.querySelector('[name="saldo_vacaciones"]')||!w.sb)return;
    const q=await w.sb.from('perfiles').select('saldo_vacaciones').eq('id',uid).maybeSingle();
    if(q.error){w.toast?.('No se pudo cargar el saldo de vacaciones: '+q.error.message,'error');return}
    const label=document.createElement('label');
    label.innerHTML=`Saldo de vacaciones (días)<input class="field" name="saldo_vacaciones" type="number" min="0" step="0.5" value="${escAttr(Number(q.data?.saldo_vacaciones??15))}"><small class="muted">Valor editable manualmente. Saldo inicial: 15 días.</small>`;
    const permissions=form.querySelector('.v11-permissions,.permission-grid,[data-permission-editor]');
    form.insertBefore(label,permissions||form.querySelector('.full')||form.firstChild);
    const input=label.querySelector('input');
    let saved=String(input.value);
    input.addEventListener('change',async()=>{
      const value=Number(input.value);
      if(!Number.isFinite(value)||value<0){input.value=saved;return w.toast?.('Ingresa un saldo válido igual o superior a 0.','error')}
      input.disabled=true;
      const up=await w.sb.from('perfiles').update({saldo_vacaciones:value}).eq('id',uid);
      input.disabled=false;
      if(up.error){input.value=saved;return w.toast?.('No se pudo actualizar el saldo: '+up.error.message,'error')}
      saved=String(value);w.toast?.('Saldo de vacaciones actualizado','success');
    });
  }
  async function installVacationPreview(){
    const form=document.querySelector('#v1522ReqForm,#v1517RequestForm');
    if(!form||form.dataset.vacationPreview==='1')return;
    form.dataset.vacationPreview='1';
    const host=document.createElement('div');host.id='vacationRequestPreview';host.className='full panel hidden';
    const sign=form.querySelector('[data-sign],#v1517VacationSignature');form.insertBefore(host,sign||form.querySelector('.full:last-child'));
    let seq=0;
    const update=async()=>{
      const current=++seq,type=form.querySelector('[name="tipo"]')?.value,start=form.querySelector('[name="fecha_inicio"]')?.value,end=form.querySelector('[name="fecha_fin"]')?.value;
      host.classList.toggle('hidden',type!=='vacaciones');if(type!=='vacaciones')return;
      if(!start||!end||start>end){host.innerHTML='<h4>Vista previa de vacaciones</h4><div class="muted">Selecciona un período válido para calcular.</div>';return}
      host.innerHTML='<h4>Vista previa de vacaciones</h4><div class="muted">Calculando con la malla vigente…</div>';
      const uid=w.state?.session?.user?.id;
      const [profile,dot,hol,mesh]=await Promise.all([
        w.sb.from('perfiles').select('rol,saldo_vacaciones').eq('id',uid).maybeSingle(),
        w.sb.from('dotacion_contrato').select('cargo,aplica_turnos').eq('user_id',uid).maybeSingle(),
        w.sb.from('feriados_vacaciones').select('fecha,nombre').gte('fecha',start).lte('fecha',end),
        w.sb.from('turnos_malla_v1512').select('fecha,turno_base').eq('user_id',uid).gte('fecha',start).lte('fecha',end)
      ]);if(current!==seq)return;
      const error=profile.error||hol.error||mesh.error;if(error){host.innerHTML=`<h4>Vista previa de vacaciones</h4><div class="notice error">No se pudo calcular: ${escAttr(error.message)}</div>`;return}
      const holidays=new Set((hol.data||[]).map(x=>x.fecha)),role=String(profile.data?.rol||''),seven=!!dot.data?.aplica_turnos||['tecnico','supervisor','apr'].includes(role),days=[];
      for(let d=new Date(start+'T12:00:00'),last=new Date(end+'T12:00:00');d<=last;d.setDate(d.getDate()+1)){const iso=d.toISOString().slice(0,10),weekend=[0,6].includes(d.getDay()),holiday=holidays.has(iso);days.push({iso,weekend,holiday,workday:!weekend&&!holiday})}
      const scheduled=(mesh.data||[]).filter(x=>['A','C'].includes(x.turno_base)).length,discount=seven?scheduled:days.filter(x=>x.workday).length,balance=Number(profile.data?.saldo_vacaciones??15),projected=balance-discount,missing=seven&&(mesh.data||[]).length<days.length;
      host.innerHTML=`<div class="row-between"><div><h4>Vista previa de vacaciones</h4><div class="muted">${seven?'Turno 7×7 · días A/C programados':'Jornada administrativa · lunes a viernes sin festivos'}</div></div><span class="status ${projected<0?'bad':'ok'}">${discount} días a descontar</span></div><div class="v15-summary-grid" style="margin-top:10px"><div class="v15-summary-card"><span>Período</span><strong>${days.length}</strong></div><div class="v15-summary-card"><span>Hábiles</span><strong>${days.filter(x=>x.workday).length}</strong></div><div class="v15-summary-card"><span>Fin de semana</span><strong>${days.filter(x=>x.weekend).length}</strong></div><div class="v15-summary-card"><span>Festivos</span><strong>${days.filter(x=>x.holiday).length}</strong></div><div class="v15-summary-card"><span>Saldo actual</span><strong>${balance.toFixed(2)}</strong></div><div class="v15-summary-card"><span>Saldo proyectado</span><strong>${projected.toFixed(2)}</strong></div></div>${missing?'<div class="notice warn">La malla 7×7 no cubre todo el período. Revisa la programación antes de enviar.</div>':''}${projected<0?'<div class="notice error">Saldo insuficiente: la aprobación final será bloqueada.</div>':'<div class="notice">Cálculo informativo. Supabase confirmará el descuento al aprobar RR. HH.</div>'}`;
    };
    form.querySelector('[name="tipo"]')?.addEventListener('change',update);form.querySelector('[name="fecha_inicio"]')?.addEventListener('change',update);form.querySelector('[name="fecha_fin"]')?.addEventListener('change',update);update();
  }
  function addCreateDefault(){
    const form=document.getElementById('userFormV1517');
    if(!form||form.querySelector('[data-vacation-default]'))return;
    const note=document.createElement('div');note.className='full notice';note.dataset.vacationDefault='1';note.innerHTML='<b>Saldo inicial de vacaciones:</b> el usuario será creado con 15 días, editables posteriormente en su ficha.';
    form.insertBefore(note,form.querySelector('.full:last-child'));
  }
  async function completeRequesterNames(){
    const rows=w.state?.v154Requests||[],cards=[...document.querySelectorAll('#page-solicitudes .v152-request-card')];
    if(!rows.length||!cards.length||!w.sb)return;
    const ids=[...new Set(rows.map(row=>String(row.solicitante_user_id||'')).filter(Boolean))];
    const names=new Map();
    for(const row of rows){
      const name=String(row.solicitante?.nombre||row.perfiles?.nombre||row.solicitante_nombre||'').trim();
      if(name&&row.solicitante_user_id)names.set(String(row.solicitante_user_id),name);
    }
    const missing=ids.filter(id=>!names.has(id));
    if(missing.length){
      const q=await w.sb.from('perfiles').select('id,nombre,email,rol').in('id',missing);
      if(q.error)w.v1523RecordError?.('solicitudes/solicitantes',q.error);
      else for(const profile of q.data||[])if(profile?.nombre)names.set(String(profile.id),String(profile.nombre).trim());
    }
    const ownId=String(w.state?.session?.user?.id||''),ownName=String(w.state?.profile?.nombre||'').trim();
    rows.forEach((row,index)=>{
      const id=String(row.solicitante_user_id||''),name=names.get(id)||(id===ownId?ownName:'')||'Nombre no registrado';
      row.perfiles={...(row.perfiles||{}),nombre:name};
      const card=cards[index],fields=[...card?.querySelectorAll(':scope > div')||[]],classes={'Período':'period','Persona':'person','Tipo':'type','Aprobación':'approval','Asunto':'subject','Motivo / descripción':'description','Motivo / comentario':'description','Estado':'status'};
      for(const field of fields){const label=field.querySelector(':scope > small')?.textContent?.trim(),key=classes[label];if(key)field.classList.add('v1524-request-field',`v1524-request-${key}`)}
      card?.classList.toggle('v1524-request-no-subject',!fields.some(field=>field.classList.contains('v1524-request-subject')));
      const person=fields.find(node=>node.classList.contains('v1524-request-person'));
      const value=person?.querySelector(':scope > b');if(value)value.textContent=name;
    });
  }
  function install(){
    installVacationStyles();
    if(typeof w.openEditUserModal==='function'&&!w.openEditUserModal.__vacBalance){
      const base=w.openEditUserModal;
      const wrapped=async function(uid,...args){const out=await base.call(this,uid,...args);await addEditField(uid);return out};
      wrapped.__vacBalance=true;w.openEditUserModal=wrapped;
    }
    if(typeof w.openUserModal==='function'&&!w.openUserModal.__vacBalance){
      const base=w.openUserModal;
      const wrapped=async function(...args){const out=await base.apply(this,args);addCreateDefault();return out};
      wrapped.__vacBalance=true;w.openUserModal=wrapped;
    }
    if(typeof w.v1517VacationPdf==='function'&&!w.v1517VacationPdf.__vacFlow){
      const pdf=function(r){
        const C=w.ensurePdf?.(),doc=new C({unit:'mm',format:'a4'});
        w.installCorporatePdfV95?.(doc,'Comprobante de Vacaciones','Solicitud finalizada · Tres firmas');
        doc.autoTable({startY:35,theme:'grid',styles:{fontSize:8.5,textColor:[25,31,40]},body:[
          ['Trabajador',r.perfiles?.nombre||'Nombre no registrado'],['RUT',r.solicitante_rut||'RUT no registrado'],
          ['Cargo / perfil',r.solicitante_cargo||w.v1519RoleLabel?.(r.perfiles?.rol||'')||'Cargo no registrado'],
          ['Desde',w.fmtDateCL?.(r.fecha_inicio)||r.fecha_inicio],['Hasta',w.fmtDateCL?.(r.fecha_fin)||r.fecha_fin],
          ['Estado','APROBADA'],['Comentario',r.comentario||'']
        ]});
        let y=doc.lastAutoTable.finalY+7;
        doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Resumen de días y saldo',14,y);y+=3;
        doc.autoTable({startY:y,theme:'grid',head:[['Días período','Días hábiles','Fin de semana','Festivos','Días descontados']],body:[[
          r.vacaciones_dias_totales??'—',r.vacaciones_dias_habiles??'—',r.vacaciones_fines_semana??'—',r.vacaciones_festivos??'—',r.vacaciones_dias_descontados??'—'
        ]],styles:{fontSize:8,halign:'center',textColor:[25,31,40]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});
        y=doc.lastAutoTable.finalY+5;
        doc.autoTable({startY:y,theme:'grid',body:[['Regla aplicada',r.vacaciones_regla||'Pendiente de contabilización'],['Saldo disponible antes de autorizar',`${Number(r.vacaciones_saldo_anterior??0).toFixed(2)} días`],['Días descontados por esta solicitud',`${Number(r.vacaciones_dias_descontados??0).toFixed(2)} días`],['Saldo disponible después de autorizar',`${Number(r.vacaciones_saldo_final??0).toFixed(2)} días`]],styles:{fontSize:8,textColor:[25,31,40]}});
        y=doc.lastAutoTable.finalY+9;
        const signedAt=value=>{if(!value)return'Fecha y hora no registradas';const d=new Date(value);if(Number.isNaN(d.getTime()))return'Fecha y hora no registradas';return new Intl.DateTimeFormat('es-CL',{timeZone:'America/Santiago',day:'2-digit',month:'2-digit',year:'numeric',hour:'2-digit',minute:'2-digit',hour12:false}).format(d).replace(',', ' ·')+' h'};
        const boxes=[{x:14,w:55,label:'Solicitante',name:r.perfiles?.nombre||'',sig:r.firma_solicitante,at:r.firmado_solicitante_at},{x:77.5,w:55,label:w.v1519RoleLabel?.(r.aprobador_rol||'Aprobador')||'Aprobador',name:r.aprobador_nombre||'',sig:r.firma_aprobador,at:r.firmado_aprobador_at},{x:141,w:55,label:'Recursos Humanos',name:r.rrhh_nombre||'',sig:r.firma_rrhh,at:r.firmado_rrhh_at}];
        boxes.forEach(b=>{doc.setTextColor(25,31,40);doc.setFontSize(8);doc.setFont('helvetica','bold');doc.text(b.label,b.x,y);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text(b.name||'Nombre no registrado',b.x,y+4,{maxWidth:b.w});doc.rect(b.x,y+7,b.w,32);if(b.sig)try{doc.addImage(b.sig,'PNG',b.x+3,y+10,b.w-6,25)}catch(_){}doc.setFontSize(6.5);doc.text(signedAt(b.at),b.x,y+43,{maxWidth:b.w});});
        return doc;
      };pdf.__vacFlow=true;w.v1517VacationPdf=pdf;
    }
    if(typeof w.renderInicio==='function'&&!w.renderInicio.__vacBalance){
      const base=w.renderInicio;
      const wrapped=async function(...args){const out=await base.apply(this,args);const page=document.getElementById('page-inicio');if(!page||!w.state?.session||page.querySelector('#vacationBalanceHome'))return out;const q=await w.sb.from('perfiles').select('saldo_vacaciones').eq('id',w.state.session.user.id).maybeSingle();if(q.error)return out;const card=document.createElement('div');card.id='vacationBalanceHome';card.className='panel';card.innerHTML=`<div class="row-between"><div><h3>Saldo de vacaciones</h3><div class="muted">Saldo vigente después de solicitudes aprobadas</div></div><strong style="font-size:28px">${Number(q.data?.saldo_vacaciones??15).toFixed(2)} días</strong></div>`;const anchor=page.querySelector('.grid-kpi,.v15-summary-grid,.panel');anchor?.insertAdjacentElement('beforebegin',card);return out};
      wrapped.__vacBalance=true;w.renderInicio=wrapped;
    }
    if(typeof w.v154RequestModal==='function'&&!w.v154RequestModal.__vacPreview){
      const base=w.v154RequestModal;const wrapped=async function(...args){const out=await base.apply(this,args);await installVacationPreview();return out};wrapped.__vacPreview=true;w.v154RequestModal=wrapped;w.v152RequestModal=wrapped;w.v15VacationModal=wrapped;
    }
    if(typeof w.v1521DeleteRequest==='function'&&!w.v1521DeleteRequest.__vacSafeDelete){
      const safeDelete=async function(id){
        if(String(w.v11Role?.()||'')!=='administrador'||w.state?.v15PreviewRole)return w.toast?.('Solo el Administrador real puede eliminar solicitudes.','error');
        const row=(w.state?.v154Requests||[]).find(x=>String(x.id)===String(id)),approvedVacation=row?.tipo==='vacaciones'&&row?.estado==='aprobada',days=Number(row?.vacaciones_dias_descontados||0);
        const question=approvedVacation?`¿Eliminar esta solicitud de vacaciones aprobada? Se anulará su registro en Turnos y se restituirán ${days.toFixed(2)} días al saldo del usuario.`:'¿Eliminar esta solicitud? También se limpiarán sus notificaciones asociadas.';
        if(!confirm(question))return;
        const task=async()=>{const q=await w.sb.rpc('admin_eliminar_solicitud',{p_solicitud_id:id});if(q.error){w.v1523RecordError?.('solicitudes/eliminación',q.error);return w.toast?.('No se pudo eliminar: '+q.error.message,'error')}const restored=Number(q.data?.dias_restituidos||0),balance=q.data?.saldo_vacaciones;try{await w.renderSolicitudesV15?.();await w.v15LoadNotifications?.()}catch(error){w.v1523RecordError?.('solicitudes/recarga',error)}w.toast?.(restored>0?`Solicitud eliminada. Se restituyeron ${restored.toFixed(2)} días; saldo actual: ${Number(balance).toFixed(2)} días.`:'Solicitud eliminada correctamente','success')};
        return typeof w.v1523RequestLock==='function'?w.v1523RequestLock(`eliminar:${id}`,task):task();
      };
      safeDelete.__vacSafeDelete=true;w.v1521DeleteRequest=safeDelete;
    }
    if(typeof w.renderSolicitudesV15==='function'&&!w.renderSolicitudesV15.__vacRequesterNames){
      const base=w.renderSolicitudesV15;
      const wrapped=async function(...args){const out=await base.apply(this,args);await completeRequesterNames();return out};
      wrapped.__vacRequesterNames=true;w.renderSolicitudesV15=wrapped;
    }
  }
  let tries=0;(function boot(){install();if((typeof w.openEditUserModal!=='function'||typeof w.openUserModal!=='function')&&++tries<300)setTimeout(boot,100)})();
})();
