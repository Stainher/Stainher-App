/* Stainher V15.24 · R177 · cierre operacional de solicitudes. */
(()=>{
  'use strict';
  const BUILD='20261021-r179-solicitudes-categorias-refresh';
  if(window.__STAINHER_REQUEST_CLOSE_R177__===BUILD)return;
  window.__STAINHER_REQUEST_CLOSE_R177__=BUILD;
  const ELIGIBLE=new Set(['otro','permiso','cambio_turno']);
  const role=()=>String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase();
  const uid=()=>String(window.state?.session?.user?.id||window.state?.user?.id||'');
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const dateTime=v=>v?new Date(v).toLocaleString('es-CL'):'—';

  function canFinalize(row){
    if(!row||row.estado!=='aprobada'||!ELIGIBLE.has(String(row.tipo||'')))return false;
    return role()==='administrador'||uid()===String(row.aprobador_user_id||'');
  }

  function wrapStatus(){
    const current=window.v1517RequestStatus;
    if(typeof current!=='function'||current.__r177)return false;
    const wrapped=function(row){
      if(String(row?.estado||'')==='finalizada')return ['ok','Finalizada'];
      return current.apply(this,arguments);
    };
    wrapped.__r177=true;wrapped.__base=current;
    window.v1517RequestStatus=wrapped;try{v1517RequestStatus=wrapped}catch(_){}
    return true;
  }

  window.v177FinalizeRequestModal=function(id){
    const row=(window.state?.v154Requests||[]).find(x=>String(x.id)===String(id));
    if(!row)return window.toast?.('Solicitud no encontrada.','error');
    if(!canFinalize(row))return window.toast?.('Esta solicitud no está disponible para cierre operacional.','error');
    const root=document.getElementById('modalRoot');if(!root)return;
    root.innerHTML=`<div class="modal-bg"><div class="modal">
      <div class="row-between"><div><h3>Finalizar solicitud</h3><div class="muted">La aprobación autoriza la gestión; este cierre confirma que la gestión fue efectivamente completada.</div></div><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div>
      <div class="notice success" style="margin-top:10px"><b>${esc(window.v152RequestLabel?.(row.tipo)||row.tipo)}</b><br>${esc(row.asunto||row.comentario||'Solicitud aprobada')}</div>
      <form id="v177FinalizeForm" class="form-grid" style="margin-top:12px">
        <label class="full">Observación de cierre<textarea class="field" name="observacion" rows="5" required maxlength="1000" placeholder="Ej.: Repuesto comprado y entregado para instalación. OC emitida y material recibido."></textarea></label>
        <div class="full"><button class="btn primary" type="submit">Marcar como finalizada</button></div>
      </form>
    </div></div>`;
    const form=document.getElementById('v177FinalizeForm');
    form.onsubmit=async e=>{
      e.preventDefault();
      const observation=String(new FormData(form).get('observacion')||'').trim();
      if(!observation)return window.toast?.('Debes registrar una observación de cierre.','error');
      const button=form.querySelector('[type="submit"]');if(button){button.disabled=true;button.textContent='Finalizando…'}
      try{
        const q=await window.sb.rpc('finalizar_solicitud_operacional_r177',{p_id:String(id),p_observacion:observation});
        if(q.error)throw q.error;
        const committed=Array.isArray(q.data)?q.data[0]:q.data;
        const local=(window.state?.v154Requests||[]).find(x=>String(x.id)===String(id));
        if(local)Object.assign(local,{
          estado:'finalizada',
          etapa:'finalizada',
          finalizada_at:committed?.finalizada_at||new Date().toISOString(),
          finalizada_por:committed?.finalizada_por||uid(),
          finalizacion_observacion:committed?.finalizacion_observacion||observation
        });
        window.state=window.state||{};
        window.state.r178SolicitudesTab='finalizadas';
        try{await window.v15Notify?.('Solicitud finalizada',`Solicitud ${String(id).slice(0,8)} · gestión completada`,'normal',row.solicitante_user_id,'solicitudes',id)}catch(error){console.warn('[Stainher R179] aviso',error)}
        window.closeModal?.();
        await window.renderSolicitudesV15?.();
        await window.v15LoadNotifications?.();
        window.toast?.('Solicitud marcada como finalizada y movida a Finalizadas.','success');
      }catch(error){
        window.toast?.('No se pudo finalizar la solicitud: '+(error?.message||String(error)),'error');
        if(button&&document.body.contains(button)){button.disabled=false;button.textContent='Marcar como finalizada'}
      }
    };
  };

  function ensureTabs(page){
    const grid=page.querySelector('.v152-request-grid');if(!grid)return;
    let tabs=page.querySelector('[data-r178-tabs]');
    if(!tabs){
      tabs=document.createElement('div');tabs.dataset.r178Tabs='1';tabs.className='panel';tabs.style.marginBottom='12px';
      tabs.innerHTML=`<div class="row-between" style="gap:10px;flex-wrap:wrap"><div><b>Solicitudes</b><div class="muted">Separa solicitudes activas de gestiones ya completadas.</div></div><div class="actions"><button class="btn primary" type="button" data-r178-tab="activas">Activas</button><button class="btn" type="button" data-r178-tab="finalizadas">Finalizadas <span data-r178-final-count></span></button></div></div><div class="actions" style="margin-top:10px;flex-wrap:wrap" data-r179-type-tabs><button class="btn primary" type="button" data-r179-type="todas">Todas</button><button class="btn" type="button" data-r179-type="vacaciones">Vacaciones</button><button class="btn" type="button" data-r179-type="permisos">Permisos</button><button class="btn" type="button" data-r179-type="otras">Otras</button></div>`;
      grid.insertAdjacentElement('beforebegin',tabs);
      tabs.querySelectorAll('[data-r178-tab]').forEach(button=>button.addEventListener('click',()=>{
        window.state=window.state||{};window.state.r178SolicitudesTab=button.dataset.r178Tab;
        applyTab(page);
      }));
      tabs.querySelectorAll('[data-r179-type]').forEach(button=>button.addEventListener('click',()=>{
        window.state=window.state||{};window.state.r179SolicitudesType=button.dataset.r179Type;
        applyTab(page);
      }));
    }
    const rows=window.state?.v154Requests||[],count=rows.filter(x=>String(x.estado||'')==='finalizada').length;
    const countNode=tabs.querySelector('[data-r178-final-count]');if(countNode)countNode.textContent=count?`(${count})`:'';
    applyTab(page);
  }
  function requestCategory(type){
    type=String(type||'');
    if(type==='vacaciones')return 'vacaciones';
    if(['permiso','permiso_matrimonio','permiso_fallecimiento','permiso_nacimiento','justificativo'].includes(type))return 'permisos';
    return 'otras';
  }
  function applyTab(page){
    const selected=window.state?.r178SolicitudesTab||'activas',typeSelected=window.state?.r179SolicitudesType||'todas',rows=window.state?.v154Requests||[],cards=[...page.querySelectorAll('.v152-request-card')];
    cards.forEach((card,index)=>{
      const row=rows[index];if(!row)return;
      const isFinal=String(row.estado||'')==='finalizada';
      const stateMatch=selected==='finalizadas'?isFinal:!isFinal;
      const category=requestCategory(row.tipo);
      const typeMatch=typeSelected==='todas'||category===typeSelected;
      card.style.display=(stateMatch&&typeMatch)?'':'none';
    });
    page.querySelectorAll('[data-r178-tab]').forEach(button=>button.classList.toggle('primary',button.dataset.r178Tab===selected));
    page.querySelectorAll('[data-r179-type]').forEach(button=>button.classList.toggle('primary',button.dataset.r179Type===typeSelected));
    const grid=page.querySelector('.v152-request-grid');
    let empty=page.querySelector('[data-r178-empty]');
    const visible=cards.some(card=>card.style.display!=='none');
    if(!visible){
      if(!empty){empty=document.createElement('div');empty.dataset.r178Empty='1';empty.className='notice';grid.insertAdjacentElement('beforebegin',empty)}
      const label=typeSelected==='todas'?'solicitudes':typeSelected==='vacaciones'?'vacaciones':typeSelected==='permisos'?'permisos':'otras solicitudes';
      empty.textContent=selected==='finalizadas'?('No hay '+label+' finalizadas.'):('No hay '+label+' activas.');
    }else empty?.remove();
  }

  function decorate(){
    const page=document.getElementById('page-solicitudes');if(!page)return;
    ensureTabs(page);
    const rows=window.state?.v154Requests||[],cards=[...page.querySelectorAll('.v152-request-card')];
    cards.forEach((card,index)=>{
      const row=rows[index];if(!row)return;
      const actions=card.querySelector('.v154-request-actions')||card;
      actions.querySelectorAll('[data-r177-finalize]').forEach(x=>x.remove());
      card.querySelectorAll('[data-r177-final-info]').forEach(x=>x.remove());
      if(canFinalize(row)){
        const b=document.createElement('button');b.type='button';b.className='btn primary';b.dataset.r177Finalize=String(row.id);b.textContent='Marcar como finalizada';b.onclick=()=>window.v177FinalizeRequestModal(row.id);actions.appendChild(b);
      }
      if(String(row.estado||'')==='finalizada'){
        const info=document.createElement('div');info.className='wide notice success';info.dataset.r177FinalInfo='1';
        info.innerHTML='<b>Gestión finalizada</b><div style="margin-top:4px">'+esc(row.finalizacion_observacion||'Sin observación de cierre')+'</div><small>Finalizada: '+esc(dateTime(row.finalizada_at))+'</small>';
        actions.insertAdjacentElement('beforebegin',info);
      }
    });
  }

  function wrapRender(){
    const current=window.renderSolicitudesV15;if(typeof current!=='function'||current.__r177)return false;
    const wrapped=async function(){const out=await current.apply(this,arguments);decorate();requestAnimationFrame(decorate);return out};
    wrapped.__r177=true;wrapped.__base=current;window.renderSolicitudesV15=wrapped;try{renderSolicitudesV15=wrapped}catch(_){}
    return true;
  }

  function install(){
    wrapStatus();wrapRender();decorate();
    window.addEventListener('stainher:solicitudes-view-r133-ready',()=>{wrapStatus();wrapRender();decorate()});
    window.addEventListener('stainher:request-approver-r135-ready',()=>{wrapStatus();wrapRender();decorate()});
    window.addEventListener('stainher:approved-reroute-r138-ready',()=>{wrapStatus();wrapRender();decorate()});
    window.addEventListener('stainher:marriage-leave-r171-ready',()=>{wrapStatus();wrapRender();decorate()});
  }
  window.StainherRequestCloseR177=Object.freeze({install,decorate,canFinalize,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();