/* Stainher App V15.24 · asistente de formularios para controles personalizados.
 * Permite definir el tipo de respuesta por ítem y mantiene compatibilidad
 * con plantillas históricas tipo "evaluacion".
 */
(()=>{
  'use strict';
  if(window.__STAINHER_CUSTOM_CONTROL_BUILDER_V1__)return;
  window.__STAINHER_CUSTOM_CONTROL_BUILDER_V1__=true;

  const TYPES=Object.freeze({
    conforme:{label:'Conforme / No conforme / N/A'},
    aplica:{label:'Aplica / No aplica'},
    sino:{label:'Sí / No / N/A'},
    texto:{label:'Texto libre'},
    numero:{label:'Número'},
    fecha:{label:'Fecha'},
    seleccion:{label:'Selección personalizada'},
    seccion:{label:'Sección / encabezado'}
  });
  const TYPE_ALIASES=Object.freeze({
    evaluacion:'conforme',evaluation:'conforme',select:'seleccion',texto_libre:'texto',text:'texto',number:'numero',date:'fecha',section:'seccion'
  });

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalizeType=value=>{
    const raw=String(value||'evaluacion').trim().toLowerCase();
    const mapped=TYPE_ALIASES[raw]||raw;
    return TYPES[mapped]?mapped:'conforme';
  };
  const normalizeField=(field,index=0)=>({
    id:String(field?.id||`q${index+1}`),
    label:String(field?.label||field?.nombre||''),
    tipo:normalizeType(field?.tipo),
    requerido:normalizeType(field?.tipo)==='seccion'?false:field?.requerido!==false,
    opciones:Array.isArray(field?.opciones)?field.opciones.map(x=>String(x)).filter(Boolean):[],
    ayuda:String(field?.ayuda||field?.descripcion||'')
  });
  const canManage=()=>{try{return !!window.canManageLeadershipV11?.()}catch(_){return false}};
  const signatureReady=id=>{try{return typeof V12_SIG!=='undefined'&&!!V12_SIG?.[id]}catch(_){return false}};

  function mountStyle(){
    if(document.getElementById('stainher-custom-control-builder-style'))return;
    const style=document.createElement('style');
    style.id='stainher-custom-control-builder-style';
    style.textContent=`
      .v1524-builder-intro{margin:0 0 12px;padding:10px 12px;border:1px solid var(--line);border-radius:10px;background:var(--panel2);font-size:12px;color:var(--muted)}
      .v1524-builder-items{display:grid;gap:10px;margin-top:10px}
      .v1524-builder-row{border:1px solid var(--line);border-radius:10px;padding:10px;background:var(--panel2)}
      .v1524-builder-row-head{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(180px,.8fr) auto;gap:8px;align-items:end}
      .v1524-builder-row-extra{display:grid;grid-template-columns:minmax(0,1fr) minmax(0,1fr);gap:8px;margin-top:8px}
      .v1524-builder-row-actions{display:flex;gap:5px;align-items:center}
      .v1524-builder-row-actions .btn{min-width:34px!important;min-height:34px!important;padding:6px 8px!important}
      .v1524-builder-required{display:flex!important;align-items:center;gap:7px;min-height:40px;padding:0 4px}
      .v1524-builder-required input{width:auto!important}
      .v1524-builder-options.hidden,.v1524-builder-required.hidden{display:none!important}
      .v1524-builder-add{margin-top:10px}
      .v1524-form-field{display:grid;gap:6px;margin-bottom:12px}
      .v1524-form-field>span{font-size:12px;color:var(--text)}
      .v1524-form-field>small{font-size:10px;color:var(--muted)}
      .v1524-form-section{margin:16px 0 8px;padding:8px 10px;border-left:3px solid var(--blue);background:var(--panel2);border-radius:6px}
      .v1524-form-section h4{margin:0;font-size:14px}
      .v1524-generic-checklist{display:grid;gap:2px}
      @media(max-width:760px){
        .v1524-builder-row-head,.v1524-builder-row-extra{grid-template-columns:1fr}
        .v1524-builder-row-actions{justify-content:flex-end}
      }
    `;
    document.head.appendChild(style);
  }

  const typeOptions=selected=>Object.entries(TYPES).map(([value,item])=>`<option value="${value}" ${selected===value?'selected':''}>${esc(item.label)}</option>`).join('');
  function builderRow(field={}){
    const f=normalizeField(field,0),isCustom=f.tipo==='seleccion',isSection=f.tipo==='seccion';
    return `<div class="v1524-builder-row" data-builder-row>
      <div class="v1524-builder-row-head">
        <label>Pregunta / título<input class="field" data-builder-label value="${esc(f.label)}" placeholder="Ej.: ¿El equipo se encuentra en condiciones?"></label>
        <label>Tipo de respuesta<select class="field" data-builder-type>${typeOptions(f.tipo)}</select></label>
        <div class="v1524-builder-row-actions">
          <button type="button" class="btn" data-builder-up title="Subir">↑</button>
          <button type="button" class="btn" data-builder-down title="Bajar">↓</button>
          <button type="button" class="btn danger-btn" data-builder-remove title="Eliminar ítem">×</button>
        </div>
      </div>
      <div class="v1524-builder-row-extra">
        <label>Ayuda / instrucción opcional<input class="field" data-builder-help value="${esc(f.ayuda)}" placeholder="Texto breve que verá quien complete el control"></label>
        <label class="v1524-builder-options ${isCustom?'':'hidden'}">Opciones personalizadas<input class="field" data-builder-options value="${esc(f.opciones.join(' | '))}" placeholder="Opción 1 | Opción 2 | Opción 3"></label>
      </div>
      <label class="v1524-builder-required ${isSection?'hidden':''}"><input type="checkbox" data-builder-required ${f.requerido?'checked':''}> Respuesta obligatoria</label>
    </div>`;
  }

  function syncBuilderRow(row){
    const type=normalizeType(row.querySelector('[data-builder-type]')?.value);
    row.querySelector('.v1524-builder-options')?.classList.toggle('hidden',type!=='seleccion');
    row.querySelector('.v1524-builder-required')?.classList.toggle('hidden',type==='seccion');
    if(type==='seccion'){
      const req=row.querySelector('[data-builder-required]');if(req)req.checked=false;
    }
  }
  function bindBuilder(container){
    container.addEventListener('change',event=>{const row=event.target.closest?.('[data-builder-row]');if(row&&event.target.matches('[data-builder-type]'))syncBuilderRow(row)});
    container.addEventListener('click',event=>{
      const button=event.target.closest?.('button');if(!button)return;
      const row=button.closest('[data-builder-row]');if(!row)return;
      if(button.matches('[data-builder-remove]')){if(container.querySelectorAll('[data-builder-row]').length<=1)return window.toast?.('El formulario debe conservar al menos un ítem.','error');row.remove()}
      if(button.matches('[data-builder-up]')&&row.previousElementSibling)container.insertBefore(row,row.previousElementSibling);
      if(button.matches('[data-builder-down]')&&row.nextElementSibling)container.insertBefore(row.nextElementSibling,row);
    });
  }
  function collectBuilderFields(container){
    const rows=[...container.querySelectorAll('[data-builder-row]')];
    const fields=[];
    for(let i=0;i<rows.length;i++){
      const row=rows[i],label=String(row.querySelector('[data-builder-label]')?.value||'').trim(),tipo=normalizeType(row.querySelector('[data-builder-type]')?.value);
      if(!label)throw new Error(`Falta el texto del ítem ${i+1}.`);
      const ayuda=String(row.querySelector('[data-builder-help]')?.value||'').trim();
      const requerido=tipo==='seccion'?false:!!row.querySelector('[data-builder-required]')?.checked;
      let opciones=[];
      if(tipo==='seleccion'){
        opciones=String(row.querySelector('[data-builder-options]')?.value||'').split('|').map(x=>x.trim()).filter(Boolean);
        if(opciones.length<2)throw new Error(`El ítem “${label}” necesita al menos dos opciones separadas por |.`);
      }
      fields.push({id:`q${i+1}`,label,tipo,requerido,ayuda,opciones});
    }
    if(!fields.some(x=>x.tipo!=='seccion'))throw new Error('Agrega al menos un campo que solicite una respuesta.');
    return fields;
  }

  window.v1512OpenTemplateModal=function(){
    if(!canManage())return window.toast?.('No tienes permiso para crear controles.','error');
    mountStyle();
    const root=document.getElementById('modalRoot');if(!root)return;
    root.innerHTML=`<div class="modal-bg"><div class="modal modal-wide-v9">
      <div class="row-between"><div><h3>Crear Control Stainher</h3><div class="muted">Asistente de formulario personalizado</div></div><button class="btn" onclick="closeModal()">Cerrar</button></div>
      <form id="v1524CustomBuilderForm">
        <div class="v1524-builder-intro">Define cada pregunta y selecciona el tipo de respuesta que debe completar el usuario. Puedes mezclar listas, texto libre, números, fechas y secciones dentro del mismo control.</div>
        <div class="form-grid">
          <label class="full">Nombre del control<input class="field" name="nombre" required placeholder="Ej.: Fatiga y Somnolencia"></label>
          <label class="full">Descripción<textarea class="field" name="descripcion" rows="2" placeholder="Objetivo o alcance del control"></textarea></label>
          <label>Frecuencia<input class="field" name="frecuencia" placeholder="Ej.: Diaria, semanal, mensual"></label>
          <label>Programación<select class="field" name="requiere_programacion"><option value="false">Ejecución libre</option><option value="true">Requiere programación para Supervisor/Técnico</option></select></label>
        </div>
        <div class="row-between" style="margin-top:14px"><div><h4 style="margin:0">Campos del formulario</h4><div class="muted">Ordena los campos con ↑ y ↓.</div></div><button type="button" class="btn v1524-builder-add" data-builder-add>+ Agregar campo</button></div>
        <div id="v1524BuilderItems" class="v1524-builder-items">${builderRow({tipo:'sino',requerido:true})}</div>
        <div class="actions" style="justify-content:flex-end;margin-top:16px"><button class="btn primary">Crear control</button></div>
      </form>
    </div></div>`;
    const form=document.getElementById('v1524CustomBuilderForm'),items=document.getElementById('v1524BuilderItems');
    bindBuilder(items);
    form.querySelector('[data-builder-add]').addEventListener('click',()=>{items.insertAdjacentHTML('beforeend',builderRow({tipo:'sino',requerido:true}));syncBuilderRow(items.lastElementChild);items.lastElementChild.querySelector('[data-builder-label]')?.focus()});
    form.onsubmit=async event=>{
      event.preventDefault();
      try{
        const meta=Object.fromEntries(new FormData(form)),campos=collectBuilderFields(items),payload={
          codigo:`CUS-${Date.now()}`,
          nombre:String(meta.nombre||'').trim(),
          descripcion:String(meta.descripcion||'').trim(),
          frecuencia:String(meta.frecuencia||'').trim(),
          requiere_programacion:meta.requiere_programacion==='true',
          campos,
          created_by:window.state?.session?.user?.id
        };
        if(!payload.nombre)throw new Error('Ingresa el nombre del control.');
        const query=await window.sb.from('liderazgo_plantillas_v1512').insert(payload);if(query.error)throw query.error;
        try{window.v1512Audit?.('liderazgo','crear_plantilla_formulario',payload.codigo,{nombre:payload.nombre,campos:campos.length})}catch(_){ }
        window.closeModal?.();await window.renderLiderazgoV95?.();window.toast?.('Control personalizado creado.','success');
      }catch(error){window.toast?.(error?.message||'No se pudo crear el control.','error')}
    };
  };

  function responseControl(field,index){
    const f=normalizeField(field,index),name=`v1524q${index}`,required=f.requerido?' required':'',help=f.ayuda?`<small>${esc(f.ayuda)}</small>`:'';
    if(f.tipo==='seccion')return `<div class="v1524-form-section"><h4>${esc(f.label)}</h4>${help}</div>`;
    let control='';
    if(f.tipo==='texto')control=`<textarea class="field" name="${name}" rows="3"${required}></textarea>`;
    else if(f.tipo==='numero')control=`<input class="field" name="${name}" type="number" step="any"${required}>`;
    else if(f.tipo==='fecha')control=`<input class="field" name="${name}" type="date"${required}>`;
    else{
      let options=[];
      if(f.tipo==='aplica')options=['Aplica','No aplica'];
      else if(f.tipo==='sino')options=['Sí','No','N/A'];
      else if(f.tipo==='seleccion')options=f.opciones;
      else options=['Conforme','No conforme','N/A'];
      control=`<select class="field" name="${name}"${required}><option value="">Seleccionar</option>${options.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select>`;
    }
    return `<label class="v1524-form-field"><span>${esc(f.label)}${f.requerido?' *':''}</span>${help}${control}</label>`;
  }

  window.v1512OpenGenericControl=function(id){
    const template=(window.state?.v1512ControlTemplates||[]).find(x=>String(x.id)===String(id));if(!template)return window.toast?.('No se encontró el control.','error');
    mountStyle();
    const today=typeof window.v1512DateIso==='function'?window.v1512DateIso(new Date()):new Date().toISOString().slice(0,10),fields=(Array.isArray(template.campos)?template.campos:[]).map(normalizeField);
    const root=document.getElementById('modalRoot');if(!root)return;
    root.innerHTML=`<div class="modal-bg"><div class="modal modal-wide-v9">
      <div class="row-between"><div><h3>${esc(template.nombre)}</h3><div class="muted">${esc(template.descripcion||'')}</div></div><button class="btn" onclick="closeModal()">Cerrar</button></div>
      <form id="v1524GenericForm">
        <div class="section-v95"><div class="terrain-form-grid-v95"><label>Fecha<input class="field" name="fecha" type="date" value="${today}" required></label><label>Área / Equipo<input class="field" name="area"></label></div></div>
        <div class="section-v95"><h4>Formulario</h4><div class="v1524-generic-checklist">${fields.map(responseControl).join('')||'<div class="empty">Este control no tiene campos configurados.</div>'}</div></div>
        <div class="section-v95"><label>Observaciones generales<textarea class="field" name="obs" rows="4" style="width:100%"></textarea></label></div>
        <div class="section-v95 v1512-signature-frame"><h4>Firma</h4><canvas id="v1524GenericSig" class="v12-signature" width="1000" height="220"></canvas></div>
        <div class="actions" style="justify-content:flex-end"><button class="btn primary">Generar PDF y registrar</button></div>
      </form>
    </div></div>`;
    window.v12SetupSig?.('v1524GenericSig');window.v154InstallSignatureFullscreen?.('v1524GenericSig','Firma');
    const form=document.getElementById('v1524GenericForm');
    form.onsubmit=async event=>{
      event.preventDefault();
      try{
        if(!signatureReady('v1524GenericSig'))throw new Error('Debes firmar el control.');
        const values=Object.fromEntries(new FormData(form)),responses=fields.map((field,index)=>({field,index,value:String(values[`v1524q${index}`]??'').trim()})).filter(x=>x.field.tipo!=='seccion');
        const missing=responses.find(x=>x.field.requerido&&!x.value);if(missing)throw new Error(`Completa el campo “${missing.field.label}”.`);
        const rows=responses.map(x=>[x.field.label,x.value||'—']),hasNonConformity=responses.some(x=>x.value==='No conforme'),date=String(values.fecha||today),dt=new Date(date+'T12:00:00'),free=window.v1512LeadershipFreeRole?.()||!template.requiere_programacion;
        const payload={
          supervisor_user_id:null,supervisor_nombre:window.state?.profile?.nombre||'',control_codigo:template.codigo,control_nombre:template.nombre,
          fecha:date,anio:dt.getFullYear(),mes:dt.getMonth()+1,estado:'realizado',created_by:window.state?.session?.user?.id,
          fuera_programacion:free,ejecutado_por_user_id:window.state?.session?.user?.id,ejecutado_por_nombre:window.state?.profile?.nombre||window.state?.session?.user?.email,
          ejecutado_por_rol:window.v11Role?.(),detalle:{area:String(values.area||''),items:rows,campos:responses.map(x=>({id:x.field.id,label:x.field.label,tipo:x.field.tipo,valor:x.value})),observaciones:String(values.obs||'')},
          firma_data:window.v12SigData?.('v1524GenericSig')
        };
        const query=await window.sb.from('liderazgo_cumplimiento').insert(payload);if(query.error)throw query.error;
        const doc=window.v1512GenericPdf?.(template,{usuario:payload.ejecutado_por_nombre,fecha:date,area:values.area,resultado:hasNonConformity?'CON OBSERVACIONES':'REGISTRADO',rows,obs:values.obs,firma:payload.firma_data});
        if(doc)doc.save(`${template.codigo}_${date}.pdf`);
        window.closeModal?.();await window.renderLiderazgoV95?.();window.toast?.('Control registrado.','success');
      }catch(error){window.toast?.(error?.message||'No se pudo registrar el control.','error')}
    };
  };

  const builderOpen=window.v1512OpenTemplateModal,genericOpen=window.v1512OpenGenericControl;
  const reinforce=()=>{window.v1512OpenTemplateModal=builderOpen;window.v1512OpenGenericControl=genericOpen};
  window.addEventListener('stainher:modules-ready',reinforce);
  setTimeout(reinforce,300);setTimeout(reinforce,1200);
  mountStyle();
})();
