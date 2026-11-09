/* Edición de intervenciones desde el historial de Correctivo. */
(()=>{
 'use strict';

 const editable=()=>!!state.session&&state.profile?.activo!==false&&v1520CanEdit('correctivo');
 const fields=['equipo_id','equipo_original','numero_guia','supervisor_tecnico','fecha_inicio','hora_inicio',
  'fecha_termino','hora_termino','estado_final','observaciones','duracion_minutos','clave_unica',
  'fecha_hora_falla','fecha_hora_restitucion'];
 const dateFields=['fecha_inicio','hora_inicio','fecha_termino','hora_termino'];
 const keyFields=['equipo_original','numero_guia',...dateFields];
 const owns=(row,key)=>Object.hasOwn(row,key);
 const stamp=(date,time)=>date&&time?date+'T'+(time.length===5?time+':00':time):null;
 const timeValue=value=>/^\d{2}:\d{2}/.test(value||'')?value.slice(0,5):parseHora(value)||'';

 function renderForm(form,row){
  const equipment=(state.equipos||[]).filter(e=>e.estado!=='retirado'||e.id===row.equipo_id);
  const equipmentMissing=!equipment.some(e=>e.id===row.equipo_id);
  const currentName=row.equipo_original||'Equipo sin vincular';
  const statuses=[...new Set([row.estado_final||'','Operativo','Operativo con observaciones','Fuera de servicio'])];
  const input=(name,label,type='text',required=false)=>{
   const value=type==='time'?timeValue(row[name]):row[name];
   return `<label>${label}<input class="field" name="${name}" type="${type}" value="${esc(value)}"${required?' required':''}></label>`;
  };
  form.innerHTML=`<h3 class="full" id="corrEditHeadingR402">Editar intervención</h3>
   <label class="full">Equipo<select class="field" name="equipo_id">
    ${equipmentMissing?`<option value="${esc(row.equipo_id)}" selected>${esc(currentName)}</option>`:''}
    ${equipment.map(e=>`<option value="${esc(e.id)}"${e.id===row.equipo_id?' selected':''}>${esc(e.nombre)}</option>`).join('')}
   </select></label>
   ${input('numero_guia','N.º de guía')}${input('supervisor_tecnico','Responsable')}
   ${input('fecha_inicio','Fecha de inicio','date',true)}${input('hora_inicio','Hora de inicio','time',true)}
   ${input('fecha_termino','Fecha de término','date')}${input('hora_termino','Hora de término','time')}
   <label class="full">Estado final<select class="field" name="estado_final">
    ${statuses.map(s=>`<option value="${esc(s)}"${s===(row.estado_final||'')?' selected':''}>${esc(s||'Sin estado')}</option>`).join('')}
   </select></label>
   <label class="full">Observaciones<textarea class="field" name="observaciones" rows="4"></textarea></label>
   <p class="full notice error hidden" role="alert"></p>
   <div class="full actions"><button type="submit" class="btn primary">Guardar cambios</button>
    <button type="button" class="btn" data-corr-edit-cancel>Cancelar</button></div>`;
  form.elements.observaciones.value=row.observaciones??'';
 }

 function buildPatch(row,initial,current){
  const patch={};
  for(const name of ['numero_guia','supervisor_tecnico','estado_final','observaciones',...dateFields]){
   if(initial[name]!==current[name])patch[name]=current[name].trim()||null;
  }
  if(initial.equipo_id!==current.equipo_id){
   const team=(state.equipos||[]).find(e=>e.id===current.equipo_id&&e.estado!=='retirado');
   if(!team)throw new Error('Selecciona un equipo disponible.');
   patch.equipo_id=team.id;
   patch.equipo_original=team.nombre;
  }
  if(dateFields.some(key=>owns(patch,key))){
   const {fecha_inicio,fecha_termino,hora_inicio,hora_termino}=current;
   if(!fecha_inicio||!hora_inicio||Boolean(fecha_termino)!==Boolean(hora_termino)){
    throw new Error('Completa la fecha y hora de inicio. Si ingresas un término, completa ambos campos.');
   }
   const duration=calcDuracionMin(fecha_inicio,hora_inicio,fecha_termino,hora_termino);
   if(fecha_termino&&duration===null)throw new Error('El término no puede ser anterior al inicio.');
   patch.duracion_minutos=duration;
   if(owns(patch,'fecha_inicio')||owns(patch,'hora_inicio'))patch.fecha_hora_falla=stamp(fecha_inicio,hora_inicio);
   if(owns(patch,'fecha_termino')||owns(patch,'hora_termino'))patch.fecha_hora_restitucion=stamp(fecha_termino,hora_termino);
  }
  // Los reemplazos masivos identifican cada fila con una clave propia de la importación.
  if(keyFields.some(key=>owns(patch,key))&&!row.clave_unica?.startsWith('r364-')){
   patch.clave_unica=makeClave({...row,...patch});
  }
  return patch;
 }

 function showError(form,message){
  const status=form.querySelector('[role="alert"]');
  status.textContent=message;
  status.classList.remove('hidden');
 }

 async function save(form,row,initial){
  if(!editable()||!form.isConnected||form.getAttribute('aria-busy')==='true')return;
  const current=Object.fromEntries(new FormData(form));
  const buttons=[...form.querySelectorAll('button')];
  try{
   const patch=buildPatch(row,initial,current);
   if(!Object.keys(patch).length){form.querySelector('[data-corr-edit-cancel]').click();return}
   form.querySelector('[role="alert"]').classList.add('hidden');
   form.setAttribute('aria-busy','true');
   buttons.forEach(button=>{button.disabled=true});
   let query=sb.from('averias').update(patch).eq('id',row.id);
   const compared=new Set(Object.keys(patch));
   if(owns(patch,'duracion_minutos'))dateFields.forEach(key=>compared.add(key));
   if(owns(patch,'clave_unica'))keyFields.forEach(key=>compared.add(key));
   for(const key of compared){
    query=row[key]==null?query.is(key,null):query.eq(key,row[key]);
   }
   const {data,error}=await query.select('id').maybeSingle();
   if(error)throw new Error(error.code==='23505'?'Ya existe una intervención con el mismo equipo, guía y horario.':error.message);
   if(!data)throw new Error('El registro cambió o ya no está disponible. Cancela y vuelve a abrir la edición.');
   const refresh=form.isConnected;
   form.remove();
   if(refresh){
    try{await loadCorrectivo()}
    catch{toast('Cambios guardados. Actualiza el listado para verlos.','warn');return}
   }
   toast('Intervención actualizada.','success');
  }catch(error){
   showError(form,error.message||'No se pudo guardar la intervención.');
  }finally{
   form.removeAttribute('aria-busy');
   buttons.forEach(button=>{button.disabled=false});
  }
 }

 async function open(button){
  if(!editable())return;
  const list=button.closest('table')?.parentElement||button.closest('.corr-r12-grid');
  const host=button.closest('#corrBody');
  if(!host||!list)return;
  const prior=host.querySelector('[data-corr-edit-form]');
  if(prior?.getAttribute('aria-busy')==='true')return;
  prior?.remove();
  const form=document.createElement('form');
  form.className='panel form-grid';
  form.dataset.corrEditForm='';
  form.setAttribute('aria-labelledby','corrEditHeadingR402');
  form.innerHTML='<p class="full" role="status">Cargando intervención…</p>';
  list.before(form);
  try{
   const {data,error}=await sb.from('averias').select(['id',...fields].join(',')).eq('id',button.dataset.corrEditId).maybeSingle();
   if(!form.isConnected)return;
   if(error||!data||!editable())throw new Error(error?.message||'La intervención ya no está disponible para editar.');
   renderForm(form,data);
   const initial=Object.fromEntries(new FormData(form));
   form.onsubmit=event=>{event.preventDefault();void save(form,data,initial)};
   form.querySelector('[data-corr-edit-cancel]').onclick=()=>{
    form.remove();
    [...host.querySelectorAll('[data-corr-edit-id]')].find(control=>
     control.dataset.corrEditId===button.dataset.corrEditId&&control.getClientRects().length)?.focus();
   };
   form.querySelector('select').focus();
  }catch(error){
   if(form.isConnected){form.remove();toast(error.message||'No se pudo abrir la intervención.','error')}
  }
 }

 document.addEventListener('click',event=>{
  const button=event.target.closest?.('#page-correctivo button[data-corr-edit-id]');
  if(button)void open(button);
 });
})();
