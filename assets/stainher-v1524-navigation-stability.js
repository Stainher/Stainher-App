/* Stainher App V15.24 · navegación, versión y paneles autoritativos. */
(()=>{
  'use strict';
  if(window.__STAINHER_NAVIGATION_STABILITY__)return;
  window.__STAINHER_NAVIGATION_STABILITY__=true;
  const VERSION='V15.24';
  const REVISION='R220';
  let activePage='inicio',sequence=0,baseNavigate=null,queued=false;

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
    document.title=`Stainher App ${VERSION}`;
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
    normalizeVersion();normalizeActionRows();normalizeCorrectivoSurfaces();normalizeRemainingSurfaces();normalizeTurnEventTables();normalizeMobileTitle();normalizeMenuOrder();normalizeHome();
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
  function schedule(){
    if(queued)return;queued=true;
    requestAnimationFrame(()=>{queued=false;normalizeVersion();normalizeActionRows();normalizeCorrectivoSurfaces();normalizeRemainingSurfaces();normalizeTurnEventTables();normalizeMobileTitle();normalizeMenuOrder();normalizeHome();enforcePage(activePage)});
  }
  function boot(){
    installNavigation();normalizeMenuOrder();activePage=document.querySelector('.nav button.active[data-page]')?.dataset.page||activePage;enforcePage(activePage);
    document.addEventListener('click',event=>{
      const button=event.target.closest?.('#v151MobileBottom button[data-v151-page],.nav button[data-page]');
      const page=button?.dataset.v151Page||button?.dataset.page;
      if(!page||page==='__more')return;
      event.preventDefault();event.stopImmediatePropagation();navigate(page);
    },true);
    new MutationObserver(records=>{if(records.some(record=>record.addedNodes.length||record.type==='characterData'))schedule()}).observe(document.body,{childList:true,subtree:true,characterData:true});
    window.addEventListener('stainher:modules-ready',()=>{installNavigation();normalizeMenuOrder();enforcePage(activePage)});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
