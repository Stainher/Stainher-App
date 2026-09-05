/* Stainher App V15.24 r18 · contraste de Turnos para tema claro.
 * Capa visual únicamente: no modifica datos, turnos ni comportamiento.
 */
(function installTurnosLightContrastR18(){
  'use strict';
  if(window.__STAINHER_TURNOS_LIGHT_CONTRAST_R18__)return;
  window.__STAINHER_TURNOS_LIGHT_CONTRAST_R18__=true;
  const id='stainher-turnos-light-contrast-r18-style';
  if(document.getElementById(id))return;
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    html[data-theme="light"] #page-turnos .r18-matrix{
      background:#fff!important;
      border-color:#b9c5d3!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix th,
    html[data-theme="light"] #page-turnos .r18-matrix td{
      border-color:#cbd5e1!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix th{
      background:#e7edf4!important;
      color:#344054!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix th:first-child,
    html[data-theme="light"] #page-turnos .r18-matrix td:first-child{
      background:#f8fafc!important;
      color:#182230!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix td:first-child b,
    html[data-theme="light"] #page-turnos .r18-mobile-person > b{
      color:#101828!important;
    }
    html[data-theme="light"] #page-turnos .r18-matrix td:first-child small,
    html[data-theme="light"] #page-turnos .r18-mobile-person > small{
      color:#5b6878!important;
    }
    html[data-theme="light"] #page-turnos .r18-shift{
      box-shadow:0 1px 1px rgba(16,24,40,.06);
      font-weight:800!important;
    }
    html[data-theme="light"] #page-turnos .r18-shift.A{
      color:#155eef!important;
      background:#e8f1ff!important;
      border-color:#72a7df!important;
    }
    html[data-theme="light"] #page-turnos .r18-shift.C{
      color:#067647!important;
      background:#e7f8f1!important;
      border-color:#69b99d!important;
    }
    html[data-theme="light"] #page-turnos .r18-shift.L{
      color:#475467!important;
      background:#eef2f6!important;
      border-color:#98a2b3!important;
    }
    html[data-theme="light"] #page-turnos .r18-event-code{
      color:#344054!important;
      background:#f8fafc!important;
      border-color:#98a2b3!important;
      font-weight:800!important;
      box-shadow:0 1px 1px rgba(16,24,40,.04);
    }
    html[data-theme="light"] #page-turnos .r18-turn-cell.editable:hover,
    html[data-theme="light"] #page-turnos .r18-mobile-day.editable:hover{
      background:#f4f8fd!important;
      outline-color:#3b82f6!important;
    }
    html[data-theme="light"] #page-turnos .r18-mobile-person,
    html[data-theme="light"] #page-turnos .r18-mobile-day,
    html[data-theme="light"] #page-turnos .r18-event-row{
      background:#fff!important;
      color:#182230!important;
      border-color:#cbd5e1!important;
    }
  `;
  document.head.appendChild(style);
})();
