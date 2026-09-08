/* Jornadas permanentes administrativas informadas para la malla. */
(()=>{
  'use strict';
  const GROUP_ID='jornadas-administrativas',GROUP_NAME='Jornadas administrativas permanentes';
  const norm=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  const mondayFriday=person=>norm(person?.nombre).includes('juan ignacio soto');
  const mondayThursday=person=>{const name=norm(person?.nombre),cargo=norm(person?.cargo);return name.includes('jose antonio humberto cisternas')||/expert[oa].*prevencion/.test(cargo)};
  const fixed=person=>mondayFriday(person)||mondayThursday(person);
  const isoDates=(start,end)=>{const out=[];for(let date=new Date(start+'T12:00:00'),last=new Date(end+'T12:00:00');date<=last;date.setDate(date.getDate()+1))out.push(date.toISOString().slice(0,10));return out};
  const shiftFor=(person,date)=>{const day=new Date(date+'T12:00:00').getDay(),last=mondayFriday(person)?5:4;return day>=1&&day<=last?'A':'L'};
  function installTurnSchedule(){
    if(typeof window.v1520LoadTurnData==='function'&&!window.v1520LoadTurnData.__fixedMondayThursday){
      const base=window.v1520LoadTurnData;const wrapped=async function(){const data=await base.apply(this,arguments),all=data.allPeople||[],people=all.filter(person=>person.estado==='activo'&&person.user_id&&fixed(person)),selected=String(window.state?.turnGroupV1512||'');if(!data.groups.some(group=>group[0]===GROUP_ID))data.groups.push([GROUP_ID,GROUP_NAME]);if(!selected||selected===GROUP_ID){const map=new Map((selected===GROUP_ID?[]:data.people||[]).map(person=>[String(person.user_id),person]));people.forEach(person=>map.set(String(person.user_id),person));data.people=[...map.values()]}if((!selected||selected===GROUP_ID)&&people.length){data.shifts=data.shifts||[];const saved=new Set(data.shifts.map(row=>`${row.user_id}|${row.fecha}`));for(const person of people)for(const date of isoDates(data.range.start,data.range.end)){const key=`${person.user_id}|${date}`;if(!saved.has(key))data.shifts.push({user_id:person.user_id,fecha:date,turno_base:shiftFor(person,date),estado_publicacion:'publicado',observacion:mondayFriday(person)?'Jornada permanente lunes a viernes':'Jornada permanente lunes a jueves'})}}return data};wrapped.__fixedMondayThursday=true;window.v1520LoadTurnData=wrapped;
    }
    if(typeof window.v1513TurnEligible==='function'&&!window.v1513TurnEligible.__fixedMondayThursday){const base=window.v1513TurnEligible;const wrapped=person=>fixed(person)||base(person);wrapped.__fixedMondayThursday=true;window.v1513TurnEligible=wrapped}
  }
  function installHomeSchedule(){
    if(typeof window.renderInicio!=='function'||window.renderInicio.__fixedMondayThursday)return;
    const base=window.renderInicio;
    const wrapped=async function(){
      const out=await base.apply(this,arguments),date=new Date(),day=date.getDay();
      if(day<1||day>5||!window.sb)return out;
      try{
        const today=date.toISOString().slice(0,10),[peopleQ,eventsQ,shiftsQ]=await Promise.all([
          window.sb.from('dotacion_contrato').select('user_id,nombre,cargo,estado').eq('estado','activo').not('user_id','is',null),
          window.sb.from('turnos_novedades_v15').select('user_id,tipo').lte('fecha_inicio',today).gte('fecha_fin',today),
          window.sb.from('turnos_malla_v1512').select('user_id,turno_base').eq('fecha',today)
        ]);
        if(peopleQ.error||eventsQ.error||shiftsQ.error)return out;
        const absent=new Set((eventsQ.data||[]).filter(event=>['vacaciones','licencia_medica','permiso','falta'].includes(event.tipo)).map(event=>String(event.user_id))),saved=new Map((shiftsQ.data||[]).map(row=>[String(row.user_id),row.turno_base])),people=(peopleQ.data||[]).filter(person=>fixed(person)&&(saved.get(String(person.user_id))||shiftFor(person,today))==='A'&&!absent.has(String(person.user_id))),section=[...document.querySelectorAll('#page-inicio .v1522-home-group')].find(node=>/^Turno A\b/.test(node.querySelector('h4')?.textContent||'')),grid=section?.querySelector('.v1522-home-grid');
        if(!grid)return out;
        for(const person of people){if(grid.textContent.includes(person.nombre))continue;grid.insertAdjacentHTML('beforeend',`<div class="v1522-home-person"><b>${window.esc?.(person.nombre)||person.nombre}</b><small>${window.esc?.(person.cargo)||person.cargo} · ${mondayFriday(person)?'jornada L–V':'jornada L–J'}</small></div>`)}
        const title=section.querySelector('h4');if(title)title.textContent=`Turno A · ${grid.querySelectorAll('.v1522-home-person').length}`
      }catch(error){console.warn('[jornadas-administrativas]',error)}
      return out
    };
    wrapped.__fixedMondayThursday=true;window.renderInicio=wrapped;
  }
  installTurnSchedule();installHomeSchedule();
})();
