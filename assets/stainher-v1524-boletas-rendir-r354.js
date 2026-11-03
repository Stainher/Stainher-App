/* R354 · Boletas a rendir: módulo independiente de Administración del Contrato */
(()=>{
'use strict';
if(window.StainherBoletasR354)return;
const PAGE='boletas-rendir',TABLE='boletas_rendir_r354',BUCKET='boletas-rendir-r354',ISMAEL='44b92981-9398-42cb-a334-a51baa876125';
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const money=v=>'$'+Number(v||0).toLocaleString('es-CL');
const date=()=>{const d=new Date();return [d.getFullYear(),String(d.getMonth()+1).padStart(2,'0'),String(d.getDate()).padStart(2,'0')].join('-')};
const toast=(s,type='info')=>window.toast?.(s,type);
let uid=null,profile=null,items=[],payments=[],busy=false;
const manager=()=>uid===ISMAEL;
const page=()=>document.getElementById('page-'+PAGE);
function mount(){
 if(!document.getElementById('r354-css')){
  const s=document.createElement('style');s.id='r354-css';s.textContent=[
  '#page-boletas-rendir{padding:22px;box-sizing:border-box;max-width:100%;min-width:0}',
  '#page-boletas-rendir .r354-head{font-size:26px;font-weight:750;margin:0;color:var(--text,#17334d)}',
  '#page-boletas-rendir .r354-muted{color:var(--muted,#586c80);font-size:13px;margin:7px 0 15px}',
  '#page-boletas-rendir .r354-actions{display:flex;gap:9px;flex-wrap:wrap;margin:12px 0}',
  '#page-boletas-rendir .r354-btn{border:1px solid #afc5da;border-radius:9px;padding:9px 13px;min-height:42px;background:#fff;color:#1a4164;cursor:pointer;font-size:13px;font-weight:650}',
  '#page-boletas-rendir .r354-btn.primary{background:linear-gradient(135deg,#0c619e,#217ec0);color:#fff;border-color:#1268a7}',
  '#page-boletas-rendir .r354-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:10px;margin:16px 0}',
  '#page-boletas-rendir .r354-kpi{padding:15px;background:linear-gradient(135deg,#123d64,#2376af);border-radius:12px;color:#fff}',
  '#page-boletas-rendir .r354-kpi small,#page-boletas-rendir .r354-kpi strong{display:block;color:white!important}',
  '#page-boletas-rendir .r354-kpi strong{font-size:24px;margin-top:6px}',
  '#page-boletas-rendir .r354-panel{border:1px solid var(--line,#bdd0df);background:var(--panel,#f4f9fc);border-radius:12px;padding:15px;margin:15px 0}',
  '#page-boletas-rendir .r354-form{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:12px}',
  '#page-boletas-rendir .r354-form label{display:grid;gap:6px;min-width:0;font-size:13px}',
  '#page-boletas-rendir .r354-form .wide{grid-column:1/-1}',
  '#page-boletas-rendir .r354-form input,#page-boletas-rendir .r354-form select,#page-boletas-rendir .r354-form textarea,#page-boletas-rendir .r354-approval input,#page-boletas-rendir .r354-approval select{width:100%;min-width:0;max-width:100%;box-sizing:border-box;padding:10px;min-height:42px;border:1px solid #a4bdd2;border-radius:9px;background:#fff;color:#182e45;font-size:15px}',
  '#page-boletas-rendir .r354-form textarea{min-height:80px}',
  '#page-boletas-rendir .r354-scroll{overflow-x:auto;max-width:100%}',
  '#page-boletas-rendir table{border-collapse:collapse;width:100%;min-width:650px;font-size:12px}',
  '#page-boletas-rendir th{background:#252e3c;color:#fff;padding:10px;text-align:left}',
  '#page-boletas-rendir td{padding:10px;border-bottom:1px solid #c6d4e0;color:var(--text,#19334c)}',
  '#page-boletas-rendir tbody tr:nth-child(odd){background:var(--surface,#eaf2f8)}',
  '#page-boletas-rendir .r354-approval{display:flex;align-items:end;gap:10px;flex-wrap:wrap;margin:12px 0}',
  '#page-boletas-rendir .r354-approval label{display:grid;gap:5px;font-size:13px;min-width:180px}',
  '#page-boletas-rendir .r354-approval input[type="checkbox"]{width:20px;height:20px}',
  '@media(max-width:800px){#page-boletas-rendir{padding:12px}#page-boletas-rendir .r354-grid{grid-template-columns:repeat(2,minmax(0,1fr))}#page-boletas-rendir .r354-form{grid-template-columns:1fr}}',
  '@media(max-width:420px){#page-boletas-rendir .r354-grid{grid-template-columns:1fr}}'
  ].join('\n');document.head.appendChild(s);
 }
 const base=document.getElementById('page-solicitudes');if(!base)return false;
 if(!page()){
  const el=document.createElement('section');el.id='page-'+PAGE;el.className='page hidden';el.hidden=true;el.setAttribute('aria-hidden','true');base.insertAdjacentElement('afterend',el);
 }
 document.querySelectorAll('.nav').forEach(nav=>{
  if(nav.querySelector('button[data-page="'+PAGE+'"]'))return;
  const btn=document.createElement('button');btn.type='button';btn.dataset.page=PAGE;
  btn.innerHTML='<span aria-hidden="true">🧾</span> <span>Boletas a rendir</span>';
  const old=nav.querySelector('button[data-page="solicitudes"]');
  btn.className=(old?.className||'').replace(/\bactive\b/g,'').trim();
  if(old)old.insertAdjacentElement('afterend',btn);else nav.appendChild(btn);
  btn.addEventListener('click',()=>{if(page()&&!page().classList.contains('hidden'))render()});
 });
 return true;
}
async function identify(){
 const auth=await window.sb.auth.getUser();
 uid=auth.data?.user?.id||window.state?.session?.user?.id||null;
 if(!uid)throw Error('La sesión no está disponible.');
 if(!profile||profile.id!==uid){
  const p=await window.sb.from('perfiles').select('id,nombre').eq('id',uid).maybeSingle();
  if(p.error)throw p.error;profile=p.data||{id:uid,nombre:window.state?.profile?.nombre||'Usuario'};
 }
}
async function fetchData(){
 await identify();
 let q=window.sb.from(TABLE).select('*').order('created_at',{ascending:false}).limit(500);
 if(!manager())q=q.eq('user_id',uid);
 const a=await q;if(a.error)throw a.error;items=a.data||[];
 if(manager()){
  const b=await window.sb.from('boletas_reintegros_r354').select('*').order('created_at',{ascending:false}).limit(200);
  if(b.error)throw b.error;payments=b.data||[];
 }else payments=[];
}
function kpis(){
 const sum=a=>a.reduce((n,r)=>n+Number(r.monto||0),0);
 return '<div class="r354-grid">'+[
 ['Total rendido',sum(items)],['Pendiente de reintegro',sum(items.filter(x=>x.estado==='pendiente'))],['Reintegrado',sum(items.filter(x=>x.estado==='reintegrado'))]
 ].map(([k,v])=>'<div class="r354-kpi"><small>'+k+'</small><strong>'+money(v)+'</strong></div>').join('')+'</div>';
}
function form(){
 return '<div class="r354-panel"><h3>Nueva boleta a rendir</h3><form id="r354-upload-form" class="r354-form">'+
 '<label>Fecha del gasto<input type="date" name="fecha_gasto" value="'+date()+'" required></label>'+
 '<label>Tipo de documento<select name="tipo_documento"><option value="boleta">Boleta</option><option value="factura">Factura</option><option value="otro">Otro</option></select></label>'+
 '<label>Número de documento<input name="numero_documento" maxlength="90"></label>'+
 '<label>Monto en pesos<input type="number" name="monto" min="1" step="1" required></label>'+
 '<label class="wide">Detalle del gasto<textarea name="concepto" maxlength="700" required></textarea></label>'+
 '<label class="wide">Adjuntar fotografía o PDF de la boleta/factura (máximo 10 MB)<input type="file" name="comprobante" accept="image/jpeg,image/png,image/webp,application/pdf" required></label>'+
 '<div class="r354-actions wide"><button class="r354-btn primary" type="submit">Enviar a rendición</button><button class="r354-btn" type="button" data-r354="cancel">Cancelar</button></div></form></div>';
}
function history(){
 return '<section class="r354-panel"><h3>'+(manager()?'Todas las rendiciones':'Mis boletas a rendir')+'</h3><div class="r354-scroll"><table><thead><tr>'+
 (manager()?'<th>Solicitante</th>':'')+'<th>Fecha</th><th>Detalle</th><th>Documento</th><th>Monto</th><th>Estado</th><th>Comprobante</th></tr></thead><tbody>'+
 (items.map(r=>'<tr>'+(manager()?'<td>'+esc(r.nombre_solicitante)+'</td>':'')+
 '<td>'+esc(r.fecha_gasto)+'</td><td>'+esc(r.concepto)+'</td><td>'+esc(r.tipo_documento)+' '+esc(r.numero_documento)+'</td><td>'+money(r.monto)+'</td>'+
 '<td>'+(r.estado==='reintegrado'?'Reintegrado':'Pendiente')+'</td><td><button type="button" class="r354-btn" data-r354="file" data-id="'+esc(r.id)+'">Ver</button></td></tr>').join('')||
 '<tr><td colspan="'+(manager()?7:6)+'">Sin boletas registradas.</td></tr>')+'</tbody></table></div></section>';
}
function admin(){
 const open=items.filter(r=>r.estado==='pendiente');
 const people=[...new Map(open.map(r=>[r.user_id,r.nombre_solicitante])).entries()];
 return '<section class="r354-panel"><h3>Confirmar transferencia de reintegro</h3><p class="r354-muted">Solo Ismael Gálvez puede confirmar la devolución. Selecciona boletas de una misma persona.</p>'+
 '<div class="r354-approval"><label>Usuario<select id="r354-owner">'+people.map(([id,n])=>'<option value="'+esc(id)+'">'+esc(n)+'</option>').join('')+'</select></label>'+
 '<label>Fecha de transferencia<input id="r354-date" type="date" value="'+date()+'"></label></div><div id="r354-documents"></div>'+
 '<div class="r354-approval"><strong>Total seleccionado: <span id="r354-total">$0</span></strong><button type="button" class="r354-btn primary" data-r354="pay">Confirmar transferencia</button></div>'+
 '<h3>Transferencias confirmadas</h3><div class="r354-scroll"><table><thead><tr><th>Fecha</th><th>Solicitante</th><th>Total</th><th>Documentos</th></tr></thead><tbody>'+
 (payments.map(t=>'<tr><td>'+esc(t.fecha_transferencia)+'</td><td>'+esc(items.find(x=>x.user_id===t.user_id)?.nombre_solicitante||'Usuario')+'</td><td>'+money(t.monto_total)+'</td>'+
 '<td>'+items.filter(x=>x.transferencia_id===t.id).map(x=>esc(x.numero_documento||x.concepto)).join(', ')+'</td></tr>').join('')||
 '<tr><td colspan="4">Sin reintegros confirmados.</td></tr>')+'</tbody></table></div></section>';
}
function selected(){
 const boxes=[...(page()?.querySelectorAll('[data-r354-check]:checked')||[])];const ids=new Set(boxes.map(b=>b.value));
 return items.filter(x=>ids.has(x.id)&&x.estado==='pendiente');
}
function syncTotal(){const el=page()?.querySelector('#r354-total');if(el)el.textContent=money(selected().reduce((n,x)=>n+Number(x.monto),0))}
function documents(){
 const box=page()?.querySelector('#r354-documents');if(!box)return;
 const who=page().querySelector('#r354-owner')?.value;
 const relevant=items.filter(x=>x.user_id===who&&x.estado==='pendiente');
 box.innerHTML='<div class="r354-scroll"><table><thead><tr><th></th><th>Documento</th><th>Detalle</th><th>Monto</th></tr></thead><tbody>'+
 (relevant.map(x=>'<tr><td><input type="checkbox" data-r354-check value="'+esc(x.id)+'"></td><td>'+esc(x.tipo_documento)+' '+esc(x.numero_documento)+'</td><td>'+esc(x.concepto)+'</td><td>'+money(x.monto)+'</td></tr>').join('')||
 '<tr><td colspan="4">No hay boletas pendientes para este usuario.</td></tr>')+'</tbody></table></div>';
 syncTotal();
}
async function upload(e){
 e.preventDefault();
 const form=e.currentTarget,fd=new FormData(form),file=fd.get('comprobante'),amount=Number(fd.get('monto'));
 if(!file?.size||file.size>10485760||!['image/jpeg','image/png','image/webp','application/pdf'].includes(file.type))return toast('Adjunta una fotografía o PDF válido de hasta 10 MB.','error');
 if(!Number.isSafeInteger(amount)||amount<1)return toast('Monto inválido.','error');
 const btn=form.querySelector('[type="submit"]');btn.disabled=true;
 try{
  await identify();
  const key=uid+'/'+Date.now()+'-'+Math.random().toString(36).slice(2)+'-'+String(file.name).replace(/[^a-zA-Z0-9._-]/g,'_').slice(-100);
  const u=await window.sb.storage.from(BUCKET).upload(key,file,{contentType:file.type,upsert:false});if(u.error)throw u.error;
  const q=await window.sb.from(TABLE).insert({user_id:uid,nombre_solicitante:profile.nombre,fecha_gasto:fd.get('fecha_gasto'),
   tipo_documento:fd.get('tipo_documento'),numero_documento:String(fd.get('numero_documento')||'').trim(),
   concepto:String(fd.get('concepto')||'').trim(),monto:amount,comprobante_path:key,comprobante_nombre:file.name,comprobante_mime:file.type});
  if(q.error)throw q.error;
  toast('Boleta registrada, pendiente de reintegro.','success');await render();
 }catch(error){toast('Error al enviar: '+error.message,'error');btn.disabled=false}
}
async function pay(){
 if(!manager())return;
 const docs=selected(),dateVal=page()?.querySelector('#r354-date')?.value;
 if(!docs.length||!dateVal)return toast('Selecciona boletas y fecha.','error');
 const total=docs.reduce((n,x)=>n+Number(x.monto),0);
 if(!confirm('¿Confirmas la transferencia de '+money(total)+' a '+docs[0].nombre_solicitante+'?'))return;
 const b=page().querySelector('[data-r354="pay"]');b.disabled=true;
 try{
  const q=await window.sb.rpc('confirmar_reintegro_boletas_r354',{p_boletas:docs.map(x=>x.id),p_fecha:dateVal});
  if(q.error)throw q.error;
  toast('Reintegro confirmado y boletas actualizadas.','success');await render();
 }catch(error){toast(error.message,'error');b.disabled=false}
}
async function click(e){
 const btn=e.target.closest('[data-r354]');if(!btn)return;
 const action=btn.dataset.r354;
 if(action==='new'){const holder=page().querySelector('#r354-form-host');holder.innerHTML=form();holder.querySelector('form').onsubmit=upload}
 if(action==='cancel')page().querySelector('#r354-form-host').innerHTML='';
 if(action==='refresh')await render();
 if(action==='pay')await pay();
 if(action==='file'){
  const item=items.find(x=>x.id===btn.dataset.id);if(!item)return;
  const q=await window.sb.storage.from(BUCKET).createSignedUrl(item.comprobante_path,90);
  if(q.error)return toast(q.error.message,'error');window.open(q.data.signedUrl,'_blank','noopener,noreferrer');
 }
}
async function render(){
 const root=page();if(!root||busy)return;
 busy=true;root.innerHTML='<h2 class="r354-head">Boletas a rendir</h2><p class="r354-muted">Cargando…</p>';
 try{
  await fetchData();
  root.innerHTML='<h2 class="r354-head">Boletas a rendir</h2><p class="r354-muted">Rendición independiente de Administración del Contrato. Cada usuario ve sus propias boletas.</p>'+
   '<div class="r354-actions"><button class="r354-btn primary" data-r354="new">+ Nueva boleta</button><button class="r354-btn" data-r354="refresh">Actualizar</button></div>'+
   kpis()+'<div id="r354-form-host"></div>'+(manager()?admin():'')+history();
  root.onclick=click;
  root.onchange=e=>{if(e.target.id==='r354-owner')documents();if(e.target.matches('[data-r354-check]'))syncTotal()};
  if(manager())documents();
 }catch(error){root.innerHTML='<h2 class="r354-head">Boletas a rendir</h2><p class="r354-muted">Error: '+esc(error.message)+'</p>'}
 finally{busy=false}
}
function install(){if(window.sb)mount()}
window.StainherBoletasR354={install,render};
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.addEventListener('stainher:modules-ready',install);
})();