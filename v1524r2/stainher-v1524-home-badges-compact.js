/* Stainher App V15.24 · Inicio: etiquetas compactas de turno
 * Mantiene el color/estado y reduce el texto visible para evitar solapamiento con nombres largos.
 */
(function installCompactHomeTurnBadges(){
  if(window.__STAINHER_V1524_HOME_BADGES_COMPACT__) return;
  window.__STAINHER_V1524_HOME_BADGES_COMPACT__=true;

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
      const current=String(el.dataset.fullLabel||el.textContent||'').trim();
      const full=el.dataset.fullLabel||current;
      const short=shortByText[full]||shortByText[current];
      if(!short) return;
      el.dataset.fullLabel=full;
      el.textContent=short;
      el.title=full;
      el.setAttribute('aria-label',full);
    });
  }

  function boot(){
    mountStyle();
    compact();
    const root=document.getElementById('appView')||document.body;
    new MutationObserver(mutations=>{
      for(const m of mutations){
        if(m.type==='childList'&&m.addedNodes.length){compact(root);break;}
      }
    }).observe(root,{childList:true,subtree:true});
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
