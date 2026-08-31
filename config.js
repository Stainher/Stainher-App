window.STAINHER_CONFIG = {
  SUPABASE_URL: 'https://xeqoooouoknpbgyazjkj.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_iNXnSXRWpajeEAEWuRyWLw_PtjPurF0'
};
window.STAINHER_BUILD = 'V15.23-mobile-containment-20260831-2';

/*
 * Mobile layout guard · 31-08-2026
 * Capa final e independiente de las reglas heredadas V15.12–V15.23.
 * Se instala al terminar de parsear el documento para quedar después de
 * las hojas de estilo históricas del index.html.
 */
(function installStainherMobileFilterGuard(){
  const CSS = `
    @media (max-width: 900px) {
      html,
      body,
      #appView,
      .app,
      .main {
        min-width: 0 !important;
        max-width: 100vw !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
      }

      .main {
        width: 100vw !important;
        inline-size: 100vw !important;
      }

      #page-correctivo,
      #page-preventivo {
        --stainher-mobile-content: calc(100vw - 24px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
        width: auto !important;
        inline-size: auto !important;
        max-width: var(--stainher-mobile-content) !important;
        max-inline-size: var(--stainher-mobile-content) !important;
        min-width: 0 !important;
        min-inline-size: 0 !important;
        margin-inline: auto !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
      }

      #page-correctivo :is(.v1519-filter-grid,.v1512-filterbar,.toolbar),
      #page-preventivo :is(.v1519-filter-grid,.v1512-filterbar,.v1523-prev-period-toolbar,.prev-toolbar,.v153-prev-toolbar) {
        display: grid !important;
        grid-template-columns: minmax(0,1fr) !important;
        width: 100% !important;
        inline-size: 100% !important;
        max-width: 100% !important;
        max-inline-size: 100% !important;
        min-width: 0 !important;
        min-inline-size: 0 !important;
        margin-inline: 0 !important;
        padding-inline: 0 !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
      }

      #page-correctivo :is(.v1519-filter-grid,.v1512-filterbar,.toolbar) > *,
      #page-preventivo :is(.v1519-filter-grid,.v1512-filterbar,.v1523-prev-period-toolbar,.prev-toolbar,.v153-prev-toolbar) > * {
        display: block !important;
        width: 100% !important;
        inline-size: 100% !important;
        max-width: 100% !important;
        max-inline-size: 100% !important;
        min-width: 0 !important;
        min-inline-size: 0 !important;
        margin-inline: 0 !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
      }

      #corrFromV1519,
      #corrToV1519,
      #v1523PrevEdpMonth,
      #page-correctivo :is(input[type='date'],input[type='month'],select,.field),
      #page-preventivo :is(input[type='date'],input[type='month'],select,.field),
      #v1520PrevSearch,
      #prevSearch {
        display: block !important;
        width: 100% !important;
        inline-size: 100% !important;
        max-width: 100% !important;
        max-inline-size: 100% !important;
        min-width: 0 !important;
        min-inline-size: 0 !important;
        margin-inline: 0 !important;
        box-sizing: border-box !important;
      }

      #corrFromV1519,
      #corrToV1519,
      #v1523PrevEdpMonth,
      #page-correctivo :is(input[type='date'],input[type='month']),
      #page-preventivo :is(input[type='date'],input[type='month']) {
        flex: 1 1 0 !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
      }

      #page-correctivo input[type='date']::-webkit-date-and-time-value,
      #page-correctivo input[type='date']::-webkit-datetime-edit,
      #page-preventivo input[type='month']::-webkit-date-and-time-value,
      #page-preventivo input[type='month']::-webkit-datetime-edit {
        min-width: 0 !important;
        min-inline-size: 0 !important;
        max-width: 100% !important;
        overflow: hidden !important;
      }

      #corrEdpNote,
      #v1523PrevPeriodNote,
      #page-correctivo :is(.v1519-period-summary,.v1512-period-note,.edp-period-note,.notice),
      #page-preventivo :is(.v1519-period-summary,.v1512-period-note,.edp-period-note,.v1520-period-note,.v1523-prev-period-note,.notice) {
        width: 100% !important;
        inline-size: 100% !important;
        max-width: 100% !important;
        max-inline-size: 100% !important;
        min-width: 0 !important;
        min-inline-size: 0 !important;
        margin-inline: 0 !important;
        box-sizing: border-box !important;
        overflow-wrap: anywhere !important;
        word-break: normal !important;
      }
    }

    @media (max-width: 600px) {
      #page-correctivo,
      #page-preventivo {
        --stainher-mobile-content: calc(100vw - 20px - env(safe-area-inset-left, 0px) - env(safe-area-inset-right, 0px));
      }

      #page-correctivo :is(.v1519-filter-grid,.v1512-filterbar,.v1512-filterbar.cols2,.v1512-filterbar.cols3,.toolbar),
      #page-preventivo :is(.v1519-filter-grid,.v1512-filterbar,.v1512-filterbar.cols2,.v1512-filterbar.cols3,.v1523-prev-period-toolbar,.prev-toolbar,.v153-prev-toolbar) {
        grid-template-columns: minmax(0,1fr) !important;
        gap: 10px !important;
      }
    }
  `;

  function mount(){
    let style = document.getElementById('stainher-mobile-filter-guard');
    if (!style) {
      style = document.createElement('style');
      style.id = 'stainher-mobile-filter-guard';
      document.head.appendChild(style);
    }
    style.textContent = CSS;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', mount, { once: true });
  } else {
    mount();
  }
})();
