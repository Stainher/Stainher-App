/* Stainher V15.24 · R144 · Dashboard e informe de Estandarización. */
(()=>{
  'use strict';
  const BUILD='20261002-r144-standardization-dashboard';
  if(window.__STAINHER_STANDARDIZATION_DASHBOARD_R144__===BUILD)return;
  window.__STAINHER_STANDARDIZATION_DASHBOARD_R144__=BUILD;

  const TABLE='estandarizacion_actividades_v141';
  const state={rows:[],lastLoad:0,loading:null,charts:{},observer:null,observed:null,timer:null,enhancing:false};

  const esc=value=>{
    if(typeof window.esc==='function')return window.esc(value??'');
    return String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  };
  const statusLabel=value=>value==='REALIZADO'?'Realizado':value==='EN PROCESO'?'En proceso':'No realizado';
  const todayIso=()=>{
    const d=new Date();
    return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  };
  const stats=rows=>{
    const total=rows.length;
    const done=rows.filter(x=>x.estado==='REALIZADO').length;
    const process=rows.filter(x=>x.estado==='EN PROCESO').length;
    const pending=rows.filter(x=>x.estado==='NO REALIZADO').length;
    const pct=total?Math.round(done*1000/total)/10:0;
    return {total,done,process,pending,pct};
  };
  const groups=rows=>{
    const map=new Map();
    rows.forEach(row=>{
      const key=row.equipo||'Sin equipo';
      if(!map.has(key))map.set(key,[]);
      map.get(key).push(row);
    });
    return [...map.entries()].sort((a,b)=>a[0].localeCompare(b[0],'es')).map(([name,list])=>({name,rows:list,...stats(list)}));
  };
  const css=name=>getComputedStyle(document.documentElement).getPropertyValue(name).trim()||getComputedStyle(document.body).getPropertyValue(name).trim();
  const chartColors=()=>({
    text:css('--text')||'#e5e7eb',muted:css('--muted')||'#94a3b8',line:css('--line')||'#334155',
    green:css('--green')||'#34d399',yellow:css('--yellow')||'#fbbf24',red:css('--red')||'#fb7185'
  });

  function ensureStyles(){
    if(document.getElementById('stainher-standardization-dashboard-r144-style'))return;
    const style=document.createElement('style');
    style.id='stainher-standardization-dashboard-r144-style';
    style.textContent=`
      #page-estandarizacion .std-dashboard-r144{display:grid;grid-template-columns:minmax(280px,.8fr) minmax(460px,1.45fr);gap:16px;margin:0 0 18px}
      #page-estandarizacion .std-dashboard-card-r144{background:linear-gradient(180deg,var(--panel2),var(--panel));border:1px solid var(--line);border-radius:14px;padding:16px;min-width:0}
      #page-estandarizacion .std-dashboard-title-r144{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;margin-bottom:12px}
      #page-estandarizacion .std-dashboard-title-r144 h3{margin:0;font-size:15px}
      #page-estandarizacion .std-dashboard-title-r144 small{display:block;color:var(--muted);margin-top:4px;line-height:1.35}
      #page-estandarizacion .std-chart-total-r144{height:270px;position:relative;display:grid;place-items:center}
      #page-estandarizacion .std-chart-equipment-r144{height:310px;position:relative}
      #page-estandarizacion .std-chart-total-r144 canvas,#page-estandarizacion .std-chart-equipment-r144 canvas{width:100%!important;height:100%!important}
      #page-estandarizacion .std-chart-center-r144{position:absolute;inset:0;display:grid;place-content:center;text-align:center;pointer-events:none}
      #page-estandarizacion .std-chart-center-r144 strong{font-size:30px;line-height:1}
      #page-estandarizacion .std-chart-center-r144 span{font-size:11px;color:var(--muted);margin-top:5px;text-transform:uppercase;letter-spacing:.05em}
      #page-estandarizacion .std-dashboard-legend-r144{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;margin-top:10px}
      #page-estandarizacion .std-dashboard-legend-r144>div{border:1px solid var(--line);border-radius:10px;padding:9px;background:rgba(0,0,0,.08)}
      #page-estandarizacion .std-dashboard-legend-r144 span{display:block;color:var(--muted);font-size:10px;text-transform:uppercase}
      #page-estandarizacion .std-dashboard-legend-r144 b{display:block;font-size:18px;margin-top:4px}
      #page-estandarizacion .std-dashboard-table-r144{width:100%;margin-top:12px;font-size:11px}
      #page-estandarizacion .std-dashboard-table-r144 td,#page-estandarizacion .std-dashboard-table-r144 th{padding:7px 6px}
      @media(max-width:1100px){#page-estandarizacion .std-dashboard-r144{grid-template-columns:1fr}}
      @media(max-width:600px){#page-estandarizacion .std-chart-equipment-r144{height:370px}#page-estandarizacion .std-dashboard-legend-r144{grid-template-columns:1fr 1fr 1fr}}
    `;
    document.head.appendChild(style);
  }

  async function loadRows(force=false){
    const now=Date.now();
    if(!force&&state.rows.length&&now-state.lastLoad<2500)return state.rows;
    if(state.loading)return state.loading;
    state.loading=(async()=>{
      const q=await window.sb.from(TABLE).select('*').eq('activo',true).order('orden',{ascending:true});
      if(q.error)throw q.error;
      state.rows=q.data||[];
      state.lastLoad=Date.now();
      return state.rows;
    })();
    try{return await state.loading}finally{state.loading=null}
  }

  function destroyCharts(){
    Object.values(state.charts).forEach(chart=>{try{chart?.destroy?.()}catch(_){}});
    state.charts={};
  }

  function dashboardHtml(rows){
    const s=stats(rows),gs=groups(rows);
    return `<section id="stdDashboardR144" class="std-dashboard-r144">
      <article class="std-dashboard-card-r144">
        <div class="std-dashboard-title-r144"><div><h3>Avance total</h3><small>Estado consolidado de todas las actividades de estandarización.</small></div><span class="status ${s.pending?'warn':'ok'}">${s.pct}%</span></div>
        <div class="std-chart-total-r144"><canvas id="stdTotalChartR144"></canvas><div class="std-chart-center-r144"><strong>${s.pct}%</strong><span>completado</span></div></div>
        <div class="std-dashboard-legend-r144">
          <div><span>Realizadas</span><b>${s.done}</b></div>
          <div><span>En proceso</span><b>${s.process}</b></div>
          <div><span>No realizadas</span><b>${s.pending}</b></div>
        </div>
      </article>
      <article class="std-dashboard-card-r144">
        <div class="std-dashboard-title-r144"><div><h3>Avance por equipo</h3><small>Comparación de actividades realizadas, en proceso y pendientes.</small></div><span class="muted">${gs.length} equipos</span></div>
        <div class="std-chart-equipment-r144"><canvas id="stdEquipmentChartR144"></canvas></div>
        <table class="std-dashboard-table-r144"><thead><tr><th>Equipo</th><th>Avance</th><th>Realizadas</th><th>Pendientes</th></tr></thead><tbody>
          ${gs.map(g=>`<tr><td>${esc(g.name)}</td><td><b>${g.pct}%</b></td><td>${g.done}/${g.total}</td><td>${g.process+g.pending}</td></tr>`).join('')}
        </tbody></table>
      </article>
    </section>`;
  }

  function renderCharts(rows){
    if(typeof window.Chart!=='function')return;
    destroyCharts();
    const c=chartColors(),s=stats(rows),gs=groups(rows);
    const total=document.getElementById('stdTotalChartR144');
    const equipment=document.getElementById('stdEquipmentChartR144');
    if(total){
      state.charts.total=new window.Chart(total,{
        type:'doughnut',
        data:{labels:['Realizadas','En proceso','No realizadas'],datasets:[{data:[s.done,s.process,s.pending],backgroundColor:[c.green,c.yellow,c.red],borderWidth:0,hoverOffset:5}]},
        options:{responsive:true,maintainAspectRatio:false,cutout:'70%',plugins:{legend:{display:false},tooltip:{callbacks:{label:ctx=>`${ctx.label}: ${ctx.raw}`}}}}
      });
    }
    if(equipment){
      state.charts.equipment=new window.Chart(equipment,{
        type:'bar',
        data:{labels:gs.map(g=>g.name),datasets:[
          {label:'Realizadas',data:gs.map(g=>g.done),backgroundColor:c.green,borderWidth:0},
          {label:'En proceso',data:gs.map(g=>g.process),backgroundColor:c.yellow,borderWidth:0},
          {label:'No realizadas',data:gs.map(g=>g.pending),backgroundColor:c.red,borderWidth:0}
        ]},
        options:{responsive:true,maintainAspectRatio:false,indexAxis:'y',interaction:{mode:'index',intersect:false},plugins:{legend:{position:'bottom',labels:{color:c.text,boxWidth:12,boxHeight:12,usePointStyle:true}},tooltip:{callbacks:{footer:items=>{const i=items?.[0]?.dataIndex??0,g=gs[i];return g?`Avance: ${g.pct}%`:''}}}},scales:{x:{stacked:true,beginAtZero:true,ticks:{color:c.muted,precision:0},grid:{color:c.line}},y:{stacked:true,ticks:{color:c.text,font:{size:11}},grid:{display:false}}}}
      });
    }
  }

  function ensureReportButton(){
    const actions=document.querySelector('#page-estandarizacion .topbar .actions');
    if(!actions||actions.querySelector('[data-std-report-r144]'))return;
    const button=document.createElement('button');
    button.className='btn';
    button.type='button';
    button.dataset.stdReportR144='1';
    button.textContent='↓ Informe PDF';
    button.onclick=generateReport;
    actions.insertBefore(button,actions.firstChild);
  }

  async function enhance(force=false){
    if(state.enhancing)return;
    const page=document.getElementById('page-estandarizacion');
    if(!page)return;
    state.enhancing=true;
    try{
      ensureStyles();
      const rows=await loadRows(force);
      ensureReportButton();
      const current=document.getElementById('stdDashboardR144');
      if(current)current.remove();
      const kpis=page.querySelector('.std-kpis');
      if(!kpis)return;
      kpis.insertAdjacentHTML('afterend',dashboardHtml(rows));
      requestAnimationFrame(()=>renderCharts(rows));
      observe(page);
    }catch(error){
      console.error('[Stainher Estandarización R144]',error);
      window.toast?.('No se pudo cargar el dashboard de Estandarización.','error');
    }finally{state.enhancing=false}
  }

  function scheduleEnhance(force=false){
    clearTimeout(state.timer);
    state.timer=setTimeout(()=>{
      const page=document.getElementById('page-estandarizacion');
      if(page&&!page.classList.contains('hidden'))enhance(force);
    },160);
  }

  function observe(page){
    if(state.observed===page&&state.observer)return;
    try{state.observer?.disconnect?.()}catch(_){}
    state.observed=page;
    state.observer=new MutationObserver(mutations=>{
      if(state.enhancing)return;
      const structural=mutations.some(m=>m.type==='childList'&&[...m.addedNodes,...m.removedNodes].some(n=>n?.nodeType===1));
      if(structural&&!document.getElementById('stdDashboardR144'))scheduleEnhance(true);
      else ensureReportButton();
    });
    state.observer.observe(page,{childList:true,subtree:false});
  }

  function drawStackedBar(doc,x,y,w,h,values,total,colors){
    let cursor=x;
    const safeTotal=Math.max(1,total);
    values.forEach((value,i)=>{
      const width=w*(value/safeTotal);
      doc.setFillColor(...colors[i]);
      if(width>0)doc.rect(cursor,y,width,h,'F');
      cursor+=width;
    });
    doc.setDrawColor(190,195,202);doc.rect(x,y,w,h);
  }

  function reportHeader(doc,title,subtitle){
    if(typeof window.pdfHeader==='function'){
      try{window.pdfHeader(doc,title,subtitle);return}catch(_){}
    }
    doc.setFont('helvetica','bold');doc.setFontSize(17);doc.text(title,14,17);
    doc.setFont('helvetica','normal');doc.setFontSize(9);doc.setTextColor(90,98,108);doc.text(subtitle,14,24);doc.setTextColor(0,0,0);
  }

  async function generateReport(){
    let rows;
    try{rows=await loadRows(true)}catch(error){return window.toast?.('No se pudo obtener la información para el informe: '+(error.message||error),'error')}
    const JsPDF=window.jspdf?.jsPDF||window.jsPDF;
    if(typeof JsPDF!=='function')return window.toast?.('No se pudo cargar el generador PDF.','error');
    const s=stats(rows),gs=groups(rows),doc=new JsPDF({orientation:'landscape',unit:'mm',format:'a4'});
    const green=[52,211,153],yellow=[251,191,36],red=[251,113,133],dark=[35,43,54],light=[245,247,250];
    const issued=new Date().toLocaleString('es-CL',{dateStyle:'long',timeStyle:'short'});
    reportHeader(doc,'Informe de Estandarización',`Estado consolidado · ${issued}`);

    const cards=[['Total',s.total,dark],['Realizadas',s.done,green],['En proceso',s.process,yellow],['No realizadas',s.pending,red],['Avance',`${s.pct}%`,dark]];
    cards.forEach((item,i)=>{
      const x=14+i*54;
      doc.setFillColor(...light);doc.setDrawColor(218,222,228);doc.roundedRect(x,31,49,20,2,2,'FD');
      doc.setTextColor(90,98,108);doc.setFontSize(7.5);doc.text(item[0].toUpperCase(),x+3,37);
      doc.setTextColor(...item[2]);doc.setFont('helvetica','bold');doc.setFontSize(15);doc.text(String(item[1]),x+3,47);doc.setFont('helvetica','normal');
    });
    doc.setTextColor(0,0,0);doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Avance total',14,61);
    drawStackedBar(doc,14,65,124,8,[s.done,s.process,s.pending],s.total,[green,yellow,red]);
    doc.setFont('helvetica','normal');doc.setFontSize(7.5);doc.text(`Realizadas ${s.done} · En proceso ${s.process} · No realizadas ${s.pending}`,14,78);

    doc.setFont('helvetica','bold');doc.setFontSize(10);doc.text('Avance por equipo',150,61);
    let y=67;
    gs.forEach(g=>{
      doc.setFont('helvetica','normal');doc.setFontSize(7.2);doc.setTextColor(0,0,0);
      const label=doc.splitTextToSize(g.name,52)[0];doc.text(label,150,y+3);
      drawStackedBar(doc,204,y-1,60,5,[g.done,g.process,g.pending],g.total,[green,yellow,red]);
      doc.setFont('helvetica','bold');doc.text(`${g.pct}%`,267,y+3);
      y+=9;
    });

    if(typeof doc.autoTable==='function'){
      const detail=rows.map(row=>[
        row.equipo||'',row.actividad||'',row.alcance||'',statusLabel(row.estado),row.fecha_ejecucion||'',row.responsable||'',
        [row.observacion,row.detalle_ejecucion].filter(Boolean).join(' · ')
      ]);
      doc.autoTable({
        startY:Math.max(116,y+5),
        head:[['Equipo','Actividad','Alcance','Estado','Fecha','Responsable','Observación / avance']],
        body:detail,
        margin:{left:14,right:14,bottom:14},
        styles:{fontSize:6.4,cellPadding:1.8,overflow:'linebreak',valign:'top'},
        headStyles:{fillColor:dark,textColor:[255,255,255],fontStyle:'bold'},
        alternateRowStyles:{fillColor:[248,249,251]},
        columnStyles:{0:{cellWidth:31},1:{cellWidth:48},2:{cellWidth:45},3:{cellWidth:21},4:{cellWidth:19},5:{cellWidth:28},6:{cellWidth:73}}
      });
    }
    const pages=doc.internal.getNumberOfPages();
    for(let p=1;p<=pages;p++){
      doc.setPage(p);doc.setFontSize(7);doc.setTextColor(110,115,123);
      doc.text(`Stainher App · Estandarización · Página ${p} de ${pages}`,14,203);
      doc.text(`Emitido ${todayIso()}`,282,203,{align:'right'});
    }
    doc.save(`Informe_Estandarizacion_${todayIso()}.pdf`);
    window.toast?.('Informe de Estandarización generado.','success');
  }

  function wrapRender(){
    const base=window.renderEstandarizacion;
    if(typeof base!=='function'||base.__stainherDashboardR144)return false;
    const wrapped=async function(){
      const out=await base.apply(this,arguments);
      setTimeout(()=>enhance(true),0);
      return out;
    };
    wrapped.__stainherDashboardR144=true;
    wrapped.__base=base;
    window.renderEstandarizacion=wrapped;
    return true;
  }

  function install(){
    ensureStyles();
    let attempts=0;
    const timer=setInterval(()=>{
      attempts++;
      if(wrapRender()||typeof window.renderEstandarizacion==='function'){
        clearInterval(timer);
        const page=document.getElementById('page-estandarizacion');
        if(page)observe(page);
        scheduleEnhance(true);
      }else if(attempts>=120){clearInterval(timer)}
    },100);
    wrapRender();
    const page=document.getElementById('page-estandarizacion');
    if(page){observe(page);scheduleEnhance(true)}
  }

  window.StainherStandardizationDashboardR144=Object.freeze({install,enhance,generateReport,refresh:()=>enhance(true),version:BUILD});
  window.addEventListener('stainher:standardization-r141-ready',install);
  window.addEventListener('stainher:runtime-r142-ready',install);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
