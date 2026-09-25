/* Stainher V15.24 · R125 · Desglose EDP integrado en Editar Estado de Pago.
 * - Inserta el detalle por equipo dentro del modal existente de edición del EDP.
 * - Evita depender de una columna adicional en la tabla histórica.
 * - Persiste en edp_mantenimiento_equipos_v1524 y reutiliza R122.
 */
(()=>{
  'use strict';
  const BUILD='20260925-r125-edp-inline-detail';
  if(window.__STAINHER_EDP_INLINE_R125__===BUILD)return;
  window.__STAINHER_EDP_INLINE_R125__=BUILD;

  const TABLE='edp_mantenimiento_equipos_v1524';
  const STYLE_ID='stainher-edp-inline-r125-style';
  const GROUPS=[
    ['3700','Nodo 3700'],
    ['asea','HUINCHE ASEA (Concentradora)'],
    ['otis','HUINCHE OTIS'],
    ['alimak','HUINCHE ALIMAK'],
    ['ptp','Huinche Tercer Panel (PTP)'],
    ['eila','Ascensor EILA 1 y 2'],
    ['hilton','Montacargas Hilton (EQUIPOS 2 Y 3)']
  ];
  let observer=null,busy=false;

  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const money=v=>{
    if(typeof window.fmtCLP==='function')return window.fmtCLP(v);
    return '$'+Math.round(Number(v)||0).toLocaleString('es-CL');
  };

  function installStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .modal.r125-edp-modal{width:min(980px,96vw)!important;max-height:90vh!important;overflow:auto!important}
      #modalRoot .r125-edp-detail{
        margin-top:16px!important;
        padding-top:14px!important;
        border-top:1px solid var(--line,#334155)!important;
      }
      #modalRoot .r125-edp-detail-head{
        display:flex!important;
        align-items:flex-start!important;
        justify-content:space-between!important;
        gap:12px!important;
        flex-wrap:wrap!important;
        margin-bottom:10px!important;
      }
      #modalRoot .r125-edp-detail-head h4{margin:0 0 4px!important}
      #modalRoot .r125-edp-grid{
        display:grid!important;
        grid-template-columns:repeat(2,minmax(0,1fr))!important;
        gap:10px 12px!important;
      }
      #modalRoot .r125-edp-grid label{min-width:0!important}
      #modalRoot .r125-edp-grid input{width:100%!important}
      #modalRoot .r125-edp-summary{
        display:grid!important;
        grid-template-columns:repeat(5,minmax(0,1fr))!important;
        gap:8px!important;
        margin-top:12px!important;
      }
      #modalRoot .r125-edp-summary .kpi{
        min-width:0!important;
        border:1px solid var(--line,#334155)!important;
        border-radius:10px!important;
        padding:9px!important;
      }
      #modalRoot .r125-edp-summary .kpi span{font-size:10px!important;color:var(--muted,#94a3b8)!important}
      #modalRoot .r125-edp-summary .kpi strong{display:block!important;margin-top:4px!important;font-size:14px!important;overflow-wrap:anywhere!important}
      #modalRoot .r125-edp-actions{
        display:flex!important;
        justify-content:flex-end!important;
        gap:8px!important;
        margin-top:10px!important;
      }
      #modalRoot .r125-edp-diff[data-state="ok"]{color:#34d399!important}
      #modalRoot .r125-edp-diff[data-state="warn"]{color:#fbbf24!important}
      #modalRoot .r125-edp-diff[data-state="bad"]{color:#fb7185!important}
      @media(max-width:760px){
        #modalRoot .r125-edp-grid{grid-template-columns:1fr!important}
        #modalRoot .r125-edp-summary{grid-template-columns:repeat(2,minmax(0,1fr))!important}
      }
      @media(max-width:480px){
        #modalRoot .r125-edp-summary{grid-template-columns:1fr!important}
      }
    `;
    document.head.appendChild(style);
  }

  function modalRoot(){return document.getElementById('modalRoot')}
  function modal(){
    const root=modalRoot();if(!root)return null;
    return root.querySelector('.modal');
  }
  function heading(m){
    return String(m?.querySelector('h1,h2,h3,h4')?.textContent||'').trim();
  }
  function epNumberFromModal(m){
    const hit=heading(m).match(/EP\s*(\d+)/i);
    return Number(hit?.[1]||0);
  }
  function currentEp(m){
    const num=epNumberFromModal(m);
    if(!num)return null;
    return (window.state?.contractData?.edp||[]).find(ep=>Number(ep.ep_num)===num)||null;
  }
  function labelInput(m,needle){
    const target=norm(needle);
    const label=[...m.querySelectorAll('label')].find(x=>norm(x.childNodes?.[0]?.textContent||x.textContent).startsWith(target));
    return label?.querySelector('input,select,textarea')||null;
  }
  function baseValues(m,ep){
    const total=Number(labelInput(m,'Total Neto')?.value??ep?.total_neto??0)||0;
    const maintenance=Number(labelInput(m,'Mantenimiento')?.value??ep?.mantenimiento??0)||0;
    const ggrr=Number(labelInput(m,'Gastos Reembolsables')?.value??ep?.gastos_reembolsables??0)||0;
    return {total:Math.max(0,total),maintenance:Math.max(0,maintenance),ggrr:Math.max(0,ggrr)};
  }
  function detailsFor(epId){
    const api=window.StainherEdpEquipmentR122;
    if(api?.detailsFor)return api.detailsFor(epId)||[];
    return (window.state?.contractData?.edpEquipoDetalles||[]).filter(x=>String(x.estado_pago_id)===String(epId));
  }
  async function ensureDetails(){
    try{await window.StainherEdpEquipmentR122?.loadDetails?.()}catch(_){}
  }

  function recalc(section,m,ep){
    const values=[...section.querySelectorAll('[data-r125-amount]')].map(input=>Math.max(0,Number(input.value)||0));
    const equipment=values.reduce((a,b)=>a+b,0);
    const base=baseValues(m,ep);
    const diff=base.maintenance-equipment;
    const operational=Math.max(0,base.total-base.ggrr-equipment);
    const projected=equipment+operational;
    const put=(key,value)=>{
      const el=section.querySelector(`[data-r125-total="${key}"]`);
      if(el)el.textContent=money(value);
    };
    put('equipment',equipment);
    put('maintenance',base.maintenance);
    put('operational',operational);
    put('ggrr',base.ggrr);
    put('total',base.total);
    put('projected',projected);

    const diffEl=section.querySelector('[data-r125-diff]');
    if(diffEl){
      diffEl.textContent=diff===0?'El detalle por equipos concilia exactamente con Mantenimiento EDP.'
        :diff>0?`Faltan ${money(diff)} por distribuir entre los equipos.`
        :`El detalle excede Mantenimiento EDP en ${money(Math.abs(diff))}.`;
      diffEl.dataset.state=diff===0?'ok':diff>0?'warn':'bad';
    }
  }

  async function save(section,m,ep){
    const client=window.sb;
    if(!client||!ep?.id)return;
    const button=section.querySelector('[data-r125-save]');
    if(button){button.disabled=true;button.textContent='Guardando…'}
    const payload=GROUPS.map(([code,label])=>({
      estado_pago_id:ep.id,
      grupo_codigo:code,
      equipo_label:label,
      monto:Math.max(0,Number(section.querySelector(`[data-r125-amount="${code}"]`)?.value)||0),
      updated_at:new Date().toISOString()
    }));
    const q=await client.from(TABLE).upsert(payload,{onConflict:'estado_pago_id,grupo_codigo'});
    if(q.error){
      if(button){button.disabled=false;button.textContent='Guardar desglose equipos'}
      return window.toast?.(q.error.message||'No se pudo guardar el desglose','error');
    }
    try{
      await window.StainherEdpEquipmentR122?.loadDetails?.();
      window.StainherEdpEquipmentR122?.enhanceEdpTable?.();
      window.StainherForecastHistoryR124?.render?.();
    }catch(_){}
    if(button){button.disabled=false;button.textContent='Guardar desglose equipos'}
    window.toast?.('Desglose de equipos guardado.','success');
    recalc(section,m,ep);
  }

  async function enhance(){
    if(busy)return false;
    const m=modal();
    if(!m||!/Editar Estado de Pago/i.test(heading(m)))return false;
    const ep=currentEp(m);if(!ep)return false;
    if(m.querySelector('.r125-edp-detail'))return true;

    busy=true;
    try{
      await ensureDetails();
      const current=detailsFor(ep.id);
      m.classList.add('r125-edp-modal');

      const section=document.createElement('section');
      section.className='r125-edp-detail';
      section.innerHTML=`
        <div class="r125-edp-detail-head">
          <div>
            <h4>Desglose mantenimiento por equipo</h4>
            <div class="muted">Ingresa aquí el monto real incluido en este EDP para cada grupo de equipos.</div>
          </div>
          <div class="muted">EP${ep.ep_num} · ${ep.anio_edp}</div>
        </div>
        <div class="r125-edp-grid">
          ${GROUPS.map(([code,label])=>{
            const value=current.find(x=>String(x.grupo_codigo)===code)?.monto||0;
            return `<label>${label}<input class="field" type="number" min="0" step="1" value="${Number(value)||0}" data-r125-amount="${code}"></label>`;
          }).join('')}
        </div>
        <div class="r125-edp-summary">
          <div class="kpi"><span>Mantenimiento EDP</span><strong data-r125-total="maintenance">—</strong></div>
          <div class="kpi"><span>Detalle equipos</span><strong data-r125-total="equipment">—</strong></div>
          <div class="kpi"><span>Gasto Operativo / General</span><strong data-r125-total="operational">—</strong></div>
          <div class="kpi"><span>GGRR</span><strong data-r125-total="ggrr">—</strong></div>
          <div class="kpi"><span>Total Neto</span><strong data-r125-total="total">—</strong></div>
        </div>
        <div class="notice r125-edp-diff" data-r125-diff style="margin-top:10px"></div>
        <div class="r125-edp-actions"><button type="button" class="btn primary" data-r125-save>Guardar desglose equipos</button></div>
      `;

      const actionButton=[...m.querySelectorAll('button')].find(btn=>/Guardar cambios/i.test(btn.textContent||''));
      const actionContainer=actionButton?.parentElement||m.lastElementChild;
      if(actionContainer)actionContainer.insertAdjacentElement('beforebegin',section);
      else m.appendChild(section);

      section.querySelectorAll('[data-r125-amount]').forEach(input=>input.addEventListener('input',()=>recalc(section,m,ep)));
      [labelInput(m,'Total Neto'),labelInput(m,'Mantenimiento'),labelInput(m,'Gastos Reembolsables')].filter(Boolean)
        .forEach(input=>input.addEventListener('input',()=>recalc(section,m,ep)));
      section.querySelector('[data-r125-save]')?.addEventListener('click',()=>save(section,m,ep));
      recalc(section,m,ep);
      return true;
    }finally{busy=false}
  }

  function install(){
    installStyle();
    enhance();
    if(observer)return;
    const root=modalRoot()||document.body;
    observer=new MutationObserver(()=>{setTimeout(enhance,0)});
    observer.observe(root,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',()=>setTimeout(enhance,0));
    window.addEventListener('stainher:runtime-r125-ready',()=>setTimeout(enhance,0));
  }

  window.StainherEdpInlineR125=Object.freeze({install,enhance});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();