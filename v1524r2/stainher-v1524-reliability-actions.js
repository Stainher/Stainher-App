/* Stainher App V15.24 · Confiabilidad: acciones independientes
 * - Generar informe solo genera/descarga el PDF.
 * - Enviar por correo abre el formulario usando el último informe generado.
 * - La barra de acciones se mantiene dentro del flujo y no tapa contenido móvil.
 */
(function installStainherReliabilityActions(){
  if (window.__STAINHER_RELIABILITY_ACTIONS__) return;
  window.__STAINHER_RELIABILITY_ACTIONS__ = true;

  const STYLE_ID = 'stainher-reliability-actions-style';
  const CACHE_KEY = '__STAINHER_RELIABILITY_LAST_REPORT__';

  function role(){
    try { return String(window.v11Role?.() || window.state?.profile?.rol || '').toLowerCase(); }
    catch (_) { return String(window.state?.profile?.rol || '').toLowerCase(); }
  }

  function canEmail(){
    try {
      if (typeof window.v1518Can === 'function') return !!window.v1518Can('correctivo','reliability_email');
    } catch (_) {}
    return ['administrador','confiabilidad'].includes(role());
  }

  function snapshot(){
    return {
      from: String(window.state?.correctivoFrom || ''),
      to: String(window.state?.correctivoTo || ''),
      equipment: String(document.getElementById('corrEquipo')?.value || ''),
    };
  }

  function sameContext(a,b){
    return !!a && !!b && a.from === b.from && a.to === b.to && a.equipment === b.equipment;
  }

  function mountStyle(){
    if (document.getElementById(STYLE_ID)) return;
    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      #page-correctivo .v1519-corr-tabs{
        position:static!important;
        inset:auto!important;
        z-index:auto!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #page-correctivo .v1519-corr-tabs .btn{
        min-width:0!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      @media(max-width:900px){
        .main{
          padding-bottom:calc(150px + env(safe-area-inset-bottom,0px))!important;
        }
        #page-correctivo{
          padding-bottom:24px!important;
          min-width:0!important;
          max-width:100%!important;
          overflow-x:hidden!important;
        }
        #page-correctivo .v1519-corr-tabs{
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:8px!important;
          align-items:stretch!important;
          margin:0 0 14px!important;
          overflow:visible!important;
        }
        #page-correctivo .v1519-corr-tabs .btn{
          width:100%!important;
          min-height:44px!important;
          padding:9px 10px!important;
          white-space:normal!important;
          overflow-wrap:anywhere!important;
          line-height:1.2!important;
        }
      }
      @media(max-width:420px){
        #page-correctivo .v1519-corr-tabs{
          grid-template-columns:minmax(0,1fr)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const originalEmailModal = typeof window.v1518ReliabilityEmailModal === 'function'
    ? window.v1518ReliabilityEmailModal
    : null;

  if (originalEmailModal) {
    window.__STAINHER_RELIABILITY_EMAIL_MODAL_ORIGINAL__ = originalEmailModal;
    window.v1518ReliabilityEmailModal = function(doc, fileName){
      if (!doc || !fileName) return;
      window[CACHE_KEY] = {
        doc,
        fileName: String(fileName),
        context: snapshot(),
        createdAt: new Date().toISOString(),
      };
      ensureActions();
    };
  }

  window.v1524OpenReliabilityEmail = function(){
    const cached = window[CACHE_KEY];
    if (!cached?.doc || !cached?.fileName) {
      window.toast?.('Primero genera el informe del período seleccionado.','warn');
      return;
    }
    if (!sameContext(cached.context, snapshot())) {
      window.toast?.('Cambió el período o equipo. Genera nuevamente el informe antes de enviarlo.','warn');
      return;
    }
    const modal = window.__STAINHER_RELIABILITY_EMAIL_MODAL_ORIGINAL__;
    if (typeof modal !== 'function') {
      window.toast?.('No se pudo abrir el formulario de correo de Confiabilidad.','error');
      return;
    }
    modal(cached.doc, cached.fileName);
  };

  function ensureActions(){
    mountStyle();
    const page = document.getElementById('page-correctivo');
    const tabs = page?.querySelector('.v1519-corr-tabs');
    if (!tabs) return;

    let send = tabs.querySelector('[data-v1524-reliability-email]');
    if (!canEmail()) {
      send?.remove();
      return;
    }
    if (!send) {
      send = document.createElement('button');
      send.type = 'button';
      send.className = 'btn';
      send.dataset.v1524ReliabilityEmail = '1';
      send.textContent = '✉ Enviar por correo';
      send.onclick = window.v1524OpenReliabilityEmail;
      const report = [...tabs.querySelectorAll('button')].find(btn => /Generar informe/i.test(btn.textContent || ''));
      if (report?.nextSibling) tabs.insertBefore(send, report.nextSibling);
      else tabs.appendChild(send);
    }
    const cached = window[CACHE_KEY];
    const ready = !!cached?.doc && sameContext(cached.context, snapshot());
    send.title = ready
      ? `Enviar ${cached.fileName}`
      : 'Primero genera el informe del período y equipo seleccionados';
  }

  function wrapRender(name){
    const fn = window[name];
    if (typeof fn !== 'function' || fn.__v1524ReliabilityActions) return;
    const wrapped = function(){
      const out = fn.apply(this, arguments);
      Promise.resolve(out).finally(() => setTimeout(ensureActions, 0));
      return out;
    };
    wrapped.__v1524ReliabilityActions = true;
    wrapped.__base = fn;
    window[name] = wrapped;
  }

  mountStyle();
  wrapRender('renderCorrectivoShell');
  wrapRender('loadCorrectivo');
  setTimeout(ensureActions, 0);
})();
