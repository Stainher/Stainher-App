/* Stainher V15.24 · R78 · layout estable para horas administrativas HP.
 * - Un solo botón/chevrón para desplegar.
 * - Mueve carga y detalle mensual bajo la comparación histórica.
 * - Sin MutationObserver ni reordenamientos repetitivos.
 * - No modifica cálculos HP/FTE, Teletrabajo, Excel ni login/sesión.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_HP_LAYOUT_R78__)return;
  window.__STAINHER_HP_LAYOUT_R78__=true;

  const PAGE_ID='page-reporte-hp';
  const BLOCK_ID='hpManualAdminR78';

  function ensureStyle(){
    document.getElementById('stainher-hp-layout-r77-style')?.remove();
    document.getElementById('stainher-hp-layout-r78-style')?.remove();
    const style=document.createElement('style');
    style.id='stainher-hp-layout-r78-style';
    style.textContent=`
      #${PAGE_ID} .hp-summary td,
      #${PAGE_ID} .hp-summary thead th:last-child{text-align:center!important;vertical-align:middle!important}
      #${PAGE_ID} .hp-summary tbody td{font-variant-numeric:tabular-nums}
      #${PAGE_ID} #${BLOCK_ID}{margin-top:14px;padding:0!important;overflow:hidden;border:1px solid var(--line);border-radius:14px;background:var(--panel)}
      #${PAGE_ID} .hp-manual-toggle-r78{width:100%;display:flex;align-items:center;justify-content:space-between;gap:14px;padding:15px 18px;border:0;background:transparent;color:inherit;text-align:left;cursor:pointer;font:inherit}
      #${PAGE_ID} .hp-manual-toggle-r78:hover{background:var(--panel2)}
      #${PAGE_ID} .hp-manual-toggle-main-r78{display:flex;align-items:center;gap:11px;min-width:0;flex:1}
      #${PAGE_ID} .hp-manual-chevron-r78{width:18px;flex:0 0 18px;text-align:center;color:var(--muted);font-size:14px;line-height:1;transition:transform .16s ease}
      #${PAGE_ID} .hp-manual-toggle-r78[aria-expanded="true"] .hp-manual-chevron-r78{transform:rotate(90deg)}
      #${PAGE_ID} .hp-manual-title-r78{display:grid;gap:3px;min-width:0}
      #${PAGE_ID} .hp-manual-title-r78 strong{font-size:14px}
      #${PAGE_ID} .hp-manual-title-r78 span{font-size:11px;color:var(--muted);white-space:normal}
      #${PAGE_ID} .hp-manual-body-r78{display:grid;gap:14px;padding:16px 18px 18px;border-top:1px solid var(--line)}
      #${PAGE_ID} .hp-manual-body-r78[hidden]{display:none!important}
      #${PAGE_ID} .hp-manual-entry-r78,
      #${PAGE_ID} .hp-manual-detail-r78{margin:0!important;padding:0!important;border:0!important;border-radius:0!important;background:transparent!important;box-shadow:none!important}
      #${PAGE_ID} .hp-manual-entry-r78>div:first-child,
      #${PAGE_ID} .hp-manual-entry-r78>h3:first-child{display:none!important}
      #${PAGE_ID} .hp-manual-entry-r78 .hp-adjust-grid{margin-top:0}
      #${PAGE_ID} .hp-manual-detail-r78 .hp-admin-detail-head{margin-bottom:10px}
      #${PAGE_ID} .hp-manual-detail-r78 .hp-admin-detail-table td:nth-child(4),
      #${PAGE_ID} .hp-manual-detail-r78 .hp-admin-detail-table th:nth-child(4){text-align:center!important;font-variant-numeric:tabular-nums}
      #${PAGE_ID} .hp-manual-detail-r78 .hp-admin-detail-subtotal td,
      #${PAGE_ID} .hp-manual-detail-r78 .hp-admin-detail-total td{text-align:center!important}
      @media(max-width:850px){
        #${PAGE_ID} .hp-manual-toggle-r78{padding:13px 14px;align-items:flex-start}
        #${PAGE_ID} .hp-manual-body-r78{padding:14px}
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
    block=document.createElement('div');
    block.id=BLOCK_ID;
    block.className='panel hp-manual-admin-r78';
    block.innerHTML=`
      <button type="button" class="hp-manual-toggle-r78" aria-expanded="false" aria-controls="hpManualAdminBodyR78">
        <span class="hp-manual-toggle-main-r78">
          <span class="hp-manual-chevron-r78" aria-hidden="true">▶</span>
          <span class="hp-manual-title-r78">
            <strong>Horas administrativas manuales</strong>
            <span>Carga y detalle mensual de ADC, Gerente y Confiabilidad.</span>
          </span>
        </span>
      </button>
      <div id="hpManualAdminBodyR78" class="hp-manual-body-r78" hidden></div>`;
    const toggle=block.querySelector('.hp-manual-toggle-r78');
    const body=block.querySelector('.hp-manual-body-r78');
    toggle.addEventListener('click',()=>{
      const open=toggle.getAttribute('aria-expanded')==='true';
      toggle.setAttribute('aria-expanded',String(!open));
      body.hidden=open;
    });
    page.appendChild(block);
    return block;
  }

  function organize(page){
    if(!page||!page.isConnected)return;
    ensureStyle();
    const manual=findManualPanel(page);
    const detail=page.querySelector('#hpAdminDetailR74');
    if(!manual&&!detail)return;

    const block=ensureBlock(page);
    const body=block.querySelector('.hp-manual-body-r78');

    if(manual&&manual!==block&&manual.parentElement!==body){
      manual.classList.add('hp-manual-entry-r78');
      body.appendChild(manual);
    }
    if(detail&&detail!==block&&detail.parentElement!==body){
      detail.classList.add('hp-manual-detail-r78');
      body.appendChild(detail);
    }

    const history=page.querySelector('#hpHistoryR71');
    if(history&&history.nextElementSibling!==block)history.insertAdjacentElement('afterend',block);
  }

  function schedule(page){setTimeout(()=>organize(page),120)}

  function bindPage(page){
    if(!page||page.dataset.hpLayoutR78Bound==='1')return;
    page.dataset.hpLayoutR78Bound='1';
    page.addEventListener('change',event=>{if(event.target?.id==='hpMonth')schedule(page)});
    page.addEventListener('submit',event=>{if(event.target?.id==='hpAdjForm')schedule(page)});
  }

  function mount(page){
    if(!page)return;
    bindPage(page);
    organize(page);
  }

  const history=window.StainherHPHistory;
  if(history&&typeof history.mount==='function'&&!history.__stainherLayoutR78){
    const original=history.mount.bind(history);
    history.mount=page=>{
      const result=original(page);
      mount(page);
      return result;
    };
    history.__stainherLayoutR78=true;
  }

  ensureStyle();
  const existing=document.getElementById(PAGE_ID);
  if(existing)mount(existing);
  window.StainherHPLayoutR78={mount,organize};
})();
