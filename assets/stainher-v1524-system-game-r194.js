/* Stainher V15.24 · R194 · Juego Godzilla en Sistema */
(()=>{
  'use strict';
  const BUILD='20261022-r194-system-godzilla';
  if(window.__STAINHER_SYSTEM_GAME_R194__===BUILD)return;
  window.__STAINHER_SYSTEM_GAME_R194__=BUILD;

  const URL='https://dinorunner.com/es/godzilla/';
  const PANEL_ID='stainher-system-game-r194';

  function style(){
    if(document.getElementById(PANEL_ID+'-style'))return;
    const s=document.createElement('style');
    s.id=PANEL_ID+'-style';
    s.textContent=`
      #${PANEL_ID}{margin-top:16px;overflow:hidden}
      #${PANEL_ID}>summary{cursor:pointer;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:16px 18px}
      #${PANEL_ID}>summary::-webkit-details-marker{display:none}
      #${PANEL_ID} .r194-game-head{display:flex;align-items:center;gap:12px}
      #${PANEL_ID} .r194-game-icon{width:38px;height:38px;border-radius:12px;display:grid;place-items:center;background:linear-gradient(135deg,#087f8c,#176fc1);color:#fff;font-size:21px;box-shadow:0 6px 16px rgba(23,111,193,.18)}
      #${PANEL_ID} .r194-game-copy strong{display:block;font-size:15px}
      #${PANEL_ID} .r194-game-copy small{display:block;color:var(--muted);margin-top:3px}
      #${PANEL_ID} .r194-game-badge{font-size:11px;border:1px solid var(--line);border-radius:999px;padding:5px 9px;color:var(--muted)}
      #${PANEL_ID} .r194-game-body{padding:0 18px 18px}
      #${PANEL_ID} .r194-game-toolbar{display:flex;gap:9px;flex-wrap:wrap;align-items:center;justify-content:space-between;margin-bottom:12px}
      #${PANEL_ID} .r194-game-help{font-size:12px;color:var(--muted)}
      #${PANEL_ID} .r194-game-actions{display:flex;gap:8px;flex-wrap:wrap}
      #${PANEL_ID} .r194-game-frame-wrap{position:relative;border:1px solid var(--line);border-radius:14px;overflow:hidden;background:var(--panel2);min-height:520px}
      #${PANEL_ID} iframe{display:block;width:100%;height:620px;border:0;background:#fff}
      #${PANEL_ID} .r194-game-cover{display:none;position:absolute;inset:0;place-items:center;text-align:center;padding:28px;background:linear-gradient(180deg,var(--panel2),var(--panel))}
      #${PANEL_ID} .r194-game-cover.visible{display:grid}
      #${PANEL_ID} .r194-game-cover strong{display:block;font-size:18px;margin-bottom:8px}
      #${PANEL_ID} .r194-game-cover p{max-width:620px;color:var(--muted);margin:0 auto 14px;line-height:1.45}
      #${PANEL_ID} .r194-game-note{margin-top:10px;font-size:11px;color:var(--muted);line-height:1.45}
      @media(max-width:700px){
        #${PANEL_ID}>summary{padding:14px}
        #${PANEL_ID} .r194-game-body{padding:0 14px 14px}
        #${PANEL_ID} iframe{height:520px}
        #${PANEL_ID} .r194-game-frame-wrap{min-height:440px}
        #${PANEL_ID} .r194-game-toolbar{align-items:flex-start}
      }
    `;
    document.head.appendChild(s);
  }

  function mount(){
    const page=document.getElementById('page-sistema');
    if(!page)return false;
    if(document.getElementById(PANEL_ID))return true;
    style();

    const panel=document.createElement('details');
    panel.id=PANEL_ID;
    panel.className='panel';
    panel.innerHTML=`
      <summary>
        <div class="r194-game-head">
          <div class="r194-game-icon">🦖</div>
          <div class="r194-game-copy">
            <strong>Zona de descanso · Godzilla Runner</strong>
            <small>Minijuego integrado para pausas breves dentro de Sistema.</small>
          </div>
        </div>
        <span class="r194-game-badge">Entretenimiento</span>
      </summary>
      <div class="r194-game-body">
        <div class="r194-game-toolbar">
          <div class="r194-game-help">Controles: <b>Espacio / ↑</b> para saltar y <b>↓</b> para agacharte.</div>
          <div class="r194-game-actions">
            <button class="btn" type="button" data-r194-reload>↻ Reiniciar</button>
            <button class="btn primary" type="button" data-r194-open>↗ Abrir juego</button>
          </div>
        </div>
        <div class="r194-game-frame-wrap">
          <iframe title="Godzilla Runner" loading="lazy" referrerpolicy="no-referrer" allow="fullscreen; gamepad" sandbox="allow-scripts allow-same-origin allow-forms allow-popups allow-pointer-lock" data-r194-frame></iframe>
          <div class="r194-game-cover" data-r194-cover>
            <div>
              <strong>No fue posible mostrar el juego dentro de Stainher App.</strong>
              <p>El sitio externo puede impedir que se muestre dentro de otra página. Puedes abrirlo directamente manteniendo esta pestaña de Stainher disponible.</p>
              <button class="btn primary" type="button" data-r194-open>↗ Abrir Godzilla Runner</button>
            </div>
          </div>
        </div>
        <div class="r194-game-note">Juego externo alojado por dinorunner.com. Stainher App no almacena puntajes, cuentas ni datos del juego.</div>
      </div>
    `;

    const frame=panel.querySelector('[data-r194-frame]');
    const cover=panel.querySelector('[data-r194-cover]');
    let loaded=false;
    const loadGame=()=>{
      cover?.classList.remove('visible');
      if(frame)frame.src=URL+(URL.includes('?')?'&':'?')+'stainher='+Date.now();
      loaded=true;
      setTimeout(()=>{
        try{
          if(!frame?.contentWindow)cover?.classList.add('visible');
        }catch(_){}
      },5000);
    };

    panel.addEventListener('toggle',()=>{if(panel.open&&!loaded)loadGame()});
    panel.querySelectorAll('[data-r194-open]').forEach(btn=>btn.addEventListener('click',e=>{
      e.preventDefault();e.stopPropagation();window.open(URL,'_blank','noopener,noreferrer');
    }));
    panel.querySelector('[data-r194-reload]')?.addEventListener('click',e=>{e.preventDefault();loadGame()});

    page.appendChild(panel);
    return true;
  }

  function install(){
    mount();
    const base=window.renderSistema;
    if(typeof base==='function'&&!base.__stainherSystemGameR194){
      const wrapped=async function(...args){
        const out=await base.apply(this,args);
        mount();
        requestAnimationFrame(mount);
        setTimeout(mount,80);
        return out;
      };
      wrapped.__stainherSystemGameR194=true;
      wrapped.__base=base;
      window.renderSistema=wrapped;
      try{renderSistema=wrapped}catch(_){}
    }
  }

  window.StainherSystemGameR194=Object.freeze({install,mount});
  install();
  window.addEventListener('stainher:modules-ready',()=>{install();mount()});
  window.addEventListener('stainher:session-ready',()=>setTimeout(()=>{install();mount()},0));
})();
