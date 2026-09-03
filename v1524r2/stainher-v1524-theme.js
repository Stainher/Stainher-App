/* Stainher V15.24 · tema accesible y persistente. Capa final, sin alterar PDFs. */
(()=>{
  'use strict';
  const KEY='stainher-theme-v1',DARK='dark',LIGHT='light';
  const css=`
    /* Tipografía transversal: títulos consistentes, sin negrita. */
    html body,html body :where(button,input,select,textarea){font-family:Inter,Arial,sans-serif}
    html body :where(p,small,label,li,td,th,dt,dd,input,select,textarea,button,.btn,.muted,.tag,.status){font-weight:400!important}
    html body :where(strong,b):not(:where(h1,h2,h3,h4,h5,h6,summary) *){font-weight:500!important}
    html body :where(h1,h2,h3,h4,h5,h6,.page-title,.section-title,.card-title){font-weight:600!important}
    html body :where(summary,.stainher-disclosure-title){font-weight:500!important}
    body h1,body h2,body h3,body h4,body h5,body h6,
    body .page-title,body .section-title,body .panel-title,body .card-title,
    body .stainher-disclosure-title,body .stainher-disclosure-summary,
    body summary h1,body summary h2,body summary h3,body summary h4,
    body .v151-mobile-title strong,body .sidebar .brand h1{
      font-family:inherit!important;font-weight:500!important
    }
    body .v151-mobile-title strong{
      display:flex!important;align-items:center!important;gap:7px!important
    }
    body .stainher-mobile-title-icon{display:inline-flex!important;flex:0 0 auto!important}
    body .stainher-mobile-title-label{display:block!important;min-width:0!important;overflow:hidden!important;text-overflow:ellipsis!important}
    :root[data-theme="light"]{color-scheme:light;--bg:#f3f6fa;--panel:#fff;--panel2:#eaf0f6;--line:#c7d1dd;--text:#182230;--muted:#5b6878;--green:#087a57;--yellow:#8a5a00;--red:#b4233c;--blue:#1769c2}
    :root[data-theme="dark"]{color-scheme:dark}
    [data-theme="light"] body{background:radial-gradient(circle at 10% 0%,#fff 0,#f3f6fa 38%);color:var(--text)}
    [data-theme="light"] .sidebar,[data-theme="light"] .sidebar-bottom{background:#fff}
    [data-theme="light"] .nav button,[data-theme="light"] .logout,[data-theme="light"] .btn{color:#1d2939}
    [data-theme="light"] .nav button:hover,[data-theme="light"] .nav button.active{background:#e7eef7;color:#101828}
    [data-theme="light"] .panel,[data-theme="light"] .userbox,[data-theme="light"] .modal,[data-theme="light"] .login,
    [data-theme="light"] .equipment-card,[data-theme="light"] .kpi,[data-theme="light"] .storage-card,[data-theme="light"] .contract-card,
    [data-theme="light"] .vehicle-card,[data-theme="light"] .crew-card,[data-theme="light"] .event-card,[data-theme="light"] .mini-stat,
    [data-theme="light"] .prev-equipment-card{background:#fff;color:var(--text);box-shadow:0 1px 2px rgba(16,24,40,.04)}
    [data-theme="light"] .field,[data-theme="light"] .inline-field,[data-theme="light"] .inline-input,[data-theme="light"] .inline-select,
    [data-theme="light"] .prev-view-tab,[data-theme="light"] .contract-tabs,[data-theme="light"] .notice,[data-theme="light"] .system-stat,
    [data-theme="light"] .edp-badge,[data-theme="light"] .alert-item,[data-theme="light"] .gantt-wrap{background:#f8fafc;color:#182230;border-color:var(--line)}
    [data-theme="light"] input,[data-theme="light"] select,[data-theme="light"] textarea{color:#182230}
    [data-theme="light"] th{color:#344054}[data-theme="light"] th,[data-theme="light"] td{border-color:#d7dee8}
    [data-theme="light"] .gantt-table thead th,[data-theme="light"] .gantt-table .gantt-equipo,[data-theme="light"] .gantt-table .gantt-actividad{background:#eef3f8;color:#182230}
    [data-theme="light"] .btn.primary{color:#fff}[data-theme="light"] .muted,[data-theme="light"] small{color:var(--muted)}

    /* Cobertura final para componentes históricos con colores oscuros literales. */
    [data-theme="light"] .topbar,[data-theme="light"] .mobile-topbar,[data-theme="light"] .mobile-header,
    [data-theme="light"] header.app-header,[data-theme="light"] .page-header{background:#fff!important;color:#182230!important;border-color:var(--line)!important}
    [data-theme="light"] .topbar h1,[data-theme="light"] .topbar h2,[data-theme="light"] .mobile-topbar h1,
    [data-theme="light"] .mobile-header h1,[data-theme="light"] .page-header h1,[data-theme="light"] .page-header h2{color:#182230!important}
    [data-theme="light"] .crew-card,[data-theme="light"] .dotacion-card,[data-theme="light"] .group-card,
    [data-theme="light"] .summary-card,[data-theme="light"] .reminder-card,[data-theme="light"] .alert-card,
    [data-theme="light"] .upcoming-card,[data-theme="light"] .birthday-card{background:#fff!important;color:#182230!important;border-color:var(--line)!important}
    [data-theme="light"] .crew-card h3,[data-theme="light"] .crew-card h4,[data-theme="light"] .dotacion-card h3,
    [data-theme="light"] .group-card h3,[data-theme="light"] .reminder-card h3,[data-theme="light"] .alert-card h3,
    [data-theme="light"] .upcoming-card h3,[data-theme="light"] .birthday-card h3{color:#182230!important}
    [data-theme="light"] .turnos-legend,[data-theme="light"] .turnos-table thead th,
    [data-theme="light"] .turnos-table tbody th,[data-theme="light"] .turnos-table .worker-cell,
    [data-theme="light"] .v1512-turn-grid thead th,[data-theme="light"] .v1512-turn-grid tbody th,
    [data-theme="light"] .v1512-turn-grid .worker-cell{background:#eef3f8!important;color:#182230!important;border-color:#d7dee8!important}
    [data-theme="light"] .turnos-legend span,[data-theme="light"] .turnos-table tbody th *,
    [data-theme="light"] .turnos-table .worker-cell *{color:#344054!important}
    [data-theme="light"] .event-card,[data-theme="light"] .event-card *{color:#344054}
    [data-theme="light"] .event-card{background:#fff!important}
    [data-theme="light"] .event-card h3,[data-theme="light"] .event-card h4,[data-theme="light"] .event-card strong{color:#182230!important}

    /* Inicio > Dotación en turno hoy: neutraliza fondos literales del módulo V15.24. */
    html[data-theme="light"] body details[data-stainher-panel="staffing"],
    html[data-theme="light"] body details[data-stainher-home-panel="staffing"],
    html[data-theme="light"] body details.stainher-staffing-panel,
    html[data-theme="light"] body details.stainher-home-staffing,
    html[data-theme="light"] body details[data-stainher-panel="staffing"] > :not(summary),
    html[data-theme="light"] body details[data-stainher-home-panel="staffing"] > :not(summary),
    html[data-theme="light"] body details.stainher-staffing-panel > :not(summary),
    html[data-theme="light"] body details.stainher-home-staffing > :not(summary),
    html[data-theme="light"] body #page-inicio [data-stainher-home-panel="staffing"] .v1524-home-kpis,
    html[data-theme="light"] body #page-inicio [data-stainher-home-panel="staffing"] .v1524-home-shifts,
    html[data-theme="light"] body #page-inicio [data-stainher-home-panel="staffing"] .v1524-home-grid,
    html[data-theme="light"] body .v1524-home-kpi,
    html[data-theme="light"] body .v1524-home-group,
    html[data-theme="light"] body .v1524-home-person{
      background:#fff!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body .v1524-home-group h4{
      background:#eef3f8!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body .v1524-home-kpi b,
    html[data-theme="light"] body .v1524-home-person b,
    html[data-theme="light"] body .v1524-home-shifts .empty{
      color:#182230!important
    }
    html[data-theme="light"] body .v1524-home-kpi span,
    html[data-theme="light"] body .v1524-home-person small,
    html[data-theme="light"] body .v1524-home-shifts .muted{
      color:#5b6878!important
    }
    html[data-theme="light"] body .v1524-home-badge.normal{background:#e8f2ff!important;color:#175da8!important;border-color:#72a7df!important}
    html[data-theme="light"] body .v1524-home-badge.inside{background:#e7f8f1!important;color:#087a57!important;border-color:#69b99d!important}
    html[data-theme="light"] body .v1524-home-badge.outside{background:#fff3df!important;color:#8a4b00!important;border-color:#d99a48!important}
    html[data-theme="light"] body .v1524-home-badge.suspended{background:#fdecef!important;color:#a51d38!important;border-color:#d47a8d!important}
    html[data-theme="light"] body .v1524-home-badge.additional{background:#f4ebff!important;color:#6941a5!important;border-color:#aa87d6!important}

    /* Auditoría transversal: superficies históricas de todos los módulos. */
    [data-theme="light"] .home-datebox,[data-theme="light"] .home-kpi,[data-theme="light"] .home-panel,
    [data-theme="light"] .home-equipment-mini,[data-theme="light"] .home-alert-card,[data-theme="light"] .home-contract-item,
    [data-theme="light"] .v1521-home-person,[data-theme="light"] .v1522-home-person,[data-theme="light"] .v1524-home-person,
    [data-theme="light"] .control-card-v95,[data-theme="light"] .leadership-card,[data-theme="light"] .v11-eval,
    [data-theme="light"] .v11-system-card,[data-theme="light"] .v12-person-card,[data-theme="light"] .v13-check-section,
    [data-theme="light"] .v13-doc-details,[data-theme="light"] .v13-usage-item,[data-theme="light"] .v15-check-card,
    [data-theme="light"] .v15-summary-card,[data-theme="light"] .v1512-mini-kpi,[data-theme="light"] .v1512-record-card,
    [data-theme="light"] .v1516-user-card,[data-theme="light"] .v1517-own-kpis,[data-theme="light"] .v1519-prev-card,
    [data-theme="light"] .v152-request-card,[data-theme="light"] .v1520-contract-card,[data-theme="light"] .v1523-user-card,
    [data-theme="light"] .v155-group-card,[data-theme="light"] .v155-person-card,[data-theme="light"] .v156-page-card,
    [data-theme="light"] .v156-person-card,[data-theme="light"] .v157-ext-card,[data-theme="light"] .v157-group,
    [data-theme="light"] .v158-review-block,[data-theme="light"] .v158-review-kpi,[data-theme="light"] .v158-user-card{
      background:#fff!important;color:#182230!important;border-color:var(--line)!important
    }
    [data-theme="light"] .contract-tabs,[data-theme="light"] .v1519-contract-tabs,[data-theme="light"] .v154-corr-tabs-fixed,
    [data-theme="light"] .v156-nav,[data-theme="light"] .v157-nav,[data-theme="light"] .v157-user-menu,
    [data-theme="light"] .v1519-action-pop,[data-theme="light"] .v1519-inventory-details,
    [data-theme="light"] .v1523-prev-equipment-group,[data-theme="light"] .v1523-turn-day-detail{
      background:#f8fafc!important;color:#182230!important;border-color:var(--line)!important
    }
    [data-theme="light"] .contract-tab.active,[data-theme="light"] .v1519-contract-tabs .btn.active,
    [data-theme="light"] .prev-view-tab.active,[data-theme="light"] .v1520-tabs .btn.active{
      background:#dbeafe!important;color:#12345b!important;border-color:#86b7ef!important
    }
    [data-theme="light"] .v151-mobile-head,[data-theme="light"] .v151-mobile-bottom,
    [data-theme="light"] .v15-mobile-toolbar,[data-theme="light"] .v157-user-trigger{
      background:#fff!important;color:#182230!important;border-color:var(--line)!important
    }
    [data-theme="light"] .v151-mobile-head h1,[data-theme="light"] .v151-mobile-head h2,
    [data-theme="light"] .v151-mobile-bottom button,[data-theme="light"] .v15-mobile-toolbar button{color:#182230!important}
    [data-theme="light"] .v151-mobile-bottom button.active{background:#e7eef7!important;color:#101828!important}
    [data-theme="light"] .v1512-turn-legend,[data-theme="light"] .v1524-compact-legend,
    [data-theme="light"] .v1512-turn-wrap,[data-theme="light"] .v1520-turn-matrix,
    [data-theme="light"] .v1520-turn-calendar,[data-theme="light"] .v1520-gantt,
    [data-theme="light"] .v1519-gantt-wrap,[data-theme="light"] .v1523-prev-day-grid{
      background:#fff!important;color:#182230!important;border-color:var(--line)!important
    }
    [data-theme="light"] .v1512-turn-table th,[data-theme="light"] .v1512-turn-table td:first-child,
    [data-theme="light"] .v1520-turn-matrix th,[data-theme="light"] .v1520-turn-matrix td:first-child,
    [data-theme="light"] .v1520-weekday,[data-theme="light"] .v1520-gantt th,
    [data-theme="light"] .v1520-gantt td:first-child,[data-theme="light"] .v1519-gantt th,
    [data-theme="light"] .v1519-gantt td,[data-theme="light"] .v1519-gantt .sticky1,
    [data-theme="light"] .v1519-gantt .sticky2,[data-theme="light"] .v1519-gantt .sticky3,
    [data-theme="light"] .v1523-prev-day-grid thead th,[data-theme="light"] .v1523-prev-day-grid .equipment,
    [data-theme="light"] .v1523-audit-table th:first-child,[data-theme="light"] .v1523-audit-table td:first-child{
      background:#eef3f8!important;color:#182230!important;border-color:#d7dee8!important
    }
    [data-theme="light"] .v1520-day,[data-theme="light"] .v1523-reemb-grid-row,
    [data-theme="light"] .v1523-turn-person,[data-theme="light"] .v1523-turn-event,
    [data-theme="light"] .v1521-gantt-unplanned-item,[data-theme="light"] .v1523-prev-unplanned-group{
      background:#fff!important;color:#182230!important;border-color:var(--line)!important
    }
    [data-theme="light"] .v1520-table th,[data-theme="light"] .v1523-reemb-grid-head,
    [data-theme="light"] .v1523-prev-equipment-head{background:#eef3f8!important;color:#344054!important}
    [data-theme="light"] .v1523-prev-period-note,[data-theme="light"] .v1519-period-summary,
    [data-theme="light"] .v1512-period-note,[data-theme="light"] .edp-period-note,
    [data-theme="light"] .sap-note{background:#edf4fb!important;color:#344054!important;border-color:#a9bfd8!important}
    [data-theme="light"] .v11-permission-grid,[data-theme="light"] .permission-grid,
    [data-theme="light"] .v12-form-table,[data-theme="light"] .v13-fatigue-table,
    [data-theme="light"] .edp-table-v8,[data-theme="light"] .admin-table,[data-theme="light"] .inventory-table{
      color:#182230!important;border-color:#d7dee8!important
    }
    [data-theme="light"] .global-meta .meta-chip,[data-theme="light"] .v1514-global-meta .meta-chip,
    [data-theme="light"] .v15-version-chip,[data-theme="light"] .v1513-version-meta,
    [data-theme="light"] .v1518-weekday,[data-theme="light"] .v1523-prev-view-badge{
      background:#eef3f8!important;color:#344054!important;border-color:var(--line)!important
    }
    [data-theme="light"] .modal-bg{background:rgba(15,23,42,.38)}
    [data-theme="light"] .v1521-review-page{background:#f3f6fa!important;color:#182230!important}
    [data-theme="light"] .v158-review-actions{background:#fff!important;border-color:var(--line)!important}
    [data-theme="light"] .field,[data-theme="light"] input,[data-theme="light"] select,[data-theme="light"] textarea,
    [data-theme="light"] .inline-field,[data-theme="light"] .inline-input,[data-theme="light"] .inline-select{
      background:#fff!important;color:#182230!important;border-color:#aebac8!important
    }
    [data-theme="light"] input::placeholder,[data-theme="light"] textarea::placeholder{color:#667085!important;opacity:1}
    [data-theme="light"] .panel h1,[data-theme="light"] .panel h2,[data-theme="light"] .panel h3,[data-theme="light"] .panel h4,
    [data-theme="light"] .home-panel h1,[data-theme="light"] .home-panel h2,[data-theme="light"] .home-panel h3,
    [data-theme="light"] .contract-card h3,[data-theme="light"] .contract-card h4,
    [data-theme="light"] .equipment-card h3,[data-theme="light"] .equipment-card h4,
    [data-theme="light"] .vehicle-card h3,[data-theme="light"] .vehicle-card h4{color:#182230!important}
    [data-theme="light"] .forecast-filter-v9,[data-theme="light"] .forecast-month-summary-v8,
    [data-theme="light"] .latest-ep-card,[data-theme="light"] .merged-equipment,[data-theme="light"] .reimb-primary-v9,
    [data-theme="light"] .section-v95,[data-theme="light"] .terrain-check-v95,[data-theme="light"] .terrain-form-v95,
    [data-theme="light"] .v11-group-title,[data-theme="light"] .v11-terrain-head,[data-theme="light"] .v12-doc,
    [data-theme="light"] .v14-license-options,[data-theme="light"] .v15-change,[data-theme="light"] .v15-event,
    [data-theme="light"] .v15-wizard,[data-theme="light"] .v151-alert,[data-theme="light"] .v151-crew,
    [data-theme="light"] .v151-detail-item,[data-theme="light"] .v151-dot-kpi,[data-theme="light"] .v151-event,
    [data-theme="light"] .v151-person-row,[data-theme="light"] .v1512-person-mobile,
    [data-theme="light"] .v1512-signature-frame,[data-theme="light"] .v1513-turn-period-value,
    [data-theme="light"] .v1514-import-stat,[data-theme="light"] .v1517-profile-flags,
    [data-theme="light"] .v152-alert-card,[data-theme="light"] .v153-person-row,[data-theme="light"] .v153-report-options,
    [data-theme="light"] .v153-scope,[data-theme="light"] .v154-check-group,[data-theme="light"] .v154-doc-row,
    [data-theme="light"] .v154-notification,[data-theme="light"] .v154-perm-row,[data-theme="light"] .v154-sign-full,
    [data-theme="light"] .v154-signature-box,[data-theme="light"] .v156-changes,[data-theme="light"] .v159-gantt-equipment{
      background:#fff!important;color:#182230!important;border-color:var(--line)!important
    }
    [data-theme="light"] .control-number-v95,[data-theme="light"] .iva-total-v8,[data-theme="light"] .no-store-v95,
    [data-theme="light"] .terrain-status-v95,[data-theme="light"] .v11-readonly-badge,[data-theme="light"] .v11-readonly-note,
    [data-theme="light"] .v15-type,[data-theme="light"] .v151-pill,[data-theme="light"] .v152-request-type,
    [data-theme="light"] .v154-status-badge,[data-theme="light"] .v157-seg,[data-theme="light"] .v158-choice{
      background:#eef3f8!important;color:#344054!important;border-color:var(--line)!important
    }
    [data-theme="light"] .v151-menu-btn,[data-theme="light"] .v15-notify-btn,
    [data-theme="light"] .v154-check-choice,[data-theme="light"] .v157-ext-check{
      background:#f8fafc!important;color:#182230!important;border-color:var(--line)!important
    }
    [data-theme="light"] .v1512-turn-cell,[data-theme="light"] .v159-gantt-item{color:#182230}
    [data-theme="light"] .v1518-nav-icon{background:#e7eef7!important;color:#1769c2!important}
    [data-theme="light"] .v156-progress,[data-theme="light"] .v157-progress{background:#dfe7f0!important}
    [data-theme="light"] .vehicle-photo-main{background:#eef3f8!important;border-color:var(--line)!important}

    /* Confiabilidad: cobertura completa del tema claro para opciones, KPI y gráficos. */
    html[data-theme="light"] body #modalRoot .v153-report-options,
    html[data-theme="light"] body #modalRoot .v153-report-options label,
    html[data-theme="light"] body #modalRoot .v158-review-field,
    html[data-theme="light"] body #page-correctivo :where(.panel,.kpi,.chart-wrap,.v158-review-kpi){
      background:#fff!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body #modalRoot .v153-report-options label{
      display:flex!important;align-items:center!important;gap:9px!important;
      font-weight:400!important;background:#f8fafc!important
    }
    html[data-theme="light"] body #modalRoot .v153-report-options label :where(span,b,strong){
      color:#182230!important;font-weight:400!important
    }
    html[data-theme="light"] body #modalRoot .v153-report-options input[type="checkbox"]{
      accent-color:#1769c2!important
    }
    html[data-theme="light"] body #page-correctivo :where(.panel,.kpi,.chart-wrap) :where(p,span,small,label,li,td,th){
      color:#344054!important;font-weight:400!important
    }
    html[data-theme="light"] body #page-correctivo :where(.panel,.kpi) :where(h1,h2,h3,h4,h5,h6,.stainher-disclosure-title){
      color:#182230!important;font-weight:600!important
    }
    html[data-theme="light"] body #page-correctivo .kpi>strong{
      color:#182230!important;font-weight:500!important
    }

    /* Turnos: ficha diaria y formularios internos sin superficies oscuras. */
    html[data-theme="light"] body #modalRoot .v1524-day-modal,
    html[data-theme="light"] body #modalRoot .v1524-base-card,
    html[data-theme="light"] body #modalRoot .v1524-event-card,
    html[data-theme="light"] body #modalRoot .v1524-existing-event,
    html[data-theme="light"] body #modalRoot .v1524-rule-box{
      background:#fff!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body #modalRoot .v1524-base-card,
    html[data-theme="light"] body #modalRoot .v1524-event-card{
      box-shadow:0 1px 2px rgba(16,24,40,.04)!important
    }
    html[data-theme="light"] body #modalRoot .v1524-rule-box,
    html[data-theme="light"] body #modalRoot .v1524-existing-event{
      background:#f8fafc!important
    }
    html[data-theme="light"] body #modalRoot .v1524-day-modal :where(p,span,small,label,.muted,.empty){
      color:#475467!important;font-weight:400!important
    }
    html[data-theme="light"] body #modalRoot .v1524-day-modal :where(h1,h2,h3,h4,h5,h6){
      color:#182230!important;font-weight:600!important
    }
    html[data-theme="light"] body #modalRoot .v1524-day-modal .v1524-rule-box :where(b,strong){
      color:#182230!important;font-weight:500!important
    }
    html[data-theme="light"] body #modalRoot :where(.v1524-user-calendar,.v1524-calendar-day,.v1524-detail-group){
      background:#fff!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body #modalRoot :where(.v1524-detail-group h4,.v1524-report-summary thead th){
      background:#eef3f8!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body #modalRoot .v1524-report-summary :where(th,td){
      background:#fff!important;color:#344054!important;border-color:#d7dee8!important;font-weight:400!important
    }
    html[data-theme="light"] body #modalRoot .v1524-report-summary tfoot td{
      background:#eef3f8!important;color:#182230!important;font-weight:500!important
    }

    /* V15.24 revisión 2: neutraliza reglas móviles antiguas que usan !important. */
    html[data-theme="light"] body .sidebar,
    html[data-theme="light"] body .sidebar-bottom,
    html[data-theme="light"] body .userbox{
      background:#fff!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body .sidebar .brand h1,
    html[data-theme="light"] body .sidebar .brand small,
    html[data-theme="light"] body .sidebar .nav button,
    html[data-theme="light"] body .sidebar .userbox strong,
    html[data-theme="light"] body .sidebar .userbox small{
      color:#344054!important
    }
    html[data-theme="light"] body .sidebar .nav button:hover,
    html[data-theme="light"] body .sidebar .nav button.active{
      background:#e7eef7!important;color:#101828!important
    }
    body .sidebar .nav{
      display:flex!important;flex-direction:column!important;align-items:stretch!important;
      gap:4px!important;min-height:0!important;overflow-y:auto!important
    }
    body .sidebar .nav button[data-page]{
      flex:0 0 auto!important;width:100%!important;height:auto!important;min-height:48px!important;
      margin:0!important;padding:9px 10px!important;line-height:1.25!important;
      white-space:normal!important;overflow:visible!important;text-align:left!important
    }
    body .sidebar .nav button[data-page]>:first-child{
      flex:0 0 auto!important;align-self:flex-start!important
    }
    /* Escritorio: la cuenta queda anclada abajo y solo navega la lista de módulos. */
    @media(min-width:761px){
      body .sidebar{
        position:sticky!important;top:0!important;height:100vh!important;height:100dvh!important;
        min-height:100vh!important;min-height:100dvh!important;max-height:100vh!important;max-height:100dvh!important;
        display:flex!important;flex-direction:column!important;overflow:hidden!important
      }
      body .sidebar>.nav{
        flex:1 1 auto!important;min-height:0!important;max-height:none!important;
        overflow-x:hidden!important;overflow-y:auto!important;padding-bottom:12px!important
      }
      body .sidebar>.sidebar-bottom{
        position:static!important;inset:auto!important;flex:0 0 auto!important;
        width:100%!important;margin-top:auto!important;padding-top:10px!important;padding-bottom:0!important;
        z-index:3!important
      }
    }
    html[data-theme="light"] body .v151-mobile-head,
    html[data-theme="light"] body #v151MobileBottom,
    html[data-theme="light"] body .v151-mobile-bottom{
      background:rgba(255,255,255,.98)!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body .v151-mobile-title strong,
    html[data-theme="light"] body .v151-mobile-title small,
    html[data-theme="light"] body .v151-mobile-bottom button,
    html[data-theme="light"] body .v151-mobile-bottom button b{
      color:#344054!important
    }
    html[data-theme="light"] body .v151-mobile-bottom button.active{
      background:#e7eef7!important;color:#101828!important
    }

    /* Componentes móviles heredados con reglas por ID y !important. */
    html[data-theme="light"] body #v151MobileHead{
      background:rgba(255,255,255,.98)!important;
      color:#182230!important;
      border-bottom-color:#c7d1dd!important;
      box-shadow:0 1px 3px rgba(16,24,40,.08)!important
    }
    html[data-theme="light"] body #v151MobileHead .v151-mobile-title strong,
    html[data-theme="light"] body #v151MobileHead .v151-mobile-title small{
      color:#344054!important
    }
    html[data-theme="light"] body #v151MobileHead .v151-menu-btn,
    html[data-theme="light"] body #v151MobileHead #v15NotifyBtn{
      background:#f8fafc!important;color:#182230!important;border-color:#aebdce!important
    }
    html[data-theme="light"] body .v1514-global-meta>span,
    html[data-theme="light"] body .global-meta>span,
    html[data-theme="light"] body .global-meta>.meta-chip{
      background:#eef3f8!important;color:#344054!important;border-color:#aebdce!important
    }
    html[data-theme="light"] body .v157-user-trigger{
      background:#fff!important;color:#182230!important;border-color:#aebdce!important
    }
    html[data-theme="light"] body .v157-avatar{
      background:#e7eef7!important;color:#12345b!important;border:1px solid #b9c8da!important
    }
    html[data-theme="light"] body .v157-user-copy strong,
    html[data-theme="light"] body .v157-user-copy small{
      color:#344054!important
    }

    html[data-theme="light"] body .v157-group,
    html[data-theme="light"] body .v157-group>summary,
    html[data-theme="light"] body .v157-group-body,
    html[data-theme="light"] body .v157-person,
    html[data-theme="light"] body .v157-person-detail,
    html[data-theme="light"] body .v157-doc,
    html[data-theme="light"] body .v157-user-menu{
      background:#fff!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body .v157-group-head b,
    html[data-theme="light"] body .v157-person-name,
    html[data-theme="light"] body .v157-person-role,
    html[data-theme="light"] body .v157-person-detail>summary,
    html[data-theme="light"] body .v157-doc-name,
    html[data-theme="light"] body .v157-doc-meta b,
    html[data-theme="light"] body .v157-user-menu button{
      color:#182230!important
    }
    html[data-theme="light"] body .v157-group-head span,
    html[data-theme="light"] body .v157-doc-meta small{
      color:#5b6878!important
    }

    html[data-theme="light"] body .stainher-native-control-shell,
    html[data-theme="light"] body .stainher-date-picker>input,
    html[data-theme="light"] body .v1519-period-summary,
    html[data-theme="light"] body .v1523-prev-period-note,
    html[data-theme="light"] body .global-meta .meta-chip,
    html[data-theme="light"] body .v1514-global-meta .meta-chip{
      background:#fff!important;color:#182230!important;border-color:#aebac8!important
    }
    html[data-theme="light"] body .stainher-native-control-shell__value,
    html[data-theme="light"] body .v1519-period-summary span,
    html[data-theme="light"] body .v1523-prev-period-note b{
      color:#182230!important
    }

    html[data-theme="light"] body :where(
      .v1520-kpi,.v1520-table-wrap,.v1520-contract-card,.v1520-readonly,
      .v1519-inventory-details,.v1519-inventory-body,.v1523-reemb-grid,.v1523-reemb-grid-row,
      .v1523-turn-day-detail,.v1523-turn-person,.v1523-turn-event,
      .v1523-prev-equipment-group,.v1523-prev-day-grid,.v1523-prev-unplanned-group
    ){
      background:#fff!important;color:#182230!important;border-color:#c7d1dd!important
    }
    html[data-theme="light"] body :where(
      .v1520-table th,.v1520-weekday,.v1520-turn-matrix th,.v1520-turn-matrix td:first-child,
      .v1520-gantt th,.v1520-gantt td:first-child,.v1523-reemb-grid-head,
      .v1523-prev-equipment-head,.v1523-prev-day-grid thead th,.v1523-prev-day-grid .equipment,
      .v1523-prev-unplanned-group>header
    ){
      background:#eef3f8!important;color:#344054!important;border-color:#d7dee8!important
    }

    /* Montos extensos: prioriza mostrar el número completo dentro de cada tarjeta. */
    :is(#page-contrato,#page-administracion) .v1520-kpis>.v1520-kpi:nth-child(-n+2) b,
    :is(#page-contrato,#page-administracion) .v1524-contract-money-value{
      max-width:100%!important;font-size:clamp(16px,3.7vw,24px)!important;
      line-height:1.08!important;letter-spacing:-.035em!important;white-space:nowrap!important;
      overflow:visible!important;font-variant-numeric:tabular-nums!important
    }
    @media(max-width:430px){
      :is(#page-contrato,#page-administracion) .v1520-kpis>.v1520-kpi:nth-child(-n+2) b,
      :is(#page-contrato,#page-administracion) .v1524-contract-money-value{font-size:16px!important}
    }
    [data-theme="light"] .btn.active,[data-theme="light"] button[aria-selected="true"],
    [data-theme="light"] [role="tab"].active,[data-theme="light"] [role="tab"][aria-selected="true"]{
      background:#dbeafe!important;color:#12345b!important;border-color:#86b7ef!important;
      box-shadow:inset 0 0 0 1px rgba(23,105,194,.12)
    }
    [data-theme="dark"] .btn.active,[data-theme="dark"] button[aria-selected="true"],
    [data-theme="dark"] [role="tab"].active,[data-theme="dark"] [role="tab"][aria-selected="true"]{
      background:#202c3b;color:#fff;border-color:#5b789c
    }

    .stainher-theme-toggle{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin:8px 0 0;min-height:40px}
    .v157-user-menu .stainher-theme-toggle{margin:0;text-align:left;justify-content:flex-start}
    @media(max-width:760px){.userbox>.stainher-theme-toggle{width:auto;min-width:150px}}
  `;
  function preference(){try{const v=localStorage.getItem(KEY);if(v===DARK||v===LIGHT)return v}catch(_){ }return matchMedia?.('(prefers-color-scheme: light)').matches?LIGHT:DARK}
  function refreshCharts(value){
    if(!window.Chart)return;
    const light=value===LIGHT;
    const textColor=light?'#475467':'#c7d2df';
    const gridColor=light?'rgba(71,84,103,.16)':'rgba(184,200,218,.14)';
    const pastel=light
      ?['rgba(111,155,196,.72)','rgba(104,174,157,.72)','rgba(204,165,108,.72)','rgba(155,137,190,.70)','rgba(194,132,150,.68)']
      :['rgba(137,179,216,.70)','rgba(127,195,174,.68)','rgba(220,185,125,.68)','rgba(180,159,213,.68)','rgba(213,153,172,.66)'];
    const borders=light?['#557fa7','#4c9582','#a97b3e','#7965a0','#9e6074']:['#a9cbea','#9dd8c6','#efd29b','#c8b4e7','#e7afc0'];
    Chart.defaults.color=textColor;Chart.defaults.borderColor=gridColor;
    const charts=new Set([...Object.values(window.state?.charts||{}),...Object.values(Chart.instances||{})]);
    for(const chart of charts)try{
      if(!chart?.data?.datasets)continue;
      const type=chart.config?.type||chart.data.datasets[0]?.type;
      chart.data.datasets.forEach((dataset,index)=>{
        if(type==='line'||dataset.type==='line'){
          dataset.borderColor=borders[index%borders.length];
          dataset.backgroundColor=pastel[index%pastel.length].replace(/\.[0-9]+\)$/,light?'.16)':'.20)');
          dataset.pointBackgroundColor=borders[index%borders.length];
          dataset.pointBorderColor=light?'#fff':'#111923';dataset.pointRadius=3;dataset.borderWidth=2;
        }else{
          const count=Math.max(dataset.data?.length||1,1);
          dataset.backgroundColor=Array.from({length:count},(_,i)=>pastel[(i+index)%pastel.length]);
          dataset.borderColor=Array.from({length:count},(_,i)=>borders[(i+index)%borders.length]);
          dataset.borderWidth=1;
        }
      });
      const scales=chart.options?.scales||{};
      Object.values(scales).forEach(scale=>{
        scale.ticks={...(scale.ticks||{}),color:textColor};
        scale.title={...(scale.title||{}),color:textColor};
        scale.grid={...(scale.grid||{}),color:gridColor};
        scale.border={...(scale.border||{}),color:gridColor};
      });
      if(chart.options?.plugins?.legend?.labels)chart.options.plugins.legend.labels.color=textColor;
      chart.update('none');
    }catch(_){ }
  }
  const TAB_HOSTS='.nav,.v151-mobile-bottom,.prev-view-tabs,.contract-tabs,.v1512-lead-tabs,.v1519-corr-tabs,.v1516-corr-top-tabs,.v153-corr-tabs,.v154-corr-tabs-fixed,.v1520-tabs,.v156-nav,.v157-nav,[role="tablist"]';
  function tabIdentity(button){return button.dataset.page||button.dataset.tab||button.dataset.view||button.getAttribute('onclick')||button.textContent.trim()}
  function syncActiveTab(button){
    const host=button.closest(TAB_HOSTS);if(!host)return;
    const page=host.closest('.page'),hostId=host.id||'',hostClass=[...host.classList].find(x=>!['active','hidden'].includes(x))||'',identity=tabIdentity(button);
    const update=()=>{let current=host.isConnected?host:null;if(!current&&hostId)current=document.getElementById(hostId);if(!current&&page?.id&&hostClass)current=document.querySelector(`#${CSS.escape(page.id)} .${CSS.escape(hostClass)}`);if(!current&&hostClass)current=document.querySelector(`.${CSS.escape(hostClass)}`);if(!current)return;const buttons=[...current.querySelectorAll('button,[role="tab"]')],selected=buttons.find(x=>tabIdentity(x)===identity);if(!selected)return;buttons.forEach(x=>{const active=x===selected;x.classList.toggle('active',active);if(x.matches('[role="tab"],.contract-tab,.prev-view-tab,.btn'))x.setAttribute('aria-selected',String(active))})};
    update();queueMicrotask(update);requestAnimationFrame(()=>requestAnimationFrame(update));setTimeout(update,80)
  }
  function apply(theme,persist=false){const value=theme===LIGHT?LIGHT:DARK;document.documentElement.dataset.theme=value;if(persist)try{localStorage.setItem(KEY,value)}catch(_){ }document.querySelectorAll('[data-stainher-theme-toggle]').forEach(b=>{b.innerHTML=value===DARK?'☀ Tema claro':'☾ Tema oscuro';b.setAttribute('aria-label',value===DARK?'Activar tema claro':'Activar tema oscuro');b.setAttribute('aria-pressed',String(value===LIGHT))});refreshCharts(value);window.dispatchEvent(new CustomEvent('stainher:theme-change',{detail:{theme:value}}));}
  function ensureToggle(){const accountMenu=document.getElementById('v157UserMenu'),host=accountMenu||document.querySelector('.userbox');if(!host||host.querySelector('[data-stainher-theme-toggle]'))return;const b=document.createElement('button');b.type='button';b.className=accountMenu?'stainher-theme-toggle':'logout stainher-theme-toggle';b.dataset.stainherThemeToggle='1';b.onclick=()=>apply(document.documentElement.dataset.theme===DARK?LIGHT:DARK,true);if(accountMenu)host.insertBefore(b,host.querySelector('.danger'));else host.insertBefore(b,document.getElementById('logoutBtn'));apply(document.documentElement.dataset.theme||preference())}
  function install(){if(!document.getElementById('stainher-theme-style')){const s=document.createElement('style');s.id='stainher-theme-style';s.textContent=css;document.head.appendChild(s)}ensureToggle();const root=document.getElementById('appView')||document.body;let chartRefreshTimer;new MutationObserver(()=>{ensureToggle();clearTimeout(chartRefreshTimer);chartRefreshTimer=setTimeout(()=>refreshCharts(document.documentElement.dataset.theme||preference()),120)}).observe(root,{childList:true,subtree:true});document.addEventListener('click',event=>{const button=event.target.closest?.('button,[role="tab"]');if(button?.closest(TAB_HOSTS)){syncActiveTab(button);setTimeout(()=>refreshCharts(document.documentElement.dataset.theme||preference()),160)}},true);apply(document.documentElement.dataset.theme||preference())}
  apply(preference());if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.StainherTheme=Object.freeze({set:t=>apply(t,true),get:()=>document.documentElement.dataset.theme});
})();

/* V15.24 · carga coordinada de correcciones globales publicadas el 03-09-2026. */
(()=>{
  const source=document.currentScript?.src||location.href;
  const modules=['stainher-v1524-collapsible.js','stainher-v1524-medical-leave.js','stainher-v1524-date-picker.js','stainher-v1524-home-layout.js','stainher-v1524-action-colors.js','stainher-v1524-number-fit.js','stainher-v1524-turn-legend.js','stainher-v1524-equipment-plan-assistant.js','stainher-v1524-navigation-stability.js','stainher-v1524-reliability-sync.js','stainher-v1524-corrective-actions.js'];
  async function load(file){
    const existing=document.querySelector(`script[data-stainher-module="${file}"]`);
    if(existing){
      if(existing.dataset.stainherLoaded==='1')return;
      await new Promise(resolve=>{existing.addEventListener('load',resolve,{once:true});existing.addEventListener('error',resolve,{once:true})});return;
    }
    await new Promise((resolve,reject)=>{
      const script=document.createElement('script');
      script.src=new URL(file,source).href+'?v=20260903-r19';script.async=false;script.dataset.stainherModule=file;
      script.addEventListener('load',()=>{script.dataset.stainherLoaded='1';resolve()},{once:true});
      script.addEventListener('error',()=>reject(new Error(`No se pudo cargar ${file}`)),{once:true});
      document.head.appendChild(script);
    });
  }
  (async()=>{for(const file of modules)await load(file)})().catch(error=>console.error('[Stainher UI]',error));
})();
