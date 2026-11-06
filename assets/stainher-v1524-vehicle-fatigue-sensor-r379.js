/* Stainher App R379 · CTRL-04: verificación del sensor de fatiga y somnolencia.
 * Amplía formulario, vista previa, PDF e historial de observaciones de camioneta.
 * No modifica declaración personal de fatiga ni programación de controles.
 */
(()=>{
 'use strict';
 if(window.StainherVehicleFatigueSensorR379)return;
 const ITEMS=[
  ['Dispositivo de detección de fatiga y somnolencia instalado','sensor_instalado'],
  ['Dispositivo enciende y se mantiene operativo','sensor_encendido'],
  ['Cámara / sensor detecta correctamente al conductor','sensor_camara'],
  ['Alertas visuales y sonoras funcionan en prueba','sensor_alertas']
 ];
 const OPTIONS=['','Bueno','Malo','N/A'];
 const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
 const field=(label,name)=>`<div class="v13-check-row"><span>${esc(label)}</span><select class="field" name="${name}" required>${OPTIONS.map((v,i)=>`<option value="${v}">${i?v:'Seleccionar estado'}</option>`).join('')}</select></div>`;
 const getRoot=()=>document.getElementById('modalRoot');
 const getForm=()=>document.getElementById('vehCtlFormV13')||getRoot()?.querySelector('form:has(.v154-check-group)')||getRoot()?.querySelector('form:has(.v156-nav)')||getRoot()?.querySelector('form');
 const values=Object.create(null);
 let mountedModal=null;
 const read=(key)=>getRoot()?.querySelector('[data-r379-sensor] [name="'+key+'"]')?.value??values[key]??'';
 function snapshot(){for(const [,key] of ITEMS)values[key]=read(key);values.sensor_observaciones=read('sensor_observaciones')}
 const relevant=()=>!!getRoot()?.querySelector('.v154-check-group,.v156-nav') && /camioneta|veh[íi]culo|patente/i.test(getRoot()?.textContent||'');

 function mount(){
  const form=getForm(),root=getRoot();
  if(!root||!relevant()||root.querySelector('[data-r379-sensor]'))return false;
  const target=[...root.querySelectorAll('.section-v95')].find(s=>/Chequeo del vehículo/i.test(s.querySelector('h4')?.textContent||''))||root.querySelector('.v154-check-group')||root.querySelector('.v156-page-card')||root.querySelector('.section-v95');
  if(!target)return false;
  const box=document.createElement('section');box.className='v13-check-section';box.dataset.r379Sensor='1';
  box.innerHTML=`<h4>Dispositivo de fatiga y somnolencia</h4><div class="v12-control-note" style="margin-bottom:10px">Comprobar el dispositivo antes de conducir. Ante falla o ausencia, informar y aplicar el procedimiento de seguridad correspondiente.</div>
  ${ITEMS.map(([label,key])=>field(label,key)).join('')}
  <label style="display:block;margin-top:10px">Observaciones del dispositivo<textarea class="field" name="sensor_observaciones" rows="2" style="width:100%" placeholder="Registrar anomalías, prueba realizada o medidas adoptadas"></textarea></label>
  <div class="notice" data-r379-alert hidden role="status">Dispositivo con observaciones: informar al supervisor y no iniciar conducción hasta evaluar la condición de seguridad.</div>`;
  const grid=target.querySelector('.v13-check-grid');
  if(grid)grid.appendChild(box);else target.appendChild(box);
  for(const [,key] of ITEMS){const input=box.querySelector('[name="'+key+'"]');if(input&&values[key])input.value=values[key]}
  const note=box.querySelector('[name="sensor_observaciones"]');if(note&&values.sensor_observaciones)note.value=values.sensor_observaciones;
  mountedModal=root;
  const check=()=>{
   snapshot();
   const failed=ITEMS.some(([,key])=>read(key)==='Malo');
   const notice=box.querySelector('[data-r379-alert]');if(notice)notice.hidden=!failed;
  };
  box.addEventListener('change',check);
  const submit=form.onsubmit;
  if(typeof submit==='function'&&!submit.__r379Sensor){
   const wrapped=async function(e){
    const original=window.sb?.rpc;
    // Se amplía exclusivamente la observación del RPC CTRL-04 durante este envío.
    if(typeof original!=='function')return submit.call(this,e);
    const inspection=collect();
    const detail=inspection.map(([k,v])=>`${k}: ${v}`).concat(['Observaciones sensor: '+(read('sensor_observaciones')||'Sin observaciones')]).join(' | ');
    window.sb.rpc=function(name,args,...rest){
      if(name!=='registrar_control4_v151')return original.call(this,name,args,...rest);
      return original.call(this,name,{...args,p_observaciones:[args?.p_observaciones||'',detail].filter(Boolean).join(' | ')},...rest);
    };
    try{return await submit.call(this,e)}
    finally{window.sb.rpc=original;}
   };
   wrapped.__r379Sensor=true;form.onsubmit=wrapped;
  }
  check();return true;
 }
 function collect(){
  const f=getForm();
  return ITEMS.map(([label,key])=>[label,read(key)||f?.elements?.namedItem(key)?.value||'']);
 }
 function wrapFunctions(){
  const opener=window.openVehiculoControlV13;
  if(typeof opener==='function'&&!opener.__r379Sensor){
   const wrapped=async function(...args){const r=await opener.apply(this,args);mount();return r};
   wrapped.__r379Sensor=true;wrapped.__base=opener;window.openVehiculoControlV13=wrapped;
  }
  const dataFn=window.vehiculoDataV13;
  if(typeof dataFn==='function'&&!dataFn.__r379Sensor){
   const wrapped=function(...args){
    const d=dataFn.apply(this,args);
    const f=getForm();if(!getRoot()?.querySelector('[data-r379-sensor]'))return d;
    const rows=collect();d.groups=[...(d.groups||[]),['Dispositivo de fatiga y somnolencia',rows]];
    const note=read('sensor_observaciones').trim();
    d.sensor_observaciones=note;
    // En el PDF el detalle adicional se muestra como ítem de verificación.
    if(note)d.groups[d.groups.length-1][1].push(['Observaciones del dispositivo',note]);
    return d;
   };
   wrapped.__r379Sensor=true;wrapped.__base=dataFn;window.vehiculoDataV13=wrapped;
  }
 }
 function install(){
  wrapFunctions();mount();
  const root=getRoot();
  if(root&&!root.__r379SensorObserver){
    root.__r379SensorObserver=true;
    let scheduled=false;
    new MutationObserver(()=>{
      if(scheduled)return;scheduled=true;
      queueMicrotask(()=>{scheduled=false;mount()});
    }).observe(root,{childList:true,subtree:true});
  }
  wrapRuntime();
 }
 function wrapRuntime(){
  const sb=window.sb;
  if(sb&&typeof sb.rpc==='function'&&!sb.rpc.__r379Sensor){
    const old=sb.rpc;
    const fn=function(name,args,...rest){
      if(name!=='registrar_control4_v151'||!getRoot()?.querySelector('[data-r379-sensor]'))return old.call(this,name,args,...rest);
      snapshot();
      const detail=collect().map(([k,v])=>k+': '+(v||'No evaluado')).concat(['Observaciones del dispositivo: '+(read('sensor_observaciones')||'Sin observaciones')]).join(' | ');
      return old.call(this,name,{...args,p_observaciones:[args?.p_observaciones||'',detail].filter(Boolean).join(' | ')},...rest);
    };
    fn.__r379Sensor=true;sb.rpc=fn;
  }
  const proto=window.jspdf?.jsPDF?.prototype,save=proto?.save;
  if(proto&&typeof save==='function'&&!save.__r379Sensor){
    const wrapped=function(filename,...args){
      if(/camioneta|vehiculo|vehículo|control.?0?4/i.test(String(filename||''))&&getRoot()?.querySelector('[data-r379-sensor]')&&!this.__r379SensorAdded){
        this.__r379SensorAdded=true;this.addPage();
        this.setFont('helvetica','bold');this.setFontSize(13);
        this.text('CHECK LIST DE CAMIONETA',14,18);
        this.setFontSize(11);this.text('Comprobación dispositivo de fatiga y somnolencia',14,29);
        const rows=collect();rows.push(['Observaciones',read('sensor_observaciones')||'Sin observaciones']);
        if(typeof this.autoTable==='function')this.autoTable({startY:35,head:[['Verificación','Estado']],body:rows,theme:'grid',styles:{fontSize:9,cellPadding:3},columnStyles:{0:{cellWidth:135}}});
        else {let y=39;for(const [label,value] of rows){this.setFontSize(8);this.text(String(label+': '+value).slice(0,95),14,y);y+=10}}
      }
      return save.call(this,filename,...args);
    };
    wrapped.__r379Sensor=true;proto.save=wrapped;
  }
 }
 window.StainherVehicleFatigueSensorR379=Object.freeze({install,mount,collect,items:ITEMS});
 install();
 window.addEventListener('stainher:modules-ready',install);
 [100,500,1400].forEach(t=>setTimeout(install,t));
})();
