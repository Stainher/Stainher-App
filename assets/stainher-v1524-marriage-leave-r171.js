/* Stainher V15.24 · R171 · Solicitudes: permisos legales personales.
 * - Matrimonio / AUC · Art. 207 bis Código del Trabajo.
 * - Fallecimiento familiar directo · Art. 66 Código del Trabajo.
 * - Nacimiento / adopción · Art. 195 Código del Trabajo.
 */
(()=>{
  'use strict';
  const BUILD='20261021-r172-formulario-productivo-permisos-legales';
  const TYPES={
    matrimonio:'permiso_matrimonio',
    fallecimiento:'permiso_fallecimiento',
    nacimiento:'permiso_nacimiento'
  };
  if(window.__STAINHER_LEGAL_LEAVE_R171__===BUILD)return;
  window.__STAINHER_LEGAL_LEAVE_R171__=BUILD;
  let timer=null,holidaysPromise=null;

  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const iso=v=>/^\d{4}-\d{2}-\d{2}$/.test(String(v||''));
  const dateCL=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:String(v||'')};
  const todayIso=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const addDays=(v,n)=>{const d=new Date(v+'T12:00:00');d.setDate(d.getDate()+n);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const diffDays=(a,b)=>iso(a)&&iso(b)?Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000):null;
  const role=()=>String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase();

  async function holidays(){
    if(holidaysPromise)return holidaysPromise;
    holidaysPromise=(async()=>{
      try{
        const q=await window.sb.from('feriados_vacaciones').select('fecha').order('fecha',{ascending:true});
        if(q.error)throw q.error;
        return new Set((q.data||[]).map(x=>String(x.fecha)));
      }catch(error){
        console.warn('[Stainher R171] feriados',error);
        return new Set();
      }finally{
        setTimeout(()=>{holidaysPromise=null},15000);
      }
    })();
    return holidaysPromise;
  }
  function isBusiness(v,set){
    if(!iso(v))return false;
    const d=new Date(v+'T12:00:00'),w=d.getDay();
    return w!==0&&w!==6&&!set.has(v);
  }
  function businessCount(from,to,set){
    if(!iso(from)||!iso(to)||from>to)return 0;
    let d=from,n=0;
    while(d<=to){if(isBusiness(d,set))n++;d=addDays(d,1)}
    return n;
  }
  function endByBusinessDays(start,count,set){
    if(!iso(start)||count<1)return '';
    let d=start,n=0;
    while(n<count){if(isBusiness(d,set))n++;if(n<count)d=addDays(d,1)}
    return d;
  }
  function prevBusinessDaysEnd(eventDate,count,set){
    let d=addDays(eventDate,-1),picked=[];
    while(picked.length<count){if(isBusiness(d,set))picked.push(d);d=addDays(d,-1)}
    picked.sort();return {from:picked[0]||'',to:picked[picked.length-1]||''};
  }
  function nextBusinessDaysStart(eventDate,count,set){
    let d=addDays(eventDate,1),picked=[];
    while(picked.length<count){if(isBusiness(d,set))picked.push(d);d=addDays(d,1)}
    return {from:picked[0]||'',to:picked[picked.length-1]||''};
  }

  function mountStyle(){
    if(document.getElementById('stainher-legal-leave-r171-style'))return;
    const s=document.createElement('style');s.id='stainher-legal-leave-r171-style';
    s.textContent=`
      #modalRoot .r171-box{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px;border:1px solid var(--line,#2b3645);border-radius:10px;background:var(--panel2,#16212d)}
      #modalRoot .r171-box.hidden{display:none!important}
      #modalRoot .r171-box .full{grid-column:1/-1}
      #modalRoot .r171-legal{grid-column:1/-1;border-left:3px solid #20c997;padding:9px 10px;background:rgba(32,201,151,.08);font-size:11px;line-height:1.45}
      #modalRoot .r171-legal b{display:block;margin-bottom:4px}
      #modalRoot .r171-status{grid-column:1/-1;font-size:11px;line-height:1.45}
      #modalRoot .r171-status.ok{color:#34d399}
      #modalRoot .r171-status.warn{color:#fbbf24}
      #page-solicitudes .r171-cert{margin-top:6px;padding:7px 9px;border:1px solid var(--line);border-radius:8px;font-size:10px}
      #page-solicitudes .r171-cert.pending{border-color:#d6a827;background:rgba(214,168,39,.08)}
      #page-solicitudes .r171-cert.received{border-color:#26966a;background:rgba(38,150,106,.08)}
      @media(max-width:680px){#modalRoot .r171-box{grid-template-columns:1fr}}
    `;
    document.head.appendChild(s);
  }

  function wrapLabel(){
    const current=window.v152RequestLabel;
    if(typeof current!=='function'||current.__r171LegalLeave)return false;
    const wrapped=function(type){
      const t=String(type||'');
      if(t===TYPES.matrimonio)return 'Permiso por matrimonio / AUC';
      if(t===TYPES.fallecimiento)return 'Permiso por fallecimiento familiar';
      if(t===TYPES.nacimiento)return 'Permiso por nacimiento de hijo';
      return current.apply(this,arguments);
    };
    wrapped.__r171LegalLeave=true;wrapped.__base=current;
    window.v152RequestLabel=wrapped;try{v152RequestLabel=wrapped}catch(_){}
    return true;
  }

  function deathRule(relation){
    return ({
      hijo:{days:10,unit:'días corridos',business:false,label:'Hijo/a',effective:'Desde el mismo día del fallecimiento.'},
      conyuge:{days:7,unit:'días corridos',business:false,label:'Cónyuge o conviviente civil',effective:'Desde el mismo día del fallecimiento.'},
      gestacion:{days:7,unit:'días hábiles',business:true,label:'Hijo/a en período de gestación',effective:'Desde el momento en que se acredita la muerte mediante certificado de defunción fetal.'},
      padre:{days:4,unit:'días hábiles',business:true,label:'Padre',effective:'Desde el mismo día del fallecimiento.'},
      madre:{days:4,unit:'días hábiles',business:true,label:'Madre',effective:'Desde el mismo día del fallecimiento.'},
      hermano:{days:4,unit:'días hábiles',business:true,label:'Hermano/a',effective:'Desde el mismo día del fallecimiento.'}
    })[relation]||null;
  }

  function legalComment(o){
    const type=String(o.tipo||'');
    if(type===TYPES.matrimonio){
      const kind=o.matrimonio_tipo==='auc'?'Acuerdo de Unión Civil':'Matrimonio';
      const notice=diffDays(todayIso(),o.evento_fecha);
      return [
        'PERMISO LEGAL POR MATRIMONIO / ACUERDO DE UNIÓN CIVIL',
        'Art. 207 bis del Código del Trabajo.',
        'Celebración: '+kind,
        'Fecha de celebración: '+dateCL(o.evento_fecha),
        'Período solicitado: '+dateCL(o.fecha_inicio)+' al '+dateCL(o.fecha_fin),
        'Beneficio: 5 días hábiles continuos de permiso pagado, adicionales al feriado anual.',
        'Anticipación registrada al momento de solicitar: '+(notice==null?'No determinada':notice+' día'+(Math.abs(notice)===1?'':'s'))+'. Este dato es informativo y no bloquea la solicitud.',
        'Certificado del Registro Civil: pendiente de presentación dentro de los 30 días siguientes a la celebración.',
        String(o.comentario||'').trim()? 'Comentario del trabajador: '+String(o.comentario).trim():''
      ].filter(Boolean).join('\n');
    }
    if(type===TYPES.fallecimiento){
      const rule=deathRule(o.fallecimiento_relacion);
      return [
        'PERMISO LEGAL POR FALLECIMIENTO FAMILIAR',
        'Art. 66 del Código del Trabajo.',
        'Vínculo: '+(rule?.label||o.fallecimiento_relacion||''),
        'Fecha del fallecimiento / acreditación: '+dateCL(o.evento_fecha),
        'Período legal: '+dateCL(o.fecha_inicio)+' al '+dateCL(o.fecha_fin),
        'Beneficio: '+(rule?rule.days+' '+rule.unit:'según vínculo')+' de permiso pagado.',
        'Inicio efectivo: '+(rule?.effective||'Según el hecho que origina el permiso.'),
        String(o.comentario||'').trim()? 'Comentario del trabajador: '+String(o.comentario).trim():''
      ].filter(Boolean).join('\n');
    }
    if(type===TYPES.nacimiento){
      return [
        'PERMISO LEGAL POR NACIMIENTO / ADOPCIÓN',
        'Art. 195 del Código del Trabajo.',
        'Origen: '+(o.nacimiento_origen==='adopcion'?'Adopción':'Nacimiento de hijo/a'),
        'Fecha del nacimiento / resolución: '+dateCL(o.evento_fecha),
        'Modalidad: '+(o.nacimiento_modalidad==='distribuido'?'Distribuido dentro del primer mes':'Continuo desde el nacimiento'),
        'Período solicitado: '+dateCL(o.fecha_inicio)+' al '+dateCL(o.fecha_fin),
        'Beneficio: 5 días de permiso pagado.',
        String(o.comentario||'').trim()? 'Comentario del trabajador: '+String(o.comentario).trim():''
      ].filter(Boolean).join('\n');
    }
    return String(o.comentario||'');
  }

  async function createLegalRequest(o){
    const type=String(o.tipo||''),map={
      [TYPES.matrimonio]:'matrimonio_auc',
      [TYPES.fallecimiento]:'fallecimiento',
      [TYPES.nacimiento]:'nacimiento_hijo'
    };
    let event='',days=5,unit='días',cert='no_aplica',mode=null;
    if(type===TYPES.matrimonio){
      event=o.matrimonio_tipo==='auc'?'auc':'matrimonio';
      unit='días hábiles';cert='pendiente';mode='continuo';
    }else if(type===TYPES.fallecimiento){
      const rule=deathRule(o.fallecimiento_relacion);if(!rule)throw new Error('Selecciona el vínculo familiar.');
      event=o.fallecimiento_relacion;days=rule.days;unit=rule.unit;cert=o.fallecimiento_relacion==='gestacion'?'pendiente':'no_aplica';mode=rule.business?'hábiles':'corridos';
    }else if(type===TYPES.nacimiento){
      event=o.nacimiento_origen==='adopcion'?'adopcion':'nacimiento';days=5;unit='días';mode=o.nacimiento_modalidad||'continuo';cert=o.nacimiento_origen==='adopcion'?'pendiente':'no_aplica';
    }else throw new Error('Tipo de permiso legal no válido.');

    const q=await window.sb.rpc('crear_solicitud_legal_r171',{
      p_tipo:type,
      p_fecha_inicio:o.fecha_inicio||null,
      p_fecha_fin:o.fecha_fin||null,
      p_comentario:legalComment(o),
      p_permiso_legal_tipo:map[type],
      p_permiso_legal_evento:event,
      p_permiso_legal_fecha_evento:o.evento_fecha||null,
      p_permiso_legal_modalidad:mode,
      p_permiso_legal_dias:days,
      p_permiso_legal_unidad:unit,
      p_permiso_legal_certificado_estado:cert,
      p_aprobador_user_id:role()==='administrador'?(o.aprobador_user_id||null):null
    });
    if(q.error)throw q.error;return q.data;
  }

  function wrapCreate(){
    const current=window.v1517CreateOwnRequest;
    if(typeof current!=='function'||current.__r171LegalLeave)return false;
    const wrapped=async function(o){
      if(!Object.values(TYPES).includes(String(o?.tipo||'')))return current.apply(this,arguments);
      return createLegalRequest(o);
    };
    wrapped.__r171LegalLeave=true;wrapped.__base=current;
    window.v1517CreateOwnRequest=wrapped;try{v1517CreateOwnRequest=wrapped}catch(_){}
    return true;
  }

  async function validateMarriage(form,set){
    const box=form.querySelector('[data-r171-marriage-status]'),event=form.querySelector('[name="evento_fecha"]')?.value||'',from=form.fecha_inicio?.value||'',to=form.fecha_fin?.value||'';
    if(!box)return;
    const notice=diffDays(todayIso(),event),count=businessCount(from,to,set),parts=[];let cls='ok';
    if(event){parts.push('Anticipación registrada: '+(notice??0)+' día'+(Math.abs(notice??0)===1?'':'s')+'. La solicitud puede enviarse igualmente.')} 
    else{parts.push('Indica la fecha de celebración.');cls='warn'}
    if(from&&to){if(count===5)parts.push('✓ El rango contiene 5 días hábiles.');else{parts.push('⚠ El rango contiene '+count+' días hábiles; deben ser 5.');cls='warn'}}
    box.className='r171-status '+cls;box.textContent=parts.join(' ');
  }

  async function syncDeath(form,set){
    const panel=form.querySelector('[data-r171-death-panel]');if(!panel||panel.classList.contains('hidden'))return;
    const rel=panel.querySelector('[name="fallecimiento_relacion"]')?.value||'',event=panel.querySelector('[name="evento_fecha"]')?.value||'',rule=deathRule(rel),status=panel.querySelector('[data-r171-death-status]');
    if(!rule){
      if(status){status.className='r171-status warn';status.textContent='Selecciona el vínculo familiar para conocer la duración y desde cuándo se hace efectivo el permiso.'}
      return;
    }
    if(!event){
      if(status){
        status.className='r171-status ok';
        status.textContent='Corresponden '+rule.days+' '+rule.unit+(rule.business?'':' (continuos)')+'. '+rule.effective+' Indica la fecha para calcular el período exacto.';
      }
      return;
    }
    form.fecha_inicio.value=event;
    form.fecha_fin.value=rule.business?endByBusinessDays(event,rule.days,set):addDays(event,rule.days-1);
    if(status){
      status.className='r171-status ok';
      status.innerHTML='<b>Permiso: '+rule.days+' '+rule.unit+(rule.business?'':' (continuos)')+'.</b> '+esc(rule.effective)+'<br><span>Período calculado: <b>'+dateCL(form.fecha_inicio.value)+' al '+dateCL(form.fecha_fin.value)+'</b>.</span>';
    }
  }

  async function syncBirth(form,set){
    const panel=form.querySelector('[data-r171-birth-panel]');if(!panel||panel.classList.contains('hidden'))return;
    const event=panel.querySelector('[name="evento_fecha"]')?.value||'',mode=panel.querySelector('[name="nacimiento_modalidad"]')?.value||'continuo',status=panel.querySelector('[data-r171-birth-status]');
    if(!event){if(status)status.textContent='Indica la fecha de nacimiento o resolución de adopción.';return}
    if(mode==='continuo'){
      form.fecha_inicio.value=event;
      form.fecha_fin.value=endByBusinessDays(event,5,set);
      if(status){status.className='r171-status ok';status.textContent='✓ Modalidad continua: 5 días desde el nacimiento, excluyendo descanso semanal en el cálculo operativo.'}
    }else{
      const limit=addDays(event,30),from=form.fecha_inicio.value,to=form.fecha_fin.value,count=businessCount(from,to,set);
      let ok=from>=event&&to<=limit&&count===5;
      if(status){status.className='r171-status '+(ok?'ok':'warn');status.textContent=ok?'✓ Rango de 5 días dentro del primer mes.':'⚠ Para modalidad distribuida, selecciona 5 días dentro del primer mes desde el nacimiento.'}
    }
  }

  function injectForm(){
    const form=document.getElementById('v1522ReqForm')||document.getElementById('v1520ReqForm')||document.getElementById('v1517RequestForm')||document.getElementById('v1514RequestForm')||document.getElementById('v154RequestForm')||document.querySelector('#modalRoot form');if(!form||form.dataset.r171LegalLeave==='1')return false;
    const type=form.querySelector('select[name="tipo"]');if(!type)return false;
    form.dataset.r171LegalLeave='1';

    const addOption=(value,label,afterValue)=>{
      if(type.querySelector('option[value="'+value+'"]'))return;
      const o=document.createElement('option');o.value=value;o.textContent=label;
      const after=type.querySelector('option[value="'+afterValue+'"]');if(after)after.insertAdjacentElement('afterend',o);else type.appendChild(o);
    };
    addOption(TYPES.matrimonio,'Permiso por matrimonio / AUC','permiso');
    addOption(TYPES.fallecimiento,'Permiso por fallecimiento familiar',TYPES.matrimonio);
    addOption(TYPES.nacimiento,'Permiso por nacimiento de hijo',TYPES.fallecimiento);

    const panels=document.createElement('div');panels.className='full';panels.innerHTML=`
      <div class="r171-box hidden" data-r171-marriage-panel>
        <label>Tipo de celebración<select class="field" name="matrimonio_tipo"><option value="matrimonio">Matrimonio</option><option value="auc">Acuerdo de Unión Civil</option></select></label>
        <label>Fecha de celebración<input class="field" name="evento_fecha" type="date"></label>
        <div class="r171-legal"><b>Art. 207 bis · Código del Trabajo</b>5 días hábiles continuos de permiso pagado, adicionales al feriado anual. Puede utilizarse el día de la celebración y en los días inmediatamente anteriores o posteriores. La aplicación registra la anticipación real con que se solicita, sin impedir solicitudes de un día para otro. El certificado del Registro Civil debe presentarse dentro de los 30 días siguientes.</div>
        <div class="r171-status warn" data-r171-marriage-status>Indica fecha y período para validar el permiso.</div>
      </div>
      <div class="r171-box hidden" data-r171-death-panel>
        <label>Familiar<select class="field" name="fallecimiento_relacion"><option value="">Seleccionar</option><option value="hijo">Hijo/a · 10 días corridos</option><option value="conyuge">Cónyuge / conviviente civil · 7 días corridos</option><option value="gestacion">Hijo/a en gestación · 7 días hábiles</option><option value="padre">Padre · 4 días hábiles</option><option value="madre">Madre · 4 días hábiles</option><option value="hermano">Hermano/a · 4 días hábiles</option></select></label>
        <label>Fecha fallecimiento / acreditación<input class="field" name="evento_fecha" type="date"></label>
        <div class="r171-legal"><b>Art. 66 · Código del Trabajo</b>Permiso pagado adicional al feriado anual. Se hace efectivo desde el fallecimiento; en defunción fetal, desde su acreditación mediante el certificado correspondiente.</div>
        <div class="r171-status warn" data-r171-death-status>Selecciona el vínculo familiar para conocer la cantidad de días, si son hábiles o corridos, y desde cuándo se hace efectivo el permiso.</div>
      </div>
      <div class="r171-box hidden" data-r171-birth-panel>
        <label>Origen<select class="field" name="nacimiento_origen"><option value="nacimiento">Nacimiento de hijo/a</option><option value="adopcion">Adopción</option></select></label>
        <label>Fecha nacimiento / resolución<input class="field" name="evento_fecha" type="date"></label>
        <label class="full">Modalidad<select class="field" name="nacimiento_modalidad"><option value="continuo">Continuo desde el nacimiento</option><option value="distribuido">Distribuido dentro del primer mes</option></select></label>
        <div class="r171-legal"><b>Art. 195 · Código del Trabajo</b>El padre trabajador tiene derecho a 5 días de permiso pagado. Puede utilizarlos desde el parto en forma continua, excluyendo el descanso semanal, o distribuirlos dentro del primer mes. También aplica al padre en proceso de adopción desde la resolución correspondiente.</div>
        <div class="r171-status warn" data-r171-birth-status>Indica fecha y modalidad.</div>
      </div>`;
    type.closest('label')?.insertAdjacentElement('afterend',panels);

    const comment=form.querySelector('[name="comentario"]'),originalPlaceholder=comment?.placeholder||'',originalRequired=!!comment?.required,baseSync=type.onchange;
    const dateLabels=[...form.querySelectorAll('[data-v1517-date],[data-date]')];
    const setRequired=(panel,on)=>panel.querySelectorAll('select,input').forEach(el=>el.required=on);

    const sync=async()=>{
      if(typeof baseSync==='function')baseSync.call(type);
      const t=type.value,m=panels.querySelector('[data-r171-marriage-panel]'),d=panels.querySelector('[data-r171-death-panel]'),b=panels.querySelector('[data-r171-birth-panel]');
      const legal=Object.values(TYPES).includes(t);
      m.classList.toggle('hidden',t!==TYPES.matrimonio);d.classList.toggle('hidden',t!==TYPES.fallecimiento);b.classList.toggle('hidden',t!==TYPES.nacimiento);
      setRequired(m,t===TYPES.matrimonio);setRequired(d,t===TYPES.fallecimiento);setRequired(b,t===TYPES.nacimiento);
      dateLabels.forEach(x=>x.classList.remove('hidden'));
      [form.fecha_inicio,form.fecha_fin].forEach(x=>x.required=t!=='otro');
      if(comment){comment.required=legal?false:originalRequired;comment.placeholder=legal?'Comentario adicional (opcional)':originalPlaceholder}
      const set=await holidays();
      if(t===TYPES.matrimonio)validateMarriage(form,set);
      if(t===TYPES.fallecimiento)syncDeath(form,set);
      if(t===TYPES.nacimiento)syncBirth(form,set);
    };
    type.onchange=sync;
    panels.querySelectorAll('input,select').forEach(el=>el.addEventListener('change',sync));
    [form.fecha_inicio,form.fecha_fin].filter(Boolean).forEach(el=>el.addEventListener('change',sync));

    form.addEventListener('submit',async event=>{
      const t=type.value;if(!Object.values(TYPES).includes(t))return;
      event.preventDefault();event.stopImmediatePropagation();
      if(window.state?.v15PreviewRole||window.state?.v15PreviewUser)return window.toast?.('Modo simulación: inicia sesión con el usuario real para guardar.','warn');
      const set=await holidays();
      if(t===TYPES.matrimonio&&businessCount(form.fecha_inicio.value,form.fecha_fin.value,set)!==5){
        return window.toast?.('El permiso por matrimonio/AUC debe comprender 5 días hábiles.','error');
      }
      if(t===TYPES.nacimiento&&panels.querySelector('[name="nacimiento_modalidad"]')?.value==='distribuido'){
        const ev=panels.querySelector('[data-r171-birth-panel] [name="evento_fecha"]')?.value||'',limit=iso(ev)?addDays(ev,30):'';
        if(!ev||form.fecha_inicio.value<ev||form.fecha_fin.value>limit||businessCount(form.fecha_inicio.value,form.fecha_fin.value,set)!==5){
          return window.toast?.('El permiso distribuido por nacimiento debe considerar 5 días dentro del primer mes.','error');
        }
      }
      const o=Object.fromEntries(new FormData(form));
      const activePanel=t===TYPES.matrimonio?panels.querySelector('[data-r171-marriage-panel]'):t===TYPES.fallecimiento?panels.querySelector('[data-r171-death-panel]'):panels.querySelector('[data-r171-birth-panel]');
      o.evento_fecha=activePanel?.querySelector('[name="evento_fecha"]')?.value||'';
      if(t===TYPES.matrimonio)o.matrimonio_tipo=activePanel?.querySelector('[name="matrimonio_tipo"]')?.value||'matrimonio';
      if(t===TYPES.fallecimiento)o.fallecimiento_relacion=activePanel?.querySelector('[name="fallecimiento_relacion"]')?.value||'';
      if(t===TYPES.nacimiento){
        o.nacimiento_origen=activePanel?.querySelector('[name="nacimiento_origen"]')?.value||'nacimiento';
        o.nacimiento_modalidad=activePanel?.querySelector('[name="nacimiento_modalidad"]')?.value||'continuo';
      }
      if(!iso(o.evento_fecha))return window.toast?.('Debes indicar la fecha del hecho que origina el permiso.','error');
      const submit=form.querySelector('[type="submit"],button.btn.primary');
      const oldText=submit?.textContent||'Enviar solicitud';if(submit){submit.disabled=true;submit.textContent='Enviando…'}
      try{
        const data=await createLegalRequest(o);
        try{await window.v15Notify?.('Nueva solicitud',`${window.state?.profile?.nombre||window.state?.session?.user?.email||'Trabajador'} · ${window.v152RequestLabel?.(t)||t}`,'importante',data?.aprobador_user_id||null,'solicitudes',data?.id||null)}catch(error){console.warn('[Stainher R172] notificación',error)}
        try{await window.v1517SendRequestApprovalEmail?.(data?.id)}catch(error){console.warn('[Stainher R172] correo aprobador',error)}
        window.closeModal?.();
        await window.renderSolicitudesV15?.();
        await window.v15LoadNotifications?.();
        window.toast?.('Solicitud enviada al aprobador.','success');
      }catch(error){
        window.toast?.('No se pudo guardar la solicitud: '+(error?.message||String(error)),'error');
        if(submit&&document.body.contains(submit)){submit.disabled=false;submit.textContent=oldText}
      }
    },true);

    sync();return true;
  }

  function wrapModal(){
    const current=window.v154RequestModal;if(typeof current!=='function'||current.__r171LegalLeave)return false;
    const wrapped=function(){const out=current.apply(this,arguments);queueMicrotask(injectForm);requestAnimationFrame(injectForm);return out};
    wrapped.__r171LegalLeave=true;wrapped.__base=current;
    window.v154RequestModal=wrapped;window.v152RequestModal=wrapped;window.v15VacationModal=wrapped;
    try{v154RequestModal=wrapped;v152RequestModal=wrapped;v15VacationModal=wrapped}catch(_){}
    return true;
  }

  function wrapActions(){
    const current=window.v1517RequestActions;if(typeof current!=='function'||current.__r171LegalLeave)return false;
    const wrapped=function(x){
      let html=current.apply(this,arguments)||'';
      const cert=String(x?.permiso_legal_certificado_estado||'');
      if(['administrador','recursos_humanos'].includes(role())&&cert==='pendiente'){
        html+='<button class="btn" type="button" onclick="v171MarkLegalCertificate(\''+String(x.id)+'\')">Certificado recibido</button>';
      }
      return html;
    };
    wrapped.__r171LegalLeave=true;wrapped.__base=current;window.v1517RequestActions=wrapped;try{v1517RequestActions=wrapped}catch(_){}
    return true;
  }

  function decorateCards(){
    const rows=window.state?.v154Requests||[],cards=[...document.querySelectorAll('#page-solicitudes .v152-request-card')];
    cards.forEach((card,index)=>{
      const row=rows[index],type=String(row?.tipo||'');if(!Object.values(TYPES).includes(type))return;
      if(card.querySelector('[data-r171-card]'))return;
      const box=document.createElement('div');box.className='wide';box.dataset.r171Card='1';
      const cert=String(row.permiso_legal_certificado_estado||'no_aplica');
      const certHtml=cert==='pendiente'?'<div class="r171-cert pending"><b>Certificado pendiente</b> · Debe ser presentado según la regla del permiso.</div>':cert==='recibido'?'<div class="r171-cert received"><b>Certificado recibido</b> · '+esc(row.permiso_legal_certificado_recibido_at?new Date(row.permiso_legal_certificado_recibido_at).toLocaleString('es-CL'):'Registrado')+'</div>':'';
      box.innerHTML='<small>Permiso legal</small><b>'+esc(window.v152RequestLabel?.(type)||type)+'</b><div class="muted" style="margin-top:3px">'+esc(row.permiso_legal_evento||'')+' · '+esc(row.permiso_legal_dias||'')+' '+esc(row.permiso_legal_unidad||'')+'</div>'+certHtml;
      const actions=card.querySelector('.v154-request-actions');if(actions)actions.insertAdjacentElement('beforebegin',box);else card.appendChild(box);
    });
  }
  function wrapRender(){
    const current=window.renderSolicitudesV15;if(typeof current!=='function'||current.__r171LegalLeave)return false;
    const wrapped=async function(){const out=await current.apply(this,arguments);decorateCards();requestAnimationFrame(decorateCards);return out};
    wrapped.__r171LegalLeave=true;wrapped.__base=current;window.renderSolicitudesV15=wrapped;try{renderSolicitudesV15=wrapped}catch(_){}
    return true;
  }

  window.v171MarkLegalCertificate=async function(id){
    if(!['administrador','recursos_humanos'].includes(role()))return window.toast?.('Solo Administración o RR.HH. puede registrar el certificado.','error');
    if(!window.confirm?.('¿Confirmas que el certificado correspondiente fue recibido?'))return;
    const q=await window.sb.rpc('marcar_certificado_permiso_legal_r171',{p_id:String(id)});
    if(q.error)return window.toast?.(q.error.message||String(q.error),'error');
    await window.renderSolicitudesV15?.();window.toast?.('Certificado registrado como recibido.','success');
  };

  function install(){
    mountStyle();wrapLabel();wrapCreate();wrapModal();wrapActions();wrapRender();injectForm();decorateCards();
    const root=document.getElementById('modalRoot');
    if(root&&!root.__r172LegalObserver){
      const observer=new MutationObserver(()=>queueMicrotask(injectForm));
      observer.observe(root,{childList:true,subtree:true});root.__r172LegalObserver=observer;
    }
    if(timer)return;let tries=0;timer=setInterval(()=>{tries++;wrapLabel();wrapCreate();wrapModal();wrapActions();wrapRender();injectForm();if(tries>=100){clearInterval(timer);timer=null}},150);
    window.addEventListener('stainher:modules-ready',()=>{wrapLabel();wrapCreate();wrapModal();wrapActions();wrapRender();injectForm();decorateCards()});
    window.addEventListener('stainher:request-approver-r135-ready',()=>{wrapLabel();wrapCreate();wrapModal();wrapActions();wrapRender();injectForm()});
    window.addEventListener('stainher:approved-reroute-r138-ready',()=>{wrapLabel();wrapCreate();wrapModal();wrapActions();wrapRender();injectForm()});
  }
  window.StainherMarriageLeaveR171=Object.freeze({install,injectForm,legalComment,deathRule,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();