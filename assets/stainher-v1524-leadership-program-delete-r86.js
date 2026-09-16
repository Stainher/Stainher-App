/* Stainher V15.24 · R86 · acción visible para eliminar programación de Liderazgo.
 * Administrador/Prevención/Planificación con permiso de gestión pueden eliminar
 * una programación real; el borrado se verifica en Supabase antes de refrescar.
 */
(()=>{
  'use strict';
  const BUILD='20260916-r86-leadership-program-delete';
  if(window.__STAINHER_LEADERSHIP_PROGRAM_DELETE_R86__===BUILD)return;
  window.__STAINHER_LEADERSHIP_PROGRAM_DELETE_R86__=BUILD;
  const WRAP=Symbol('stainherLeadershipProgramDeleteR86');

  const canManage=()=>{try{return !!window.canManageLeadershipV11?.()}catch(_){return false}};

  window.v1524DeleteLeadershipGoal=async function(id){
    if(!canManage())return window.toast?.('No tienes permiso para eliminar programaciones.','error');
    if(!confirm('¿Eliminar esta actividad programada? Los indicadores se recalcularán automáticamente.'))return;
    try{
      const del=await window.sb.from('liderazgo_programacion').delete().eq('id',id).select('id');
      if(del.error)throw del.error;
      if(!Array.isArray(del.data)||del.data.length!==1)throw new Error('No se confirmó la eliminación de la programación.');
      const verify=await window.sb.from('liderazgo_programacion').select('id').eq('id',id).maybeSingle();
      if(verify.error)throw verify.error;
      if(verify.data)throw new Error('La programación continúa registrada en Supabase.');
      await window.renderLiderazgoV95?.();
      window.toast?.('Programación eliminada correctamente.','success');
    }catch(error){
      console.error('[Stainher Liderazgo R86] eliminar programación',error);
      window.toast?.(error?.message||'No se pudo eliminar la programación.','error');
    }
  };

  async function enhanceProgramming(){
    const section=document.getElementById('v1512Lead_programacion');
    if(!section||!canManage())return;
    const panel=[...section.querySelectorAll('.panel')].find(x=>/Programación de controles|Actividades programadas/i.test(x.querySelector('h3')?.textContent||''));
    const table=panel?.querySelector('table');
    if(!table)return;
    const data=typeof window.v1512LoadLeadershipData==='function'?await window.v1512LoadLeadershipData():null;
    if(!data||data.error)return;
    const goals=data.goals||[];
    const head=table.querySelector('thead tr');
    let actionIndex=[...head?.children||[]].findIndex(x=>x.textContent.trim()==='Acciones');
    if(actionIndex<0&&head){const th=document.createElement('th');th.textContent='Acciones';head.appendChild(th);actionIndex=head.children.length-1;}
    table.querySelectorAll('tbody tr').forEach((tr,index)=>{
      const goal=goals[index];
      if(!goal?.id)return;
      let td=actionIndex>=0?tr.children[actionIndex]:null;
      if(!td){td=document.createElement('td');tr.appendChild(td);}
      if(td.querySelector('[data-r86-delete-goal]'))return;
      const box=document.createElement('div');box.className='v1523-lead-record-actions';
      const btn=document.createElement('button');btn.type='button';btn.className='action-mini';btn.dataset.r86DeleteGoal='1';btn.textContent='Eliminar';btn.style.color='#fca5a5';btn.style.borderColor='#7f1d1d';btn.onclick=()=>window.v1524DeleteLeadershipGoal(goal.id);
      box.appendChild(btn);td.appendChild(box);
    });
  }

  function wrapRender(){
    const current=window.renderLiderazgoV95;
    if(typeof current!=='function'||current[WRAP])return;
    const wrapped=async function(){const out=await current.apply(this,arguments);try{await enhanceProgramming()}catch(error){console.warn('[Stainher Liderazgo R86] acción eliminar programación',error)}return out};
    wrapped[WRAP]=true;wrapped.__base=current;window.renderLiderazgoV95=wrapped;
  }

  function install(){wrapRender();enhanceProgramming().catch(()=>{});}
  window.StainherLeadershipProgramDeleteR86=Object.freeze({install,enhance:enhanceProgramming,remove:window.v1524DeleteLeadershipGoal});
  install();
  window.addEventListener('stainher:modules-ready',()=>{install();setTimeout(install,120);setTimeout(install,900)},{once:true});
  [300,900,1800,3200].forEach(ms=>setTimeout(install,ms));
})();
