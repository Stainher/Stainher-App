/* Stainher V15.24 · R71 · comparación histórica Reporte Semanal HP.
 * Compara los tres meses cerrados anteriores al mes seleccionado.
 * Junio–agosto 2026 usan la línea base histórica entregada por administración;
 * meses posteriores se calculan desde malla, novedades y ajustes HP.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_HISTORY_R71__)return;
  window.__STAINHER_HP_HISTORY_R71__=true;

  const ABSENCE_TYPES=['vacaciones','licencia_medica','permiso_no_remunerado','permiso','falta'];
  const MANUAL_ADMIN_ROLES=new Set(['administrador','gerente','confiabilidad']);
  const AUTO_ADMIN_ROLES=new Set(['planificador','planificacion','programacion']);
  const BASELINE={
    '2026-06':{admin:310,oper:2124,spor:0,total:2434,fte:13,source:'historico'},
    '2026-07':{admin:316,oper:1888,spor:0,total:2204,fte:12,source:'historico'},
    '2026-08':{admin:460,oper:2104,spor:0,total:2564,fte:14,source:'historico'}
  };
  const cache=new Map();
  const norm=v=>String(v||'').trim().toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/\s+/g,'_');
  const iso=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
  const plusDays=(s,n)=>{const d=new Date(`${s}T12:00:00`);d.setDate(d.getDate()+n);return iso(d)};
  const inRange=(d,a,b)=>d>=a&&d<=b;
  const sum=(arr,key)=>arr.reduce((a,x)=>a+Number(x[key]||0),0);
  const fmt=n=>Number(n||0).toLocaleString('es-CL',{maximumFractionDigits:1});
  const signed=n=>`${n>0?'+':''}${fmt(n)}`;
  const monthKey=(y,m)=>`${y}-${String(m).padStart(2,'0')}`;
  const monthTitle=(y,m)=>{
    const s=new Intl.DateTimeFormat('es-CL',{month:'long'}).format(new Date(y,m-1,1));
    return `${s.charAt(0).toUpperCase()+s.slice(1)}-${String(y).slice(-2)}`;
  };
  const previousMonths=(y,m,count=3)=>{
    const out=[];
    const d=new Date(y,m-1,1);
    for(let i=count;i>=1;i--){
      const x=new Date(d.getFullYear(),d.getMonth()-i,1);
      out.push({year:x.getFullYear(),month:x.getMonth()+1,key:monthKey(x.getFullYear(),x.getMonth()+1)});
    }
    return out;
  };

  function isManualAdmin(person,profiles){
    const r=norm(profiles.get(String(person.user_id))?.rol||''),cargo=norm(person.cargo||'');
    return MANUAL_ADMIN_ROLES.has(r)||cargo==='adc'||cargo.includes('administrador_de_contrato')||cargo.includes('gerente')||cargo.includes('confiabilidad');
  }
  function isAutoAdmin(person,profiles){
    const r=norm(profiles.get(String(person.user_id))?.rol||''),cargo=norm(person.cargo||'');
    return AUTO_ADMIN_ROLES.has(r)||cargo.includes('planific')||cargo.includes('programa')||cargo.includes('experta_en_prevencion')||cargo.includes('experto_en_prevencion');
  }

  async function calculateMonth(year,month){
    const key=monthKey(year,month);
    if(BASELINE[key])return {...BASELINE[key],year,month,key};
    if(cache.has(key))return cache.get(key);

    const start=`${key}-01`,last=new Date(year,month,0).getDate(),end=`${key}-${String(last).padStart(2,'0')}`;
    const [dot,prof,mal,nov,adj]=await Promise.all([
      window.sb.from('dotacion_contrato').select('user_id,nombre,cargo,estado,aplica_turnos,fecha_inicio_contrato').not('user_id','is',null),
      window.sb.from('perfiles').select('id,rol'),
      window.sb.from('turnos_malla_v1512').select('user_id,fecha,turno_base,estado_publicacion').gte('fecha',plusDays(start,-1)).lte('fecha',end).eq('estado_publicacion','publicado'),
      window.sb.from('turnos_novedades_v15').select('user_id,tipo,fecha_inicio,fecha_fin,turno_base,clasificacion_auto').lte('fecha_inicio',end).gte('fecha_fin',start),
      window.sb.from('hp_ajustes_manuales').select('user_id,fecha,tipo,horas').eq('tipo','terreno_administrativo').gte('fecha',start).lte('fecha',end)
    ]);
    if(dot.error||prof.error||mal.error||nov.error)throw dot.error||prof.error||mal.error||nov.error;

    const people=(dot.data||[]).filter(p=>p.user_id&&(!p.fecha_inicio_contrato||p.fecha_inicio_contrato<=end));
    const profiles=new Map((prof.data||[]).map(p=>[String(p.id),p]));
    const malla=mal.data||[],novedades=nov.data||[],adjust=adj.error?[]:(adj.data||[]);
    const novs=(uid,date)=>novedades.filter(n=>String(n.user_id)===String(uid)&&inRange(date,n.fecha_inicio,n.fecha_fin||n.fecha_inicio));
    const blocked=(uid,date)=>novs(uid,date).some(n=>ABSENCE_TYPES.some(t=>String(n.tipo||'').includes(t)));
    const suspended=(uid,date)=>novs(uid,date).some(n=>norm(n.tipo)==='suspendido_encierro'||norm(n.clasificacion_auto)==='suspendido_por_encierro');
    const extra=(uid,date)=>novs(uid,date).filter(n=>{
      const tipo=norm(n.tipo),cls=norm(n.clasificacion_auto),tb=norm(n.turno_base);
      return tipo==='dia_adicional'||cls==='encierro_fuera_de_turno'||cls==='encierro_dentro_de_turno'||(tipo==='encierro_planificado'&&(tb==='a'||tb==='c'))||(tipo==='encierro_no_planificado'&&tb==='l');
    }).length*12;
    const turn=(uid,date)=>malla.find(r=>String(r.user_id)===String(uid)&&r.fecha===date)?.turno_base||'';
    const manualAdmin=uid=>adjust.filter(x=>String(x.user_id)===String(uid)).reduce((s,x)=>s+Number(x.horas||0),0);

    const rows=people.map(person=>{
      let admin=0,oper=0,spor=0;
      if(isManualAdmin(person,profiles)){
        admin=manualAdmin(person.user_id);
        for(let d=start;d<=end;d=plusDays(d,1))spor+=extra(person.user_id,d);
      }else if(isAutoAdmin(person,profiles)){
        for(let d=start;d<=end;d=plusDays(d,1)){
          spor+=extra(person.user_id,d);
          if(blocked(person.user_id,d)||suspended(person.user_id,d))continue;
          const t=turn(person.user_id,d);if(!t||t==='L')continue;
          const dow=new Date(`${d}T12:00:00`).getDay();
          if(dow>=1&&dow<=3)admin+=12;else if(dow===4)admin+=6;
        }
      }else{
        for(let d=start;d<=end;d=plusDays(d,1)){
          spor+=extra(person.user_id,d);
          if(blocked(person.user_id,d))continue;
          const prevDate=plusDays(d,-1),td=turn(person.user_id,d),prev=turn(person.user_id,prevDate);
          if(td==='A'&&!suspended(person.user_id,d))oper+=12;
          if(td==='C'&&!suspended(person.user_id,d))oper+=5;
          if(prev==='C'&&!suspended(person.user_id,prevDate)&&!blocked(person.user_id,d))oper+=7;
        }
      }
      return {admin,oper,spor,total:admin+oper+spor};
    });
    const result={year,month,key,admin:sum(rows,'admin'),oper:sum(rows,'oper'),spor:sum(rows,'spor'),fte:rows.filter(r=>r.total>0).length,source:'app'};
    result.total=result.admin+result.oper+result.spor;
    cache.set(key,result);
    return result;
  }

  function insights(months){
    const labels={admin:'HH Administrativas',oper:'HH Operativas',spor:'HH Esporádicas'};
    const changes=[];
    for(let i=1;i<months.length;i++){
      const prev=months[i-1],cur=months[i],delta=cur.total-prev.total,pct=prev.total?delta/prev.total*100:0;
      const components=['admin','oper','spor'].map(k=>({key:k,delta:cur[k]-prev[k]})).sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta));
      changes.push({prev,cur,delta,pct,components,fteDelta:cur.fte-prev.fte});
    }
    return changes.sort((a,b)=>Math.abs(b.delta)-Math.abs(a.delta)).map((c,index)=>{
      const direction=c.delta>=0?'aumentó':'disminuyó';
      const driver=c.components[0];
      const second=c.components[1];
      const fteText=c.fteDelta?` La dotación equivalente cambió ${signed(c.fteDelta)} FTE.`:'';
      const secondText=Math.abs(second.delta)>=12?` El segundo aporte relevante fue ${labels[second.key]} (${signed(second.delta)} HH).`:'';
      return `<li${index===0?' class="hp-history-main"':''}><b>${monthTitle(c.prev.year,c.prev.month)} → ${monthTitle(c.cur.year,c.cur.month)}:</b> el total ${direction} <b>${fmt(Math.abs(c.delta))} HH (${c.pct>=0?'+':''}${fmt(c.pct)}%)</b>. La principal diferencia proviene de ${labels[driver.key]} (${signed(driver.delta)} HH).${secondText}${fteText}</li>`;
    }).join('');
  }

  function tableHtml(months){
    const row=(label,key)=>`<tr><th>${label}</th>${months.map(m=>`<td>${fmt(m[key])}</td>`).join('')}</tr>`;
    return `<div class="hp-history-wrap"><table class="hp-history-table"><thead><tr><th>STAINHER</th>${months.map(m=>`<th>${monthTitle(m.year,m.month)}</th>`).join('')}</tr><tr><th></th>${months.map(()=>'<th>REAL</th>').join('')}</tr></thead><tbody>${row('Total HH Administrativas','admin')}${row('Total HH Operativas','oper')}${row('Total HH Esporádicas','spor')}${row('Total HH en faena','total')}${row('Total HH','total')}${row('Total FTE','fte')}</tbody></table></div>`;
  }

  async function render(page){
    if(!page)return;
    let host=page.querySelector('#hpHistoryR71');
    if(!host){
      host=document.createElement('div');host.id='hpHistoryR71';host.className='panel hp-history-panel';
      page.appendChild(host);
    }
    const input=page.querySelector('#hpMonth');
    const value=input?.value||`${new Date().getFullYear()}-${String(new Date().getMonth()+1).padStart(2,'0')}`;
    const [year,month]=value.split('-').map(Number);
    const targets=previousMonths(year,month,3);
    host.innerHTML='<h3>Comparación últimos 3 meses cerrados</h3><div class="muted">Calculando tendencia histórica…</div>';
    try{
      const months=await Promise.all(targets.map(x=>calculateMonth(x.year,x.month)));
      host.innerHTML=`<h3>Comparación últimos 3 meses cerrados</h3><div class="muted hp-history-sub">Referencia previa al período seleccionado. Los meses con información histórica inicial se conservan hasta que la plataforma disponga de malla completa.</div>${tableHtml(months)}<div class="hp-history-analysis"><b>Principales variaciones</b><ul>${insights(months)}</ul></div>`;
    }catch(error){
      host.innerHTML=`<h3>Comparación últimos 3 meses cerrados</h3><div class="notice warn">No fue posible calcular la comparación histórica: ${String(error?.message||error||'Error desconocido')}</div>`;
    }
  }

  function renderWhenReady(page,expected,attempt=0){
    if(!page||!page.isConnected)return;
    const input=page.querySelector('#hpMonth');
    if(input?.value===expected&&page.querySelector('.hp-summary')){render(page);return}
    if(attempt<100)setTimeout(()=>renderWhenReady(page,expected,attempt+1),60);
  }

  function mount(page){
    if(!page)return;
    if(page.dataset.hpHistoryR71Bound!=='1'){
      page.dataset.hpHistoryR71Bound='1';
      page.addEventListener('change',event=>{
        if(event.target?.id!=='hpMonth')return;
        const expected=event.target.value;
        setTimeout(()=>renderWhenReady(page,expected),0);
      });
    }
    render(page);
  }

  const style=document.createElement('style');
  style.id='stainher-hp-history-r71-style';
  style.textContent=`.hp-history-panel{margin-top:14px}.hp-history-sub{margin-bottom:10px}.hp-history-wrap{overflow:auto;border:1px solid var(--line);border-radius:12px}.hp-history-table{border-collapse:collapse;width:100%;min-width:620px;table-layout:fixed}.hp-history-table th,.hp-history-table td{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:8px 10px;text-align:center}.hp-history-table thead th{background:var(--panel2)}.hp-history-table tbody th{text-align:left;background:var(--panel2);width:34%}.hp-history-analysis{margin-top:12px;padding:12px;border:1px solid var(--line);border-radius:12px;background:var(--panel2)}.hp-history-analysis ul{margin:8px 0 0;padding-left:20px;display:grid;gap:8px}.hp-history-main{font-weight:500}@media(max-width:700px){.hp-history-table th,.hp-history-table td{padding:7px 6px;font-size:11px}}`;
  document.head.appendChild(style);

  window.StainherHPHistory={mount,render};
})();