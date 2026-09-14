/* Stainher V15.24 · R74 · detalle mensual de horas administrativas HP.
 * Muestra únicamente ajustes manuales tipo terreno_administrativo.
 * Planificador y Experta en Prevención se calculan desde malla y no se listan aquí.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_ADMIN_DETAIL_R74__)return;
  window.__STAINHER_HP_ADMIN_DETAIL_R74__=true;

  const TYPE='terreno_administrativo';
  const esc=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const fmtHours=n=>Number(n||0).toLocaleString('es-CL',{minimumFractionDigits:Number(n)%1?1:0,maximumFractionDigits:1});
  const fmtDate=s=>{
    if(!s)return'';
    const d=new Date(`${s}T12:00:00`);
    return new Intl.DateTimeFormat('es-CL',{weekday:'short',day:'2-digit',month:'2-digit',year:'numeric'}).format(d);
  };
  const monthTitle=value=>{
    const [y,m]=String(value||'').split('-').map(Number);
    if(!y||!m)return'';
    const name=new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(y,m-1,1));
    return name.charAt(0).toUpperCase()+name.slice(1);
  };
  const monthBounds=value=>{
    const [y,m]=String(value||'').split('-').map(Number);
    if(!y||!m)return null;
    const mm=String(m).padStart(2,'0'),last=String(new Date(y,m,0).getDate()).padStart(2,'0');
    return {start:`${y}-${mm}-01`,end:`${y}-${mm}-${last}`};
  };

  function ensureStyle(){
    if(document.getElementById('stainher-hp-admin-detail-r74-style'))return;
    const style=document.createElement('style');
    style.id='stainher-hp-admin-detail-r74-style';
    style.textContent=`
      .hp-admin-detail-panel{margin-top:14px}
      .hp-admin-detail-head{display:flex;justify-content:space-between;gap:12px;align-items:flex-start;flex-wrap:wrap;margin-bottom:10px}
      .hp-admin-detail-kpis{display:flex;gap:8px;flex-wrap:wrap}
      .hp-admin-detail-kpi{border:1px solid var(--line);border-radius:999px;padding:6px 10px;background:var(--panel2);font-size:12px;white-space:nowrap}
      .hp-admin-detail-wrap{overflow:auto;border:1px solid var(--line);border-radius:12px}
      .hp-admin-detail-table{border-collapse:collapse;width:100%;min-width:720px}
      .hp-admin-detail-table th,.hp-admin-detail-table td{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:8px 10px;text-align:left;vertical-align:top}
      .hp-admin-detail-table thead th{background:var(--panel2);font-size:11px;white-space:nowrap}
      .hp-admin-detail-table td:nth-child(4),.hp-admin-detail-table th:nth-child(4){text-align:right;white-space:nowrap}
      .hp-admin-detail-subtotal th,.hp-admin-detail-subtotal td{background:var(--panel2);font-weight:700}
      .hp-admin-detail-total th,.hp-admin-detail-total td{font-weight:800;border-top:2px solid var(--line)}
      .hp-admin-detail-note{margin-top:9px;font-size:11px;color:var(--muted)}
      @media(max-width:700px){.hp-admin-detail-table th,.hp-admin-detail-table td{padding:7px 6px;font-size:11px}}
    `;
    document.head.appendChild(style);
  }

  async function readData(monthValue){
    const bounds=monthBounds(monthValue);
    if(!bounds||!window.sb)throw new Error('No está disponible la base de datos del reporte.');
    const [adj,dot,prof]=await Promise.all([
      window.sb.from('hp_ajustes_manuales').select('user_id,fecha,tipo,horas,observacion').eq('tipo',TYPE).gte('fecha',bounds.start).lte('fecha',bounds.end).order('fecha',{ascending:true}),
      window.sb.from('dotacion_contrato').select('user_id,nombre,cargo').not('user_id','is',null),
      window.sb.from('perfiles').select('id,nombre,rol')
    ]);
    if(adj.error)throw adj.error;
    const people=new Map();
    (dot.data||[]).forEach(p=>people.set(String(p.user_id),{nombre:p.nombre||'',cargo:p.cargo||''}));
    (prof.data||[]).forEach(p=>{
      const key=String(p.id),current=people.get(key)||{};
      people.set(key,{nombre:current.nombre||p.nombre||'',cargo:current.cargo||p.rol||''});
    });
    return (adj.data||[]).map(x=>({
      ...x,
      nombre:people.get(String(x.user_id))?.nombre||'Usuario sin nombre',
      cargo:people.get(String(x.user_id))?.cargo||''
    })).sort((a,b)=>a.nombre.localeCompare(b.nombre,'es')||String(a.fecha).localeCompare(String(b.fecha)));
  }

  function tableHtml(rows){
    if(!rows.length)return '<div class="empty">No hay horas administrativas manuales cargadas para este mes.</div>';
    const grouped=new Map();
    rows.forEach(r=>{
      const key=String(r.user_id),g=grouped.get(key)||{nombre:r.nombre,cargo:r.cargo,rows:[],total:0};
      g.rows.push(r);g.total+=Number(r.horas||0);grouped.set(key,g);
    });
    let body='';
    [...grouped.values()].forEach(g=>{
      g.rows.forEach(r=>{
        body+=`<tr><td>${esc(r.nombre)}</td><td>${esc(r.cargo||'')}</td><td>${esc(fmtDate(r.fecha))}</td><td>${fmtHours(r.horas)}</td><td>${esc(r.observacion||'—')}</td></tr>`;
      });
      body+=`<tr class="hp-admin-detail-subtotal"><th colspan="3">Subtotal ${esc(g.nombre)}</th><td>${fmtHours(g.total)}</td><td></td></tr>`;
    });
    const total=rows.reduce((s,r)=>s+Number(r.horas||0),0);
    body+=`<tr class="hp-admin-detail-total"><th colspan="3">Total mensual</th><td>${fmtHours(total)}</td><td></td></tr>`;
    return `<div class="hp-admin-detail-wrap"><table class="hp-admin-detail-table"><thead><tr><th>Persona</th><th>Cargo</th><th>Fecha</th><th>Horas</th><th>Observación</th></tr></thead><tbody>${body}</tbody></table></div>`;
  }

  async function render(page){
    if(!page||!page.isConnected)return;
    ensureStyle();
    const monthValue=page.querySelector('#hpMonth')?.value;
    if(!monthValue)return;
    let host=page.querySelector('#hpAdminDetailR74');
    if(!host){
      host=document.createElement('div');
      host.id='hpAdminDetailR74';
      host.className='panel hp-admin-detail-panel';
      const hpPanel=page.querySelector('.hp-table-wrap')?.closest('.panel');
      if(hpPanel)page.insertBefore(host,hpPanel);else page.appendChild(host);
    }
    host.innerHTML=`<div class="hp-admin-detail-head"><div><h3>Detalle mensual de horas administrativas cargadas</h3><div class="muted">${esc(monthTitle(monthValue))} · ingresos manuales ADC, Gerente y Confiabilidad.</div></div></div><div class="empty">Cargando detalle…</div>`;
    try{
      const rows=await readData(monthValue);
      if(!host.isConnected||page.querySelector('#hpMonth')?.value!==monthValue)return;
      const total=rows.reduce((s,r)=>s+Number(r.horas||0),0);
      const people=new Set(rows.map(r=>String(r.user_id))).size;
      host.innerHTML=`<div class="hp-admin-detail-head"><div><h3>Detalle mensual de horas administrativas cargadas</h3><div class="muted">${esc(monthTitle(monthValue))} · ingresos manuales ADC, Gerente y Confiabilidad.</div></div><div class="hp-admin-detail-kpis"><span class="hp-admin-detail-kpi">${rows.length} registro${rows.length===1?'':'s'}</span><span class="hp-admin-detail-kpi">${people} persona${people===1?'':'s'}</span><span class="hp-admin-detail-kpi"><b>${fmtHours(total)} h</b> cargadas</span></div></div>${tableHtml(rows)}<div class="hp-admin-detail-note">Planificación y Experta en Prevención no se muestran aquí porque sus horas administrativas se calculan automáticamente desde la malla.</div>`;
    }catch(error){
      host.innerHTML=`<h3>Detalle mensual de horas administrativas cargadas</h3><div class="notice warn">No fue posible cargar el detalle: ${esc(error?.message||error||'Error desconocido')}</div>`;
    }
  }

  function mount(page){
    if(!page)return;
    ensureStyle();
    if(page.dataset.hpAdminDetailR74Bound!=='1'){
      page.dataset.hpAdminDetailR74Bound='1';
      page.addEventListener('change',event=>{
        if(event.target?.id==='hpMonth')setTimeout(()=>render(page),80);
      });
    }
    render(page);
  }

  const history=window.StainherHPHistory;
  if(history&&typeof history.mount==='function'&&!history.__stainherAdminDetailR74){
    const originalMount=history.mount.bind(history);
    history.mount=page=>{originalMount(page);mount(page)};
    history.__stainherAdminDetailR74=true;
  }

  window.StainherHPAdminDetail={mount,render};
})();