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
        display:grid!important;
        grid-template-columns:repeat(4,minmax(0,1fr))!important;
        align-items:stretch!important;
        gap:8px 12px!important;
        overflow:visible!important;
        white-space:normal!important;
        padding:10px 12px!important;
      }
      #page-turnos .v1524-compact-legend .v1524-legend-label{
        grid-column:1/-1!important;
        min-height:auto!important;
        padding:0 0 2px!important;
      }
      #page-turnos .v1524-compact-legend>span:not(.v1524-legend-label){
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
      #page-turnos .v1524-compact-legend>span:not(.v1524-legend-label)>i{
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
      @media(max-width:900px){
        #page-turnos .v1512-turn-legend.v1524-compact-legend{
          grid-template-columns:repeat(3,minmax(0,1fr))!important;
        }
      }
      @media(max-width:600px){
        #page-turnos .v1512-turn-legend.v1524-compact-legend{
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:7px 10px!important;
          padding:9px 10px!important;
        }
        #page-turnos .v1524-compact-legend>span:not(.v1524-legend-label){
          grid-template-columns:31px minmax(0,1fr)!important;
          gap:6px!important;
          min-height:27px!important;
          font-size:9px!important;
        }
        #page-turnos .v1524-compact-legend>span:not(.v1524-legend-label)>i{
          width:31px!important;
          min-width:31px!important;
          height:23px!important;
          font-size:9px!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  function removeEmptySamples(root=document){
    root.querySelectorAll?.('#page-turnos .v1524-compact-legend>i').forEach(sample=>{
      if (sample.classList.contains('v1524-legend-separator') || !String(sample.textContent||'').trim()) sample.remove();
    });
    root.querySelectorAll?.('#page-turnos .v1524-compact-legend>span:not(.v1524-legend-label)').forEach(item=>{
      const code=String(item.querySelector('i')?.textContent||'').trim();
      const label=String(item.textContent||'').replace(code,'').trim();
      if (!code && !label) item.remove();
    });
  }

  let queued=false;
  function enhance(){
    queued=false;
    removeEmptySamples();
  }
  function queueEnhance(){
    if (queued) return;
    queued=true;
    requestAnimationFrame(enhance);
  }

  mountStyle();
  enhance();
  const page=document.getElementById('page-turnos');
  if (page) new MutationObserver(queueEnhance).observe(page,{childList:true,subtree:true});
})();
