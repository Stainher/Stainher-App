/* Stainher App V15.24 · licencia médica en Turnos y Novedades, no en Solicitudes. */
(()=>{
  'use strict';
  const allowed=()=>['administrador','recursos_humanos'].includes(String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase())&&!window.state?.v15PreviewRole;
  const escHtml=value=>typeof window.esc==='function'?window.esc(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const today=()=>new Date().toISOString().slice(0,10);
  async function open(){
    if(!allowed())return window.toast?.('Solo Administrador o Recursos Humanos pueden registrar licencias médicas.','error');
    const q=await window.sb.from('dotacion_contrato').select('user_id,nombre,cargo,estado,aplica_turnos').eq('estado','activo').not('user_id','is',null).order('nombre');
    if(q.error)return window.toast?.('No se pudo cargar la dotación: '+q.error.message,'error');
    const people=(q.data||[]).filter(x=>x.user_id);
    document.getElementById('modalRoot').innerHTML=`<div class="modal-bg"><div class="modal"><div class="row-between"><h3>Registrar licencia médica</h3><button class="btn" type="button" onclick="closeModal()">Cerrar</button></div><form id="v1524MedicalLeaveForm" class="form-grid"><label class="full">Persona<select class="field" name="user_id" required><option value="">Seleccionar</option>${people.map(x=>`<option value="${escHtml(x.user_id)}">${escHtml(x.nombre)} · ${escHtml(x.cargo||'Sin cargo')}</option>`).join('')}</select></label><label>Desde<input class="field" name="fecha_inicio" type="date" value="${today()}" required></label><label>Hasta<input class="field" name="fecha_fin" type="date" value="${today()}" required></label><label class="full">Observación<textarea class="field" name="observacion" rows="3" required placeholder="Indica el antecedente o referencia de la licencia médica."></textarea></label><div class="full notice"><b>Registro directo:</b> la licencia se incorporará a Turnos y Novedades y descontará la disponibilidad operacional durante el período. No genera una solicitud ni modifica el saldo de vacaciones.</div><div class="full"><button class="btn primary" type="submit">Registrar licencia</button></div></form></div></div>`;
    const form=document.getElementById('v1524MedicalLeaveForm');
    form.onsubmit=async event=>{
      event.preventDefault();const values=Object.fromEntries(new FormData(form));
      if(values.fecha_inicio>values.fecha_fin)return window.toast?.('La fecha de término no puede ser anterior a la fecha de inicio.','error');
      const observation=String(values.observacion||'').trim();if(!observation)return window.toast?.('La observación es obligatoria.','error');
      const start=new Date(values.fecha_inicio+'T12:00:00');
      const payload={user_id:values.user_id,tipo:'licencia_medica',fecha_inicio:values.fecha_inicio,fecha_fin:values.fecha_fin,cantidad:1,unidad:'período',motivo:observation,observacion:observation,anio:start.getFullYear(),mes:start.getMonth()+1,aprobado_por:window.state.session.user.id,created_by:window.state.session.user.id};
      const result=await window.sb.from('turnos_novedades_v15').insert(payload);
      if(result.error){const duplicate=result.error.code==='23505';return window.toast?.(duplicate?'Ya existe una licencia médica para esa persona y el mismo período.':'No se pudo registrar la licencia médica: '+result.error.message,'error')}
      window.v1512Audit?.('turnos','registrar_licencia_medica',values.user_id,{desde:values.fecha_inicio,hasta:values.fecha_fin});
      window.closeModal?.();window.state.v1520TurnData=null;
      if(!document.getElementById('page-turnos')?.classList.contains('hidden'))await window.renderTurnosV15?.();
      if(!document.getElementById('page-solicitudes')?.classList.contains('hidden'))await window.renderSolicitudesV15?.();
      window.toast?.('Licencia médica registrada en Turnos y Novedades.','success');
    };
  }
  function install(){window.v15MedicalLeaveModal=open;window.v1524MedicalLeaveModal=open}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.addEventListener('stainher:modules-ready',install);
})();
