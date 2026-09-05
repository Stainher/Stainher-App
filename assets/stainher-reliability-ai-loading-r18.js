/* Stainher App V15.24 r18 · estado visible de procesamiento para Confiabilidad IA.
 * Solo ruta de prueba. Hook directo al clic real del botón IA.
 */
(function installReliabilityAiLoadingR18(){
  'use strict';
  if(window.__STAINHER_RELIABILITY_AI_LOADING_R18_V2__)return;
  window.__STAINHER_RELIABILITY_AI_LOADING_R18_V2__=true;

  const STYLE_ID='stainher-r18-ai-loading-style';
  let ticker=null;
  let monitor=null;
  let startedAt=0;
  let sawBusy=false;

  function ensureStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #modalRoot .v16-ai-panel{position:relative}
      #modalRoot .v18-ai-working{display:none;align-items:center;gap:11px;margin-top:10px;padding:12px 13px;border:1px solid #3d6280;border-radius:10px;background:rgba(10,27,41,.96);box-sizing:border-box}
      #modalRoot .v18-ai-working.active{display:flex}
      #modalRoot .v18-ai-spinner{width:18px;height:18px;min-width:18px;border:2px solid rgba(191,219,254,.28);border-top-color:#bfdbfe;border-radius:50%;animation:v18AiSpin .8s linear infinite}
      #modalRoot .v18-ai-working-title{font-size:11px;font-weight:800;color:#dbeafe}
      #modalRoot .v18-ai-working-sub{margin-top:2px;font-size:10px;line-height:1.35;color:#9fb3c8}
      #modalRoot [data-v16-ai-generate][aria-busy="true"]{cursor:wait;opacity:.8}
      @keyframes v18AiSpin{to{transform:rotate(360deg)}}
      @media(max-width:700px){#modalRoot .v18-ai-working{align-items:flex-start}}
    `;
    document.head.appendChild(style);
  }

  function getButton(){return document.querySelector('#modalRoot [data-v16-ai-generate]')}
  function getStatus(){return document.querySelector('#modalRoot .v16-ai-status')}

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
    holder.innerHTML='<span class="v18-ai-spinner" aria-hidden="true"></span><div><div class="v18-ai-working-title">Analizando intervenciones con Gemini…</div><div class="v18-ai-working-sub">El análisis está en proceso. Esto puede tardar algunos segundos. <span data-v18-ai-elapsed>Iniciando análisis…</span></div></div>';
    const controls=panel.querySelector('.v16-ai-controls');
    if(controls)controls.after(holder); else panel.prepend(holder);
    return holder;
  }

  function updateElapsed(){
    const elapsed=document.querySelector('#modalRoot .v18-ai-working.active [data-v18-ai-elapsed]');
    if(!elapsed||!startedAt)return;
    const seconds=Math.max(0,Math.floor((Date.now()-startedAt)/1000));
    elapsed.textContent=seconds?`Tiempo transcurrido: ${seconds} s.`:'Iniciando análisis…';
  }

  function stopWorking(){
    if(ticker){clearInterval(ticker);ticker=null;}
    if(monitor){clearInterval(monitor);monitor=null;}
    startedAt=0;sawBusy=false;
    document.querySelector('#modalRoot .v18-ai-working')?.classList.remove('active');
    const button=getButton();
    if(button)button.removeAttribute('aria-busy');
  }

  function startWorking(button){
    stopWorking();
    const holder=ensureIndicator();
    if(holder)holder.classList.add('active');
    startedAt=Date.now();
    if(button){
      button.setAttribute('aria-busy','true');
      button.textContent='Analizando…';
    }
    updateElapsed();
    ticker=setInterval(updateElapsed,1000);

    // La rutina r16 deshabilita el botón mientras espera a Gemini. Observamos ese ciclo
    // para retirar el indicador cuando finalice, sin tocar el cliente Supabase.
    monitor=setInterval(()=>{
      const current=getButton();
      const status=getStatus();
      if(!current){stopWorking();return;}
      if(current.disabled)sawBusy=true;
      const text=String(status?.textContent||'').trim();
      const finishedByStatus=/^Análisis Gemini vigente|^Las intervenciones del informe cambiaron|No fue posible|error|límite|clave|Gemini devolvió|Gemini terminó/i.test(text);
      if((sawBusy&&!current.disabled)||finishedByStatus){
        stopWorking();
      }else if(startedAt&&Date.now()-startedAt>120000){
        stopWorking();
      }
    },200);
  }

  document.addEventListener('click',event=>{
    const button=event.target?.closest?.('#modalRoot [data-v16-ai-generate]');
    if(!button||button.disabled)return;
    // Capturamos el clic real; la rutina original sigue ejecutándose normalmente.
    startWorking(button);
    setTimeout(()=>{
      const current=getButton();
      if(current){current.setAttribute('aria-busy','true');current.textContent='Analizando…';}
    },0);
  },true);

  ensureStyle();
})();
