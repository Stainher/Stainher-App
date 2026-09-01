/* Stainher App V15.24 · Confiabilidad: acciones independientes
 * - Generar informe solo genera/descarga el PDF.
 * - Enviar por correo abre el formulario usando el último informe generado.
 * - La barra de acciones se mantiene dentro del flujo y no tapa contenido móvil.
 */
(function bootstrapStainherReliabilityActions(){
  const EMERGENCY_STYLE_ID = 'stainher-reliability-actions-flow-guard';
  if (!document.getElementById(EMERGENCY_STYLE_ID)) {
    const guard = document.createElement('style');
    guard.id = EMERGENCY_STYLE_ID;
    guard.textContent = '#modalRoot .v158-review-actions{position:static!important;inset:auto!important;z-index:auto!important;margin-top:14px!important;padding:14px 0 0!important;background:transparent!important}';
    document.head.appendChild(guard);
  }
  if (window.__STAINHER_RELIABILITY_ACTIONS__) return;
  const ready = typeof window.v1518ReliabilityEmailModal === 'function'
    && typeof window.renderCorrectivoShell === 'function'
    && typeof window.loadCorrectivo === 'function';
  if (!ready) {
    setTimeout(bootstrapStainherReliabilityActions, 250);
    return;
  }
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
      #page-correctivo .v1524-reliability-toolbar{
        position:static!important;
        inset:auto!important;
        z-index:auto!important;
        width:100%!important;
        max-width:100%!important;
        min-width:0!important;
        box-sizing:border-box!important;
      }
      #page-correctivo .v1524-reliability-toolbar .btn{
        min-width:0!important;
        max-width:100%!important;
        box-sizing:border-box!important;
      }
      #modalRoot .v158-review-actions{
        position:static!important;
        inset:auto!important;
        z-index:auto!important;
        margin-top:14px!important;
        padding:14px 0 0!important;
        background:transparent!important;
      }
      @media(max-width:900px){
        #page-correctivo{
          padding-bottom:calc(96px + env(safe-area-inset-bottom,0px))!important;
          min-width:0!important;
          max-width:100%!important;
          overflow-x:hidden!important;
        }
        #page-correctivo .v1524-reliability-toolbar{
          display:grid!important;
          grid-template-columns:repeat(2,minmax(0,1fr))!important;
          gap:8px!important;
          align-items:stretch!important;
          margin:0 0 14px!important;
          overflow:visible!important;
        }
        #page-correctivo .v1524-reliability-toolbar .btn{
          width:100%!important;
          min-height:44px!important;
          padding:9px 10px!important;
          white-space:normal!important;
          overflow-wrap:anywhere!important;
          line-height:1.2!important;
        }
      }
      @media(max-width:420px){
        #page-correctivo .v1524-reliability-toolbar{
          grid-template-columns:minmax(0,1fr)!important;
        }
      }
    `;
    document.head.appendChild(style);
  }

  const originalEmailModal = window.v1518ReliabilityEmailModal;
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
    ensureReviewActions();
  };

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
    if (!page) return;
    const tabs = page.querySelector('.v1519-corr-tabs')
      || page.querySelector('.v1518-corr-actions,.v1516-corr-top-tabs');
    if (!tabs) return;
    tabs.classList.add('v1524-reliability-toolbar');
    page.querySelectorAll('[data-v1524-reliability-email]').forEach(button => button.remove());

    page.querySelectorAll('.v153-corr-tabs,.v154-corr-tabs-fixed,.v1516-corr-top-tabs,.v1518-corr-actions,.v1519-corr-tabs').forEach(group => {
      if (group === tabs) return;
      const labels = [...group.querySelectorAll('button')].map(button => button.textContent || '').join(' ');
      if (/Confiabilidad/i.test(labels) && /Historial/i.test(labels) && /Generar informe/i.test(labels)) group.remove();
    });
  }

  function ensureReviewActions(){
    const modal = document.querySelector('#modalRoot .v158-review-modal');
    const actions = modal?.querySelector('.v158-review-actions');
    if (!actions) return;

    const approve = [...actions.querySelectorAll('button')].find(button => /Aprobar.*generar PDF/i.test(button.textContent || ''));
    if (approve) approve.textContent = 'Aprobar y generar PDF';

    let send = actions.querySelector('[data-v1524-reliability-email]');
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
      actions.appendChild(send);
    }
    const cached = window[CACHE_KEY];
    const readyNow = !!cached?.doc && sameContext(cached.context, snapshot());
    send.title = readyNow
      ? `Enviar ${cached.fileName}`
      : 'Primero aprueba y genera el PDF de este informe';
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

  const originalCloseModal = window.closeModal;
  window.closeModal = function(){
    if (window.__STAINHER_KEEP_RELIABILITY_REVIEW__ && document.querySelector('#modalRoot .v158-review-modal')) return;
    return originalCloseModal.apply(this, arguments);
  };

  const originalApprove = window.v158ApproveReliabilityReport;
  if (typeof originalApprove === 'function') {
    window.v158ApproveReliabilityReport = async function(){
      window.__STAINHER_KEEP_RELIABILITY_REVIEW__ = true;
      try { return await originalApprove.apply(this, arguments); }
      finally {
        window.__STAINHER_KEEP_RELIABILITY_REVIEW__ = false;
        setTimeout(ensureReviewActions, 200);
      }
    };
  }

  mountStyle();
  wrapRender('renderCorrectivoShell');
  wrapRender('loadCorrectivo');
  let observerQueued = false;
  const observer = new MutationObserver(() => {
    if (observerQueued) return;
    observerQueued = true;
    setTimeout(() => {
      observerQueued = false;
      ensureActions();
      ensureReviewActions();
    }, 0);
  });
  observer.observe(document.body, { childList:true, subtree:true });
  setTimeout(ensureActions, 0);
})();
