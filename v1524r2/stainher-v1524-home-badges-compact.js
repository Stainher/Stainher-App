/* Stainher App V15.24 · Inicio: etiquetas compactas de turno (R1)
 * Evita bucles MutationObserver: solo cambia el texto cuando realmente difiere.
 */
(function installCompactHomeTurnBadges(){
  if(window.__STAINHER_V1524_HOME_BADGES_COMPACT_R1__) return;
  window.__STAINHER_V1524_HOME_BADGES_COMPACT_R1__=true;

  const shortByText={
    'Turno normal A':'A',
    'Turno normal C':'C',
    'Encierro dentro de turno':'ET',
    'Encierro fuera de turno':'EF',
    'Suspendido por encierro':'SE',
    'Día adicional':'DA'
  };

  function mountStyle(){
    if(document.getElementById('stainher-v1524-home-badges-compact-style')) return;
    const s=document.createElement('style');
    s.id='stainher-v1524-home-badges-compact-style';
    s.textContent=`
      .v1524-home-person{grid-template-columns:minmax(0,1fr) min-content!important;gap:5px!important}
      .v1524-home-badge{min-width:22px!important;max-width:34px!important;padding:2px 5px!important;font-size:8px!important;line-height:1.15!important;letter-spacing:.2px!important}
      .v1524-home-person>div{min-width:0!important}
      .v1524-home-person b{display:block!important;max-width:100%!important;overflow:hidden!important;text-overflow:ellipsis!important;white-space:nowrap!important}
      @media(max-width:520px){.v1524-home-badge{min-width:20px!important;max-width:30px!important;padding:2px 4px!important;font-size:7.5px!important}}
    `;
    document.head.appendChild(s);
  }

  function compact(root=document){
    root.querySelectorAll?.('.v1524-home-badge').forEach(el=>{
      const visible=String(el.textContent||'').trim();
      const full=String(el.dataset.fullLabel||visible).trim();
      const short=shortByText[full]||shortByText[visible];
      if(!short) return;
      if(el.dataset.fullLabel!==full) el.dataset.fullLabel=full;
      if(visible!==short) el.textContent=short;
      if(el.title!==full) el.title=full;
      if(el.getAttribute('aria-label')!==full) el.setAttribute('aria-label',full);
    });
  }

  function boot(){
    mountStyle();
    compact();
    const root=document.getElementById('appView')||document.body;
    let queued=false;
    new MutationObserver(mutations=>{
      if(queued) return;
      const relevant=mutations.some(m=>{
        const target=m.target?.nodeType===1?m.target:m.target?.parentElement;
        if(target?.closest?.('.v1524-home-badge')) return true;
        return [...(m.addedNodes||[])].some(n=>n?.nodeType===1&&(n.matches?.('.v1524-home-badge')||n.querySelector?.('.v1524-home-badge')));
      });
      if(!relevant) return;
      queued=true;
      requestAnimationFrame(()=>{queued=false;compact(root)});
    }).observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
