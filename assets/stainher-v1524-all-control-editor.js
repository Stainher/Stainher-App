/* Stainher V15.24 · edición de todos los Controles Stainher + borrado de archivados. */
(()=>{
  'use strict';
  if(window.__STAINHER_ALL_CONTROL_EDITOR__)return;
  window.__STAINHER_ALL_CONTROL_EDITOR__=true;

  const esc=v=>String(v==null?'':v).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const role=()=>String(window.v11Role?.()||window.state?.profile?.rol||'').trim().toLowerCase();
  const canManage=()=>['administrador','prevencion'].includes(role())&&!!window.canEditV11?.('liderazgo');
  const controls=()=>{try{return Array.isArray(V12_CONTROLS)?V12_CONTROLS:[]}catch(_){return []}};
  const cBy=n=>controls().find(c=>Number(c.n)===Number(n));
  const cfg=()=>window.state?.v1524BaseControlConfig||[];
  const rowBy=n=>cfg().find(r=>Number(r.control_num)===Number(n));

  async function loadBase(){
    const q=await window.sb.from('liderazgo_controles_base_v1513')
      .select('control_num,activo,codigo,nombre,descripcion,frecuencia,updated_at')
      .order('control_num');
    if(q.error)throw q.error;
    window.state=window.state||{};
    window.state.v1524BaseControlConfig=q.data||[];
    (q.data||[]).forEach(r=>{
      const c=cBy(r.control_num);
      if(!c)return;
      if(r.codigo)c.code=r.codigo;
      if(r.nombre)c.name=r.nombre;
      if(r.descripcion!=null)c.desc=r.descripcion;
      if(r.frecuencia)c.freq=r.frecuencia;
      c.active=r.activo!==false;
    });
    return q.data||[];
  }

  async function loadCustom(){
    const q=await window.sb.from('liderazgo_plantillas_v1512')
      .select('id,codigo,nombre,descripcion,frecuencia,requiere_programacion,campos,activo,updated_at')
      .order('updated_at',{ascending:false});
    if(q.error)throw q.error;
    return q.data||[];
  }

  function activeControlCodes(templates=[]){
    const set=new Set(
      controls()
        .filter(c=>c&&c.active!==false&&c.code)
        .map(c=>String(c.code))
    );
    (templates||[]).forEach(t=>{
      if(t?.activo!==false&&t?.codigo)set.add(String(t.codigo));
    });
    return set;
  }

  function goalCode(row){
    return String(row?.control_codigo||row?.control_code||row?.codigo_control||row?.codigo||row?.control||'').trim();
  }

  function currentActiveCodes(){
    const cached=window.state?.v1524ActiveLeadershipCodes;
    if(cached instanceof Set)return cached;
    return activeControlCodes(window.state?.v1512ControlTemplates||window.state?.v1524ManagerTemplates||[]);
  }

  function filterProgrammingResponse(response){
    if(!response||response.error||!Array.isArray(response.data)||window.state?.v1524ActiveLeadershipCodesReady!==true)return response;
    const active=currentActiveCodes();
    return {...response,data:response.data.filter(row=>{
      const code=goalCode(row);
      return !code||active.has(code);
    })};
  }

  function proxyProgrammingBuilder(builder){
    if(!builder||typeof builder!=='object')return builder;
    let proxy;
    proxy=new Proxy(builder,{
      get(target,prop){
        if(prop==='then')return (ok,fail)=>target.then(result=>{
          const filtered=filterProgrammingResponse(result);
          return typeof ok==='function'?ok(filtered):filtered;
        },fail);
        const value=Reflect.get(target,prop,target);
        if(typeof value!=='function')return value;
        return (...args)=>{
          const out=value.apply(target,args);
          if(out&&typeof out==='object'&&typeof out.then==='function')return proxyProgrammingBuilder(out);
          return out;
        };
      }
    });
    return proxy;
  }

  function installLeadershipProgrammingFilter(){
    const sb=window.sb;
    if(!sb||typeof sb.from!=='function'||sb.from.__stainherProgrammingFilter)return;
    const original=sb.from.bind(sb);
    const wrapped=function(table){
      const builder=original(table);
      return String(table)==='liderazgo_programacion'?proxyProgrammingBuilder(builder):builder;
    };
    wrapped.__stainherProgrammingFilter=true;
    wrapped.__base=original;
    sb.from=wrapped;
  }

  function wrapLeadershipData(){
    const base=window.v1512LoadLeadershipData;
    if(typeof base!=='function'||base.__stainherActiveControlsOnly)return;
    const wrapped=async function(){
      const data=await base.apply(this,arguments);
      if(!data||data.error)return data;
      const active=currentActiveCodes();
      const goals=(data.goals||[]).filter(g=>{const code=goalCode(g);return !code||active.has(code)});
      if(window.state)window.state.v1512LeadGoals=goals;
      return {...data,goals};
    };
    wrapped.__stainherActiveControlsOnly=true;
    wrapped.__stainherBase=base;
    window.v1512LoadLeadershipData=wrapped;
  }

  function style(){
    if(document.getElementById('stainher-all-control-editor-style'))return;
    const s=document.createElement('style');
    s.id='stainher-all-control-editor-style';
    s.textContent=`
      .v1524-all-section{margin-top:16px}
      .v1524-all-section>h4{margin:0 0 8px}
      .v1524-all-card{display:grid;grid-template-columns:minmax(0,1fr) auto;gap:12px;align-items:center;border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--panel2);margin-top:10px}
      .v1524-all-card h4{margin:0 0 4px}
      .v1524-all-card small{display:block;color:var(--muted);margin-top:3px}
      .v1524-all-card .actions{display:flex;gap:8px;flex-wrap:wrap;justify-content:flex-end}
      .v1524-all-code{font:11px ui-monospace,SFMono-Regular,Menlo,monospace;color:var(--muted)}
      @media(max-width:700px){
        .v1524-all-card{grid-template-columns:1fr}
        .v1524-all-card .actions{justify-content:stretch}
        .v1524-all-card .actions .btn{flex:1 1 120px}
      }
    `;
    document.head.appendChild(s);
  }

  window.v1524OpenBuiltinControlEditor=async function(n){
    if(!canManage())return window.toast?.('Solo Administrador y Prevención pueden editar controles.','error');
    try{
      let r=rowBy(n);
      if(!r){await loadBase();r=rowBy(n)}
      const c=cBy(n);
      if(!r||!c)throw new Error('No se encontró el control estándar.');
      const root=document.getElementById('modalRoot');
      root.innerHTML=`<div class="modal-bg"><div class="modal modal-wide-v9"><div class="row-between"><div><h3>Editar Control Stainher N.º ${Number(n)}</h3><div class="muted">${esc(r.codigo||c.code||'')}</div></div><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div><div class="notice">El nombre, descripción, frecuencia y disponibilidad son editables. La estructura técnica del formulario especializado y el historial se conservan.</div><form id="v1524BuiltinEdit" class="form-grid" style="margin-top:12px"><label class="full">Nombre<input class="field" name="nombre" value="${esc(r.nombre||c.name||'')}" required></label><label class="full">Descripción<textarea class="field" name="descripcion" rows="3">${esc(r.descripcion??c.desc??'')}</textarea></label><label>Frecuencia<input class="field" name="frecuencia" value="${esc(r.frecuencia||c.freq||'')}" required></label><label>Estado<select class="field" name="activo"><option value="true" ${r.activo!==false?'selected':''}>Disponible</option><option value="false" ${r.activo===false?'selected':''}>Desactivado</option></select></label><div class="full actions" style="justify-content:flex-end"><button class="btn primary">Guardar cambios</button></div></form></div></div>`;
      document.getElementById('v1524BuiltinEdit').onsubmit=async e=>{
        e.preventDefault();
        try{
          const f=Object.fromEntries(new FormData(e.target));
          const q=await window.sb.rpc('admin_update_control_base_v1524',{
            p_control_num:Number(n),
            p_nombre:String(f.nombre||'').trim(),
            p_descripcion:String(f.descripcion||'').trim(),
            p_frecuencia:String(f.frecuencia||'').trim(),
            p_activo:f.activo==='true'
          });
          if(q.error)throw q.error;
          await loadBase();
          window.closeModal?.();
          await window.renderLiderazgoV95?.();
          window.toast?.('Control estándar actualizado.','success');
        }catch(err){window.toast?.(err?.message||'No se pudo guardar el control.','error')}
      };
    }catch(err){window.toast?.(err?.message||'No se pudo editar el control.','error')}
  };

  window.v1524DeleteArchivedControl=async function(id){
    if(!canManage())return window.toast?.('Solo Administrador y Prevención pueden eliminar controles archivados.','error');
    const t=(window.state?.v1524ManagerTemplates||[]).find(x=>String(x.id)===String(id));
    if(t?.activo!==false)return window.toast?.('Primero debes archivar el control.','error');
    if(!confirm(`¿Eliminar definitivamente “${t?.nombre||'Control'}”? Los registros históricos realizados se conservarán.`))return;
    const q=await window.sb.rpc('admin_delete_archived_custom_control_v1524',{p_id:id});
    if(q.error)return window.toast?.(q.error.message,'error');
    await window.renderLiderazgoV95?.();
    await window.v1524OpenPublishedControlsManager?.();
    window.toast?.('Control archivado eliminado.','success');
  };

  function stdCards(rows){
    return rows.map(r=>{
      const c=cBy(r.control_num);
      return `<article class="v1524-all-card"><div><h4>N.º ${Number(r.control_num)} · ${esc(r.nombre||c?.name||'Control')}</h4><div class="v1524-all-code">${esc(r.codigo||c?.code||'')}</div><small>${esc(r.frecuencia||c?.freq||'Sin frecuencia')}</small><small>Estado: ${r.activo===false?'Desactivado':'Disponible'}</small></div><div class="actions"><button class="btn" type="button" onclick="v1524OpenBuiltinControlEditor(${Number(r.control_num)})">Editar control</button></div></article>`;
    }).join('');
  }

  function customCards(rows){
    return rows.map(t=>`<article class="v1524-all-card"><div><h4>${esc(t.nombre||'Control sin nombre')}</h4><div class="v1524-all-code">${esc(t.codigo||'')}</div><small>${esc(t.frecuencia||'Sin frecuencia')} · ${t.requiere_programacion?'Requiere programación':'Ejecución libre'}</small><small>Estado: ${t.activo===false?'Archivado':'Publicado'}</small></div><div class="actions"><button class="btn" type="button" onclick="v1524OpenEditTemplateModal('${esc(t.id)}')">Editar control</button><button class="btn ${t.activo===false?'primary':'danger-btn'}" type="button" onclick="v1524TogglePublishedControl('${esc(t.id)}',${t.activo===false?'true':'false'})">${t.activo===false?'Activar':'Archivar'}</button>${t.activo===false?`<button class="btn danger-btn" type="button" onclick="v1524DeleteArchivedControl('${esc(t.id)}')">Eliminar</button>`:''}</div></article>`).join('');
  }

  window.v1524OpenPublishedControlsManager=async function(){
    if(!canManage())return window.toast?.('Solo Administrador y Prevención pueden editar controles.','error');
    style();
    const root=document.getElementById('modalRoot');
    root.innerHTML='<div class="modal-bg"><div class="modal modal-wide-v9"><div class="row-between"><h3>Editar Controles Stainher</h3><button class="btn" onclick="closeModal()">Cerrar</button></div><div class="empty">Cargando controles…</div></div></div>';
    try{
      const [b,t]=await Promise.all([loadBase(),loadCustom()]);
      window.state=window.state||{};
      window.state.v1524ManagerTemplates=t;
      window.state.v1524ActiveLeadershipCodes=activeControlCodes(t);
      window.state.v1524ActiveLeadershipCodesReady=true;
      const m=root.querySelector('.modal');
      m.innerHTML=`<div class="row-between"><div><h3>Editar Controles Stainher</h3><div class="muted">Administrador y Prevención pueden administrar todos los controles.</div></div><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div><div class="actions" style="justify-content:flex-end;margin-top:12px"><button class="btn primary" type="button" onclick="v1512OpenTemplateModal()">+ Crear control</button></div><section class="v1524-all-section"><h4>Controles estándar</h4>${stdCards(b)||'<div class="empty">Sin controles estándar.</div>'}</section><section class="v1524-all-section"><h4>Controles personalizados</h4>${customCards(t)||'<div class="empty">Sin controles personalizados.</div>'}</section>`;
    }catch(err){
      root.querySelector('.modal').innerHTML=`<div class="row-between"><h3>Editar Controles Stainher</h3><button class="btn" onclick="closeModal()">Cerrar</button></div><div class="notice error">${esc(err?.message||'No se pudieron cargar los controles.')}</div>`;
    }
  };

  function removeCardEditButtons(){
    const grid=document.querySelector('#v1512Lead_controles .control-grid-v95');
    if(!grid)return;
    grid.querySelectorAll('.control-card-v95').forEach(card=>{
      card.querySelectorAll('button').forEach(btn=>{
        const text=String(btn.textContent||'').trim().toLowerCase();
        const action=String(btn.getAttribute('onclick')||'');
        if(text==='editar control'||btn.hasAttribute('data-v1524-builtin-edit')||/v1524OpenBuiltinControlEditor|v1524OpenEditTemplateModal/.test(action))btn.remove();
      });
    });
  }

  function wrapRender(){
    const base=window.renderLiderazgoV95;
    if(typeof base!=='function'||base.__stainherAllControlEditor)return;
    const wrapped=async function(){
      try{
        const [,templates]=await Promise.all([loadBase(),loadCustom()]);
        window.state=window.state||{};
        window.state.v1524ActiveLeadershipCodes=activeControlCodes(templates);
        window.state.v1524ActiveLeadershipCodesReady=true;
        installLeadershipProgrammingFilter();
      }catch(e){
        console.warn('[Stainher] catálogo activo de controles',e);
        if(window.state)window.state.v1524ActiveLeadershipCodesReady=false;
      }
      const out=await base.apply(this,arguments);
      removeCardEditButtons();
      return out;
    };
    wrapped.__stainherAllControlEditor=true;
    wrapped.__stainherBase=base;
    window.renderLiderazgoV95=wrapped;
  }

  function setTextIfChanged(node,value){
    if(!node)return false;
    const next=String(value==null?'':value);
    if(node.textContent===next)return false;
    node.textContent=next;
    return true;
  }

  function patchModal(){
    const modal=document.querySelector('#modalRoot .modal');
    if(!modal)return;
    const forms=[
      [4,'#vehCtlFormV156'],
      [5,'#extFormV157,#extFormV12'],
      [6,'#terrainFormV11,#terrainFormV95'],
      [7,'form[id*="epp"]'],
      [8,'form[id*="amb"],form[id*="env"]'],
      [9,'#protFormV12']
    ];
    const hit=forms.find(([,s])=>modal.querySelector(s));
    if(!hit)return;
    const c=cBy(hit[0]);
    if(!c)return;
    const h=modal.querySelector('.row-between h3');
    setTextIfChanged(h,c.name);
    const sub=h?.parentElement?.querySelector('.muted');
    if(c.desc)setTextIfChanged(sub,c.desc);
  }

  function install(){style();installLeadershipProgrammingFilter();wrapLeadershipData();wrapRender();removeCardEditButtons();patchModal()}

  let observerQueued=false;
  const observer=new MutationObserver(records=>{
    if(observerQueued)return;
    if(!records.some(r=>r.addedNodes.length||r.removedNodes.length))return;
    observerQueued=true;
    requestAnimationFrame(()=>{
      observerQueued=false;
      removeCardEditButtons();
      patchModal();
    });
  });
  observer.observe(document.documentElement,{childList:true,subtree:true});

  window.addEventListener('stainher:modules-ready',()=>{
    setTimeout(install,0);
    setTimeout(install,1200);
  });
  install();
  setTimeout(install,500);
  setTimeout(install,1700);
})();
