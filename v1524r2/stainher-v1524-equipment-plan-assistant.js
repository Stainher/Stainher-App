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
    node.innerHTML=`<label>Intervención<select class="field" data-plan="tipo">${TYPES.map(x=>`<option ${x===(item.tipo_intervencion||'General')?'selected':''}>${x}</option>`).join('')}</select></label><label>Actividad<input class="field" data-plan="actividad" value="${esc(item.actividad||'')}" placeholder="Actividad preventiva" required></label><label>Frecuencia<select class="field" data-plan="frecuencia">${FREQS.map(x=>`<option ${x===(item.frecuencia||'Mensual')?'selected':''}>${x}</option>`).join('')}</select></label><label>Mes de inicio<input class="field" data-plan="mes_inicio" type="month" value="${esc(item.mes_inicio||currentMonth())}" required></label><button class="btn danger-btn" type="button" aria-label="Eliminar actividad">Eliminar</button>`;
    node.querySelector('button').onclick=()=>node.remove();return node;
  }
  function fill(list,items){list.replaceChildren(...items.map(row))}
  function values(list){return [...list.querySelectorAll('.stainher-plan-assistant-row')].map(node=>({
    tipo_intervencion:node.querySelector('[data-plan="tipo"]').value,
    actividad:node.querySelector('[data-plan="actividad"]').value.trim(),
    frecuencia:node.querySelector('[data-plan="frecuencia"]').value,
    mes_inicio:node.querySelector('[data-plan="mes_inicio"]').value
  })).filter(x=>x.actividad)}
  function enhance(id=''){
    if(id)return;
    const form=document.getElementById('equipoForm');if(!form||form.dataset.planAssistant)return;
    form.dataset.planAssistant='true';
    const section=document.createElement('section');section.className='full stainher-plan-assistant';
    section.innerHTML=`<div class="stainher-plan-assistant-head"><div><h4>Asistente de Plan Matriz</h4><span class="muted">Define cada intervención, su frecuencia y el mes desde el que aparecerá en Preventivo.</span></div><button class="btn" type="button" data-generate>Generar propuesta</button></div><div class="stainher-plan-assistant-list"></div><button class="btn" type="button" data-add>+ Agregar actividad</button>`;
    const submit=form.querySelector('button[type="submit"]')?.closest('.full');form.insertBefore(section,submit||null);
    const list=section.querySelector('.stainher-plan-assistant-list');
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
    const current=window.v1519LoadPlanCatalog;if(typeof current!=='function'||current.__stainherCatalog)return;
    const wrapped=async function(){
      const map=await current.apply(this,arguments);const query=await window.sb.from('plan_matriz_actividades').select('equipo_id,actividad,frecuencia,mes_inicio').eq('activo',true);
      if(!query.error)(query.data||[]).forEach(item=>{const key=String(item.equipo_id),rows=map.get(key)||[];if(!rows.some(x=>String(x[0]).trim().toLowerCase()===String(item.actividad).trim().toLowerCase()))rows.push([item.actividad,item.frecuencia]);map.set(key,rows)});
      window.state.v1519PlanCatalog=map;return map;
    };wrapped.__stainherCatalog=true;window.v1519LoadPlanCatalog=wrapped;
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
  function boot(){style();install();installCatalog();window.addEventListener('stainher:modules-ready',()=>{install();installCatalog()})}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
