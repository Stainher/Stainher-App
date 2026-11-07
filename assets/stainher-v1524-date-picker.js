(function installStainherDatePickers() {
  'use strict';

  const STYLE_ID = 'stainher-v1524-date-picker-style';
  const INPUT_SELECTOR = 'input[type="date"], input[type="month"]';
  const valueSync = new WeakMap();

  function installStyles() {
    document.getElementById(STYLE_ID)?.remove();

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
      @media(max-width:900px){
        html body .page .stainher-date-picker{
          position:relative!important;display:flex!important;align-items:center!important;
          box-sizing:border-box!important;width:100%!important;max-width:100%!important;
          min-width:0!important;min-height:48px!important;padding:12px 48px 12px 12px!important;
          overflow:hidden!important;border:1px solid #b8ccdd!important;border-radius:12px!important;
          background:#f8fbff!important;color:#17344d!important;
        }
        html body .page .stainher-date-picker>.stainher-native-control-shell__value{
          display:block!important;position:relative!important;z-index:1!important;
          width:100%!important;min-width:0!important;visibility:visible!important;opacity:1!important;
          color:#17344d!important;-webkit-text-fill-color:#17344d!important;
          font-size:16px!important;line-height:1.4!important;white-space:nowrap!important;
          overflow:hidden!important;text-overflow:ellipsis!important;pointer-events:none!important;
        }
        html body .page .stainher-date-picker>input:is([type="date"],[type="month"]){
          position:absolute!important;inset:0!important;width:100%!important;max-width:100%!important;
          min-width:0!important;height:100%!important;margin:0!important;padding:0!important;
          opacity:.001!important;z-index:2!important;box-sizing:border-box!important;
        }
        html body .page .stainher-date-picker>.stainher-calendar-button{
          z-index:3!important;color:#486782!important;-webkit-text-fill-color:#486782!important;
        }
        html body .page .stainher-date-picker::after{content:none!important}
        html[data-theme="dark"] body .page .stainher-date-picker{background:#183247!important;border-color:#5e7e98!important}
        html[data-theme="dark"] body .page .stainher-date-picker>.stainher-native-control-shell__value,
        html[data-theme="dark"] body .page .stainher-date-picker>.stainher-calendar-button{color:#f2f8ff!important;-webkit-text-fill-color:#f2f8ff!important}
      }
      @media(min-width:901px){.stainher-date-picker>.stainher-native-control-shell__value{display:none!important}}
      .stainher-date-picker {
        position: relative;
        display: block;
        width: 100%;
        min-width: 0;
      }

      .stainher-date-picker > input[type="date"],
      .stainher-date-picker > input[type="month"] {
        box-sizing: border-box;
        width: 100%;
        padding-right: 3.25rem !important;
      }

      .stainher-date-picker > input::-webkit-calendar-picker-indicator {
        opacity: 0;
        width: 2.75rem;
        height: 100%;
        margin: 0;
        padding: 0;
        cursor: pointer;
      }

      .stainher-calendar-button {
        position: absolute;
        top: 50%;
        right: .35rem;
        z-index: 2;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        width: 2.5rem;
        height: 2.5rem;
        margin: 0;
        padding: 0;
        transform: translateY(-50%);
        border: 0;
        border-radius: .65rem;
        background: transparent;
        color: var(--muted, #94a3b8);
        cursor: pointer;
        -webkit-tap-highlight-color: transparent;
      }

      .stainher-calendar-button:hover,
      .stainher-calendar-button:focus-visible {
        background: color-mix(in srgb, currentColor 12%, transparent);
        color: var(--accent, #60a5fa);
        outline: 2px solid color-mix(in srgb, currentColor 55%, transparent);
        outline-offset: -2px;
      }

      .stainher-calendar-button:disabled {
        opacity: .4;
        cursor: default;
      }

      .stainher-calendar-button svg {
        width: 1.35rem;
        height: 1.35rem;
        pointer-events: none;
      }

      html[data-theme="light"] .stainher-calendar-button,
      body.light-theme .stainher-calendar-button,
      body.theme-light .stainher-calendar-button {
        color: #475569;
      }
    `;
    document.head.appendChild(style);
  }

  function openPicker(input) {
    if (!input || input.disabled || input.readOnly) return;
    input.focus({ preventScroll: true });
    try {
      if (typeof input.showPicker === 'function') {
        input.showPicker();
        return;
      }
    } catch (_) {
      // Safari versions without an accessible showPicker fall back to click.
    }
    input.click();
  }

  function createButton(input) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'stainher-calendar-button';
    button.setAttribute('aria-label', input.type === 'month' ? 'Abrir selector de mes' : 'Abrir calendario');
    button.setAttribute('title', input.type === 'month' ? 'Seleccionar mes' : 'Seleccionar fecha');
    button.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M7 3v3M17 3v3M4 9h16M5.5 5h13A1.5 1.5 0 0 1 20 6.5v12a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 18.5v-12A1.5 1.5 0 0 1 5.5 5Z" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        <path d="M8 13h.01M12 13h.01M16 13h.01M8 17h.01M12 17h.01" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/>
      </svg>`;
    button.disabled = input.disabled || input.readOnly;
    button.addEventListener('click', (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPicker(input);
    });
    return button;
  }

  function enhanceInput(input) {
    if (!(input instanceof HTMLInputElement)) return;
    if (valueSync.has(input)) { valueSync.get(input)(); return; }
    input.dataset.stainherCalendar = '1';

    let wrapper = input.parentElement;
    // R279: Safari/iOS may already own a visual shell from the initial runtime.
    // Keep that shell and its visible formatted value rather than remove it:
    // doing so made the initial observer create another transparent date input.
    if (wrapper?.classList.contains('stainher-native-control-shell')) {
      wrapper.classList.add('stainher-date-picker');
    }
    if (!wrapper || !wrapper.classList.contains('stainher-date-picker')) {
      wrapper = document.createElement('span');
      wrapper.className = 'stainher-date-picker';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }

    // The legacy native-shell observer must not wrap an already-enhanced input.
    // This marker is intentionally retained even when no shell was necessary.
    input.dataset.stainherNativeShell = '1';
    wrapper.classList.add('stainher-native-control-shell');
    input.classList.add('stainher-native-control');

    // Crear siempre el texto visible, independientemente del orden de carga.
    let value=wrapper.querySelector(':scope > .stainher-native-control-shell__value');
    if(!value){value=document.createElement('span');value.className='stainher-native-control-shell__value';value.setAttribute('aria-hidden','true');wrapper.prepend(value)}
    const syncValue=()=>{
      const raw=input.value;
      if(input.type==='month'&&/^\d{4}-\d{2}$/.test(raw)){
        const [year,month]=raw.split('-').map(Number);
        value.textContent=new Intl.DateTimeFormat('es-CL',{month:'long',year:'numeric'}).format(new Date(year,month-1,1));
      }else if(input.type==='date'&&/^\d{4}-\d{2}-\d{2}$/.test(raw))value.textContent=raw.split('-').reverse().join('-');
      else value.textContent=raw||(input.type==='month'?'Seleccionar mes':'Seleccionar fecha');
    };
    valueSync.set(input,syncValue);syncValue();
    input.addEventListener('input',syncValue);input.addEventListener('change',syncValue);
    new MutationObserver(syncValue).observe(input,{attributes:true,attributeFilter:['value']});

    let button = wrapper.querySelector(':scope > .stainher-calendar-button');
    if (!button) {
      button = createButton(input);
      wrapper.appendChild(button);
    }

    const syncAvailability = () => {
      button.disabled = input.disabled || input.readOnly;
      button.setAttribute('aria-disabled', button.disabled ? 'true' : 'false');
    };
    syncAvailability();

    new MutationObserver(syncAvailability).observe(input, {
      attributes: true,
      attributeFilter: ['disabled', 'readonly']
    });
  }

  function enhanceDatePickers(root) {
    if (!root) return;
    if (root.matches?.(INPUT_SELECTOR)) enhanceInput(root);
    root.querySelectorAll?.(INPUT_SELECTOR).forEach(enhanceInput);
  }

  function start() {
    installStyles();
    enhanceDatePickers(document);

    new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === Node.ELEMENT_NODE) enhanceDatePickers(node);
        });
      });
    }).observe(document.body, { childList: true, subtree: true });

    // Preserve the historical hooks used by dynamically-rendered modules.
    window.v1514InstallDatePicker = enhanceInput;
    window.v1514InstallDatePickers = enhanceDatePickers;
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', start, { once: true });
  } else {
    start();
  }
})();
