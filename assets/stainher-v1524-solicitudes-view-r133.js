/* Stainher V15.24 · R133 · Solicitudes: vista reducida / maximizada.
 * - Vista Reducida como presentación inicial del historial.
 * - Alternador Reducido / Maximizado sin modificar datos, permisos ni acciones.
 * - Conserva justificativos, vacaciones, licencias y acciones existentes.
 */
(()=>{
  'use strict';
  const BUILD='20261023-r243-actions-inline-layout';
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
        grid-template-columns:minmax(0,.9fr) minmax(0,1fr) minmax(0,.85fr) minmax(0,1fr) minmax(0,.65fr) max-content!important;
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
        min-width:0!important;max-width:100%!important;
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

      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
        width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v154-request-actions{
        max-width:100%!important;box-sizing:border-box!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card > [data-r133-field]{
        overflow-wrap:anywhere!important;
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
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,.9fr) minmax(0,.7fr) max-content!important;
        }
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="approval"]{display:none!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:4!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{grid-column:5!important}
      }
      @media(max-width:900px){
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
          grid-template-columns:minmax(0,1fr) minmax(0,1fr) minmax(0,.8fr) max-content!important;
        }
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="type"]{display:none!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:3!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{
          grid-column:4!important;
          min-width:0!important;max-width:100%!important;
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
      /* Zoom-safe compact rows: actions must never occupy an overflowing implicit column. */
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
        grid-template-columns:repeat(5,minmax(0,1fr))!important;
        grid-auto-flow:row!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="period"]{grid-column:1!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="person"]{grid-column:2!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="type"]{grid-column:3!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="approval"]{grid-column:4!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:5!important}
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{
        grid-column:1/-1!important;grid-row:auto!important;
        min-width:0!important;width:100%!important;max-width:100%!important;
        justify-content:flex-end!important;flex-wrap:wrap!important;
      }
      @media(max-width:900px){
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="period"]{grid-column:1!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="person"]{grid-column:2!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:1!important}
      }
      /* R242: avoid excessive spacing and keep actions beside status. */
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
        grid-template-columns:minmax(120px,180px) minmax(120px,180px) minmax(105px,145px) minmax(140px,195px) minmax(90px,120px) max-content!important;
        column-gap:12px!important;justify-content:start!important;overflow:visible!important;
      }
      #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{
        grid-column:6!important;grid-row:1!important;width:auto!important;
        justify-content:flex-start!important;position:static!important;inset:auto!important;transform:none!important;
      }
      @media(max-width:1250px){
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{
          grid-template-columns:minmax(0,180px) minmax(0,180px) minmax(0,150px) minmax(0,190px)!important;
        }
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="period"]{grid-column:1!important;display:block!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="person"]{grid-column:2!important;display:block!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="type"]{grid-column:3!important;display:block!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="approval"]{grid-column:4!important;display:block!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:1!important;grid-row:2!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{grid-column:2/4!important;grid-row:2!important}
      }
      @media(max-width:700px){
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card{grid-template-columns:repeat(2,minmax(0,1fr))!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="type"]{grid-column:1!important;grid-row:auto!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="approval"]{grid-column:2!important;grid-row:auto!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card [data-r133-field="status"]{grid-column:1!important;grid-row:auto!important}
        #${PAGE_ID}[data-stainher-solicitudes-view="compact"] .v152-request-card .v154-request-actions{grid-column:2!important;grid-row:auto!important;flex-wrap:wrap!important}
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
      // Legacy styles create an implicit actions column beyond the card border.
      // Set an explicit grid directly on each card, overriding conflicting late CSS.
      const actions=card.querySelector('.v154-request-actions');
      if(!actions||!card.contains(actions))return;
      const important=(el,key,value)=>el.style.setProperty(key,value,'important');
      const width=card.getBoundingClientRect().width;
      const narrow=width<940;
      const columns=narrow?'repeat(2,minmax(0,1fr))':
        'minmax(0,160px) minmax(0,160px) minmax(0,125px) minmax(0,180px) minmax(0,110px) max-content';
      important(card,'display','grid');
      important(card,'grid-template-columns',columns);
      important(card,'column-gap','10px');
      important(card,'justify-content','start');
      important(card,'box-sizing','border-box');
      important(card,'min-width','0');
      important(card,'max-width','100%');
      important(card,'overflow','hidden');
      for(const [field,col] of [['period',1],['person',2],['type',3],['approval',4],['status',5]]){
        const node=card.querySelector('[data-r133-field="'+field+'"]');
        if(!node)continue;
        important(node,'grid-column',String(narrow?(field==='status'?1:field==='approval'?2:field==='type'?1:col):col));
        important(node,'grid-row',narrow?'auto':'1');
        important(node,'min-width','0');
      }
      important(actions,'grid-column',narrow?'2':'6');
      important(actions,'grid-row',narrow?'auto':'1');
      important(actions,'position','static');
      important(actions,'inset','auto');
      important(actions,'right','auto');
      important(actions,'left','auto');
      important(actions,'transform','none');
      important(actions,'margin','0');
      important(actions,'width','max-content');
      important(actions,'max-width','100%');
      important(actions,'min-width','0');
      important(actions,'display','flex');
      important(actions,'justify-content','flex-start');
      important(actions,'flex-wrap','wrap');
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
    window.addEventListener('resize',()=>{if(page()?.dataset.stainherSolicitudesView==='compact')requestAnimationFrame(()=>decorateCards())});
    window.addEventListener('stainher:modules-ready',()=>{wrapRender();enhance()});
    window.addEventListener('stainher:runtime-r133-ready',()=>{wrapRender();enhance()});
  }

  window.StainherSolicitudesViewR133=Object.freeze({install,enhance,setView});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();