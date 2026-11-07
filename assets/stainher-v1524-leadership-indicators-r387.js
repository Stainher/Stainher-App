/* Stainher V15.24 R388: historial, cumplimiento y eliminación auditada; lectura bajo RLS.
   Sin MutationObservers, sin modificaciones de registros, PDF o permisos. */
(()=>{
 'use strict';
 if(window.StainherLeadershipIndicatorsR387?.build==='R388')return;
 const norm=s=>String(s||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();
 const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const getPage=()=>document.getElementById('page-liderazgo');
 let cache=null,cacheKey='',cacheAt=0,pending=null,lastRender='',installed=false;
 const removing=new Set();
 function period(){
  const s=window.state||{},now=new Date();
  let year=Number(s.leadershipYear)||now.getFullYear(),month=Number(s.leadershipMonth)||now.getMonth()+1;
  if(month<1||month>12){month=now.getMonth()+1;year=now.getFullYear()}
  return {year,month,key:year+'-'+String(month).padStart(2,'0')};
 }
 function panel(title){
  const p=getPage();if(!p)return null;
  const target=[...p.querySelectorAll('h2,h3,h4,summary')].find(el=>norm(el.textContent).includes(title));
  return target?.closest('.panel,details,section')||target?.parentElement||null;
 }
 function mount(title,key){
  const root=panel(title);if(!root)return null;
  let child=root.querySelector(':scope > [data-r387="'+key+'"]');
  if(!child){
   child=document.createElement('div');child.dataset.r387=key;child.className='stainher-r387-report';
   root.appendChild(child);
  }
  return child;
 }
 function showMessage(node,message){
  if(node)node.innerHTML='<p class="r387-muted">'+esc(message)+'</p>';
 }
 async function read(year,month,force=false){
  const key=year+'-'+month;
  if(!force&&cache&&cacheKey===key&&Date.now()-cacheAt<18000)return cache;
  if(pending&&cacheKey===key)return pending;
  const sb=window.sb;
  if(!sb?.from)throw new Error('Sin conexión a Supabase');
  cacheKey=key;
  pending=(async()=>{
   const [done,goals]=await Promise.all([
    sb.from('liderazgo_cumplimiento')
      .select('id,fecha,created_at,created_by,supervisor_nombre,supervisor_user_id,ejecutado_por_nombre,ejecutado_por_user_id,control_codigo,control_nombre,fuera_programacion,estado')
      .eq('anio',year).eq('mes',month).order('created_at',{ascending:false}).limit(250),
    sb.from('liderazgo_programacion')
      .select('meta,programado_nombre,programado_user_id,supervisor_nombre,supervisor_user_id,control_codigo')
      .eq('anio',year).eq('mes',month).limit(250)
   ]);
   if(done.error)throw new Error('Controles: '+done.error.message);
   if(goals.error)console.warn('[R387] Metas no disponibles para este perfil',goals.error.message);
   cache={done:done.data||[],goals:goals.error?[]:(goals.data||[])};
   cacheAt=Date.now();return cache;
  })();
  try{return await pending}finally{pending=null}
 }
 function countByUser(rows,goals){
  const users=new Map(),get=(row,isGoal)=>{
   const id=isGoal?(row.programado_user_id||row.supervisor_user_id||row.programado_nombre||row.supervisor_nombre):
     (row.ejecutado_por_user_id||row.supervisor_user_id||row.ejecutado_por_nombre||row.supervisor_nombre);
   const label=(isGoal?(row.programado_nombre||row.supervisor_nombre):(row.ejecutado_por_nombre||row.supervisor_nombre))||'Usuario sin identificar';
   const key=String(id||label);
   if(!users.has(key))users.set(key,{label,meta:0,done:0,free:0});
   return users.get(key);
  };
  for(const goal of goals)get(goal,true).meta+=Math.max(0,Number(goal.meta)||0);
  for(const record of rows){
   const user=get(record,false);
   if(record.fuera_programacion)user.free++;else user.done++;
  }
  return [...users.values()].sort((a,b)=>a.label.localeCompare(b.label,'es'));
 }
 function renderUsers(node,rows,goals,periodName){
  if(!node)return;
  const totalMeta=goals.reduce((n,g)=>n+Math.max(0,Number(g.meta)||0),0);
  const users=countByUser(rows,goals);
  const headline=totalMeta>0
   ?'Metas programadas: '+totalMeta+'. Las ejecuciones libres se contabilizan aparte.'
   :'Sin metas programadas en '+periodName+'. Las ejecuciones libres también se registran.';
  const cards=users.length
   ?'<div class="r387-grid">'+users.map(u=>
      '<article class="r387-card"><strong>'+esc(u.label)+'</strong>'+
      '<p>Controles realizados: '+(u.done+u.free)+' · Ejecuciones libres: '+u.free+'</p>'+
      (u.meta>0?'<p>Meta: '+u.meta+' · Cumplimiento: '+Math.round(Math.min(u.done,u.meta)*100/u.meta)+'%</p>':'<p class="r387-muted">Sin meta asignada</p>')+
      '</article>').join('')+'</div>'
   :'<p class="r387-muted">No hay controles ni metas visibles para este perfil.</p>';
  node.innerHTML='<p class="r387-muted">'+esc(headline)+'</p>'+cards+
   '<p class="r387-foot">Información limitada a los registros que este perfil puede consultar.</p>';
 }
 function dateCL(value){
  const m=String(value||'').match(/^(\d{4})-(\d{2})-(\d{2})/);
  return m?m[3]+'-'+m[2]+'-'+m[1]:String(value||'');
 }
 function canDeleteRecord(record){
  const userId=String(window.state?.session?.user?.id||'');
  if(!userId||!record?.id)return false;
  if(String(record.created_by||'')===userId)return true;
  const role=norm(window.v11Role?.()||window.state?.profile?.rol||'');
  const restricted=role==='supervisor'||role==='tecnico';
  try{
   return !restricted&&!!window.canEditV11?.('liderazgo');
  }catch(_){return false}
 }
 async function deleteRecord(id,button){
  if(!id||removing.has(id))return;
  const record=cache?.done?.find(r=>String(r.id)===String(id));
  if(!canDeleteRecord(record)){
   window.toast?.('No tienes autorización para eliminar este control.','error');return;
  }
  const label=record.control_nombre||record.control_codigo||'control';
  const date=dateCL(record.fecha);
  if(!window.confirm('¿Eliminar el control "'+label+'" del '+date+'?\n\nSe actualizarán el historial y los indicadores. La eliminación quedará registrada en auditoría.'))return;
  removing.add(id);
  const previous=button?.textContent||'Eliminar';
  if(button){button.disabled=true;button.textContent='Eliminando…'}
  try{
   const out=await window.sb.rpc('eliminar_control_liderazgo_r388',{p_id:id});
   if(out.error)throw out.error;
   if(out.data!==true)throw new Error('La base de datos no confirmó la eliminación.');
   cache=null;cacheKey='';cacheAt=0;lastRender='';
   // The original summary counters and this supplemental mobile history must refresh.
   if(typeof window.renderLiderazgoV95==='function')await window.renderLiderazgoV95();
   await refresh(true);
   window.toast?.('Control eliminado. El historial y los indicadores se actualizaron.','success');
  }catch(error){
   console.error('[R388] Eliminar control Liderazgo',error);
   window.toast?.(error?.message||'No se pudo eliminar el control.','error');
   if(button?.isConnected){button.disabled=false;button.textContent=previous}
  }finally{removing.delete(id)}
 }
 function renderRecords(node,rows,periodName){
  if(!node)return;
  const records=rows.filter(x=>!x.estado||x.estado==='realizado');
  node.innerHTML='<div class="r387-top"><b>Registros visibles: '+records.length+'</b><small>'+esc(periodName)+'</small></div>'+
   (records.length?'<div class="r387-grid">'+records.map(r=>
    '<article class="r387-card"><strong>'+esc(r.control_nombre||r.control_codigo||'Control Stainher')+'</strong>'+
    '<p>'+esc(dateCL(r.fecha))+' · '+esc(r.ejecutado_por_nombre||r.supervisor_nombre||'Sin nombre')+'</p>'+
    '<p class="r387-muted">'+(r.fuera_programacion?'Ejecución libre':'Programado')+'</p>'+
    (r.id?'<div class="r388-actions"><button type="button" class="btn r387-download" data-r387-download="'+esc(r.id)+'">Descargar PDF</button>'+
     (canDeleteRecord(r)?'<button type="button" class="btn r388-delete" data-r388-delete="'+esc(r.id)+'" aria-label="Eliminar control realizado">Eliminar</button>':'')+'</div>':'')+
    '</article>').join('')+'</div>':
    '<p class="r387-muted">No hay controles visibles para este perfil durante el período.</p>')+
   '<p class="r387-foot">Los controles libres no requieren una meta mensual para aparecer en el historial.</p>';
  if(!node.__r387Bound){
   node.__r387Bound=true;
   node.addEventListener('click',event=>{
    const remove=event.target?.closest?.('[data-r388-delete]');
    if(remove){void deleteRecord(remove.dataset.r388Delete,remove);return}
    const target=event.target?.closest?.('[data-r387-download]');
    if(target&&window.v1524DownloadLeadershipRecordPdf)window.v1524DownloadLeadershipRecordPdf(target.dataset.r387Download);
   });
  }
 }
 async function refresh(force=false){
  const page=getPage();if(!page||page.classList.contains('hidden'))return false;
  const users=mount('cumplimiento por usuario','users');
  const records=mount('controles realizados','records');
  if(!users&&!records)return false;
  const p=period();if(!force&&lastRender===p.key&&records?.dataset.r387Ready==='1')return true;
  showMessage(users,'Consultando indicadores…');showMessage(records,'Consultando registros…');
  try{
   const data=await read(p.year,p.month,force);
   if(period().key!==p.key)return false;
   const label=new Date(p.year,p.month-1,1).toLocaleDateString('es-CL',{month:'long',year:'numeric'});
   renderUsers(users,data.done,data.goals,label);
   renderRecords(records,data.done,label);
   if(records)records.dataset.r387Ready='1';lastRender=p.key;
   return true;
  }catch(error){
   console.warn('[Stainher Liderazgo R387]',error);
   showMessage(users,'No se pudo cargar el cumplimiento: '+(error.message||error));
   showMessage(records,'No se pudo cargar el historial: '+(error.message||error));
   return false;
  }
 }
 function addStyles(){
  if(document.getElementById('stainher-r387-style'))return;
  const css=document.createElement('style');css.id='stainher-r387-style';
  css.textContent=[
   '#page-liderazgo .stainher-r387-report{margin:12px 0;padding:12px;border:1px solid var(--line,#c4d3e1);border-radius:10px;background:var(--panel2,#f3f8fd);color:var(--text,#19354d)}',
   '#page-liderazgo .r387-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:9px}',
   '#page-liderazgo .r387-card{background:var(--panel,#fff);border:1px solid var(--line,#bed0df);border-radius:9px;padding:11px;min-width:0;overflow-wrap:anywhere}',
   '#page-liderazgo .r387-card strong{display:block;margin-bottom:5px}',
   '#page-liderazgo .r387-card p{margin:5px 0;font-size:13px;line-height:1.45}',
   '#page-liderazgo .r387-muted{color:var(--muted,#516b84);font-size:13px;line-height:1.45}',
   '#page-liderazgo .r387-foot{color:var(--muted,#516b84);font-size:11px;margin:10px 0 0}',
   '#page-liderazgo .r387-top{display:flex;justify-content:space-between;gap:10px;flex-wrap:wrap;margin-bottom:9px}',
   '#page-liderazgo .r387-download{margin-top:6px;padding:8px}',
   '#page-liderazgo .r388-actions{display:flex;gap:8px;align-items:center;flex-wrap:wrap;margin-top:8px}',
   '#page-liderazgo .r388-actions .btn{margin:0;min-height:36px}',
   '#page-liderazgo .r388-delete{background:#fff3f2!important;color:#9f2433!important;-webkit-text-fill-color:#9f2433!important;border:1px solid #d6a5aa!important}',
   '#page-liderazgo .r388-delete:disabled{opacity:.6!important;cursor:wait}',
   '@media(max-width:600px){#page-liderazgo .r387-grid{grid-template-columns:minmax(0,1fr)}}'
  ].join('\n');
  document.head.appendChild(css);
 }
 let scheduling=false;
 function schedule(force=false){
  if(scheduling)return;
  scheduling=true;
  setTimeout(()=>{scheduling=false;void refresh(force)},120);
 }
 function wrapRender(){
  const original=window.renderLiderazgoV95;
  if(typeof original!=='function'||original.__r387Wrapped)return;
  const wrapped=async function(...args){
   const result=await original.apply(this,args);
   lastRender='';schedule(true);
   return result;
  };
  wrapped.__r387Wrapped=true;
  wrapped.__base=original;
  window.renderLiderazgoV95=wrapped;
 }
 function install(){
  addStyles();wrapRender();
  if(installed)return;
  installed=true;
  document.addEventListener('click',event=>{
   const button=event.target?.closest?.('button,[role="tab"],summary');
   const label=norm(button?.textContent);
   if(label==='indicadores'||label.includes('controles realizados')||label.includes('cumplimiento por usuario')){lastRender='';schedule(true)}
  },true);
  document.addEventListener('change',event=>{
   if(event.target?.closest?.('#page-liderazgo')){lastRender='';schedule(true)}
  },true);
  window.addEventListener('stainher:navigation',()=>{lastRender='';schedule()});
  window.addEventListener('stainher:modules-ready',()=>{wrapRender();lastRender='';schedule()});
  schedule();
 }
 window.StainherLeadershipIndicatorsR387=Object.freeze({build:'R388',install,refresh,period,read,canDeleteRecord,deleteRecord});
 install();
 [350,1100,2600].forEach(ms=>setTimeout(()=>{wrapRender();schedule()},ms));
})();