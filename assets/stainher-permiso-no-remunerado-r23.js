(function installPermisoNoRemuneradoR23(){
  'use strict';
  if(window.__STAINHER_PERMISO_NO_REMUNERADO_R23__)return;
  window.__STAINHER_PERMISO_NO_REMUNERADO_R23__=true;
  const BUILD='20260909-r23-permiso-no-remunerado';
  const baseLabel=window.v152RequestLabel;
  window.v152RequestLabel=function(type){return String(type||'')==='permiso'?'Permiso no remunerado':baseLabel?.(type)||String(type||'Solicitud')};
  const baseStatus=window.v1517RequestStatus;
  window.v1517RequestStatus=function(request){if(String(request?.estado||'')==='cancelada')return ['bad','Cancelada por el solicitante'];return baseStatus?.(request)||['warn',request?.estado||'Pendiente']};
  function updateFormLabel(){const option=document.querySelector('#modalRoot form select[name="tipo"] option[value="permiso"]');if(option&&option.textContent!=='Permiso no remunerado')option.textContent='Permiso no remunerado'}
  const baseModal=window.v154RequestModal;
  if(typeof baseModal==='function'){
    const wrapped=async function(...args){const result=await baseModal.apply(this,args);updateFormLabel();return result};wrapped.__unpaidLeave=BUILD;
    window.v154RequestModal=wrapped;window.v152RequestModal=wrapped;window.v15VacationModal=wrapped;
  }
  const modalRoot=document.getElementById('modalRoot');if(modalRoot)new MutationObserver(updateFormLabel).observe(modalRoot,{childList:true,subtree:true});
  window.STAINHER_UNPAID_LEAVE={build:BUILD,ready:true};
})();

/* Vacaciones r30 · garantiza copia del formulario al solicitante.
 * Se aplica a cualquier envío del módulo vacaciones con referencia de solicitud,
 * sin alterar el destinatario principal ni las copias ya configuradas.
 */
(function installVacationRequesterEmailCopyR30(){
  'use strict';
  if(window.__STAINHER_VACATION_REQUESTER_EMAIL_COPY_R30__)return;
  window.__STAINHER_VACATION_REQUESTER_EMAIL_COPY_R30__=true;
  const BUILD='20260909-r30-vacation-requester-copy';
  const emailOf=value=>String(value?.email??value??'').trim().toLowerCase();
  const emailsOf=value=>(Array.isArray(value)?value:(value?[value]:[])).map(emailOf).filter(Boolean);
  async function requester(referenceId){
    const client=window.sb;
    if(!client||!referenceId)return null;
    const request=await client.from('solicitudes_v15').select('solicitante_user_id,tipo').eq('id',String(referenceId)).maybeSingle();
    if(request.error||!request.data||String(request.data.tipo||'')!=='vacaciones'||!request.data.solicitante_user_id)return null;
    const profile=await client.from('perfiles').select('email,nombre').eq('id',request.data.solicitante_user_id).maybeSingle();
    if(profile.error||!profile.data?.email)return null;
    return {email:String(profile.data.email).trim(),name:String(profile.data.nombre||'').trim()};
  }
  function install(){
    const current=window.v1518SendEmail;
    if(typeof current!=='function'||current.__vacationRequesterCopyR30)return false;
    const wrapped=async function(payload){
      const next={...(payload||{})};
      const moduleName=String(next.modulo??next.module??'').trim().toLowerCase();
      const referenceId=next.referencia_id??next.referenceId;
      if(moduleName==='vacaciones'&&referenceId&&!next.testMode){
        try{
          const copy=await requester(referenceId);
          if(copy?.email){
            const target=copy.email.toLowerCase();
            const existing=new Set([...emailsOf(next.to),...emailsOf(next.cc)]);
            if(!existing.has(target))next.cc=[...(Array.isArray(next.cc)?next.cc:(next.cc?[next.cc]:[])),copy];
          }
        }catch(error){console.warn('[Vacaciones r30] No se pudo resolver copia al solicitante',error)}
      }
      return current.call(this,next);
    };
    wrapped.__vacationRequesterCopyR30=BUILD;
    wrapped.__base=current;
    window.v1518SendEmail=wrapped;
    window.STAINHER_VACATION_REQUESTER_EMAIL_COPY={build:BUILD,ready:true};
    return true;
  }
  if(!install()){
    let tries=0;
    const timer=setInterval(()=>{if(install()||++tries>80)clearInterval(timer)},125);
  }
})();
