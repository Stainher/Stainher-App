/* Stainher V15.24 · R149 · Certificación trimestral en EDP.
 * EP17 / octubre 2026 incorpora actividad contractual periódica de certificación
 * por $12.009.072, adicional al mantenimiento base de $30.843.324.
 */
(()=>{
  'use strict';
  const BUILD='20261019-r149-edp-quarterly-certification';
  if(window.__STAINHER_EDP_QUARTERLY_R149__===BUILD)return;
  window.__STAINHER_EDP_QUARTERLY_R149__=BUILD;

  const ITEMS={
    asea:{item:90,label:'HUINCHE ASEA (Concentradora)',amount:2900230},
    otis:{item:170,label:'HUINCHE OTIS',amount:2900230},
    alimak:{item:230,label:'HUINCHE ALIMAK',amount:940304},
    ptp:{item:340,label:'Huinche Tercer Panel (PTP)',amount:2900230},
    '3700':{item:400,label:'Nodo 3700',amount:1066214},
    eila:{item:480,label:'Ascensor EILA 1 y 2',amount:816650},
    hilton:{item:520,label:'Montacargas Hilton (EQUIPOS 2 Y 3)',amount:485214}
  };
  const TOTAL_CERT=Object.values(ITEMS).reduce((s,x)=>s+x.amount,0);
  const money=v=>typeof window.fmtCLP==='function'?window.fmtCLP(v):'$'+Math.round(Number(v)||0).toLocaleString('es-CL');
  const norm=v=>String(v??'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/\s+/g,' ').trim();

  function modal(){
    return document.getElementById('modalRoot')?.querySelector('.modal.r125-edp-modal,.modal')||null;
  }
  function epNumber(m){
    return Number(String(m?.querySelector('h1,h2,h3,h4')?.textContent||'').match(/EP\s*(\d+)/i)?.[1]||0);
  }
  function epData(m){
    const epNum=epNumber(m);
    return (window.state?.contractData?.edp||[]).find(x=>Number(x.ep_num)===epNum)||null;
  }
  function applies(ep){
    return Number(ep?.ep_num)===17&&Number(ep?.anio_edp)===2026&&Number(ep?.mes_edp)===10;
  }
  function baseInput(m,name){
    const target=norm(name);
    const label=[...m.querySelectorAll('label')].find(x=>norm(x.childNodes?.[0]?.textContent||x.textContent).startsWith(target));
    return label?.querySelector('input,select,textarea')||null;
  }
  function amountSum(section){
    return [...section.querySelectorAll('[data-r125-amount]')].reduce((sum,input)=>sum+Math.max(0,Number(input.value)||0),0);
  }

  function installStyle(){
    if(document.getElementById('stainher-edp-quarterly-r149-style'))return;
    const s=document.createElement('style');
    s.id='stainher-edp-quarterly-r149-style';
    s.textContent=`
      #modalRoot .r149-quarterly-box{
        margin:12px 0 0!important;padding:12px 14px!important;
        border:1px solid rgba(56,189,248,.38)!important;border-radius:12px!important;
        background:rgba(14,165,233,.08)!important;line-height:1.45!important
      }
      #modalRoot .r149-quarterly-title{font-weight:800!important;margin-bottom:4px!important}
      #modalRoot .r149-quarterly-total{font-weight:900!important;color:#7dd3fc!important}
      #modalRoot .r149-cert-note{display:block!important;margin-top:4px!important;color:#7dd3fc!important;font-size:10px!important;line-height:1.25!important}
      #modalRoot .r149-added-kpi{border-color:rgba(56,189,248,.38)!important}
      #modalRoot .r125-edp-summary{grid-template-columns:repeat(3,minmax(0,1fr))!important}
      @media(max-width:760px){#modalRoot .r125-edp-summary{grid-template-columns:repeat(2,minmax(0,1fr))!important}}
      @media(max-width:480px){#modalRoot .r125-edp-summary{grid-template-columns:1fr!important}}
    `;
    document.head.appendChild(s);
  }

  function ensureActivityBox(section){
    if(section.querySelector('.r149-quarterly-box'))return;
    const summary=section.querySelector('.r125-edp-summary');
    const box=document.createElement('div');
    box.className='r149-quarterly-box';
    box.innerHTML=`
      <div class="r149-quarterly-title">Certificación trimestral sistema de levante (cables y poleas)</div>
      <div>Actividad contractual periódica correspondiente a octubre. Se suma al mantenimiento base para conciliar el detalle real por equipo.</div>
      <div style="margin-top:6px">Total certificación: <span class="r149-quarterly-total">${money(TOTAL_CERT)}</span></div>
    `;
    summary?.insertAdjacentElement('beforebegin',box);
  }

  function ensureKpis(section){
    const summary=section.querySelector('.r125-edp-summary');
    if(!summary)return;
    const cards=[...summary.querySelectorAll('.kpi')];
    const maintenance=cards.find(card=>norm(card.textContent).includes('mantenimiento edp')||norm(card.textContent).includes('mantenimiento base'));
    if(maintenance){
      const span=maintenance.querySelector('span');
      if(span)span.textContent='Mantenimiento base';
    }
    if(!summary.querySelector('[data-r149-cert-kpi]')){
      const cert=document.createElement('div');
      cert.className='kpi r149-added-kpi';
      cert.dataset.r149CertKpi='1';
      cert.innerHTML='<span>Certificación trimestral</span><strong>'+money(TOTAL_CERT)+'</strong>';
      const expected=document.createElement('div');
      expected.className='kpi r149-added-kpi';
      expected.dataset.r149ExpectedKpi='1';
      expected.innerHTML='<span>Total esperado equipos</span><strong data-r149-expected>—</strong>';
      const equipment=cards.find(card=>norm(card.textContent).includes('detalle equipos'));
      if(equipment){
        summary.insertBefore(cert,equipment);
        summary.insertBefore(expected,equipment);
      }else{
        summary.prepend(expected);
        summary.prepend(cert);
      }
    }
  }

  function annotateInputs(section){
    Object.entries(ITEMS).forEach(([code,item])=>{
      const input=section.querySelector('[data-r125-amount="'+code+'"]');
      const label=input?.closest('label');
      if(!label||label.querySelector('.r149-cert-note'))return;
      const note=document.createElement('small');
      note.className='r149-cert-note';
      note.textContent='Incluye ítem '+item.item+' · Certificación trimestral: '+money(item.amount);
      label.appendChild(note);
    });
  }

  function reconcile(section,m){
    const base=Math.max(0,Number(baseInput(m,'Mantenimiento')?.value)||0);
    const detail=amountSum(section);
    const expected=base+TOTAL_CERT;
    const diff=expected-detail;
    const expectedNode=section.querySelector('[data-r149-expected]');
    if(expectedNode)expectedNode.textContent=money(expected);
    const warning=section.querySelector('[data-r125-diff]');
    if(!warning)return;
    if(diff===0){
      warning.textContent='El detalle concilia: Mantenimiento base '+money(base)+' + Certificación trimestral '+money(TOTAL_CERT)+' = '+money(expected)+'.';
      warning.dataset.state='ok';
    }else if(diff>0){
      warning.textContent='Faltan '+money(diff)+' por distribuir. Total esperado: Mantenimiento base '+money(base)+' + Certificación trimestral '+money(TOTAL_CERT)+' = '+money(expected)+'.';
      warning.dataset.state='warn';
    }else{
      warning.textContent='El detalle supera el total contractual esperado en '+money(Math.abs(diff))+'. Total esperado: '+money(expected)+'.';
      warning.dataset.state='bad';
    }
  }

  function enhance(){
    installStyle();
    const m=modal();
    if(!m||!/Editar Estado de Pago/i.test(String(m.querySelector('h1,h2,h3,h4')?.textContent||'')))return false;
    const ep=epData(m);
    if(!applies(ep))return false;
    const section=m.querySelector('.r125-edp-detail');
    if(!section)return false;
    ensureActivityBox(section);
    ensureKpis(section);
    annotateInputs(section);
    reconcile(section,m);
    if(section.dataset.r149Bound!=='1'){
      section.dataset.r149Bound='1';
      section.addEventListener('input',()=>setTimeout(()=>reconcile(section,m),0));
      [baseInput(m,'Mantenimiento'),baseInput(m,'Total Neto'),baseInput(m,'Gastos Reembolsables')].filter(Boolean)
        .forEach(input=>input.addEventListener('input',()=>setTimeout(()=>reconcile(section,m),0)));
    }
    return true;
  }

  let observer=null;
  function install(){
    installStyle();
    enhance();
    if(observer)return;
    const root=document.getElementById('modalRoot')||document.body;
    observer=new MutationObserver(()=>setTimeout(enhance,0));
    observer.observe(root,{childList:true,subtree:true,characterData:true});
    window.addEventListener('stainher:edp-inline-r125-ready',()=>setTimeout(enhance,0));
    window.addEventListener('stainher:modules-ready',()=>setTimeout(enhance,0));
  }

  window.StainherEdpQuarterlyR149=Object.freeze({install,enhance,applies,totalCertification:TOTAL_CERT,items:ITEMS,version:BUILD});
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
