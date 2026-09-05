(function installStainherDatePickers() {
  'use strict';

  const STYLE_ID = 'stainher-v1524-date-picker-style';
  const INPUT_SELECTOR = 'input[type="date"], input[type="month"]';

  function installStyles() {
    if (document.getElementById(STYLE_ID)) return;

    const style = document.createElement('style');
    style.id = STYLE_ID;
    style.textContent = `
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
    if (!(input instanceof HTMLInputElement) || input.dataset.stainherCalendar === '1') return;
    input.dataset.stainherCalendar = '1';

    let wrapper = input.parentElement;
    if (wrapper?.classList.contains('stainher-native-control-shell')) {
      wrapper.querySelector(':scope > .stainher-native-control-shell__value')?.remove();
      wrapper.className = 'stainher-date-picker';
      input.classList.remove('stainher-native-control');
      delete input.dataset.stainherNativeShell;
    }
    if (!wrapper || !wrapper.classList.contains('stainher-date-picker')) {
      wrapper = document.createElement('span');
      wrapper.className = 'stainher-date-picker';
      input.parentNode.insertBefore(wrapper, input);
      wrapper.appendChild(input);
    }

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
