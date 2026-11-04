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
function normalizedCategory(value){
 const v=norm(value).toLowerCase().replace(/\s+/g,' ');
 if(!v)return '';
 if(/puerta|enclavamiento|acceso/.test(v))return 'Puertas y accesos';
 if(/seguridad|proteccion/.test(v))return 'Seguridad';
 if(/electr|alimentaci[oó]n|energia/.test(v))return 'Alimentación eléctrica';
 if(/cable|tracci[oó]n|transmisi[oó]n|mec[aá]nic|freno|aire comprimido/.test(v))return 'Tracción y transmisión';
 if(/control|electr[oó]nic|automatizaci[oó]n/.test(v))return 'Control y electrónica';
 if(/hidraul|neumat|pist[oó]n/.test(v))return 'Hidráulica';
 if(/cabina|nivelaci[oó]n/.test(v))return 'Cabina y nivelación';
 return norm(value);
}
function declaredSubsystem(r){
 const direct=r.subsistema||r.subsistema_falla||r.categoria_falla;
 if(String(direct||'').trim())return normalizedCategory(direct);
 // R374: respetar el campo explícito "Subsistema:" al inicio de Observaciones.
 // Evitar interpretar palabras de la descripción, causa o acción como categoría.
 const m=String(r.observaciones||'').match(/(?:^|[\r\n])\s*subsistema\s*:\s*([^\r\n]+)/i);
 return m?normalizedCategory(m[1]):'';
}
function classify(r){
 const supplied=declaredSubsystem(r);
 if(supplied)return supplied;
 const desc=[r.causa,r.descripcion_falla,r.falla,r.descripcion,r.observaciones,r.detalle].filter(Boolean).join(' ');
 // Primero identificar componentes específicos; palabras genéricas como "cabina"
 // o "piso" no deben anular una falla explícita de puertas o alimentación.
 const matches=CATEGORIES.filter(([,re])=>re.test(desc));
 if(!matches.length)return 'Sin clasificar';
 const specific=matches.filter(([name])=>name!=='Cabina y nivelación');
 if(specific.length===1)return specific[0][0];
 if(specific.length>1){
   const leading=norm(desc).split(/(?:causa probable|accion correctiva|acción correctiva)/i)[0];
   const leadMatch=specific.filter(([,re])=>re.test(leading));
   if(leadMatch.length===1)return leadMatch[0][0];
   return 'Sin clasificar';
 }
 return matches[0][0];
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
function drawChart(canvas,rows,metric){
 const width=Math.max(620,canvas.parentElement?.clientWidth||620),height=290,dpr=window.devicePixelRatio||1;
 canvas.width=width*dpr;canvas.height=height*dpr;canvas.style.width='100%';canvas.style.height=height+'px';
 const c=canvas.getContext('2d');c.scale(dpr,dpr);c.clearRect(0,0,width,height);
 c.fillStyle='#ffffff';c.fillRect(0,0,width,height);
 const left=52,right=54,top=24,bottom=82,plotW=width-left-right,plotH=height-top-bottom;
 const max=Math.max(1,...rows.map(r=>metric==='horas'?r.horas:r.fallas));
 c.font='12px system-ui';c.fillStyle='#29465e';c.strokeStyle='#d4e0eb';c.lineWidth=1;
 for(let i=0;i<=4;i++){const y=top+plotH-i*plotH/4;c.beginPath();c.moveTo(left,y);c.lineTo(width-right,y);c.stroke();c.fillText((max*i/4).toFixed(metric==='horas'?1:0),8,y+4);c.fillText(String(i*25)+'%',width-right+7,y+4)}
 if(!rows.length){c.fillText('Sin fallas válidas para graficar',left+25,top+plotH/2);return}
 const slot=plotW/rows.length,barW=Math.max(8,Math.min(48,slot*.55)),points=[];
 rows.forEach((r,i)=>{
  const center=left+slot*(i+.5),v=metric==='horas'?r.horas:r.fallas;
  const bh=v/max*plotH,y=top+plotH-bh;
  c.fillStyle='#2879bd';c.fillRect(center-barW/2,y,barW,bh);
  c.fillStyle='#223b52';c.textAlign='center';c.fillText(metric==='horas'?v.toFixed(1):String(v),center,Math.max(top+11,y-5));
  const label=r.subsistema.length>19?r.subsistema.slice(0,17)+'…':r.subsistema;
  c.save();c.translate(center,top+plotH+12);c.rotate(-Math.PI/5);c.textAlign='right';c.font='10px system-ui';c.fillText(label,0,0);c.restore();
  points.push([center,top+plotH-(r.acumulado/100)*plotH]);
 });
 c.strokeStyle='#ec8d29';c.lineWidth=3;c.beginPath();points.forEach(([x,y],i)=>i?c.lineTo(x,y):c.moveTo(x,y));c.stroke();
 c.fillStyle='#ec8d29';points.forEach(([x,y])=>{c.beginPath();c.arc(x,y,3.5,0,Math.PI*2);c.fill()});
 c.setLineDash([5,5]);c.strokeStyle='#c34c4c';c.lineWidth=1.5;
 const cutoff=top+plotH*.2;c.beginPath();c.moveTo(left,cutoff);c.lineTo(width-right,cutoff);c.stroke();c.setLineDash([]);
 c.textAlign='left';c.font='11px system-ui';c.fillStyle='#2879bd';c.fillText('■ '+(metric==='horas'?'Horas de intervención':'Cantidad de fallas'),left,13);c.fillStyle='#d47b16';c.fillText('● % acumulado',left+190,13);c.fillStyle='#b23e3e';c.fillText('80%',width-right-24,cutoff-5);
}
function refreshChart(){
 const host=document.getElementById('stainher-pareto-subsistema-r322');
 const canvas=host?.querySelector('[data-pareto-canvas]');
 if(!canvas)return;
 const metric=host.querySelector('[data-pareto-metric]')?.value||'fallas';
 const eq=document.getElementById('corrEquipo')?.value||'';
 const source=(window.state?.correctivo||[]).filter(r=>!eq||String(r.equipo||'')===eq);
 const rows=aggregate(source);
 drawChart(canvas,rows,metric);
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
 host.innerHTML=`<h3>Pareto de fallas por subsistema</h3><label style="display:inline-flex;align-items:center;gap:8px;margin:8px 0">Barras por <select data-pareto-metric class="field"><option value="fallas">Frecuencia de fallas</option><option value="horas">Duración acumulada (horas)</option></select></label><div style="max-width:100%;overflow-x:auto"><canvas data-pareto-canvas role="img" aria-label="Gráfico Pareto por subsistema: barras de frecuencia u horas, línea de porcentaje acumulado y umbral 80 por ciento"></canvas></div><p class="muted">Clasificación orientativa por descripción y causa registradas. Frecuencia, duración acumulada y Pareto 80/20. Se excluyen del cálculo KPI los registros marcados para exclusión.</p><div style="overflow-x:auto"><table style="width:100%;min-width:560px"><thead><tr><th>Subsistema</th><th>Fallas</th><th>Horas</th><th>% frecuencia</th><th>% acumulado</th></tr></thead><tbody>${table||'<tr><td colspan="5">Sin averías válidas para analizar.</td></tr>'}</tbody></table></div><small class="muted">${uncategorized} evento(s) sin clasificación inequívoca. El umbral Pareto se alcanza en el primer subsistema con 80% acumulado o superior.</small>`;
 host.querySelector('[data-pareto-metric]')?.addEventListener('change',refreshChart);
 refreshChart();
}
let timer=0,lastSignature='';
function schedule(){clearTimeout(timer);timer=setTimeout(mount,120)}
function signature(){
  const rows=window.state?.correctivo||[];
  const eq=document.getElementById('corrEquipo')?.value||'';
  return [window.state?.correctivoFrom,window.state?.correctivoTo,eq,rows.length,rows.map(r=>[r.id,r.fecha_inicio,r.duracion_horas,r.excluir_kpi,r.observaciones].join(':')).join('|')].join('~');
}
function install(){
  mount();lastSignature=signature();
  // El historial actualiza state.correctivo de forma asíncrona. Un observador de DOM
  // no detecta los cambios del array; comprobar la firma evita dejar el Pareto vacío.
  setInterval(()=>{
    const page=document.getElementById('page-correctivo');
    if(!page)return;
    const next=signature();
    if(next!==lastSignature||!page.querySelector('#stainher-pareto-subsistema-r322')){
      lastSignature=next;mount();
    }
  },800);
}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
window.StainherSubsystemParetoR322={classify,aggregate,mount,refreshChart,getCanvas:()=>document.querySelector('[data-pareto-canvas]')};
})();