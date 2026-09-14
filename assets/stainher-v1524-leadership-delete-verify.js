/* Stainher V15.24 · eliminación verificada de programaciones de Liderazgo. */
(()=>{
  'use strict';
  if(window.__STAINHER_LEADERSHIP_DELETE_VERIFY__)return;
  window.__STAINHER_LEADERSHIP_DELETE_VERIFY__=true;

  async function refreshLeadership(){
    if(typeof window.renderLiderazgoV95==='function'){
      await window.renderLiderazgoV95();
      return;
    }
    if(typeof window.loadLeadershipSummaryV95==='function')await window.loadLeadershipSummaryV95();
  }

  window.deleteLeadershipGoalV11=async function(id){
    if(!window.canManageLeadershipV11?.())return;
    if(!confirm('¿Eliminar esta actividad programada? Los contadores se actualizarán automáticamente.'))return;
    try{
      const del=await window.sb.from('liderazgo_programacion')
        .delete()
        .eq('id',id)
        .select('id');
      if(del.error)throw del.error;
      if(!Array.isArray(del.data)||del.data.length!==1){
        throw new Error('La programación no fue eliminada. No se confirmó ninguna fila afectada.');
      }
      const verify=await window.sb.from('liderazgo_programacion').select('id').eq('id',id).maybeSingle();
      if(verify.error)throw verify.error;
      if(verify.data)throw new Error('La programación continúa registrada. Recarga y vuelve a intentar.');
      await refreshLeadership();
      window.toast?.('Programación eliminada correctamente.','success');
    }catch(error){
      console.error('[Stainher] eliminación programación Liderazgo',error);
      window.toast?.(error?.message||'No se pudo eliminar la programación.','error');
    }
  };
})();
