/* Stainher App V15.24 · Correctivo r10
 * - Respeta permisos personalizados por usuario antes que el permiso base del rol.
 * - Corrige el acceso a Registrar avería cuando Correctivo = editar.
 * - Convierte el Historial del período a tarjetas legibles en móvil.
 */
(function installCorrectivoR10(){
  if(window.__STAINHER_CORRECTIVO_R10__) return;
  window.__STAINHER_CORRECTIVO_R10__=true;

  const EDIT_VALUES=new Set(['editar','edit','edicion','edición','ver y editar','ver_editar','write','rw']);
  const VIEW_VALUES=new Set(['ver','view','lectura','read','ro']);
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().trim();

  function profile(){
    try{return window.state?.profile||null}catch(_){return null}
  }
  function effectivePermission(){
    const p=profile();
    const direct=p?.permisos?.correctivo;
    if(direct!=null && String(direct).trim()!=='') return norm(direct);
    try{
      if(typeof window.v11Permission==='function'){
        const v=window.v11Permission('correctivo');
        if(v!=null&&String(v).trim()!=='')return norm(v);
      }
    }catch(_){ }
    try{
      if(typeof window.canEditV11==='function'&&window.canEditV11('correctivo'))return 'editar';
      if(typeof window.canViewV11==='function'&&window.canViewV11('correctivo'))return 'ver';
    }catch(_){ }
    return 'ninguno';
  }
  function canEdit(){return EDIT_VALUES.has(effectivePermission())}
  function canView(){const p=effectivePermission();return EDIT_VALUES.has(p)||VIEW_VALUES.has(p)}

  window.v1524CorrectivoPermission=effectivePermission;
  window.v1524CanEditCorrectivo=canEdit;

  function installCanHelper(){
    const fn=function(){return canEdit()};
    fn.__stainherCorrectivoR10=true;
    window.v15CanMobileCorrective=fn;
    try{v15CanMobileCorrective=fn}catch(_){ }
  }

  let wrappedBase=null;
  function installOpenWrapper(){
    let current=window.v15OpenCorrectiveMobile;
    if(typeof current!=='function')return false;
    if(current.__stainherCorrectivoR10)return true;
    wrappedBase=current;
    const wrapped=function(){
      if(!canEdit()){
        window.toast?.('Correctivo está en modo solo lectura.','error');
        return;
      }
      installCanHelper();
      return wrappedBase.apply(this,arguments);
    };
    wrapped.__stainherCorrectivoR10=true;
    wrapped.__base=current;
    window.v15OpenCorrectiveMobile=wrapped;
    try{v15OpenCorrectiveMobile=wrapped}catch(_){ }
    return true;
  }

  function installStyle(){
    if(document.getElementById('stainher-correctivo-r10-style'))return;
    const s=document.createElement('style');
    s.id='stainher-correctivo-r10-style';
    s.textContent=`
      .stainher-corr-mobile-cards-r10{display:none}
      @media(max-width:900px){
        #page-correctivo .stainher-corr-history-r10 table{display:none!important}
        #page-correctivo .stainher-corr-history-r10 .stainher-corr-mobile-cards-r10{display:grid!important;gap:12px;width:100%;min-width:0}
        #page-correctivo .stainher-corr-card-r10{border:1px solid var(--line,#d2dbe6);border-radius:14px;padding:14px;background:var(--panel,#fff);min-width:0;overflow:hidden}
        #page-correctivo .stainher-corr-card-head-r10{display:flex;align-items:flex-start;justify-content:space-between;gap:12px;padding-bottom:10px;margin-bottom:8px;border-bottom:1px solid var(--line,#d2dbe6)}
        #page-correctivo .stainher-corr-card-head-r10 b{font-size:16px;line-height:1.25;overflow-wrap:anywhere;word-break:normal}
        #page-correctivo .stainher-corr-card-head-r10 span{font-size:12px;color:var(--muted,#64748b);white-space:nowrap}
        #page-correctivo .stainher-corr-field-r10{display:grid;grid-template-columns:minmax(92px,34%) minmax(0,1fr);gap:10px;align-items:start;padding:7px 0;border-bottom:1px solid rgba(148,163,184,.18);min-width:0}
        #page-correctivo .stainher-corr-field-r10:last-child{border-bottom:0}
        #page-correctivo .stainher-corr-label-r10{font-size:11px;font-weight:700;color:var(--muted,#64748b);text-transform:uppercase;letter-spacing:.03em;line-height:1.35}
        #page-correctivo .stainher-corr-value-r10{min-width:0;font-size:14px;line-height:1.45;overflow-wrap:anywhere;word-break:normal;white-space:normal}
        #page-correctivo .stainher-corr-value-r10 button,#page-correctivo .stainher-corr-value-r10 .btn{max-width:100%;white-space:normal}
        #page-correctivo .stainher-corr-value-r10 input[type=checkbox]{width:24px;height:24px;margin:0}
        #page-correctivo .stainher-corr-history-r10{min-width:0!important;overflow:visible!important}
        #page-correctivo .stainher-corr-history-r10>div{max-width:100%;min-width:0}
      }
    `;
    document.head.appendChild(s);
  }

  function headerText(th){return String(th?.textContent||'').replace(/\s+/g,' ').trim()}
  function findHistoryTable(){
    const page=document.getElementById('page-correctivo');if(!page)return null;
    const panels=[...page.querySelectorAll('.panel,details,section,article,div')];
    let panel=panels.find(p=>{
      const h=p.querySelector?.('h2,h3,h4,summary');
      return h&&/Historial del per[ií]odo/i.test(h.textContent||'')&&p.querySelector('table');
    });
    if(!panel){
      const tables=[...page.querySelectorAll('table')];
      const table=tables.find(t=>{
        const hs=[...t.querySelectorAll('thead th')].map(headerText).join('|');
        return /Fecha/i.test(hs)&&/Equipo/i.test(hs)&&(/Duraci/i.test(hs)||/Estado/i.test(hs));
      });
      panel=table?.closest('.panel,details,section,article,div')||table?.parentElement||null;
    }
    const table=panel?.querySelector?.('table')||null;
    return table?{panel,table}:null;
  }

  function syncClonedControls(source,clone){
    const src=[...source.querySelectorAll('button,input,select,textarea,a')];
    const dst=[...clone.querySelectorAll('button,input,select,textarea,a')];
    dst.forEach((el,i)=>{
      const original=src[i];if(!original)return;
      if(el.matches('input[type="checkbox"],input[type="radio"]'))el.checked=original.checked;
      else if('value' in el && 'value' in original)el.value=original.value;
      if(el.tagName==='BUTTON'||el.tagName==='A'){
        el.removeAttribute('onclick');
        el.addEventListener('click',ev=>{ev.preventDefault();ev.stopPropagation();original.click()});
      }else{
        const copy=()=>{
          if(el.matches('input[type="checkbox"],input[type="radio"]'))original.checked=el.checked;
          else if('value' in original)original.value=el.value;
          original.dispatchEvent(new Event('input',{bubbles:true}));
          original.dispatchEvent(new Event('change',{bubbles:true}));
        };
        el.addEventListener('change',copy);el.addEventListener('input',copy);
      }
    });
  }

  let rendering=false,lastSignature='';
  function renderMobileHistory(){
    if(rendering)return;
    const found=findHistoryTable();if(!found)return;
    const {panel,table}=found;
    const headers=[...table.querySelectorAll('thead th')].map(headerText);
    if(!headers.length)return;
    const rows=[...table.querySelectorAll('tbody tr')];
    const signature=headers.join('|')+'::'+rows.map(r=>r.textContent?.replace(/\s+/g,' ').trim()).join('||');
    const existing=panel.querySelector(':scope > .stainher-corr-mobile-cards-r10');
    if(existing&&signature===lastSignature)return;
    rendering=true;
    try{
      panel.classList.add('stainher-corr-history-r10');
      existing?.remove();
      const cards=document.createElement('div');cards.className='stainher-corr-mobile-cards-r10';
      if(!rows.length){
        const empty=document.createElement('div');empty.className='empty';empty.textContent='Sin averías para el período seleccionado.';cards.appendChild(empty);
      }
      rows.forEach(row=>{
        const cells=[...row.children];
        const values=headers.map((label,i)=>({label,cell:cells[i]})).filter(x=>x.cell);
        const byLabel=key=>values.find(x=>norm(x.label).includes(norm(key)))?.cell;
        const team=byLabel('equipo');const date=byLabel('fecha');
        const card=document.createElement('article');card.className='stainher-corr-card-r10';
        const head=document.createElement('div');head.className='stainher-corr-card-head-r10';
        const title=document.createElement('b');title.textContent=String(team?.textContent||'Avería').replace(/\s+/g,' ').trim()||'Avería';
        const when=document.createElement('span');when.textContent=String(date?.textContent||'').replace(/\s+/g,' ').trim();
        head.append(title,when);card.appendChild(head);
        values.forEach(({label,cell})=>{
          if(/^(equipo|fecha)$/i.test(norm(label)))return;
          const field=document.createElement('div');field.className='stainher-corr-field-r10';
          const lab=document.createElement('div');lab.className='stainher-corr-label-r10';lab.textContent=label||'Dato';
          const val=document.createElement('div');val.className='stainher-corr-value-r10';
          const clone=cell.cloneNode(true);while(clone.firstChild)val.appendChild(clone.firstChild);
          syncClonedControls(cell,val);
          field.append(lab,val);card.appendChild(field);
        });
        cards.appendChild(card);
      });
      panel.appendChild(cards);lastSignature=signature;
    }finally{rendering=false}
  }

  function interceptRegisterButtons(){
    document.addEventListener('click',ev=>{
      const btn=ev.target?.closest?.('button');if(!btn)return;
      const text=String(btn.textContent||'').replace(/\s+/g,' ').trim();
      const isDirect=btn.id==='v1524SupervisorAveriaNav'||btn.dataset?.supervisorAction==='registrar-averia';
      const isPage=document.getElementById('page-correctivo')?.contains(btn)&&/Registrar (aver[ií]a|incidente)/i.test(text);
      if(!isDirect&&!isPage)return;
      if(!canEdit())return;
      ev.preventDefault();ev.stopPropagation();if(ev.stopImmediatePropagation)ev.stopImmediatePropagation();
      installCanHelper();installOpenWrapper();
      window.v15OpenCorrectiveMobile?.();
    },true);
  }

  function boot(){
    installStyle();installCanHelper();installOpenWrapper();interceptRegisterButtons();renderMobileHistory();
    const page=document.getElementById('page-correctivo')||document.body;
    let pending=false;
    new MutationObserver(()=>{
      if(pending||rendering)return;pending=true;
      requestAnimationFrame(()=>{pending=false;installCanHelper();installOpenWrapper();renderMobileHistory()});
    }).observe(page,{childList:true,subtree:true,characterData:true});
    let n=0;const timer=setInterval(()=>{installCanHelper();installOpenWrapper();renderMobileHistory();if(++n>40)clearInterval(timer)},250);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
