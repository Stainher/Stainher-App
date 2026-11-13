/* R342 · Gastos Operacionales · Desarrollo 30 */
(()=>{
'use strict';
if(window.StainherGastosR342)return;
const TAB='gastos_operacionales_r342',TABLE='gastos_operacionales_r342',BUCKET='gastos-operacionales-r342';
const PROOF_BUCKET='comprobantes-transferencias';
const PROOF_TYPES=['image/jpeg','image/png','image/webp','application/pdf'];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'$'+Math.round(Number(v)||0).toLocaleString('es-CL');
const month=()=>new Date().toLocaleDateString('en-CA').slice(0,7);
const isManager=()=>['administrador'].includes(String(window.state?.profile?.rol||'').toLowerCase())&&!window.state?.v15PreviewRole;
const isVisible=()=>['administrador','gerente'].includes(String(window.state?.profile?.rol||'').toLowerCase())&&!window.state?.v15PreviewRole;
let period=month(),rows=[],people=[],transfers=[],unpaidRows=[],transferPerson='',subtab='historial',editing=null,loading=false;
function style(){
if(document.getElementById('r342-css'))return;
const x=document.createElement('style');x.id='r342-css';x.textContent=`
#contractContent .r342-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:12px 0}
#contractContent .r342-kpi{border:1px solid rgba(255,255,255,.16)!important;border-radius:12px;padding:15px 16px;min-height:86px;box-sizing:border-box;background:linear-gradient(135deg,#103b63 0%,#17598e 55%,#2276ab 100%)!important;box-shadow:0 5px 14px rgba(15,41,68,.12);color:#ffffff!important}
#contractContent .r342-kpi small,#contractContent .r342-kpi small *{display:block;color:#eaf4ff!important;opacity:1!important;font-size:12px!important;font-weight:600!important;line-height:1.35!important;margin-bottom:7px}
#contractContent .r342-kpi strong,#contractContent .r342-kpi strong *{display:block;color:#ffffff!important;opacity:1!important;font-size:clamp(20px,2.2vw,29px)!important;line-height:1.15!important;font-weight:800!important;font-variant-numeric:tabular-nums!important;text-shadow:0 1px 2px rgba(0,0,0,.16)}
#contractContent .r342-kpi:hover{filter:brightness(1.06)}
@media(prefers-reduced-motion:no-preference){#contractContent .r342-kpi{transition:filter .16s ease}}
#contractContent .r342-toolbar{display:grid!important;grid-template-columns:minmax(240px,1fr) minmax(205px,320px) max-content max-content;align-items:end!important;gap:12px!important;margin:14px 0 18px;max-width:100%;box-sizing:border-box}
#contractContent .r342-toolbar .r349-toolbar-intro{align-self:center;min-width:0}
#contractContent .r342-toolbar .r349-toolbar-intro h3{margin:0 0 5px}
#contractContent .r342-toolbar .r349-period-label{display:flex;flex-direction:column;gap:5px;min-width:0;width:100%;margin:0}
#contractContent .r342-toolbar .r345-period{max-width:none;width:100%}
#contractContent .r342-toolbar>.btn{height:44px!important;min-height:44px!important;white-space:nowrap!important;align-self:end!important;display:inline-flex!important;align-items:center!important;justify-content:center!important;margin:0!important;box-sizing:border-box!important}
#contractContent .r342-actions{display:flex;align-items:center;gap:9px;flex-wrap:wrap;margin:12px 0}
@media(min-width:901px) and (max-width:1280px){#contractContent .r342-toolbar{grid-template-columns:minmax(200px,1fr) minmax(190px,300px);gap:10px}#contractContent .r342-toolbar>.btn{justify-self:start}}
@media(max-width:900px){#contractContent .r342-toolbar{display:grid!important;grid-template-columns:repeat(2,minmax(0,1fr));gap:10px!important}#contractContent .r342-toolbar .r349-toolbar-intro,#contractContent .r342-toolbar .r349-period-label{grid-column:1/-1;width:100%}#contractContent .r342-toolbar>.btn{width:100%!important;white-space:normal!important;min-width:0!important;text-align:center!important}}
@media(max-width:390px){#contractContent .r342-toolbar{grid-template-columns:1fr}#contractContent .r342-toolbar>.btn{grid-column:1/-1}}
#contractContent .r342-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}
#contractContent .r342-form label{display:grid;gap:5px;font-size:12px;color:var(--muted)}
#contractContent .r342-form .wide{grid-column:1/-1}
#contractContent .r342-form input,#contractContent .r342-form select,#contractContent .r342-form textarea{min-width:0;width:100%;max-width:100%;box-sizing:border-box}

#contractContent .r345-date-field{display:block;position:relative;width:100%;min-width:0;max-width:100%;box-sizing:border-box}
#contractContent .r345-date-button{display:flex!important;align-items:center!important;justify-content:space-between!important;gap:10px;width:100%!important;min-width:0!important;max-width:100%!important;min-height:44px!important;padding:10px 12px!important;box-sizing:border-box!important;text-align:left!important;white-space:normal!important;overflow:hidden!important;border:1px solid #acbfd1!important;border-radius:9px!important;background:#fff!important;color:#142d43!important;font-size:15px!important}
#contractContent .r345-date-button span{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;min-width:0}
#contractContent .r345-calendar{width:100%;max-width:100%;min-width:0;box-sizing:border-box;padding:10px;margin-top:5px;border:1px solid #b4cbe0;border-radius:12px;background:#f7fbff;color:#132c46;box-shadow:0 4px 12px rgba(14,42,72,.12);overflow:hidden}
#contractContent .r345-calendar-head{display:grid;grid-template-columns:38px minmax(0,1fr) 38px;align-items:center;gap:5px;margin-bottom:9px}
#contractContent .r345-calendar-head strong{text-align:center;font-size:14px;color:#15395e;min-width:0}
#contractContent .r345-calendar-head button,#contractContent .r345-calendar-days button{width:100%!important;min-width:0!important;max-width:100%!important;box-sizing:border-box!important;color:#15395e!important;border:1px solid transparent!important;background:transparent!important;border-radius:7px!important;box-shadow:none!important;padding:0!important}
#contractContent .r345-calendar-head button{height:36px!important;background:#e5f0fa!important}
#contractContent .r345-calendar-days{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:2px;max-width:100%;min-width:0}
#contractContent .r345-calendar-days span{font-size:11px;text-align:center;color:#536d83;padding:7px 0}
#contractContent .r345-calendar-days button{height:37px!important;font-size:13px!important}
#contractContent .r345-calendar-days button[data-selected="1"]{background:#155b96!important;color:white!important}
#contractContent .r345-calendar-days button:not([data-selected="1"]):hover{background:#e0edf9!important}
#contractContent .r345-calendar-clear{margin-top:6px;min-height:36px}
#contractContent .r345-period{display:grid;grid-template-columns:minmax(0,1fr) 94px;gap:7px;width:100%;max-width:340px;min-width:0}
#contractContent .r345-period select{width:100%;min-width:0;max-width:100%;box-sizing:border-box;background:#fff;color:#16324c}
@media(max-width:900px){#contractContent .r342-toolbar>label{width:100%;min-width:0}#contractContent .r345-period{max-width:100%}#contractContent .r342-form label{min-width:0;max-width:100%;box-sizing:border-box}#contractContent .r345-calendar{padding:7px}#contractContent .r345-calendar-days button{height:40px!important}}
#contractContent .r348-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px;margin:12px 0}
#contractContent .r348-fields label{display:grid;gap:6px;min-width:0}
#contractContent .r348-fields input,#contractContent .r348-fields select{width:100%;max-width:100%;min-width:0;box-sizing:border-box}
#contractContent .r348-list{display:grid;gap:7px;max-height:360px;overflow-y:auto;margin:14px 0}
#contractContent .r348-item{display:flex;gap:11px;align-items:center;padding:11px;border:1px solid var(--line,#bbcede);border-radius:10px;background:var(--panel,#f8fafc)}
#contractContent .r348-item input{width:20px;height:20px;flex:none}
#contractContent .r348-item span{min-width:0;flex:1;overflow-wrap:anywhere}
#contractContent .r348-item small{display:block;color:var(--muted);margin-top:4px}
#contractContent .r348-total{display:flex;justify-content:space-between;align-items:center;gap:12px;flex-wrap:wrap;margin:18px 0 28px}
@media(max-width:850px){#contractContent .r348-fields{grid-template-columns:1fr}}
#contractContent .r342-table-wrap{width:100%;overflow-x:auto}
#contractContent .r342-table{width:100%;border-collapse:collapse;font-size:12px;white-space:nowrap}
#contractContent .r342-table th,#contractContent .r342-table td{padding:9px;border-bottom:1px solid var(--line,#ccc);text-align:left}
#contractContent .r420-transferred{display:inline-flex;align-items:center;justify-content:center;box-sizing:border-box;min-height:36px;padding:6px 11px;margin:0;border:1px solid #11633d;border-radius:8px;background:#146640!important;color:#fff!important;-webkit-text-fill-color:#fff!important;font-family:inherit;font-size:12px;font-weight:750;line-height:1.2;white-space:nowrap}
#contractContent span.r420-transferred{cursor:default}
#contractContent button.r420-transferred{appearance:none;cursor:pointer}
#contractContent button.r420-transferred:focus-visible{outline:2px solid #208d59;outline-offset:2px}
#contractContent .r420-proof{display:grid;gap:6px;margin:10px 0}
#contractContent .r420-proof input{max-width:100%;min-width:0}
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
if(subtab==='reembolsos'){
 transfers=await periodTransfers(rows);
 unpaidRows=rows.filter(r=>!r.anulado&&!r.transferencia_id&&Number(r.reembolso_personal_monto||0)===0);
 if(!unpaidRows.some(x=>personKey(x)===transferPerson))transferPerson=unpaidRows[0]?personKey(unpaidRows[0]):'';
}
if(!people.length){const p=await window.sb.from('perfiles').select('id,nombre').eq('activo',true).order('nombre');if(!p.error)people=p.data||[]}
}
const personKey=r=>r.realizado_por||'externo:'+r.realizado_por_nombre.toLocaleLowerCase('es-CL');
async function periodTransfers(expenses){
 const byTransfer=new Map();
 for(const expense of expenses){
  if(expense.anulado||!expense.transferencia_id)continue;
  const id=expense.transferencia_id;
  if(!byTransfer.has(id))byTransfer.set(id,{documents:[],periodTotal:0});
  const group=byTransfer.get(id);
  group.documents.push(expense.numero_documento||expense.detalle);
  group.periodTotal+=Number(expense.reembolso_personal_monto||0);
 }
 const ids=[...byTransfer.keys()],result=[];
 for(let offset=0;offset<ids.length;offset+=100){
  const response=await window.sb.from('gastos_transferencias_r348').select('*')
   .eq('anulada',false).in('id',ids.slice(offset,offset+100));
  if(response.error)throw response.error;
  for(const transfer of response.data||[]){
   const group=byTransfer.get(transfer.id);
   if(!transfer.anulada&&group)result.push({...transfer,...group});
  }
 }
 return result.sort((a,b)=>b.fecha.localeCompare(a.fecha)||String(a.id).localeCompare(String(b.id)));
}
function nextMonth(s){const [y,m]=s.split('-').map(Number);return new Date(Date.UTC(y,m,1)).toISOString().slice(0,10)}
function totals(){
const all=rows.filter(r=>!r.anulado);return {total:all.reduce((s,r)=>s+Number(r.monto),0),personal:all.reduce((s,r)=>s+Math.max(0,Number(r.monto)-Number(r.reembolso_personal_monto||0)),0),devuelto:all.reduce((s,r)=>s+Math.min(Number(r.monto),Number(r.reembolso_personal_monto||0)),0)}
}
function transferStatus(row){
 if(Number(row.reembolso_personal_monto)>=Number(row.monto)){
  if(row.transferencia_id)return '<button type="button" class="r420-transferred" data-r342="open-transfer" data-id="'+esc(row.transferencia_id)+'" aria-label="Transferido, ver transferencia">Transferido</button>';
  return '<span class="r420-transferred">Transferido</span>';
 }
 return Number(row.reembolso_personal_monto)>0?'Parcial<br>'+money(row.reembolso_personal_monto):'Pendiente';
}
function header(){
const t=totals();return `<div class="r342-toolbar"><div class="r349-toolbar-intro"><h3>Gastos Operacionales</h3><div class="r342-note">Contrato 4600029879 · Los reembolsos no duplican el gasto.</div></div><label class="r349-period-label">Mes ${r345MonthSelector()}</label>${isManager()?'<button type="button" class="btn primary" data-r342="new">+ Registrar gasto</button>':''}<button type="button" class="btn" data-r342="pdf">Generar informe PDF</button></div>
<div class="r342-grid"><div class="r342-kpi"><small>Total del mes</small><strong>${money(t.total)}</strong></div><div class="r342-kpi"><small>Pendiente al personal</small><strong>${money(t.personal)}</strong></div><div class="r342-kpi"><small>Devuelto al personal</small><strong>${money(t.devuelto)}</strong></div></div>
<div class="r342-actions"><button class="btn ${subtab==='historial'?'primary':''}" data-r342="history">Historial</button><button class="btn ${subtab==='reembolsos'?'primary':''}" data-r342="reimb">Reembolsos</button></div>`}
function history(){
const filtered=rows.filter(r=>!r.anulado);
return `<div class="r342-table-wrap"><table class="r342-table"><thead><tr><th>Fecha</th><th>Tipo / detalle</th><th>Realizado por</th><th>Documento</th><th>Monto</th><th>Codelco</th><th>Devolución al personal</th><th>Comprobante</th><th>Acciones</th></tr></thead><tbody>${filtered.map(r=>`<tr style="${r.anulado?'opacity:.5':''}"><td>${esc(r.fecha)}</td><td>${esc(r.categoria)}<br><small>${esc(r.detalle)}</small></td><td>${esc(r.realizado_por_nombre)}</td><td>${esc(r.tipo_documento)} ${esc(r.numero_documento)}</td><td>${money(r.monto)}</td><td>${r.ofertable_codelco?'Sí':'No'}</td><td>${transferStatus(r)}</td><td>${r.comprobante_path?'<button class="btn" data-r342="file" data-id="'+esc(r.id)+'">Ver</button>':'—'}</td><td>${isManager()&&!r.anulado?'<button class="btn" data-r342="edit" data-id="'+esc(r.id)+'">Editar</button> <button class="btn" data-r342="void" data-id="'+esc(r.id)+'">Anular</button>':r.anulado?'Anulado':'—'}</td></tr>`).join('')||'<tr><td colspan="9">Sin gastos para el período seleccionado.</td></tr>'}</tbody></table></div>`}
function personOptions(v){return '<option value="">Seleccionar</option>'+people.map(p=>`<option value="${esc(p.id)}" ${p.id===v?'selected':''}>${esc(p.nombre)}</option>`).join('')}
function opt(a,v){return a.map(s=>`<option ${s===v?'selected':''} value="${esc(s)}">${esc(s)}</option>`).join('')}

const r345Months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
const r345DateCL=v=>/^[0-9]{4}-[0-9]{2}-[0-9]{2}$/.test(String(v||''))?v.slice(8,10)+'-'+v.slice(5,7)+'-'+v.slice(0,4):'Seleccionar fecha';
function r345DateField(name,value){
return `<div class="r345-date-field" data-r345-field="${esc(name)}"><input type="hidden" name="${esc(name)}" value="${esc(value||'')}"><button class="r345-date-button" type="button" data-r345-open="${esc(name)}" aria-label="Seleccionar fecha" aria-expanded="false"><span data-r345-label>${esc(r345DateCL(value))}</span><span aria-hidden="true">▦</span></button><div data-r345-panel hidden></div></div>`;
}
function r345CalendarMarkup(field,monthValue){
const value=field.querySelector('input[type="hidden"]').value;
const [year,monthNumber]=monthValue.split('-').map(Number);
const offset=(new Date(Date.UTC(year,monthNumber-1,1)).getUTCDay()+6)%7;
const days=new Date(Date.UTC(year,monthNumber,0)).getUTCDate();
const heading=new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(Date.UTC(year,monthNumber-1,1)));
let buttons=['L','M','M','J','V','S','D'].map(d=>'<span>'+d+'</span>').join('');
for(let i=0;i<offset;i++)buttons+='<span aria-hidden="true"></span>';
for(let day=1;day<=days;day++){
const date=monthValue+'-'+String(day).padStart(2,'0');
buttons+=`<button type="button" data-r345-day="${date}" data-selected="${date===value?'1':'0'}" aria-label="${date}">${day}</button>`;
}
return `<div class="r345-calendar" role="group" aria-label="Calendario de fecha"><div class="r345-calendar-head"><button type="button" data-r345-shift="-1" aria-label="Mes anterior">‹</button><strong>${esc(heading)}</strong><button type="button" data-r345-shift="1" aria-label="Mes siguiente">›</button></div><div class="r345-calendar-days">${buttons}</div><button class="btn r345-calendar-clear" type="button" data-r345-clear="1">Limpiar fecha</button></div>`;
}
function r345CalendarAction(e){
const b=e.target.closest('[data-r345-open],[data-r345-shift],[data-r345-day],[data-r345-clear]');
if(!b)return false;
const field=b.closest('[data-r345-field]');if(!field)return false;
const panel=field.querySelector('[data-r345-panel]'),input=field.querySelector('input[type="hidden"]');
if(b.dataset.r345Open!==undefined){
const wasOpen=!panel.hidden;
document.querySelectorAll('#r342-form [data-r345-panel]').forEach(p=>{p.hidden=true;p.previousElementSibling?.setAttribute('aria-expanded','false')});
if(!wasOpen){panel.hidden=false;panel.dataset.r345Month=(input.value||new Date().toISOString().slice(0,10)).slice(0,7);panel.innerHTML=r345CalendarMarkup(field,panel.dataset.r345Month);b.setAttribute('aria-expanded','true')}
}else if(b.dataset.r345Shift!==undefined){
const [year,monthNumber]=panel.dataset.r345Month.split('-').map(Number);
const shifted=new Date(Date.UTC(year,monthNumber-1+Number(b.dataset.r345Shift),1));
panel.dataset.r345Month=shifted.toISOString().slice(0,7);
panel.innerHTML=r345CalendarMarkup(field,panel.dataset.r345Month);
}else{
input.value=b.dataset.r345Clear!==undefined?'':b.dataset.r345Day;
field.querySelector('[data-r345-label]').textContent=r345DateCL(input.value);
panel.hidden=true;field.querySelector('[data-r345-open]').setAttribute('aria-expanded','false');
}
return true;
}
function r345MonthSelector(){
const [year,m]=period.split('-').map(Number);
return `<span class="r345-period"><select class="field" id="r345-period-month" aria-label="Mes">${r345Months.map((name,i)=>`<option value="${String(i+1).padStart(2,'0')}" ${i+1===m?'selected':''}>${name}</option>`).join('')}</select><select class="field" id="r345-period-year" aria-label="Año">${Array.from({length:13},(_,i)=>year-6+i).map(y=>`<option value="${y}" ${y===year?'selected':''}>${y}</option>`).join('')}</select></span>`;
}

function form(r={}){
const d=r.fecha||new Date().toLocaleDateString('en-CA');return `<h3>${r.id?'Editar':'Registrar'} gasto</h3><form id="r342-form" class="r342-form">
<label>Fecha del gasto${r345DateField("fecha",d)}</label>
<label>Tipo de gasto<select class="field" name="categoria">${opt(['Insumos y materiales','Herramientas','Movilización','Alimentación','Caja chica','Compras operacionales','Gastos administrativos','Otros'],r.categoria||'Insumos y materiales')}</select></label>
<label>Monto CLP<input class="field" type="number" min="1" step="1" name="monto" required value="${esc(r.monto||'')}"></label>
<label class="wide">Detalle<textarea class="field" name="detalle" maxlength="1000" required>${esc(r.detalle||'')}</textarea></label>
<label>Tipo documento<select class="field" name="tipo_documento">${opt(['boleta','factura','otro','sin_documento'],r.tipo_documento||'boleta')}</select></label>
<label>Número de boleta/factura<input class="field" name="numero_documento" maxlength="120" value="${esc(r.numero_documento||'')}"></label>
<label>Realizado por<input class="field" name="realizado_por_nombre" maxlength="160" autocomplete="off" required placeholder="Nombre de quien realizó el gasto" value="${esc(r.realizado_por_nombre||window.state?.profile?.nombre||'')}"></label>
<label>¿Se ofertará a Codelco?<select class="field" name="ofertable_codelco"><option value="false" ${!r.ofertable_codelco?'selected':''}>No</option><option value="true" ${r.ofertable_codelco?'selected':''}>Sí</option></select></label>
<div class="wide r342-note">Los reembolsos se registran agrupando boletas y facturas desde la pestaña Reembolsos, por su monto completo.</div>
<label class="wide">Comprobante (JPG, PNG, WebP o PDF · máximo 10 MB)<input type="file" name="archivo" accept="image/jpeg,image/png,image/webp,application/pdf">${r.comprobante_nombre?'<small>Actual: '+esc(r.comprobante_nombre)+'</small>':''}</label>
<label class="wide">Observaciones<textarea class="field" name="observaciones">${esc(r.observaciones||'')}</textarea></label>
<div class="wide r342-actions"><button type="submit" class="btn primary">Guardar gasto</button><button type="button" class="btn" data-r342="cancel">Cancelar</button></div>
</form>`}

function transferMarkup(){
 const persons=[...new Map(unpaidRows.map(r=>[personKey(r),r.realizado_por_nombre])).entries()];
 const candidates=unpaidRows.filter(r=>personKey(r)===transferPerson);
 const selector=persons.map(([id,name])=>'<option value="'+esc(id)+'" '+(id===transferPerson?'selected':'')+'>'+esc(name)+'</option>').join('');
 const items=candidates.map(r=>'<label class="r348-item"><input type="checkbox" data-r348-check name="gastos" value="'+esc(r.id)+'"><span>'+esc(r.fecha)+' · '+esc(r.tipo_documento)+' '+esc(r.numero_documento)+'<small>'+esc(r.detalle)+'</small></span><b>'+money(r.monto)+'</b></label>').join('');
 const form=isManager()?'<form id="r348-transfer-form"><div class="r348-fields"><label>Trabajador<select class="field" id="r348-person">'+selector+'</select></label><label>Fecha de transferencia'+r345DateField('fecha_transferencia',new Date().toISOString().slice(0,10))+'</label><label>Transferido por<input class="field" name="pagado_por" value="Cristian Lagos" required></label></div><div class="r348-list">'+(items||'<div class="r342-note">No existen documentos pendientes.</div>')+'</div><label class="r420-proof">Comprobante de transferencia (opcional · PDF o imagen · máximo 10 MB)<input type="file" name="transfer_proof" accept="'+PROOF_TYPES.join(',')+'"></label><div class="r348-total"><b>Total de transferencia: <span id="r348-total">$0</span></b><button type="submit" class="btn primary">Registrar transferencia</button></div></form>':'';
 const historyRows=transfers.map(t=>{
  const id=esc(t.id);
  const documents=t.documents.map(esc).join(', ');
  const proof=t.comprobante_path
   ?'<button type="button" class="btn" data-r342="view-transfer-proof" data-id="'+id+'">Ver comprobante</button>'
   :isManager()?'<button type="button" class="btn" data-r342="attach-transfer-proof" data-id="'+id+'">Adjuntar comprobante</button>':'—';
  const cancel=isManager()?'<button class="btn" type="button" data-r342="cancel-transfer" data-id="'+id+'">Eliminar transferencia</button>':'—';
  return '<tr data-r420-transfer="'+id+'"><td>'+esc(t.fecha)+'</td><td>'+esc(t.realizado_por_nombre)+'</td><td>'+esc(t.pagado_por)+'</td><td>'+documents+'</td><td>'+money(t.periodTotal)+'</td><td>'+proof+'</td><td>'+cancel+'</td></tr>';
 }).join('');
 return '<section class="r348-panel"><h3>Transferencias agrupadas</h3><p class="r342-note">Seleccione las boletas o facturas del mes del gasto. El historial muestra el importe devuelto por los documentos de ese mes. Un comprobante puede respaldar varias boletas o facturas.</p>'+form+'<h3>Historial de transferencias</h3><div class="r342-table-wrap"><table class="r342-table"><thead><tr><th>Fecha de transferencia</th><th>Trabajador</th><th>Transferido por</th><th>Boletas y facturas del mes</th><th>Devuelto por gastos del mes</th><th>Comprobante</th><th>Acciones</th></tr></thead><tbody>'+(historyRows||'<tr><td colspan="7">Sin transferencias registradas.</td></tr>')+'</tbody></table></div></section>';
}
function transferTotal(){
 const el=document.getElementById('r348-total'),form=document.getElementById('r348-transfer-form');
 if(!form||!el)return;
 const ids=new Set([...form.querySelectorAll('[data-r348-check]:checked')].map(x=>x.value));
 el.textContent=money(unpaidRows.filter(r=>ids.has(r.id)).reduce((sum,r)=>sum+Number(r.monto),0));
}
async function withTransferProof(file,commit){
 if(!file?.size||file.size>10485760||!PROOF_TYPES.includes(file.type))throw Error('Seleccione un PDF o una imagen de hasta 10 MB.');
 const me=(await window.sb.auth.getUser()).data?.user?.id;
 if(!me)throw Error('Sesión expirada.');
 const path=me+'/'+crypto.randomUUID();
 const storage=window.sb.storage.from(PROOF_BUCKET);
 const upload=await storage.upload(path,file,{contentType:file.type,upsert:false});
 if(upload.error)throw upload.error;
 const saved=await commit(path);
 if(saved.error){
  // La política impide borrar el objeto si el servidor alcanzó a vincularlo.
  try{await storage.remove([path])}catch(_){}
  throw saved.error;
 }
}
function attachTransferProof(id){
 const picker=document.createElement('input');
 picker.type='file';
 picker.accept=PROOF_TYPES.join(',');
 picker.onchange=async()=>{
  const file=picker.files?.[0];
  if(!file||!isManager())return;
  try{
   await withTransferProof(file,path=>window.sb.rpc('adjuntar_comprobante_transferencia_r420',{p_transferencia:id,p_archivo:path}));
   window.toast?.('Comprobante adjuntado.','success');
   await render();
  }catch(error){window.toast?.(error.message,'error')}
 };
 picker.click();
}

async function submitTransfer(e){
 e.preventDefault();if(!isManager())return;
 const form=e.currentTarget,ids=[...form.querySelectorAll('[data-r348-check]:checked')].map(x=>x.value);
 const date=form.querySelector('[name="fecha_transferencia"]')?.value,payer=String(form.querySelector('[name="pagado_por"]')?.value||'').trim();
 if(!ids.length||!date||!payer)return window.toast?.('Seleccione boletas, fecha y quien transfirió.','error');
 const button=form.querySelector('[type="submit"]');
 if(button.disabled)return;
 button.disabled=true;
 try{
  const args={p_gastos:ids,p_fecha:date,p_pagado_por:payer};
  const file=form.querySelector('[name="transfer_proof"]')?.files?.[0];
  if(file)await withTransferProof(file,path=>window.sb.rpc('registrar_transferencia_gastos_r420',{...args,p_archivo:path}));
  else{
   const q=await window.sb.rpc('registrar_transferencia_gastos_r348',args);
   if(q.error)throw q.error;
  }
  window.toast?.('Transferencia registrada con el total de los documentos.','success');
  await render();
 }catch(error){window.toast?.(error.message,'error');button.disabled=false}
}

async function render(){
if(window.state?.contractTab!==TAB||!isVisible())return;
const host=document.getElementById('contractContent');if(!host||loading)return;
loading=true;host.innerHTML='<div class="empty">Cargando gastos…</div>';style();decorate();
try{await load();host.innerHTML=header()+'<div id="r342-body">'+(editing?form(editing===true?{}:editing):subtab==='reembolsos'?transferMarkup():history())+'</div>';
host.onclick=action;host.onchange=e=>{if(e.target.id==='r348-person'){transferPerson=e.target.value;const body=host.querySelector('#r342-body');body.innerHTML=transferMarkup();const tf=body.querySelector('#r348-transfer-form');if(tf)tf.onsubmit=submitTransfer;return}if(e.target.matches('[data-r348-check]')){transferTotal();return}if(e.target.id==='r345-period-month'||e.target.id==='r345-period-year'){period=host.querySelector('#r345-period-year').value+'-'+host.querySelector('#r345-period-month').value;editing=null;render()}};
const formElement=host.querySelector('#r342-form');if(formElement)formElement.onsubmit=save;const tf=host.querySelector('#r348-transfer-form');if(tf)tf.onsubmit=submitTransfer;
}catch(e){host.innerHTML='<div class="r342-error">No se pudieron cargar los gastos: '+esc(e.message)+'</div>'}finally{loading=false}
}
async function save(e){
e.preventDefault();const form=e.currentTarget,b=new FormData(form),file=b.get('archivo'),personName=String(b.get('realizado_por_nombre')||'').trim().replace(/\s+/g,' '),selected=people.find(p=>p.nombre?.toLocaleLowerCase('es-CL')===personName.toLocaleLowerCase('es-CL'));
const amount=Number(b.get('monto')),ofertable=b.get('ofertable_codelco')==='true';
if(!personName||personName.length>160||!Number.isSafeInteger(amount)||amount<=0){window.toast?.('Revise montos y responsable del gasto.','error');return}
if(file&&file.size&&(!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type)||file.size>10485760)){window.toast?.('Comprobante no admitido o mayor a 10 MB.','error');return}
const payload={fecha:b.get('fecha'),categoria:b.get('categoria'),detalle:String(b.get('detalle')).trim(),monto:amount,tipo_documento:b.get('tipo_documento'),numero_documento:b.get('numero_documento')||'',realizado_por:selected?.id||null,realizado_por_nombre:selected?.nombre||personName,ofertable_codelco:ofertable,estado_codelco:ofertable?(['ofertado','recuperado'].includes(editing?.estado_codelco)?editing.estado_codelco:'pendiente'):'no_aplica',observaciones:b.get('observaciones')||'',updated_at:new Date().toISOString()};
const button=form.querySelector('[type="submit"]');button.disabled=true;
try{
const isEdit=editing&&editing.id;if(isEdit&&editing.transferencia_id&&(Number(editing.monto)!==amount||String(editing.realizado_por_nombre).toLocaleLowerCase('es-CL')!==personName.toLocaleLowerCase('es-CL')))throw Error('No se puede modificar el monto o responsable de una boleta ya reembolsada.');let q=isEdit?await window.sb.from(TABLE).update(payload).eq('id',editing.id).select().single():await window.sb.from(TABLE).insert(payload).select().single();if(q.error)throw q.error;
if(file&&file.size){const me=(await window.sb.auth.getUser()).data?.user?.id;if(!me)throw Error('Sesión expirada');
const safeName=String(file.name).replace(/[^a-zA-Z0-9._-]/g,'_').slice(-100);const path=q.data.id+'/'+me+'/'+Date.now()+'-'+safeName;
const upload=await window.sb.storage.from(BUCKET).upload(path,file,{contentType:file.type,upsert:false});if(upload.error)throw upload.error;
const update=await window.sb.from(TABLE).update({comprobante_path:path,comprobante_nombre:file.name,comprobante_mime:file.type}).eq('id',q.data.id);if(update.error)throw update.error;
}
editing=null;period=String(payload.fecha).slice(0,7);window.toast?.('Gasto registrado correctamente.','success');await render();
}catch(err){window.toast?.('Error: '+err.message,'error');button.disabled=false}
}
async function action(e){
if(r345CalendarAction(e))return;
const b=e.target.closest('[data-r342]');if(!b)return;const cmd=b.dataset.r342,id=b.dataset.id,r=rows.find(x=>x.id===id);
if(cmd==='new'){if(!isManager())return;editing=true;document.getElementById('r342-body').innerHTML=form({});document.getElementById('r342-form').onsubmit=save}
if(cmd==='edit'&&r){editing=r;document.getElementById('r342-body').innerHTML=form(r);document.getElementById('r342-form').onsubmit=save}
if(cmd==='cancel'){editing=null;render()}
if(cmd==='history'||cmd==='reimb'){subtab=cmd==='history'?'historial':'reembolsos';editing=null;render()}
if(cmd==='open-transfer'){
 subtab='reembolsos';editing=null;
 await render();
 document.querySelector('[data-r420-transfer="'+CSS.escape(id)+'"]')?.scrollIntoView({block:'nearest'});
 return;
}
if(cmd==='attach-transfer-proof'&&isManager()&&transfers.some(t=>t.id===id&&!t.comprobante_path)){
 attachTransferProof(id);return;
}
if(cmd==='view-transfer-proof'){
 const path=transfers.find(t=>t.id===id)?.comprobante_path;
 if(!path)return;
 const q=await window.sb.storage.from(PROOF_BUCKET).createSignedUrl(path,60);
 if(q.error)return window.toast?.(q.error.message,'error');
 window.open(q.data.signedUrl,'_blank','noopener,noreferrer');return;
}
if(cmd==='cancel-transfer'&&isManager()){const t=transfers.find(x=>x.id===id);if(!t||t.anulada)return;const reason=prompt('Motivo de anulación de transferencia:');if(reason===null)return;if(reason.trim().length<5)return window.toast?.('Ingrese un motivo válido.','error');if(!confirm('¿Anular la transferencia completa y liberar todas sus boletas, incluidas las de otros meses?'))return;const out=await window.sb.rpc('anular_transferencia_gastos_r352',{p_transferencia:id,p_motivo:reason.trim()});if(out.error)return window.toast?.(out.error.message,'error');window.toast?.('Transferencia anulada y boletas liberadas.','success');await render();return}
if(cmd==='file'&&r?.comprobante_path){const q=await window.sb.storage.from(BUCKET).createSignedUrl(r.comprobante_path,60);if(q.error)return window.toast?.(q.error.message,'error');window.open(q.data.signedUrl,'_blank','noopener')}
if(cmd==='void'&&r&&isManager()){if(r.transferencia_id)return window.toast?.('El gasto está vinculado a una transferencia y no puede anularse.','error');const reason=prompt('Motivo de anulación (el historial se conserva):');if(!reason?.trim())return;const q=await window.sb.from(TABLE).update({anulado:true,motivo_anulacion:reason.trim()}).eq('id',r.id);if(q.error)return window.toast?.(q.error.message,'error');render()}
if(cmd==='pdf')report();
}
async function report(){
 const current=rows.filter(r=>!r.anulado);
 const totals=(()=>{const sum=key=>current.reduce((s,r)=>s+Number(r[key]||0),0);return {total:sum('monto'),personal:current.reduce((s,r)=>s+Math.max(0,Number(r.monto)-Number(r.reembolso_personal_monto||0)),0),devuelto:sum('reembolso_personal_monto')}})();
 try{
  if(!window.PDFLib){
   await new Promise((resolve,reject)=>{const e=document.createElement('script');e.src='https://cdn.jsdelivr.net/npm/pdf-lib@1.17.1/dist/pdf-lib.min.js';e.onload=resolve;e.onerror=()=>reject(Error('Motor PDF no disponible'));document.head.appendChild(e)})
  }
  const {PDFDocument,StandardFonts,rgb}=window.PDFLib;
  const doc=await PDFDocument.create();
  const normal=await doc.embedFont(StandardFonts.Helvetica),bold=await doc.embedFont(StandardFonts.HelveticaBold);
  const W=841.89,H=595.28,L=37,R=37,usable=W-L-R;
  const ink=rgb(.10,.15,.22),muted=rgb(.36,.43,.52),navy=rgb(.075,.11,.15),slate=rgb(.14,.18,.24),orange=rgb(.96,.30,.12),white=rgb(1,1,1),stripe=rgb(.95,.96,.97),line=rgb(.84,.87,.90);
  const safe=v=>String(v??'').replace(/[\u2018\u2019]/g,"'").replace(/[\u201c\u201d]/g,'"').replace(/[\u2013\u2014]/g,'-').replace(/[^\x20-\xFF]/g,'?');
  const monthName=new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric',timeZone:'UTC'}).format(new Date(period+'-01T12:00:00Z'));
  const CL=v=>{const m=String(v||'').match(/^(\d{4})-(\d{2})-(\d{2})$/);return m?m[3]+'-'+m[2]+'-'+m[1]:String(v||'-')};
  const emitDate=new Intl.DateTimeFormat('es-CL',{dateStyle:'medium',timeZone:'America/Santiago'}).format(new Date());
  const fit=(value,font,size,maxWidth)=>{
   let str=safe(value).replace(/\s+/g,' ').trim();
   if(!str)return '-';
   while(str.length>1&&font.widthOfTextAtSize(str,size)>maxWidth)str=str.slice(0,-1);
   return str===safe(value).replace(/\s+/g,' ').trim()?str:str.replace(/\s+$/,'')+'...';
  };
  let page,y,pages=[];
  function put(str,x,baseline,size=9,font=normal,color=ink,maxWidth){
   page.drawText(maxWidth?fit(str,font,size,maxWidth):safe(str),{x,y:baseline,font,size,color});
  }
  function newPage(){
   page=doc.addPage([W,H]);pages.push(page);
   page.drawRectangle({x:0,y:H-119,width:W,height:119,color:navy});
   put('STAINHER ASCENSORES LTDA.',L,H-41,19,bold,white);
   put('Informe Mensual de Gastos Operacionales',L,H-67,12,bold,white);
   put('Contrato 4600029879 - Codelco División Andina',L,H-88,9,normal,white);
   put(safe(monthName).toUpperCase(),W-R-140,H-62,10,bold,white,140);
   page.drawRectangle({x:0,y:H-124,width:W,height:5,color:orange});
   y=H-158;
  }
  function section(title){
   if(y<75)newPage();
   put(title,L,y,12,bold,ink);y-=18;
  }
  function table(headers,widths,data,format){
   const rowH=21,headH=25;
   function head(){
    if(y-headH<42)newPage();
    page.drawRectangle({x:L,y:y-headH+5,width:usable,height:headH,color:slate});
    let x=L;
    headers.forEach((h,i)=>{put(h,x+7,y-12,8,bold,white,widths[i]-12);x+=widths[i]});
    y-=headH;
   }
   head();
   if(!data.length){
    page.drawRectangle({x:L,y:y-rowH+3,width:usable,height:rowH,color:stripe});
    put('Sin gastos registrados para el periodo seleccionado.',L+8,y-12,9,normal,muted);
    y-=rowH+7;return;
   }
   data.forEach((row,i)=>{
    if(y-rowH<45){newPage();head()}
    if(i%2===0)page.drawRectangle({x:L,y:y-rowH+3,width:usable,height:rowH,color:stripe});
    let x=L;
    const cells=format(row);
    cells.forEach((cell,j)=>{put(cell,x+7,y-12,7.7,normal,ink,widths[j]-12);x+=widths[j]});
    page.drawLine({start:{x:L,y:y-rowH+3},end:{x:W-R,y:y-rowH+3},thickness:.35,color:line});
    y-=rowH;
   });
   y-=13;
  }
  newPage();
  section('Resumen económico');
  const kpis=[
   ['Total de gastos',totals.total],['Devuelto al personal',totals.devuelto],['Pendiente al personal',totals.personal]
  ];
  const cardW=(usable-18)/3;
  kpis.forEach(([title,value],i)=>{
   const x=L+i*(cardW+9);
   page.drawRectangle({x,y:y-57,width:cardW,height:57,color:stripe,borderColor:line,borderWidth:.5});
   put(title,x+10,y-19,8.1,normal,muted,cardW-18);
   put(money(value),x+10,y-43,14,bold,ink,cardW-18);
  });
  y-=80;
  section('Distribución por categoría');
  const categoryRows=Object.entries(current.reduce((a,r)=>{a[r.categoria]=(a[r.categoria]||0)+Number(r.monto);return a},{})).sort((a,b)=>b[1]-a[1]);
  table(['Categoría','Cantidad','Total CLP'],[380,140,usable-520],categoryRows,
   ([name,value])=>[name,String(current.filter(r=>r.categoria===name).length),money(value)]);
  section('Detalle de gastos');
  const colW=[69,113,192,110,113,91,usable-688];
  table(['Fecha','Categoria','Detalle','Realizado por','Documento','Monto','Codelco'],colW,current,
   r=>[CL(r.fecha),r.categoria,r.detalle,r.realizado_por_nombre,
    (r.tipo_documento||'')+' '+(r.numero_documento||''),money(r.monto),r.ofertable_codelco?'Sí':'No']);
  const grouped=await periodTransfers(current);
  section('Transferencias y devoluciones al personal');
  table(['Fecha transferencia','Trabajador','Transferido por','Boletas y facturas del mes','Devuelto del mes CLP'],
   [96,140,140,246,usable-622],grouped,t=>[
    CL(t.fecha),t.realizado_por_nombre,t.pagado_por,t.documents.join(', '),money(t.periodTotal)
   ]);
  pages.forEach((p,i)=>{
   p.drawLine({start:{x:L,y:34},end:{x:W-R,y:34},thickness:.5,color:line});
   p.drawText(safe('STAINHER ASCENSORES LTDA.  |  Emitido '+emitDate),{x:L,y:19,size:8,font:normal,color:muted});
   p.drawText('Página '+(i+1)+' de '+pages.length,{x:W-R-80,y:19,size:8,font:normal,color:muted});
  });
  const bytes=await doc.save();
  const url=URL.createObjectURL(new Blob([bytes],{type:'application/pdf'}));
  const anchor=document.createElement('a');anchor.href=url;anchor.download='STAINHER_GASTOS_'+period.replace('-','_')+'.pdf';
  document.body.appendChild(anchor);anchor.click();anchor.remove();
  setTimeout(()=>URL.revokeObjectURL(url),30000);
  window.toast?.('Informe PDF institucional generado.','success');
 }catch(e){window.toast?.('No fue posible generar el informe PDF: '+e.message,'error')}
}
function install(){
 if(!isVisible())return;
 style();hooks();decorate();
 // R344: la instalación no debe recargar una pestaña ya dibujada.
 // Sólo se renderiza cuando el contenedor está vacío (primera entrada).
 const host=document.getElementById('contractContent');
 if(window.state?.contractTab===TAB && host && !loading && !editing && !host.querySelector('.r342-grid'))render();
}
window.StainherGastosR342={install,render};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('stainher:modules-ready',install);
// Sin setInterval: el refresco de 3,5 s destruía la tabla y los formularios.
})();