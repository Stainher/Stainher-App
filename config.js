window.STAINHER_CONFIG = {
  SUPABASE_URL: 'https://xeqoooouoknpbgyazjkj.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_iNXnSXRWpajeEAEWuRyWLw_PtjPurF0'
};

/*
 * Mobile layout guard · 31-08-2026
 * Capa final e independiente de las reglas heredadas V15.12–V15.23.
 * Se instala al terminar de parsear el documento para quedar después de
 * las hojas de estilo históricas del index.html.
 */
(function installStainherMobileFilterGuard(){
  const CSS = `
    @media (max-width: 900px) {
      #page-correctivo,
      #page-preventivo {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        overflow-x: hidden !important;
      }

      #page-correctivo :is(.v1519-filter-grid,.v1512-filterbar,.toolbar),
      #page-preventivo :is(.v1519-filter-grid,.v1512-filterbar,.prev-toolbar,.v153-prev-toolbar) {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        margin-inline: 0 !important;
        box-sizing: border-box !important;
      }

      #page-correctivo :is(.v1519-filter-grid,.v1512-filterbar,.toolbar) > *,
      #page-preventivo :is(.v1519-filter-grid,.v1512-filterbar,.prev-toolbar,.v153-prev-toolbar) > * {
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
      }

      #page-correctivo :is(input[type='date'],input[type='month'],select),
      #page-preventivo :is(input[type='date'],input[type='month'],select),
      #v1520PrevSearch,
      #prevSearch {
        display: block !important;
        width: 100% !important;
        inline-size: 100% !important;
        min-width: 0 !important;
        min-inline-size: 0 !important;
        max-width: 100% !important;
        max-inline-size: 100% !important;
        margin-inline: 0 !important;
        box-sizing: border-box !important;
      }

      #page-correctivo :is(input[type='date'],input[type='month']),
      #page-preventivo :is(input[type='date'],input[type='month']) {
        flex: 1 1 0 !important;
        overflow: hidden !important;
      }

      #page-correctivo :is(.v1519-period-summary,.v1512-period-note,.edp-period-note,.notice),
      #page-preventivo :is(.v1519-period-summary,.v1512-period-note,.edp-period-note,.v1520-period-note,.notice) {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
        overflow-wrap: anywhere !important;
      }
    }

    @media (max-width: 600px) {
      #page-correctivo :is(.v1519-filter-grid,.v1512-filterbar,.v1512-filterbar.cols2,.v1512-filterbar.cols3),
      #page-preventivo :is(.v1519-filter-grid,.v1512-filterbar,.v1512-filterbar.cols2,.v1512-filterbar.cols3,.prev-toolbar,.v153-prev-toolbar) {
        display: grid !important;
        grid-template-columns: minmax(0,1fr) !important;
        gap: 10px !important;
      }

      #page-correctivo :is(.v1519-filter-grid,.v1512-filterbar) > label,
      #page-preventivo :is(.v1519-filter-grid,.v1512-filterbar) > label {
        display: grid !important;
        grid-template-columns: minmax(0,1fr) !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        box-sizing: border-box !important;
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
