(function(){
  'use strict';
  const w=window;
  function escAttr(v){return String(v??'').replace(/&/g,'&amp;').replace(/"/g,'&quot;').replace(/</g,'&lt;')}
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
  function addCreateDefault(){
    const form=document.getElementById('userFormV1517');
    if(!form||form.querySelector('[data-vacation-default]'))return;
    const note=document.createElement('div');note.className='full notice';note.dataset.vacationDefault='1';note.innerHTML='<b>Saldo inicial de vacaciones:</b> el usuario será creado con 15 días, editables posteriormente en su ficha.';
    form.insertBefore(note,form.querySelector('.full:last-child'));
  }
  function install(){
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
          ['Desde',w.fmtDateCL?.(r.fecha_inicio)||r.fecha_inicio,'Hasta',w.fmtDateCL?.(r.fecha_fin)||r.fecha_fin],
          ['Estado','APROBADA'],['Comentario',r.comentario||'']
        ]});
        let y=doc.lastAutoTable.finalY+7;
        doc.setFont('helvetica','bold');doc.setFontSize(9);doc.text('Resumen de días y saldo',14,y);y+=3;
        doc.autoTable({startY:y,theme:'grid',head:[['Días período','Días hábiles','Fin de semana','Festivos','Días descontados']],body:[[
          r.vacaciones_dias_totales??'—',r.vacaciones_dias_habiles??'—',r.vacaciones_fines_semana??'—',r.vacaciones_festivos??'—',r.vacaciones_dias_descontados??'—'
        ]],styles:{fontSize:8,halign:'center',textColor:[25,31,40]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});
        y=doc.lastAutoTable.finalY+5;
        doc.autoTable({startY:y,theme:'grid',body:[['Regla aplicada',r.vacaciones_regla||'Pendiente de contabilización'],['Saldo anterior',`${Number(r.vacaciones_saldo_anterior??0).toFixed(2)} días`,'Saldo restante',`${Number(r.vacaciones_saldo_final??0).toFixed(2)} días`]],styles:{fontSize:8,textColor:[25,31,40]}});
        y=doc.lastAutoTable.finalY+9;
        const boxes=[{x:14,w:55,label:'Solicitante',name:r.perfiles?.nombre||'',sig:r.firma_solicitante},{x:77.5,w:55,label:w.v1519RoleLabel?.(r.aprobador_rol||'Aprobador')||'Aprobador',name:r.aprobador_nombre||'',sig:r.firma_aprobador},{x:141,w:55,label:'Recursos Humanos',name:r.rrhh_nombre||'',sig:r.firma_rrhh}];
        boxes.forEach(b=>{doc.setTextColor(25,31,40);doc.setFontSize(8);doc.setFont('helvetica','bold');doc.text(b.label,b.x,y);doc.setFont('helvetica','normal');doc.setFontSize(7);doc.text(b.name||'Nombre no registrado',b.x,y+4,{maxWidth:b.w});doc.rect(b.x,y+7,b.w,32);if(b.sig)try{doc.addImage(b.sig,'PNG',b.x+3,y+10,b.w-6,25)}catch(_){}});
        return doc;
      };pdf.__vacFlow=true;w.v1517VacationPdf=pdf;
    }
    if(typeof w.renderInicio==='function'&&!w.renderInicio.__vacBalance){
      const base=w.renderInicio;
      const wrapped=async function(...args){const out=await base.apply(this,args);const page=document.getElementById('page-inicio');if(!page||!w.state?.session||page.querySelector('#vacationBalanceHome'))return out;const q=await w.sb.from('perfiles').select('saldo_vacaciones').eq('id',w.state.session.user.id).maybeSingle();if(q.error)return out;const card=document.createElement('div');card.id='vacationBalanceHome';card.className='panel';card.innerHTML=`<div class="row-between"><div><h3>Saldo de vacaciones</h3><div class="muted">Saldo vigente después de solicitudes aprobadas</div></div><strong style="font-size:28px">${Number(q.data?.saldo_vacaciones??15).toFixed(2)} días</strong></div>`;const anchor=page.querySelector('.grid-kpi,.v15-summary-grid,.panel');anchor?.insertAdjacentElement('beforebegin',card);return out};
      wrapped.__vacBalance=true;w.renderInicio=wrapped;
    }
  }
  let tries=0;(function boot(){install();if((typeof w.openEditUserModal!=='function'||typeof w.openUserModal!=='function')&&++tries<300)setTimeout(boot,100)})();
})();
