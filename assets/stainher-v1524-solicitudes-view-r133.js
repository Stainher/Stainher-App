/* Stainher V15.24 · R133 · Solicitudes: vista reducida / maximizada.
 * - Vista Reducida como presentación inicial del historial.
 * - Alternador Reducido / Maximizado sin modificar datos, permisos ni acciones.
 * - Conserva justificativos, vacaciones, licencias y acciones existentes.
 */
(()=>{
  'use strict';
  const BUILD='20260928-r133-solicitudes-compact-expanded';
  if(window.__STAINHER_SOLICITUDES_VIEW_R133__===BUILD)return;
  window.__STAINHER_SOLICITUDES_VIEW_R133__=BUILD;

  const PAGE_ID='page-solicitudes';
  const STYLE_ID='stainher-solicitudes-view-r133-style';
  const TOOLBAR='stainher-solicitudes-view-toolbar-r133';
  const STORAGE_KEY='stainher.solicitudes.view';
  let installed=false;
  let wrapTimer=null;

  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

  function page(){return document.getElementById(PAGE_ID)}
  function currentView(){
    const root=page();
    if(root?.dataset.stainherSolicitudesView)return root.dataset.stainherSolicitudesView;
    try{
      const saved=localStorage.getItem(STORAGE_KEY);
      return saved==='expanded'?'expanded':'compact';
    }catch(_){return 'compact'}
  }

  function mountStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${PAGE_ID} .${TOOLBAR}{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
        margin:0 0 12px!important;
        padding:9px 11px!important;
        border:1px solid var(--line,#2b3645)!important;
        border-radius:11px!important;
        background:var(--panel,#111922)!important;
      }
      #${PAGE_ID} .stainher-solicitudes-view-label-r133{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        min-width:0!important;
        color:var(--muted,#9aa6b2)!important;
        font-size:12px!important;
      }
      #${PAGE_ID} .stainher-solicitudes-view-switch-r133{
        display:flex!important;
        flex:0 0 auto!important;
        gap:6px!important;
      }
      #${PAGE_ID} .stainher-solicitudes-view-btn-r133{
        min-height:34px!important;
        min-width:104px!important;
        padding:7px 11px!important;
        border:1px solid var(--line,#3a4655)!important;
        border-radius:8px!important;
        background:var(--panel2,#16212d)!important;
        color:var(--text,#f5f7fa)!important;
        cursor:pointer!important;
        white-space:nowrap!important;
      }
      #${PAGE_ID} .stainher-solicitudes-view-btn-r133[aria-pressed="true"]{
        background:var(--blue,#1769c2)!important;
        border-color:var(--blue,#1769c2)!important;
        color:#fff!important;
      }

      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-grid{
        display:grid!important;
        gap:6px!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
        display:grid!important;
        grid-template-columns:minmax(145px,.85fr) minmax(165px,1fr) minmax(150px,.9fr) minmax(150px,.9fr) minmax(88px,.55fr) minmax(220px,auto)!important;
        gap:7px 14px!important;
        align-items:center!important;
        min-height:0!important;
        padding:9px 11px!important;
        border-radius:10px!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card > [data-r133-field]{
        min-width:0!important;
        margin:0!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card small{
        display:block!important;
        margin:0 0 2px!important;
        font-size:9px!important;
        line-height:1.15!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card b,
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v152-request-type{
        font-size:13px!important;
        line-height:1.18!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="detail"],
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .wide,
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v1524-just-detail{
        display:none!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="period"]{grid-column:1!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="person"]{grid-column:2!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="type"]{grid-column:3!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="approval"]{grid-column:4!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:5!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{
        grid-column:6!important;
        grid-row:1!important;
        display:flex!important;
        align-items:center!important;
        justify-content:flex-end!important;
        flex-wrap:nowrap!important;
        gap:6px!important;
        min-width:220px!important;
        margin:0!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions .btn{
        min-height:32px!important;
        height:32px!important;
        width:auto!important;
        min-width:max-content!important;
        flex:0 0 auto!important;
        padding:6px 9px!important;
        font-size:11px!important;
        white-space:nowrap!important;
      }

      #${PAGE_ID}[data-stainher-solicitudes-view="expanded"] .v152-request-card{
        transition:none!important;
      }

      html[data-theme="light"] body #${PAGE_ID} .${TOOLBAR}{
        background:#fff!important;
        border-color:#c7d1dd!important;
      }
      html[data-theme="light"] body #${PAGE_ID} .stainher-solicitudes-view-label-r133{color:#5b6878!important}
      html[data-theme="light"] body #${PAGE_ID} .stainher-solicitudes-view-btn-r133{
        background:#f8fafc!important;color:#182230!important;border-color:#c7d1dd!important;
      }
      html[data-theme="light"] body #${PAGE_ID} .stainher-solicitudes-view-btn-r133[aria-pressed="true"]{
        background:#1769c2!important;color:#fff!important;border-color:#1769c2!important;
      }

      @media(max-width:1320px){
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
          grid-template-columns:minmax(140px,1fr) minmax(160px,1fr) minmax(145px,.9fr) minmax(90px,.6fr) minmax(220px,1.2fr)!important;
        }
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="approval"]{display:none!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:4!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{grid-column:5!important}
      }
      @media(max-width:900px){
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
          grid-template-columns:minmax(130px,1fr) minmax(150px,1fr) minmax(120px,.8fr) minmax(190px,1.2fr)!important;
        }
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="type"]{display:none!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:3!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{
          grid-column:4!important;
          min-width:190px!important;
        }
      }
      @media(max-width:680px){
        #${PAGE_ID} .${TOOLBAR}{align-items:stretch!important;flex-direction:column!important}
        #${PAGE_ID} .stainher-solicitudes-view-switch-r133{width:100%!important}
        #${PAGE_ID} .stainher-solicitudes-view-btn-r133{flex:1 1 0!important;min-width:0!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
          grid-template-columns:1fr 1fr!important;
          gap:7px 10px!important;
        }
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="period"]{grid-column:1!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="person"]{grid-column:2!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:1!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{
          grid-column:1/-1!important;
          grid-row:auto!important;
          justify-content:flex-start!important;
          flex-wrap:wrap!important;
          min-width:0!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function fieldKind(node){
    const label=norm(node.querySelector?.('small')?.textContent||'');
    if(label.startsWith('periodo'))return 'period';
    if(label.startsWith('persona'))return 'person';
    if(label.startsWith('tipo'))return 'type';
    if(label.startsWith('aprobacion'))return 'approval';
    if(label.startsWith('estado'))return 'status';
    if(/motivo|comentario|descripcion|destinatario|asunto/.test(label))return 'detail';
    return '';
  }

  function decorateCards(root=page()){
    if(!root)return;
    root.querySelectorAll('.v152-request-card').forEach(card=>{
      [...card.children].forEach(node=>{
        if(node.classList.contains('v154-request-actions'))return;
        const kind=fieldKind(node);
        if(kind)node.dataset.r133Field=kind;
        if(node.classList.contains('wide')||node.classList.contains('v1524-just-detail'))node.dataset.r133Field='detail';
      });
    });
  }

  function setView(view,{persist=true}={}){
    const root=page();if(!root)return;
    const next=view==='expanded'?'expanded':'compact';
    root.dataset.stainherSolicitudesView=next;
    root.querySelectorAll('[data-r133-solicitudes-view]').forEach(button=>{
      button.setAttribute('aria-pressed',button.dataset.r133SolicitudesView===next?'true':'false');
    });
    if(persist){
      try{localStorage.setItem(STORAGE_KEY,next)}catch(_){}
    }
  }

  function ensureToolbar(root=page()){
    if(!root)return null;
    let toolbar=root.querySelector('.'+TOOLBAR);
    if(toolbar)return toolbar;

    toolbar=document.createElement('div');
    toolbar.className=TOOLBAR;
    toolbar.innerHTML=`
      <div class="stainher-solicitudes-view-label-r133">
        <span>Visualización</span>
        <small>Reducido para revisión rápida · Maximizado para ver todo el detalle.</small>
      </div>
      <div class="stainher-solicitudes-view-switch-r133" role="group" aria-label="Visualización del historial de solicitudes">
        <button type="button" class="stainher-solicitudes-view-btn-r133" data-r133-solicitudes-view="compact" aria-pressed="true">☷ Reducido</button>
        <button type="button" class="stainher-solicitudes-view-btn-r133" data-r133-solicitudes-view="expanded" aria-pressed="false">▦ Maximizado</button>
      </div>`;
    toolbar.querySelectorAll('[data-r133-solicitudes-view]').forEach(button=>{
      button.addEventListener('click',()=>setView(button.dataset.r133SolicitudesView));
    });

    const panel=root.querySelector('.panel');
    if(panel)panel.insertAdjacentElement('beforebegin',toolbar);
    else{
      const topbar=root.querySelector('.topbar');
      if(topbar)topbar.insertAdjacentElement('afterend',toolbar);
      else root.prepend(toolbar);
    }
    return toolbar;
  }

  function enhance(){
    const root=page();if(!root)return false;
    mountStyle();
    ensureToolbar(root);
    decorateCards(root);
    setView(currentView(),{persist:false});
    return true;
  }

  function wrapRender(){
    const current=window.renderSolicitudesV15;
    if(typeof current!=='function'||current.__r133SolicitudesView)return false;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      enhance();
      requestAnimationFrame(enhance);
      return out;
    };
    wrapped.__r133SolicitudesView=true;
    wrapped.__base=current;
    window.renderSolicitudesV15=wrapped;
    try{renderSolicitudesV15=wrapped}catch(_){}
    return true;
  }

  function install(){
    mountStyle();
    wrapRender();
    if(!page()?.classList.contains('hidden'))enhance();
    if(wrapTimer)return;
    let tries=0;
    wrapTimer=setInterval(()=>{
      tries++;
      wrapRender();
      if(tries>=60){clearInterval(wrapTimer);wrapTimer=null}
    },150);
    window.addEventListener('stainher:modules-ready',()=>{wrapRender();enhance()});
    window.addEventListener('stainher:runtime-r133-ready',()=>{wrapRender();enhance()});
  }

  window.StainherSolicitudesViewR133=Object.freeze({install,enhance,setView});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();