/* Stainher App V15.24 · Hotfix 1
 * - Sincroniza el estado global real con los módulos V15.24.
 * - Hace el informe tolerante a estado no precargado.
 * - Restaura la glosa descriptiva de eventos en Turnos/Novedades e Informe.
 */
(function installStainherV1524Hotfix1(){
  if (window.__STAINHER_V1524_HOTFIX1__) return;
  window.__STAINHER_V1524_HOTFIX1__ = true;

  const GLOSSARY = [
    ['A','Turno A','Jornada programada correspondiente al Turno A.'],
    ['C','Turno C','Jornada programada correspondiente al Turno C.'],
    ['L','Libre','Día libre según la malla base A/C/L.'],
    ['ET','Encierro dentro de turno','Encierro registrado en un día que ya tenía Turno A o C programado.'],
    ['EF','Encierro fuera de turno','Encierro realizado en un día Libre (L); corresponde a presencia adicional fuera del turno programado.'],
    ['SE','Suspendido por encierro','Colaborador con Turno A/C programado que queda no disponible por condición de encierro.'],
    ['DA','Día adicional','Jornada adicional realizada sobre un día Libre (L).'],
    ['HE','Horas extra','Horas trabajadas adicionales a la jornada programada.'],
    ['HF','Horas feriado','Horas trabajadas que corresponden a día feriado.'],
    ['VAC','Vacaciones','Período de vacaciones; disminuye la disponibilidad operacional del día.'],
    ['LM','Licencia médica','Ausencia por licencia médica; disminuye la disponibilidad operacional.'],
    ['PER','Permiso / ausencia','Permiso o ausencia registrada para el colaborador.'],
    ['F','Falta / ausencia','Ausencia o falta registrada para el colaborador.'],
    ['CAP','Capacitación','Actividad de capacitación registrada para el período.'],
    ['OTR','Otra novedad','Evento operacional que no corresponde a las categorías anteriores.']
  ];

  const esc = value => typeof window.esc === 'function'
    ? window.esc(value == null ? '' : String(value))
    : String(value == null ? '' : value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  function bridgeGlobals(){
    try { if (!window.state && typeof state !== 'undefined') window.state = state; } catch (_) {}
    try { if (!window.sb && typeof sb !== 'undefined') window.sb = sb; } catch (_) {}
    return !!window.state && !!window.sb;
  }

  function mountStyle(){
    if (document.getElementById('stainher-v1524-hotfix1-style')) return;
    const style = document.createElement('style');
    style.id = 'stainher-v1524-hotfix1-style';
    style.textContent = `
      .v1524-event-glossary{margin:10px 0 12px;border:1px solid #2b3948;border-radius:11px;background:#0d151e;overflow:hidden}
      .v1524-event-glossary>summary{cursor:pointer;padding:10px 12px;font-weight:800;color:#dbeafe;background:#121d28;list-style:none}
      .v1524-event-glossary>summary::-webkit-details-marker{display:none}
      .v1524-event-glossary>summary:after{content:'▾';float:right;color:#8fb3d8}
      .v1524-event-glossary:not([open])>summary:after{content:'▸'}
      .v1524-event-glossary-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:7px;padding:10px}
      .v1524-event-glossary-item{display:grid;grid-template-columns:42px minmax(0,1fr);gap:8px;align-items:start;padding:8px;border:1px solid #243240;border-radius:9px;background:#0a1118;min-width:0}
      .v1524-event-glossary-code{display:inline-flex;align-items:center;justify-content:center;min-height:26px;border-radius:7px;border:1px solid #38506a;background:#132235;color:#bfdbfe;font-size:10px;font-weight:900}
      .v1524-event-glossary-item b{display:block;color:#eef6ff;font-size:11px;margin-bottom:2px}
      .v1524-event-glossary-item small{display:block;color:#9fb0c2;line-height:1.35;font-size:10px}
      @media(max-width:700px){.v1524-event-glossary-grid{grid-template-columns:1fr}}
    `;
    document.head.appendChild(style);
  }

  function glossaryHtml(open=true){
    return `<details class="v1524-event-glossary" ${open?'open':''}><summary>Glosa descriptiva de eventos</summary><div class="v1524-event-glossary-grid">${GLOSSARY.map(([code,name,desc])=>`<div class="v1524-event-glossary-item"><span class="v1524-event-glossary-code">${esc(code)}</span><div><b>${esc(name)}</b><small>${esc(desc)}</small></div></div>`).join('')}</div></details>`;
  }

  async function ensureTurnData(){
    bridgeGlobals();
    const st = window.state;
    if (!st) throw new Error('No se pudo acceder al estado de Turnos y Novedades.');
    if (st.v1520TurnData) {
      st.v1512TurnData = st.v1520TurnData;
      return st.v1520TurnData;
    }
    if (typeof window.v1520LoadTurnData !== 'function') throw new Error('No está disponible el cargador de programación de turnos.');
    const data = await window.v1520LoadTurnData();
    if (!data) throw new Error('No fue posible cargar la programación para el informe.');
    st.v1520TurnData = data;
    st.v1512TurnData = data;
    return data;
  }
  window.v1524EnsureTurnData = ensureTurnData;

  function injectTurnGlossary(){
    const page = document.getElementById('page-turnos');
    if (!page || page.querySelector('.v1524-event-glossary')) return;
    const toolbar = page.querySelector('.v1512-turn-toolbar');
    const kpis = page.querySelector('.v1520-kpis');
    const host = document.createElement('div');
    host.innerHTML = glossaryHtml(true);
    const node = host.firstElementChild;
    if (toolbar) toolbar.insertAdjacentElement('afterend',node);
    else if (kpis) kpis.insertAdjacentElement('beforebegin',node);
    else page.prepend(node);
  }

  function injectReportGlossary(){
    const modal = document.querySelector('#modalRoot .modal');
    if (!modal || modal.querySelector('.v1524-event-glossary')) return;
    const firstH4 = modal.querySelector('h4');
    const host = document.createElement('div');
    host.innerHTML = glossaryHtml(false);
    const node = host.firstElementChild;
    if (firstH4) firstH4.insertAdjacentElement('beforebegin',node);
    else modal.appendChild(node);
  }

  function patchReport(){
    if (typeof window.v1516OpenTurnMonthlyReport !== 'function' || window.v1516OpenTurnMonthlyReport.__v1524hotfix1) return;
    const baseOpen = window.v1516OpenTurnMonthlyReport;
    const wrapped = async function(){
      try {
        await ensureTurnData();
        const out = await baseOpen.apply(this,arguments);
        injectReportGlossary();
        return out;
      } catch (err) {
        window.toast?.(err?.message || String(err),'error');
      }
    };
    wrapped.__v1524hotfix1 = true;
    wrapped.__base = baseOpen;
    window.v1516OpenTurnMonthlyReport = wrapped;
    window.v1520TurnReport = wrapped;

    if (typeof window.v1516TurnMonthlyRows === 'function') {
      const baseRows = window.v1516TurnMonthlyRows;
      window.v1516TurnMonthlyRows = async function(){ await ensureTurnData(); return baseRows.apply(this,arguments); };
    }
  }

  function patchRenderer(){
    if (typeof window.renderTurnosV15 !== 'function' || window.renderTurnosV15.__v1524hotfix1) return;
    const base = window.renderTurnosV15;
    const wrapped = async function(){
      bridgeGlobals();
      const out = await base.apply(this,arguments);
      try {
        if (window.state?.v1520TurnData) window.state.v1512TurnData = window.state.v1520TurnData;
        injectTurnGlossary();
        patchReport();
      } catch (_) {}
      return out;
    };
    wrapped.__v1524hotfix1 = true;
    wrapped.__base = base;
    window.renderTurnosV15 = wrapped;
  }

  let tries=0;
  (function boot(){
    bridgeGlobals();
    mountStyle();
    patchRenderer();
    patchReport();
    injectTurnGlossary();
    if ((!window.state || !window.sb || typeof window.renderTurnosV15 !== 'function' || typeof window.v1516OpenTurnMonthlyReport !== 'function') && ++tries < 120) {
      return setTimeout(boot,100);
    }
    if (document.getElementById('page-turnos')?.classList.contains('active')) {
      window.renderTurnosV15?.();
    }
  })();
})();
