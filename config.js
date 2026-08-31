window.STAINHER_CONFIG = {
  SUPABASE_URL: 'https://xeqoooouoknpbgyazjkj.supabase.co',
  SUPABASE_ANON_KEY: 'sb_publishable_iNXnSXRWpajeEAEWuRyWLw_PtjPurF0'
};
window.STAINHER_BUILD = 'V15.23-mobile-native-control-shell-20260831-3';

/*
 * V15.23 · Corrección autoritativa de controles nativos iOS
 * Safari puede imponer un ancho visual intrínseco a input[type=date/month]
 * aunque el elemento mida 100%. En vez de recortar ese control, Stainher
 * dibuja una envolvente propia y mantiene el selector nativo transparente
 * encima para conservar toda la funcionalidad táctil.
 */
(function installStainherIOSNativeControlShell(){
  const STYLE_ID = 'stainher-ios-native-control-shell-style';
  const MOBILE = '(max-width: 900px)';
  const TARGETS = [
    ['corrFromV1519', 'date'],
    ['corrToV1519', 'date'],
    ['v1523PrevEdpMonth', 'month']
  ];

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

      #page-correctivo .v1519-filter-grid,
      #page-preventivo .v1523-prev-period-toolbar {
        width: 100% !important;
        max-width: 100% !important;
        min-width: 0 !important;
        box-sizing: border-box !important;
      }

      .stainher-native-control-shell {
        position: relative !important;
        display: flex !important;
        align-items: center !important;
        width: 100% !important;
        inline-size: 100% !important;
        max-width: 100% !important;
        max-inline-size: 100% !important;
        min-width: 0 !important;
        min-inline-size: 0 !important;
        min-height: 44px !important;
        margin: 0 !important;
        padding: 10px 42px 10px 11px !important;
        box-sizing: border-box !important;
        overflow: hidden !important;
        border: 1px solid var(--line) !important;
        border-radius: 9px !important;
        background: #0c1117 !important;
        color: #fff !important;
        font: inherit !important;
        text-transform: none !important;
        letter-spacing: normal !important;
      }

      .stainher-native-control-shell::after {
        content: '▣';
        position: absolute;
        right: 12px;
        top: 50%;
        transform: translateY(-50%);
        color: #9fc7ee;
        font-size: 13px;
        line-height: 1;
        pointer-events: none;
      }

      .stainher-native-control-shell--month::after {
        content: '▾';
        font-size: 15px;
      }

      .stainher-native-control-shell__value {
        display: block !important;
        width: 100% !important;
        min-width: 0 !important;
        max-width: 100% !important;
        overflow: hidden !important;
        text-overflow: ellipsis !important;
        white-space: nowrap !important;
        color: #fff !important;
        font-size: 16px !important;
        line-height: 1.25 !important;
        font-weight: 400 !important;
        text-transform: none !important;
        letter-spacing: normal !important;
        pointer-events: none !important;
      }

      .stainher-native-control-shell--month .stainher-native-control-shell__value {
        font-weight: 700 !important;
      }

      .stainher-native-control-shell:focus-within {
        outline: 2px solid rgba(159, 199, 238, .55) !important;
        outline-offset: 1px !important;
      }

      .stainher-native-control-shell > input.stainher-native-control {
        position: absolute !important;
        inset: 0 !important;
        z-index: 2 !important;
        display: block !important;
        width: 100% !important;
        height: 100% !important;
        inline-size: 100% !important;
        block-size: 100% !important;
        min-width: 0 !important;
        min-inline-size: 0 !important;
        max-width: none !important;
        max-inline-size: none !important;
        margin: 0 !important;
        padding: 0 !important;
        border: 0 !important;
        border-radius: 9px !important;
        opacity: .001 !important;
        background: transparent !important;
        color: transparent !important;
        cursor: pointer !important;
        -webkit-appearance: none !important;
        appearance: none !important;
        box-sizing: border-box !important;
      }

      .stainher-native-control-shell > input.stainher-native-control::-webkit-date-and-time-value,
      .stainher-native-control-shell > input.stainher-native-control::-webkit-datetime-edit,
      .stainher-native-control-shell > input.stainher-native-control::-webkit-calendar-picker-indicator {
        opacity: 0 !important;
      }
    }
  `;

  function mountStyle(){
    let style = document.getElementById(STYLE_ID);
    if (!style) {
      style = document.createElement('style');
      style.id = STYLE_ID;
      document.head.appendChild(style);
    }
    style.textContent = CSS;
  }

  function formatDate(value){
    const m = String(value || '').match(/^(\d{4})-(\d{2})-(\d{2})$/);
    return m ? `${m[3]}-${m[2]}-${m[1]}` : (value || 'Seleccionar fecha');
  }

  function formatMonth(value){
    const m = String(value || '').match(/^(\d{4})-(\d{2})$/);
    if (!m) return value || 'Seleccionar mes';
    const date = new Date(Number(m[1]), Number(m[2]) - 1, 1);
    return new Intl.DateTimeFormat('es-CL', { month: 'long', year: 'numeric' }).format(date);
  }

  function skin(input, kind){
    if (!input || input.dataset.stainherNativeShell === '1') return;
    const parent = input.parentNode;
    if (!parent) return;

    const shell = document.createElement('span');
    shell.className = `stainher-native-control-shell stainher-native-control-shell--${kind}`;

    const value = document.createElement('span');
    value.className = 'stainher-native-control-shell__value';
    value.setAttribute('aria-hidden', 'true');

    const sync = () => {
      value.textContent = kind === 'month' ? formatMonth(input.value) : formatDate(input.value);
    };

    input.dataset.stainherNativeShell = '1';
    input.classList.add('stainher-native-control');
    parent.insertBefore(shell, input);
    shell.appendChild(value);
    shell.appendChild(input);
    sync();

    input.addEventListener('input', sync);
    input.addEventListener('change', sync);
  }

  function apply(root = document){
    if (!window.matchMedia || !window.matchMedia(MOBILE).matches) return;
    TARGETS.forEach(([id, kind]) => {
      const input = root.getElementById ? root.getElementById(id) : document.getElementById(id);
      skin(input, kind);
    });
  }

  function boot(){
    mountStyle();
    apply(document);
    const root = document.getElementById('appView') || document.body;
    const observer = new MutationObserver(() => apply(document));
    observer.observe(root, { childList: true, subtree: true });
    window.addEventListener('resize', () => apply(document), { passive: true });
    window.addEventListener('orientationchange', () => setTimeout(() => apply(document), 60), { passive: true });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', boot, { once: true });
  } else {
    boot();
  }
})();

/* Carga aislada del módulo Turnos/Novedades candidato. Se ejecuta después
 * de parsear index.html para que las sobreescrituras finales sean autoritativas. */
(function loadTurnosNovedadesV1524(){
  function load(){
    if (document.getElementById('turnos-v1524-script')) return;
    const script = document.createElement('script');
    script.id = 'turnos-v1524-script';
    script.src = 'turnos-v1524.js?v=20260831-1';
    script.defer = true;
    document.head.appendChild(script);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',load,{once:true});
  else load();
})();
