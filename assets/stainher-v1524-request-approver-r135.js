/* Stainher V15.24 · R135 · Aprobador seleccionable para solicitudes del Administrador.
 * - Cristian Lagos es el aprobador predeterminado.
 * - Administrador puede seleccionar otro Gerente habilitado.
 * - Permite reenviar solicitudes propias pendientes/aprobadas a Cristian Lagos.
 * - El correo al autorizador reutiliza R134.
 */
(()=>{
  'use strict';
  const BUILD='20260928-r135-request-approver-routing';
  if(window.__STAINHER_REQUEST_APPROVER_R135__===BUILD)return;
  window.__STAINHER_REQUEST_APPROVER_R135__=BUILD;

  const CRISTIAN_EMAIL='clagos@stainher.cl';
  let approversPromise=null;
  let installTimer=null;

  const norm=v=>String(v??'')
    .normalize('NFD').replace(/[\u0300-\u036f]/g,'')
    .toLowerCase().replace(/\s+/g,' ').trim();

  function role(){
    try{return String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase()}catch(_){return ''}
  }
  function uid(){return String(window.state?.session?.user?.id||'')}

  async function loadApprovers({force=false}={}){
    if(approversPromise&&!force)return approversPromise;
    approversPromise=(async()=>{
      const sb=window.sb;
      if(!sb)throw new Error('Supabase no está disponible.');
      const types=await sb.from('tipos_perfil_v1517').select('codigo').eq('aprueba_administrador',true);
      if(types.error)throw types.error;
      const roles=(types.data||[]).map(x=>x.codigo).filter(Boolean);
      if(!roles.length)throw new Error('No hay perfiles configurados para aprobar solicitudes del Administrador.');
      const q=await sb.from('perfiles')
        .select('id,nombre,email,rol,activo')
        .eq('activo',true)
        .in('rol',roles)
        .neq('id',uid())
        .order('nombre',{ascending:true});
      if(q.error)throw q.error;
      const list=(q.data||[]).map(x=>({...x,email:String(x.email||'').toLowerCase()}));
      window.state=window.state||{};
      window.state.v135RequestApprovers=list;
      const cristian=list.find(x=>x.email===CRISTIAN_EMAIL||norm(x.nombre)==='cristian lagos')||null;
      window.state.v135CristianLagosId=cristian?.id||null;
      return list;
    })().finally(()=>{approversPromise=null});
    return approversPromise;
  }

  function approverOptionLabel(x){
    const roleLabel=String(x?.rol||'').toLowerCase()==='gerente'?'Gerente':String(x?.rol||'');
    return [x?.nombre,roleLabel].filter(Boolean).join(' · ');
  }

  async function injectApproverSelector(){
    if(role()!=='administrador')return false;
    const form=document.getElementById('v1517RequestForm');
    if(!form||form.querySelector('[data-r135-approver]'))return false;

    const label=document.createElement('label');
    label.className='full';
    label.dataset.r135Approver='1';
    label.innerHTML='<span>Aprobador</span><select class="field" name="aprobador_user_id" required><option value="">Cargando aprobadores…</option></select><small class="muted">Por defecto tus solicitudes se envían a Cristian Lagos. Puedes seleccionar otro aprobador habilitado antes de enviar.</small>';

    const typeLabel=form.tipo?.closest('label');
    if(typeLabel)typeLabel.insertAdjacentElement('afterend',label);
    else form.prepend(label);

    const select=label.querySelector('select');
    const submit=form.querySelector('[type="submit"]');
    const previousDisabled=!!submit?.disabled;
    if(submit)submit.disabled=true;

    try{
      const list=await loadApprovers({force:true});
      select.innerHTML=list.map(x=>'<option value="'+String(x.id)+'">'+String(approverOptionLabel(x)).replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]))+'</option>').join('');
      const preferred=list.find(x=>x.email===CRISTIAN_EMAIL||norm(x.nombre)==='cristian lagos');
      if(preferred)select.value=preferred.id;
      else if(list[0])select.value=list[0].id;
      if(!list.length){
        select.innerHTML='<option value="">Sin aprobadores disponibles</option>';
        window.toast?.('No existe un aprobador habilitado para las solicitudes del Administrador.','error');
      }
    }catch(error){
      select.innerHTML='<option value="">No fue posible cargar aprobadores</option>';
      window.toast?.('No se pudieron cargar los aprobadores: '+(error.message||String(error)),'error');
    }finally{
      if(submit)submit.disabled=previousDisabled||!select.value;
      select.addEventListener('change',()=>{if(submit)submit.disabled=!select.value});
    }
    return true;
  }

  function wrapCreate(){
    const current=window.v1517CreateOwnRequest;
    if(typeof current!=='function'||current.__r135)return false;
    const wrapped=async function(o){
      const q=await window.sb.rpc('crear_solicitud_propia_v135',{
        p_tipo:o.tipo,
        p_fecha_inicio:o.fecha_inicio||null,
        p_fecha_fin:o.fecha_fin||null,
        p_comentario:o.comentario||null,
        p_firma_solicitante:o.firma_solicitante||null,
        p_aprobador_user_id:role()==='administrador'?(o.aprobador_user_id||null):null
      });
      if(q.error)throw q.error;
      return q.data;
    };
    wrapped.__r135=true;
    wrapped.__base=current;
    window.v1517CreateOwnRequest=wrapped;
    try{v1517CreateOwnRequest=wrapped}catch(_){}
    return true;
  }

  function wrapModal(){
    const current=window.v154RequestModal;
    if(typeof current!=='function'||current.__r135)return false;
    const wrapped=function(){
      const out=current.apply(this,arguments);
      if(role()==='administrador')queueMicrotask(()=>injectApproverSelector());
      return out;
    };
    wrapped.__r135=true;
    wrapped.__base=current;
    window.v154RequestModal=wrapped;
    window.v152RequestModal=wrapped;
    window.v15VacationModal=wrapped;
    try{
      v154RequestModal=wrapped;
      v152RequestModal=wrapped;
      v15VacationModal=wrapped;
    }catch(_){}
    return true;
  }

  function canReroute(x){
    if(role()!=='administrador')return false;
    if(String(x?.solicitante_user_id||'')!==uid())return false;
    if(String(x?.tipo||'')==='justificativo')return false;
    const status=String(x?.estado||'');
    if(!['pendiente','pendiente_rrhh','aprobada'].includes(status))return false;
    if(String(x?.tipo||'')==='vacaciones'&&status==='aprobada'&&String(x?.etapa||'')==='finalizada')return false;
    const cristian=String(window.state?.v135CristianLagosId||'');
    if(!cristian)return status==='aprobada';
    return String(x?.aprobador_user_id||'')!==cristian||status==='aprobada';
  }

  function wrapActions(){
    const current=window.v1517RequestActions;
    if(typeof current!=='function'||current.__r135)return false;
    const wrapped=function(x){
      let html=current.apply(this,arguments)||'';
      if(canReroute(x)){
        const label=String(x?.estado||'')==='aprobada'?'Reenviar a Cristian Lagos':'Enviar a Cristian Lagos';
        html+='<button class="btn" type="button" onclick="v135RerouteRequest(\''+String(x.id)+'\')">'+label+'</button>';
      }
      return html;
    };
    wrapped.__r135=true;
    wrapped.__base=current;
    window.v1517RequestActions=wrapped;
    try{v1517RequestActions=wrapped}catch(_){}
    return true;
  }

  window.v135RerouteRequest=async function(id){
    const row=(window.state?.v154Requests||[]).find(x=>String(x.id)===String(id));
    if(!row)return window.toast?.('Solicitud no encontrada.','error');
    if(role()!=='administrador')return window.toast?.('Solo Administrador puede reenviar esta solicitud.','error');

    let target=window.state?.v135CristianLagosId||null;
    if(!target){
      try{
        const list=await loadApprovers({force:true});
        target=list.find(x=>x.email===CRISTIAN_EMAIL||norm(x.nombre)==='cristian lagos')?.id||null;
      }catch(_){}
    }
    if(!target)return window.toast?.('Cristian Lagos no está disponible como aprobador activo.','error');

    const approved=String(row.estado)==='aprobada';
    const message=approved
      ?'La solicitud se reabrirá como Pendiente de aprobación y será enviada a Cristian Lagos. ¿Continuar?'
      :'La solicitud será reasignada y notificada a Cristian Lagos. ¿Continuar?';
    if(!window.confirm(message))return;

    try{
      const q=await window.sb.rpc('reenviar_solicitud_aprobador_v135',{
        p_id:String(id),
        p_aprobador_user_id:target
      });
      if(q.error)throw q.error;

      let mailError=null;
      try{await window.v1517SendRequestApprovalEmail?.(id)}
      catch(error){mailError=error;console.warn('correo reenvío solicitud',error)}

      await window.renderSolicitudesV15?.();
      await window.v15LoadNotifications?.();
      window.toast?.(
        mailError
          ?'Solicitud reenviada a Cristian Lagos. La notificación interna quedó activa, pero el correo no pudo entregarse.'
          :'Solicitud reenviada a Cristian Lagos y notificada por correo.',
        mailError?'warn':'success'
      );
    }catch(error){
      window.toast?.('No se pudo reenviar la solicitud: '+(error.message||String(error)),'error');
    }
  };

  function install(){
    wrapCreate();
    wrapModal();
    wrapActions();
    loadApprovers().then(()=>{
      if(!document.getElementById('page-solicitudes')?.classList.contains('hidden')){
        window.renderSolicitudesV15?.();
      }
    }).catch(()=>{});

    if(installTimer)return;
    let tries=0;
    installTimer=setInterval(()=>{
      tries++;
      wrapCreate();wrapModal();wrapActions();
      if(tries>=80){clearInterval(installTimer);installTimer=null}
    },150);

    window.addEventListener('stainher:modules-ready',()=>{wrapCreate();wrapModal();wrapActions()});
    window.addEventListener('stainher:runtime-r135-ready',()=>{wrapCreate();wrapModal();wrapActions()});
  }

  window.StainherRequestApproverR135=Object.freeze({install,loadApprovers,injectApproverSelector});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();