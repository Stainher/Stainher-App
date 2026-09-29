/* Stainher V15.24 · R138 · Reasignación de solicitudes aprobadas a Cristian Lagos.
 * - Administrador puede reasignar solicitudes aprobadas de cualquier solicitante.
 * - Justificativos y vacaciones finalizadas por RR.HH. quedan excluidos.
 * - La solicitud vuelve a Pendiente de aprobación y se notifica a Cristian Lagos.
 * - El backend conserva trazabilidad del aprobador anterior en auditoria_v15.
 */
(()=>{
  'use strict';
  const BUILD='20260929-r138-approved-request-reroute';
  if(window.__STAINHER_APPROVED_REROUTE_R138__===BUILD)return;
  window.__STAINHER_APPROVED_REROUTE_R138__=BUILD;

  const CRISTIAN_EMAIL='clagos@stainher.cl';
  let installTimer=null;

  function role(){
    try{return String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase()}catch(_){return ''}
  }
  function targetId(){
    return String(window.state?.v135CristianLagosId||'');
  }
  function isFinalVacation(x){
    return String(x?.tipo||'')==='vacaciones'&&(
      String(x?.etapa||'')==='finalizada'||
      Boolean(x?.finalizada_at)||
      Boolean(x?.firmado_rrhh_at)
    );
  }
  function canReassignApproved(x){
    if(role()!=='administrador')return false;
    if(String(x?.estado||'')!=='aprobada')return false;
    if(String(x?.tipo||'')==='justificativo')return false;
    if(isFinalVacation(x))return false;
    const cristian=targetId();
    if(cristian&&String(x?.aprobador_user_id||'')===cristian)return false;
    return true;
  }

  async function resolveCristian(){
    if(targetId())return targetId();
    try{
      const list=await window.StainherRequestApproverR135?.loadApprovers?.({force:true});
      const hit=(list||[]).find(x=>String(x?.email||'').toLowerCase()===CRISTIAN_EMAIL);
      return String(hit?.id||window.state?.v135CristianLagosId||'');
    }catch(_){
      return '';
    }
  }

  function wrapActions(){
    const current=window.v1517RequestActions;
    if(typeof current!=='function'||current.__r138)return false;

    const wrapped=function(x){
      let html=current.apply(this,arguments)||'';
      if(String(x?.estado||'')==='aprobada'){
        const legacy='<button class="btn" type="button" onclick="v135RerouteRequest(\''+String(x.id)+'\')">Reenviar a Cristian Lagos</button>';
        html=html.replace(legacy,'');
      }
      if(canReassignApproved(x)&&!html.includes("v138ReassignApprovedRequest('"+String(x.id)+"')")){
        html+='<button class="btn" type="button" onclick="v138ReassignApprovedRequest(\''+String(x.id)+'\')">Reasignar a Cristian Lagos</button>';
      }
      return html;
    };
    wrapped.__r138=true;
    wrapped.__base=current;
    window.v1517RequestActions=wrapped;
    try{v1517RequestActions=wrapped}catch(_){}
    return true;
  }

  window.v138ReassignApprovedRequest=async function(id){
    const row=(window.state?.v154Requests||[]).find(x=>String(x.id)===String(id));
    if(!row)return window.toast?.('Solicitud no encontrada.','error');
    if(!canReassignApproved(row))return window.toast?.('Esta solicitud no se puede reasignar desde este control.','error');

    const cristian=await resolveCristian();
    if(!cristian)return window.toast?.('Cristian Lagos no está disponible como aprobador activo.','error');

    const person=String(row.solicitante_nombre||row.persona_nombre||row.nombre_solicitante||'esta persona');
    const ok=window.confirm?.(
      'La solicitud aprobada de '+person+' volverá a estado Pendiente de aprobación y será reasignada a Cristian Lagos. ¿Continuar?'
    );
    if(!ok)return;

    try{
      const q=await window.sb.rpc('reasignar_solicitud_aprobada_cristian_r138',{p_id:String(id)});
      if(q.error)throw q.error;

      let mailError=null;
      try{
        await window.v1517SendRequestApprovalEmail?.(id);
      }catch(error){
        mailError=error;
        console.warn('[Stainher R138] correo de reasignación',error);
      }

      await window.renderSolicitudesV15?.();
      await window.v15LoadNotifications?.();

      window.toast?.(
        mailError
          ?'Solicitud reasignada a Cristian Lagos. La notificación interna quedó activa, pero el correo no pudo entregarse.'
          :'Solicitud reasignada a Cristian Lagos y notificada por correo.',
        mailError?'warn':'success'
      );
    }catch(error){
      window.toast?.('No se pudo reasignar la solicitud: '+(error.message||String(error)),'error');
    }
  };

  function install(){
    wrapActions();
    if(installTimer)return;

    let tries=0;
    installTimer=setInterval(()=>{
      tries++;
      wrapActions();
      if(tries>=80){
        clearInterval(installTimer);
        installTimer=null;
      }
    },150);

    window.addEventListener('stainher:modules-ready',wrapActions);
    window.addEventListener('stainher:request-approver-r135-ready',wrapActions);
    window.addEventListener('stainher:runtime-r138-ready',wrapActions);
  }

  window.StainherApprovedRerouteR138=Object.freeze({install,canReassignApproved,resolveCristian});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
