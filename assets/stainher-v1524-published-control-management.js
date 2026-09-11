/* Stainher V15.24 · administración visible de Controles Stainher publicados. */
(()=>{
  'use strict';
  if(window.__STAINHER_PUBLISHED_CONTROL_MANAGEMENT__)return;
  window.__STAINHER_PUBLISHED_CONTROL_MANAGEMENT__=true;

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const role=()=>String(window.v11Role?.()||window.state?.profile?.rol||'').trim().toLowerCase();
  const canManage=()=>['administrador','prevencion'].includes(role())&&!!window.canEditV11?.('liderazgo');
  window.canManagePublishedControlsV1524=canManage;

  function mountStyle(){
    if(document.getElementById('stainher-v1524-published-control-management-style'))return;
    const style=document.createElement('style');
    style.id='stainher-v1524-published-control-management-style';
    style.textContent=`
      .v1524-control-admin-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap}
      .v1524-template-admin-list{display:grid;gap:10px;margin-top:14px}
      .v1524-template-admin-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--panel2)}
      .v1524-template-admin-card h4{margin:0 0 4px}.v1524-template-admin-card small{display:block;color:var(--muted);margin-top:3px}
      .v1524-template-admin-card .actions{justify-content:flex-end}
      @media(max-width:700px){.v1524-template-admin-card{grid-template-columns:1fr}.v1524-template-admin-card .actions{justify-content:stretch}.v1524-template-admin-card .actions .btn{flex:1}}
    `;
    document.head.appendChild(style);
  }

  function patchCustomAction(){
    if(typeof window.v1512CustomAction!=='function'||window.v1512CustomAction.__stainherPublishedEdit)return;
    const base=window.v1512CustomAction;
    const wrapped=function(template){
      const html=base(template)||'';
      if(!canManage())return html;
      const edit=`<button type="button" class="btn" onclick="v1524OpenEditTemplateModal('${esc(template?.id||'')}')">Editar control</button>`;
      return `<div class="v1524-control-admin-actions">${html}${edit}</div>`;
    };
    wrapped.__stainherPublishedEdit=true;
    wrapped.__stainherBase=base;
    window.v1512CustomAction=wrapped;
  }

  function enhanceToolbar(){
    const page=document.getElementById('page-liderazgo');if(!page)return;
    const panel=[...page.querySelectorAll('#v1512Lead_controles .panel,.panel')].find(x=>/Controles Stainher/i.test(x.querySelector('h3')?.textContent||''));
    if(!panel)return;
    let actions=panel.querySelector('.v1523-lead-actions,.v1512-lead-actions');
    if(!actions){const head=panel.querySelector('.row-between,.v1512-control-toolbar');actions=head?.querySelector('.actions');}
    if(!actions)return;
    const old=actions.querySelector('[data-v1524-manage-published]');
    if(!canManage()){old?.remove();return;}
    if(old)return;
    const btn=document.createElement('button');btn.type='button';btn.className='btn';btn.dataset.v1524ManagePublished='1';btn.textContent='Editar controles';btn.onclick=()=>window.v1524OpenPublishedControlsManager?.();actions.appendChild(btn);
  }

  async function loadTemplates(){
    const q=await window.sb.from('liderazgo_plantillas_v1512')
      .select('id,codigo,nombre,descripcion,frecuencia,requiere_programacion,campos,activo,updated_at')
      .order('updated_at',{ascending:false});
    if(q.error)throw q.error;return q.data||[];
  }

  window.v1524TogglePublishedControl=async function(id,active){
    if(!canManage())return window.toast?.('Solo Administrador y Prevención pueden administrar controles publicados.','error');
    try{
      const q=await window.sb.from('liderazgo_plantillas_v1512').update({activo:!!active,updated_at:new Date().toISOString()}).eq('id',id).select('id').single();
      if(q.error)throw q.error;
      await window.renderLiderazgoV95?.();
      await window.v1524OpenPublishedControlsManager?.();
      window.toast?.(active?'Control activado.':'Control desactivado.','success');
    }catch(error){window.toast?.(error?.message||'No se pudo cambiar el estado del control.','error')}
  };

  window.v1524OpenPublishedControlsManager=async function(){
    if(!canManage())return window.toast?.('Solo Administrador y Prevención pueden editar controles publicados.','error');
    mountStyle();
    const root=document.getElementById('modalRoot');if(!root)return;
    root.innerHTML='<div class="modal-bg"><div class="modal modal-wide-v9"><div class="row-between"><div><h3>Editar Controles Stainher</h3><div class="muted">Administración de controles personalizados publicados o archivados.</div></div><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div><div class="empty">Cargando controles…</div></div></div>';
    try{
      const rows=await loadTemplates(),modal=root.querySelector('.modal');if(!modal)return;
      const cards=rows.map(t=>`<article class="v1524-template-admin-card"><div><h4>${esc(t.nombre||'Control sin nombre')}</h4><div class="muted">${esc(t.codigo||'')}</div><small>${esc(t.frecuencia||'Sin frecuencia')} · ${t.requiere_programacion?'Requiere programación':'Ejecución libre'}</small><small>Estado: ${t.activo===false?'Archivado':'Publicado'}</small></div><div class="actions"><button type="button" class="btn" onclick="v1524OpenEditTemplateModal('${esc(t.id)}')">Editar control</button><button type="button" class="btn ${t.activo===false?'primary':'danger-btn'}" onclick="v1524TogglePublishedControl('${esc(t.id)}',${t.activo===false?'true':'false'})">${t.activo===false?'Activar':'Desactivar'}</button></div></article>`).join('');
      modal.innerHTML=`<div class="row-between"><div><h3>Editar Controles Stainher</h3><div class="muted">Solo Administrador y Prevención pueden modificar estas plantillas.</div></div><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div><div class="notice">Los controles estándar 4–9 conservan sus formularios oficiales. Este editor administra los controles personalizados creados desde Stainher App.</div><div class="actions" style="justify-content:flex-end;margin-top:12px"><button type="button" class="btn primary" onclick="v1512OpenTemplateModal()">+ Crear control</button></div><div class="v1524-template-admin-list">${cards||'<div class="empty">No existen controles personalizados.</div>'}</div>`;
    }catch(error){const modal=root.querySelector('.modal');if(modal)modal.innerHTML=`<div class="row-between"><h3>Editar Controles Stainher</h3><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div><div class="notice error">${esc(error?.message||'No se pudieron cargar los controles.')}</div>`;}
  };

  function guardBuilderActions(){
    const create=window.v1512OpenTemplateModal;
    if(typeof create==='function'&&!create.__stainherAdminPrevGuard){
      const wrapped=function(){if(!canManage())return window.toast?.('Solo Administrador y Prevención pueden crear controles.','error');return create.apply(this,arguments)};
      wrapped.__stainherAdminPrevGuard=true;wrapped.__stainherBase=create;window.v1512OpenTemplateModal=wrapped;
    }
    const edit=window.v1524OpenEditTemplateModal;
    if(typeof edit==='function'&&!edit.__stainherAdminPrevGuard){
      const wrapped=function(){if(!canManage())return window.toast?.('Solo Administrador y Prevención pueden editar controles.','error');return edit.apply(this,arguments)};
      wrapped.__stainherAdminPrevGuard=true;wrapped.__stainherBase=edit;window.v1524OpenEditTemplateModal=wrapped;
    }
  }

  function wrapRender(){
    const base=window.renderLiderazgoV95;if(typeof base!=='function'||base.__stainherPublishedManagement)return;
    const wrapped=async function(){patchCustomAction();guardBuilderActions();const out=await base.apply(this,arguments);enhanceToolbar();return out};
    wrapped.__stainherPublishedManagement=true;wrapped.__stainherBase=base;window.renderLiderazgoV95=wrapped;
  }

  function enforceUnauthorizedUi(){
    if(canManage())return;
    document.querySelectorAll('#v1524EditPublishedControl,[data-v1524-manage-published]').forEach(x=>x.remove());
  }

  function install(){mountStyle();patchCustomAction();guardBuilderActions();wrapRender();enhanceToolbar();enforceUnauthorizedUi();}
  window.addEventListener('stainher:modules-ready',()=>{setTimeout(install,0);setTimeout(install,1600)});
  new MutationObserver(()=>{enhanceToolbar();enforceUnauthorizedUi()}).observe(document.documentElement,{childList:true,subtree:true});
  install();setTimeout(install,350);setTimeout(install,1700);
})();
