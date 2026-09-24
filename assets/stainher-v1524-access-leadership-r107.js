/* Stainher V15.24 · R107 · Acceso de alertas y personal programable de Liderazgo. */
(()=>{
  'use strict';
  if(window.__STAINHER_ACCESS_LEADERSHIP_R107__)return;
  window.__STAINHER_ACCESS_LEADERSHIP_R107__=true;

  const role=()=>String(window.v11Role?.()||window.state?.profile?.rol||'').trim().toLowerCase();
  const canManage=()=>{
    try{return ['administrador','planificador','prevencion','apr'].includes(role())&&!!window.canEditV11?.('liderazgo')}
    catch(_){return false}
  };

  function install(){
    const manage=()=>canManage();
    window.canManageLeadershipV11=manage;
    try{canManageLeadershipV11=manage}catch(_){}

    const open=async function(){
      if(!canManage())return window.toast?.('No tienes permiso para programar controles.','error');
      const [people,templates]=await Promise.all([
        window.sb.rpc('liderazgo_personal_programable_v107'),
        window.sb.from('liderazgo_plantillas_v1512').select('*').eq('activo',true).order('nombre')
      ]);
      if(people.error)return window.toast?.(`No fue posible cargar el personal: ${people.error.message}`,'error');
      if(templates.error)return window.toast?.(`No fue posible cargar los controles: ${templates.error.message}`,'error');

      const roster=people.data||[];
      const controls=[
        ...V12_CONTROLS.filter(c=>c.active&&Number(c.n)!==4).map(c=>({code:c.code,name:c.name})),
        ...(templates.data||[]).filter(x=>x.requiere_programacion).map(x=>({code:x.codigo,name:x.nombre}))
      ];
      const period=`${window.state.leadershipYear||new Date().getFullYear()}-${String(window.state.leadershipMonth||new Date().getMonth()+1).padStart(2,'0')}`;
      const empty=roster.length?'':'<div class="notice warn full">No hay supervisores o técnicos activos disponibles para programar.</div>';
      const root=document.getElementById('modalRoot');if(!root)return;
      root.innerHTML=`<div class="modal-bg"><div class="modal"><div class="row-between"><h3>Programar control</h3><button class="btn" onclick="closeModal()">Cerrar</button></div><form id="v1514LeadGoal" class="form-grid"><label class="full">Usuario programado<select class="field" name="programado_user_id" required ${roster.length?'':'disabled'}><option value="">Seleccionar Supervisor o Técnico</option>${roster.map(x=>`<option value="${x.id}" data-role="${window.esc(x.rol)}">${window.esc(x.nombre)} · ${window.esc(window.v1514RoleLabel(x.rol))}</option>`).join('')}</select></label>${empty}<label class="full">Control<select class="field" name="control_codigo" required><option value="">Seleccionar control</option>${controls.map(x=>`<option value="${window.esc(x.code)}">${window.esc(x.name)}</option>`).join('')}</select></label><label>Meta<input class="field" name="meta" type="number" min="1" value="1" required></label><label>Período<input class="field" name="periodo" type="month" value="${period}" required></label><div class="full"><button class="btn primary" ${roster.length?'':'disabled'}>Guardar programación</button></div></form></div></div>`;
      const form=document.getElementById('v1514LeadGoal');
      form.onsubmit=async e=>{
        e.preventDefault();const o=Object.fromEntries(new FormData(form)),[y,m]=o.periodo.split('-').map(Number),usr=form.programado_user_id.selectedOptions[0],ctrl=controls.find(x=>x.code===o.control_codigo),name=(usr?.textContent||'').replace(/ · .*/,''),userRole=usr?.dataset.role||'';
        const payload={programado_user_id:o.programado_user_id,programado_nombre:name,programado_rol:userRole,supervisor_user_id:userRole==='supervisor'?o.programado_user_id:null,supervisor_nombre:userRole==='supervisor'?name:null,control_codigo:o.control_codigo,control_nombre:ctrl?.name||o.control_codigo,meta:Number(o.meta)||1,anio:y,mes:m,created_by:window.state.session.user.id};
        const found=await window.sb.from('liderazgo_programacion').select('id').eq('programado_user_id',payload.programado_user_id).eq('control_codigo',payload.control_codigo).eq('anio',y).eq('mes',m).limit(1);
        if(found.error)return window.toast?.(found.error.message,'error');
        let error;if(found.data?.length){({error}=await window.sb.from('liderazgo_programacion').update(payload).eq('id',found.data[0].id))}else{({error}=await window.sb.from('liderazgo_programacion').insert(payload))}
        if(error)return window.toast?.(error.message,'error');
        window.v1512Audit?.('liderazgo','programar_control',payload.programado_user_id,payload);window.closeModal();window.state.leadershipYear=y;window.state.leadershipMonth=m;await window.renderLiderazgoV95();window.toast?.('Programación guardada','success');
      };
    };
    window.openLeadershipGoalV95=open;
    try{openLeadershipGoalV95=open}catch(_){}
  }

  install();
  window.addEventListener('stainher:modules-ready',install);
  window.StainherAccessLeadershipR107=Object.freeze({install,canManage});
})();
