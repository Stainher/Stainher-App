/* Stainher App V15.24 · R131 · Equipos: lista / fichas + acciones compactas
 * - Vista Lista como presentación inicial del módulo Equipos.
 * - Alternador Lista / Fichas sin alterar datos, permisos ni acciones existentes.
 * - La lista reutiliza las acciones ya renderizadas en cada ficha, preservando CRUD y RLS.
 * - R131 unifica Detalle / Editar y agrupa acciones destructivas bajo "Gestionar".
 * - Evita botones apilados y mantiene la misma jerarquía visual en Lista y Fichas.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_EQUIPMENT_VIEW_VERSION__==='R131')return;
  window.__STAINHER_EQUIPMENT_VIEW_VERSION__='R131';

  const PAGE_ID='page-equipos';
  const STYLE_ID='stainher-equipment-view-r120-style';
  const TOOLBAR_CLASS='stainher-equipment-view-toolbar-r120';
  const LIST_CLASS='stainher-equipment-list-r120';
  const GRID_MARKER='stainher-equipment-card-grid-r120';
  const ACTION_BAR='stainher-equipment-actionbar-r131';
  const SOURCE_ACTIONS='stainher-equipment-source-actions-r131';

  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const clean=v=>String(v??'').replace(/\s+/g,' ').trim();
  const esc=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function mountStyle(){
    if(document.getElementById(STYLE_ID))return;
    const style=document.createElement('style');
    style.id=STYLE_ID;
    style.textContent=`
      #${PAGE_ID} .${TOOLBAR_CLASS}{
        display:flex!important;
        align-items:center!important;
        justify-content:space-between!important;
        gap:12px!important;
        margin:0 0 14px!important;
        padding:10px 12px!important;
        border:1px solid var(--line,#2b3645)!important;
        border-radius:12px!important;
        background:var(--panel,#111922)!important;
      }
      #${PAGE_ID} .${TOOLBAR_CLASS} .stainher-equipment-view-label-r120{
        display:flex!important;
        align-items:center!important;
        gap:8px!important;
        min-width:0!important;
        color:var(--muted,#9aa6b2)!important;
        font-size:13px!important;
      }
      #${PAGE_ID} .${TOOLBAR_CLASS} .stainher-equipment-view-switch-r120{
        display:flex!important;
        gap:6px!important;
        flex:0 0 auto!important;
      }
      #${PAGE_ID} .${TOOLBAR_CLASS} .stainher-equipment-view-btn-r120{
        min-height:38px!important;
        min-width:92px!important;
        padding:8px 12px!important;
        border:1px solid var(--line,#3a4655)!important;
        border-radius:9px!important;
        background:var(--panel2,#16212d)!important;
        color:var(--text,#f5f7fa)!important;
        cursor:pointer!important;
      }
      #${PAGE_ID} .${TOOLBAR_CLASS} .stainher-equipment-view-btn-r120[aria-pressed="true"]{
        background:var(--blue,#1769c2)!important;
        border-color:var(--blue,#1769c2)!important;
        color:#fff!important;
      }

      #${PAGE_ID} .${LIST_CLASS}{
        display:grid!important;
        gap:8px!important;
        width:100%!important;
        min-width:0!important;
      }
      #${PAGE_ID} .stainher-equipment-list-head-r120,
      #${PAGE_ID} .stainher-equipment-list-row-r120{
        display:grid!important;
        grid-template-columns:minmax(170px,1.3fr) minmax(115px,.8fr) minmax(150px,1fr) minmax(155px,1fr) minmax(135px,.9fr) minmax(90px,.6fr) minmax(210px,1.2fr)!important;
        gap:12px!important;
        align-items:center!important;
      }
      #${PAGE_ID} .stainher-equipment-list-head-r120{
        padding:0 14px 7px!important;
        color:var(--muted,#9aa6b2)!important;
        font-size:12px!important;
      }
      #${PAGE_ID} .stainher-equipment-list-row-r120{
        padding:13px 14px!important;
        border:1px solid var(--line,#2b3645)!important;
        border-radius:12px!important;
        background:var(--panel,#111922)!important;
        color:var(--text,#f5f7fa)!important;
      }
      #${PAGE_ID} .stainher-equipment-list-primary-r120{
        min-width:0!important;
      }
      #${PAGE_ID} .stainher-equipment-list-primary-r120 strong{
        display:block!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
        font-weight:600!important;
      }
      #${PAGE_ID} .stainher-equipment-list-primary-r120 small,
      #${PAGE_ID} .stainher-equipment-list-cell-r120 small{
        display:block!important;
        margin-top:3px!important;
        color:var(--muted,#9aa6b2)!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }
      #${PAGE_ID} .stainher-equipment-list-cell-r120{
        min-width:0!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
      }
      #${PAGE_ID} .stainher-equipment-list-status-r120{
        display:inline-flex!important;
        align-items:center!important;
        width:max-content!important;
        max-width:100%!important;
        padding:4px 8px!important;
        border-radius:999px!important;
        background:rgba(16,185,129,.12)!important;
        color:#20d89b!important;
        font-size:12px!important;
      }
      #${PAGE_ID} .stainher-equipment-list-status-r120[data-state="retirado"],
      #${PAGE_ID} .stainher-equipment-list-status-r120[data-state="inactivo"]{
        background:rgba(244,63,94,.12)!important;
        color:#fb7185!important;
      }
      #${PAGE_ID} .stainher-equipment-list-plan-r120{
        display:inline-flex!important;
        max-width:100%!important;
        width:max-content!important;
        padding:4px 8px!important;
        border-radius:999px!important;
        background:rgba(16,185,129,.12)!important;
        color:#20d89b!important;
        font-size:12px!important;
        overflow:hidden!important;
        text-overflow:ellipsis!important;
        white-space:nowrap!important;
      }
      #${PAGE_ID} .stainher-equipment-list-actions-r120{
        display:flex!important;
        flex-wrap:nowrap!important;
        gap:6px!important;
        justify-content:flex-end!important;
        align-items:center!important;
        min-width:0!important;
      }
      #${PAGE_ID} .${ACTION_BAR}{
        display:flex!important;
        flex-wrap:nowrap!important;
        align-items:center!important;
        justify-content:flex-end!important;
        gap:6px!important;
        width:100%!important;
        min-width:0!important;
      }
      #${PAGE_ID} .equipment-card > .${ACTION_BAR}{
        margin-top:13px!important;
        padding-top:12px!important;
        border-top:1px solid var(--line,#2b3645)!important;
      }
      #${PAGE_ID} .${SOURCE_ACTIONS}{
        display:none!important;
      }
      #${PAGE_ID} [data-r131-source-action="1"]{
        display:none!important;
      }
      #${PAGE_ID} .${ACTION_BAR} .stainher-equipment-action-r131,
      #${PAGE_ID} .${ACTION_BAR} .stainher-equipment-manage-r131{
        min-height:34px!important;
        height:34px!important;
        padding:6px 10px!important;
        border-radius:8px!important;
        white-space:nowrap!important;
        font-size:12px!important;
        font-weight:650!important;
        line-height:1!important;
      }
      #${PAGE_ID} .${ACTION_BAR} .stainher-equipment-detail-r131{
        background:rgba(59,130,246,.16)!important;
        border-color:rgba(96,165,250,.45)!important;
        color:#bfdbfe!important;
      }
      #${PAGE_ID} .${ACTION_BAR} .stainher-equipment-edit-r131{
        background:rgba(249,115,22,.12)!important;
        border-color:rgba(251,146,60,.42)!important;
        color:#fed7aa!important;
      }
      #${PAGE_ID} .stainher-equipment-manage-wrap-r131{
        position:relative!important;
        flex:0 0 auto!important;
      }
      #${PAGE_ID} .stainher-equipment-manage-wrap-r131 > summary{
        list-style:none!important;
        user-select:none!important;
        display:inline-flex!important;
        align-items:center!important;
        gap:5px!important;
        cursor:pointer!important;
        background:var(--panel2,#16212d)!important;
        border:1px solid var(--line,#3a4655)!important;
        color:var(--text,#f5f7fa)!important;
      }
      #${PAGE_ID} .stainher-equipment-manage-wrap-r131 > summary::-webkit-details-marker{
        display:none!important;
      }
      #${PAGE_ID} .stainher-equipment-manage-wrap-r131[open] > summary{
        border-color:rgba(148,163,184,.62)!important;
      }
      #${PAGE_ID} .stainher-equipment-manage-menu-r131{
        position:absolute!important;
        z-index:40!important;
        top:calc(100% + 6px)!important;
        right:0!important;
        width:max-content!important;
        min-width:205px!important;
        max-width:min(280px,80vw)!important;
        display:grid!important;
        gap:4px!important;
        padding:6px!important;
        border:1px solid var(--line,#334155)!important;
        border-radius:10px!important;
        background:var(--panel,#111922)!important;
        box-shadow:0 14px 34px rgba(0,0,0,.34)!important;
      }
      #${PAGE_ID} .stainher-equipment-manage-menu-r131 button{
        width:100%!important;
        min-height:34px!important;
        padding:7px 9px!important;
        border:0!important;
        border-radius:7px!important;
        background:transparent!important;
        color:#fda4af!important;
        text-align:left!important;
        font-size:12px!important;
        white-space:normal!important;
      }
      #${PAGE_ID} .stainher-equipment-manage-menu-r131 button:hover{
        background:rgba(244,63,94,.12)!important;
      }

      #${PAGE_ID}[data-stainher-equipment-view="list"] .${GRID_MARKER}{
        display:none!important;
      }
      #${PAGE_ID}[data-stainher-equipment-view="cards"] .${LIST_CLASS}{
        display:none!important;
      }

      html[data-theme="light"] body #${PAGE_ID} .${TOOLBAR_CLASS},
      html[data-theme="light"] body #${PAGE_ID} .stainher-equipment-list-row-r120{
        background:#fff!important;
        color:#182230!important;
        border-color:#c7d1dd!important;
      }
      html[data-theme="light"] body #${PAGE_ID} .stainher-equipment-list-head-r120,
      html[data-theme="light"] body #${PAGE_ID} .stainher-equipment-list-primary-r120 small,
      html[data-theme="light"] body #${PAGE_ID} .stainher-equipment-list-cell-r120 small,
      html[data-theme="light"] body #${PAGE_ID} .stainher-equipment-view-label-r120{
        color:#5b6878!important;
      }
      html[data-theme="light"] body #${PAGE_ID} .stainher-equipment-view-btn-r120{
        background:#f8fafc!important;
        color:#182230!important;
        border-color:#c7d1dd!important;
      }
      html[data-theme="light"] body #${PAGE_ID} .stainher-equipment-view-btn-r120[aria-pressed="true"]{
        background:#1769c2!important;color:#fff!important;border-color:#1769c2!important;
      }

      @media(max-width:1180px){
        #${PAGE_ID} .stainher-equipment-list-head-r120{display:none!important}
        #${PAGE_ID} .stainher-equipment-list-row-r120{
          grid-template-columns:minmax(190px,1.4fr) minmax(140px,1fr) minmax(140px,1fr) minmax(230px,1.4fr)!important;
        }
        #${PAGE_ID} .stainher-equipment-list-cell-r120[data-r120-col="tipo"],
        #${PAGE_ID} .stainher-equipment-list-cell-r120[data-r120-col="estado"]{
          display:none!important;
        }
      }
      @media(max-width:760px){
        #${PAGE_ID} .${TOOLBAR_CLASS}{
          align-items:stretch!important;
          flex-direction:column!important;
        }
        #${PAGE_ID} .${TOOLBAR_CLASS} .stainher-equipment-view-switch-r120{
          width:100%!important;
        }
        #${PAGE_ID} .${TOOLBAR_CLASS} .stainher-equipment-view-btn-r120{
          flex:1 1 0!important;
        }
        #${PAGE_ID} .stainher-equipment-list-row-r120{
          grid-template-columns:minmax(0,1fr)!important;
          gap:9px!important;
        }
        #${PAGE_ID} .stainher-equipment-list-cell-r120[data-r120-col="tipo"],
        #${PAGE_ID} .stainher-equipment-list-cell-r120[data-r120-col="estado"]{
          display:block!important;
        }
        #${PAGE_ID} .stainher-equipment-list-actions-r120{
          justify-content:flex-start!important;
          padding-top:4px!important;
          overflow:visible!important;
        }
        #${PAGE_ID} .${ACTION_BAR}{
          justify-content:flex-start!important;
          flex-wrap:wrap!important;
        }
        #${PAGE_ID} .stainher-equipment-manage-wrap-r131{
          position:static!important;
        }
        #${PAGE_ID} .stainher-equipment-manage-menu-r131{
          left:0!important;
          right:auto!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function page(){return document.getElementById(PAGE_ID)}

  function equipmentCards(root=page()){
    return root?[...root.querySelectorAll('.equipment-card')]:[];
  }

  function findGrid(cards){
    if(!cards.length)return null;
    const parent=cards[0].parentElement;
    return parent&&cards.every(card=>card.parentElement===parent)?parent:null;
  }

  function findEquipmentForCard(card,index){
    const rows=Array.isArray(window.state?.equipos)?window.state.equipos:[];
    const title=clean(card.querySelector('h1,h2,h3,h4,.equipment-name')?.textContent||'');
    if(title){
      const match=rows.find(row=>norm(row?.nombre)===norm(title));
      if(match)return match;
    }
    return rows[index]||{};
  }

  function preventiveLabel(card){
    const elements=[...card.querySelectorAll('span,small,p,div')];
    const el=elements.find(node=>/plan\s+preventivo/i.test(clean(node.textContent||''))&&node.children.length===0);
    const text=clean(el?.textContent||'');
    if(text)return text.replace(/\s*[·•-]\s*/g,' · ');
    const match=clean(card.textContent||'').match(/Plan\s+preventivo\s*[·•-]?\s*\d+\s+actividades?/i);
    return match?.[0]||'Plan preventivo';
  }

  function actionKind(label){
    const value=norm(label);
    if(/eliminar|dar de baja|retirar/.test(value))return 'danger';
    if(/editar/.test(value))return 'edit';
    if(/detalle|ver ficha|ver detalle/.test(value))return 'detail';
    return 'other';
  }

  function sourceActionButtons(card){
    return [...card.querySelectorAll('button')].filter(btn=>{
      if(btn.closest('.'+ACTION_BAR))return false;
      const label=clean(btn.textContent||'');
      return label&&!btn.disabled&&!/nuevo equipo/i.test(label);
    });
  }

  function actionLabel(button){
    const label=clean(button.textContent||'Acción');
    if(norm(label)==='retirar')return 'Retirar · conservar historial';
    return label;
  }

  function proxyButton(button,kind){
    const clone=document.createElement('button');
    clone.type='button';
    clone.className='btn stainher-equipment-action-r131 '+(
      kind==='detail'?'stainher-equipment-detail-r131':
      kind==='edit'?'stainher-equipment-edit-r131':''
    );
    clone.textContent=kind==='detail'?'Detalle':kind==='edit'?'Editar':actionLabel(button);
    clone.dataset.r131Action=kind;
    clone.addEventListener('click',event=>{
      event.preventDefault();
      event.stopPropagation();
      button.click();
    });
    return clone;
  }

  function buildActionGroup(buttons){
    const group=document.createElement('div');
    group.className=ACTION_BAR;

    const buckets={detail:[],edit:[],danger:[],other:[]};
    buttons.forEach(button=>buckets[actionKind(button.textContent)].push(button));

    if(buckets.detail[0])group.appendChild(proxyButton(buckets.detail[0],'detail'));
    if(buckets.edit[0])group.appendChild(proxyButton(buckets.edit[0],'edit'));
    buckets.other.forEach(button=>group.appendChild(proxyButton(button,'other')));

    if(buckets.danger.length){
      const details=document.createElement('details');
      details.className='stainher-equipment-manage-wrap-r131';
      const summary=document.createElement('summary');
      summary.className='btn stainher-equipment-manage-r131';
      summary.textContent='Gestionar ▾';
      const menu=document.createElement('div');
      menu.className='stainher-equipment-manage-menu-r131';

      buckets.danger.forEach(button=>{
        const action=document.createElement('button');
        action.type='button';
        action.textContent=actionLabel(button);
        action.addEventListener('click',event=>{
          event.preventDefault();
          event.stopPropagation();
          details.open=false;
          button.click();
        });
        menu.appendChild(action);
      });
      details.append(summary,menu);
      group.appendChild(details);
    }
    return group;
  }

  function markSourceContainers(card,buttons){
    buttons.forEach(button=>{
      const container=button.closest('.actions,.stainher-crud-actions');
      if(container&&card.contains(container)){
        container.classList.add(SOURCE_ACTIONS);
      }else{
        button.dataset.r131SourceAction='1';
      }
    });
  }

  function organizeCardActions(card){
    const buttons=sourceActionButtons(card);
    if(!buttons.length)return;

    markSourceContainers(card,buttons);
    const signature=buttons.map(button=>clean(button.textContent||'')).join('|');
    const current=card.querySelector(':scope > .'+ACTION_BAR);
    if(current?.dataset.r131Signature===signature)return;

    current?.remove();
    const group=buildActionGroup(buttons);
    group.dataset.r131Signature=signature;
    card.appendChild(group);
  }

  function proxyActions(card){
    return buildActionGroup(sourceActionButtons(card));
  }

  function cell(label,col){
    const node=document.createElement('div');
    node.className='stainher-equipment-list-cell-r120';
    node.dataset.r120Col=col;
    node.textContent=label||'—';
    return node;
  }

  function buildRow(card,index){
    const rowData=findEquipmentForCard(card,index);
    const row=document.createElement('article');
    row.className='stainher-equipment-list-row-r120';
    row.dataset.equipmentId=String(rowData?.id||'');

    const primary=document.createElement('div');
    primary.className='stainher-equipment-list-primary-r120';
    const name=document.createElement('strong');
    name.textContent=rowData?.nombre||clean(card.querySelector('h1,h2,h3,h4')?.textContent||'Equipo');
    const location=document.createElement('small');
    location.textContent=rowData?.ubicacion||'Sin ubicación registrada';
    primary.append(name,location);

    const type=cell(rowData?.tipo||'—','tipo');

    const maker=document.createElement('div');
    maker.className='stainher-equipment-list-cell-r120';
    maker.dataset.r120Col='fabricante';
    maker.textContent=rowData?.fabricante||'Fabricante s/i';
    if(rowData?.modelo){
      const model=document.createElement('small');model.textContent=rowData.modelo;maker.appendChild(model);
    }

    const plan=document.createElement('div');
    plan.className='stainher-equipment-list-cell-r120';
    plan.dataset.r120Col='plan';
    const planBadge=document.createElement('span');
    planBadge.className='stainher-equipment-list-plan-r120';
    planBadge.textContent=preventiveLabel(card);
    plan.appendChild(planBadge);

    const status=cell('','estado');
    status.replaceChildren();
    const statusBadge=document.createElement('span');
    statusBadge.className='stainher-equipment-list-status-r120';
    const state=clean(rowData?.estado||'activo');
    statusBadge.dataset.state=norm(state);
    statusBadge.textContent=state||'activo';
    status.appendChild(statusBadge);

    const criticality=cell(rowData?.criticidad||'—','criticidad');

    const actions=document.createElement('div');
    actions.className='stainher-equipment-list-actions-r120';
    actions.dataset.r120Col='acciones';
    const group=proxyActions(card);
    if(group.children.length)actions.appendChild(group);

    row.append(primary,type,maker,plan,criticality,status,actions);
    return row;
  }

  function buildList(cards){
    const list=document.createElement('section');
    list.className=LIST_CLASS;
    list.setAttribute('aria-label','Lista de equipos');
    const head=document.createElement('div');
    head.className='stainher-equipment-list-head-r120';
    ['Equipo / ubicación','Tipo','Fabricante / modelo','Plan preventivo','Criticidad','Estado','Acciones'].forEach(label=>{
      const node=document.createElement('div');node.textContent=label;head.appendChild(node);
    });
    list.appendChild(head);
    cards.forEach((card,index)=>list.appendChild(buildRow(card,index)));
    return list;
  }

  function setView(root,view){
    const next=view==='cards'?'cards':'list';
    root.dataset.stainherEquipmentView=next;
    root.querySelectorAll('[data-r120-equipment-view]').forEach(button=>{
      const active=button.dataset.r120EquipmentView===next;
      button.setAttribute('aria-pressed',active?'true':'false');
    });
  }

  function ensureToolbar(root,grid){
    let toolbar=root.querySelector('.'+TOOLBAR_CLASS);
    if(toolbar)return toolbar;
    toolbar=document.createElement('div');
    toolbar.className=TOOLBAR_CLASS;
    toolbar.innerHTML=`
      <div class="stainher-equipment-view-label-r120"><span>Visualización</span><small>Lista por defecto · puedes alternar a fichas cuando lo necesites.</small></div>
      <div class="stainher-equipment-view-switch-r120" role="group" aria-label="Visualización de equipos">
        <button type="button" class="stainher-equipment-view-btn-r120" data-r120-equipment-view="list" aria-pressed="true">☷ Lista</button>
        <button type="button" class="stainher-equipment-view-btn-r120" data-r120-equipment-view="cards" aria-pressed="false">▦ Fichas</button>
      </div>`;
    toolbar.querySelectorAll('[data-r120-equipment-view]').forEach(button=>{
      button.addEventListener('click',()=>setView(root,button.dataset.r120EquipmentView));
    });
    grid.insertAdjacentElement('beforebegin',toolbar);
    return toolbar;
  }

  let busy=false,scheduled=false,installed=false;
  function enhance(){
    if(busy)return;
    const root=page();if(!root)return;
    const cards=equipmentCards(root),grid=findGrid(cards);
    if(!cards.length||!grid)return;

    busy=true;
    try{
      mountStyle();
      grid.classList.add(GRID_MARKER);
      ensureToolbar(root,grid);
      cards.forEach(organizeCardActions);

      const signature=cards.map(card=>[
        clean(card.querySelector('h1,h2,h3,h4')?.textContent||''),
        sourceActionButtons(card).map(button=>clean(button.textContent||'')).join('|'),
        clean(card.textContent||'')
      ].join('::')).join('||');
      const oldList=root.querySelector('.'+LIST_CLASS);
      if(!oldList||oldList.dataset.r120Signature!==signature){
        const nextList=buildList(cards);
        nextList.dataset.r120Signature=signature;
        oldList?.remove();
        grid.insertAdjacentElement('beforebegin',nextList);
      }

      if(!root.dataset.stainherEquipmentView)root.dataset.stainherEquipmentView='list';
      setView(root,root.dataset.stainherEquipmentView);
    }finally{busy=false}
  }

  function schedule(){
    if(scheduled)return;
    scheduled=true;
    requestAnimationFrame(()=>{scheduled=false;enhance()});
  }

  function install(){
    if(installed)return;installed=true;
    mountStyle();
    enhance();
    const root=page()||document.getElementById('appView')||document.body;
    new MutationObserver(mutations=>{
      if(busy)return;
      if(mutations.some(m=>[...m.addedNodes,...m.removedNodes].some(node=>node?.nodeType===1)))schedule();
    }).observe(root,{childList:true,subtree:true});
    window.addEventListener('stainher:modules-ready',schedule);
    window.addEventListener('stainher:runtime-r120-ready',schedule);
    setTimeout(schedule,250);
    setTimeout(schedule,1000);
  }

  window.StainherEquipmentViewR120={install,enhance,setView};
  window.StainherEquipmentViewR131={install,enhance,setView,organizeCardActions};
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();