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
  // Group only the visible roster; preserve each person's original cells/actions.
  const matrix=w.v1520TurnMatrix;
  if(typeof matrix==='function'){
    w.v1520TurnMatrix=function(data,...args){
      const groups=[
        {title:'Personal técnico y supervisores',people:[]},
        {title:'Personal administrativo',people:[]},
        {title:'Prevención',people:[]}
      ];
      for(const person of data.people||[]){
        const cargo=norm(person.cargo);
        const group=/prevencion|\bapr\b/.test(cargo)?2:
          /administr|confiabilidad|planifica|programa|gerente|contador/.test(cargo)?1:0;
        groups[group].people.push(person);
      }
      if(!groups.some(group=>group.people.length))return matrix.call(this,data,...args);
      return groups.filter(group=>group.people.length).map(group=>
        `<section class="stainher-turn-personnel-group" style="margin:16px 0;min-width:0"><h4>${group.title} · ${group.people.length}</h4>${matrix.call(this,{...data,people:group.people},...args)}</section>`
      ).join('');
    };
  }

})();
