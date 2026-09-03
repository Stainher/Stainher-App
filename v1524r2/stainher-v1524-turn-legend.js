/* Stainher App V15.24 · Glosa de turnos ordenada
 * - Distribuye cada código y su descripción en una cuadrícula estable.
 * - Oculta el separador heredado que en tema claro aparece como una muestra vacía.
 */
(function installStainherV1524TurnLegend(){
  if (window.__STAINHER_V1524_TURN_LEGEND__) return;
  window.__STAINHER_V1524_TURN_LEGEND__ = true;

  function mountStyle(){
    if (document.getElementById('stainher-v1524-turn-legend-style')) return;
    const style = document.createElement('style');
    style.id = 'stainher-v1524-turn-legend-style';
    style.textContent = `
      #page-turnos .v1512-turn-legend.v1524-compact-legend{
        display:block!important;
        width:100%!important;
        max-width:100%!important;
        box-sizing:border-box!important;
        position:sticky!important;
        top:8px!important;
        z-index:70!important;
        align-items:stretch!important;
        gap:8px 12px!important;
        overflow:hidden!important;
        white-space:normal!important;
        padding:10px 12px!important;
        background:var(--panel,#0d151e)!important;
        box-shadow:0 5px 14px rgba(0,0,0,.16)!important;
      }
      [data-theme="light"] #page-turnos .v1512-turn-legend.v1524-compact-legend{
        background:#fff!important;
        box-shadow:0 5px 14px rgba(16,24,40,.10)!important;
      }
      @media(max-width:900px){
        #page-turnos .v1512-turn-legend.v1524-compact-legend{
          top:calc(58px + env(safe-area-inset-top,0px))!important;
          z-index:980!important;
        }
      }
      #page-turnos .v1524-compact-legend .v1524-legend-label{
        display:block!important;
        min-height:auto!important;
        padding:0 0 2px!important;
      }
      #page-turnos .v1524-compact-legend .v1524-legend-items{
        display:grid!important;
        grid-template-columns:repeat(3,minmax(0,1fr))!important;
        grid-auto-flow:row!important;
        gap:8px 12px!important;
        width:100%!important;
        max-width:100%!important;
        overflow:visible!important;
      }
      #page-turnos .v1524-compact-legend .v1524-legend-items>span{
        display:grid!important;
        grid-template-columns:34px minmax(0,1fr)!important;
        align-items:center!important;
        gap:7px!important;
        min-width:0!important;
        min-height:28px!important;
        padding:0!important;
        white-space:normal!important;
        line-height:1.2!important;
      }
      #page-turnos .v1524-compact-legend>span:not(.v1524-legend-label)>i,
      #page-turnos .v1524-compact-legend .v1524-legend-items>span>i{
        width:34px!important;
        min-width:34px!important;
        height:24px!important;
        padding:0 4px!important;
        justify-self:start!important;
      }
      #page-turnos .v1524-compact-legend>.v1524-legend-separator,
      #page-turnos .v1524-compact-legend>i:empty{
        display:none!important;
      }
      @media(max-width:600px){
        #page-turnos .v1512-turn-legend.v1524-compact-legend{
          padding:9px 10px!important;
        }
        #page-turnos .v1524-compact-legend .v1524-legend-items{
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
          gap:7px 6px!important;
        }
        #page-turnos .v1524-compact-legend .v1524-legend-items>span{
          grid-template-columns:28px minmax(0,1fr)!important;
          gap:4px!important;
          min-height:27px!important;
          font-size:9px!important;
        }
        #page-turnos .v1524-compact-legend>span:not(.v1524-legend-label)>i,
        #page-turnos .v1524-compact-legend .v1524-legend-items>span>i{
          width:28px!important;
          min-width:28px!important;
          height:23px!important;
          font-size:9px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function removeEmptySamples(root=document){
    root.querySelectorAll?.('#page-turnos .v1524-compact-legend>i,#page-turnos .v1524-compact-legend .v1524-legend-items>i').forEach(sample=>{
      if (sample.classList.contains('v1524-legend-separator') || !String(sample.textContent||'').trim()) sample.remove();
    });
    root.querySelectorAll?.('#page-turnos .v1524-compact-legend>span:not(.v1524-legend-label),#page-turnos .v1524-compact-legend .v1524-legend-items>span').forEach(item=>{
      const code=String(item.querySelector('i')?.textContent||'').trim();
      const label=String(item.textContent||'').replace(code,'').trim();
      if (!code && !label) item.remove();
    });
  }

  function detachFromCalendarScroll(legend){
    const page=document.getElementById('page-turnos');
    if(!legend||!page)return;
    const firstCell=page.querySelector('.v1520-turn-cell,.v1512-turn-cell,.v1512-day-mini');
    let boundary=firstCell?.closest('.v1512-turn-wrap,.v1512-clean-table-wrap,.v1520-turn-matrix,.v1523-scroll-region,.table-wrap');
    if(!boundary&&firstCell){
      let node=firstCell.parentElement;
      while(node&&node!==page){
        const css=getComputedStyle(node);
        if(/auto|scroll/.test(css.overflowX)||node.scrollWidth>node.clientWidth+2){boundary=node}
        node=node.parentElement;
      }
    }
    if(!boundary) boundary=firstCell?.closest('table,.v1512-turn-grid,.v1520-turn-grid,.v1512-calendar,.v1520-calendar,.calendar-grid');
    if(boundary?.parentElement&&legend!==boundary.previousElementSibling) boundary.insertAdjacentElement('beforebegin',legend);
    legend.scrollLeft=0;
  }

  function groupLegendItems(legend){
    if(!legend)return;
    let items=legend.querySelector(':scope>.v1524-legend-items');
    if(!items){items=document.createElement('div');items.className='v1524-legend-items';legend.appendChild(items)}
    [...legend.children].filter(node=>node!==items&&node.matches('span:not(.v1524-legend-label)')).forEach(node=>items.appendChild(node));
  }

  let queued=false;
  function enhance(){
    queued=false;
    document.querySelectorAll('#page-turnos .v1512-turn-legend').forEach(legend=>{
      legend.classList.add('v1524-compact-legend');
      detachFromCalendarScroll(legend);
      groupLegendItems(legend);
    });
    removeEmptySamples();
  }
  function queueEnhance(){
    if (queued) return;
    queued=true;
    requestAnimationFrame(enhance);
  }

  mountStyle();
  enhance();
  new MutationObserver(queueEnhance).observe(document.documentElement,{childList:true,subtree:true});
  const patchRenderer=()=>{
    const current=window.renderTurnosV15;
    if(typeof current!=='function'||current.__stainherLegendDetached)return;
    const wrapped=async function(){const out=await current.apply(this,arguments);enhance();return out};
    wrapped.__stainherLegendDetached=true;
    wrapped.__base=current;
    window.renderTurnosV15=wrapped;
  };
  patchRenderer();
  setTimeout(patchRenderer,1200);
})();
