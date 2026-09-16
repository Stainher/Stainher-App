/* Stainher V15.24 · R79 · cuadrícula estable para Eventos y Novedades.
 * Ajuste exclusivamente visual. No modifica datos, edición ni lógica de turnos.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_TURNOS_EVENT_GRID_R79__)return;
  window.__STAINHER_TURNOS_EVENT_GRID_R79__=true;

  const STYLE_ID='stainher-turnos-event-grid-r79-style';
  document.getElementById(STYLE_ID)?.remove();
  const style=document.createElement('style');
  style.id=STYLE_ID;
  style.textContent=`
    @media(min-width:901px){
      #page-turnos .r18-events{
        display:grid;
        gap:8px;
        width:100%;
        min-width:0;
      }
      #page-turnos .r18-event-row{
        display:grid!important;
        grid-template-columns:110px minmax(190px,1.15fr) minmax(175px,1fr) 105px minmax(260px,1.8fr) 132px!important;
        gap:0!important;
        align-items:stretch!important;
        padding:0!important;
        min-height:58px;
        width:100%;
        box-sizing:border-box;
        overflow:hidden;
      }
      #page-turnos .r18-event-row>div{
        min-width:0;
        display:flex;
        flex-direction:column;
        justify-content:center;
        padding:9px 10px;
        box-sizing:border-box;
        overflow-wrap:anywhere;
      }
      #page-turnos .r18-event-row>div+div{
        border-left:1px solid var(--line);
      }
      #page-turnos .r18-event-row>div:nth-child(1),
      #page-turnos .r18-event-row>div:nth-child(4){
        text-align:center;
        align-items:center;
      }
      #page-turnos .r18-event-row>div:nth-child(3){
        flex-direction:row;
        align-items:center;
        justify-content:flex-start;
        gap:5px;
      }
      #page-turnos .r18-event-row>div:nth-child(5){
        line-height:1.35;
      }
      #page-turnos .r18-event-row .actions{
        display:grid!important;
        grid-template-columns:1fr 1fr;
        align-content:center;
        gap:6px;
        padding:8px!important;
      }
      #page-turnos .r18-event-row .actions .btn{
        min-width:0!important;
        width:100%;
        padding-left:7px!important;
        padding-right:7px!important;
        white-space:nowrap;
      }
    }
    @media(min-width:901px) and (max-width:1180px){
      #page-turnos .r18-event-row{
        grid-template-columns:95px minmax(160px,1fr) minmax(145px,.9fr) 90px minmax(190px,1.4fr) 120px!important;
      }
      #page-turnos .r18-event-row>div{padding:8px 7px}
      #page-turnos .r18-event-row .actions{padding:7px!important;gap:5px}
    }
    @media(max-width:900px){
      #page-turnos .r18-event-row{
        align-items:start;
      }
      #page-turnos .r18-event-row>div{
        min-width:0;
        overflow-wrap:anywhere;
      }
      #page-turnos .r18-event-row .actions{
        display:flex;
        gap:8px;
        flex-wrap:wrap;
      }
      #page-turnos .r18-event-row .actions .btn{
        flex:1 1 120px;
      }
    }
  `;
  document.head.appendChild(style);
})();
