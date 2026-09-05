/* Stainher V15.24 · diagnóstico no invasivo de la cadena modular. */
(()=>{
  'use strict';
  const required=Object.freeze([
    ['Inicio','renderInicio'],['Preventivo','renderPreventivo'],['Correctivo','renderCorrectivoShell'],
    ['Turnos','renderTurnosV15'],['Solicitudes','renderSolicitudesV15'],['Usuarios','renderUsuarios'],
    ['Confiabilidad PDF','v158BuildReviewedReliabilityPdf'],['Tema','StainherTheme']
  ]);
  const compatibility=Object.freeze([
    ['turnos-v1524-script','Núcleo Turnos'],['stainher-v1524-hotfix1-script','Datos e informe Turnos'],
    ['stainher-v1524-hotfix2-script','Detalle de celda'],['stainher-v1524-hotfix3-script','Malla y leyenda'],
    ['stainher-v1524-report-hotfix4-script','Informe visible']
  ]);
  function snapshot(){
    const loader=window.STAINHER_LOADER_STATUS||{},loaded=new Set(loader.loaded||[]),functions=required.map(([label,name])=>({label,name,ok:typeof window[name]==='function'||(name==='StainherTheme'&&Boolean(window[name]))})),compatibilityModules=compatibility.map(([id,label])=>({id,label,ok:loaded.has(id)}));
    const result={at:new Date().toISOString(),loader:loader.state||'desconocido',failed:loader.failed||null,functions,compatibility:compatibilityModules,ok:loader.state==='ready'&&functions.every(x=>x.ok)&&compatibilityModules.every(x=>x.ok)};
    window.STAINHER_RUNTIME_HEALTH=result;return result;
  }
  function roleChecks(){const types=[...(window.state?.v1517ProfileTypes?.values?.()||[])].filter(x=>x.activo!==false),by=new Map(types.map(x=>[String(x.codigo),x])),valid=value=>['ninguno','ver','editar'].includes(value),checks=[
    ['Perfiles activos cargados',types.length>=9,`${types.length} perfiles configurados`],
    ['Inicio visible para todos',types.every(x=>['ver','editar'].includes(x.permisos?.inicio)),'Todos los perfiles activos pueden consultar Inicio'],
    ['Turnos visibles para todos',types.every(x=>['ver','editar'].includes(x.permisos?.turnos)),'Supervisor y Técnico quedan restringidos a su grupo mediante RLS'],
    ['Gerente crea solicitudes',by.get('gerente')?.puede_solicitar===true&&by.get('gerente')?.permisos?.solicitudes==='editar','Capacidad tomada desde Supabase'],
    ['Consulta sin escritura',by.get('consulta')&&Object.values(by.get('consulta').permisos||{}).every(x=>x!=='editar'),'Acceso exclusivamente de lectura'],
    ['Niveles de permiso válidos',types.every(x=>Object.values(x.permisos||{}).every(valid)),'Solo ninguno, ver o editar']
  ];return checks.map(([label,ok,detail])=>({label,ok:Boolean(ok),detail}))}
  function status(value){return `<span class="status ${value?'ok':'bad'}">${value?'Disponible':'Faltante'}</span>`}
  function html(){const health=snapshot(),modules=window.STAINHER_MODULES||[],roles=roleChecks();return `<details class="panel stainher-runtime-audit"><summary><b>Diagnóstico modular</b> ${status(health.ok&&roles.every(x=>x.ok))}</summary><p class="muted">Comprobación de carga, funciones autoritativas y permisos efectivos. No ejecuta escrituras ni modifica datos.</p><div class="stainher-runtime-summary"><div><small>Estado del cargador</small><b>${health.loader}</b></div><div><small>Módulos declarados</small><b>${modules.length}</b></div><div><small>Módulos cargados</small><b>${window.STAINHER_LOADER_STATUS?.loaded?.length||0}</b></div></div>${health.failed?`<div class="notice error">${String(health.failed)}</div>`:''}<div class="v1512-clean-table-wrap"><table><thead><tr><th>Función</th><th>Responsable</th><th>Estado</th></tr></thead><tbody>${health.functions.map(row=>`<tr><td>${row.label}</td><td><code>${row.name}</code></td><td>${status(row.ok)}</td></tr>`).join('')}</tbody></table></div><details class="kpi-help" open><summary>Validación de perfiles</summary><div>${roles.map(row=>`<div class="stainher-role-check"><div><b>${row.label}</b><small>${row.detail}</small></div>${status(row.ok)}</div>`).join('')}</div></details><details class="kpi-help"><summary>Compatibilidad todavía necesaria</summary><div>${health.compatibility.map(row=>`<div class="row-between"><span>${row.label}</span>${status(row.ok)}</div>`).join('')}</div></details></details>`}
  function enhanceSystem(){const page=document.getElementById('page-sistema');if(!page||!window.isAdmin?.()||page.querySelector('.stainher-runtime-audit'))return;page.insertAdjacentHTML('beforeend',html())}
  function install(){snapshot();const base=window.renderSistema;if(typeof base==='function'&&!base.__stainherRuntimeAudit){const wrapped=async function(){const out=await base.apply(this,arguments);enhanceSystem();return out};wrapped.__stainherRuntimeAudit=true;window.renderSistema=wrapped}enhanceSystem();window.addEventListener('stainher:modules-ready',snapshot);window.addEventListener('stainher:modules-error',snapshot)}
  const style=document.createElement('style');style.id='stainher-runtime-audit-style';style.textContent='.stainher-runtime-audit>summary{cursor:pointer}.stainher-runtime-summary{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:14px 0}.stainher-runtime-summary>div{border:1px solid var(--line);border-radius:10px;padding:12px;background:var(--panel2)}.stainher-runtime-summary small,.stainher-runtime-summary b{display:block}.stainher-runtime-summary b{margin-top:5px}.stainher-role-check{display:flex;justify-content:space-between;align-items:center;gap:10px;padding:9px 0;border-bottom:1px solid var(--line)}.stainher-role-check:last-child{border-bottom:0}.stainher-role-check small{display:block;margin-top:3px}@media(max-width:600px){.stainher-runtime-summary{grid-template-columns:1fr}}';document.head.appendChild(style);
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
