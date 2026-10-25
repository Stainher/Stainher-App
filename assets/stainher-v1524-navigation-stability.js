/* Stainher App V15.24 · navegación, versión y paneles autoritativos. */
(()=>{
  'use strict';
  if(window.__STAINHER_NAVIGATION_STABILITY__)return;
  window.__STAINHER_NAVIGATION_STABILITY__=true;
  const VERSION='V15.24';
  const REVISION='R262';
  let activePage='inicio',sequence=0,baseNavigate=null,queued=false;

  function lockBrowserTitle(){
    const canonical=`Stainher App ${VERSION} ${REVISION}`;
    // The title descriptor is not guaranteed to live directly on Document.prototype.
    // Walk the real document prototype chain, otherwise the previous guard silently skipped.
    let proto=document,descriptor=null;
    while((proto=Object.getPrototypeOf(proto))){
      descriptor=Object.getOwnPropertyDescriptor(proto,'title');
      if(descriptor?.get&&descriptor?.set)break;
    }
    if(!descriptor?.get||!descriptor?.set)return false;
    const old=Object.getOwnPropertyDescriptor(document,'title');
    if(old?.get?.__stainherLocked)return true;
    const getter=function(){return canonical};
    getter.__stainherLocked=true;
    try{
      Object.defineProperty(document,'title',{
        configurable:true,enumerable:true,get:getter,
        set(){if(descriptor.get.call(document)!==canonical)descriptor.set.call(document,canonical)}
      });
      descriptor.set.call(document,canonical);
      return true;
    }catch(error){
      console.warn('[Stainher title guard]',error);
      return false;
    }
  }
  function ensureBrandChips(){
    if(document.getElementById('stainher-brand-chips-r206'))return;
    const style=document.createElement('style');
    style.id='stainher-brand-chips-r206';
    style.textContent=`
      html body .page .stainher-brand-chip-r206{
        display:inline-flex!important;align-items:center!important;
        background:linear-gradient(135deg,#e85d21,#bd360b)!important;
        color:#fff!important;-webkit-text-fill-color:#fff!important;
        border:1px solid #f48b54!important;border-radius:999px!important;
        padding:4px 10px!important;box-shadow:0 2px 6px rgba(164,55,16,.17)!important
      }
      html body .page .stainher-brand-chip-r206 *{color:#fff!important;-webkit-text-fill-color:#fff!important}
    `;
    document.head.appendChild(style);
  }
  function normalizeVersion(root=document){
    ensureBrandChips();
    root.querySelectorAll?.('.v151-mobile-title small,.v1514-global-meta span:first-child,.global-meta .meta-chip:first-child,.version-chip,.v15-version-chip,.v1513-version-meta span:first-child,[data-stainher-version]').forEach(node=>{
      if(node.matches?.('.v151-mobile-title small')){
        const mobile=`Stainher App · ${VERSION} · ${REVISION}`;
        if(node.textContent!==mobile)node.textContent=mobile;
        return;
      }
      const before=String(node.textContent||'');
      let after=before.replace(/V15\.\d+(?:\.\d+)*/gi,VERSION).replace(/\bR\d{2,4}\b/g,REVISION);
      if(/V15\.24/.test(after)&&!new RegExp('\\b'+REVISION+'\\b').test(after)&&node.closest('.global-meta,.v1514-global-meta,.v1513-version-meta'))after+=' · '+REVISION;
      if(after!==before)node.textContent=after;
    });
    // R206: los metadatos heredados pueden no usar las clases históricas.
    // Detectar solamente etiquetas cortas en la cabecera de cada módulo.
    root.querySelectorAll?.('.page[id^="page-"]').forEach(page=>{
      const candidates=[...page.children].slice(0,5).flatMap(section=>[section,...section.querySelectorAll('span,small,.meta-chip,.version-chip')]);
      candidates.forEach(node=>{
        if(node.children.length && node.matches('.page-header,header,.global-meta,.v1514-global-meta'))return;
        const value=String(node.textContent||'').trim();
        if(value.length>85)return;
        if(/^Stainher App\s*[·-]\s*V15\.\d+/i.test(value)){
          const next='Stainher App · '+VERSION+' · '+REVISION;
          if(node.textContent!==next)node.textContent=next;
          node.classList.add('stainher-brand-chip-r206');
        }else if(/^\d{2}[-/]\d{2}[-/]20\d{2}$/.test(value)){
          node.classList.add('stainher-brand-chip-r206');
        }
      });
    });
    document.title=`Stainher App ${VERSION} ${REVISION}`;
  }
  // R232: identify compact module command rows without changing their buttons or layout.
  function normalizeTopActionSurfaces(){
    document.querySelectorAll('.page[id^="page-"]').forEach(page=>{
      [...page.children].slice(0,10).forEach(panel=>{
        if(!panel.matches?.('div,section,nav,header'))return;
        if(panel.querySelector('table,form,input,textarea,canvas,svg'))return;
        const buttons=[...panel.querySelectorAll('button')];
        if(!buttons.length||buttons.length>7)return;
        const otherText=(panel.textContent||'').trim();
        if(otherText.length>200)return;
        const className=String(panel.className||'');
        if(/card|panel|modal|filter|stat|kpi|summary|header/i.test(className))return;
        panel.classList.add('stainher-top-action-surface-r232');
      });
    });
  }
  function normalizeEstandarizacionHeading(){
    // Renderers can create the heading outside #page-estandarizacion.
    // Restrict to headings with exact text; never rewrite names inside cards or forms.
    document.querySelectorAll('main h1,main h2,.main h1,.main h2,.page h1,.page h2,.topbar h1,.topbar h2').forEach(heading=>{
      if(heading.children.length)return;
      if(/^estandarizaci[oó]n$/i.test((heading.textContent||'').trim())&&heading.textContent!=='Estandarización')
        heading.textContent='Estandarización';
    });
  }
  function normalizeActionRows(){
    // R214: localizar la barra REAL mediante los botones visibles, no clases heredadas.
    const modules=[
      ['page-preventivo',/^(?:↓\\s*)?Informe$/i,/Importar Plan Matriz/i],
      ['page-equipos',/Nuevo equipo/i,null]
    ];
    modules.forEach(([id,primary,secondary])=>{
      const page=document.getElementById(id);
      if(!page)return;
      const buttons=[...page.querySelectorAll('button')].filter(button=>primary.test((button.textContent||'').trim()));
      buttons.forEach(button=>{
        let parent=button.parentElement;
        while(parent&&parent!==page){
          const secondaryExists=!secondary||[...parent.querySelectorAll('button')].some(btn=>secondary.test(btn.textContent||''));
          if(secondaryExists){
            parent.classList.add('stainher-actions-surface-r214');
            break;
          }
          parent=parent.parentElement;
        }
      });
    });
  }
  function normalizeCorrectivoSurfaces(){
    const page=document.getElementById('page-correctivo');
    if(page){
      [...page.querySelectorAll('button')].forEach(button=>{
        if(/^Confiabilidad$/i.test((button.textContent||'').trim())){
          button.classList.add('stainher-correctivo-tab-r214');
          const peers=[...button.parentElement?.querySelectorAll('button')||[]];
          button.classList.toggle('stainher-correctivo-tab-active-r214',
            peers.length>0 && !peers.some(x=>x!==button&&(x.matches('.active,[aria-selected="true"]'))));
        }
      });
      [...page.querySelectorAll('div,aside,p')].forEach(node=>{
        const txt=(node.textContent||'').trim();
        if(node.children.length<=3 && txt.length<105 && /^Período seleccionado\s*:/i.test(txt)){
          node.classList.add('stainher-correctivo-period-r214');
        }
      });
    }
    const root=document.getElementById('modalRoot')||document;
    [...root.querySelectorAll('label')].forEach(label=>{
      if(/^(Resumen ejecutivo|KPIs de confiabilidad|Gráficos|Historial de fallas\s*\/\s*intervenciones|Metodología de cálculo)$/i.test((label.textContent||'').trim())){
        label.classList.add('stainher-report-choice-r214');
      }
    });
  }
  function normalizeRemainingSurfaces(){
    const leadership=document.getElementById('page-liderazgo');
    if(leadership){
      [...leadership.querySelectorAll('div,section,aside')].forEach(node=>{
        const text=(node.textContent||'').trim();
        if(node.children.length<5 && text.length<95 && /^Período analizado\s*:/i.test(text))
          node.classList.add('stainher-period-surface-r214');
      });
      [...leadership.querySelectorAll('div,article,section')].forEach(node=>{
        const text=(node.textContent||'').trim();
        if(node.children.length<=5 && text.length<110 &&
          /^(PROGRAMADOS|REALIZADOS|PENDIENTES|VENCIDOS|CUMPLIMIENTO|EJECUCIONES LIBRES)\b/i.test(text))
          node.classList.add('stainher-leadership-kpi-r214');
      });
    }
    const modal=document.getElementById('modalRoot')||document;
    [...modal.querySelectorAll('label')].forEach(label=>{
      if(/^Trabajador$/i.test((label.textContent||'').trim())){
        const parent=label.parentElement;
        if(parent&&parent.querySelector('select'))parent.classList.add('stainher-turn-worker-r214');
      }
    });
  }
  function normalizeTurnEventTables(){
    const page=document.getElementById('page-turnos');
    if(!page)return;
    page.querySelectorAll('table').forEach(table=>{
      const headings=[...table.querySelectorAll('thead th')].map(x=>(x.textContent||'').trim().toLowerCase());
      if(headings.some(x=>x.includes('evento'))&&headings.some(x=>x.includes('detalle')||x.includes('motivo'))&&headings.some(x=>x.includes('fecha'))){
        table.classList.add('stainher-event-detail-table-r216');
        const group=table.closest('section,article,.panel,details')||table.parentElement;
        group?.classList.add('stainher-event-detail-group-r216');
      }
    });
  }
  function normalizeMobileTitle(){
    const title=document.getElementById('v151MobileTitle')||document.querySelector('.v151-mobile-title strong');
    if(!title)return;
    const value=String(title.textContent||'').replace(/\s+/g,' ').trim();
    const match=value.match(/^([^\p{L}\p{N}]+)(.+)$/u);
    if(!match)return;
    const icon=match[1].trim(),label=match[2].trim();
    if(!icon||!label)return;
    if(title.dataset.stainherTitleValue===value&&title.querySelector('.stainher-mobile-title-icon'))return;
    title.replaceChildren();
    const iconNode=document.createElement('span');iconNode.className='stainher-mobile-title-icon';iconNode.textContent=icon;
    const labelNode=document.createElement('span');labelNode.className='stainher-mobile-title-label';labelNode.textContent=label;
    title.append(iconNode,labelNode);title.dataset.stainherTitleValue=value;
  }
  function normalizeMenuOrder(){
    document.querySelectorAll('.nav').forEach(nav=>{
      const system=nav.querySelector('button[data-page="sistema"]');
      const users=nav.querySelector('button[data-page="usuarios"]');
      if(system&&users&&users.nextElementSibling!==system)users.insertAdjacentElement('afterend',system);
    });
  }
  function normalizeHome(){
    const page=document.getElementById('page-inicio');if(!page)return;
    const vacation=page.querySelector('#vacationBalanceHome');
    // Keep the current vacation balance visible.
    const clean=node=>String(node?.textContent||'').replace(/\s+/g,' ').trim();
    const direct=node=>{let current=node;while(current&&current.parentElement!==page)current=current.parentElement;return current||node};
    const panels=[...page.children].filter(node=>node.matches?.('details,.panel'));
    panels.filter(panel=>panel.id!=='vacationBalanceHome'&&!panel.querySelector('#vacationBalanceHome')&&/Saldo de vacaciones|Saldo vigente después de solicitudes aprobadas/i.test(clean(panel))).forEach(panel=>panel.remove());
    const alertNode=page.querySelector('.v153-home-alert-panel');
    const alertPanel=alertNode&&direct(alertNode.closest('details')||alertNode);
    const known=page.querySelector('[data-stainher-home-panel="staffing"],.stainher-home-staffing,.v1521-home-turn');
    const candidates=[...page.children].filter(node=>node.matches?.('details,.panel')&&node!==alertPanel&&!/Saldo de vacaciones/i.test(clean(node)));
    const staffingPanel=known&&direct(known.closest('details')||known)
      ||candidates.find(panel=>/Personal de turno hoy|Dotación en turno hoy|Ver programación|Cargando programación|Turno A|Turno C/i.test(clean(panel)))
      ||candidates.find(panel=>/^Detalles$/i.test(clean(panel.querySelector(':scope>summary .stainher-disclosure-title,:scope>summary'))))
      ||(candidates.length===1?candidates[0]:null);
    // Retire obsolete shortcut while keeping the staffing summary and all other actions.
    page.querySelectorAll('button,a,[role="button"]').forEach(control=>{
      if((control.textContent||'').trim()==='Ver programación')control.remove();
    });
    if(staffingPanel){
      if(staffingPanel.tagName==='DETAILS')staffingPanel.classList.remove('v1521-home-turn');
      else staffingPanel.classList.add('v1521-home-turn');
      staffingPanel.classList.add('stainher-home-staffing');
      staffingPanel.dataset.stainherHomePanel='staffing';
      staffingPanel.setAttribute('aria-label','Dotación en turno hoy');
      const summary=staffingPanel.querySelector(':scope>summary .stainher-disclosure-title,:scope>summary>span:first-of-type');
      if(summary){if(summary.textContent!=='Dotación en turno hoy')summary.textContent='Dotación en turno hoy';summary.dataset.stainherFixedTitle='staffing'}
      staffingPanel.querySelectorAll('h3').forEach(title=>{if(/Personal de turno hoy|Detalles/i.test(title.textContent||''))title.textContent='Dotación en turno hoy'});
    }
    page.querySelectorAll('details').forEach(details=>{
      const title=String(details.querySelector(':scope>summary')?.textContent||'').replace(/\s+/g,' ').trim();
      const content=String(details.querySelector(':scope>.stainher-disclosure-content')?.textContent||'').replace(/\s+/g,' ').trim();
      if(title==='Detalles'&&!content)details.remove();
    });
  }
  function enforcePage(page){
    if(!page||page==='__more')return;
    activePage=page;
    document.querySelectorAll('.page[id^="page-"]').forEach(node=>{
      const selected=node.id===`page-${page}`;
      node.classList.toggle('hidden',!selected);node.hidden=!selected;node.setAttribute('aria-hidden',String(!selected));
    });
    document.querySelectorAll('.nav button[data-page]').forEach(button=>button.classList.toggle('active',button.dataset.page===page));
    document.querySelectorAll('#v151MobileBottom button[data-v151-page]').forEach(button=>{
      const selected=button.dataset.v151Page===page;
      button.classList.toggle('active',selected);button.setAttribute('aria-current',selected?'page':'false');
    });
    normalizeVersion();normalizeEstandarizacionHeading();normalizeTopActionSurfaces();normalizeActionRows();normalizeCorrectivoSurfaces();normalizeRemainingSurfaces();normalizeTurnEventTables();normalizeTurnDayModalLabels();normalizeModernSurfaces();normalizeModernDarkFormPanels();normalizeMobileTitle();normalizeMenuOrder();normalizeHome();
  }
  async function navigate(page){
    if(!page||page==='__more')return false;
    const token=++sequence;enforcePage(page);
    try{
      const result=typeof baseNavigate==='function'?await baseNavigate(page):false;
      if(token===sequence){enforcePage(page);requestAnimationFrame(()=>token===sequence&&enforcePage(page));setTimeout(()=>token===sequence&&enforcePage(page),150)}
      return result;
    }catch(error){if(token===sequence)enforcePage(page);throw error}
  }
  function installNavigation(){
    const current=window.v1519Navigate;
    if(typeof current==='function'&&current!==navigate)baseNavigate=current;
    window.v1519Navigate=navigate;window.v1518Navigate=navigate;window.gotoPage=navigate;
  }
  function ensureModernSurfacePalette(){
    if(document.getElementById('stainher-modern-surface-palette-r259'))return;
    const style=document.createElement('style');
    style.id='stainher-modern-surface-palette-r259';
    style.textContent=`
      /* R259 - cards/panels only, never navigation, buttons or semantic statuses. */
      :is(html[data-theme="modern"],body[data-theme="modern"],html.theme-modern,body.theme-modern,html.modern,body.modern) .stainher-modern-surface-r259,
      :is(html[data-theme="modern"],body[data-theme="modern"],html.theme-modern,body.theme-modern,html.modern,body.modern) .stainher-modern-surface-r259{
        background:linear-gradient(100deg,#078fa6 0%,#1977ca 100%)!important;
        color:#fff!important;-webkit-text-fill-color:#fff!important;
        border-color:#b7d0e4!important;
      }
      :is(html[data-theme="modern"],body[data-theme="modern"],html.theme-modern,body.theme-modern,html.modern,body.modern) .stainher-modern-surface-r259 :is(h1,h2,h3,h4,h5,h6,p,label,small,span,strong):not(.badge):not([class*="status"]){
        color:#fff!important;-webkit-text-fill-color:#fff!important;
      }
      :is(html[data-theme="modern"],body[data-theme="modern"],html.theme-modern,body.theme-modern,html.modern,body.modern) .stainher-modern-surface-r259 > :is(table,div,section) {border-color:#b7d0e4}
    `;
    document.head.appendChild(style);
  }
  function normalizeModernSurfaces(){
    ensureModernSurfacePalette();
    const root=document.documentElement,body=document.body;
    const modern=[root,body].some(el=>el?.dataset?.theme==='modern'||/\\b(?:theme-modern|modern)\\b/.test(el?.className||''));
    if(!modern)return;
    const scopes=document.querySelectorAll('.page[id^="page-"],#modalRoot .modal,[role="dialog"]');
    scopes.forEach(scope=>scope.querySelectorAll('section,article,aside,.panel,.card,.stat-card,.kpi-card,.summary-card').forEach(node=>{
      if(node.classList.contains('stainher-modern-surface-r259'))return;
      if(node.closest('nav,.nav,aside.sidebar,.sidebar,header,.modal-header,.v1524-operational-totals,.v1524-detail-group'))return;
      if(node.matches('button,[role="button"],[class*="status"],[class*="badge"]'))return;
      if(node.querySelector('canvas,svg')&&node.children.length<3)return;
      const rect=node.getBoundingClientRect();
      if(rect.width<110||rect.height<42)return;
      const bg=getComputedStyle(node).backgroundColor.match(/^rgba?\\(([^)]+)\\)$/);
      if(!bg)return;
      const [red,green,blue,alpha=1]=bg[1].split(',').map(Number);
      if(alpha<.85||Math.max(red,green,blue)>52||Math.min(red,green,blue)>44)return;
      node.classList.add('stainher-modern-surface-r259');
    }));
  }
  function normalizeModernDarkFormPanels(){
    const modern=document.documentElement.dataset.theme==='modern'||document.body.dataset.theme==='modern';
    if(!modern)return;
    if(!document.getElementById('stainher-modern-form-panels-r265')){
      const style=document.createElement('style');style.id='stainher-modern-form-panels-r265';
      style.textContent=`
        html[data-theme="modern"] #modalRoot .stainher-modern-gradient-r265,
        body[data-theme="modern"] #modalRoot .stainher-modern-gradient-r265{
          background:linear-gradient(100deg,#078fa6 0%,#1977ca 100%)!important;
          background-image:linear-gradient(100deg,#078fa6 0%,#1977ca 100%)!important;
          border-color:#1586bd!important;color:#fff!important;-webkit-text-fill-color:#fff!important;
        }
        html[data-theme="modern"] #modalRoot .stainher-modern-gradient-r265 :is(label,small,span,strong,b),
        body[data-theme="modern"] #modalRoot .stainher-modern-gradient-r265 :is(label,small,span,strong,b){
          color:#fff!important;-webkit-text-fill-color:#fff!important;
        }
        html[data-theme="modern"] #modalRoot .stainher-modern-gradient-r265 :is(input:not([type="checkbox"]),select,textarea),
        body[data-theme="modern"] #modalRoot .stainher-modern-gradient-r265 :is(input:not([type="checkbox"]),select,textarea){
          background:#fff!important;color:#173753!important;-webkit-text-fill-color:#173753!important;
        }
      `;
      document.head.appendChild(style);
    }
    document.querySelectorAll('#modalRoot .modal, #modalRoot [role="dialog"]').forEach(modal=>{
      const nodes=modal.querySelectorAll('.v14-license-options label, form label:has(> select[name="user_id"]), form label:has(> select[name="supervisor_user_id"]), form label:has(> select[name="supervisor_nombre"])');
      nodes.forEach(n=>n.classList.add('stainher-modern-gradient-r265'));
      // Other inherited black form tiles; never restyle buttons, navigation or status chips.
      modal.querySelectorAll('form label, form fieldset').forEach(n=>{
        if(n.classList.contains('stainher-modern-gradient-r265'))return;
        const background=getComputedStyle(n).backgroundColor.match(/^rgba?\\(([^)]+)\\)$/);
        if(!background)return;
        const [r,g,b,a=1]=background[1].split(',').map(Number);
        if(a>=.9&&Math.max(r,g,b)<52)n.classList.add('stainher-modern-gradient-r265');
      });
    });
  }
  function normalizeTurnDayModalLabels(){
    // The selected-day summary uses dark navy panels but inherits a low-contrast label color.
    // R260: override the dark selected-day summary card itself.
    document.querySelectorAll('#modalRoot .modal, [role="dialog"]').forEach(modal=>{
      const leaf=[...modal.querySelectorAll('small,label,span,div,p')]
        .find(n=>n.children.length===0&&(n.textContent||'').trim().toUpperCase()==='TRABAJADOR SELECCIONADO');
      if(!leaf)return;
      let panel=leaf.parentElement;
      for(let k=0;k<3&&panel;k++,panel=panel.parentElement){
        const content=(panel.textContent||'').toUpperCase();
        if(content.includes('FECHA SELECCIONADA')&&content.includes('TURNO BASE')&&panel!==modal){
          panel.style.setProperty('background','linear-gradient(100deg,#078fa6 0%,#1977ca 100%)','important');
          panel.style.setProperty('background-image','linear-gradient(100deg,#078fa6 0%,#1977ca 100%)','important');
          panel.style.setProperty('border-color','#b7d0e4','important');
          panel.querySelectorAll('small,label,span,div,p,strong,b').forEach(n=>{
            n.style.setProperty('color','#fff','important');
            n.style.setProperty('-webkit-text-fill-color','#fff','important');
          });
          break;
        }
      }
    });
    document.querySelectorAll('#modalRoot .modal, [role="dialog"]').forEach(modal=>{
      const labels=new Set(['TRABAJADOR SELECCIONADO','FECHA SELECCIONADA','TURNO BASE']);
      const candidates=[...modal.querySelectorAll('small,label,span,div,p')].filter(node=>
        node.children.length===0&&labels.has((node.textContent||'').trim().toUpperCase()));
      if(!candidates.some(node=>(node.textContent||'').trim().toUpperCase()==='TRABAJADOR SELECCIONADO'))return;
      for(const node of candidates){
        node.style.setProperty('color','#c5dcf0','important');
        node.style.setProperty('-webkit-text-fill-color','#c5dcf0','important');
      }
    });
  }
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;normalizeVersion();normalizeEstandarizacionHeading();normalizeTopActionSurfaces();normalizeActionRows();normalizeCorrectivoSurfaces();normalizeRemainingSurfaces();normalizeTurnEventTables();normalizeTurnDayModalLabels();normalizeModernSurfaces();normalizeModernDarkFormPanels();normalizeMobileTitle();normalizeMenuOrder();normalizeHome();enforcePage(activePage)});
  }
  function boot(){
    lockBrowserTitle();installNavigation();normalizeMenuOrder();activePage=document.querySelector('.nav button.active[data-page]')?.dataset.page||activePage;enforcePage(activePage);
    document.addEventListener('click',event=>{
      const button=event.target.closest?.('#v151MobileBottom button[data-v151-page],.nav button[data-page]');
      const page=button?.dataset.v151Page||button?.dataset.page;
      if(!page||page==='__more')return;
      event.preventDefault();event.stopImmediatePropagation();navigate(page);
    },true);
    // Restore the canonical browser title when legacy modules overwrite it.
    // Observing <title> directly avoids running the full page normalizer for title changes.
    const browserTitle=document.querySelector('head > title');
    if(browserTitle){
      const canonicalTitle=`Stainher App ${VERSION} ${REVISION}`;
      new MutationObserver(()=>{if(document.title!==canonicalTitle)document.title=canonicalTitle})
        .observe(browserTitle,{childList:true,characterData:true,subtree:true});
    }
    new MutationObserver(records=>{if(records.some(record=>record.addedNodes.length||record.type==='characterData'))schedule()}).observe(document.body,{childList:true,subtree:true,characterData:true});
    window.addEventListener('stainher:modules-ready',()=>{installNavigation();normalizeMenuOrder();enforcePage(activePage)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
