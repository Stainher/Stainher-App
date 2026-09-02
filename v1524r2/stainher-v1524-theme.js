/* Stainher V15.24 · tema accesible y persistente. Capa final, sin alterar PDFs. */
(()=>{
  'use strict';
  const KEY='stainher-theme-v1',DARK='dark',LIGHT='light';
  const css=`
    :root[data-theme="light"]{color-scheme:light;--bg:#f3f6fa;--panel:#fff;--panel2:#eaf0f6;--line:#c7d1dd;--text:#182230;--muted:#5b6878;--green:#087a57;--yellow:#8a5a00;--red:#b4233c;--blue:#1769c2}
    :root[data-theme="dark"]{color-scheme:dark}
    [data-theme="light"] body{background:radial-gradient(circle at 10% 0%,#fff 0,#f3f6fa 38%);color:var(--text)}
    [data-theme="light"] .sidebar,[data-theme="light"] .sidebar-bottom{background:#fff}
    [data-theme="light"] .nav button,[data-theme="light"] .logout,[data-theme="light"] .btn{color:#1d2939}
    [data-theme="light"] .nav button:hover,[data-theme="light"] .nav button.active{background:#e7eef7;color:#101828}
    [data-theme="light"] .panel,[data-theme="light"] .userbox,[data-theme="light"] .modal,[data-theme="light"] .login,
    [data-theme="light"] .equipment-card,[data-theme="light"] .kpi,[data-theme="light"] .storage-card,[data-theme="light"] .contract-card,
    [data-theme="light"] .vehicle-card,[data-theme="light"] .crew-card,[data-theme="light"] .event-card,[data-theme="light"] .mini-stat,
    [data-theme="light"] .prev-equipment-card{background:#fff;color:var(--text);box-shadow:0 1px 2px rgba(16,24,40,.04)}
    [data-theme="light"] .field,[data-theme="light"] .inline-field,[data-theme="light"] .inline-input,[data-theme="light"] .inline-select,
    [data-theme="light"] .prev-view-tab,[data-theme="light"] .contract-tabs,[data-theme="light"] .notice,[data-theme="light"] .system-stat,
    [data-theme="light"] .edp-badge,[data-theme="light"] .alert-item,[data-theme="light"] .gantt-wrap{background:#f8fafc;color:#182230;border-color:var(--line)}
    [data-theme="light"] input,[data-theme="light"] select,[data-theme="light"] textarea{color:#182230}
    [data-theme="light"] th{color:#344054}[data-theme="light"] th,[data-theme="light"] td{border-color:#d7dee8}
    [data-theme="light"] .gantt-table thead th,[data-theme="light"] .gantt-table .gantt-equipo,[data-theme="light"] .gantt-table .gantt-actividad{background:#eef3f8;color:#182230}
    [data-theme="light"] .btn.primary{color:#fff}[data-theme="light"] .muted,[data-theme="light"] small{color:var(--muted)}
    .stainher-theme-toggle{display:flex;align-items:center;justify-content:center;gap:7px;width:100%;margin:8px 0 0;min-height:40px}
    .v157-user-menu .stainher-theme-toggle{margin:0;text-align:left;justify-content:flex-start}
    @media(max-width:760px){.userbox>.stainher-theme-toggle{width:auto;min-width:150px}}
  `;
  function preference(){try{const v=localStorage.getItem(KEY);if(v===DARK||v===LIGHT)return v}catch(_){ }return matchMedia?.('(prefers-color-scheme: light)').matches?LIGHT:DARK}
  function refreshCharts(value){if(!window.Chart)return;Chart.defaults.color=value===LIGHT?'#344054':'#cbd5e1';Chart.defaults.borderColor=value===LIGHT?'rgba(71,84,103,.2)':'rgba(148,163,184,.16)';for(const chart of Object.values(window.state?.charts||{}))try{chart?.update?.('none')}catch(_){ }}
  function apply(theme,persist=false){const value=theme===LIGHT?LIGHT:DARK;document.documentElement.dataset.theme=value;if(persist)try{localStorage.setItem(KEY,value)}catch(_){ }document.querySelectorAll('[data-stainher-theme-toggle]').forEach(b=>{b.innerHTML=value===DARK?'☀ Tema claro':'☾ Tema oscuro';b.setAttribute('aria-label',value===DARK?'Activar tema claro':'Activar tema oscuro');b.setAttribute('aria-pressed',String(value===LIGHT))});refreshCharts(value);window.dispatchEvent(new CustomEvent('stainher:theme-change',{detail:{theme:value}}));}
  function ensureToggle(){const accountMenu=document.getElementById('v157UserMenu'),host=accountMenu||document.querySelector('.userbox');if(!host||host.querySelector('[data-stainher-theme-toggle]'))return;const b=document.createElement('button');b.type='button';b.className=accountMenu?'stainher-theme-toggle':'logout stainher-theme-toggle';b.dataset.stainherThemeToggle='1';b.onclick=()=>apply(document.documentElement.dataset.theme===DARK?LIGHT:DARK,true);if(accountMenu)host.insertBefore(b,host.querySelector('.danger'));else host.insertBefore(b,document.getElementById('logoutBtn'));apply(document.documentElement.dataset.theme||preference())}
  function install(){if(!document.getElementById('stainher-theme-style')){const s=document.createElement('style');s.id='stainher-theme-style';s.textContent=css;document.head.appendChild(s)}ensureToggle();const root=document.getElementById('appView')||document.body;new MutationObserver(ensureToggle).observe(root,{childList:true,subtree:true});apply(document.documentElement.dataset.theme||preference())}
  apply(preference());if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
  window.StainherTheme=Object.freeze({set:t=>apply(t,true),get:()=>document.documentElement.dataset.theme});
})();
