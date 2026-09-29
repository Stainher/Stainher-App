/* Stainher V15.24 · R139 · Visibilidad de turnos programados para perfiles operativos.
 * Corrige el filtro frontend que ocultaba registros estado_publicacion='borrador'
 * a Planificador, Confiabilidad y Prevención aunque Supabase sí permite leerlos.
 * Estos perfiles mantienen permiso solo lectura según tipos_perfil_v1517.
 */
(()=>{
  'use strict';
  const BUILD='20260929-r139-turn-draft-visibility';
  if(window.__STAINHER_TURN_DRAFT_VISIBILITY_R139__===BUILD)return;
  window.__STAINHER_TURN_DRAFT_VISIBILITY_R139__=BUILD;

  const DRAFT_VIEW_ROLES=new Set(['administrador','planificador','confiabilidad','prevencion']);
  let installTimer=null;

  const role=()=>{
    try{return String(window.v11Role?.()||window.state?.profile?.rol||'').toLowerCase()}
    catch(_){return ''}
  };

  const canSeeProgrammedDrafts=()=>{
    const r=role();
    if(DRAFT_VIEW_ROLES.has(r))return true;
    return !!window.v1520CanEdit?.('turnos')&&!window.state?.v15PreviewRole;
  };

  function eventDates(ev,from,to){
    const out=[];
    let start=String(ev?.fecha_inicio||'');
    let end=String(ev?.fecha_fin||ev?.fecha_inicio||'');
    if(!start||!end)return out;
    if(start<from)start=from;
    if(end>to)end=to;
    if(start>end)return out;
    for(let d=new Date(start+'T12:00:00'),last=new Date(end+'T12:00:00');d<=last;d.setDate(d.getDate()+1)){
      out.push(`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`);
    }
    return out;
  }

  function eventHasPublishedDate(ev,publishedKeys,from,to){
    return eventDates(ev,from,to).some(date=>publishedKeys.has(`${ev.user_id}|${date}`));
  }

  function resolveBaseLoader(){
    const current=window.v1520LoadTurnData;
    if(typeof current!=='function')return null;
    if(current.__r139TurnDraftVisibility)return current.__base||null;
    if(current.__v1524visibility&&typeof current.__base==='function')return current.__base;
    return current;
  }

  function installLoader(){
    const current=window.v1520LoadTurnData;
    if(typeof current!=='function')return false;
    if(current.__r139TurnDraftVisibility)return true;

    const base=resolveBaseLoader();
    if(typeof base!=='function')return false;

    const wrapped=async function(){
      const data=(await base.apply(this,arguments))||{};
      const ids=new Set((data.people||[]).map(person=>String(person.user_id)));

      const allVisibleShifts=(data.shifts||[]).filter(shift=>ids.has(String(shift.user_id)));
      const allVisibleEvents=(data.events||[]).filter(event=>ids.has(String(event.user_id)));

      data.publication={
        published:allVisibleShifts.filter(shift=>shift.estado_publicacion==='publicado').length,
        draft:allVisibleShifts.filter(shift=>shift.estado_publicacion!=='publicado').length
      };

      if(canSeeProgrammedDrafts()){
        data.shifts=allVisibleShifts;
        data.events=allVisibleEvents;
      }else{
        data.shifts=allVisibleShifts.filter(shift=>shift.estado_publicacion==='publicado');
        const publishedKeys=new Set(data.shifts.map(shift=>`${shift.user_id}|${shift.fecha}`));
        data.events=allVisibleEvents.filter(event=>eventHasPublishedDate(event,publishedKeys,data.range.start,data.range.end));
      }

      data.r139DraftVisibility={
        role:role(),
        includesDrafts:canSeeProgrammedDrafts()
      };
      return data;
    };

    wrapped.__r139TurnDraftVisibility=true;
    wrapped.__v1524visibility=true;
    wrapped.__base=base;
    window.v1520LoadTurnData=wrapped;
    return true;
  }

  async function refreshVisibleTurnPage(){
    const page=document.getElementById('page-turnos');
    if(!page||page.classList.contains('hidden')||page.hidden)return;
    try{await window.renderTurnosV15?.()}catch(error){console.warn('[Stainher R139] refresco Turnos',error)}
  }

  function install(){
    if(installLoader()){
      refreshVisibleTurnPage();
    }else if(!installTimer){
      let tries=0;
      installTimer=setInterval(()=>{
        tries++;
        if(installLoader()||tries>=120){
          clearInterval(installTimer);
          installTimer=null;
          if(tries<120)refreshVisibleTurnPage();
        }
      },100);
    }
  }

  window.StainherTurnDraftVisibilityR139=Object.freeze({
    install,
    canSeeProgrammedDrafts,
    roles:[...DRAFT_VIEW_ROLES],
    version:BUILD
  });

  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:runtime-r138-ready',install);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});
  else install();
})();
