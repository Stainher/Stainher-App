/* R322: Pareto por subsistema basado en registros de averías. Mantiene intacto el Pareto por equipo. */
(()=>{
'use strict';
if(window.__STAINHER_PARETO_SUBSYSTEM_R322__)return;
window.__STAINHER_PARETO_SUBSYSTEM_R322__=true;
const CATEGORIES=[
 ['Puertas y accesos',/puerta|operador|espad[ií]n|cerradura|enclavamiento|fotoc[eé]lula|fotorruptor|barrera|cortina/i],
 ['Control y electrónica',/variador|inversor|controlador|placa|tarjeta|display|comunicaci[oó]n|software|sensor|rel[eé]|contact(or|o)|botonera|pulsador/i],
 ['Alimentación eléctrica',/tensi[oó]n|voltaje|alimentaci[oó]n|diferencial|interruptor autom[aá]tico|corte el[eé]ctrico|fase|fusible|cortocircuito/i],
 ['Tracción y transmisión',/motor|reductor|polea|cable de tracci[oó]n|pi[nñ][oó]n|freno|gu[ií]a|rodillo|cadena|huinche/i],
 ['Seguridad',/paraca[ií]das|limitador|fin de carrera|emergencia|pesacarga|sobrecarga|seguridad/i],
 ['Hidráulica',/hidr[aá]ulic|pist[oó]n|bomba|v[aá]lvula|manguera|filtraci[oó]n de aceite/i],
 ['Cabina y nivelación',/cabina|nivelaci[oó]n|piso|plataforma|umbral/i]
];
const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim();
const escape=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function classify(r){
 const supplied=norm(r.subsistema||r.subsistema_falla||r.categoria_falla||'');
 if(supplied)return supplied;
 const desc=[r.causa,r.descripcion_falla,r.falla,r.descripcion,r.observaciones,r.detalle].filter(Boolean).join(' ');
 const matches=CATEGORIES.filter(([,re])=>re.test(desc));
 return matches.length===1?matches[0][0]:'Sin clasificar';
}
function aggregate(rows){
 const groups=new Map();
 for(const r of rows){
  if(r.excluir_kpi===true)continue;
  const key=classify(r),hours=Number(r.duracion_horas)||Number(r.duracion_minutos||0)/60||0;
  const a=groups.get(key)||{subsistema:key,fallas:0,horas:0};
  a.fallas++;a.horas+=Math.max(0,hours);groups.set(key,a);
 }
 const ranked=[...groups.values()].sort((a,b)=>b.fallas-a.fallas||b.horas-a.horas);
 const total=ranked.reduce((sum,r)=>sum+r.fallas,0);let running=0;
 return ranked.map(r=>({...r,porcentaje:total?100*r.fallas/total:0,acumulado:total?100*(running+=r.fallas)/total:0}));
}
function mount(){
 const page=document.getElementById('page-correctivo');
 if(!page||!window.state||!Array.isArray(window.state.correctivo))return;
 let host=page.querySelector('#stainher-pareto-subsistema-r322');
 if(!host){
  host=document.createElement('section');host.id='stainher-pareto-subsistema-r322';
  host.className='panel';host.style.cssText='margin:16px 0;padding:16px';
  const toolbar=page.querySelector('.v1524-reliability-toolbar');
  (toolbar?.parentElement||page).appendChild(host);
 }
 let source=window.state.correctivo;
 const eq=document.getElementById('corrEquipo')?.value;
 if(eq)source=source.filter(r=>String(r.equipo||'')===eq);
 const rows=aggregate(source),uncategorized=rows.find(r=>r.subsistema==='Sin clasificar')?.fallas||0;
 const table=rows.map(r=>`<tr><td>${escape(r.subsistema)}</td><td>${r.fallas}</td><td>${r.horas.toLocaleString('es-CL',{maximumFractionDigits:1})}</td><td>${r.porcentaje.toFixed(1)}%</td><td>${r.acumulado.toFixed(1)}%</td></tr>`).join('');
 host.innerHTML=`<h3>Pareto de fallas por subsistema</h3><p class="muted">Clasificación orientativa por descripción y causa registradas. Frecuencia, duración acumulada y Pareto 80/20. Se excluyen del cálculo KPI los registros marcados para exclusión.</p><div style="overflow-x:auto"><table style="width:100%;min-width:560px"><thead><tr><th>Subsistema</th><th>Fallas</th><th>Horas</th><th>% frecuencia</th><th>% acumulado</th></tr></thead><tbody>${table||'<tr><td colspan="5">Sin averías válidas para analizar.</td></tr>'}</tbody></table></div><small class="muted">${uncategorized} evento(s) sin clasificación inequívoca. El umbral Pareto se alcanza en el primer subsistema con 80% acumulado o superior.</small>`;
}
let timer=0;
function schedule(){clearTimeout(timer);timer=setTimeout(mount,120)}
function install(){mount();const page=document.getElementById('page-correctivo');if(page)new MutationObserver(schedule).observe(page,{childList:true})}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.StainherSubsystemParetoR322={classify,aggregate,mount};
})();