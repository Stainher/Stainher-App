/* R365 · KPI estables: una sola capa CSS, sin observadores ni escrituras periódicas.
 * Reemplaza los estilos competitivos R360/R362. Cada render adquiere el contraste
 * desde el primer frame, aunque la vista se vuelva a construir.
 */
(()=>{
 'use strict';
 if(window.StainherStableKpiR365)return;
 const TILE_SELECTORS=[
  '#page-inicio :is(.kpi,.mini-stat,.v1524-home-kpi)',
  '#page-preventivo :is(.kpi,.mini-stat,.v1523-prev-kpi)',
  '#page-correctivo :is(.kpi,.mini-stat,.v1523-corr-kpi)',
  '#page-liderazgo :is(.v1512-mini-kpi,.stainher-leadership-kpi-r214)',
  '#page-estandarizacion .std-kpi',
  '#page-dotacion :is(.kpi,.mini-stat,.stat-card,.metric-card,.v1512-mini-kpi,.v1520-kpi)',
  '#page-contrato :is(.v1520-kpi,.kpi,.mini-stat,.r342-kpi)',
  '#page-sistema :is(.system-stat,.usage-stat,.supabase-stat,.kpi)',
  '#page-vehiculos :is(.kpi,.mini-stat)',
  '#page-turnos :is(.kpi,.mini-stat)',
  '#page-solicitudes :is(.kpi,.mini-stat)',
  '#page-boletas-rendir .r354-kpi'
 ];
 function install(){
  if(document.getElementById('stainher-stable-kpi-r365'))return;
  // Reparar estilos de la sesión si un recurso antiguo fue inyectado por caché;
  // las tres capas anteriores ya no se inicializan en el cargador nuevo.
  for(const id of ['stainher-unified-summary-r360-style','stainher-kpi-r362']){
   document.getElementById(id)?.remove();
  }
  const style=document.createElement('style');
  style.id='stainher-stable-kpi-r365';
  const tiles=TILE_SELECTORS.map(sel=>'html[data-theme] body '+sel).join(',\n');
  const inners=TILE_SELECTORS.map(sel=>'html[data-theme] body '+sel+' :is(small,span,b,strong,p,label,div,h3,h4,[class*="value"],[class*="number"],[class*="label"])').join(',\n');
  style.textContent=`
/* La regla sobre la tarjeta completa evita barras aisladas y fondos blancos. */
${tiles}{
 background:linear-gradient(125deg,#12446e 0%,#1a6094 52%,#287eb3 100%)!important;
 background-image:linear-gradient(125deg,#12446e 0%,#1a6094 52%,#287eb3 100%)!important;
 color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;
 border:1px solid rgba(255,255,255,.18)!important;
 border-radius:12px!important;
 box-shadow:0 4px 14px rgba(12,47,78,.15)!important;
 min-width:0;box-sizing:border-box;opacity:1!important;
}
${inners}{
 color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;
 opacity:1!important;text-shadow:none!important;
}
/* Prioridad sobre reglas heredadas por tema en Liderazgo (R220). */
html[data-theme] body #page-liderazgo .v1512-mini-kpi.v1512-mini-kpi,
html[data-theme] body #page-liderazgo .stainher-leadership-kpi-r214.stainher-leadership-kpi-r214{
 background:linear-gradient(125deg,#12446e,#287eb3)!important;
 background-image:linear-gradient(125deg,#12446e,#287eb3)!important;
 color:white!important;-webkit-text-fill-color:white!important;
}
html[data-theme] body #page-liderazgo .v1512-mini-kpi.v1512-mini-kpi :is(*),
html[data-theme] body #page-liderazgo .stainher-leadership-kpi-r214.stainher-leadership-kpi-r214 :is(*){
 color:#ffffff!important;-webkit-text-fill-color:#ffffff!important;opacity:1!important;
}
/* No transformar los gráficos, tablas ni indicadores internos del dashboard. */
html[data-theme] body #page-estandarizacion .std-kpi .std-progress{
 background:rgba(255,255,255,.24)!important;
}
html[data-theme] body #page-estandarizacion .std-kpi .std-progress>i{
 background:var(--green,#11956b)!important;
}
@media(max-width:780px){
 ${tiles}{max-width:100%;min-width:0!important;}
}
`;
  document.head.appendChild(style);
 }
 window.StainherStableKpiR365={install,selectors:TILE_SELECTORS.slice()};
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
