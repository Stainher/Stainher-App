/* Stainher V15.24 · contraste de formularios Liderazgo en tema claro. */
(()=>{
  'use strict';
  if(window.__STAINHER_LEADERSHIP_LIGHT_CONTRAST__)return;
  window.__STAINHER_LEADERSHIP_LIGHT_CONTRAST__=true;

  const style=document.createElement('style');
  style.id='stainher-v1524-leadership-light-contrast';
  style.textContent=`
    /*
      Algunas capas históricas fijan las etiquetas de Liderazgo en #f4f7fb!important,
      pensado para fondos oscuros. Esta capa final usa las variables del tema actual
      y se limita al modal de Controles en tema claro.
    */
    html[data-theme="light"] body #modalRoot .section-v95,
    html[data-theme="light"] body #modalRoot .v157-card,
    html[data-theme="light"] body #modalRoot .v157-group,
    html[data-theme="light"] body #modalRoot .v13-check-section{
      background:var(--panel)!important;
      color:var(--text)!important;
      border-color:var(--line)!important;
    }

    html[data-theme="light"] body #modalRoot .section-v95 .terrain-form-grid-v95>label,
    html[data-theme="light"] body #modalRoot .terrain-form-grid-v95>label,
    html[data-theme="light"] body #modalRoot .section-v95>label,
    html[data-theme="light"] body #modalRoot .v157-page label,
    html[data-theme="light"] body #modalRoot .v13-check-row>span,
    html[data-theme="light"] body #modalRoot .v12-form-table td,
    html[data-theme="light"] body #modalRoot .v13-fatigue-table td{
      color:var(--text)!important;
    }

    html[data-theme="light"] body #modalRoot .section-v95 h4,
    html[data-theme="light"] body #modalRoot .section-v95 h3,
    html[data-theme="light"] body #modalRoot .v157-step-title,
    html[data-theme="light"] body #modalRoot .v157-card h4,
    html[data-theme="light"] body #modalRoot .v157-group h4,
    html[data-theme="light"] body #modalRoot .v13-check-section h4{
      color:var(--text)!important;
    }

    html[data-theme="light"] body #modalRoot .v157-step-count,
    html[data-theme="light"] body #modalRoot .v157-complete,
    html[data-theme="light"] body #modalRoot .v12-control-note,
    html[data-theme="light"] body #modalRoot .pdf-preview-note-v95,
    html[data-theme="light"] body #modalRoot .v11-inline-note,
    html[data-theme="light"] body #modalRoot .muted,
    html[data-theme="light"] body #modalRoot small{
      color:var(--muted)!important;
    }

    html[data-theme="light"] body #modalRoot input.field,
    html[data-theme="light"] body #modalRoot select.field,
    html[data-theme="light"] body #modalRoot textarea.field{
      background:#fff!important;
      color:var(--text)!important;
      border-color:var(--line)!important;
      caret-color:var(--text)!important;
    }

    html[data-theme="light"] body #modalRoot input.field::placeholder,
    html[data-theme="light"] body #modalRoot textarea.field::placeholder{
      color:var(--muted)!important;
      opacity:.82!important;
    }

    html[data-theme="light"] body #modalRoot .v12-form-table th,
    html[data-theme="light"] body #modalRoot .v13-fatigue-table th{
      background:#eef3f8!important;
      color:var(--text)!important;
      border-color:var(--line)!important;
    }

    html[data-theme="light"] body #modalRoot .v12-form-table tr,
    html[data-theme="light"] body #modalRoot .v13-fatigue-table tr,
    html[data-theme="light"] body #modalRoot .terrain-check-v95{
      background:var(--panel)!important;
      color:var(--text)!important;
      border-color:var(--line)!important;
    }

    /* R282: todo Control Stainher comparte una superficie clara y texto oscuro,
       incluyendo cartillas, control en terreno y checklist vehicular. */
    html:is([data-theme="light"],[data-theme="modern"]) body #modalRoot
      :is(.section-v95,.v157-card,.v157-group,.v13-check-section,
          .terrain-check-v95,.v12-form-table,.v13-fatigue-table,
          .v13-check-row,.v157-step,.v157-page){
      background:#f5f9fd!important;
      color:#19354d!important;
      border-color:#b9cddd!important;
    }
    html:is([data-theme="light"],[data-theme="modern"]) body #modalRoot
      :is(.section-v95,.v157-card,.v157-group,.v13-check-section,
          .terrain-check-v95,.v12-form-table,.v13-fatigue-table,
          .v13-check-row,.v157-page)
      :is(h2,h3,h4,h5,label,span,strong,b,small,th,td,p,legend){
      color:#19354d!important;
      -webkit-text-fill-color:#19354d!important;
      text-shadow:none!important;
    }
    html:is([data-theme="light"],[data-theme="modern"]) body #modalRoot
      :is(.section-v95,.v157-card,.v157-group,.v13-check-section)
      :is(input,textarea,select):not([type="checkbox"]):not([type="radio"]){
      background:#fff!important;
      color:#19354d!important;
      -webkit-text-fill-color:#19354d!important;
      border-color:#aac1d4!important;
      color-scheme:light!important;
    }
    html:is([data-theme="light"],[data-theme="modern"]) body #modalRoot
      :is(.v12-form-table,.v13-fatigue-table,.v13-check-section,.terrain-check-v95)
      :is(tr,td,th,.v13-check-row){
      background:#f5f9fd!important;
      color:#19354d!important;
      border-color:#bbcedd!important;
    }
    html:is([data-theme="light"],[data-theme="modern"]) body #modalRoot
      :is(.v12-form-table,.v13-fatigue-table,.v13-check-section,.terrain-check-v95)
      :is(button,.btn,label):not(.primary):not(.active):not(.selected){
      color:#19354d!important;
      -webkit-text-fill-color:#19354d!important;
    }
    html:is([data-theme="light"],[data-theme="modern"]) body #modalRoot
      :is(.section-v95,.v157-card,.v157-group,.v13-check-section)
      :is(.primary,.active,.selected,[aria-pressed="true"]){
      color:#fff!important;
      -webkit-text-fill-color:#fff!important;
    }
  `;
  document.head.appendChild(style);

  /* La capa de contraste ya es parte del runtime activo; desde aquí se carga la
     administración visible de controles publicados sin tocar el index legado. */
  if(!window.__STAINHER_PUBLISHED_CONTROL_MANAGEMENT__&&!document.getElementById('stainher-v1524-published-control-management-live')){
    const script=document.createElement('script');
    script.id='stainher-v1524-published-control-management-live';
    script.src='stainher-v1524-published-control-management.js?build=20260911-r33-admin-prevencion';
    script.async=false;
    script.addEventListener('error',()=>console.error('No se pudo cargar la administración de Controles Stainher publicados.'),{once:true});
    document.head.appendChild(script);
  }

  if(!window.__STAINHER_DEFAULT_OPEN_PANELS__&&!document.getElementById('stainher-v1524-default-open-panels-live')){
    const script=document.createElement('script');
    script.id='stainher-v1524-default-open-panels-live';
    script.src='stainher-v1524-default-open-panels.js?build=20260911-r34-default-open';
    script.async=false;
    script.addEventListener('error',()=>console.error('No se pudo cargar la apertura inicial de paneles operativos.'),{once:true});
    document.head.appendChild(script);
  }

  if(!window.__STAINHER_ALL_CONTROL_EDITOR__&&!document.getElementById('stainher-v1524-all-control-editor-live')){
    const script=document.createElement('script');
    script.id='stainher-v1524-all-control-editor-live';
    script.src='stainher-v1524-all-control-editor.js?build=20260911-r36-execution-freeze-fix';
    script.async=false;
    script.addEventListener('error',()=>console.error('No se pudo cargar el editor completo de Controles Stainher.'),{once:true});
    document.head.appendChild(script);
  }
})();
