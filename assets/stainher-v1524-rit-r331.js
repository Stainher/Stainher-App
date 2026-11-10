/* Desarrollo 29 / R331: asistente RIT de Codelco; aislado de controles existentes. */
(()=>{
"use strict";
if(window.__STAINHER_RIT_R331__)return;
window.__STAINHER_RIT_R331__=true;
const RF=[["RF01","Energía eléctrica"],["RF02","Trabajo en altura"],["RF03","Maniobras de izaje"],["RF04","Liberación descontrolada de energías"],["RF05","Caída de rocas en mina rajo"],["RF07","Sustancias peligrosas"],["RF08","Tronaduras y explosivos"],["RF09","Partes móviles"],["RF10","Vehículos"],["RF11","Espacios confinados"],["RF12","Metales fundidos"],["RF13","Caída de objetos"],["RF14","Operación ferroviaria"],["RF15","Avalancha y aludes"],["RF16","Vaciados, chimeneas, piques"],["RF17","Bombeo de agua barro"],["RF18","Planchoneo"],["RF19","Estallido de rocas"],["RF22","Falla de estructuras para tránsito"],["RF23","Colapso estructural del macizo"],["RF24","Taludes"],["RF25","Equipos mineros e industriales"],["RF30","Tiro y arrastre"]];
const ITEMS=["Instructivos","Materiales","Herramientas","EPP"];
const S=["Datos generales","Riesgos de fatalidad","Actividades y preparación","Análisis y controles","Aportes y reconocimientos","Revisión y cierre"];
const blank=()=>({nombre:"",preparacion:{},riesgos:[{rf:"",riesgo:"",consecuencia:"",controles:""}]});
const initial=()=>({fecha:new Date().toLocaleDateString("en-CA"),turno:"A",centro:"Codelco Andina",gerencia:"GSER",empresa:"STAINHER",area:"",supervisor:window.state?.profile?.nombre||"",asistentes:0,participantes:[],riesgos:[],actividades:[blank()],aportes:[],reconocimientos:[],estado:"borrador"});
let record=initial(),stage=0,view="wizard",busy=false,staff=null,staffError="",calendarOpen=false,calendarMonth=record.fecha.slice(0,7),calendarTarget="fecha";
const esc=v=>String(v??"").replace(/[&<>"']/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const host=()=>document.getElementById("page-liderazgo");
const db=()=>window.sb;
const opt=(values,selected)=>values.map(x=>'<option value="'+esc(x[0])+'" '+(String(selected)===String(x[0])?"selected":"")+'>'+esc(x[1])+'</option>').join("");
function style(){
 if(document.getElementById("rit-r331-style"))return;
 const e=document.createElement("style");e.id="rit-r331-style";
 e.textContent='.rit331{color:var(--text,#223548);background:var(--panel,#fff);border:1px solid var(--line,#ccd8e5);border-radius:14px;padding:18px;margin:16px 0;max-width:100%}.rit331 *{box-sizing:border-box}.rit331 h3{margin:0 0 10px}.rit331 .rt-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px}.rit331 .rt-grid3{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px}.rit331 label{display:grid;gap:5px;font-size:12px;font-weight:600}.rit331 input:not([type=checkbox]),.rit331 select,.rit331 textarea{width:100%;min-height:36px;background:var(--panel,#fff);color:var(--text,#223548);border:1px solid var(--line,#aab);border-radius:7px;padding:7px;font:inherit}.rit331 textarea{min-height:70px}.rit331 button{padding:8px 12px;border:1px solid #6f95b9;background:linear-gradient(120deg,#1859a0,#367cbc);color:#fff;border-radius:8px;cursor:pointer}.rit331 button:disabled{opacity:.5;cursor:not-allowed}.rit331 .rt-bar{display:flex;flex-wrap:wrap;gap:8px;align-items:center;justify-content:space-between;margin:10px 0}.rit331 .rt-box{border:1px solid var(--line,#ccd8e5);border-radius:10px;padding:12px;margin:10px 0;background:var(--panel2,#f3f6fa)}.rit331 .rt-risks{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:7px}.rit331 .rt-risks label{display:flex;align-items:center;gap:6px}.rit331 .rt-steps{font-size:12px;color:var(--muted,#68788a)}.rit331 .rt-error{color:#b42318;font-weight:600}.rit331 .rt-info{font-size:12px;color:var(--muted,#667)}.rit331 .rt-row{display:flex;align-items:center;gap:12px;flex-wrap:wrap}.rit331 table{width:100%;border-collapse:collapse}.rit331 th,.rit331 td{padding:7px;border-bottom:1px solid var(--line,#ddd);text-align:left}@media(max-width:760px){.rit331 .rt-grid,.rit331 .rt-grid3,.rit331 .rt-risks{grid-template-columns:1fr}}';
 e.textContent+=".rit331 .rt-grid>label,.rit331 .rt-grid3>label{min-width:0;width:100%;overflow:visible}\n.rit331 label:has(input[type=\"date\"]){min-width:0;max-width:100%;position:relative}\n.rit331 input[type=\"date\"]{display:block;box-sizing:border-box;width:100%!important;min-width:0!important;max-width:100%!important;max-height:44px;appearance:auto;-webkit-appearance:auto;padding:6px 10px!important;line-height:1.35;overflow:hidden}\n.rit331 input[type=\"date\"]::-webkit-calendar-picker-indicator{position:static!important;float:none!important;display:inline-block!important;margin:0 0 0 3px!important;padding:2px!important;width:18px!important;height:18px!important;cursor:pointer;opacity:1}\n.rit331 input[type=\"date\"]::-webkit-datetime-edit{min-width:0;padding:0}\n.rit331 .rt-delete{background:#c72c3c!important;border-color:#b42330!important}\n.rit331 #rt-history-list{max-width:100%;overflow-x:auto}\n@media(max-width:760px){.rit331{padding:12px;margin:10px 0 100px;min-width:0;overflow:visible}.rit331 .rt-box{padding:12px;min-width:0}.rit331 .rt-grid,.rit331 .rt-grid3{grid-template-columns:minmax(0,1fr)}.rit331 .rt-bar{gap:8px}.rit331 .rt-row{gap:6px}.rit331 input[type=\"date\"]{font-size:16px!important;padding-right:10px!important}.rit331 #rt-history-list table{min-width:590px}}\n";
 e.textContent+=".rit331 label:has(>input[type=\"date\"]){position:relative;max-width:100%;min-width:0;overflow:hidden}\n.rit331 label>input[type=\"date\"]{width:100%!important;min-width:0!important;max-width:100%!important;display:block!important;padding:8px 40px 8px 10px!important;box-sizing:border-box!important;overflow:hidden!important;-webkit-appearance:none!important;appearance:none!important;background-color:var(--panel,#fff)!important}\n.rit331 label>input[type=\"date\"]::-webkit-calendar-picker-indicator{opacity:0!important;width:0!important;height:0!important;min-width:0!important;max-width:0!important;padding:0!important;margin:0!important;display:none!important}\n.rit331 label:has(>input[type=\"date\"])::after{content:\"📅\";position:absolute;right:12px;bottom:8px;font-size:17px;line-height:20px;pointer-events:none}\n@media(max-width:760px){.rit331 label>input[type=\"date\"]{font-size:16px!important;width:100%!important;max-width:100%!important}}\n";
 e.textContent+="\n/* R340: calendario propio, sin selector nativo que se desborde en iOS Safari. */\n.rit331 .rt-date-field{min-width:0;width:100%;max-width:100%;display:block}\n.rit331 .rt-date-label{display:block;font-size:12px;font-weight:600;margin-bottom:5px}\n.rit331 .rt-date-control{width:100%;min-width:0;max-width:100%;display:grid;grid-template-columns:minmax(0,1fr) 46px;gap:6px;align-items:stretch}\n.rit331 .rt-date-control input.rt-date-display[type=\"text\"]{display:block;width:100%!important;min-width:0!important;max-width:100%!important;text-align:center;font-size:16px!important;padding:8px 10px!important;box-sizing:border-box}\n.rit331 button.rt-date-toggle{width:46px!important;min-width:0!important;max-width:46px!important;height:42px!important;padding:7px!important;display:flex;justify-content:center;align-items:center;border-radius:8px}\n.rit331 .rt-calendar{width:100%;min-width:0;max-width:100%;margin-top:8px;border:1px solid var(--line,#b5c8dd);background:var(--panel,#fff);padding:10px;border-radius:10px;box-sizing:border-box;overflow:hidden}\n.rit331 .rt-calendar-head{display:flex;justify-content:space-between;align-items:center;gap:6px;margin-bottom:8px}\n.rit331 .rt-calendar-head strong{font-size:14px;text-transform:capitalize;color:var(--text,#21354c)}\n.rit331 button.rt-calendar-nav{width:38px!important;height:34px!important;padding:4px!important;flex-shrink:0}\n.rit331 .rt-calendar-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px;min-width:0;max-width:100%}\n.rit331 .rt-calendar-day-label{font-size:11px;font-weight:700;color:var(--muted,#64748b);text-align:center;padding:4px 0}\n.rit331 button.rt-calendar-day{width:100%!important;min-width:0!important;min-height:34px!important;max-width:100%!important;padding:4px 0!important;border:1px solid transparent!important;border-radius:6px!important;background:var(--panel2,#edf3fa)!important;color:var(--text,#1c2b3b)!important;font-size:14px!important;box-sizing:border-box}\n.rit331 button.rt-calendar-day[aria-pressed=\"true\"]{background:#1769bb!important;color:#fff!important;border-color:#1769bb!important}\n.rit331 button.rt-calendar-day:focus-visible,.rit331 button.rt-date-toggle:focus-visible{outline:3px solid #f59e0b;outline-offset:2px}\n@media(max-width:760px){\n .rit331 .rt-date-control{grid-template-columns:minmax(0,1fr) 44px;gap:6px}\n .rit331 button.rt-date-toggle{width:44px!important;max-width:44px!important}\n .rit331 .rt-calendar{padding:7px}\n .rit331 .rt-calendar-grid{gap:2px}\n .rit331 button.rt-calendar-day{font-size:14px!important;min-height:38px!important}\n}";
 e.textContent+='#page-liderazgo #rit-r331:not([data-r390-modal="1"]){display:none!important;}#page-liderazgo #stainher-rit-stage-r391{display:none!important;}';
 document.head.appendChild(e);
}

function ritDateFormat(iso){
 const parts=String(iso||"").match(/^(\d{4})-(\d{2})-(\d{2})$/);
 return parts?parts[3]+"-"+parts[2]+"-"+parts[1]:"";
}
function monthShift(amount){
 const [year,month]=calendarMonth.split("-").map(Number);
 const shifted=new Date(Date.UTC(year,month-1+amount,1));
 calendarMonth=shifted.getUTCFullYear()+"-"+String(shifted.getUTCMonth()+1).padStart(2,"0");
}
function getCalendarValue(target){
 if(target==="fecha")return record.fecha||"";
 const match=String(target).match(/^aportes:(\d):fecha$/);
 return match?(record.aportes[Number(match[1])]?.fecha||""):"";
}
function setCalendarValue(target,value){
 if(target==="fecha"){record.fecha=value;return;}
 const match=String(target).match(/^aportes:(\d):fecha$/);
 if(!match)return;
 const index=Number(match[1]);
 record.aportes[index]??={};
 record.aportes[index].fecha=value;
}
function calendarMarkup(){
 const parts=calendarMonth.match(/^(\d{4})-(\d{2})$/);
 if(!parts)return "";
 const year=Number(parts[1]),month=Number(parts[2])-1;
 const title=new Intl.DateTimeFormat("es-CL",{month:"long",year:"numeric",timeZone:"UTC"}).format(new Date(Date.UTC(year,month,1)));
 const offset=(new Date(Date.UTC(year,month,1)).getUTCDay()+6)%7;
 const days=new Date(Date.UTC(year,month+1,0)).getUTCDate();
 let result='<div class="rt-calendar" role="group" aria-label="Calendario RIT"><div class="rt-calendar-head"><button type="button" class="rt-calendar-nav" data-act="date-prev" aria-label="Mes anterior">‹</button><strong>'+esc(title)+'</strong><button type="button" class="rt-calendar-nav" data-act="date-next" aria-label="Mes siguiente">›</button></div><div class="rt-calendar-grid">';
 for(const day of ["Lu","Ma","Mi","Ju","Vi","Sa","Do"])result+='<span class="rt-calendar-day-label">'+day+'</span>';
 for(let i=0;i<offset;i++)result+='<span aria-hidden="true"></span>';
 for(let i=1;i<=days;i++){
  const iso=calendarMonth+"-"+String(i).padStart(2,"0");
  result+='<button type="button" class="rt-calendar-day" data-date-day="'+iso+'" aria-label="'+esc(ritDateFormat(iso))+'" aria-pressed="'+(getCalendarValue(calendarTarget)===iso)+'">'+i+'</button>';
 }
 return result+"</div></div>";
}
function dateField(target="fecha"){
 const value=getCalendarValue(target),expanded=calendarOpen&&calendarTarget===target;
 const fieldId="rt-date-"+target.replace(/[^a-zA-Z0-9]/g,"-");
 return '<div class="rt-date-field"><span class="rt-date-label" id="'+fieldId+'">Fecha</span><div class="rt-date-control"><input type="text" class="rt-date-display" value="'+esc(ritDateFormat(value))+'" readonly aria-labelledby="'+fieldId+'" title="Seleccione una fecha desde el calendario"><button type="button" class="rt-date-toggle" data-act="date-toggle" data-date-target="'+esc(target)+'" aria-label="Abrir calendario" aria-expanded="'+expanded+'">▦</button></div>'+(expanded?calendarMarkup():"")+'</div>';
}

function field(label,key,type="text",extra=""){
 return '<label>'+esc(label)+'<input data-field="'+key+'" type="'+type+'" value="'+esc(record[key])+'" '+extra+'></label>';
}
function participantMarkup(){
 if(staff===null)return '<p class="rt-info">Cargando dotación…</p>';
 if(staffError)return '<p class="rt-error">'+esc(staffError)+'</p><p class="rt-info">Puede ingresar la cantidad manual mientras se revisa el acceso.</p>';
 return '<div class="rt-box"><b>Asistentes de Dotación</b><p class="rt-info">Seleccione solamente a quienes participaron; la cantidad se actualiza automáticamente.</p><div class="rt-risks">'+staff.map(s=>'<label><input type="checkbox" data-person="'+esc(s.id)+'" '+(record.participantes.some(p=>p.id===s.id)?"checked":"")+'>'+esc(s.nombre)+' · '+esc(s.cargo||"")+'</label>').join("")+'</div></div>';
}
async function loadStaff(){
 if(staff!==null)return;
 if(!db())return;
 const {data,error}=await db().from("dotacion_contrato").select("id,nombre,cargo,estado").eq("estado","activo").order("nombre");
 staffError=error?.message||"";
 staff=error?[]:(data||[]);
 if(view==="wizard"&&stage===0)render();
}
function markup(){
let h='<div class="rt-bar"><h3>Reunión de Inicio de Turno (RIT)</h3><div class="rt-row"><button data-act="new">Nuevo RIT</button><button data-act="history">Historial</button></div></div>';
if(view==="history")return h+'<div class="rt-box"><p class="rt-info" id="rt-template-state">Verificando plantilla oficial incluida en Stainher App…</p></div><div id="rt-history-list">Cargando registros…</div>';
h+='<div class="rt-steps">Etapa '+(stage+1)+' de 6 · '+esc(S[stage])+'</div><div class="rt-box">';
if(stage===0)h+='<div class="rt-grid">'+field("Centro de trabajo","centro")+field("Gerencia","gerencia")+field("Superintendencia / Empresa contratista","empresa")+field("Área / Frente de trabajo","area")+dateField()+field("Turno","turno")+(window.StainherControlSupervisor?'<label>Supervisor a cargo<select id="v416RitSupervisor" data-field="supervisor"></select></label>':field("Supervisor a cargo","supervisor"))+field("Nº asistentes","asistentes","number",'min="0" max="999"')+'</div>'+participantMarkup();
if(stage===1)h+='<p>Marque solamente los riesgos presentes y verificados por el supervisor.</p><div class="rt-risks">'+RF.map(r=>'<label><input type="checkbox" data-risk="'+r[0]+'" '+(record.riesgos.includes(r[0])?"checked":"")+'>'+r[0]+' · '+esc(r[1])+'</label>').join("")+'</div>';
if(stage===2)h+=record.actividades.map((a,i)=>'<div class="rt-box"><div class="rt-bar"><b>Actividad '+(i+1)+'</b><button data-remove="'+i+'">Quitar</button></div><label>Descripción<textarea data-activity="'+i+'" data-prop="nombre">'+esc(a.nombre)+'</textarea></label><div class="rt-grid3">'+ITEMS.map(item=>'<label>'+item+'<select data-prep="'+i+'" data-item="'+item+'">'+opt([["","Sin evaluar"],["si","Sí"],["no","No"]],a.preparacion[item]||"")+'</select></label>').join("")+'</div></div>').join("")+'<button data-act="add" '+(record.actividades.length>=6?"disabled":"")+'>Añadir actividad (máx. 6)</button>';
if(stage===3&&!record.riesgos.length)h+='<p class="rt-error">Seleccione primero los riesgos de fatalidad en la etapa 2.</p>';
if(stage===3)h+=record.actividades.map((a,i)=>'<div class="rt-box"><b>Actividad '+(i+1)+': '+esc(a.nombre||"Sin nombre")+'</b>'+a.riesgos.map((r,j)=>'<div class="rt-box"><div class="rt-grid"><label>RF<select data-analysis="'+i+':'+j+'" data-key="rf">'+opt([["","Seleccione RF"],...RF.filter(([code])=>record.riesgos.includes(code))],record.riesgos.includes(r.rf)?r.rf:"")+'</select></label><label>Riesgo<input data-analysis="'+i+':'+j+'" data-key="riesgo" value="'+esc(r.riesgo)+'"></label><label>Consecuencia<textarea data-analysis="'+i+':'+j+'" data-key="consecuencia">'+esc(r.consecuencia)+'</textarea></label><label>Controles verificados<textarea data-analysis="'+i+':'+j+'" data-key="controles">'+esc(r.controles)+'</textarea></label></div><button data-delrisk="'+i+':'+j+'">Quitar riesgo</button></div>').join("")+'<button data-addrisk="'+i+'">Añadir riesgo a esta actividad</button></div>').join("");
if(stage===4)h+='<h4>Aportes a la gestión de riesgos (último día)</h4>'+[0,1,2,3].map(i=>{const a=record.aportes[i]||{};return '<div class="rt-grid3"><label>Propuesta<input data-list="aportes:'+i+':propuesta" value="'+esc(a.propuesta)+'"></label><label>Responsable<input data-list="aportes:'+i+':responsable" value="'+esc(a.responsable)+'"></label>'+dateField('aportes:'+i+':fecha')+'</div>'}).join("")+'<h4>Reconocimientos (último día)</h4>'+[0,1,2,3].map(i=>{const a=record.reconocimientos[i]||{};return '<div class="rt-grid"><label>Quién<input data-list="reconocimientos:'+i+':quien" value="'+esc(a.quien)+'"></label><label>Motivo<input data-list="reconocimientos:'+i+':motivo" value="'+esc(a.motivo)+'"></label></div>'}).join("");
if(stage===5)h+='<h4>Revisión antes de finalizar</h4><p>Fecha: '+esc(record.fecha)+' · Supervisor: '+esc(record.supervisor)+' · Turno: '+esc(record.turno)+'</p><p>Riesgos del turno: '+record.riesgos.map(esc).join(", ")+'</p><p>Actividades: '+record.actividades.length+' · Asistentes: '+esc(record.asistentes)+'</p><p class="rt-info">El PDF oficial de Codelco de dos páginas se genera automáticamente con la plantilla incluida en Stainher App. No es necesario subir archivos.</p><p class="rt-info" id="rt-template-state">Verificando disponibilidad de plantilla…</p><button data-act="pdf">Descargar vista previa PDF</button>';
if(stage===5){const pendiente=record.actividades.flatMap((a,i)=>ITEMS.filter(item=>a.preparacion?.[item]==="no").map(item=>({actividad:i+1,nombre:a.nombre,item})));if(pendiente.length)h+='<div class="rt-box"><strong class="rt-error">Preparación pendiente:</strong><ul>'+pendiente.map(p=>'<li>Actividad '+p.actividad+' ('+esc(p.nombre||"Sin nombre")+'): '+esc(p.item)+' está marcado No</li>').join("")+'</ul><p class="rt-info">El RIT puede guardarse como borrador; para finalizar, verifique que se resolvió cada condición y actualice la evaluación.</p><button data-act="review-prep">Revisar preparación</button></div>';}
h+='</div><div class="rt-bar"><button data-act="previous" '+(stage===0?"disabled":"")+'>Anterior</button><span id="rt-message" role="status" aria-live="polite"></span><div class="rt-row"><button data-act="save">Guardar borrador</button>'+(stage<5?'<button data-act="next">Siguiente</button>':'<button data-act="finish">Finalizar RIT</button>')+'</div></div>';
return h;
}
function message(msg,fail=false){const e=document.getElementById("rt-message");if(e){e.textContent=msg;e.className=fail?"rt-error":"rt-info";}}
function validateStep(step){
 if(step===0){
  if(!record.fecha||!record.centro?.trim()||!record.gerencia?.trim()||!record.empresa?.trim()||!record.area?.trim()||!record.supervisor?.trim()||!record.turno?.trim())return "Complete los datos generales obligatorios antes de continuar.";
  if(record.participantes.length&&record.asistentes!==record.participantes.length)return "Verifique la cantidad de asistentes seleccionados.";
  if(Number(record.asistentes)<1)return "Indique al menos un asistente antes de continuar.";
 }
 if(step===1&&!record.riesgos.length)return "Debe seleccionar los riesgos de fatalidad presentes en el turno antes de avanzar.";
 if(step===2){
  for(let i=0;i<record.actividades.length;i++){
   const a=record.actividades[i];
   if(!a.nombre?.trim())return "Actividad "+(i+1)+": ingrese la descripción antes de continuar.";
   for(const item of ITEMS){
    if(!a.preparacion?.[item])return "Actividad "+(i+1)+": marque Sí o No en "+item+" antes de continuar.";
    if(a.preparacion[item]==="no")return "Actividad "+(i+1)+": "+item+" marcado No. Resuelva y vuelva a verificar la condición antes de continuar.";
   }
  }
 }
 if(step===3){
  for(let i=0;i<record.actividades.length;i++){
   const rows=record.actividades[i].riesgos||[];
   if(!rows.length)return "Actividad "+(i+1)+": agregue al menos un análisis de riesgo.";
   for(let j=0;j<rows.length;j++){
    const r=rows[j];
    if(!r.rf||!record.riesgos.includes(r.rf))return "Actividad "+(i+1)+", riesgo "+(j+1)+": seleccione un RF marcado en el paso 2.";
    if(!r.riesgo?.trim()||!r.consecuencia?.trim()||!r.controles?.trim())return "Actividad "+(i+1)+", riesgo "+(j+1)+": complete riesgo, consecuencia y controles.";
   }
  }
 }
 return "";
}
function validate(final=false){
 if(!final)return "";
 if(!record.fecha||!record.supervisor.trim()||!record.centro.trim()||!record.area.trim())return "Complete fecha, centro, área y supervisor.";
 if(record.participantes.length>0&&record.asistentes!==record.participantes.length)return "La cantidad debe coincidir con los asistentes seleccionados de Dotación.";
 if(record.riesgos.length===0)return "Seleccione los riesgos presentes del turno.";
 for(const a of record.actividades){
  if(!a.nombre.trim())return "Todas las actividades deben tener descripción.";
  for(const item of ITEMS)if(!a.preparacion[item])return "Evalúe Instructivos, Materiales, Herramientas y EPP.";
  for(const item of ITEMS)if(a.preparacion[item]==="no")return "Actividad "+(record.actividades.indexOf(a)+1)+" ("+a.nombre+"): "+item+" marcado No. Resuelva y verifique la condición antes de finalizar.";
  if(a.riesgos.length>4)return "Máximo cuatro riesgos analizados por actividad en el PDF original.";
  if(!a.riesgos.length||a.riesgos.some(r=>!r.rf||!r.riesgo.trim()||!r.consecuencia.trim()||!r.controles.trim()))return "Complete RF, riesgo, consecuencia y controles de cada actividad.";
  if(a.riesgos.some(r=>!record.riesgos.includes(r.rf)))return "Todos los RF de las actividades deben marcarse también en riesgos del turno.";
 }
 return "";
}
async function save(final=false){
 const err=validate(final);if(err){message(err,true);return false;}
 if(!db()){message("Conexión de datos no disponible.",true);return false;}
 if(busy)return false;busy=true;
 try{
  // Antes de cerrar el registro, debe poder construirse el PDF exacto.
  const pdfPrepared=final?await window.StainherRITPDF?.buildPdf(record):null;
  if(final&&!pdfPrepared)throw Error("No está listo el generador PDF original; se conserva el RIT como borrador.");
  const payload={fecha:record.fecha,turno:record.turno,centro:record.centro,gerencia:record.gerencia,empresa:record.empresa,area:record.area,supervisor:record.supervisor,asistentes:Number(record.asistentes)||0,participantes:record.participantes,riesgos:record.riesgos,actividades:record.actividades,aportes:record.aportes,reconocimientos:record.reconocimientos,estado:final?"finalizado":"borrador",updated_at:new Date().toISOString()};
  if(final)payload.fecha_cierre=new Date().toISOString();
  let query;
  if(record.id)query=await db().from("rit_reuniones").update(payload).eq("id",record.id).select("id,estado").single();
  else { const draft={...payload,estado:"borrador"}; delete draft.fecha_cierre; query=await db().from("rit_reuniones").insert(draft).select("id,estado").single(); if(!query.error && final){record.id=query.data.id;query=await db().from("rit_reuniones").update(payload).eq("id",record.id).select("id,estado").single();} }
  if(query.error)throw query.error;
  record.id=query.data.id;record.estado=query.data.estado;
  message(final?"RIT finalizado y almacenado.":"Borrador guardado.");
  if(final){
   try{window.StainherRITPDF.downloadBuilt(pdfPrepared)}catch(error){window.toast?.("RIT finalizado; no se pudo iniciar la descarga: "+error.message,"error")}
   view="history";render();await history();
  }
  return true;
 }catch(e){message(e.message||"No se pudo guardar RIT.",true);return false}
 finally{busy=false}
}
async function history(){
 const el=document.getElementById("rt-history-list");if(!el)return;
 if(!db()){el.textContent="No hay conexión a Supabase.";return;}
 const {data,error}=await db().from("rit_reuniones").select("id,fecha,turno,supervisor,area,estado").order("fecha",{ascending:false}).limit(100);
 if(error){el.textContent=error.message;return;}
 el.innerHTML='<table><thead><tr><th>Fecha</th><th>Turno</th><th>Supervisor</th><th>Área</th><th>Estado</th><th>Acción</th></tr></thead><tbody>'+(data||[]).map(r=>'<tr><td>'+esc(r.fecha)+'</td><td>'+esc(r.turno)+'</td><td>'+esc(r.supervisor)+'</td><td>'+esc(r.area)+'</td><td>'+esc(r.estado)+'</td><td>'+(r.estado==="borrador"?'<button data-open="'+esc(r.id)+'">Editar</button>':('<button data-pdf="'+esc(r.id)+'">PDF</button>')+' <button data-delete="'+esc(r.id)+'" class="rt-delete">Eliminar</button>')+'</td></tr>').join("")+'</tbody></table>';
}
async function open(id){
 const {data,error}=await db().from("rit_reuniones").select("*").eq("id",id).single();
 if(error){const el=document.getElementById("rt-history-list");if(el)el.textContent=error.message;return;}
 record={...initial(),...data};stage=0;view="wizard";calendarOpen=false;calendarMonth=record.fecha.slice(0,7);render();
}
// R391: montar el asistente oculto mientras se prepara la ventana R390.
function ritStaging(root){
 let stage=root.querySelector("#stainher-rit-stage-r391");
 if(!stage){
  stage=document.createElement("div");
  stage.id="stainher-rit-stage-r391";
  stage.hidden=true;
  stage.style.display="none";
  stage.setAttribute("aria-hidden","true");
  root.appendChild(stage);
 }
 return stage;
}
function render(){const root=host();if(!root)return;style();let el=document.getElementById("rit-r331");if(!el){el=document.createElement("section");el.className="rit331";el.id="rit-r331";
 const slot=root.querySelector("#stainher-rit-modal-body-r390");
 if(slot){slot.querySelector(".r390-loading")?.remove();slot.appendChild(el);el.dataset.r390Modal="1";}
 else ritStaging(root).appendChild(el);
 }el.innerHTML=markup();
 void window.StainherControlSupervisor?.fill(el.querySelector("#v416RitSupervisor"),{byName:true,initial:record.supervisor});
 const status=el.querySelector("#rt-template-state");
 if(status){
  window.StainherRITPDF?.hasTemplate().then(ready=>{
   if(status.isConnected)status.textContent=ready
    ?"Plantilla Codelco integrada y verificada. PDF disponible sin cargar archivos."
    :"No fue posible cargar la plantilla integrada. Informe al administrador; no debe subir archivos.";
  }).catch(()=>{if(status.isConnected)status.textContent="No se pudo verificar la plantilla original."});
 }
}
function change(e){
 const t=e.target;
 if(t.dataset.ritTemplate){
  const file=t.files?.[0];if(!file)return;
  const panel=document.getElementById("rt-template-state");if(panel)panel.textContent="Validando plantilla PDF…";
  Promise.resolve().then(()=>window.StainherRITPDF?.importTemplate(file)).then(ok=>{
   if(!ok)throw Error("Motor PDF no disponible.");
   if(panel)panel.textContent="Plantilla Codelco de 2 páginas A3 validada y guardada en este navegador.";
  }).catch(err=>{if(panel)panel.textContent=err.message;window.toast?.(err.message,"error")});
  return;
 }
 if(t.dataset.field){record[t.dataset.field]=t.dataset.field==="asistentes"?Number(t.value):t.value;return;}
 if(t.dataset.person){
  const person=staff?.find(p=>p.id===t.dataset.person);
  if(!person)return;
  record.participantes=t.checked?[...record.participantes.filter(p=>p.id!==person.id),{id:person.id,nombre:person.nombre,cargo:person.cargo}]:record.participantes.filter(p=>p.id!==person.id);
  record.asistentes=record.participantes.length;
  const count=document.querySelector('#rit-r331 [data-field="asistentes"]');if(count)count.value=record.asistentes;
  return;
 }
 if(t.dataset.risk){record.riesgos=t.checked?[...new Set([...record.riesgos,t.dataset.risk])]:record.riesgos.filter(x=>x!==t.dataset.risk);return;}
 if(t.dataset.activity!==undefined){record.actividades[Number(t.dataset.activity)][t.dataset.prop]=t.value;return;}
 if(t.dataset.prep!==undefined){record.actividades[Number(t.dataset.prep)].preparacion[t.dataset.item]=t.value;return;}
 if(t.dataset.analysis){const [i,j]=t.dataset.analysis.split(":").map(Number);record.actividades[i].riesgos[j][t.dataset.key]=t.value;return;}
 if(t.dataset.list){const [name,index,key]=t.dataset.list.split(":");record[name][index]??={};record[name][index][key]=t.value;}
}
async function deleteRIT(id){
 if(!db())return;
 // Solo se elimina el registro elegido; exige confirmación explícita.
 if(!window.confirm("¿Eliminar permanentemente este RIT? La operación no se puede deshacer."))return;
 const {data,error}=await db().from("rit_reuniones").delete().eq("id",id).select("id");
 const panel=document.getElementById("rt-history-list");
 if(error){window.toast?.(error.message||"No se pudo eliminar.","error");if(panel)panel.insertAdjacentHTML("afterbegin",'<p class="rt-error">'+esc(error.message)+'</p>');return;}
 if(!data?.length){window.toast?.("No tiene permiso para eliminar este RIT.","error");return;}
 if(record.id===id)record=initial();
 await history();
 window.toast?.("RIT eliminado correctamente.","success");
}
async function duplicate(id){
 if(!db())return;
 const {data,error}=await db().from("rit_reuniones").select("*").eq("id",id).single();
 if(error){window.toast?.(error.message,"error");return;}
 const next=initial();
 next.turno=data.turno;next.centro=data.centro;next.gerencia=data.gerencia;next.empresa=data.empresa;next.area=data.area;
 next.riesgos=Array.isArray(data.riesgos)?[...data.riesgos]:[];
 next.actividades=Array.isArray(data.actividades)?data.actividades.map(a=>({
  nombre:a.nombre||"",preparacion:{},
  riesgos:Array.isArray(a.riesgos)?a.riesgos.map(r=>({rf:r.rf||"",riesgo:r.riesgo||"",consecuencia:r.consecuencia||"",controles:r.controles||""})):[]
 })):[blank()];
 record=next;view="wizard";stage=0;render();
 window.toast?.("Actividades copiadas. Verifique de nuevo preparación, riesgos y controles de este turno.","success");
}
async function exportPDF(id){
 try{
  if(!window.StainherRITPDF)throw Error("Motor de PDF no disponible.");
  let entry=record;
  if(id){
   const {data,error}=await db().from("rit_reuniones").select("*").eq("id",id).single();
   if(error)throw error;
   entry=data;
  }
  await window.StainherRITPDF.exportPdf(entry);
 }catch(error){window.toast?.(error.message||"No se pudo generar el PDF.","error");message(error.message||"No se pudo generar el PDF.",true);}
}
function click(e){
 const t=e.target.closest("button");if(!t||!document.getElementById("rit-r331")?.contains(t))return;
 if(t.dataset.dateDay){setCalendarValue(calendarTarget,t.dataset.dateDay);calendarOpen=false;render();return;}
 if(t.dataset.open){open(t.dataset.open);return;}
 if(t.dataset.pdf){exportPDF(t.dataset.pdf);return;}
 if(t.dataset.delete){deleteRIT(t.dataset.delete);return;}
 if(t.dataset.remove!==undefined){if(record.actividades.length===1){message("Debe mantener al menos una actividad.",true);return;}record.actividades.splice(Number(t.dataset.remove),1);render();return;}
 if(t.dataset.addrisk!==undefined){
  const risks=record.actividades[Number(t.dataset.addrisk)].riesgos;
  if(risks.length>=4){message("El PDF original permite cuatro filas de análisis por actividad.",true);return;}
  risks.push({rf:"",riesgo:"",consecuencia:"",controles:""});render();return;
 }
 if(t.dataset.delrisk){const [i,j]=t.dataset.delrisk.split(":").map(Number);record.actividades[i].riesgos.splice(j,1);render();return;}
 switch(t.dataset.act){
 case "new":record=initial();stage=0;view="wizard";calendarOpen=false;calendarTarget="fecha";calendarMonth=record.fecha.slice(0,7);render();break;
 case "date-toggle":{
  const target=t.dataset.dateTarget||"fecha";
  calendarOpen=calendarTarget===target?!calendarOpen:true;
  calendarTarget=target;
  calendarMonth=(getCalendarValue(target)||record.fecha).slice(0,7)||calendarMonth;
  render();break;
 }
 case "date-prev":monthShift(-1);render();break;
 case "date-next":monthShift(1);render();break;
 case "history":view="history";render();history();break;
 case "add":if(record.actividades.length<6){record.actividades.push(blank());render();}break;
 case "previous":stage=Math.max(0,stage-1);render();break;
 case "next":{const pending=validateStep(stage);if(pending){message(pending,true);break;}stage=Math.min(5,stage+1);render();break;}
 case "save":save();break;
 case "finish":save(true);break;
 case "review-prep":stage=2;render();break;
 case "pdf":exportPDF();break;
 }
}
function mount(){
 const root=host();if(!root||!window.state?.session?.user)return;
 if(root.dataset.ritR331Events!=="1"){root.dataset.ritR331Events="1";root.addEventListener("input",change);root.addEventListener("change",change);root.addEventListener("click",click);}
 if(!document.getElementById("rit-r331"))render();
 if(staff===null)loadStaff().catch(e=>{staff=[];staffError=e.message;render();});
}
// R367: sin sondeo periódico. El RIT se monta al abrir Liderazgo o
// cuando el contenedor se reconstruye, nunca mediante recargas cada 2,5 s.
let activeRoot=null,scheduled=false,watcher=null;
function syncMount(){
 const root=host();
 if(!root||!window.state?.session?.user)return;
 const changed=root!==activeRoot;
 const missing=!root.querySelector("#rit-r331");
 if(!changed&&!missing)return;
 activeRoot=root;
 mount();
}
function scheduleMount(){
 if(scheduled)return;scheduled=true;
 requestAnimationFrame(()=>{scheduled=false;syncMount()});
}
function observeMount(){
 if(watcher)return;
 watcher=new MutationObserver(records=>{
  const root=host();
  if(!root||!window.state?.session?.user)return;
  // Ignorar cambios internos del formulario, que no requieren remontaje.
  const changed=root!==activeRoot;
  const removed=records.some(r=>[...r.removedNodes].some(n=>n.nodeType===1&&
   (n.id==="rit-r331"||n.querySelector?.("#rit-r331"))));
  if(changed||removed||!root.querySelector("#rit-r331"))scheduleMount();
 });
 watcher.observe(document.body,{childList:true,subtree:true});
}
window.StainherRIT=Object.freeze({mount:syncMount});
window.addEventListener("stainher:modules-ready",scheduleMount);
window.addEventListener("stainher:navigation",scheduleMount);
if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",()=>{syncMount();observeMount()},{once:true});
else {syncMount();observeMount()}
})();