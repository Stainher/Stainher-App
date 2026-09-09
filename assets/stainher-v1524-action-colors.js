/* Stainher App V15.24 · colores semánticos para botones de acción. */
(()=>{
  'use strict';
  if(window.__STAINHER_ACTION_COLORS__)return;
  window.__STAINHER_ACTION_COLORS__=true;
  const TONES=['positive','danger','primary','info','neutral'];
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,' ').trim().toLowerCase();
  function description(button){return norm(`${button.textContent||button.value||''} ${button.getAttribute('aria-label')||''} ${button.getAttribute('title')||''} ${button.getAttribute('onclick')||''}`)}
  function toneFor(button){
    const forced=button.dataset.actionTone;if(TONES.includes(forced))return forced;
    const text=description(button);
    if(/\b(rechazar|eliminar|borrar|anular|retirar|dar de baja|desactivar)\b/.test(text))return'danger';
    if(/\b(aprobar|autorizar|aceptar|confirmar|finalizar|publicar)\b/.test(text))return'positive';
    if(/\b(crear|nuevo|nueva|registrar|guardar|actualizar|editar|importar|reprogramar|programar|agregar)\b/.test(text))return'primary';
    if(/\b(informe|descargar|exportar|consultar|ver |ver$|detalle|historial)\b/.test(text))return'info';
    if(/\b(cerrar|volver|cancelar|limpiar)\b/.test(text))return'neutral';
    return'';
  }
  function canManageLeadership(){
    try{return typeof window.canManageLeadershipV11==='function'&&!!window.canManageLeadershipV11()}catch(_){return false}
  }
  function leadershipTemplates(){return Array.isArray(window.state?.v1512ControlTemplates)?window.state.v1512ControlTemplates:[]}
  function findTemplateForCard(card,templates){
    const title=norm(card.querySelector('h4')?.textContent||'');
    return templates.find(t=>norm(t?.nombre)===title)||null;
  }
  async function retireCustomLeadershipControl(id){
    if(!canManageLeadership())return window.toast?.('No tienes permiso para eliminar este control.','error');
    const templates=leadershipTemplates(),template=templates.find(t=>String(t?.id)===String(id));
    if(!template)return window.toast?.('No se encontró el control personalizado.','error');
    if(!window.confirm(`¿Eliminar el control “${template.nombre}”?\n\nSe quitará del catálogo activo y se conservarán las ejecuciones y programaciones históricas.`))return;
    try{
      const query=await window.sb.from('liderazgo_plantillas_v1512').update({activo:false,updated_at:new Date().toISOString()}).eq('id',id);
      if(query.error)throw query.error;
      try{window.v1512Audit?.('liderazgo','desactivar_control_personalizado',String(id),{codigo:template.codigo,nombre:template.nombre})}catch(_){ }
      if(window.state)window.state.v1512ControlTemplates=templates.filter(t=>String(t?.id)!==String(id));
      await window.renderLiderazgoV95?.();
      window.toast?.('Control eliminado del catálogo. El historial se conserva.','success');
    }catch(error){window.toast?.(error?.message||'No se pudo eliminar el control.','error')}
  }
  window.v1524RetireCustomLeadershipControl=retireCustomLeadershipControl;
  function enhanceLeadershipCustomControls(){
    const page=document.getElementById('page-liderazgo');
    if(!page||!canManageLeadership())return;
    const templates=leadershipTemplates();if(!templates.length)return;
    const cards=[...page.querySelectorAll('#v1512Lead_controles .control-grid-v95 > .control-card-v95')];
    cards.forEach(card=>{
      const badge=norm(card.querySelector('.status')?.textContent||''),number=String(card.querySelector('.control-number-v95')?.textContent||'').trim();
      if(badge!=='personalizado'&&number!=='+')return;
      if(card.querySelector('[data-v1524-custom-delete]'))return;
      const template=findTemplateForCard(card,templates);if(!template)return;
      const admin=document.createElement('div');admin.className='v1524-custom-control-admin';admin.dataset.v1524CustomDelete='1';
      const button=document.createElement('button');button.type='button';button.className='btn danger-btn stainher-action-danger';button.textContent='Eliminar control';button.dataset.actionTone='danger';
      button.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();retireCustomLeadershipControl(template.id)});
      admin.appendChild(button);card.appendChild(admin);
    });
  }
  function enhance(root=document){
    const buttons=[];
    if(root.matches?.('button,input[type="button"],input[type="submit"]'))buttons.push(root);
    root.querySelectorAll?.('button,input[type="button"],input[type="submit"]').forEach(button=>buttons.push(button));
    buttons.forEach(button=>{
      const tone=toneFor(button);TONES.forEach(name=>button.classList.toggle(`stainher-action-${name}`,name===tone));
      if(tone)button.dataset.stainherActionTone=tone;else delete button.dataset.stainherActionTone;
    });
    enhanceLeadershipCustomControls();
  }
  function mountStyle(){
    if(document.getElementById('stainher-action-colors-style'))return;
    const style=document.createElement('style');style.id='stainher-action-colors-style';style.textContent=`
      :where(button,.btn,input[type="button"],input[type="submit"]){font-family:Inter,Arial,sans-serif!important;font-weight:400!important;line-height:1.2!important;min-height:40px;max-width:100%;padding:9px 14px;white-space:normal;overflow-wrap:anywhere;text-align:center;justify-content:center}
      :where(button,input[type="button"],input[type="submit"]).stainher-action-positive{background:#16875f!important;border-color:#0f6b4b!important;color:#fff!important;box-shadow:0 1px 2px rgba(15,107,75,.22)!important}
      :where(button,input[type="button"],input[type="submit"]).stainher-action-danger{background:#c43245!important;border-color:#9f2031!important;color:#fff!important;box-shadow:0 1px 2px rgba(159,32,49,.22)!important}
      :where(button,input[type="button"],input[type="submit"]).stainher-action-primary{background:#ef5b2a!important;border-color:#cf4318!important;color:#fff!important;box-shadow:0 1px 2px rgba(207,67,24,.2)!important}
      :where(button,input[type="button"],input[type="submit"]).stainher-action-info{background:#1769c2!important;border-color:#13579f!important;color:#fff!important;box-shadow:0 1px 2px rgba(19,87,159,.2)!important}
      :where(button,input[type="button"],input[type="submit"]).stainher-action-neutral{background:var(--panel2,#e8eef5)!important;border-color:var(--line,#aebac8)!important;color:var(--text,#182230)!important;box-shadow:none!important}
      :where(button,input[type="button"],input[type="submit"])[class*="stainher-action-"]:not(:disabled):active{filter:brightness(.9);transform:translateY(1px)}
      :where(button,input[type="button"],input[type="submit"])[class*="stainher-action-"]:disabled{opacity:.48!important;cursor:not-allowed!important;box-shadow:none!important}
      [data-theme="dark"] :where(button,input[type="button"],input[type="submit"]).stainher-action-neutral{background:#202936!important;border-color:#3a4656!important;color:#e6edf5!important}
      :where(.equipment-card,.vehicle-card,.v1523-user-card,.v157-person-card,.v1519-inventory-card) :where(.actions,[class*="-actions"]){display:flex!important;align-items:stretch!important;gap:8px!important;flex-wrap:wrap!important}
      :where(.equipment-card,.vehicle-card,.v1523-user-card,.v157-person-card,.v1519-inventory-card) :where(.actions,[class*="-actions"])>.btn{flex:0 1 auto!important;min-width:96px!important}
      :where(.equipment-card,.vehicle-card,.v1523-user-card,.v157-person-card,.v1519-inventory-card) :where(.actions,[class*="-actions"])>.stainher-action-info{order:1}
      :where(.equipment-card,.vehicle-card,.v1523-user-card,.v157-person-card,.v1519-inventory-card) :where(.actions,[class*="-actions"])>.stainher-action-primary{order:2}
      :where(.equipment-card,.vehicle-card,.v1523-user-card,.v157-person-card,.v1519-inventory-card) :where(.actions,[class*="-actions"])>.stainher-action-positive{order:3}
      :where(.equipment-card,.vehicle-card,.v1523-user-card,.v157-person-card,.v1519-inventory-card) :where(.actions,[class*="-actions"])>.stainher-action-danger{order:4}

      /* Inicio · eliminar recordatorio queda a la izquierda del contador de días. */
      #page-inicio .v152-alert-card.manual{position:relative!important}
      #page-inicio .v152-alert-card.manual .v152-alert-delete{
        position:absolute!important;
        top:7px!important;
        right:82px!important;
        grid-area:auto!important;
        grid-column:auto!important;
        grid-row:auto!important;
        align-self:auto!important;
        justify-self:auto!important;
        display:inline-grid!important;
        place-items:center!important;
        width:24px!important;
        height:24px!important;
        min-width:24px!important;
        min-height:24px!important;
        max-width:24px!important;
        max-height:24px!important;
        margin:0!important;
        padding:0!important;
        border-radius:6px!important;
        font-size:15px!important;
        line-height:1!important;
        white-space:nowrap!important;
        overflow:hidden!important;
        z-index:5!important;
      }
      #page-liderazgo .v1524-custom-control-admin{display:flex;justify-content:flex-end;margin-top:10px;padding-top:9px;border-top:1px solid var(--line)}
      #page-liderazgo .v1524-custom-control-admin .btn{min-height:34px!important;padding:7px 10px!important;font-size:11px!important}
      @media(max-width:760px){
        :where(.equipment-card,.vehicle-card,.v1523-user-card,.v157-person-card,.v1519-inventory-card) :where(.actions,[class*="-actions"]){display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr))!important}
        :where(.equipment-card,.vehicle-card,.v1523-user-card,.v157-person-card,.v1519-inventory-card) :where(.actions,[class*="-actions"])>.btn{width:100%!important;min-width:0!important}
        #page-inicio .v152-alert-card.manual .v152-alert-delete{right:68px!important}
      }
    `;document.head.appendChild(style);
  }
  function boot(){
    mountStyle();enhance();let queued=false;
    new MutationObserver(records=>{if(queued)return;if(records.some(record=>record.addedNodes.length||record.type==='attributes')){queued=true;requestAnimationFrame(()=>{queued=false;enhance()})}}).observe(document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','disabled','aria-label','title']});
    window.addEventListener('stainher:modules-ready',()=>enhance());
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
