/* Stainher App · Modo TV R397. Acceso exclusivo a administradores activos. */
(()=>{
'use strict';
if(window.StainherTV)return;
const TABLE='tv_pantallas_r397',KEY='diario-mural',MAX_SCREENS=12,MAX_WIDGETS=12;
const TYPES={resumen:'Indicadores de mantenimiento',equipos:'Parque de equipos',preventivo:'Gráfico preventivo',turnos:'Gráfico de turnos',nomina:'Personas por turno',personal:'Gráfico de perfiles',directorio:'Directorio por rol',liderazgo:'Controles de liderazgo',aviso:'Aviso personalizado',reloj:'Reloj analógico',calendario:'Calendario mensual',
 contrato:'Datos del contrato',reembolsables:'Gastos reembolsables',operativos:'Gastos operativos',youtube:'Video de YouTube'};
const COLORS=['#087f8c','#176fc1','#ff7a2f','#7162cc','#729ec1','#50b2a7','#b28bcc','#aabfce'];
let root=null,config=null,draft=null,data=null,screen=0,playing=false,rotation=null,refresh=null,clock=null,busy=false,configStamp=null,epoch=0,unsubscribe=null,priorFocus=null,inertNodes=[];
const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const uid=()=>globalThis.crypto?.randomUUID?.()||`tv-${Date.now()}-${Math.random().toString(36).slice(2)}`;
const localAdmin=()=>typeof state!=='undefined'&&state.profile?.rol==='administrador'&&state.profile?.activo!==false&&!!state.session?.user;
const TIME_ZONE='America/Santiago';
const dateFormatter=new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'});
const timeFormatter=new Intl.DateTimeFormat('es-CL',{timeZone:TIME_ZONE,hour:'2-digit',minute:'2-digit',second:'2-digit',hourCycle:'h23'});
const fullDateFormatter=new Intl.DateTimeFormat('es-CL',{timeZone:TIME_ZONE,dateStyle:'full'});
const calendarMonthFormatter=new Intl.DateTimeFormat('es-CL',{timeZone:TIME_ZONE,month:'long',year:'numeric'});
const parts=(formatter,date)=>Object.fromEntries(formatter.formatToParts(date).filter(p=>p.type!=='literal').map(p=>[p.type,p.value]));
const dateParts=(date=new Date())=>parts(dateFormatter,date);
const roleLabel=r=>({administrador:'Administración',tecnico:'Técnicos',supervisor:'Supervisión',prevencion:'Prevención',gerente:'Gerencia',recursos_humanos:'RR.HH.',planificador:'Planificación',confiabilidad:'Confiabilidad'}[r]||r||'Sin rol');
const widget=(type,width=6,title=TYPES[type])=>({id:uid(),type,width,title,text:''});
const clp=new Intl.NumberFormat('es-CL',{style:'currency',currency:'CLP'});
const monthLabel=new Intl.DateTimeFormat('es-CL',{month:'short',year:'numeric',timeZone:'UTC'});
const money=value=>clp.format(Number(value)||0);
function videoId(text){
 try{
  const url=new URL(String(text).trim());
  if(url.protocol!=='https:'||url.username||url.password||url.port)return '';
  const [route,id]=url.pathname.split('/').filter(Boolean);
  let video;
  if(url.hostname==='youtu.be')video=route;
  else if(['youtube.com','www.youtube.com','m.youtube.com','www.youtube-nocookie.com'].includes(url.hostname)){
   video=route==='watch'?url.searchParams.get('v'):['shorts','embed','live'].includes(route)?id:'';
  }
  return /^[\w-]{11}$/.test(video||'')?video:'';
 }catch{return ''}
}
function monthsEnding(year,month){
 return Array.from({length:6},(_,index)=>{
  const date=new Date(Date.UTC(year,month-6+index,1));
  const key=date.toISOString().slice(0,7);
  return {key,year:date.getUTCFullYear(),label:monthLabel.format(date)};
 });
}
async function expenseSeries(periods,queryForPage,keyForRow,amountColumn){
 const totals=new Map(periods.map(p=>[p.key,0]));
 let count=0;
 const pageSize=500;
 for(let offset=0;;offset+=pageSize){
  const result=await queryForPage().order('id').range(offset,offset+pageSize-1);
  if(result.error)return {error:result.error};
  const rows=result.data||[];
  for(const row of rows){
   const key=keyForRow(row);
   if(!totals.has(key))continue;
   totals.set(key,totals.get(key)+(Number(row[amountColumn])||0));
   count++;
  }
  if(rows.length<pageSize)break;
 }
 return {data:{count,items:periods.map(p=>({label:p.label,n:totals.get(p.key)}))}};
}
async function loadExpenses(types,year,month,edpYear,edpMonth){
 const jobs=[];
 if(types.has('reembolsables')){
  const periods=monthsEnding(edpYear,edpMonth);
  const query=()=>sb.from('gastos_reembolsables').select('id,anio_edp,mes_edp,monto_detalle')
   .gte('anio_edp',periods[0].year).lte('anio_edp',edpYear);
  jobs.push(expenseSeries(periods,query,row=>`${row.anio_edp}-${String(row.mes_edp).padStart(2,'0')}`,'monto_detalle')
   .then(result=>['reembolsables',result]));
 }
 if(types.has('operativos')){
  const periods=monthsEnding(year,month);
  const nextMonth=new Date(Date.UTC(year,month,1)).toISOString().slice(0,10);
  const query=()=>sb.from('gastos_operacionales_r342').select('id,fecha,monto')
   .gte('fecha',periods[0].key+'-01').lt('fecha',nextMonth).not('anulado','is',true);
  jobs.push(expenseSeries(periods,query,row=>String(row.fecha).slice(0,7),'monto')
   .then(result=>['operativos',result]));
 }
 return Object.fromEntries(await Promise.all(jobs));
}
function defaults(){return {version:1,seconds:25,screens:[{id:uid(),title:'Resumen del contrato',widgets:[widget('resumen',12),widget('equipos',6),widget('preventivo',6),widget('liderazgo',6),{...widget('aviso',6,'Información del contrato'),text:'Mantenimiento y Certificación para Ascensores y Montacargas · Contrato 4600029879'}]},{id:uid(),title:'Turnos · programación del día',widgets:[widget('turnos',4),widget('nomina',8),widget('reloj',12)]},{id:uid(),title:'Personal · nuestro equipo',widgets:[widget('personal',4),widget('directorio',8)]}]}}
function widgetTitle(w){
 if(w.type==='youtube'&&w.title==='Video de YouTube en bucle')return TYPES.youtube;
 if(w.type==='reloj'&&['Fecha y hora','Reloj digital'].includes(w.title))return TYPES.reloj;
 return String(w.title||TYPES[w.type]).slice(0,80);
}
function normalize(value){
 if(!value||!Array.isArray(value.screens)||!value.screens.length)return defaults();
 return {version:1,seconds:Math.min(300,Math.max(10,Number(value.seconds)||25)),screens:value.screens.slice(0,MAX_SCREENS).map(s=>({id:uid(),title:String(s.title||'Pantalla').slice(0,80),widgets:(Array.isArray(s.widgets)?s.widgets:[]).filter(w=>Object.hasOwn(TYPES,w.type)).slice(0,MAX_WIDGETS).map(w=>({id:uid(),type:w.type,width:[4,6,8,12].includes(Number(w.width))?Number(w.width):6,title:widgetTitle(w),text:String(w.text||'').slice(0,1000)}))}))};
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
 const types=new Set(config.screens.flatMap(s=>s.widgets.map(w=>w.type)));
 const contractFields='empresa_contratista,numero_contrato,nombre_servicio'
  +(types.has('contrato')?',fecha_inicio,fecha_termino,valor_inicial,valor_vigente,dotacion_contractual':'');
 const queries=await Promise.all([
 sb.from('equipos').select('id,nombre,tipo,estado').order('nombre'),
 sb.from('programacion_preventiva').select('id,estado,equipo_id').eq('anio',edpYear).eq('mes',edpMonth),
 sb.from('perfiles').select('id,nombre,rol').eq('activo',true).order('nombre'),
 sb.from('turnos_malla_v1512').select('user_id,turno_base').eq('fecha',date).eq('estado_publicacion','publicado'),
 sb.from('liderazgo_cumplimiento').select('control_nombre,control_codigo,estado').eq('anio',year).eq('mes',month),
 sb.from('contrato_datos').select(contractFields).limit(1),
 loadExpenses(types,year,month,edpYear,edpMonth)
 ]);
 const errors=[];const take=(i,label)=>{try{return checked(queries[i],label)}catch(e){errors.push(e.message);return null}};
 const expenses={};
 for(const [type,result] of Object.entries(queries[6])){
  try{expenses[type]=checked(result,TYPES[type])}catch(e){errors.push(e.message)}
 }
 return {date,month:edpMonth,year:edpYear,updated:new Date(),errors,equipos:take(0,'Equipos'),prev:take(1,'Preventivo'),profiles:take(2,'Personal'),turns:take(3,'Turnos'),lead:take(4,'Liderazgo'),contract:take(5,'Contrato')?.[0],expenses};
}
function bars(items,format=String){
 const max=Math.max(1,...items.map(i=>Math.abs(i.n)));
 return `<div class="tv-bars">${items.map((i,k)=>`<div class="tv-bar"><span>${esc(i.label)}</span><div><i style="width:${Math.abs(i.n)/max*100}%;background:${COLORS[k%COLORS.length]}"></i></div><b>${esc(format(i.n))}</b></div>`).join('')}</div>`;
}
function donut(items,label){const total=items.reduce((s,i)=>s+i.n,0);if(!total)return '<p class="tv-empty">Sin registros para la fecha seleccionada.</p>';let angle=0;const stops=items.map((i,k)=>{const start=angle;angle+=i.n/total*100;return `${COLORS[k%COLORS.length]} ${start}% ${angle}%`});return `<div class="tv-donut-row"><div class="tv-donut" role="img" aria-label="${esc(items.map(i=>`${i.label}: ${i.n}`).join(', '))}" style="background:conic-gradient(${stops.join(',')})"><div><strong>${total}</strong><span>${esc(label)}</span></div></div><div class="tv-legend">${items.map((i,k)=>`<span><i style="background:${COLORS[k%COLORS.length]}"></i>${esc(i.label)} <b>${i.n}</b></span>`).join('')}</div></div>`}
const missing=()=>'<p class="tv-empty">Información no disponible. Revisa la conexión o los permisos.</p>';
function contractContent(){
 const c=data.contract;
 if(!c)return missing();
 const date=value=>value?value.split('-').reverse().join('-'):'—';
 const details=[
  ['Contrato',c.numero_contrato],['Contratista',c.empresa_contratista],['Servicio',c.nombre_servicio],
  ['Vigencia',`${date(c.fecha_inicio)} al ${date(c.fecha_termino)}`],['Dotación contractual',c.dotacion_contractual]
 ];
 const values=[{label:'Inicial',value:c.valor_inicial},{label:'Vigente',value:c.valor_vigente}]
  .filter(item=>item.value!=null).map(item=>({label:item.label,n:Number(item.value)}));
 return `<dl class="tv-contract-data">${details.map(([label,value])=>`<div><dt>${label}</dt><dd>${esc(value??'—')}</dd></div>`).join('')}</dl>`
  +(values.length?bars(values,money):'');
}
function expenseContent(type){
 const series=data.expenses[type];
 if(!series)return missing();
 if(!series.count)return '<p class="tv-empty">Sin gastos registrados en los últimos seis meses.</p>';
 const label=type==='reembolsables'?'Detalle documentado · mes EDP':'Gastos vigentes · mes calendario';
 const total=series.items.reduce((sum,item)=>sum+item.n,0);
 return `<p class="tv-note">${label}</p><div class="tv-total tv-money"><strong>${money(total)}</strong><span>Últimos seis meses</span></div>`
  +bars(series.items,money);
}
function videoContent(widget){
 const id=videoId(widget.text);
 if(!id)return '<p class="tv-empty">Agrega un enlace de YouTube en Editar pantallas.</p>';
 const src=`https://www.youtube-nocookie.com/embed/${id}?autoplay=1&mute=1&playsinline=1`;
 return `<iframe class="tv-youtube" title="${esc(widget.title)}" src="${esc(src)}" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen referrerpolicy="strict-origin-when-cross-origin"></iframe>`;
}
function prevCounts(){return [{label:'Ejecutados',n:data.prev.filter(r=>r.estado==='ejecutado').length},{label:'Programados',n:data.prev.filter(r=>r.estado==='programado').length},{label:'Pendientes',n:data.prev.filter(r=>!['ejecutado','programado'].includes(r.estado)).length}]}
function turnCounts(){const counts=new Map();data.turns.forEach(t=>counts.set(t.turno_base,(counts.get(t.turno_base)||0)+1));return [...counts].sort(([a],[b])=>a.localeCompare(b)).map(([k,n])=>({label:k==='L'?'Libre':`Turno ${k}`,n}))}
function clockContent(){
 const ticks=Array.from({length:60},(_,i)=>{
  const major=i%5===0;
  return `<line class="${major?'tv-clock-major':'tv-clock-minor'}" x1="100" y1="12" x2="100" y2="${major?20:16}" transform="rotate(${i*6} 100 100)"/>`;
 });
 const numbers=Array.from({length:12},(_,i)=>{
  const angle=i*Math.PI/6;
  return `<text x="${100+66*Math.sin(angle)}" y="${100-66*Math.cos(angle)}">${i||12}</text>`;
 });
 return `<div class="tv-clock" data-tv-clock>
  <span class="tv-clock-zone">Hora de Santiago</span>
  <time class="tv-clock-time"><svg viewBox="0 0 200 200" aria-hidden="true" focusable="false">
   <circle class="tv-clock-rim" cx="100" cy="100" r="95"/>
   ${ticks.join('')}${numbers.join('')}
   <line data-clock-hand="hour" x1="100" y1="104" x2="100" y2="58"/>
   <line data-clock-hand="minute" x1="100" y1="107" x2="100" y2="43"/>
   <line data-clock-hand="second" x1="100" y1="116" x2="100" y2="29"/>
   <circle class="tv-clock-pivot" cx="100" cy="100" r="4"/>
  </svg><span class="tv-clock-readable"></span></time>
  <div class="tv-clock-date"></div>
 </div>`;
}
function calendarContent(now,{year,month,day}){
 const first=new Date(Date.UTC(Number(year),Number(month)-1,1));
 const offset=(first.getUTCDay()+6)%7;
 const last=new Date(Date.UTC(Number(year),Number(month),0)).getUTCDate();
 const weekdays=['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];
 const activeWeekday=(offset+Number(day)-1)%7;
 const rows=Array.from({length:Math.ceil((offset+last)/7)},(_,week)=>{
  const cells=weekdays.map((_,index)=>{
   const number=week*7+index-offset+1;
   if(number<1||number>last)return '<td></td>';
   const cell=index===activeWeekday?'<td class="tv-calendar-weekday">':'<td>';
   if(number===Number(day))return `${cell}<time class="tv-calendar-today" datetime="${year}-${month}-${day}" aria-current="date">${number}</time></td>`;
   return `${cell}<span>${number}</span></td>`;
  });
  return '<tr>'+cells.join('')+'</tr>';
 });
 return `<table class="tv-calendar"><caption>${esc(calendarMonthFormatter.format(now))}</caption>
  <thead><tr>${weekdays.map((name,index)=>{
   const current=index===activeWeekday;
   return `<th scope="col"${current?' class="tv-calendar-weekday"':''} aria-label="${name}${current?', día de la semana actual':''}">${name.slice(0,3)}</th>`;
  }).join('')}</tr></thead>
  <tbody>${rows.join('')}</tbody></table>`;
}
function content(w){
 switch(w.type){
 case 'contrato':return contractContent();
 case 'reembolsables':
 case 'operativos':return expenseContent(w.type);
 case 'youtube':return videoContent(w);
 case 'resumen':{const counts=data.prev&&prevCounts();return `<div class="tv-kpis">${[[data.equipos?.length,'Equipos registrados'],[data.prev?`${counts[0].n} / ${data.prev.length}`:null,'Actividades ejecutadas · mes contractual'],[data.profiles?.length,'Perfiles activos'],[data.lead?.filter(x=>x.estado==='realizado').length,'Controles realizados · mes calendario']].map(([v,l])=>`<div><strong>${v??'—'}</strong><span>${l}</span></div>`).join('')}</div>`}
 case 'equipos':return data.equipos?`<div class="tv-equipment">${data.equipos.map(e=>`<div><span aria-hidden="true">↕</span><b>${esc(e.nombre)}</b><small>${esc(e.tipo||'Equipo')}</small></div>`).join('')}</div><p class="tv-note">Registro del parque; no representa disponibilidad operacional.</p>`:missing();
 case 'preventivo':return data.prev?donut(prevCounts(),'actividades')+`<p class="tv-note">Mes contractual ${data.month}/${data.year} · corte 21 → 20.</p>`:missing();
 case 'turnos':return data.turns?donut(turnCounts(),'en malla')+'<p class="tv-note">Malla publicada de hoy. Presencia efectiva sujeta a novedades y ausencias.</p>':missing();
 case 'nomina':{if(!data.turns||!data.profiles)return missing();const profiles=new Map(data.profiles.map(p=>[p.id,p]));const groups=new Map();data.turns.forEach(t=>{const k=t.turno_base;if(!groups.has(k))groups.set(k,[]);groups.get(k).push(profiles.get(t.user_id)||{nombre:'Perfil no activo',rol:''})});return groups.size?`<div class="tv-rosters">${[...groups].sort(([a],[b])=>a.localeCompare(b)).map(([k,people])=>`<section><h3>${esc(k==='L'?'Libre':`Turno ${k}`)} <span>${people.length}</span></h3>${people.map(p=>`<p><b>${esc(p.nombre)}</b><small>${esc(roleLabel(p.rol))}</small></p>`).join('')}</section>`).join('')}</div><p class="tv-note">Turno base publicado · ${esc(data.date)}.</p>`:'<p class="tv-empty">No hay turnos publicados para hoy.</p>'}
 case 'personal':{if(!data.profiles)return missing();const counts=new Map();data.profiles.forEach(p=>counts.set(p.rol,(counts.get(p.rol)||0)+1));return `<div class="tv-total"><strong>${data.profiles.length}</strong> perfiles activos</div>`+bars([...counts].map(([r,n])=>({label:roleLabel(r),n})).sort((a,b)=>b.n-a.n))+'<p class="tv-note">Perfiles de plataforma; no equivale a dotación presente en faena.</p>'}
 case 'directorio':{if(!data.profiles)return missing();const groups=new Map();data.profiles.forEach(p=>{if(!groups.has(p.rol))groups.set(p.rol,[]);groups.get(p.rol).push(p)});return `<div class="tv-directory">${[...groups].map(([r,people])=>`<section><h3>${esc(roleLabel(r))}</h3>${people.map(p=>`<p>${esc(p.nombre)}</p>`).join('')}</section>`).join('')}</div>`}
 case 'liderazgo':{if(!data.lead)return missing();const counts=new Map();data.lead.filter(c=>c.estado==='realizado').forEach(c=>{const name=c.control_nombre||c.control_codigo||'Control';counts.set(name,(counts.get(name)||0)+1)});return counts.size?bars([...counts].map(([label,n])=>({label,n})))+'<p class="tv-note">Realizados durante el mes calendario actual.</p>':'<p class="tv-empty">Sin controles realizados este mes.</p>'}
 case 'aviso':return `<div class="tv-message">${esc(w.text||'Agrega un mensaje desde Editar pantallas.').replace(/\n/g,'<br>')}</div>`;
 case 'reloj':return clockContent();
 case 'calendario':return '<div data-tv-calendar></div>';
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
 const grid=root.querySelector('[data-tv-grid]');
 const layout=JSON.stringify(s.widgets);
 if(grid.dataset.layout!==layout){
  grid.innerHTML=s.widgets.length?s.widgets.map(w=>`<article class="tv-widget tv-type-${w.type}" style="grid-column:span ${w.width}"><h2>${esc(w.title)}</h2><div class="tv-widget-content">${content(w)}</div></article>`).join(''):'<p class="tv-empty">Pantalla sin widgets. Usa Editar pantallas para agregar contenido.</p>';
  grid.dataset.layout=layout;
 }else{
  // Mantener los widgets independientes de los datos durante las actualizaciones.
  s.widgets.forEach((w,i)=>{
   if(!['youtube','reloj','calendario'].includes(w.type))grid.children[i].querySelector('.tv-widget-content').innerHTML=content(w);
  });
 }
 root.querySelector('[data-tv-count]').textContent=`${screen+1} / ${config.screens.length}`;
 showStatus(data.errors.length?'Información parcial · '+data.errors.join(' · '):`Datos actualizados: ${new Intl.DateTimeFormat('es-CL',{timeZone:'America/Santiago',dateStyle:'short',timeStyle:'short'}).format(data.updated)}`,!!data.errors.length);
 tick();requestAnimationFrame(fitPresentation);
}
function fitPresentation(){if(!root)return;const grid=root.querySelector('[data-tv-grid]');grid.style.zoom='';if(!root.classList.contains('tv-presenting'))return;const footer=root.querySelector('.tv-footer');const available=root.clientHeight-grid.getBoundingClientRect().top-footer.offsetHeight-12;const ratio=Math.min(1,available/Math.max(1,grid.scrollHeight));grid.style.zoom=String(Math.max(.25,ratio))}
function tick(){
 if(!root)return false;
 const clocks=root.querySelectorAll('[data-tv-clock]');
 const calendars=root.querySelectorAll('[data-tv-calendar]');
 if(!clocks.length&&!calendars.length)return false;
 const now=new Date();
 const date=dateParts(now);
 const day=`${date.year}-${date.month}-${date.day}`;
 let dayChanged=false;
 if(clocks.length){
  const {hour,minute,second}=parts(timeFormatter,now);
  const timestamp=`${hour}:${minute}:${second}`;
  const seconds=Number(second);
  const minutes=Number(minute)+seconds/60;
  const angles={hour:(Number(hour)%12+minutes/60)*30,minute:minutes*6,second:seconds*6};
  for(const node of clocks){
   const display=node.querySelector('time');
   if(display.dateTime!==timestamp){
    display.dateTime=timestamp;
    display.querySelector('.tv-clock-readable').textContent=timestamp;
    for(const [hand,angle] of Object.entries(angles)){
     display.querySelector(`[data-clock-hand="${hand}"]`).setAttribute('transform',`rotate(${angle} 100 100)`);
    }
   }
   if(node.dataset.day!==day){
    node.dataset.day=day;
    node.querySelector('.tv-clock-date').textContent=fullDateFormatter.format(now);
    dayChanged=true;
   }
  }
 }
 for(const node of calendars){
  if(node.dataset.day===day)continue;
  node.dataset.day=day;
  node.innerHTML=calendarContent(now,date);
  dayChanged=true;
 }
 return dayChanged;
}
function schedule(){clearTimeout(rotation);if(playing&&!draft&&root)rotation=setTimeout(()=>{screen=(screen+1)%config.screens.length;render();schedule()},config.seconds*1000);root?.querySelector('[data-tv-action="play"]')?.setAttribute('aria-pressed',String(playing));const b=root?.querySelector('[data-tv-action="play"]');if(b)b.textContent=playing?'Pausar rotación':'Iniciar rotación'}
async function refreshData(){
 if(!root||busy||draft)return;
 clearTimeout(refresh);busy=true;
 const token=epoch,requestedConfig=config;
 try{
  await authorize();const next=await loadData();
  if(root&&token===epoch&&requestedConfig===config){data=next;render()}
 }catch(e){
  if(root&&token===epoch){showStatus(e.message,true);if(!localAdmin()||/sesión|Administrador/.test(e.message))close()}
 }finally{
  if(token===epoch){busy=false;if(root)refresh=setTimeout(refreshData,requestedConfig===config?60000:0)}
 }
}
function selectScreen(i){if(draft)return;screen=Math.max(0,Math.min(config.screens.length-1,i));render();schedule()}
async function searchYoutube(button){
 const box=button.closest('[data-tv-youtube-search]');
 if(!box||button.disabled)return;
 const query=box.querySelector('[data-tv-youtube-query]').value.trim();
 const status=box.querySelector('[data-tv-youtube-status]');
 const results=box.querySelector('[data-tv-youtube-results]');
 const external=box.querySelector('[data-tv-youtube-external]');
 results.replaceChildren();external.hidden=true;
 if(query.length<2){status.textContent='Escribe al menos dos caracteres para buscar.';return}
 external.href='https://www.youtube.com/results?search_query='+encodeURIComponent(query);
 button.disabled=true;results.setAttribute('aria-busy','true');status.textContent='Buscando videos…';
 try{
  const {data,error}=await sb.functions.invoke('tv-youtube-search',{body:{query}});
  if(error){
   let message='La búsqueda integrada no está disponible.';
   if(error.context instanceof Response){
    const response=await error.context.json().catch(()=>null);
    if(typeof response?.error==='string')message=response.error;
   }
   throw new Error(message);
  }
  if(!box.isConnected)return;
  const items=(Array.isArray(data?.items)?data.items:[]).filter(item=>/^[\w-]{11}$/.test(item?.id||''));
  results.innerHTML=items.map(item=>`<li><button type="button" data-tv-action="youtube-select" data-video="${item.id}"><strong>${esc(item.title)}</strong><small>${esc(item.channel)}</small></button></li>`).join('');
  status.textContent=items.length?`${items.length} videos disponibles. Elige uno.`:'No se encontraron videos insertables.';
  external.hidden=items.length>0;
 }catch(error){
  if(box.isConnected){status.textContent=error.message;external.hidden=false}
 }finally{
  button.disabled=false;results.removeAttribute('aria-busy');
 }
}
function chooseYoutube(button){
 const id=button.dataset.video;
 const box=button.closest('[data-tv-youtube-search]');
 if(!box||!/^[\w-]{11}$/.test(id||''))return;
 const input=box.closest('fieldset').querySelector('input[data-tv-field="text"]');
 input.value='https://youtu.be/'+id;
 input.dispatchEvent(new Event('input',{bubbles:true}));
 box.querySelector('[data-tv-youtube-status]').textContent='Video seleccionado. Guarda las pantallas para mostrarlo.';
}
function widgetEditorField(widget){
 if(widget.type==='aviso')return `<label class="tv-wide">Mensaje<textarea data-tv-field="text" maxlength="1000" rows="3">${esc(widget.text)}</textarea></label>`;
 if(widget.type==='youtube')return `
  <div class="tv-wide tv-youtube-search" data-tv-youtube-search>
   <label>Buscar en YouTube<input type="search" data-tv-youtube-query maxlength="120" placeholder="Nombre del video o del canal"></label>
   <button type="button" data-tv-action="youtube-search">Buscar videos</button>
   <p data-tv-youtube-status role="status"></p>
   <ul class="tv-youtube-results" data-tv-youtube-results></ul>
   <a data-tv-youtube-external target="_blank" rel="noopener noreferrer" hidden>Buscar en YouTube y copiar el enlace</a>
  </div>
  <label class="tv-wide">Enlace de YouTube<input type="url" data-tv-field="text" maxlength="1000" required value="${esc(widget.text)}" placeholder="https://www.youtube.com/watch?v=…"><small>Reproducción automática sin sonido. Pausa la rotación para mantener esta pantalla visible.</small></label>`;
 return '';
}
function editor(){
 if(!localAdmin())return close();if(!draft)draft=structuredClone(config);clearTimeout(rotation);const s=draft.screens[screen];
 const panel=root.querySelector('[data-tv-editor]');panel.hidden=false;[...root.children].forEach(n=>{if(n!==panel)n.inert=true});
 panel.innerHTML=`<form data-tv-form><header><h2>Editar pantallas</h2><button type="button" data-tv-action="cancel">Cerrar editor</button></header><p>Los cambios se comparten entre sesiones de Administrador al guardar.</p><div class="tv-editor-fields"><label>Pantalla<select name="screen">${draft.screens.map((s,i)=>`<option value="${i}" ${i===screen?'selected':''}>${esc(s.title)}</option>`).join('')}</select></label><label>Título<input name="title" maxlength="80" required value="${esc(s.title)}"></label><label>Segundos por pantalla<input name="seconds" type="number" min="10" max="300" value="${draft.seconds}" required></label></div><div class="tv-editor-actions"><button type="button" data-tv-action="add-screen">Agregar pantalla</button><button type="button" data-tv-action="screen-up" ${screen===0?'disabled':''}>← Mover pantalla</button><button type="button" data-tv-action="screen-down" ${screen===draft.screens.length-1?'disabled':''}>Mover pantalla →</button><button type="button" data-tv-action="delete-screen" ${draft.screens.length===1?'disabled':''}>Eliminar pantalla</button></div><div class="tv-widget-edit-list">${s.widgets.map((w,i)=>`<fieldset data-tv-widget="${i}"><legend>${esc(TYPES[w.type])}</legend><label>Título<input data-tv-field="title" maxlength="80" value="${esc(w.title)}"></label><label>Ancho<select data-tv-field="width">${[[4,'⅓ pantalla'],[6,'½ pantalla'],[8,'⅔ pantalla'],[12,'Pantalla completa']].map(([n,l])=>`<option value="${n}" ${w.width===n?'selected':''}>${l}</option>`).join('')}</select></label>${widgetEditorField(w)}<div class="tv-editor-actions tv-wide"><button type="button" data-tv-action="up" data-index="${i}" ${i===0?'disabled':''}>↑ Subir</button><button type="button" data-tv-action="down" data-index="${i}" ${i===s.widgets.length-1?'disabled':''}>↓ Bajar</button><button type="button" data-tv-action="remove" data-index="${i}">Quitar widget</button></div></fieldset>`).join('')}</div><div class="tv-editor-actions"><label>Agregar widget<select name="type">${Object.entries(TYPES).map(([k,v])=>`<option value="${k}">${v}</option>`).join('')}</select></label><button type="button" data-tv-action="add-widget">Agregar widget</button></div><p data-tv-save-error role="status"></p><footer><button type="button" data-tv-action="cancel">Descartar cambios</button><button type="submit" class="tv-primary">Guardar pantallas</button></footer></form>`;
 panel.querySelector('form').onsubmit=save;panel.querySelector('[data-tv-action="cancel"]').focus();
 panel.onkeydown=event=>{
  if(event.key==='Enter'&&event.target.matches('[data-tv-youtube-query]')){
   event.preventDefault();
   event.target.closest('[data-tv-youtube-search]').querySelector('[data-tv-action="youtube-search"]').click();
  }
 };
 panel.oninput=e=>{const n=e.target;if(n.name==='title')s.title=n.value;if(n.name==='seconds')draft.seconds=Number(n.value);const row=n.closest('[data-tv-widget]');if(row&&n.dataset.tvField){const w=s.widgets[Number(row.dataset.tvWidget)];w[n.dataset.tvField]=n.dataset.tvField==='width'?Number(n.value):n.value}};
 panel.onchange=e=>{if(e.target.name==='screen'){screen=Number(e.target.value);editor()}};
}
function cancelEdit(){draft=null;root.querySelector('[data-tv-editor]').hidden=true;[...root.children].forEach(n=>n.inert=false);render();schedule();clearTimeout(refresh);refresh=setTimeout(refreshData,60000);root.querySelector('[data-tv-action="edit"]').focus()}
async function save(e){
 e.preventDefault();if(!draft||!root)return;const form=e.target,button=form.querySelector('[type="submit"]');button.disabled=true;const token=epoch;
 try{
  const value=normalize(draft);
  for(const current of value.screens){
   for(const widget of current.widgets.filter(w=>w.type==='youtube')){
    const id=videoId(widget.text);
    if(!id)throw new Error(`Ingresa un enlace válido de YouTube en «${current.title}».`);
    widget.text=`https://youtu.be/${id}`;
   }
  }
  const user=await authorize();const now=new Date().toISOString();let q;
 if(configStamp)q=await sb.from(TABLE).update({valor:value,updated_at:now,updated_by:user}).eq('id',KEY).eq('updated_at',configStamp).select('updated_at');
 else q=await sb.from(TABLE).insert({id:KEY,valor:value,updated_at:now,updated_by:user}).select('updated_at');
 if(q.error)throw new Error(q.error.code==='23505'?'Otra sesión creó las pantallas. Cierra y abre el modo TV para cargar su configuración.':q.error.message);
 if(!q.data?.length)throw new Error('La configuración cambió en otra sesión. Cierra y abre el modo TV antes de editar nuevamente.');
 if(root&&token===epoch){config=value;configStamp=q.data[0].updated_at;cancelEdit();showStatus('Pantallas guardadas para todos los Administradores.');void refreshData()}
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
 if(a==='youtube-search')return searchYoutube(b);
 if(a==='youtube-select')return chooseYoutube(b);
 if(a==='add-screen'&&draft.screens.length<MAX_SCREENS){draft.screens.push({id:uid(),title:'Nueva pantalla',widgets:[widget('aviso',12)]});screen=draft.screens.length-1}
 if(a==='delete-screen'&&draft.screens.length>1){draft.screens.splice(screen,1);screen=Math.min(screen,draft.screens.length-1)}
 if(a==='screen-up'&&screen>0){[draft.screens[screen-1],draft.screens[screen]]=[draft.screens[screen],draft.screens[screen-1]];screen--}
 if(a==='screen-down'&&screen<draft.screens.length-1){[draft.screens[screen+1],draft.screens[screen]]=[draft.screens[screen],draft.screens[screen+1]];screen++}
 if(a==='add-widget'&&s.widgets.length<MAX_WIDGETS){
  const type=root.querySelector('[name="type"]').value;
  s.widgets.push(widget(type,type==='youtube'?12:6));
 }
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
 document.body.append(root);inertNodes=[...document.body.children].filter(n=>n!==root&&n instanceof HTMLElement&&!['SCRIPT','STYLE','LINK'].includes(n.tagName)).map(n=>({node:n,inert:n.inert}));inertNodes.forEach(x=>x.node.inert=true);document.body.classList.add('stainher-tv-open');root.addEventListener('click',action);document.addEventListener('keydown',keydown);window.v151CloseDrawer?.();screen=0;playing=false;render();root.querySelector('[data-tv-action="close"]').focus();refresh=setTimeout(refreshData,60000);clock=setInterval(()=>{if(tick())fitPresentation()},1000);
 }catch(e){if(typeof toast==='function')toast(e.message,'error');else console.error(e.message)}finally{if(token===epoch)busy=false}
}
function close(){++epoch;clearTimeout(rotation);clearTimeout(refresh);clearInterval(clock);playing=false;busy=false;draft=null;if(root&&document.fullscreenElement===root)document.exitFullscreen().catch(()=>{});root?.remove();root=null;inertNodes.forEach(x=>{if(x.node.isConnected)x.node.inert=x.inert});inertNodes=[];document.body.classList.remove('stainher-tv-open');document.removeEventListener('keydown',keydown);priorFocus?.focus?.()}
function install(){
 const admin=localAdmin(),nav=document.querySelector('.sidebar .nav');let b=document.getElementById('stainher-tv-open');
 if(!admin){b?.remove();if(root)close();return}
 if(nav&&!b){b=document.createElement('button');b.type='button';b.id='stainher-tv-open';b.textContent='▣ Diario mural · TV';b.onclick=open;nav.append(b)}
}
function boot(){
 const link=document.createElement('link');link.rel='stylesheet';link.href=new URL('stainher-tv-r397.css?build=20261109-r404',document.currentScript?.src||document.baseURI).href;document.head.append(link);
 let queued=false;new MutationObserver(()=>{if(queued)return;queued=true;queueMicrotask(()=>{queued=false;install()})}).observe(document.getElementById('appView')||document.body,{childList:true,subtree:true,attributes:true,attributeFilter:['class','hidden']});
 if(typeof sb!=='undefined')unsubscribe=sb.auth.onAuthStateChange((event,session)=>{if(event==='SIGNED_OUT'||!session)close();setTimeout(install,0)}).data?.subscription;
 install();window.addEventListener('stainher:modules-ready',install);window.addEventListener('resize',fitPresentation);document.addEventListener('fullscreenchange',fitPresentation);
}
window.StainherTV=Object.freeze({open,close,install});
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
