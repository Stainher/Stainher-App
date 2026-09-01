/* Stainher App V15.24 · Administración del Contrato
 * Ajusta Valor vigente y Cobrado neto al ancho real de sus tarjetas.
 */
(function installContractMoneyFit(){
  if(window.__STAINHER_V1524_CONTRACT_MONEY_FIT_R2__) return;
  window.__STAINHER_V1524_CONTRACT_MONEY_FIT_R2__=true;

  const LABELS=new Set(['valor vigente','cobrado neto']);
  const tracked=new Set();

  function mountStyle(){
    if(document.getElementById('stainher-v1524-contract-money-fit-style')) return;
    const s=document.createElement('style');
    s.id='stainher-v1524-contract-money-fit-style';
    s.textContent=`
      .v1524-contract-money-card{min-width:0!important;overflow:hidden!important;box-sizing:border-box!important}
      .v1524-contract-money-value{display:block!important;width:100%!important;max-width:100%!important;min-width:0!important;box-sizing:border-box!important;white-space:nowrap!important;overflow:visible!important;text-overflow:clip!important;line-height:1.08!important;letter-spacing:-.35px!important;font-variant-numeric:tabular-nums!important}
      @media(max-width:900px){.v1524-contract-money-value{letter-spacing:-.55px!important}}
    `;
    document.head.appendChild(s);
  }

  function norm(v){return String(v||'').replace(/\s+/g,' ').trim().toLowerCase()}
  function moneyLeaf(card){
    const all=[...card.querySelectorAll('*')];
    return all.find(el=>el.children.length===0 && /^\s*\$\s*[\d.]+\s*$/.test(String(el.textContent||''))) || null;
  }
  function findCard(label){
    let node=label.parentElement;
    for(let i=0;i<6&&node;i++,node=node.parentElement){
      const text=String(node.textContent||'').replace(/\s+/g,' ').trim();
      if(/\$\s*[\d.]+/.test(text) && text.length<260) return node;
    }
    return null;
  }
  function fit(el){
    if(!el?.isConnected) return;
    const card=el.closest('.v1524-contract-money-card')||el.parentElement;
    if(!card) return;
    const cs=getComputedStyle(card);
    const available=Math.max(40,card.clientWidth-(parseFloat(cs.paddingLeft)||0)-(parseFloat(cs.paddingRight)||0));
    el.style.fontSize='30px';
    let size=30;
    while(size>17 && el.scrollWidth>available){size-=.5;el.style.fontSize=size+'px'}
    if(el.scrollWidth>available){el.style.fontSize='17px'}
  }
  function enhance(){
    const scope=document.getElementById('page-administracion')||document.getElementById('page-contrato');
    if(!scope) return;
    [...scope.querySelectorAll('*')].forEach(label=>{
      if(label.children.length) return;
      if(!LABELS.has(norm(label.textContent))) return;
      const card=findCard(label); if(!card) return;
      const value=moneyLeaf(card); if(!value) return;
      card.classList.add('v1524-contract-money-card');
      value.classList.add('v1524-contract-money-value');
      if(!tracked.has(value)){
        tracked.add(value);
        try{new ResizeObserver(()=>fit(value)).observe(card)}catch(_){ }
      }
      requestAnimationFrame(()=>fit(value));
    });
  }
  function wrapContract(){
    const names=['renderContrato','renderAdministracionContrato'];
    let wrappedAny=false;
    names.forEach(name=>{
      const current=window[name];
      if(typeof current!=='function'||current.__v1524MoneyFitR2)return;
      const wrapped=async function(){const out=await current.apply(this,arguments);requestAnimationFrame(enhance);return out};
      wrapped.__v1524MoneyFitR2=true;wrapped.__base=current;window[name]=wrapped;wrappedAny=true;
    });
    return wrappedAny;
  }
  function boot(){
    mountStyle();enhance();let tries=0;
    const timer=setInterval(()=>{tries++;if(wrapContract()||tries>30)clearInterval(timer)},120);
    document.addEventListener('click',e=>{
      const page=String(e.target?.closest?.('[data-page]')?.dataset?.page||'');
      if(page==='contrato'||e.target?.closest?.('#page-contrato,#page-administracion'))setTimeout(enhance,100);
    },true);
    window.addEventListener('resize',enhance,{passive:true});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
