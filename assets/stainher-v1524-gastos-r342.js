/* R342 · Gastos Operacionales · Desarrollo 30 */
(()=>{
'use strict';
if(window.StainherGastosR342)return;
const TAB='gastos_operacionales_r342',TABLE='gastos_operacionales_r342',BUCKET='gastos-operacionales-r342';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'$'+Math.round(Number(v)||0).toLocaleString('es-CL');
const month=()=>new Date().toLocaleDateString('en-CA').slice(0,7);
const isManager=()=>['administrador'].includes(String(window.state?.profile?.rol||'').toLowerCase())&&!window.state?.v15PreviewRole;
const isVisible=()=>['administrador','gerente'].includes(String(window.state?.profile?.rol||'').toLowerCase())&&!window.state?.v15PreviewRole;
let period=month(),rows=[],people=[],subtab='historial',editing=null,loading=false;
function style(){
if(document.getElementById('r342-css'))return;
const x=document.createElement('style');x.id='r342-css';x.textContent=`
#contractContent .r342-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:10px;margin:12px 0}
#contractContent .r342-kpi{border:1px solid rgba(255,255,255,.16)!important;border-radius:12px;padding:15px 16px;min-height:86px;box-sizing:border-box;background:linear-gradient(135deg,#103b63 0%,#17598e 55%,#2276ab 100%)!important;box-shadow:0 5px 14px rgba(15,41,68,.12);color:#ffffff!important}
#contractContent .r342-kpi small,#contractContent .r342-kpi small *{display:block;color:#eaf4ff!important;opacity:1!important;font-size:12px!important;font-weight:600!important;line-height:1.35!important;margin-bottom:7px}
#contractContent .r342-kpi strong,#contractContent .r342-kpi strong *{display:block;color:#ffffff!important;opacity:1!important;font-size:clamp(20px,2.2vw,29px)!important;line-height:1.15!important;font-weight:800!important;font-variant-numeric:tabular-nums!important;text-shadow:0 1px 2px rgba(0,0,0,.16)}
#contractContent .r342-kpi:hover{filter:brightness(1.06)}
@media(prefers-reduced-motion:no-preference){#contractContent .r342-kpi{transition:filter .16s ease}}
#contractContent .r342-toolbar,#contractContent .r342-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:12px 0}
#contractContent .r342-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
#contractContent .r342-form label{display:grid;gap:5px;font-size:12px;color:var(--muted)}
#contractContent .r342-form .wide{grid-column:1/-1}
#contractContent .r342-form input,#contractContent .r342-form select,#contractContent .r342-form textarea{min-width:0;width:100%;max-width:100%;box-sizing:border-box}
#contractContent .r342-table-wrap{width:100%;overflow-x:auto}
#contractContent .r342-table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}
#contractContent .r342-table th,#contractContent .r342-table td{padding:9px;border-bottom:1px solid var(--line,#ccc);text-align:left}
#contractContent .r342-note{font-size:12px;color:var(--muted)}
#contractContent .r342-error{color:#dd5252}
@media(max-width:850px){#contractContent .r342-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#contractContent .r342-form{grid-template-columns:1fr}#contractContent .r342-kpi strong{font-size:16px}}
`;document.head.appendChild(x);
}
function tabRoot(){return document.querySelector('#page-contrato .v1520-tabs')||document.querySelector('#page-contrato #v1519ContractTabs')||document.querySelector('#page-contrato .v1516-contract-tabs')||document.querySelector('#page-contrato .contract-tabs')}
function decorate(){
if(!isVisible())return;
const root=tabRoot();if(!root)return;
let btn=root.querySelector('[data-r342-tab]');
if(!btn){btn=document.createElement('button');btn.type='button';btn.dataset.r342Tab='1';btn.className=root.classList.contains('v1520-tabs')?'btn':'contract-tab';btn.textContent='Gastos Operacionales';btn.onclick=()=>{window.state.contractTab=TAB;decorate();render()};root.appendChild(btn)}
const selected=window.state?.contractTab===TAB;
btn.classList.toggle('active',selected);
if(selected)root.querySelectorAll('button').forEach(b=>{if(b!==btn)b.classList.remove('active')});
}
function hooks(){
const fn=window.setContractTab;
if(typeof fn==='function'&&!fn.__gastosR342){const w=async function(tab){if(tab===TAB){window.state.contractTab=TAB;decorate();return render()}const result=await fn.apply(this,arguments);decorate();return result};w.__gastosR342=true;window.setContractTab=w;try{setContractTab=w}catch(_){}}
const r=window.renderContractTab;
if(typeof r==='function'&&!r.__gastosR342){const w=function(){if(window.state?.contractTab===TAB)return render();const result=r.apply(this,arguments);requestAnimationFrame(decorate);return result};w.__gastosR342=true;window.renderContractTab=w;try{renderContractTab=w}catch(_){}}
const c=window.renderContrato;
if(typeof c==='function'&&!c.__gastosR342){const w=function(){const result=c.apply(this,arguments);requestAnimationFrame(()=>{decorate();if(window.state?.contractTab===TAB)render()});return result};w.__gastosR342=true;window.renderContrato=w;try{renderContrato=w}catch(_){}}
}
async function load(){
if(!window.sb)throw Error('Conexión Supabase no disponible');
const a=await window.sb.from(TABLE).select('*').gte('fecha',period+'-01').lt('fecha',nextMonth(period)).order('fecha',{ascending:false});
if(a.error)throw a.error;rows=a.data||[];
if(!people.length){const p=await window.sb.from('perfiles').select('id,nombre').eq('activo',true).order('nombre');if(!p.error)people=p.data||[]}
}
function nextMonth(s){const [y,m]=s.split('-').map(Number);return new Date(Date.UTC(y,m,1)).toISOString().slice(0,10)}
function totals(){
const all=rows.filter(r=>!r.anulado);return {total:all.reduce((s,r)=>s+Number(r.monto),0),personal:all.reduce((s,r)=>s+Math.max(0,Number(r.monto)-Number(r.reembolso_personal_monto||0)),0),finanzas:all.reduce((s,r)=>s+Math.max(0,Number(r.reembolso_personal_monto||0)-Number(r.reembolso_finanzas_monto||0)),0),codelco:all.filter(r=>r.ofertable_codelco).reduce((s,r)=>s+Number(r.monto),0)}
}
const stateText=(p,t)=>Number(p)>=Number(t)?'Completo':Number(p)>0?'Parcial':'Pendiente';
function header(){
const t=totals();return `<div class="r342-toolbar"><div><h3>Gastos Operacionales</h3><div class="r342-note">Contrato 4600029879 · Los reembolsos no duplican el gasto.</div></div><label>Mes <input class="field" id="r342-period" type="month" value="${esc(period)}"></label>${isManager()?'<button type="button" class="btn primary" data-r342="new">+ Registrar gasto</button>':''}<button type="button" class="btn" data-r342="pdf">Generar informe PDF</button></div>
<div class="r342-grid"><div class="r342-kpi"><small>Total del mes</small><strong>${money(t.total)}</strong></div><div class="r342-kpi"><small>Pendiente al personal</small><strong>${money(t.personal)}</strong></div><div class="r342-kpi"><small>Pendiente con Finanzas</small><strong>${money(t.finanzas)}</strong></div><div class="r342-kpi"><small>Ofertable a Codelco</small><strong>${money(t.codelco)}</strong></div></div>
<div class="r342-actions"><button class="btn ${subtab==='historial'?'primary':''}" data-r342="history">Historial</button><button class="btn ${subtab==='reembolsos'?'primary':''}" data-r342="reimb">Reembolsos</button></div>`}
function history(){
const filtered=rows.filter(r=>subtab==='historial'||(!r.anulado&&(Number(r.reembolso_personal_monto)<Number(r.monto)||Number(r.reembolso_finanzas_monto)<Number(r.reembolso_personal_monto))));
return `<div class="r342-table-wrap"><table class="r342-table"><thead><tr><th>Fecha</th><th>Tipo / detalle</th><th>Realizado por</th><th>Documento</th><th>Monto</th><th>Codelco</th><th>Personal</th><th>Finanzas</th><th>Comprobante</th><th>Acciones</th></tr></thead><tbody>${filtered.map(r=>`<tr style="${r.anulado?'opacity:.5':''}"><td>${esc(r.fecha)}</td><td>${esc(r.categoria)}<br><small>${esc(r.detalle)}</small></td><td>${esc(r.realizado_por_nombre)}</td><td>${esc(r.tipo_documento)} ${esc(r.numero_documento)}</td><td>${money(r.monto)}</td><td>${r.ofertable_codelco?esc(r.estado_codelco):'No'}</td><td>${stateText(r.reembolso_personal_monto,r.monto)}<br>${money(r.reembolso_personal_monto)}</td><td>${stateText(r.reembolso_finanzas_monto,r.reembolso_personal_monto)}<br>${money(r.reembolso_finanzas_monto)}</td><td>${r.comprobante_path?'<button class="btn" data-r342="file" data-id="'+esc(r.id)+'">Ver</button>':'—'}</td><td>${isManager()&&!r.anulado?'<button class="btn" data-r342="edit" data-id="'+esc(r.id)+'">Editar</button> <button class="btn" data-r342="void" data-id="'+esc(r.id)+'">Anular</button>':r.anulado?'Anulado':'—'}</td></tr>`).join('')||'<tr><td colspan="10">Sin gastos para el período seleccionado.</td></tr>'}</tbody></table></div>`}
function personOptions(v){return '<option value="">Seleccionar</option>'+people.map(p=>`<option value="${esc(p.id)}" ${p.id===v?'selected':''}>${esc(p.nombre)}</option>`).join('')}
function opt(a,v){return a.map(s=>`<option ${s===v?'selected':''} value="${esc(s)}">${esc(s)}</option>`).join('')}
function form(r={}){
const d=r.fecha||new Date().toLocaleDateString('en-CA');return `<h3>${r.id?'Editar':'Registrar'} gasto</h3><form id="r342-form" class="r342-form">
<label>Fecha del gasto<input class="field" type="date" name="fecha" required value="${esc(d)}"></label>
<label>Tipo de gasto<select class="field" name="categoria">${opt(['Insumos y materiales','Herramientas','Movilización','Alimentación','Caja chica','Compras operacionales','Gastos administrativos','Otros'],r.categoria||'Insumos y materiales')}</select></label>
<label>Monto CLP<input class="field" type="number" min="1" step="1" name="monto" required value="${esc(r.monto||'')}"></label>
<label class="wide">Detalle<textarea class="field" name="detalle" maxlength="1000" required>${esc(r.detalle||'')}</textarea></label>
<label>Tipo documento<select class="field" name="tipo_documento">${opt(['boleta','factura','otro','sin_documento'],r.tipo_documento||'boleta')}</select></label>
<label>Número de boleta/factura<input class="field" name="numero_documento" maxlength="120" value="${esc(r.numero_documento||'')}"></label>
<label>Realizado por<select class="field" name="realizado_por" required>${personOptions(r.realizado_por||window.state?.profile?.id)}</select></label>
<label>¿Se ofertará a Codelco?<select class="field" name="ofertable_codelco"><option value="false" ${!r.ofertable_codelco?'selected':''}>No</option><option value="true" ${r.ofertable_codelco?'selected':''}>Sí</option></select></label>
<label>Estado Codelco<select class="field" name="estado_codelco">${opt(['no_aplica','pendiente','ofertado','recuperado'],r.estado_codelco||'no_aplica')}</select></label>
<label>Reembolso al trabajador CLP<input class="field" type="number" min="0" name="reembolso_personal_monto" value="${esc(r.reembolso_personal_monto||0)}"></label>
<label>Medio de reembolso al trabajador<select class="field" name="medio_reembolso_personal">${opt(['pendiente','caja_chica','transferencia','efectivo','otro'],r.medio_reembolso_personal||'pendiente')}</select></label>
<label>Fecha reembolso al trabajador<input class="field" type="date" name="reembolso_personal_fecha" value="${esc(r.reembolso_personal_fecha||'')}"></label>
<label>Reembolsado por<input class="field" name="reembolso_personal_por" value="${esc(r.reembolso_personal_por||'Cristian Lagos')}"></label>
<label>Recuperado de Finanzas CLP<input class="field" type="number" min="0" name="reembolso_finanzas_monto" value="${esc(r.reembolso_finanzas_monto||0)}"></label>
<label>Fecha recuperación Finanzas<input class="field" type="date" name="reembolso_finanzas_fecha" value="${esc(r.reembolso_finanzas_fecha||'')}"></label>
<label>Referencia Finanzas<input class="field" name="reembolso_finanzas_referencia" value="${esc(r.reembolso_finanzas_referencia||'')}"></label>
<label class="wide">Comprobante (JPG, PNG, WebP o PDF · máximo 10 MB)<input type="file" name="archivo" accept="image/jpeg,image/png,image/webp,application/pdf">${r.comprobante_nombre?'<small>Actual: '+esc(r.comprobante_nombre)+'</small>':''}</label>
<label class="wide">Observaciones<textarea class="field" name="observaciones">${esc(r.observaciones||'')}</textarea></label>
<div class="wide r342-actions"><button type="submit" class="btn primary">Guardar gasto</button><button type="button" class="btn" data-r342="cancel">Cancelar</button></div>
</form>`}
async function render(){
if(window.state?.contractTab!==TAB||!isVisible())return;
const host=document.getElementById('contractContent');if(!host||loading)return;
loading=true;host.innerHTML='<div class="empty">Cargando gastos…</div>';style();decorate();
try{await load();host.innerHTML=header()+'<div id="r342-body">'+(editing?form(editing===true?{}:editing):history())+'</div>';
host.onclick=action;host.onchange=e=>{if(e.target.id==='r342-period'){period=e.target.value;editing=null;render()}};
const formElement=host.querySelector('#r342-form');if(formElement)formElement.onsubmit=save;
}catch(e){host.innerHTML='<div class="r342-error">No se pudieron cargar los gastos: '+esc(e.message)+'</div>'}finally{loading=false}
}
async function save(e){
e.preventDefault();const form=e.currentTarget,b=new FormData(form),file=b.get('archivo'),selected=people.find(p=>p.id===b.get('realizado_por'));
const amount=Number(b.get('monto')),personal=Number(b.get('reembolso_personal_monto')||0),finanzas=Number(b.get('reembolso_finanzas_monto')||0),ofertable=b.get('ofertable_codelco')==='true';
if(!selected||!Number.isSafeInteger(amount)||amount<=0||personal>amount||finanzas>personal||personal<0||finanzas<0){window.toast?.('Revise montos y responsable del gasto.','error');return}
if(file&&file.size&&(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size>10485760)){window.toast?.('Comprobante no admitido o mayor a 10 MB.','error');return}
const payload={fecha:b.get('fecha'),categoria:b.get('categoria'),detalle:String(b.get('detalle')).trim(),monto:amount,tipo_documento:b.get('tipo_documento'),numero_documento:b.get('numero_documento')||'',realizado_por:selected.id,realizado_por_nombre:selected.nombre,ofertable_codelco:ofertable,estado_codelco:ofertable?(b.get('estado_codelco')==='no_aplica'?'pendiente':b.get('estado_codelco')):'no_aplica',reembolso_personal_monto:personal,medio_reembolso_personal:b.get('medio_reembolso_personal'),reembolso_personal_fecha:b.get('reembolso_personal_fecha')||null,reembolso_personal_por:b.get('reembolso_personal_por')||'',reembolso_finanzas_monto:finanzas,reembolso_finanzas_fecha:b.get('reembolso_finanzas_fecha')||null,reembolso_finanzas_referencia:b.get('reembolso_finanzas_referencia')||'',observaciones:b.get('observaciones')||'',updated_at:new Date().toISOString()};
const button=form.querySelector('[type="submit"]');button.disabled=true;
try{
const isEdit=editing&&editing.id;let q=isEdit?await window.sb.from(TABLE).update(payload).eq('id',editing.id).select().single():await window.sb.from(TABLE).insert(payload).select().single();if(q.error)throw q.error;
if(file&&file.size){const me=(await window.sb.auth.getUser()).data?.user?.id;if(!me)throw Error('Sesión expirada');
const safeName=String(file.name).replace(/[^a-zA-Z0-9._-]/g,'_').slice(-100);const path=q.data.id+'/'+me+'/'+Date.now()+'-'+safeName;
const upload=await window.sb.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});if(upload.error)throw upload.error;
const update=await window.sb.from(TABLE).update({comprobante_path:path,comprobante_nombre:file.name,comprobante_mime:file.type}).eq('id',q.data.id);if(update.error)throw update.error;
}
editing=null;period=String(payload.fecha).slice(0,7);window.toast?.('Gasto registrado correctamente.','success');await render();
}catch(err){window.toast?.('Error: '+err.message,'error');button.disabled=false}
}
async function action(e){
const b=e.target.closest('[data-r342]');if(!b)return;const cmd=b.dataset.r342,id=b.dataset.id,r=rows.find(x=>x.id===id);
if(cmd==='new'){if(!isManager())return;editing=true;document.getElementById('r342-body').innerHTML=form({});document.getElementById('r342-form').onsubmit=save}
if(cmd==='edit'&&r){editing=r;document.getElementById('r342-body').innerHTML=form(r);document.getElementById('r342-form').onsubmit=save}
if(cmd==='cancel'){editing=null;render()}
if(cmd==='history'||cmd==='reimb'){subtab=cmd==='history'?'historial':'reembolsos';editing=null;render()}
if(cmd==='file'&&r?.comprobante_path){const q=await window.sb.storage.from(BUCKET).createSignedUrl(r.comprobante_path,60);if(q.error)return window.toast?.(q.error.message,'error');window.open(q.data.signedUrl,'_blank','noopener')}
if(cmd==='void'&&r&&isManager()){const reason=prompt('Motivo de anulación (el historial se conserva):');if(!reason?.trim())return;const q=await window.sb.from(TABLE).update({anulado:true,motivo_anulacion:reason.trim()}).eq('id',r.id);if(q.error)return window.toast?.(q.error.message,'error');render()}
if(cmd==='pdf')report();
}
async function report(){
const current=rows.filter(r=>!r.anulado),t=totals();
try{
 if(!window.PDFLib){await new Promise((resolve,reject)=>{const el=document.createElement('script');el.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';el.onload=resolve;el.onerror=()=>reject(Error('No fue posible cargar el motor PDF'));document.head.appendChild(el)})}
 const {PDFDocument,StandardFonts,rgb}=window.PDFLib,doc=await PDFDocument.create();
 const regular=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
 const clean=s=>String(s??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7e]/g,'?');
 const text=(page,str,x,y,size=9,font=regular)=>page.drawText(clean(str).slice(0,160),{x,y,size,font,color:rgb(.1,.2,.32)});
 let page,y,number=0;
 function next(){
 page=doc.addPage([841.89,595.28]);number++;y=550;
 page.drawRectangle({x:35,y:565,width:770,height:3,color:rgb(.11,.34,.58)});
 text(page,'STAINHER ASCENSORES  |  GASTOS OPERACIONALES',35,y,17,bold);y-=23;
 text(page,'Contrato 4600029879 - Codelco Division Andina  |  Periodo '+period,35,y,10);y-=25;
 }
 next();
 text(page,'Total '+money(t.total)+'  |  Pendiente personal '+money(t.personal)+'  |  Pendiente Finanzas '+money(t.finanzas)+'  |  Ofertable Codelco '+money(t.codelco),35,y,10,bold);y-=30;
 const cat={};current.forEach(r=>{cat[r.categoria]=(cat[r.categoria]||0)+Number(r.monto)});
 text(page,'DISTRIBUCION POR CATEGORIA',35,y,11,bold);y-=19;
 for(const [k,v] of Object.entries(cat)){if(y<90)next();text(page,k+' : '+money(v),45,y,10);y-=15}
 y-=12;text(page,'DETALLE DE GASTOS',35,y,11,bold);y-=21;
 const widths=[65,90,184,110,95,82,80],labels=['Fecha','Categoria','Detalle','Responsable','Documento','Monto','Codelco'];
 function heading(){let x=35;page.drawRectangle({x:35,y:y-6,width:770,height:20,color:rgb(.86,.92,.97)});for(let i=0;i<labels.length;i++){text(page,labels[i],x+4,y,8,bold);x+=widths[i]}y-=22}
 heading();
 for(const r of current){
  if(y<75){next();heading()}
  let x=35;const cells=[r.fecha,r.categoria,r.detalle,r.realizado_por_nombre,r.tipo_documento+' '+r.numero_documento,money(r.monto),r.ofertable_codelco?r.estado_codelco:'No'];
  cells.forEach((v,i)=>{const cap=Math.max(6,Math.floor((widths[i]-6)/4.6));text(page,clean(v).slice(0,cap),x+4,y,8);x+=widths[i]});
  y-=16;page.drawLine({start:{x:35,y:y+8},end:{x:805,y:y+8},thickness:.3,color:rgb(.8,.84,.88)});
  if(y<75){next();heading()}
  text(page,'Reembolso personal: '+money(r.reembolso_personal_monto)+'  |  Medio: '+(r.medio_reembolso_personal||'-')+'  |  Finanzas: '+money(r.reembolso_finanzas_monto)+'  |  Fecha: '+(r.reembolso_personal_fecha||'-'),42,y,7);y-=17;
 }
 const file='STAINHER_GASTOS_'+period.replace('-','_')+'.pdf',bytes=await doc.save();
 const blob=new Blob([bytes],{type:'application/pdf'}),url=URL.createObjectURL(blob),a=document.createElement('a');
 a.href=url;a.download=file;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),30000);
 window.toast?.('Informe PDF generado.','success');
}catch(e){window.toast?.('No fue posible generar el PDF: '+e.message,'error')}
}
function install(){if(!isVisible())return;style();hooks();decorate();if(window.state?.contractTab===TAB&&!editing)render()}
window.StainherGastosR342={install,render};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('stainher:modules-ready',install);
setInterval(()=>{if(window.state?.session?.user)install()},3500);
})();