/* Stainher V15.24 · R171 · Solicitudes: permiso por matrimonio / AUC. */
(()=>{
  'use strict';
  const BUILD='20261021-r171-permiso-matrimonio';
  const TYPE='permiso_matrimonio';
  if(window.__STAINHER_MARRIAGE_LEAVE_R171__===BUILD)return;
  window.__STAINHER_MARRIAGE_LEAVE_R171__=BUILD;
  let timer=null;

  const dateCL=v=>{const m=String(v||'').match(/^(\\d{4})-(\\d{2})-(\\d{2})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:String(v||'')};
  const isoDate=v=>/^\\d{4}-\\d{2}-\\d{2}$/.test(String(v||''));
  const todayIso=()=>{const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')};
  const dayDiff=(a,b)=>{if(!isoDate(a)||!isoDate(b))return null;return Math.round((new Date(b+'T12:00:00')-new Date(a+'T12:00:00'))/86400000)};
  function weekdaysMonFri(from,to){
    if(!isoDate(from)||!isoDate(to)||from>to)return 0;
    let d=new Date(from+'T12:00:00'),end=new Date(to+'T12:00:00'),n=0;
    while(d<=end){const w=d.getDay();if(w!==0&&w!==6)n++;d.setDate(d.getDate()+1)}
    return n;
  }
  function mountStyle(){
    if(document.getElementById('stainher-marriage-leave-r171-style'))return;
    const s=document.createElement('style');s.id='stainher-marriage-leave-r171-style';
    s.textContent='#modalRoot .r171-marriage-box{display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px;border:1px solid var(--line,#2b3645);border-radius:10px;background:var(--panel2,#16212d)}#modalRoot .r171-marriage-box.hidden{display:none!important}#modalRoot .r171-marriage-box .full{grid-column:1/-1}#modalRoot .r171-legal{grid-column:1/-1;border-left:3px solid #20c997;padding:9px 10px;background:rgba(32,201,151,.08);font-size:11px;line-height:1.45}#modalRoot .r171-legal b{display:block;margin-bottom:4px}#modalRoot .r171-marriage-status{grid-column:1/-1;font-size:11px;line-height:1.45}#modalRoot .r171-marriage-status.ok{color:#34d399}#modalRoot .r171-marriage-status.warn{color:#fbbf24}@media(max-width:680px){#modalRoot .r171-marriage-box{grid-template-columns:1fr}}';
    document.head.appendChild(s);
  }
  function wrapLabel(){
    const current=window.v152RequestLabel;
    if(typeof current!=='function'||current.__r171MarriageLeave)return false;
    const wrapped=function(type){return String(type||'')===TYPE?'Permiso por matrimonio / AUC':current.apply(this,arguments)};
    wrapped.__r171MarriageLeave=true;wrapped.__base=current;window.v152RequestLabel=wrapped;
    try{v152RequestLabel=wrapped}catch(_){}
    return true;
  }
  function legalComment(o){
    const kind=String(o.matrimonio_tipo||'')==='auc'?'Acuerdo de Unión Civil':'Matrimonio';
    const notice=dayDiff(todayIso(),o.matrimonio_fecha);
    const noticeText=notice==null?'No determinado':String(notice)+' días de anticipación'+(notice>=30?' · cumple aviso legal de 30 días':' · aviso inferior a 30 días');
    const base=[
      'PERMISO LEGAL POR MATRIMONIO / ACUERDO DE UNIÓN CIVIL',
      'Art. 207 bis del Código del Trabajo, texto sustituido por Ley N° 21.042.',
      'Celebración: '+kind,
      'Fecha de celebración: '+dateCL(o.matrimonio_fecha),
      'Período solicitado: '+dateCL(o.fecha_inicio)+' al '+dateCL(o.fecha_fin),
      'Beneficio: 5 días hábiles continuos de permiso pagado, adicionales al feriado anual.',
      'Aviso previo registrado en Stainher App: '+noticeText+'.',
      'Certificado: debe presentarse al empleador dentro de los 30 días siguientes a la celebración.'
    ];
    const extra=String(o.comentario||'').trim();if(extra)base.push('Comentario del trabajador: '+extra);
    return base.join('\\n');
  }
  function wrapCreate(){
    const current=window.v1517CreateOwnRequest;
    if(typeof current!=='function'||current.__r171MarriageLeave)return false;
    const wrapped=async function(o){
      if(String(o?.tipo||'')!==TYPE)return current.apply(this,arguments);
      if(!isoDate(o.matrimonio_fecha))throw new Error('Debes indicar la fecha del matrimonio o Acuerdo de Unión Civil.');
      if(!['matrimonio','auc'].includes(String(o.matrimonio_tipo||'')))throw new Error('Selecciona Matrimonio o Acuerdo de Unión Civil.');
      if(!isoDate(o.fecha_inicio)||!isoDate(o.fecha_fin)||o.fecha_inicio>o.fecha_fin)throw new Error('El período solicitado no es válido.');
      const payload={...o,comentario:legalComment(o)};delete payload.matrimonio_tipo;delete payload.matrimonio_fecha;
      return current.call(this,payload);
    };
    wrapped.__r171MarriageLeave=true;wrapped.__base=current;window.v1517CreateOwnRequest=wrapped;
    try{v1517CreateOwnRequest=wrapped}catch(_){}
    return true;
  }
  function statusText(form){
    const box=form.querySelector('[data-r171-status]');if(!box)return;
    const celebration=form.querySelector('[name="matrimonio_fecha"]')?.value||'',from=form.fecha_inicio?.value||'',to=form.fecha_fin?.value||'';
    const notice=dayDiff(todayIso(),celebration),count=weekdaysMonFri(from,to),parts=[];let cls='ok';
    if(celebration){if(notice>=30)parts.push('✓ Aviso registrado con '+notice+' días de anticipación.');else{parts.push('⚠ Aviso registrado con '+(notice??0)+' días de anticipación; la norma exige 30 días.');cls='warn'}}else{parts.push('Indica la fecha de celebración para revisar el aviso de 30 días.');cls='warn'}
    if(from&&to){if(count===5)parts.push('✓ El rango contiene 5 días lunes-viernes.');else{parts.push('⚠ El rango contiene '+count+' días lunes-viernes. Debe corresponder a 5 días hábiles continuos.');cls='warn'}parts.push('Los festivos también son inhábiles y deben considerarse al definir el período.')}
    box.className='r171-marriage-status '+cls;box.textContent=parts.join(' ');
  }
  function injectForm(){
    const form=document.getElementById('v1517RequestForm');if(!form||form.dataset.r171MarriageLeave==='1')return false;
    const type=form.querySelector('select[name="tipo"]');if(!type)return false;form.dataset.r171MarriageLeave='1';
    if(!type.querySelector('option[value="'+TYPE+'"]')){const option=document.createElement('option');option.value=TYPE;option.textContent='Permiso por matrimonio / AUC';const permiso=type.querySelector('option[value="permiso"]');if(permiso)permiso.insertAdjacentElement('afterend',option);else type.appendChild(option)}
    const panel=document.createElement('div');panel.className='full r171-marriage-box hidden';panel.dataset.r171MarriagePanel='1';
    panel.innerHTML='<label>Tipo de celebración<select class="field" name="matrimonio_tipo"><option value="matrimonio">Matrimonio</option><option value="auc">Acuerdo de Unión Civil</option></select></label><label>Fecha de celebración<input class="field" name="matrimonio_fecha" type="date"></label><div class="r171-legal"><b>Permiso legal · Art. 207 bis del Código del Trabajo</b>Corresponde a 5 días hábiles continuos de permiso pagado, adicionales al feriado anual, independientemente del tiempo de servicio. Puede utilizarse el día de la celebración y en los días inmediatamente anteriores o posteriores. El aviso al empleador debe realizarse con 30 días de anticipación y el certificado del Registro Civil debe presentarse dentro de los 30 días siguientes.</div><div class="r171-marriage-status warn" data-r171-status>Indica la fecha de celebración y el período solicitado.</div>';
    type.closest('label')?.insertAdjacentElement('afterend',panel);
    const comment=form.querySelector('[name="comentario"]'),commentLabel=comment?.closest('label'),originalPlaceholder=comment?.getAttribute('placeholder')||'',originalRequired=!!comment?.required,baseSync=type.onchange;
    const sync=()=>{if(typeof baseSync==='function')baseSync.call(type);const marriage=type.value===TYPE;panel.classList.toggle('hidden',!marriage);panel.querySelectorAll('select,input').forEach(el=>el.required=marriage);if(comment){comment.required=marriage?false:originalRequired;comment.placeholder=marriage?'Comentario adicional (opcional)':originalPlaceholder}if(marriage)statusText(form)};
    type.onchange=sync;panel.querySelectorAll('input,select').forEach(el=>el.addEventListener('change',()=>statusText(form)));[form.fecha_inicio,form.fecha_fin].filter(Boolean).forEach(el=>el.addEventListener('change',()=>{if(type.value===TYPE)statusText(form)}));sync();return true;
  }
  function wrapModal(){
    const current=window.v154RequestModal;if(typeof current!=='function'||current.__r171MarriageLeave)return false;
    const wrapped=function(){const out=current.apply(this,arguments);queueMicrotask(injectForm);requestAnimationFrame(injectForm);return out};
    wrapped.__r171MarriageLeave=true;wrapped.__base=current;window.v154RequestModal=wrapped;window.v152RequestModal=wrapped;window.v15VacationModal=wrapped;
    try{v154RequestModal=wrapped;v152RequestModal=wrapped;v15VacationModal=wrapped}catch(_){}
    return true;
  }
  function install(){
    mountStyle();wrapLabel();wrapCreate();wrapModal();injectForm();
    if(timer)return;let tries=0;timer=setInterval(()=>{tries++;wrapLabel();wrapCreate();wrapModal();injectForm();if(tries>=80){clearInterval(timer);timer=null}},150);
    window.addEventListener('stainher:modules-ready',()=>{wrapLabel();wrapCreate();wrapModal();injectForm()});
    window.addEventListener('stainher:request-approver-r135-ready',()=>{wrapLabel();wrapCreate();wrapModal();injectForm()});
    window.addEventListener('stainher:approved-reroute-r138-ready',()=>{wrapLabel();wrapCreate();wrapModal();injectForm()});
  }
  window.StainherMarriageLeaveR171=Object.freeze({install,injectForm,legalComment,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();