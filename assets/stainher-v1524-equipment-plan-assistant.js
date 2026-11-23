/* Stainher App V15.24 · asistente Plan Matriz al crear equipos. */
(()=>{
  'use strict';
  if(window.__STAINHER_EQUIPMENT_PLAN_ASSISTANT__)return;
  window.__STAINHER_EQUIPMENT_PLAN_ASSISTANT__=true;
  const TYPES=['Eléctrica','Mecánica','Inspección','Lubricación','Certificación','Seguridad','General'];
  const FREQS=['Semanal','Quincenal','Mensual','Bimestral','Trimestral','Semestral','Anual','Según plan'];
  const currentMonth=()=>new Date().toISOString().slice(0,7);
  const esc=value=>typeof window.esc==='function'?window.esc(String(value??'')):String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function suggestions(type=''){
    const lift=/ascensor|elevador|jaula|montacarga|huinche/i.test(type);
    return (lift?[
      ['Eléctrica','Inspección y mantenimiento del sistema eléctrico','Mensual'],
      ['Mecánica','Inspección y mantenimiento de componentes mecánicos','Mensual'],
      ['Inspección','Revisión de sala de máquinas, accesorios, cables y estructura','Mensual'],
      ['Lubricación','Lubricación de componentes y puntos definidos por fabricante','Trimestral'],
      ['Seguridad','Prueba de dispositivos y circuitos de seguridad','Trimestral'],
      ['Certificación','Certificación del sistema de levante, cables y poleas','Anual']
    ]:[
      ['Inspección','Inspección general del equipo','Mensual'],
      ['Mecánica','Mantenimiento mecánico preventivo','Trimestral'],
      ['Eléctrica','Mantenimiento eléctrico preventivo','Trimestral'],
      ['Seguridad','Verificación de dispositivos de seguridad','Semestral'],
      ['Certificación','Certificación o revisión reglamentaria','Anual']
    ]).map(([tipo,actividad,frecuencia])=>({tipo_intervencion:tipo,actividad,frecuencia,mes_inicio:currentMonth()}));
  }
  function row(item={}){
    const node=document.createElement('div');node.className='stainher-plan-assistant-row';
    if(item.id)node.dataset.activityId=item.id;
    node.innerHTML=`<label>Intervención<select class="field" data-plan="tipo">${TYPES.map(x=>`<option ${x===(item.tipo_intervencion||'General')?'selected':''}>${x}</option>`).join('')}</select></label><label>Actividad<input class="field" data-plan="actividad" value="${esc(item.actividad||'')}" placeholder="Actividad preventiva" required></label><label>Frecuencia<select class="field" data-plan="frecuencia">${FREQS.map(x=>`<option ${x===(item.frecuencia||'Mensual')?'selected':''}>${x}</option>`).join('')}</select></label><label>Mes de inicio<input class="field" data-plan="mes_inicio" type="month" value="${esc(item.mes_inicio||currentMonth())}" required></label><button class="btn danger-btn" type="button" aria-label="Eliminar actividad">Eliminar</button>`;
    node.querySelector('button').onclick=()=>node.remove();return node;
  }
  function fill(list,items){list.replaceChildren(...items.map(row))}
  function values(list){return [...list.querySelectorAll('.stainher-plan-assistant-row')].map(node=>({
    id:node.dataset.activityId || undefined,
    tipo_intervencion:node.querySelector('[data-plan="tipo"]').value,
    actividad:node.querySelector('[data-plan="actividad"]').value.trim(),
    frecuencia:node.querySelector('[data-plan="frecuencia"]').value,
    mes_inicio:node.querySelector('[data-plan="mes_inicio"]').value
  })).filter(x=>x.actividad)}
  function enhance(id=''){
    const form=document.getElementById('equipoForm');if(!form||form.dataset.planAssistant)return;
    if(id && (!canEditV11('equipos') || !canEditV11('preventivo') || !canPlan()))return;
    form.dataset.planAssistant='true';
    const section=document.createElement('section');section.className='full stainher-plan-assistant';
    section.innerHTML=`<div class="stainher-plan-assistant-head"><div><h4>Asistente de Plan Matriz</h4><span class="muted">Define cada intervención, su frecuencia y el mes desde el que aparecerá en Preventivo.</span></div><button class="btn" type="button" data-generate>Generar propuesta</button></div><div class="stainher-plan-assistant-list"></div><button class="btn" type="button" data-add>+ Agregar actividad</button>`;
    const submit=form.querySelector('button[type="submit"]')?.closest('.full');form.insertBefore(section,submit||null);
    const list=section.querySelector('.stainher-plan-assistant-list');
    if(id){
      section.querySelector('h4').textContent='Editar Plan Matriz';
      section.querySelector('[data-generate]').remove();
      const add=section.querySelector('[data-add]');
      const save=document.createElement('button');
      save.type='button';
      save.className='btn primary';
      save.textContent='Guardar plan de mantenimiento';
      section.append(save);
      add.disabled=save.disabled=true;
      list.textContent='Cargando actividades…';
      // El plan se guarda por separado del formulario de datos del equipo.
      const editableRow=item=>{
        const node=row(item);
        node.querySelectorAll('[required]').forEach(field=>{field.required=false;});
        return node;
      };
      add.onclick=()=>list.appendChild(editableRow({}));
      save.onclick=async ()=>{
        const activities=values(list);
        if(activities.length!==list.children.length || activities.some(activity=>!activity.mes_inicio)){
          window.toast?.('Completa la actividad y el mes de inicio de cada fila.','error');
          return;
        }
        if(!activities.length && !confirm('¿Quitar todas las actividades del Plan Matriz?'))return;
        save.disabled=add.disabled=true;
        try {
          const result=await window.sb.rpc('editar_plan_matriz_equipo',{p_equipo:id,p_actividades:activities});
          if(result.error)throw result.error;
          state.v1519PlanCatalogLoaded=false;
          if(form.isConnected) window.closeModal?.();
          await window.renderEquipos?.();
          window.toast?.('Plan de mantenimiento actualizado','success');
        } catch(error) {
          window.toast?.(error.message,'error');
        } finally {
          save.disabled=add.disabled=false;
        }
      };
      window.sb.from('plan_matriz_actividades')
        .select('id,tipo_intervencion,actividad,frecuencia,mes_inicio')
        .eq('equipo_id',id).eq('activo',true).order('created_at').order('id')
        .then(({data,error})=>{
          if(!section.isConnected)return;
          if(error){list.textContent='No se pudo cargar el Plan Matriz. '+error.message;return;}
          list.replaceChildren(...data.map(item=>editableRow({...item,mes_inicio:item.mes_inicio?.slice(0,7)})));
          add.disabled=save.disabled=false;
        });
      return;
    }
    fill(list,suggestions(form.elements.tipo?.value));
    section.querySelector('[data-generate]').onclick=()=>fill(list,suggestions(form.elements.tipo?.value));
    section.querySelector('[data-add]').onclick=()=>list.appendChild(row());
    form.onsubmit=async event=>{
      event.preventDefault();
      const activities=values(list);if(!activities.length)return window.toast?.('Agrega al menos una actividad al Plan Matriz.','error');
      const equipment=Object.fromEntries(new FormData(form));
      const button=form.querySelector('button[type="submit"]');if(button)button.disabled=true;
      const result=await window.sb.rpc('crear_equipo_con_plan_matriz_v1524',{p_equipo:equipment,p_actividades:activities});
      if(button)button.disabled=false;
      if(result.error)return window.toast?.(result.error.message,'error');
      await window.loadEquipos?.();window.state.v1519PlanCatalogLoaded=false;window.closeModal?.();await window.renderEquipos?.();await window.renderPreventivo?.();
      window.toast?.(`Equipo y Plan Matriz creados · ${activities.length} actividades`,'success');
    };
  }
  function install(){
    const current=window.openEquipoModal;if(typeof current!=='function'||current.__stainherPlanAssistant)return;
    const wrapped=function(id=''){const result=current.apply(this,arguments);requestAnimationFrame(()=>enhance(id));return result};
    wrapped.__stainherPlanAssistant=true;window.openEquipoModal=wrapped;
  }
  function installCatalog(){
    const current=window.v1519LoadPlanCatalog;
    if(typeof current!=='function'||current.__stainherCatalog)return;
    let catalog;
    const wrapped=async function(){
      const state=window.state;
      if(catalog && state.v1519PlanCatalogLoaded && state.v1519PlanCatalog===catalog)return catalog;
      const active=new Map();
      const pageSize=500;
      for(let offset=0;;offset+=pageSize){
        const {data,error}=await window.sb.from('plan_matriz_actividades')
          .select('equipo_id,actividad,frecuencia').eq('activo',true).order('id')
          .range(offset,offset+pageSize-1);
        if(error){
          window.toast?.('No se pudo cargar el Plan Matriz de Equipos.','error');
          return catalog ?? new Map();
        }
        for(const item of data){
          const key=String(item.equipo_id);
          if(!active.has(key))active.set(key,[]);
          active.get(key).push([item.actividad,item.frecuencia]);
        }
        if(data.length<pageSize)break;
      }
      catalog=active;
      state.v1519PlanCatalog=catalog;
      state.v1519PlanCatalogLoaded=true;
      return catalog;
    };
    wrapped.__stainherCatalog=true;
    window.v1519LoadPlanCatalog=wrapped;
    window.v1519EquipoPlanCount=id=>catalog?.get(String(id))?.length ?? 0;
  }

  function installPreventiveFilter(){
    const current=window.v1520LoadPreventivo;
    if(typeof current!=='function'||current.__stainherPlanMatrixOnly)return;
    const wrapped=async function(){
      const {key}=v1523PreventiveEdpPeriod();
      const month=key+'-01';
      const now=new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit'})
        .formatToParts(new Date());
      const currentMonth=now.find(part=>part.type==='year').value+'-'+now.find(part=>part.type==='month').value;
      if(v1520Planner() && key>=currentMonth){
        const {error}=await window.sb.rpc('generar_periodo_plan_matriz',{p_periodo:month});
        if(error)throw error;
      }
      const [rows,catalog]=await Promise.all([
        current.apply(this,arguments),
        window.v1519LoadPlanCatalog()
      ]);
      return rows.filter(row=>catalog.get(String(row.equipo_id))
        ?.some(([activity])=>activity===row.actividad));
    };
    wrapped.__stainherPlanMatrixOnly=true;
    window.v1520LoadPreventivo=wrapped;
  }
  function style(){if(document.getElementById('stainher-plan-assistant-style'))return;const node=document.createElement('style');node.id='stainher-plan-assistant-style';node.textContent=`
    .stainher-plan-assistant{display:grid;gap:12px;padding:14px;border:1px solid var(--line);border-radius:14px;background:var(--panel2)}
    .stainher-plan-assistant-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px}.stainher-plan-assistant-head h4{margin:0 0 4px}
    .stainher-plan-assistant-list{display:grid;gap:10px}.stainher-plan-assistant-row{display:grid;grid-template-columns:minmax(125px,.75fr) minmax(210px,1.45fr) minmax(120px,.7fr) minmax(145px,.8fr) auto;gap:9px;align-items:end;padding:10px;border:1px solid var(--line);border-radius:10px;background:var(--panel)}
    .stainher-plan-assistant-row label{min-width:0}.stainher-plan-assistant-row .field{width:100%}
    .stainher-plan-assistant-row button{min-width:92px;white-space:nowrap}
    @media(max-width:980px){.stainher-plan-assistant-row{grid-template-columns:repeat(2,minmax(0,1fr))}.stainher-plan-assistant-row label:nth-child(2){grid-column:1/-1}.stainher-plan-assistant-row button{width:100%}}
    @media(max-width:760px){.stainher-plan-assistant-head{display:grid}.stainher-plan-assistant-row{grid-template-columns:1fr}.stainher-plan-assistant-row label:nth-child(2){grid-column:auto}.stainher-plan-assistant-row button{width:100%}}
  `;document.head.appendChild(node)}
  function boot(){style();install();installCatalog();installPreventiveFilter();window.addEventListener('stainher:modules-ready',()=>{install();installCatalog();installPreventiveFilter()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
