/* Stainher App V15.24 r18 · estado visible de procesamiento para Confiabilidad IA.
 * Solo ruta de prueba. Muestra actividad y tiempo transcurrido mientras Gemini procesa.
 */
(function installReliabilityAiLoadingR18(){
  'use strict';
  if(window.__STAINHER_RELIABILITY_AI_LOADING_R18__)return;
  window.__STAINHER_RELIABILITY_AI_LOADING_R18__=true;

  const STYLE_ID='stainher-r18-ai-loading-style';
  let ticker=null;
  let startedAt=0;

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .v16-ai-panel{position:relative}
      #modalRoot .v18-ai-working{display:none;align-items:center;gap:11px;margin-top:10px;padding:11px 12px;border:1px solid #3d6280;border-radius:10px;background:rgba(10,27,41,.92);box-sizing:border-box}
      #modalRoot .v18-ai-working.active{display:flex}
      #modalRoot .v18-ai-spinner{width:18px;height:18px;min-width:18px;border:2px solid rgba(191,219,254,.28);border-top-color:#bfdbfe;border-radius:50%;animation:v18AiSpin .8s linear infinite}
      #modalRoot .v18-ai-working-title{font-size:11px;font-weight:800;color:#dbeafe}
      #modalRoot .v18-ai-working-sub{margin-top:2px;font-size:10px;line-height:1.35;color:#9fb3c8}
      #modalRoot [data-v16-ai-generate][aria-busy="true"]{cursor:wait;opacity:.78}
      @keyframes v18AiSpin{to{transform:rotate(360deg)}}
      @media(max-width:700px){#modalRoot .v18-ai-working{align-items:flex-start}}
    `;
    document.head.appendChild(style);
  }

  function ensureIndicator(){
    ensureStyle();
    const panel=document.querySelector('#modalRoot .v16-ai-panel');
    if(!panel)return null;
    let holder=panel.querySelector('.v18-ai-working');
    if(holder)return holder;
    holder=document.createElement('div');
    holder.className='v18-ai-working';
    holder.setAttribute('role','status');
    holder.setAttribute('aria-live','polite');
    holder.innerHTML='<span class="v18-ai-spinner" aria-hidden="true"></span><div><div class="v18-ai-working-title">Analizando intervenciones con Gemini…</div><div class="v18-ai-working-sub">El análisis está en proceso. Esto puede tardar algunos segundos. <span data-v18-ai-elapsed></span></div></div>';
    const controls=panel.querySelector('.v16-ai-controls');
    if(controls&&controls.nextSibling)panel.insertBefore(holder,controls.nextSibling);
    else if(controls)controls.after(holder);
    else panel.appendChild(holder);
    return holder;
  }

  function updateElapsed(){
    const holder=document.querySelector('#modalRoot .v18-ai-working.active');
    const elapsed=holder?.querySelector('[data-v18-ai-elapsed]');
    if(!elapsed||!startedAt)return;
    const seconds=Math.max(0,Math.floor((Date.now()-startedAt)/1000));
    elapsed.textContent=seconds?`Tiempo transcurrido: ${seconds} s.`:'Iniciando análisis…';
  }

  function showWorking(){
    const holder=ensureIndicator();
    if(holder)holder.classList.add('active');
    const button=document.querySelector('#modalRoot [data-v16-ai-generate]');
    if(button){
      button.setAttribute('aria-busy','true');
      button.disabled=true;
      button.textContent='Analizando…';
    }
    startedAt=Date.now();
    updateElapsed();
    if(ticker)clearInterval(ticker);
    ticker=setInterval(updateElapsed,1000);
  }

  function hideWorking(){
    if(ticker){clearInterval(ticker);ticker=null;}
    startedAt=0;
    document.querySelector('#modalRoot .v18-ai-working')?.classList.remove('active');
    const button=document.querySelector('#modalRoot [data-v16-ai-generate]');
    if(button)button.removeAttribute('aria-busy');
  }

  let tries=0;
  function patchInvoke(){
    const functions=window.sb?.functions;
    const original=functions?.invoke;
    if(typeof original!=='function'){
      if(++tries<200)setTimeout(patchInvoke,100);
      return;
    }
    if(original.__r18AiLoading)return;
    const wrapped=async function(functionName,options){
      if(functionName!=='analyze-stainher-reliability')return original.call(functions,functionName,options);
      showWorking();
      try{
        return await original.call(functions,functionName,options);
      }finally{
        hideWorking();
      }
    };
    wrapped.__r18AiLoading=true;
    wrapped.__base=original;
    functions.invoke=wrapped;
  }

  patchInvoke();
})();
