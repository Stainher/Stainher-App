/* Stainher V15.24 · R77 · optimización visual Reporte Semanal HP.
 * - Mueve Horas administrativas manuales debajo de la comparación de 3 meses.
 * - Integra el detalle mensual dentro del mismo bloque desplegable.
 * - Mantiene el bloque plegado por defecto.
 * - Centra los valores numéricos del Resumen Mensual.
 * No modifica reglas de cálculo HP/FTE, Teletrabajo, Excel ni login/sesión.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LAYOUT_R77__)return;
  window.__STAINHER_HP_LAYOUT_R77__=true;

  const PAGE_ID='page-reporte-hp';
  const BLOCK_ID='hpManualAdminR77';

  function ensureStyle(){
    document.getElementById('stainher-hp-layout-r77-style')?.remove();
    const style=document.createElement('style');
    style.id='stainher-hp-layout-r77-style';
    style.textContent=`
      #${PAGE_ID} .hp-summary td,
      #${PAGE_ID} .hp-summary thead th:last-child{text-align:center!important;vertical-align:middle!important}
      #${PAGE_ID} .hp-summary tbody td{font-variant-numeric:tabular-nums}
      #${PAGE_ID} #${BLOCK_ID}{margin-top:14px;padding:0!important;overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--panel)}
      #${PAGE_ID} #${BLOCK_ID}>summary{list-style:none;display:flex;align-items:center;justify-content:space-between;gap:16px;padding:15px 18px;cursor:pointer;user-select:none;background:var(--panel);min-height:58px}
      #${PAGE_ID} #${BLOCK_ID}>summary::-webkit-details-marker{display:none}
      #${PAGE_ID} .hp-manual-summary-main-r77{display:flex;align-items:center;gap:12px;min-width:0;flex:1}
      #${PAGE_ID} .hp-manual-chevron-r77{width:20px;flex:0 0 20px;text-align:center;color:var(--muted);font-size:16px;transition:transform .18s ease}
      #${PAGE_ID} #${BLOCK_ID}[open] .hp-manual-chevron-r77{transform:rotate(90deg)}
      #${PAGE_ID} .hp-manual-title-r77{display:grid;gap:3px;min-width:0}
      #${PAGE_ID} .hp-manual-title-r77 strong{font-size:14px}
      #${PAGE_ID} .hp-manual-title-r77 span{font-size:11px;color:var(--muted);white-space:normal}
      #${PAGE_ID} .hp-manual-summary-kpis-r77{display:flex;gap:7px;align-items:center;flex-wrap:wrap;justify-content:flex-end}
      #${PAGE_ID} .hp-manual-summary-kpis-r77 .hp-admin-detail-kpi{padding:5px 9px;font-size:11px}
      #${PAGE_ID} .hp-manual-body-r77{display:grid;gap:14px;padding:16px 18px 18px;border-top:1px solid var(--line)}
      #${PAGE_ID} .hp-manual-entry-r77,
      #${PAGE_ID} .hp-manual-detail-r77{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
      #${PAGE_ID} .hp-manual-entry-r77>div:first-child{display:none!important}
      #${PAGE_ID} .hp-manual-entry-r77>h3:first-child{display:none!important}
      #${PAGE_ID} .hp-manual-entry-r77 .hp-adjust-grid{margin-top:0}
      #${PAGE_ID} .hp-manual-detail-r77 .hp-admin-detail-head{margin-bottom:10px}
      #${PAGE_ID} .hp-manual-detail-r77 .hp-admin-detail-head>.hp-admin-detail-kpis{display:none!important}
      #${PAGE_ID} .hp-manual-detail-r77 .hp-admin-detail-table td:nth-child(4),
      #${PAGE_ID} .hp-manual-detail-r77 .hp-admin-detail-table th:nth-child(4){text-align:center!important;font-variant-numeric:tabular-nums}
      #${PAGE_ID} .hp-manual-detail-r77 .hp-admin-detail-subtotal td,
      #${PAGE_ID} .hp-manual-detail-r77 .hp-admin-detail-total td{text-align:center!important}
      @media(max-width:850px){
        #${PAGE_ID} #${BLOCK_ID}>summary{align-items:flex-start;flex-wrap:wrap;padding:13px 14px}
        #${PAGE_ID} .hp-manual-summary-kpis-r77{width:100%;justify-content:flex-start;padding-left:32px}
        #${PAGE_ID} .hp-manual-body-r77{padding:14px}
      }
    `;
    document.head.appendChild(style);
  }

  function findManualPanel(page){
    const form=page.querySelector('#hpAdjForm');
    if(form)return form.closest('.panel');
    return [...page.querySelectorAll('.panel')].find(panel=>{
      const h=panel.querySelector(':scope > h3, :scope > div > h3');
      return h?.textContent?.trim()==='Horas administrativas manuales';
    })||null;
  }

  function ensureBlock(page){
    let block=page.querySelector(`#${BLOCK_ID}`);
    if(block)return block;
    block=document.createElement('details');
    block.id=BLOCK_ID;
    block.className='panel hp-manual-admin-r77';
    block.open=false;
    block.innerHTML=`
      <summary aria-label="Mostrar u ocultar horas administrativas manuales">
        <div class="hp-manual-summary-main-r77">
          <span class="hp-manual-chevron-r77">▶</span>
          <div class="hp-manual-title-r77">
            <strong>Horas administrativas manuales</strong>
            <span class="hp-manual-summary-subtitle-r77">Carga y detalle mensual de ADC, Gerente y Confiabilidad.</span>
          </div>
        </div>
        <div class="hp-manual-summary-kpis-r77"></div>
      </summary>
      <div class="hp-manual-body-r77"></div>`;
    page.appendChild(block);
    return block;
  }

  function updateSummary(block,detail){
    const subtitle=detail?.querySelector('.hp-admin-detail-head .muted')?.textContent?.trim();
    if(subtitle)block.querySelector('.hp-manual-summary-subtitle-r77').textContent=subtitle;
    const source=detail?.querySelector('.hp-admin-detail-kpis');
    const target=block.querySelector('.hp-manual-summary-kpis-r77');
    if(source&&target)target.innerHTML=source.innerHTML;
  }

  function organize(page){
    if(!page||!page.isConnected)return;
    ensureStyle();
    const manual=findManualPanel(page);
    const detail=page.querySelector('#hpAdminDetailR74');
    if(!manual&&!detail)return;

    const block=ensureBlock(page);
    const body=block.querySelector('.hp-manual-body-r77');

    if(manual&&manual!==block){
      manual.classList.add('hp-manual-entry-r77');
      body.appendChild(manual);
    }
    if(detail&&detail!==block){
      detail.classList.add('hp-manual-detail-r77');
      body.appendChild(detail);
    }
    updateSummary(block,detail);

    const history=page.querySelector('#hpHistoryR71');
    if(history&&history.nextElementSibling!==block)history.insertAdjacentElement('afterend',block);

    page.querySelectorAll('.hp-summary td').forEach(td=>td.style.textAlign='center');
  }

  function schedule(page){
    [0,80,220,500].forEach(ms=>setTimeout(()=>organize(page),ms));
  }

  function bindPage(page){
    if(!page||page.dataset.hpLayoutR77Bound==='1')return;
    page.dataset.hpLayoutR77Bound='1';
    page.addEventListener('change',event=>{
      if(event.target?.id==='hpMonth')schedule(page);
    });
    page.addEventListener('submit',event=>{
      if(event.target?.id==='hpAdjForm')setTimeout(()=>schedule(page),100);
    });
  }

  function mount(page){
    if(!page)return;
    bindPage(page);
    schedule(page);
  }

  const history=window.StainherHPHistory;
  if(history&&typeof history.mount==='function'&&!history.__stainherLayoutR77){
    const original=history.mount.bind(history);
    history.mount=page=>{
      const result=original(page);
      mount(page);
      return result;
    };
    history.__stainherLayoutR77=true;
  }

  ensureStyle();
  const existing=document.getElementById(PAGE_ID);
  if(existing)mount(existing);
  window.StainherHPLayoutR77={mount,organize};
})();
