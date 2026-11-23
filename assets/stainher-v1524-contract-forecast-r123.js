/* Stainher V15.24 · R123 · Forecast runtime estable.
 * - Elimina inmediatamente el botón Actualizar redundante junto al año.
 * - Mantiene como único control global el botón Actualizar de Administración del Contrato.
 * - Superpone gráficos SVG determinísticos sobre los canvases para evitar paneles vacíos.
 * - Integra la programación preventiva y los precios unitarios por actividad.
 */
(()=>{
  'use strict';
  const BUILD='20261123-forecast-active-matrix-only';
  if(window.__STAINHER_CONTRACT_FORECAST_R123__===BUILD)return;
  window.__STAINHER_CONTRACT_FORECAST_R123__=BUILD;

  const STYLE_ID='stainher-contract-forecast-r123-style';
  const MONTHS=['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];
  const COLORS=['#60a5fa','#34d399','#f59e0b','#a78bfa','#f472b6','#38bdf8','#22c55e','#eab308','#8b5cf6','#fb7185','#60a5fa','#34d399'];
  let scheduled=false,observer=null;

  function pageActive(){
    return window.state?.contractTab==='forecast'&&!!document.getElementById('forecastBody');
  }

  function mountStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #forecastBody .chart-wrap{position:relative!important;min-height:310px!important;height:310px!important}
      #forecastBody .chart-wrap.r123-svg-active>canvas{opacity:0!important}
      #forecastBody .r123-chart-overlay{position:absolute!important;inset:0!important;z-index:3!important;display:block!important}
      #forecastBody .r123-chart-overlay .r123-bar-value{fill:var(--text,#17344d)!important;stroke:var(--panel,#f7fafc);stroke-width:2px;stroke-linejoin:round;paint-order:stroke fill}
      #forecastBody [data-forecast-month]{cursor:pointer}
      #forecastBody [data-forecast-month]:hover rect:nth-of-type(2),
      #forecastBody [data-forecast-month]:focus-visible rect:nth-of-type(2){stroke:var(--text,#17344d);stroke-width:2}
      #forecastBody .r123-chart-overlay svg{display:block!important;width:100%!important;height:100%!important;overflow:visible!important}
      #forecastBody .r123-chart-empty{display:grid!important;place-items:center!important;height:100%!important;color:var(--muted,#94a3b8)!important;font-size:13px!important}
    `;
    document.head.appendChild(style);
  }

  function removeDuplicateRefresh(){
    const year=document.getElementById('forecastYear');
    const toolbar=year?.closest('.toolbar,.actions,.row-between');
    if(!toolbar)return false;
    let removed=false;
    [...toolbar.querySelectorAll('button')].forEach(button=>{
      const label=String(button.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();
      if(label==='actualizar'){
        button.remove();
        removed=true;
      }
    });
    return removed;
  }

  function compact(v){
    const n=Number(v)||0;
    const abs=Math.abs(n);
    if(abs>=1000000000)return '$'+(n/1000000000).toLocaleString('es-CL',{maximumFractionDigits:1})+'B';
    if(abs>=1000000)return '$'+(n/1000000).toLocaleString('es-CL',{maximumFractionDigits:1})+'M';
    if(abs>=1000)return '$'+(n/1000).toLocaleString('es-CL',{maximumFractionDigits:0})+'k';
    return '$'+Math.round(n).toLocaleString('es-CL');
  }

  function money(v){
    if(typeof window.fmtCLP==='function')return window.fmtCLP(v);
    return '$'+Math.round(Number(v)||0).toLocaleString('es-CL');
  }

  function esc(v){
    return String(v??'').replace(/[&<>"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;'}[c]));
  }

  function chartSize(wrap){
    const rect=wrap.getBoundingClientRect();
    return {w:Math.max(620,Math.round(rect.width||760)),h:310};
  }

  function yScale(max,top,bottom,height){
    const span=Math.max(1,max);
    return value=>bottom-(Number(value||0)/span)*(bottom-top);
  }

  function gridSvg(max,w,h,left,right,top,bottom){
    const parts=[];
    for(let i=0;i<=4;i++){
      const ratio=i/4;
      const value=max*(1-ratio);
      const y=top+(bottom-top)*ratio;
      parts.push(`<line x1="${left}" y1="${y}" x2="${w-right}" y2="${y}" stroke="rgba(148,163,184,.16)" stroke-width="1"/>`);
      parts.push(`<text x="${left-10}" y="${y+4}" text-anchor="end" fill="#94a3b8" font-size="11">${esc(compact(value))}</text>`);
    }
    return parts.join('');
  }

  function monthlySvg(values,w,h){
    const left=70,right=20,top=24,bottom=h-38;
    const max=Math.max(1,...values.map(Number))*1.12;
    const y=yScale(max,top,bottom,h);
    const inner=w-left-right,step=inner/12,bar=Math.max(14,Math.min(44,step*.58));
    const bars=values.map((value,i)=>{
      const v=Number(value)||0,x=left+step*i+step/2,yy=y(v),height=Math.max(0,bottom-yy);
      const labelY=Math.max(top+11,yy-7);
      return `<g data-forecast-month="${i}" role="button" tabindex="0" aria-label="Ver detalle de ${MONTHS[i]}, ${esc(money(v))}"><title>${MONTHS[i]}: ${esc(money(v))} · Ver detalle</title><rect x="${left+step*i}" y="${top}" width="${step}" height="${bottom-top+28}" fill="transparent"/><rect x="${x-bar/2}" y="${yy}" width="${bar}" height="${height}" rx="4" fill="${COLORS[i%COLORS.length]}"/><text x="${x}" y="${bottom+20}" text-anchor="middle" fill="#aeb8c5" font-size="11">${MONTHS[i]}</text>${v?`<text x="${x}" y="${labelY}" text-anchor="middle" class="r123-bar-value" font-size="11" font-weight="700">${esc(compact(v))}</text>`:''}</g>`;
    }).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="group" aria-label="Forecast mensual"><rect width="${w}" height="${h}" fill="transparent"/>${gridSvg(max,w,h,left,right,top,bottom)}<line x1="${left}" y1="${bottom}" x2="${w-right}" y2="${bottom}" stroke="rgba(148,163,184,.28)"/>${bars}</svg>`;
  }

  function historicalValue(month,index){
    if(!month?.ep)return null;
    try{
      if(typeof window.forecastHistoricalStatusV92==='function'){
        const year=Number(window.state?.forecastYear||new Date().getFullYear());
        const status=window.forecastHistoricalStatusV92(year,index+1);
        if(!status?.historical)return null;
      }
    }catch(_){}
    if(Number.isFinite(Number(month.__r122Projectable)))return Number(month.__r122Projectable);
    return Number(month.real)||0;
  }

  function linePath(values,xFor,yFor){
    let d='',open=false;
    values.forEach((value,i)=>{
      if(value==null||!Number.isFinite(Number(value))){open=false;return}
      const x=xFor(i),y=yFor(value);
      d+=`${open?' L':' M'} ${x} ${y}`;open=true;
    });
    return d;
  }

  function compareSvg(forecast,historical,w,h){
    const left=70,right=24,top=34,bottom=h-40;
    const nums=[...forecast,...historical.filter(v=>v!=null)].map(Number).filter(Number.isFinite);
    const max=Math.max(1,...nums)*1.12;
    const y=yScale(max,top,bottom,h),inner=w-left-right,step=inner/Math.max(1,forecast.length-1);
    const x=i=>left+step*i;
    const fp=linePath(forecast,x,y),hp=linePath(historical,x,y);
    const xLabels=MONTHS.map((m,i)=>`<text x="${x(i)}" y="${bottom+21}" text-anchor="middle" fill="#aeb8c5" font-size="11">${m}</text>`).join('');
    const fDots=forecast.map((v,i)=>`<g><title>${MONTHS[i]} Forecast: ${esc(money(v))}</title><circle cx="${x(i)}" cy="${y(v)}" r="3.5" fill="#38bdf8"/></g>`).join('');
    const hDots=historical.map((v,i)=>v==null?'':`<g><title>${MONTHS[i]} EDP real: ${esc(money(v))}</title><circle cx="${x(i)}" cy="${y(v)}" r="4" fill="#34d399"/></g>`).join('');
    return `<svg viewBox="0 0 ${w} ${h}" role="img" aria-label="Forecast proyectable versus EDP real histórico"><rect width="${w}" height="${h}" fill="transparent"/>${gridSvg(max,w,h,left,right,top,bottom)}<line x1="${left}" y1="${bottom}" x2="${w-right}" y2="${bottom}" stroke="rgba(148,163,184,.28)"/><g transform="translate(${left},12)"><line x1="0" y1="0" x2="28" y2="0" stroke="#38bdf8" stroke-width="3"/><text x="36" y="4" fill="#cbd5e1" font-size="11">Forecast proyectable</text><line x1="165" y1="0" x2="193" y2="0" stroke="#34d399" stroke-width="3"/><text x="201" y="4" fill="#cbd5e1" font-size="11">EDP real histórico</text></g><path d="${fp}" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/><path d="${hp}" fill="none" stroke="#34d399" stroke-width="2.5" stroke-linejoin="round" stroke-linecap="round"/>${fDots}${hDots}${xLabels}</svg>`;
  }

  function summarizeForecastActivities(detail){
    const groups=new Map();
    for(const row of detail){
      const unit=Math.round(row.price*row.factor);
      const key=JSON.stringify([row.equipo,row.actividad,unit]);
      if(!groups.has(key))groups.set(key,{equipment:row.equipo,activity:row.actividad,unit,count:0,total:0});
      const entry=groups.get(key);
      entry.count+=row.count??1;
      entry.total+=row.value;
    }
    return [...groups.values()].sort((a,b)=>a.equipment.localeCompare(b.equipment,'es')||a.activity.localeCompare(b.activity,'es'));
  }

  function openForecastMonth(index){
    const state=window.state;
    const month=state?.forecastDataV8?.months?.[index];
    const root=document.getElementById('modalRoot');
    if(!month||!root)return;
    const title=new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric',timeZone:'UTC'})
      .format(new Date(Date.UTC(state.forecastYear,index,1)));
    const rows=summarizeForecastActivities(month.detail||[]);
    const body=rows.map(row=>`<tr><td>${esc(row.equipment)}</td><td>${esc(row.activity)}</td><td>${row.count}</td><td>${esc(money(row.unit))}</td><td>${esc(money(row.total))}</td></tr>`).join('');
    root.innerHTML=`<div class="modal-bg"><div class="modal" role="dialog" aria-modal="true" aria-labelledby="forecastMonthDetailTitle" style="width:min(960px,95vw);max-width:960px">
      <div class="row-between"><h3 id="forecastMonthDetailTitle">Forecast · ${esc(title)}</h3><button class="btn" type="button" data-close-forecast-month>Cerrar</button></div>
      <div class="table-wrap" style="overflow:auto"><table class="table">
      <thead><tr><th>Equipo</th><th>Actividad</th><th>Visitas</th><th>Precio por visita</th><th>Subtotal</th></tr></thead>
      <tbody>${body||'<tr><td colspan="5">Sin actividades incluidas en la proyección de este mes.</td></tr>'}</tbody>
      <tfoot><tr><th colspan="4">Preventivo</th><td>${esc(money(month.preventivo))}</td></tr>
      ${month.operativo?`<tr><th colspan="4">Gasto operativo</th><td>${esc(money(month.operativo))}</td></tr>`:''}
      <tr><th colspan="4">Total proyectado</th><td><b>${esc(money(month.total))}</b></td></tr></tfoot>
      </table></div></div></div>`;
    const button=root.querySelector('[data-close-forecast-month]');
    button.onclick=()=>window.closeModal?.();
    button.focus();
  }

  function activateForecastMonth(event){
    const bar=event.target.closest('[data-forecast-month]');
    if(!bar)return;
    if(event.type==='keydown'){
      if(event.key!=='Enter'&&event.key!==' ')return;
      event.preventDefault();
    }
    openForecastMonth(Number(bar.dataset.forecastMonth));
  }

  function overlay(canvas,markup){
    const wrap=canvas?.closest('.chart-wrap');
    if(!wrap)return false;
    wrap.classList.add('r123-svg-active');
    const existing=wrap.querySelector('.r123-chart-overlay');
    if(existing){
      if(existing.__forecastMarkup!==markup){
        existing.__forecastMarkup=markup;
        existing.innerHTML=markup;
      }
      return true;
    }
    const node=document.createElement('div');
    node.className='r123-chart-overlay';
    node.__forecastMarkup=markup;
    node.innerHTML=markup;
    if(canvas.id==='forecastChartV8'){
      node.addEventListener('click',activateForecastMonth);
      node.addEventListener('keydown',activateForecastMonth);
    }
    wrap.appendChild(node);
    return true;
  }

  function drawCharts(){
    if(!pageActive())return false;
    const f=window.state?.forecastDataV8;
    const monthly=document.getElementById('forecastChartV8');
    const real=document.getElementById('forecastRealChartV8');
    if(!f?.months?.length||!monthly||!real)return false;
    const forecast=f.months.map(m=>Number(m.total)||0);
    const historical=f.months.map((m,i)=>historicalValue(m,i));
    const a=chartSize(monthly.closest('.chart-wrap'));
    const b=chartSize(real.closest('.chart-wrap'));
    overlay(monthly,monthlySvg(forecast,a.w,a.h));
    overlay(real,compareSvg(forecast,historical,b.w,b.h));
    return true;
  }

  function showWatchdogMessage(){
    const body=document.getElementById('forecastBody');
    if(!body||!pageActive())return;
    const text=String(body.textContent||'');
    if(!/Calculando Forecast/i.test(text))return;
    const data=window.state?.forecastDataV8;
    if(data?.months?.length){
      try{window.renderForecastBodyV9?.()}catch(_){}
      schedule();
      return;
    }
    body.innerHTML='<div class="notice warn"><b>El Forecast está demorando más de lo esperado.</b><br>Presiona el botón general <b>↻ Actualizar</b> de Administración del Contrato para reintentar la carga.</div>';
  }

  function repair(){
    if(!pageActive())return false;
    mountStyle();
    removeDuplicateRefresh();
    drawCharts();
    return true;
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{
      scheduled=false;
      repair();
      setTimeout(repair,80);
      setTimeout(repair,360);
      setTimeout(repair,800);
    });
  }


  const legacyEquipment = new Set([
    'jaula asea', 'nodo 3700', 'hilton 02', 'hilton 03', 'jaula otis',
    'jaula alimak', 'eila 1', 'huinche ptp', 'eila 2'
  ]);
  const priceTable = 'forecast_precios_actividades';
  const key = row => JSON.stringify([row.equipo_id, row.actividad.trim()]);
  const legacyGroup = row => {
    const name = row.equipos?.nombre;
    return legacyEquipment.has(forecastNormV8(name)) ? forecastGroupV8(name) : '';
  };
  let forecastRequest = 0;

  async function readAll(query) {
    const rows = [];
    const batchSize = 500;
    for (let offset = 0; ; offset += batchSize) {
      const {data, error} = await query().range(offset, offset + batchSize - 1);
      if(error) throw error;
      rows.push(...data);
      if(data.length < batchSize) return rows;
    }
  }

  // Planned recurrences take precedence over the generated calendar for the same activity.
  function forecastOccurrences(year, activeMonths, plans) {
    const intervals = new Map([
      ['mensual',1], ['bimestral',2], ['trimestral',3], ['semestral',6], ['anual',12]
    ]);
    const rows = [];
    for(const plan of plans) {
      const [startYear, startMonth] = (plan.mes_inicio || '').split('-').map(Number);
      if(!startYear || !startMonth)continue;
      const frequency = forecastNormV8(plan.frecuencia);
      const interval = intervals.get(frequency);
      const start = Date.UTC(startYear,startMonth-1,1);
      for(const mes of activeMonths) {
        const elapsed = (year-startYear)*12+mes-startMonth;
        if(elapsed<0)continue;
        let count=0;
        if(interval)count=Number(elapsed%interval===0);
        else if(frequency==='quincenal')count=2;
        else if(frequency==='semanal'){
          const week=7*86400000;
          count=Math.ceil((Date.UTC(year,mes,1)-start)/week)-
            Math.ceil((Date.UTC(year,mes-1,1)-start)/week);
        }else if(frequency==='segun plan')count=Number(elapsed===0);
        if(count)rows.push({...plan,mes,count});
      }
    }
    return rows;
  }

  async function loadActivityForecast() {
    const body = document.getElementById('forecastBody');
    const selector = document.getElementById('forecastYear');
    if(!body || !selector) return;
    selector.onchange = () => window.loadForecastV9();
    const year = Number(selector.value);
    const request = ++forecastRequest;
    state.forecastYear = year;
    const client = window.sb;
    try {
      const [plans, prices] = await Promise.all([
        readAll(() => client.from('plan_matriz_actividades')
          .select('id,equipo_id,actividad,frecuencia,mes_inicio,equipos(nombre,estado)').eq('activo', true).order('id')),
        readAll(() => client.from(priceTable).select('equipo_id,actividad,precio_unitario')
          .order('equipo_id').order('actividad'))
      ]);
      if(request !== forecastRequest || !body.isConnected || selector.value !== String(year)) return;
      const isEligible = row => row.equipos && row.equipos.estado === 'activo' && row.actividad?.trim();
      const activePlans = plans.filter(isEligible);
      const activeMonths = contractActiveMonthsV8(year);
      const rows = forecastOccurrences(year, activeMonths, activePlans);
      const catalog = new Map(activePlans.map(row => [key(row), row]));
      const saved = new Map(prices.map(row => [key(row), Number(row.precio_unitario)]));
      const extraGroups = new Map();
      const group = row => legacyGroup(row) || row.equipo_id;
      for(const row of catalog.values()) {
        if(!legacyGroup(row)) extraGroups.set(row.equipo_id, row.equipos.nombre);
      }
      const years = new Set([...selector.options].map(option => Number(option.value)));
      const contractEnd = Number(state.contractData.contrato?.fecha_termino?.slice(0, 4));
      if(contractEnd >= year && contractEnd - year <= 30) {
        for(let optionYear = year; optionYear <= contractEnd; optionYear++) years.add(optionYear);
      }
      for(const plan of activePlans) {
        const starts = Number(plan.mes_inicio?.slice(0, 4));
        if(starts) {
          years.add(starts);
          if(!plan.mes_inicio.endsWith('-01-01')) years.add(starts + 1);
        }
      }
      selector.replaceChildren(...[...years].sort((a,b) => a-b)
        .map(value => new Option(value, value, false, value === year)));

      const excluded = forecastExcludedSetV9();
      const months = Array.from({length:12}, (_, index) => ({
        m:index+1, preventivo:0, operativo:0, total:0, real:0, ggrr:0, epTotal:0, detail:[]
      }));
      let missing = 0;
      for(const row of rows) {
        const mo = months[Number(row.mes)-1];
        const groupId = group(row);
        if(!mo || excluded.has(groupId)) continue;
        const savedPrice = saved.get(key(row));
        const legacyPrice = legacyGroup(row) ? forecastUnitPriceV8(row.equipos.nombre, row.actividad) : 0;
        if(savedPrice === undefined && !legacyPrice) {
          missing += row.count ?? 1;
          continue;
        }
        const price = savedPrice ?? legacyPrice;
        const factor = savedPrice === undefined ? forecastFactorV8(row.equipos.nombre) : 1;
        const count = row.count ?? 1;
        const value = Math.round(price * factor) * count;
        mo.preventivo += value;
        mo.detail.push({
          equipo:row.equipos.nombre, group:groupId, actividad:row.actividad,
          factor, price, count, value, category:forecastCategoryV9(row.actividad)
        });
      }
      const operatingCost = state.forecastIncludeOperating === false ? 0 : FORECAST_OP_MONTHLY_V8;
      for(const month of activeMonths) months[month-1].operativo = operatingCost;
      for(const mo of months) mo.total = mo.preventivo + mo.operativo;
      for(const ep of state.contractData.edp || []) {
        const mo = months[ep.mes_edp-1];
        if(!mo || Number(ep.anio_edp) !== year) continue;
        Object.assign(mo, {
          ep, real:Number(ep.mantenimiento)||0, ggrr:Number(ep.gastos_reembolsables)||0,
          epTotal:Number(ep.total_neto)||0
        });
      }
      const prev = months.reduce((sum, mo) => sum + mo.preventivo, 0);
      const op = months.reduce((sum, mo) => sum + mo.operativo, 0);
      const real = months.reduce((sum, mo) => sum + mo.real, 0);
      state.forecastDataV8 = {
        months, prev, op, tot:prev+op, real, delta:real-prev-op,
        activityPrices:{catalog, saved, extraGroups, missing}
      };
      const oldEditor = body.querySelector('[data-forecast-prices]');
      if(oldEditor) pricesOpen = oldEditor.open;
      const scroll = document.scrollingElement;
      const top = scroll?.scrollTop;
      window.renderForecastBodyV9();
      if(scroll && oldEditor?.open) scroll.scrollTop = top;
    } catch(error) {
      if(request !== forecastRequest || !body.isConnected) return;
      console.error('[Stainher Forecast]',error);
      body.replaceChildren();
      const notice = document.createElement('div');
      notice.className = 'notice error';
      notice.textContent = 'No se pudo cargar el Forecast. ' + error.message;
      body.append(notice);
    }
  }

  let pricesOpen = false;
  let savingPrices = false;
  let syncPriceEditor;
  const priceDrafts = new Map();
  function renderActivityPrices() {
    const pricing = state.forecastDataV8?.activityPrices;
    const body = document.getElementById('forecastBody');
    const filters = body?.querySelector('.forecast-checks-v9');
    if(!pricing || !filters || body.querySelector('[data-forecast-prices]')) return;
    const excluded = forecastExcludedSetV9();
    for(const [id, name] of pricing.extraGroups) {
      const label = document.createElement('label');
      const input = document.createElement('input');
      input.type = 'checkbox';
      input.checked = !excluded.has(id);
      input.onchange = () => toggleForecastGroupV9(id, input.checked);
      label.append(input, ' ' + name);
      filters.insertBefore(label, filters.querySelector('button'));
    }

    const operatingLabel = document.createElement('label');
    const operatingInput = document.createElement('input');
    operatingInput.type = 'checkbox';
    operatingInput.checked = state.forecastIncludeOperating !== false;
    operatingInput.onchange = () => {
      state.forecastIncludeOperating = operatingInput.checked;
      window.loadForecastV9();
    };
    operatingLabel.append(operatingInput, ' Incluir gasto operativo en la proyección');
    filters.insertBefore(operatingLabel, filters.querySelector('button'));

    const editor = document.createElement('details');
    editor.className = 'panel';
    editor.dataset.forecastPrices = '';
    editor.dataset.noCollapse = '1';
    editor.dataset.noDisclosureMarker = '';
    editor.style.marginBlock = '12px';
    editor.open = pricesOpen;
    editor.ontoggle = () => { if(editor.isConnected) pricesOpen = editor.open; };
    const editable = canEditV11('contrato');
    const entries = [...pricing.catalog.entries()].sort(([,a],[,b]) =>
      a.equipos.nombre.localeCompare(b.equipos.nombre,'es') || a.actividad.localeCompare(b.actividad,'es'));
    const summary = pricing.missing ? ' · ' + pricing.missing + ' ocurrencias sin precio' : '';
    editor.innerHTML = '<summary>Precios unitarios de mantenimiento' + summary + '</summary>' +
      '<p class="muted">Precio neto en CLP por actividad y equipo. Se multiplica por las ocurrencias según la frecuencia y el mes de inicio del Plan Matriz. Las actividades sin precio quedan fuera del total.</p>' +
      '<div class="admin-table"><table><thead><tr><th>Equipo</th><th>Actividad</th><th>Precio unitario neto</th>' +
      '</tr></thead><tbody></tbody></table></div>' +
      (editable ? '<div class="actions" style="position:sticky;bottom:0;padding:10px;background:var(--panel);z-index:2">' +
        '<span class="muted" aria-live="polite" data-price-count></span>' +
        '<button class="btn primary" type="button" data-save-prices>Guardar precios</button></div>' : '');
    const inputs = new Map();
    const save = editor.querySelector('[data-save-prices]');
    const updateSave = () => {
      const count = [...inputs.keys()].filter(id => priceDrafts.has(id)).length;
      if(save) {
        save.disabled = savingPrices || !count;
        editor.querySelector('[data-price-count]').textContent = count + (count === 1 ? ' cambio pendiente' : ' cambios pendientes');
      }
    };
    const tbody = editor.querySelector('tbody');
    for(const [id, row] of entries) {
      const tr = tbody.insertRow();
      tr.insertCell().textContent = row.equipos.nombre;
      tr.insertCell().textContent = row.actividad;
      const price = pricing.saved.get(id);
      const reference = legacyGroup(row) ? forecastUnitPriceV8(row.equipos.nombre,row.actividad) : 0;
      const status = reference ? 'Tarifa contractual · ' + fmtCLP(reference * forecastFactorV8(row.equipos.nombre)) : 'Sin precio';
      const cell = tr.insertCell();
      if(!editable) {
        cell.textContent = price === undefined ? status : fmtCLP(price);
        continue;
      }
      const input = document.createElement('input');
      Object.assign(input, {
        className:'field', type:'number', min:'0', max:'999999999999', step:'1', required:true,
        value:price ?? '', placeholder:status
      });
      input.setAttribute('aria-label', 'Precio para ' + row.equipos.nombre + ' · ' + row.actividad);
      cell.append(input);
      if(priceDrafts.has(id)) input.value = priceDrafts.get(id);
      inputs.set(id, input);
      input.oninput = () => {
        if(input.value === String(price ?? '') && !input.validity.badInput) priceDrafts.delete(id);
        else priceDrafts.set(id, input.value);
        updateSave();
      };
    }

    if(save) save.onclick = async () => {
      if(savingPrices) return;
      const changes = [...inputs].filter(([id]) => priceDrafts.has(id));
      if(!changes.length) return;
      const invalid = changes.find(([, input]) => !input.checkValidity());
      if(invalid) {
        invalid[1].reportValidity();
        return;
      }
      const payload = changes.map(([id, input]) => {
        const row = pricing.catalog.get(id);
        return {equipo_id:row.equipo_id, actividad:row.actividad.trim(), precio_unitario:Number(input.value)};
      });
      savingPrices = true;
      syncPriceEditor();
      try {
        const {error} = await window.sb.from(priceTable).upsert(payload, {onConflict:'equipo_id,actividad'});
        if(error) throw error;
        changes.forEach(([id]) => { priceDrafts.delete(id); });
        payload.forEach(row => pricing.saved.set(key(row), row.precio_unitario));
        window.toast?.(payload.length + (payload.length === 1 ? ' precio guardado' : ' precios guardados'),'success');
      } catch(error) {
        window.toast?.('No se pudieron guardar los precios. ' + error.message,'error');
        return;
      } finally {
        savingPrices = false;
        syncPriceEditor?.();
      }
      if(pageActive()) await window.loadForecastV9();
    };
    syncPriceEditor = () => {
      inputs.forEach(input => { input.disabled = savingPrices; });
      updateSave();
    };
    syncPriceEditor();
    if(!entries.length) {
      const cell = tbody.insertRow().insertCell();
      cell.colSpan = 3;
      cell.textContent = 'Sin actividades de mantenimiento.';
    }
    body.append(editor);
  }

  function wrap(name){
    const current=window[name];
    if(typeof current!=='function')return false;
    const visited=new Set();
    for(let previous=current;typeof previous==='function'&&!visited.has(previous);previous=previous.__base){
      if(previous.__r123)return false;
      visited.add(previous);
    }
    const wrapped=name==='loadForecastV9'?async function(){
      removeDuplicateRefresh();
      const out=await loadActivityForecast();
      schedule();
      return out;
    }:function(){
      const out=current.apply(this,arguments);
      if(name==='renderForecastBodyV9') {
        document.querySelectorAll('#forecastChartV8,#forecastRealChartV8').forEach(chart=>{
          const panel=chart.closest('.panel');
          if(panel)panel.dataset.noCollapse='1';
        });
        renderActivityPrices();
      }
      removeDuplicateRefresh();
      schedule();
      return out;
    };
    wrapped.__r123=true;
    wrapped.__base=current;
    window[name]=wrapped;
    try{
      if(name==='loadForecastV9')loadForecastV9=wrapped;
      if(name==='renderForecastBodyV9')renderForecastBodyV9=wrapped;
      if(name==='renderContractForecastV8')renderContractForecastV8=wrapped;
    }catch(_){}
    return true;
  }

  function install(){
    mountStyle();
    wrap('renderContractForecastV8');
    wrap('loadForecastV9');
    wrap('renderForecastBodyV9');
    if(pageActive())schedule();
    if(!observer){
      const host=document.getElementById('page-contrato')||document.body;
      observer=new MutationObserver(()=>{if(pageActive())schedule()});
      observer.observe(host,{childList:true,subtree:true});
    }
  }

  function boot(){
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;
      install();
      if(tries>=80)clearInterval(timer);
    },125);
    setTimeout(showWatchdogMessage,8000);
    window.addEventListener('stainher:modules-ready',install);
    window.addEventListener('stainher:runtime-r123-ready',()=>{install();schedule()});
  }

  window.StainherContractForecastR123=Object.freeze({install,repair,drawCharts,removeDuplicateRefresh});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();