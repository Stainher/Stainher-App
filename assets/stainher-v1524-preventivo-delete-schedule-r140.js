/* Stainher V15.24 · R140 · Eliminar programación preventiva individual.
 * - Quita solo la fecha programada de una actividad aún no ejecutada.
 * - Conserva la actividad del Plan Matriz, frecuencia, equipo e historial.
 * - Devuelve la actividad a "Por calendarizar".
 * - Elimina la acción genérica "Eliminar" del listado para evitar borrar el registro.
 */
(()=>{
  'use strict';
  const BUILD='20260929-r140-preventivo-delete-schedule';
  if(window.__STAINHER_PREVENTIVO_DELETE_SCHEDULE_R140__===BUILD)return;
  window.__STAINHER_PREVENTIVO_DELETE_SCHEDULE_R140__=BUILD;

  let installTimer=null;

  const planner=()=>{
    try{return !!window.v1520Planner?.()}catch(_){return false}
  };

  function rowById(id){
    return (window.state?.v1520PrevRows||[]).find(row=>String(row.id)===String(id))||null;
  }

  function canDeleteSchedule(row){
    return planner()&&!!row?.fecha_programada&&!row?.fecha_ejecucion;
  }

  function stripLegacyDelete(html){
    return String(html||'')
      .replace(/<button\b[^>]*>\s*Eliminar\s*<\/button>/gi,'')
      .replace(/<button\b[^>]*aria-label=["']Eliminar["'][^>]*>[\s\S]*?<\/button>/gi,'');
  }

  function wrapActions(){
    const current=window.v1520PrevActions;
    if(typeof current!=='function')return false;
    if(current.__stainherPreventivoDeleteR140)return true;

    const wrapped=function(row){
      let html=stripLegacyDelete(current.apply(this,arguments)||'');
      if(canDeleteSchedule(row)&&!html.includes("v140DeletePreventiveSchedule('"+String(row.id)+"')")){
        html=html.replace(/<\/div>\s*$/,'')+
          '<button class="btn danger-btn" type="button" onclick="v140DeletePreventiveSchedule(\''+
          String(row.id)+
          '\')">Eliminar programación</button></div>';
      }
      return html;
    };
    wrapped.__stainherPreventivoDeleteR140=true;
    wrapped.__base=current;
    window.v1520PrevActions=wrapped;
    try{v1520PrevActions=wrapped}catch(_){}
    return true;
  }

  window.v140DeletePreventiveSchedule=function(id){
    if(!planner())return window.toast?.('Solo el Planificador puede eliminar una programación preventiva.','error');
    const row=rowById(id);
    if(!row)return window.toast?.('No se encontró la actividad preventiva.','error');
    if(row.fecha_ejecucion)return window.toast?.('Una actividad ejecutada conserva su programación como parte del historial.','warn');
    if(!row.fecha_programada)return window.toast?.('La actividad ya está por calendarizar.','warn');

    const escValue=value=>typeof window.esc==='function'?window.esc(value||''):String(value||'');
    const dateLabel=typeof window.v1520Date==='function'?window.v1520Date(row.fecha_programada):row.fecha_programada;
    const modal=document.getElementById('modalRoot');
    if(!modal)return;

    modal.innerHTML=`<div class="modal-bg"><div class="modal">
      <div class="row-between">
        <h3>Eliminar programación</h3>
        <button class="btn" type="button" onclick="closeModal()">Cerrar</button>
      </div>
      <div class="notice warn">
        <b>${escValue(row.equipos?.nombre||'Equipo')}</b><br>
        ${escValue(row.actividad||'Actividad preventiva')}<br>
        Fecha programada actual: <b>${escValue(dateLabel)}</b>
      </div>
      <div class="notice">
        La actividad <b>no será eliminada</b>. Se quitará únicamente la fecha programada y volverá a <b>Por calendarizar</b>.
      </div>
      <form id="v140DeletePreventiveScheduleForm" class="form-grid">
        <label class="full">Motivo
          <textarea class="field" name="motivo" rows="3" required placeholder="Indica por qué se elimina la programación"></textarea>
        </label>
        <div class="full">
          <button class="btn danger-btn" type="submit">Eliminar programación</button>
        </div>
      </form>
    </div></div>`;

    const form=document.getElementById('v140DeletePreventiveScheduleForm');
    form.onsubmit=async event=>{
      event.preventDefault();
      const motivo=String(new FormData(form).get('motivo')||'').trim();
      if(!motivo)return window.toast?.('Indica el motivo de la eliminación de programación.','error');

      const button=form.querySelector('button[type="submit"]');
      if(button){button.disabled=true;button.textContent='Eliminando…';}

      const previousDate=row.fecha_programada;
      try{
        const q=await window.sb
          .from('programacion_preventiva')
          .update({
            fecha_programada:null,
            estado:'pendiente',
            updated_at:new Date().toISOString()
          })
          .eq('id',row.id);
        if(q.error)throw q.error;

        try{
          window.v1512Audit?.('preventivo','eliminar_programacion_individual',String(row.id),{
            equipo_id:row.equipo_id||null,
            equipo:row.equipos?.nombre||null,
            actividad:row.actividad||null,
            anio:Number(row.anio)||null,
            mes:Number(row.mes)||null,
            fecha_programada_anterior:previousDate,
            motivo
          });
        }catch(error){
          console.warn('[Stainher R140] auditoría',error);
        }

        row.fecha_programada=null;
        row.estado='pendiente';
        window.closeModal?.();
        await window.renderPreventivo?.();
        window.toast?.('Programación eliminada. La actividad quedó Por calendarizar.','success');
      }catch(error){
        if(button){button.disabled=false;button.textContent='Eliminar programación';}
        window.toast?.('No se pudo eliminar la programación: '+(error.message||String(error)),'error');
      }
    };
  };

  function install(){
    if(wrapActions()){
      const page=document.getElementById('page-preventivo');
      if(page&&!page.classList.contains('hidden')){
        try{window.v1523RenderPreventiveContent?.()}catch(_){}
      }
      return true;
    }
    if(!installTimer){
      let tries=0;
      installTimer=setInterval(()=>{
        tries++;
        if(wrapActions()||tries>=120){
          clearInterval(installTimer);
          installTimer=null;
          if(tries<120){
            try{window.v1523RenderPreventiveContent?.()}catch(_){}
          }
        }
      },100);
    }
    return false;
  }

  window.StainherPreventivoDeleteScheduleR140=Object.freeze({
    install,
    canDeleteSchedule,
    version:BUILD
  });

  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:preventivo-state-r137-ready',install);
  window.addEventListener('stainher:runtime-r138-ready',install);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
