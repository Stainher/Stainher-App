/* Stainher App V15.24 r16 · Análisis técnico de Confiabilidad asistido por IA.
 * Mantiene KPI/MTBF/MTTR/Disponibilidad calculados por Stainher.
 * La IA sólo interpreta las intervenciones y completa campos de revisión técnica.
 */
(function bootstrapStainherReliabilityAI(){
  'use strict';
  if(window.__STAINHER_RELIABILITY_AI_R16__)return;

  const META_KEYS=[
    '__ai_generated','__ai_generated_at','__ai_model','__ai_history_months',
    '__ai_source_signature','__ai_intervention_count','__ai_historical_count',
    '__ai_evidences','__ai_status','__ai_version'
  ];
  const TEXT_KEYS=['resumen','hallazgos','hipotesis','recomendaciones','conclusiones'];
  const ALLOWED_ROLES=new Set(['administrador','confiabilidad']);
  const STYLE_ID='stainher-reliability-ai-r16-style';

  function norm(value){
    return String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').trim().toLowerCase();
  }
  function currentRole(){
    return norm(window.v11Role?.()||window.state?.profile?.rol||'');
  }
  function canUseAI(){return ALLOWED_ROLES.has(currentRole())}
  function esc(value){
    return String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function hashString(text){
    let h=2166136261>>>0;
    for(let i=0;i<text.length;i++){
      h^=text.charCodeAt(i);
      h=Math.imul(h,16777619)>>>0;
    }
    return h.toString(16).padStart(8,'0');
  }
  function aiSourceSignature(review){
    const rows=(review?.rows||review?.valid||[]).map(item=>[
      item.id||item.uuid||item.created_at||'', item.updated_at||'',
      item.equipo||item.equipo_original||'', item.guia||item.numero_guia||'',
      item.fecha_inicio||'', item.fecha_termino||'', item.estado_normalizado||item.estado_final||'',
      Number(item.duracion_horas||0), Number(item.duracion_minutos||0), Boolean(item.excluir_kpi),
      item.observaciones||item.observacion||''
    ]).sort((a,b)=>String(a[0]).localeCompare(String(b[0])));
    const payload=JSON.stringify({
      from:window.state?.correctivoFrom||'',to:window.state?.correctivoTo||'',
      equipment:review?.eq||'',rows
    });
    return 'r16-'+hashString(payload)+'-'+rows.length;
  }
  function mountStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .v16-ai-panel{margin:0 0 14px;padding:13px 14px;border:1px solid #35506b;border-radius:12px;background:linear-gradient(180deg,rgba(30,64,93,.25),rgba(12,21,30,.32));box-sizing:border-box}
      #modalRoot .v16-ai-head{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;flex-wrap:wrap}
      #modalRoot .v16-ai-title{font-size:13px;font-weight:800;color:#dbeafe}
      #modalRoot .v16-ai-sub{margin-top:3px;font-size:10.5px;line-height:1.4;color:#9fb3c8;max-width:760px}
      #modalRoot .v16-ai-controls{display:flex;align-items:flex-end;gap:8px;flex-wrap:wrap;margin-top:11px}
      #modalRoot .v16-ai-controls label{display:grid;gap:4px;font-size:10px;color:#9fb3c8}
      #modalRoot .v16-ai-controls select{min-width:135px}
      #modalRoot .v16-ai-status{margin-top:9px;padding:8px 10px;border-radius:9px;background:#0b141d;border:1px solid #26394b;color:#b7c8d9;font-size:10.5px;line-height:1.4}
      #modalRoot .v16-ai-status.ok{border-color:#315b43;color:#a7f3d0;background:rgba(22,101,52,.12)}
      #modalRoot .v16-ai-status.warn{border-color:#765a25;color:#fde68a;background:rgba(146,94,13,.12)}
      #modalRoot .v16-ai-status.error{border-color:#713544;color:#fecdd3;background:rgba(127,29,29,.12)}
      #modalRoot .v16-ai-evidence{margin-top:9px;font-size:10px;color:#aebfd0}
      #modalRoot .v16-ai-evidence summary{cursor:pointer;color:#bfdbfe;font-weight:700}
      #modalRoot .v16-ai-evidence ul{margin:7px 0 0 18px;padding:0;display:grid;gap:6px}
      #modalRoot .v16-ai-badge{display:inline-flex;align-items:center;padding:3px 7px;border:1px solid #42617f;border-radius:999px;font-size:9px;color:#bfdbfe;background:rgba(30,64,93,.28)}
      @media(max-width:700px){#modalRoot .v16-ai-controls{display:grid;grid-template-columns:1fr}#modalRoot .v16-ai-controls .btn,#modalRoot .v16-ai-controls label,#modalRoot .v16-ai-controls select{width:100%;max-width:100%}}
    `;
    document.head.appendChild(style);
  }
  function getReview(){return window.state?.v158ReliabilityReview||null}
  function statusElement(){return document.querySelector('#modalRoot .v16-ai-status')}
  function setStatus(message,type){
    const el=statusElement();if(!el)return;
    el.className='v16-ai-status'+(type?' '+type:'');el.textContent=message;
  }
  function setBusy(busy){
    const button=document.querySelector('#modalRoot [data-v16-ai-generate]');
    if(button){button.disabled=!!busy;button.textContent=busy?'Analizando intervenciones…':(getReview()?.content?.__ai_generated?'Regenerar análisis IA':'Generar análisis IA')}
    const select=document.querySelector('#modalRoot [data-v16-ai-history]');if(select)select.disabled=!!busy;
  }
  function renderEvidence(content){
    const holder=document.querySelector('#modalRoot [data-v16-ai-evidence]');
    if(!holder)return;
    const rows=Array.isArray(content?.__ai_evidences)?content.__ai_evidences:[];
    if(!rows.length){holder.innerHTML='';return}
    holder.innerHTML=`<details class="v16-ai-evidence"><summary>Evidencia utilizada por la IA (${rows.length} hallazgo${rows.length===1?'':'s'})</summary><ul>${rows.slice(0,12).map(item=>`<li><b>${esc(item.equipo||'Equipo')}</b> · ${esc(item.hallazgo||'Hallazgo')} <span class="v16-ai-badge">Confianza ${esc(item.nivel_confianza||'—')}</span>${Array.isArray(item.guias)&&item.guias.length?`<br><small>Guías: ${esc(item.guias.join(', '))}</small>`:''}</li>`).join('')}</ul></details>`;
  }
  function syncAiState(){
    const review=getReview();if(!review)return;
    const content=review.content||{};
    const select=document.querySelector('#modalRoot [data-v16-ai-history]');
    if(select&&content.__ai_history_months)select.value=String(content.__ai_history_months);
    const button=document.querySelector('#modalRoot [data-v16-ai-generate]');
    if(button)button.textContent=content.__ai_generated?'Regenerar análisis IA':'Generar análisis IA';
    if(content.__ai_generated){
      const stale=content.__ai_source_signature&&content.__ai_source_signature!==aiSourceSignature(review);
      if(stale){
        setStatus('Las intervenciones del informe cambiaron desde el último análisis IA. Regenera el análisis antes de aprobar el informe.','warn');
        content.__ai_status='stale';
      }else{
        const when=content.__ai_generated_at?new Date(content.__ai_generated_at).toLocaleString('es-CL'):'fecha no disponible';
        setStatus(`Análisis IA vigente · ${content.__ai_intervention_count||0} intervenciones del período · histórico ${content.__ai_historical_count||0} · generado ${when}.`,'ok');
        content.__ai_status='current';
      }
    }else{
      setStatus('La IA interpreta las intervenciones y propone texto técnico. Los KPI, MTBF, MTTR, disponibilidad y Pareto continúan siendo calculados por Stainher.','');
    }
    renderEvidence(content);
  }
  function ensurePanel(){
    const modal=document.querySelector('#modalRoot .v158-review-modal');
    if(!modal||!canUseAI())return;
    mountStyle();
    if(!modal.querySelector('.v16-ai-panel')){
      const panel=document.createElement('section');
      panel.className='v16-ai-panel';
      panel.innerHTML=`
        <div class="v16-ai-head">
          <div><div class="v16-ai-title">✨ Análisis técnico asistido por IA <span class="v16-ai-badge">r16</span></div><div class="v16-ai-sub">Analiza el detalle de las intervenciones del período y el historial del equipo para detectar recurrencias, patrones, hipótesis y recomendaciones. El resultado queda editable antes de aprobar el PDF.</div></div>
        </div>
        <div class="v16-ai-controls">
          <label>Histórico de referencia<select data-v16-ai-history><option value="6">Últimos 6 meses</option><option value="12" selected>Últimos 12 meses</option><option value="18">Últimos 18 meses</option><option value="24">Últimos 24 meses</option></select></label>
          <button type="button" class="btn primary" data-v16-ai-generate>Generar análisis IA</button>
        </div>
        <div class="v16-ai-status"></div><div data-v16-ai-evidence></div>`;
      const grid=modal.querySelector('.v158-review-grid');
      if(grid)modal.insertBefore(panel,grid);else modal.prepend(panel);
      panel.querySelector('[data-v16-ai-generate]')?.addEventListener('click',generateAIAnalysis);
    }
    syncAiState();
  }
  function metricsFromReview(review){
    const rel=review?.rel||{};
    return {
      atenciones_validas:Array.isArray(review?.valid)?review.valid.length:0,
      horas_intervencion:Number(review?.hours||0),
      mttr:rel.ready&&Number.isFinite(Number(rel.mttr))?Number(rel.mttr):null,
      mtbf:rel.ready&&Number.isFinite(Number(rel.mtbf))?Number(rel.mtbf):null,
      disponibilidad:rel.ready&&Number.isFinite(Number(rel.disponibilidad))?Number(rel.disponibilidad):null,
      mayor_recurrencia:Array.isArray(review?.top)?String(review.top[0]||''):''
    };
  }
  async function generateAIAnalysis(){
    const review=getReview();
    if(!review)return window.toast?.('Primero genera la revisión de Confiabilidad.','error');
    if(!canUseAI())return window.toast?.('El análisis IA requiere perfil Administrador o Confiabilidad.','error');
    if(!window.sb?.functions?.invoke)return window.toast?.('Supabase Functions no está disponible.','error');
    const historyMonths=Math.max(1,Math.min(24,Number(document.querySelector('#modalRoot [data-v16-ai-history]')?.value||12)));
    const validCount=Array.isArray(review.valid)?review.valid.length:0;
    if(!validCount)return window.toast?.('No existen atenciones válidas para analizar en el período.','error');

    if(typeof window.v158CollectReview==='function'){
      const collected=window.v158CollectReview();
      review.content={...(review.content||{}),...(collected||{})};
    }
    const sourceSignature=aiSourceSignature(review);
    setBusy(true);setStatus('Analizando observaciones, recurrencias e historial técnico…','');
    try{
      const {data,error}=await window.sb.functions.invoke('analyze-stainher-reliability',{body:{
        from:window.state?.correctivoFrom,to:window.state?.correctivoTo,
        equipment:review.eq||null,history_months:historyMonths,
        metrics:metricsFromReview(review),source_signature:sourceSignature
      }});
      if(error)throw error;
      if(!data?.ok){
        if(data?.code==='AI_NOT_CONFIGURED')throw new Error('El servicio IA aún no tiene configurada la clave OPENAI_API_KEY en Supabase.');
        if(data?.code==='NO_DATA')throw new Error('No se encontraron intervenciones para el período seleccionado.');
        throw new Error(data?.message||'El servicio IA no pudo completar el análisis.');
      }
      const analysis=data.analysis||{};
      review.content=review.content||{};
      TEXT_KEYS.forEach(key=>{
        const value=String(analysis[key]||'').trim();if(!value)return;
        review.content[key]=value;
        const field=document.querySelector(`#modalRoot [data-v158-review="${key}"]`);if(field)field.value=value;
      });
      Object.assign(review.content,{
        __ai_generated:true,
        __ai_generated_at:data.generated_at||new Date().toISOString(),
        __ai_model:data.model||'IA',
        __ai_history_months:historyMonths,
        __ai_source_signature:sourceSignature,
        __ai_intervention_count:Number(data.current_count||validCount),
        __ai_historical_count:Number(data.historical_count||0),
        __ai_evidences:Array.isArray(analysis.evidencias)?analysis.evidencias:[],
        __ai_status:'current',__ai_version:'r16'
      });
      syncAiState();
      window.toast?.('Análisis IA generado. Revisa y edita el contenido antes de aprobar el informe.','success');
    }catch(error){
      console.error('[Confiabilidad IA r16]',error);
      setStatus(String(error?.message||error||'No fue posible generar el análisis IA.'),'error');
      window.toast?.('No fue posible generar el análisis IA. Revisa la configuración del servicio.','error');
    }finally{setBusy(false)}
  }
  function patchCollect(){
    const fn=window.v158CollectReview;
    if(typeof fn!=='function'||fn.__v16AI)return;
    const wrapped=function(){
      const review=getReview(),previous={...(review?.content||{})};
      const next=fn.apply(this,arguments)||{};
      META_KEYS.forEach(key=>{if(previous[key]!==undefined)next[key]=previous[key]});
      return next;
    };
    wrapped.__v16AI=true;wrapped.__base=fn;window.v158CollectReview=wrapped;
  }
  function patchOpen(){
    const fn=window.v158OpenReliabilityReview;
    if(typeof fn!=='function'||fn.__v16AI)return;
    const wrapped=async function(){
      const out=await fn.apply(this,arguments);
      setTimeout(()=>{patchCollect();ensurePanel()},0);
      return out;
    };
    wrapped.__v16AI=true;wrapped.__base=fn;window.v158OpenReliabilityReview=wrapped;
  }
  function boot(){
    if(typeof window.v158OpenReliabilityReview!=='function'||typeof window.v158CollectReview!=='function'||!window.state){
      setTimeout(boot,150);return;
    }
    window.__STAINHER_RELIABILITY_AI_R16__=true;
    mountStyle();patchCollect();patchOpen();
    new MutationObserver(()=>{patchCollect();patchOpen();ensurePanel()}).observe(document.getElementById('modalRoot')||document.body,{childList:true,subtree:true});
    ensurePanel();
  }
  boot();
})();
