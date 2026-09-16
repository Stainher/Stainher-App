/* Stainher V15.24 · R85 · Cuadrícula de Presupuestos.
 * Alinea encabezados, datos numéricos y acciones en columnas consistentes.
 * Solo presentación; no modifica datos, cálculos ni navegación.
 */
(()=>{
  'use strict';
  const BUILD='20260916-r85-presupuestos-grid';
  if(window.__STAINHER_PRESUPUESTOS_GRID_R85__===BUILD)return;
  window.__STAINHER_PRESUPUESTOS_GRID_R85__=BUILD;

  const id='stainher-presupuestos-grid-r85-style';
  document.getElementById(id)?.remove();
  const style=document.createElement('style');
  style.id=id;
  style.textContent=`
    #page-contrato .r80-list{overflow-x:auto;overflow-y:hidden}
    #page-contrato .r80-list table{
      width:100%;
      min-width:1120px;
      table-layout:fixed;
      border-collapse:collapse;
    }
    #page-contrato .r80-list th,
    #page-contrato .r80-list td{
      box-sizing:border-box;
      vertical-align:middle;
      border-right:1px solid var(--line);
      padding:10px 12px;
      overflow:hidden;
      text-overflow:ellipsis;
    }
    #page-contrato .r80-list th:last-child,
    #page-contrato .r80-list td:last-child{border-right:0}

    #page-contrato .r80-list th:nth-child(1),#page-contrato .r80-list td:nth-child(1){width:20%;text-align:left}
    #page-contrato .r80-list th:nth-child(2),#page-contrato .r80-list td:nth-child(2){width:12%;text-align:left}
    #page-contrato .r80-list th:nth-child(3),#page-contrato .r80-list td:nth-child(3){width:9%;text-align:center}
    #page-contrato .r80-list th:nth-child(4),#page-contrato .r80-list td:nth-child(4){width:9%;text-align:center}
    #page-contrato .r80-list th:nth-child(5),#page-contrato .r80-list td:nth-child(5){width:11%;text-align:right;font-variant-numeric:tabular-nums}
    #page-contrato .r80-list th:nth-child(6),#page-contrato .r80-list td:nth-child(6){width:10%;text-align:right;font-variant-numeric:tabular-nums}
    #page-contrato .r80-list th:nth-child(7),#page-contrato .r80-list td:nth-child(7){width:11%;text-align:right;font-variant-numeric:tabular-nums}
    #page-contrato .r80-list th:nth-child(8),#page-contrato .r80-list td:nth-child(8){width:18%;text-align:right}

    #page-contrato .r80-list td:nth-child(1) b,
    #page-contrato .r80-list td:nth-child(2),
    #page-contrato .r80-list td:nth-child(3),
    #page-contrato .r80-list td:nth-child(4){white-space:nowrap}

    #page-contrato .r80-list .actions{
      display:grid;
      grid-template-columns:repeat(3,minmax(58px,1fr));
      gap:7px;
      justify-content:stretch;
      align-items:center;
      width:100%;
    }
    #page-contrato .r80-list .actions .btn{
      width:100%;
      min-width:0;
      justify-content:center;
      white-space:nowrap;
      padding-left:8px;
      padding-right:8px;
    }

    @media(max-width:900px){
      #page-contrato .r80-list table{min-width:1040px}
      #page-contrato .r80-list th,#page-contrato .r80-list td{padding:9px 10px}
    }
  `;
  document.head.appendChild(style);
})();
