/* Stainher V15.24 · tema accesible y persistente. Capa final, sin alterar PDFs. */
(()=>{
  'use strict';
  const KEY='stainher-theme-v1',DARK='dark',LIGHT='light',MODERN='modern';
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
    :root[data-theme="modern"]{
      color-scheme:light;
      --bg:#e8eef5;
      --panel:#f8fbff;
      --panel2:#edf4fa;
      --line:#b9c9d8;
      --text:#142638;
      --muted:#60758a;
      --green:#087f66;
      --yellow:#a66300;
      --red:#c83e52;
      --blue:#176fc1;
      --accent:#087f8c;
      --accent2:#e86427;
    }
    [data-theme="modern"] body{
      background:
        radial-gradient(circle at 10% 0%,rgba(20,137,151,.12),transparent 28%),
        radial-gradient(circle at 92% 3%,rgba(36,111,184,.10),transparent 26%),
        linear-gradient(180deg,#eef4f9 0%,#e5edf4 100%)!important;
      color:#142638!important;
    }
    [data-theme="modern"] :where(.sidebar,.sidebar-bottom){
      background:linear-gradient(180deg,#142c43 0%,#102337 100%)!important;
      border-color:#29465f!important;
      color:#f4f8fb!important;
      box-shadow:6px 0 24px rgba(19,44,67,.12)!important;
    }
    [data-theme="modern"] :where(.topbar,.mobile-topbar,.mobile-header,header.app-header,.page-header){
      background:rgba(248,251,255,.94)!important;
      border-color:#bfd0df!important;
      color:#142638!important;
      backdrop-filter:blur(12px);
    }
    [data-theme="modern"] :where(.panel,.userbox,.modal,.login,.equipment-card,.kpi,.storage-card,.contract-card,.vehicle-card,.crew-card,.event-card,.mini-stat,.prev-equipment-card,.v152-request-card){
      background:linear-gradient(180deg,#fbfdff 0%,#f4f8fc 100%)!important;
      border-color:#bfd0df!important;
      color:#142638!important;
      box-shadow:0 8px 24px rgba(32,64,91,.08)!important;
    }
    [data-theme="modern"] :where(.v1524-home-kpi,.v1524-home-group,.v1524-home-person,.v152-alert-card,.stainher-contract-alert-r94,.v1518-weekday,.v152-alert-days){
      background:linear-gradient(180deg,#27465a 0%,#203b4d 100%)!important;
      border-color:#5f7f94!important;
      color:#f4f8fb!important;
      box-shadow:0 5px 14px rgba(32,64,91,.10)!important;
    }
    [data-theme="modern"] :where(.v1524-home-kpi,.v1524-home-group,.v1524-home-person,.v152-alert-card,.stainher-contract-alert-r94) :where(.muted,small){
      color:#c0d2df!important;
    }
    [data-theme="modern"] :where(.v1524-home-group h4,.v1524-home-person strong,.v152-alert-card b,.stainher-contract-alert-r94 h4){
      color:#ffffff!important;
    }
    [data-theme="modern"] :where(.field,.inline-field,.inline-input,.inline-select,input,select,textarea){
      background:#ffffff!important;
      color:#142638!important;
      border-color:#aebfd0!important;
      box-shadow:inset 0 1px 1px rgba(32,64,91,.04)!important;
    }
    [data-theme="modern"] :where(.muted,small){color:#60758a!important}
    [data-theme="modern"] .sidebar :where(.muted,small){color:#adc0d1!important}
    [data-theme="modern"] :where(.nav button,.logout){color:#eaf2f8!important}
    [data-theme="modern"] :where(.btn){color:#183149}
    [data-theme="modern"] .nav button:hover,
    [data-theme="modern"] .nav button.active{
      background:linear-gradient(90deg,rgba(20,164,166,.28),rgba(39,118,190,.30))!important;
      color:#fff!important;
      border-color:#4f86ac!important;
      box-shadow:inset 3px 0 0 #3fd0c5!important;
    }
    [data-theme="modern"] .btn.primary,
    [data-theme="modern"] button[aria-selected="true"],
    [data-theme="modern"] .btn.active,
    [data-theme="modern"] [role="tab"].active,
    [data-theme="modern"] [role="tab"][aria-selected="true"]{
      background:linear-gradient(135deg,#087f8c 0%,#176fc1 100%)!important;
      color:#fff!important;
      border-color:#1b7fc8!important;
      box-shadow:0 6px 16px rgba(23,111,193,.20)!important;
    }
    [data-theme="modern"] .btn:not(.primary):not(.danger){
      background:#f7fbff!important;
      border-color:#b8c9d9!important;
    }
    [data-theme="modern"] :where(.notice,.system-stat,.edp-badge,.alert-item,.gantt-wrap,.contract-tabs,.prev-view-tab){
      background:#eef5fa!important;
      color:#1b344c!important;
      border-color:#bfd0df!important;
    }
    [data-theme="modern"] :where(th,.v1520-table th,.admin-table th){
      background:#dfeaf3!important;
      color:#24445f!important;
      border-color:#b8c9d8!important;
    }
    [data-theme="modern"] td{border-color:#cbd7e2!important;color:#183149!important}
    [data-theme="modern"] :where(h1,h2,h3,h4,h5,h6,strong,b){color:#102a42}
    [data-theme="modern"] .sidebar :where(h1,h2,h3,h4,h5,h6,strong,b){color:#f5f9fc!important}
    [data-theme="modern"] .status.ok,
    [data-theme="modern"] .tag.ok{background:#d9f4e9!important;color:#08684f!important;border-color:#8ad5bd!important}
    [data-theme="modern"] .status.warn,
    [data-theme="modern"] .tag.warn{background:#fff0ce!important;color:#8a5200!important;border-color:#e9c576!important}
    [data-theme="modern"] .status.bad,
    [data-theme="modern"] .tag.bad{background:#ffe1e5!important;color:#a3283c!important;border-color:#efa2ae!important}
    [data-theme="modern"] ::selection{background:#9edee0;color:#102a42}
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
        overflow-x:hidden!important;overflow-y:auto!important;padding-bottom:104px!important
      }
      body .sidebar>.sidebar-bottom{
        position:fixed!important;left:0!important;bottom:16px!important;top:auto!important;right:auto!important;
        width:250px!important;max-width:100vw!important;margin:0!important;padding:0 18px!important;box-sizing:border-box!important;
        flex:0 0 auto!important;z-index:1001!important
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

    /* R189 · Cobertura global del tema Moderno para componentes históricos. */
    html[data-theme="modern"] body :where(
      details[data-stainher-panel="staffing"],
      details[data-stainher-home-panel="staffing"],
      details.stainher-staffing-panel,
      details.stainher-home-staffing,
      #page-inicio [data-stainher-home-panel="staffing"] .v1524-home-kpis,
      #page-inicio [data-stainher-home-panel="staffing"] .v1524-home-shifts,
      #page-inicio [data-stainher-home-panel="staffing"] .v1524-home-grid,
      .v1524-home-kpi,.v1524-home-group,.v1524-home-person,
      #page-correctivo .panel,#page-correctivo .kpi,#page-correctivo .chart-wrap,#page-correctivo .v158-review-kpi,
      .v157-group,.v157-group>summary,.v157-group-body,.v157-person,.v157-person-detail,.v157-doc,
      .v1520-kpi,.v1520-table-wrap,.v1520-contract-card,.v1520-readonly,
      .v1519-inventory-details,.v1519-inventory-body,.v1523-reemb-grid,.v1523-reemb-grid-row,
      .v1523-turn-day-detail,.v1523-turn-person,.v1523-turn-event,
      .v1523-prev-equipment-group,.v1523-prev-day-grid,.v1523-prev-unplanned-group,
      .std-dashboard-r144 .panel,.std-dashboard-r144 .kpi,
      #page-liderazgo .panel,#page-liderazgo .kpi,#page-liderazgo .chart-wrap
    ){
      background:#f7fafc!important;
      color:#183149!important;
      border-color:#b8c9d8!important;
      box-shadow:0 4px 14px rgba(32,64,91,.06)!important;
    }

    html[data-theme="modern"] body :where(
      .v1524-home-group h4,
      .v1523-prev-equipment-head,.v1523-prev-day-grid thead th,.v1523-prev-day-grid .equipment,.v1523-prev-unplanned-group>header,
      .v1520-table th,.v1520-weekday,.v1520-turn-matrix th,.v1520-turn-matrix td:first-child,
      .v1520-gantt th,.v1520-gantt td:first-child,.v1523-reemb-grid-head,
      .v157-group-head,
      #page-liderazgo .v1519-period-summary,
      #page-liderazgo [class*="summary"],
      #page-preventivo [class*="equipment-head"]
    ){
      background:#e6eef5!important;
      color:#24445f!important;
      border-color:#b8c9d8!important;
    }

    html[data-theme="modern"] body :where(
      .v1524-home-kpi b,.v1524-home-person b,.v1524-home-shifts .empty,
      .v157-group-head b,.v157-person-name,.v157-person-role,.v157-person-detail>summary,.v157-doc-name,.v157-doc-meta b,
      #page-correctivo .kpi>strong,
      #page-liderazgo .kpi>strong,
      #page-preventivo .v1523-prev-equipment-head,
      #page-estandarizacion .std-dashboard-r144 h3,
      #page-contrato .v1520-kpi b
    ){
      color:#142638!important;
    }

    html[data-theme="modern"] body :where(
      .v1524-home-kpi span,.v1524-home-person small,.v1524-home-shifts .muted,
      .v157-group-head span,.v157-doc-meta small,
      #page-correctivo .muted,#page-correctivo small,
      #page-liderazgo .muted,#page-liderazgo small
    ){
      color:#60758a!important;
    }

    html[data-theme="modern"] body #page-inicio :where(.v1524-home-group,.v1524-home-person,.v1524-home-kpi),
    html[data-theme="modern"] body #page-preventivo :where(.v1523-prev-equipment-group,.v1523-prev-equipment-head),
    html[data-theme="modern"] body #page-dotacion :where(.v157-group,.v157-group>summary,.v157-group-body,.v157-person),
    html[data-theme="modern"] body #page-liderazgo :where(.kpi,.panel,.v1519-period-summary){
      background:#f5f9fc!important;
      color:#183149!important;
      border-color:#b8c9d8!important;
    }

    html[data-theme="modern"] body #page-inicio .v1524-home-group h4,
    html[data-theme="modern"] body #page-preventivo .v1523-prev-equipment-head,
    html[data-theme="modern"] body #page-dotacion .v157-group>summary,
    html[data-theme="modern"] body #page-liderazgo .v1519-period-summary{
      background:#dfeaf3!important;
      color:#203d56!important;
      border-color:#b4c6d6!important;
    }

    html[data-theme="modern"] body :where(button,.btn)[disabled],
    html[data-theme="modern"] body :where(button,.btn).disabled{
      background:#edf2f6!important;
      color:#8091a2!important;
      border-color:#c4d0dc!important;
      opacity:1!important;
      box-shadow:none!important;
    }

    html[data-theme="modern"] body :where(input,select,textarea)[disabled]{
      background:#edf2f6!important;
      color:#6e8091!important;
      border-color:#c4d0dc!important;
      opacity:1!important;
    }

    html[data-theme="modern"] body :where(
      #page-preventivo,#page-correctivo,#page-equipos,#page-estandarizacion,#page-vehiculos,
      #page-dotacion,#page-turnos,#page-solicitudes,#page-liderazgo,#page-contrato,#page-administracion
    ) :where(.panel,.kpi,.card,[class*="card"],[class*="panel"]){
      --legacy-modern-bg:#f7fafc;
    }

    html[data-theme="modern"] body #page-turnos :where(.turnos-table,.v1512-turn-grid,.v1524-user-calendar,.v1524-calendar-day){
      background:#f8fbfd!important;
      color:#183149!important;
      border-color:#b8c9d8!important;
    }

    html[data-theme="modern"] body #page-turnos :where(.turnos-table thead th,.turnos-table tbody th,.turnos-table .worker-cell,.v1512-turn-grid thead th,.v1512-turn-grid tbody th,.v1512-turn-grid .worker-cell){
      background:#e5eef5!important;
      color:#24445f!important;
      border-color:#bccbd8!important;
    }

    html[data-theme="modern"] body #page-solicitudes :where(.v152-request-card,.v154-request-card){
      background:#f8fbfd!important;
      color:#183149!important;
      border-color:#bccbd8!important;
    }

    html[data-theme="modern"] body #page-contrato :where(.contract-tabs,.v1520-tabs,.v1520-kpi,.v1520-contract-card){
      background:#f8fbfd!important;
      color:#183149!important;
      border-color:#b8c9d8!important;
    }

    /* R195 · Mantener sidebar en el flujo del layout: fixed desalineaba
       el contenedor principal en Claro/Moderno. Sticky preserva el espacio
       de la columna, igual que Oscuro, sin afectar el scroll interno. */
    html[data-theme="light"] body .sidebar,
    html[data-theme="modern"] body .sidebar{
      min-height:100vh!important;
      height:100vh!important;
      position:sticky!important;
      top:0!important;
      bottom:auto!important;
      display:flex!important;
      flex-direction:column!important;
      overflow:hidden!important;
    }
    html[data-theme="light"] body .sidebar .nav,
    html[data-theme="modern"] body .sidebar .nav{
      flex:1 1 auto!important;
      min-height:0!important;
      overflow-y:auto!important;
    }
    html[data-theme="light"] body .sidebar-bottom,
    html[data-theme="modern"] body .sidebar-bottom{
      margin-top:auto!important;
      position:relative!important;
      left:auto!important;
      right:auto!important;
      bottom:auto!important;
      width:100%!important;
      flex:0 0 auto!important;
      background:inherit!important;
      border-top-color:rgba(255,255,255,.08)!important;
    }
    html[data-theme="light"] body .sidebar::after,
    html[data-theme="modern"] body .sidebar::after{
      content:"";
      position:absolute;
      inset:auto 0 0 0;
      height:120px;
      background:inherit;
      z-index:-1;
      pointer-events:none;
    }

    /* R197 · El color del sidebar cubre todo el alto sin cambiar su geometría.
       El menú se desplaza dentro de la barra y la cuenta queda anclada abajo. */
    @media(min-width:761px){
      html[data-theme="light"] body .sidebar,
      html[data-theme="modern"] body .sidebar{
        position:sticky!important;
        top:0!important;
        height:100vh!important;
        height:100dvh!important;
        min-height:100vh!important;
        min-height:100dvh!important;
        overflow:hidden!important;
      }
      html[data-theme="light"] body .sidebar{
        background:#fff!important;
      }
      html[data-theme="modern"] body .sidebar{
        background:linear-gradient(180deg,#142c43 0%,#102337 100%)!important;
      }
      html[data-theme="light"] body .sidebar::before,
      html[data-theme="modern"] body .sidebar::before{
        display:none!important;
      }
      html[data-theme="light"] body .sidebar::after,
      html[data-theme="modern"] body .sidebar::after{display:none!important}
      html[data-theme="light"] body .sidebar>.nav,
      html[data-theme="modern"] body .sidebar>.nav{
        flex:1 1 auto!important;
        min-height:0!important;
        overflow-y:auto!important;
        padding-bottom:16px!important;
      }
      html[data-theme="light"] body .sidebar>.sidebar-bottom,
      html[data-theme="modern"] body .sidebar>.sidebar-bottom{
        position:relative!important;
        top:auto!important;
        bottom:auto!important;
        left:auto!important;
        right:auto!important;
        margin-top:auto!important;
        width:100%!important;
        flex:0 0 auto!important;
        z-index:2!important;
      }
      /* El pie usa un color explícito: background:inherit copiaba capas
         oscuras del contenedor de cuenta y producía el bloque negro. */
      html[data-theme="light"] body .sidebar>.sidebar-bottom{
        background:#fff!important;
        border-color:#d7dee8!important;
      }
      html[data-theme="modern"] body .sidebar>.sidebar-bottom{
        background:#102337!important;
        border-color:#29465f!important;
      }
    }

    /* R197: legibilidad de acciones en Claro y Moderno.
       Botones apagados conservan apariencia deshabilitada, con texto visible.
       Excluye acciones primarias para preservar su contraste blanco/azul. */
    html[data-theme="light"] body button:disabled,
    html[data-theme="light"] body button[disabled],
    html[data-theme="light"] body .btn:disabled,
    html[data-theme="modern"] body button:disabled,
    html[data-theme="modern"] body button[disabled],
    html[data-theme="modern"] body .btn:disabled{
      color:#596b7d!important;
      -webkit-text-fill-color:#596b7d!important;
      background:#e7edf3!important;
      border-color:#bac8d6!important;
      opacity:1!important;
      text-shadow:none!important;
    }
    html[data-theme="light"] body button:disabled *,
    html[data-theme="modern"] body button:disabled *,
    html[data-theme="light"] body button[disabled] *,
    html[data-theme="modern"] body button[disabled] *{
      color:inherit!important;
      -webkit-text-fill-color:inherit!important;
    }
    html[data-theme="light"] body .btn:not(.primary):not(.danger):not(.active):not(:disabled):not([disabled]),
    html[data-theme="modern"] body .btn:not(.primary):not(.danger):not(.active):not(:disabled):not([disabled]){
      color:#183149!important;
      -webkit-text-fill-color:#183149!important;
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
  function preference(){try{const v=localStorage.getItem(KEY);if(v===DARK||v===LIGHT||v===MODERN)return v}catch(_){ }return matchMedia?.('(prefers-color-scheme: light)').matches?LIGHT:DARK}
  function refreshCharts(value){
    if(!window.Chart)return;
    const light=value===LIGHT,modern=value===MODERN;
    const textColor=light?'#475467':modern?'#405b73':'#c7d2df';
    const gridColor=light?'rgba(71,84,103,.16)':modern?'rgba(64,91,115,.18)':'rgba(184,200,218,.14)';
    const pastel=light
      ?['rgba(111,155,196,.72)','rgba(104,174,157,.72)','rgba(204,165,108,.72)','rgba(155,137,190,.70)','rgba(194,132,150,.68)']
      :modern
        ?['rgba(47,139,230,.78)','rgba(25,167,160,.78)','rgba(255,122,47,.76)','rgba(111,83,218,.74)','rgba(229,83,104,.72)']
        :['rgba(137,179,216,.70)','rgba(127,195,174,.68)','rgba(220,185,125,.68)','rgba(180,159,213,.68)','rgba(213,153,172,.66)'];
    const borders=light
      ?['#557fa7','#4c9582','#a97b3e','#7965a0','#9e6074']
      :modern
        ?['#55a8f2','#39c4bb','#ff985e','#9b82ef','#ff7c8e']
        :['#a9cbea','#9dd8c6','#efd29b','#c8b4e7','#e7afc0'];
    Chart.defaults.color=textColor;Chart.defaults.borderColor=gridColor;
    const charts=new Set([...Object.values(window.state?.charts||{}),...Object.values(Chart.instances||{})]);
    for(const chart of charts)try{
      if(!chart?.data?.datasets)continue;
      if(['chartEq','chartHours','chartTrend'].includes(chart.canvas?.id))continue;
      const type=chart.config?.type||chart.data.datasets[0]?.type;
      chart.data.datasets.forEach((dataset,index)=>{
        if(type==='line'||dataset.type==='line'){
          dataset.borderColor=borders[index%borders.length];
          dataset.backgroundColor=pastel[index%pastel.length].replace(/\.[0-9]+\)$/,light?'.16)':'.20)');
          dataset.pointBackgroundColor=borders[index%borders.length];
          dataset.pointBorderColor=(light||modern)?'#fff':'#111923';dataset.pointRadius=3;dataset.borderWidth=2;
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
  /* R196: preservar la vista activa durante el cambio de paleta.
     Solo corrige un panel oculto; nunca cambia de módulo ni altera sus datos. */
  function recoverCurrentPage(){
    const active=document.querySelector('.sidebar .nav button.active[data-page],.nav button.active[data-page]');
    const id=active?.dataset.page;
    const page=id&&document.getElementById('page-'+id);
    if(!page)return;
    if(page.hidden||page.classList.contains('hidden')){
      page.hidden=false;page.classList.remove('hidden');page.setAttribute('aria-hidden','false');
    }
    if(getComputedStyle(page).display==='none'){
      console.warn('[Stainher R196] Página activa oculta después de cambiar tema',id);
      page.style.setProperty('display','block','important');
    }else if(page.style.getPropertyValue('display')==='block'){
      page.style.removeProperty('display');
    }
  }
  function apply(theme,persist=false){const value=[DARK,LIGHT,MODERN].includes(theme)?theme:DARK;document.documentElement.dataset.theme=value;if(persist)try{localStorage.setItem(KEY,value)}catch(_){ }document.querySelectorAll('[data-stainher-theme-toggle]').forEach(b=>{const next=value===DARK?MODERN:value===MODERN?LIGHT:DARK;b.innerHTML=value===DARK?'◈ Tema moderno':value===MODERN?'☀ Tema claro':'☾ Tema oscuro';b.setAttribute('aria-label','Cambiar a '+(next===MODERN?'tema moderno':next===LIGHT?'tema claro':'tema oscuro'));b.setAttribute('aria-pressed',String(value!==DARK))});refreshCharts(value);window.dispatchEvent(new CustomEvent('stainher:theme-change',{detail:{theme:value}}));requestAnimationFrame(recoverCurrentPage);}
  function ensureToggle(){const accountMenu=document.getElementById('v157UserMenu'),host=accountMenu||document.querySelector('.userbox');if(!host||host.querySelector('[data-stainher-theme-toggle]'))return;const b=document.createElement('button');b.type='button';b.className=accountMenu?'stainher-theme-toggle':'logout stainher-theme-toggle';b.dataset.stainherThemeToggle='1';b.onclick=()=>{const current=document.documentElement.dataset.theme||DARK;apply(current===DARK?MODERN:current===MODERN?LIGHT:DARK,true)};if(accountMenu)host.insertBefore(b,host.querySelector('.danger'));else host.insertBefore(b,document.getElementById('logoutBtn'));apply(document.documentElement.dataset.theme||preference())}
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
      script.src=new URL(file,source).href+'?build='+(['stainher-v1524-home-layout.js','stainher-v1524-navigation-stability.js'].includes(file)?'20260909-r24-devengo-al-consultar-home-final':'20260907-d20-r19-restauracion-funcional-integral');script.async=false;script.dataset.stainherModule=file;
      script.addEventListener('load',()=>{script.dataset.stainherLoaded='1';resolve()},{once:true});
      script.addEventListener('error',()=>reject(new Error(`No se pudo cargar ${file}`)),{once:true});
      document.head.appendChild(script);
    });
  }
  (async()=>{for(const file of modules)await load(file)})().catch(error=>console.error('[Stainher UI]',error));
})();
