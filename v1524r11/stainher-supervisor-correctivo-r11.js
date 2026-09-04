/* Stainher App V15.24 · r11 · Correctivo Supervisor estable
 * Supervisor: historial correctivo siempre visible, sin depender de pestañas heredadas.
 */
(function installSupervisorCorrectivoHistoryR11(){
  if(window.__STAINHER_SUPERVISOR_HISTORY_FINAL_R11_V2__)return;
  window.__STAINHER_SUPERVISOR_HISTORY_FINAL_R11_V2__=true;

  const norm=v=>String(v||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();
  const txt=el=>String(el?.textContent||'').replace(/\s+/g,' ').trim();
  const isSupervisor=()=>{try{return norm(window.v11Role?.()||window.state?.profile?.rol||'')==='supervisor'}catch(_){return false}};
  const isMobile=()=>window.matchMedia?.('(max-width:900px)').matches!==false;

  function installStyle(){
    if(document.getElementById('stainher-supervisor-history-final-r11-style-v2'))return;
    const s=document.createElement('style');
    s.id='stainher-supervisor-history-final-r11-style-v2';
    s.textContent=`
      #page-correctivo.stainher-supervisor-history-final-r11 .stainher-r11-supervisor-hidden{display:none!important}
      #page-correctivo.stainher-supervisor-history-final-r11 #v153CorrReliability{display:none!important}
      #page-correctivo.stainher-supervisor-history-final-r11 #v153CorrHistory{display:block!important}
      #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-kpi-summary-r11{display:none!important}
      .stainher-supervisor-history-cards-r11{display:none}
      @media(max-width:900px){
        #page-correctivo.stainher-supervisor-history-final-r11 .corr-history-v8,
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-corr-history-r10 table,
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-corr-mobile-cards-r10{display:none!important}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-cards-r11{display:grid!important;gap:12px;width:100%;min-width:0}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-card-r11{border:1px solid var(--line,#d2dbe6);border-radius:14px;padding:14px;background:var(--panel,#fff);min-width:0;overflow:hidden}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-head-r11{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding-bottom:10px;margin-bottom:8px;border-bottom:1px solid var(--line,#d2dbe6)}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-head-r11 b{font-size:16px;line-height:1.25;overflow-wrap:anywhere}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-head-r11 span{font-size:12px;color:var(--muted,#64748b);white-space:nowrap}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-field-r11{display:grid;grid-template-columns:minmax(92px,34%) minmax(0,1fr);gap:10px;padding:7px 0;border-bottom:1px solid rgba(148,163,184,.18);min-width:0}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-field-r11:last-child{border-bottom:0}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-label-r11{font-size:11px;font-weight:700;color:var(--muted,#64748b);text-transform:uppercase;letter-spacing:.03em;line-height:1.35}
        #page-correctivo.stainher-supervisor-history-final-r11 .stainher-supervisor-history-value-r11{font-size:14px;line-height:1.45;overflow-wrap:anywhere;white-space:normal;min-width:0}
      }
    `;
    document.head.appendChild(s);
  }

  function forceHistoryVisible(page){
    if(!isSupervisor())return;
    page.classList.add('stainher-supervisor-history-final-r11');
    const hist=document.getElementById('v153CorrHistory');
    const rel=document.getElementById('v153CorrReliability');
    if(hist?.classList.contains('hidden')){
      try{if(typeof window.v153SetCorrTab==='function')window.v153SetCorrTab('historial');else if(typeof v153SetCorrTab==='function')v153SetCorrTab('historial')}catch(_){ }
    }
    rel?.classList.add('hidden');
    hist?.classList.remove('hidden');
    if(hist)hist.style.display='block';

    page.querySelectorAll('button').forEach(btn=>{
      const t=txt(btn);
      if(/^Confiabilidad$/i.test(t)||/Generar informe/i.test(t)||/Importar.*(?:Excel|CSV)/i.test(t)||/Historial de intervenciones/i.test(t)){
        if(/Historial de intervenciones/i.test(t))btn.classList.add('active');
        btn.classList.add('stainher-r11-supervisor-hidden');
        btn.setAttribute('aria-hidden','true');
        btn.tabIndex=-1;
      }
    });
  }

  function findHistory(){
    const page=document.getElementById('page-correctivo');if(!page)return null;
    const heading=[...page.querySelectorAll('h2,h3,h4,summary')].find(h=>/Historial del per[ií]odo/i.test(txt(h)));
    let panel=heading?.closest?.('.panel,details,section,article')||heading?.parentElement||null;
    let table=panel?.querySelector?.('table')||null;
    if(!table){
      table=[...page.querySelectorAll('table')].find(t=>{
        const hs=[...t.querySelectorAll('thead th')].map(txt).join('|');
        return /Fecha/i.test(hs)&&/Equipo/i.test(hs)&&(/Duraci/i.test(hs)||/Estado/i.test(hs));
      })||null;
      panel=table?.closest?.('.panel,details,section,article')||table?.parentElement||null;
    }
    return table&&panel?{page,panel,table,heading}:null;
  }

  function renameHeading(heading){
    if(!heading)return;
    const current=txt(heading);
    if(/Historial del per[ií]odo correctivo/i.test(current))return;
    const node=[...heading.childNodes].find(n=>n.nodeType===3&&/Historial del per[ií]odo/i.test(n.nodeValue||''));
    if(node)node.nodeValue=(node.nodeValue||'').replace(/Historial del per[ií]odo/i,'Historial del período correctivo');
    else heading.textContent='Historial del período correctivo';
  }

  function sanitizeHistory(found){
    const {panel,table,heading}=found;
    renameHeading(heading);
    [...panel.children].forEach(el=>{
      if(el!==heading&&/evento\(s\).*excluido\(s\).*KPI/i.test(txt(el)))el.classList.add('stainher-supervisor-kpi-summary-r11');
    });
    const headers=[...table.querySelectorAll('thead th')],hide=[];
    headers.forEach((th,i)=>{
      if(/Excluir KPI|Motivo|Acci[oó]n/i.test(txt(th))){hide.push(i);th.classList.add('stainher-r11-supervisor-hidden')}
    });
    table.querySelectorAll('tbody tr').forEach(tr=>[...tr.children].forEach((td,i)=>{if(hide.includes(i))td.classList.add('stainher-r11-supervisor-hidden')}));
  }

  let rendering=false,lastSignature='';
  function renderCards(found){
    if(!isMobile()||rendering)return;
    const {panel,table}=found;
    const headers=[...table.querySelectorAll('thead th')].map(txt);
    if(!headers.length)return;
    const allowed=headers.map((label,i)=>({label,i})).filter(x=>!/Excluir KPI|Motivo|Acci[oó]n/i.test(x.label));
    const rows=[...table.querySelectorAll('tbody tr')];
    const signature=allowed.map(x=>x.label).join('|')+'::'+rows.map(r=>txt(r)).join('||');
    const old=panel.querySelector(':scope > .stainher-supervisor-history-cards-r11');
    if(old&&signature===lastSignature)return;
    rendering=true;
    try{
      old?.remove();
      const cards=document.createElement('div');cards.className='stainher-supervisor-history-cards-r11';
      if(!rows.length){const e=document.createElement('div');e.className='empty';e.textContent='Sin averías para el período seleccionado.';cards.appendChild(e)}
      rows.forEach(row=>{
        const cells=[...row.children];
        if(cells.length===1&&/Sin atenciones|Sin averías/i.test(txt(row)))return;
        const get=key=>allowed.find(x=>norm(x.label).includes(norm(key)))?.i;
        const ei=get('equipo'),fi=get('fecha');
        const card=document.createElement('article');card.className='stainher-supervisor-history-card-r11';
        const head=document.createElement('div');head.className='stainher-supervisor-history-head-r11';
        const b=document.createElement('b');b.textContent=ei!=null?txt(cells[ei])||'Avería':'Avería';
        const d=document.createElement('span');d.textContent=fi!=null?txt(cells[fi]):'';
        head.append(b,d);card.appendChild(head);
        allowed.forEach(({label,i})=>{
          if(i===ei||i===fi||!cells[i])return;
          const field=document.createElement('div');field.className='stainher-supervisor-history-field-r11';
          const lab=document.createElement('div');lab.className='stainher-supervisor-history-label-r11';lab.textContent=label;
          const val=document.createElement('div');val.className='stainher-supervisor-history-value-r11';
          if(/Estado final/i.test(label)){
            const status=cells[i].querySelector('.status');
            if(status)val.appendChild(status.cloneNode(true));else val.textContent=txt(cells[i]);
          }else val.textContent=txt(cells[i])||'—';
          field.append(lab,val);card.appendChild(field);
        });
        cards.appendChild(card);
      });
      panel.appendChild(cards);lastSignature=signature;
    }finally{rendering=false}
  }

  function apply(){
    const page=document.getElementById('page-correctivo');if(!page)return;
    if(!isSupervisor())return;
    forceHistoryVisible(page);
    const found=findHistory();if(!found)return;
    sanitizeHistory(found);
    renderCards(found);
  }

  function boot(){
    installStyle();apply();
    const root=document.getElementById('page-correctivo')||document.body;
    let pending=false;
    new MutationObserver(()=>{
      if(rendering||pending)return;pending=true;
      requestAnimationFrame(()=>{pending=false;apply()});
    }).observe(root,{childList:true,subtree:true,characterData:true,attributes:true,attributeFilter:['class']});
    window.addEventListener('resize',apply,{passive:true});
    let n=0;const timer=setInterval(()=>{apply();if(++n>50)clearInterval(timer)},100);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
  window.addEventListener('stainher:modules-ready',()=>setTimeout(apply,0));
})();
