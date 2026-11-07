/* Stainher App · Modo TV R397. Acceso exclusivo a administradores activos. */
(()=>{
'use strict';
if(window.StainherTV)return;
const TABLE='tv_pantallas_r397',KEY='diario-mural',MAX_SCREENS=12,MAX_WIDGETS=12;
const TYPES={resumen:'Indicadores de mantenimiento',equipos:'Parque de equipos',preventivo:'Gráfico preventivo',turnos:'Gráfico de turnos',nomina:'Personas por turno',personal:'Gráfico de perfiles',directorio:'Directorio por rol',liderazgo:'Controles de liderazgo',aviso:'Aviso personalizado',reloj:'Fecha y hora'};
const COLORS=['#087f8c','#176fc1','#ff7a2f','#7162cc','#729ec1','#50b2a7','#b28bcc','#aabfce'];
let root=null,config=null,draft=null,data=null,screen=0,playing=false,rotation=null,refresh=null,clock=null,busy=false,configStamp=null,epoch=0,unsubscribe=null,priorFocus=null,inertNodes=[];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>globalThis.crypto?.randomUUID?.()||`tv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const localAdmin=()=>typeof state!=='undefined'&&state.profile?.rol==='administrador'&&state.profile?.activo!==false&&!!state.session?.user;
const dateParts=(date=new Date())=>Object.fromEntries(new Intl.DateTimeFormat('en-CA',{timeZone:'America/Santiago',year:'numeric',month:'2-digit',day:'2-digit'}).formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
const dayKey=()=>{const p=dateParts();return `${p.year}-${p.month}-${p.day}`};
const roleLabel=r=>({administrador:'Administración',tecnico:'Técnicos',supervisor:'Supervisión',prevencion:'Prevención',gerente:'Gerencia',recursos_humanos:'RR.HH.',planificador:'Planificación',confiabilidad:'Confiabilidad'}[r]||r||'Sin rol');
const widget=(type,width=6,title=TYPES[type])=>({id:uid(),type,width,title,text:''});
function defaults(){return {version:1,seconds:25,screens:[{id:uid(),title:'Resumen del contrato',widgets:[widget('resumen',12),widget('equipos',6),widget('preventivo',6),widget('liderazgo',6),{...widget('aviso',6,'Información del contrato'),text:'Mantenimiento y Certificación para Ascensores y Montacargas · Contrato 4600029879'}]},{id:uid(),title:'Turnos · programación del día',widgets:[widget('turnos',4),widget('nomina',8),widget('reloj',12)]},{id:uid(),title:'Personal · nuestro equipo',widgets:[widget('personal',4),widget('directorio',8)]}]}}
function normalize(value){
 if(!value||!Array.isArray(value.screens)||!value.screens.length)return defaults();
 return {version:1,seconds:Math.min(300,Math.max(10,Number(value.seconds)||25)),screens:value.screens.slice(0,MAX_SCREENS).map(s=>({id:uid(),title:String(s.title||'Pantalla').slice(0,80),widgets:(Array.isArray(s.widgets)?s.widgets:[]).filter(w=>Object.hasOwn(TYPES,w.type)).slice(0,MAX_WIDGETS).map(w=>({id:uid(),type:w.type,width:[4,6,8,12].includes(Number(w.width))?Number(w.width):6,title:String(w.title||TYPES[w.type]).slice(0,80),text:String(w.text||'').slice(0,1000)}))}))};
}
function checked(result,label){if(result.error)throw new Error(`${label}: ${result.error.message||'No disponible'}`);return result.data||[]}
async function authorize(){
 if(!localAdmin())throw new Error('Modo TV disponible solo para Administradores.');
 const user=await sb.auth.getUser();if(user.error||!user.data?.user)throw new Error('La sesión expiró. Ingresa nuevamente.');
 const result=await sb.from('perfiles').select('rol,activo').eq('id',user.data.user.id).single();
 if(result.error||result.data?.rol!=='administrador'||!result.data.activo)throw new Error('Modo TV disponible solo para Administradores activos.');
 return user.data.user.id;
}
async function readConfig(){const q=await sb.from(TABLE).select('valor,updated_at').eq('id',KEY).maybeSingle();if(q.error)throw new Error('No se pudo cargar la configuración TV: '+q.error.message);configStamp=q.data?.updated_at||null;config=normalize(q.data?.valor)}
async function loadData(){
 const p=dateParts(),year=Number(p.year),month=Number(p.month),date=`${p.year}-${p.month}-${p.day}`;
 const edp=new Date(Date.UTC(year,month-1+(Number(p.day)>20?1:0),1));
 const edpYear=edp.getUTCFullYear(),edpMonth=edp.getUTCMonth()+1;
 const queries=await Promise.all([
 sb.from('equipos').select('id,nombre,tipo,estado').order('nombre'),
 sb.from('programacion_preventiva').select('id,estado,equipo_id').eq('anio',edpYear).eq('mes',edpMonth),
 sb.from('perfiles').select('id,nombre,rol').eq('activo',true).order('nombre'),
 sb.from('turnos_malla_v1512').select('user_id,turno_base').eq('fecha',date).eq('estado_publicacion','publicado'),
 sb.from('liderazgo_cumplimiento').select('control_nombre,control_codigo,estado').eq('anio',year).eq('mes',month),
 sb.from('contrato_datos').select('empresa_contratista,numero_contrato,nombre_servicio').limit(1)
 ]);
 const errors=[];const take=(i,label)=>{try{return checked(queries[i],label)}catch(e){errors.push(e.message);return null}};
 return {date,month:edpMonth,year:edpYear,updated:new Date(),errors,equipos:take(0,'Equipos'),prev:take(1,'Preventivo'),profiles:take(2,'Personal'),turns:take(3,'Turnos'),lead:take(4,'Liderazgo'),contract:take(5,'Contrato')?.[0]};
}
function bars(items){const max=Math.max(1,...items.map(i=>i.n));return `<div class="tv-bars">${items.map((i,k)=>`<div class="tv-bar"><span>${esc(i.label)}</span><div><i style="width:${Math.max(0,i.n)/max*100}%;background:${COLORS[k%COLORS.length]}"></i></div><b>${i.n}</b></div>`).join('')}</div>`}
function donut(items,label){const total=items.reduce((s,i)=>s+i.n,0);if(!total)return '<p class="tv-empty">Sin registros para la fecha seleccionada.</p>';let angle=0;const stops=items.map((i,k)=>{const start=angle;angle+=i.n/total*100;return `${COLORS[k%COLORS.length]} ${start}% ${angle}%`});return `<div class="tv-donut-row"><div class="tv-donut" role="img" aria-label="${esc(items.map(i=>`${i.label}: ${i.n}`).join(', '))}" style="background:conic-gradient(${stops.join(',')})"><div><strong>${total}</strong><span>${esc(label)}</span></div></div><div class="tv-legend">${items.map((i,k)=>`<span><i style="background:${COLORS[k%COLORS.length]}"></i>${esc(i.label)} <b>${i.n}</b></span>`).join('')}</div></div>`}
const missing=()=>'<p class="tv-empty">Información no disponible. Revisa la conexión o los permisos.</p>';
function prevCounts(){return [{label:'Ejecutados',n:data.prev.filter(r=>r.estado==='ejecutado').length},{label:'Programados',n:data.prev.filter(r=>r.estado==='programado').length},{label:'Pendientes',n:data.prev.filter(r=>!['ejecutado','programado'].includes(r.estado)).length}]}
function turnCounts(){const counts=new Map();data.turns.forEach(t=>counts.set(t.turno_base,(counts.get(t.turno_base)||0)+1));return [...counts].sort(([a],[b])=>a.localeCompare(b)).map(([k,n])=>({label:k==='L'?'Libre':`Turno ${k}`,n}))}
function content(w){
 switch(w.type){
 case 'resumen':{const counts=data.prev&&prevCounts();return `<div class="tv-kpis">${[[data.equipos?.length,'Equipos registrados'],[data.prev?`${counts[0].n} / ${data.prev.length}`:null,'Actividades ejecutadas · mes contractual'],[data.profiles?.length,'Perfiles activos'],[data.lead?.filter(x=>x.estado==='realizado').length,'Controles realizados · mes calendario']].map(([v,l])=>`<div><strong>${v??'—'}</strong><span>${l}</span></div>`).join('')}</div>`}
 case 'equipos':return data.equipos?`<div class="tv-equipment">${data.equipos.map(e=>`<div><span aria-hidden="true">↕</span><b>${esc(e.nombre)}</b><small>${esc(e.tipo||'Equipo')}</small></div>`).join('')}</div><p class="tv-note">Registro del parque; no representa disponibilidad operacional.</p>`:missing();
 case 'preventivo':return data.prev?donut(prevCounts(),'actividades')+`<p class="tv-note">Mes contractual ${data.month}/${data.year} · corte 21 → 20.</p>`:missing();
 case 'turnos':return data.turns?donut(turnCounts(),'en malla')+'<p class="tv-note">Malla publicada de hoy. Presencia efectiva sujeta a novedades y ausencias.</p>':missing();
 case 'nomina':{if(!data.turns||!data.profiles)return missing();const profiles=new Map(data.profiles.map(p=>[p.id,p]));const groups=new Map();data.turns.forEach(t=>{const k=t.turno_base;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(profiles.get(t.user_id)||{nombre:'Perfil no activo',rol:''})});return groups.size?`<div class="tv-rosters">${[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([k,people])=>`<section><h3>${esc(k==='L'?'Libre':`Turno ${k}`)} <span>${people.length}</span></h3>${people.map(p=>`<p><b>${esc(p.nombre)}</b><small>${esc(roleLabel(p.rol))}</small></p>`).join('')}</section>`).join('')}</div><p class="tv-note">Turno base publicado · ${esc(data.date)}.</p>`:'<p class="tv-empty">No hay turnos publicados para hoy.</p>'}
 case 'personal':{if(!data.profiles)return missing();const counts=new Map();data.profiles.forEach(p=>counts.set(p.rol,(counts.get(p.rol)||0)+1));return `<div class="tv-total"><strong>${data.profiles.length}</strong> perfiles activos</div>`+bars([...counts].map(([r,n])=>({label:roleLabel(r),n})).sort((a,b)=>b.n-a.n))+'<p class="tv-note">Perfiles de plataforma; no equivale a dotación presente en faena.</p>'}
 case 'directorio':{if(!data.profiles)return missing();const groups=new Map();data.profiles.forEach(p=>{if(!groups.has(p.rol))groups.set(p.rol,[]);groups.get(p.rol).push(p)});return `<div class="tv-directory">${[...groups].map(([r,people])=>`<section><h3>${esc(roleLabel(r))}</h3>${people.map(p=>`<p>${esc(p.nombre)}</p>`).join('')}</section>`).join('')}</div>`}
 case 'liderazgo':{if(!data.lead)return missing();const counts=new Map();data.lead.filter(c=>c.estado==='realizado').forEach(c=>{const name=c.control_nombre||c.control_codigo||'Control';counts.set(name,(counts.get(name)||0)+1)});return counts.size?bars([...counts].map(([label,n])=>({label,n})))+'<p class="tv-note">Realizados durante el mes calendario actual.</p>':'<p class="tv-empty">Sin controles realizados este mes.</p>'}
 case 'aviso':return `<div class="tv-message">${esc(w.text||'Agrega un mensaje desde Editar pantallas.').replace(/\n/g,'<br>')}</div>`;
 case 'reloj':return '<div class="tv-clock" data-tv-clock></div>';
 default:return '';
 }
}
function showStatus(message,error=false){const el=root?.querySelector('[data-tv-status]');if(el){el.textContent=message;el.classList.toggle('tv-error',error)}}
function render(){
 if(!root||!config||!data)return;
 screen=Math.min(screen,config.screens.length-1);const s=config.screens[screen];
 root.querySelector('[data-tv-title]').textContent=s.title;
 root.querySelector('[data-tv-contract]').textContent=`${data.contract?.empresa_contratista||'Stainher App'} · Contrato ${data.contract?.numero_contrato||'—'}`;
 root.querySelector('[data-tv-tabs]').innerHTML=config.screens.map((s,i)=>`<button type="button" data-tv-screen="${i}" aria-current="${i===screen?'page':'false'}">${esc(s.title)}</button>`).join('');
 root.querySelector('[data-tv-grid]').innerHTML=s.widgets.length?s.widgets.map(w=>`<article class="tv-widget tv-type-${w.type}" style="grid-column:span ${w.width}"><h2>${esc(w.title)}</h2><div class="tv-widget-content">${content(w)}</div></article>`).join(''):'<p class="tv-empty">Pantalla sin widgets. Usa Editar pantallas para agregar contenido.</p>';
 root.querySelector('[data-tv-count]').textContent=`${screen+1} / ${config.screens.length}`;
 showStatus(data.errors.length?'Información parcial · '+data.errors.join(' · '):`Datos actualizados: ${new Intl.DateTimeFormat('es-CL',{timeZone:'America/Santiago',dateStyle:'short',timeStyle:'short'}).format(data.updated)}`,!!data.errors.length);
 tick();requestAnimationFrame(fitPresentation);
}
function fitPresentation(){if(!root)return;const grid=root.querySelector('[data-tv-grid]');grid.style.zoom='';if(!root.classList.contains('tv-presenting'))return;const footer=root.querySelector('.tv-footer');const available=root.clientHeight-grid.getBoundingClientRect().top-footer.offsetHeight-12;const ratio=Math.min(1,available/Math.max(1,grid.scrollHeight));grid.style.zoom=String(Math.max(.25,ratio))}
function tick(){if(!root)return;root.querySelectorAll('[data-tv-clock]').forEach(n=>{n.textContent=new Intl.DateTimeFormat('es-CL',{timeZone:'America/Santiago',dateStyle:'full',timeStyle:'short'}).format(new Date())})}
function schedule(){clearTimeout(rotation);if(playing&&!draft&&root)rotation=setTimeout(()=>{screen=(screen+1)%config.screens.length;render();schedule()},config.seconds*1000);root?.querySelector('[data-tv-action="play"]')?.setAttribute('aria-pressed',String(playing));const b=root?.querySelector('[data-tv-action="play"]');if(b)b.textContent=playing?'Pausar rotación':'Iniciar rotación'}
async function refreshData(){if(!root||busy||draft)return;busy=true;const token=epoch;try{await authorize();const next=await loadData();if(root&&token===epoch){data=next;render()}}catch(e){if(root&&token===epoch){showStatus(e.message,true);if(!localAdmin()||/sesión|Administrador/.test(e.message))close()}}finally{if(token===epoch){busy=false;if(root)refresh=setTimeout(refreshData,60000)}}}
function selectScreen(i){if(draft)return;screen=Math.max(0,Math.min(config.screens.length-1,i));render();schedule()}
function editor(){
 if(!localAdmin())return close();if(!draft)draft=structuredClone(config);clearTimeout(rotation);const s=draft.screens[screen];
 const panel=root.querySelector('[data-tv-editor]');panel.hidden=false;[...root.children].forEach(n=>{if(n!==panel)n.inert=true});
 panel.innerHTML=`<form data-tv-form><header><h2>Editar pantallas</h2><button type="button" data-tv-action="cancel">Cerrar editor</button></header><p>Los cambios se comparten entre sesiones de Administrador al guardar.</p><div class="tv-editor-fields"><label>Pantalla<select name="screen">${draft.screens.map((s,i)=>`<option value="${i}" ${i===screen?'selected':''}>${esc(s.title)}</option>`).join('')}</select></label><label>Título<input name="title" maxlength="80" required value="${esc(s.title)}"></label><label>Segundos por pantalla<input name="seconds" type="number" min="10" max="300" value="${draft.seconds}" required></label></div><div class="tv-editor-actions"><button type="button" data-tv-action="add-screen">Agregar pantalla</button><button type="button" data-tv-action="screen-up" ${screen===0?'disabled':''}>← Mover pantalla</button><button type="button" data-tv-action="screen-down" ${screen===draft.screens.length-1?'disabled':''}>Mover pantalla →</button><button type="button" data-tv-action="delete-screen" ${draft.screens.length===1?'disabled':''}>Eliminar pantalla</button></div><div class="tv-widget-edit-list">${s.widgets.map((w,i)=>`<fieldset data-tv-widget="${i}"><legend>${esc(TYPES[w.type])}</legend><label>Título<input data-tv-field="title" maxlength="80" value="${esc(w.title)}"></label><label>Ancho<select data-tv-field="width">${[[4,'⅓ pantalla'],[6,'½ pantalla'],[8,'⅔ pantalla'],[12,'Pantalla completa']].map(([n,l])=>`<option value="${n}" ${w.width===n?'selected':''}>${l}</option>`).join('')}</select></label>${w.type==='aviso'?`<label class="tv-wide">Mensaje<textarea data-tv-field="text" maxlength="1000" rows="3">${esc(w.text)}</textarea></label>`:''}<div class="tv-editor-actions tv-wide"><button type="button" data-tv-action="up" data-index="${i}" ${i===0?'disabled':''}>↑ Subir</button><button type="button" data-tv-action="down" data-index="${i}" ${i===s.widgets.length-1?'disabled':''}>↓ Bajar</button><button type="button" data-tv-action="remove" data-index="${i}">Quitar widget</button></div></fieldset>`).join('')}</div><div class="tv-editor-actions"><label>Agregar widget<select name="type">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><button type="button" data-tv-action="add-widget">Agregar widget</button></div><p data-tv-save-error role="status"></p><footer><button type="button" data-tv-action="cancel">Descartar cambios</button><button type="submit" class="tv-primary">Guardar pantallas</button></footer></form>`;
 panel.querySelector('form').onsubmit=save;panel.querySelector('[data-tv-action="cancel"]').focus();
 panel.oninput=e=>{const n=e.target;if(n.name==='title')s.title=n.value;if(n.name==='seconds')draft.seconds=Number(n.value);const row=n.closest('[data-tv-widget]');if(row&&n.dataset.tvField){const w=s.widgets[Number(row.dataset.tvWidget)];w[n.dataset.tvField]=n.dataset.tvField==='width'?Number(n.value):n.value}};
 panel.onchange=e=>{if(e.target.name==='screen'){screen=Number(e.target.value);editor()}};
}
function cancelEdit(){draft=null;root.querySelector('[data-tv-editor]').hidden=true;[...root.children].forEach(n=>n.inert=false);render();schedule();clearTimeout(refresh);refresh=setTimeout(refreshData,60000);root.querySelector('[data-tv-action="edit"]').focus()}
async function save(e){
 e.preventDefault();if(!draft||!root)return;const form=e.target,button=form.querySelector('[type="submit"]');button.disabled=true;const token=epoch;
 try{const user=await authorize(),value=normalize(draft);const now=new Date().toISOString();let q;
 if(configStamp)q=await sb.from(TABLE).update({valor:value,updated_at:now,updated_by:user}).eq('id',KEY).eq('updated_at',configStamp).select('updated_at');
 else q=await sb.from(TABLE).insert({id:KEY,valor:value,updated_at:now,updated_by:user}).select('updated_at');
 if(q.error)throw new Error(q.error.code==='23505'?'Otra sesión creó las pantallas. Cierra y abre el modo TV para cargar su configuración.':q.error.message);
 if(!q.data?.length)throw new Error('La configuración cambió en otra sesión. Cierra y abre el modo TV antes de editar nuevamente.');
 if(root&&token===epoch){config=value;configStamp=q.data[0].updated_at;cancelEdit();showStatus('Pantallas guardadas para todos los Administradores.')}
 }catch(err){if(root&&token===epoch)form.querySelector('[data-tv-save-error]').textContent=err.message}finally{button.disabled=false}
}
async function action(e){
 const screenButton=e.target.closest('[data-tv-screen]');if(screenButton){selectScreen(Number(screenButton.dataset.tvScreen));return}
 const b=e.target.closest('[data-tv-action]');if(!b)return;const a=b.dataset.tvAction;
 if(a==='close')return close();if(a==='edit')return editor();if(a==='cancel')return cancelEdit();
 if(a==='play'){playing=!playing;return schedule()}if(a==='next')return selectScreen((screen+1)%config.screens.length);if(a==='previous')return selectScreen((screen+config.screens.length-1)%config.screens.length);
 if(a==='refresh'){clearTimeout(refresh);return refreshData()}
 if(a==='controls'){root.classList.remove('tv-presenting');fitPresentation();return}
 if(a==='fullscreen'){root.classList.add('tv-presenting');fitPresentation();try{if(!document.fullscreenElement&&root.requestFullscreen)await root.requestFullscreen();else if(!root.requestFullscreen)showStatus('Presentación activada. Este navegador no admite pantalla completa.')}catch(_){showStatus('Presentación activada; el navegador no permitió pantalla completa.')}requestAnimationFrame(fitPresentation);return}
 if(!draft)return;const s=draft.screens[screen],i=Number(b.dataset.index);
 if(a==='add-screen'&&draft.screens.length<MAX_SCREENS){draft.screens.push({id:uid(),title:'Nueva pantalla',widgets:[widget('aviso',12)]});screen=draft.screens.length-1}
 if(a==='delete-screen'&&draft.screens.length>1){draft.screens.splice(screen,1);screen=Math.min(screen,draft.screens.length-1)}
 if(a==='screen-up'&&screen>0){[draft.screens[screen-1],draft.screens[screen]]=[draft.screens[screen],draft.screens[screen-1]];screen--}
 if(a==='screen-down'&&screen<draft.screens.length-1){[draft.screens[screen+1],draft.screens[screen]]=[draft.screens[screen],draft.screens[screen+1]];screen++}
 if(a==='add-widget'&&s.widgets.length<MAX_WIDGETS)s.widgets.push(widget(root.querySelector('[name="type"]').value));
 if(a==='remove')s.widgets.splice(i,1);
 if(a==='up'&&i>0)[s.widgets[i-1],s.widgets[i]]=[s.widgets[i],s.widgets[i-1]];
 if(a==='down'&&i<s.widgets.length-1)[s.widgets[i+1],s.widgets[i]]=[s.widgets[i],s.widgets[i+1]];
 editor();
}
function keydown(e){if(!root)return;if(e.key==='Escape'){e.preventDefault();if(draft)cancelEdit();else close();return}if(e.key==='Tab'){const scope=draft?root.querySelector('[data-tv-editor]'):root;const nodes=[...scope.querySelectorAll('button:not([disabled]),input,select,textarea')].filter(n=>n.getClientRects().length);if(!nodes.length)return;if(e.shiftKey&&document.activeElement===nodes[0]){e.preventDefault();nodes.at(-1).focus()}else if(!e.shiftKey&&document.activeElement===nodes.at(-1)){e.preventDefault();nodes[0].focus()}}if(draft||/INPUT|TEXTAREA|SELECT/.test(e.target.tagName))return;if(e.key==='ArrowRight')selectScreen((screen+1)%config.screens.length);if(e.key==='ArrowLeft')selectScreen((screen+config.screens.length-1)%config.screens.length)}
async function open(){
 if(root||busy)return;busy=true;const token=++epoch;
 try{await authorize();await readConfig();const next=await loadData();if(token!==epoch)return;data=next;priorFocus=document.activeElement;
 root=document.createElement('section');root.id='stainher-tv';root.setAttribute('role','dialog');root.setAttribute('aria-modal','true');root.setAttribute('aria-label','Diario mural Stainher App');
 root.innerHTML=`<header class="tv-header"><div class="tv-brand"><div class="tv-brandmark">S</div><div><strong>STAINHER APP</strong><small>Gestión Integral de Contratos</small></div></div><div class="tv-site">CODELCO · DIVISIÓN ANDINA</div><button type="button" data-tv-action="controls" class="tv-show-controls">Mostrar controles</button><button type="button" data-tv-action="close">Salir del modo TV</button></header><div class="tv-heading"><div><h1 data-tv-title></h1><p data-tv-contract></p></div><span data-tv-count></span></div><nav class="tv-toolbar" aria-label="Pantallas TV"><div data-tv-tabs></div><div class="tv-tools"><button type="button" data-tv-action="previous" aria-label="Pantalla anterior">←</button><button type="button" data-tv-action="next" aria-label="Pantalla siguiente">→</button><button type="button" data-tv-action="play">Iniciar rotación</button><button type="button" data-tv-action="refresh">Actualizar datos</button><button type="button" data-tv-action="fullscreen">Pantalla completa</button><button type="button" data-tv-action="edit" class="tv-primary">Editar pantallas</button></div></nav><main class="tv-grid" data-tv-grid></main><footer class="tv-footer"><span data-tv-status role="status"></span><span>Diario mural · America/Santiago</span></footer><section class="tv-editor" data-tv-editor hidden aria-label="Editor de pantallas"></section>`;
 document.body.append(root);inertNodes=[...document.body.children].filter(n=>n!==root&&n instanceof HTMLElement&&!['SCRIPT','STYLE','LINK'].includes(n.tagName)).map(n=>({node:n,inert:n.inert}));inertNodes.forEach(x=>x.node.inert=true);document.body.classList.add('stainher-tv-open');root.addEventListener('click',action);document.addEventListener('keydown',keydown);window.v151CloseDrawer?.();screen=0;playing=false;render();root.querySelector('[data-tv-action="close"]').focus();refresh=setTimeout(refreshData,60000);clock=setInterval(tick,10000);
 }catch(e){if(typeof toast==='function')toast(e.message,'error');else console.error(e.message)}finally{if(token===epoch)busy=false}
}
function close(){++epoch;clearTimeout(rotation);clearTimeout(refresh);clearInterval(clock);playing=false;busy=false;draft=null;if(root&&document.fullscreenElement===root)document.exitFullscreen().catch(()=>{});root?.remove();root=null;inertNodes.forEach(x=>{if(x.node.isConnected)x.node.inert=x.inert});inertNodes=[];document.body.classList.remove('stainher-tv-open');document.removeEventListener('keydown',keydown);priorFocus?.focus?.()}
function install(){
 const admin=localAdmin(),nav=document.querySelector('.sidebar .nav');let b=document.getElementById('stainher-tv-open');
 if(!admin){b?.remove();if(root)close();return}
 if(nav&&!b){b=document.createElement('button');b.type='button';b.id='stainher-tv-open';b.textContent='▣ Diario mural · TV';b.onclick=open;nav.append(b)}
}
function boot(){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('stainher-tv-r397.css?build=20261107-r397',document.currentScript?.src||document.baseURI).href;document.head.append(link);
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;install()})}).observe(document.getElementById('appView')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
 if(typeof sb!=='undefined')unsubscribe=sb.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session)close();setTimeout(install,0)}).data?.subscription;
 install();window.addEventListener('stainher:modules-ready',install);window.addEventListener('resize',fitPresentation);document.addEventListener('fullscreenchange',fitPresentation);
}
window.StainherTV=Object.freeze({open,close,install});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
