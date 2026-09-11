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
  `;
  document.head.appendChild(style);
})();
