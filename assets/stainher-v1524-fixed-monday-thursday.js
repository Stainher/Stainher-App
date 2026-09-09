/* Legacy filename retained for loader compatibility. No automatic schedules. */
(()=>{
  'use strict';
  const w=window;
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const administrative=person=>/confiabilidad|expert[oa].*prevencion|planificacion|programacion/.test(norm(person?.cargo));
  if(typeof w.v1520LoadTurnData!=='function'||w.v1520LoadTurnData.__registeredSchedules)return;
  const base=w.v1520LoadTurnData;
  const wrapped=async function(...args){
    // Discard the retired synthetic group before loading the normal roster.
    if(w.state?.turnGroupV1512==='jornadas-administrativas')w.state.turnGroupV1512='';
    const data=await base.apply(this,args);
    const ids=(data.people||[]).filter(administrative).map(person=>String(person.user_id)).filter(Boolean);
    if(ids.length){
      // Absences are real events, independent of whether a shift was scheduled.
      // Use the authenticated client, normal visible roster and current range.
      const q=await w.sb.from('turnos_novedades_v15').select('*').in('user_id',ids).lte('fecha_inicio',data.range.end).gte('fecha_fin',data.range.start).order('fecha_inicio');
      if(q.error)throw q.error;
      const included=new Set(ids);
      data.events=[...(data.events||[]).filter(event=>!included.has(String(event.user_id))),...(q.data||[])];
    }
    return data;
  };
  wrapped.__registeredSchedules=true;
  w.v1520LoadTurnData=wrapped;
})();
