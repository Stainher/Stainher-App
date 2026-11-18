/* Resumen mensual del Reporte Semanal HP. */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_HISTORY_VERSION__==='monthly-only')return;
  window.__STAINHER_HP_HISTORY_R73__=true;
  window.__STAINHER_HP_HISTORY_VERSION__='monthly-only';

  const FTE_DIVISOR=182.7;
  const fteFromHours=hours=>Number(hours||0)/FTE_DIVISOR;
  const fmtFte=n=>Number(n||0).toLocaleString('es-CL',{minimumFractionDigits:1,maximumFractionDigits:1});

  function parseHours(text){
    const normalized=String(text||'0').trim().replace(/\./g,'').replace(',','.').replace(/[^0-9.-]/g,'');
    const value=Number(normalized);
    return Number.isFinite(value)?value:0;
  }

  function patchMonthlyFte(page){
    if(!page)return;
    const rows=[...page.querySelectorAll('.hp-summary tbody tr')];
    const totalRow=rows.find(row=>/TOTAL HH EN FAENA/i.test(row.querySelector('th')?.textContent||''));
    const fteRow=rows.find(row=>/Total FTE/i.test(row.querySelector('th')?.textContent||''));
    if(totalRow&&fteRow){
      const total=parseHours(totalRow.querySelector('td')?.textContent||'0');
      const fte=fteFromHours(total);
      const label=fteRow.querySelector('th');
      const value=fteRow.querySelector('td');
      if(label)label.textContent='Total FTE (HH / 182,7)';
      if(value)value.textContent=fmtFte(fte);
    }
    const rules=page.querySelector('.hp-rules');
    if(rules&&!rules.querySelector('.hp-fte-rule-r75')){
      const note=document.createElement('span');
      note.className='hp-fte-rule-r75';
      note.textContent=' FTE Codelco = Total HH en Faena / 182,7.';
      rules.appendChild(note);
    }
  }

  function renderWhenReady(page,expected,attempt=0){
    if(!page||!page.isConnected)return;
    const input=page.querySelector('#hpMonth');
    if(input?.value===expected&&page.querySelector('.hp-summary')){
      patchMonthlyFte(page);
      return;
    }
    if(attempt<100)setTimeout(()=>renderWhenReady(page,expected,attempt+1),60);
  }

  function mount(page){
    if(!page)return;
    patchMonthlyFte(page);
    if(page.dataset.hpHistoryR117Bound!=='1'){
      page.dataset.hpHistoryR117Bound='1';
      page.addEventListener('change',event=>{
        if(event.target?.id!=='hpMonth')return;
        const expected=event.target.value;
        setTimeout(()=>renderWhenReady(page,expected),0);
      });
    }
  }

  window.StainherHPHistory={mount,render:patchMonthlyFte};
})();
