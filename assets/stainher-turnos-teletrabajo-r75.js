/* Stainher V15.24 · R75 · Teletrabajo en Turnos y Novedades.
 * - Agrega Teletrabajo (TT) a los formularios existentes de novedades.
 * - Conserva el guardado nativo en turnos_novedades_v15 con tipo=teletrabajo.
 * - R301: asegura Permiso/ausencia con tipo nativo permiso para descuento de FTE en faena.
 * - No instala MutationObserver ni captura global de clicks.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_TURNOS_TELETRABAJO_R75__)return;
  window.__STAINHER_TURNOS_TELETRABAJO_R75__=true;

  const TYPE='teletrabajo';
  const LABEL='Teletrabajo';
  const CODE='TT';

  function addOption(form){
    const select=form?.querySelector('select[name="tipo"]');
    if(!select||select.querySelector(`option[value="${TYPE}"]`))return;
    const option=document.createElement('option');
    option.value=TYPE;
    option.textContent=LABEL;
    const other=select.querySelector('option[value="otro"]');
    if(other)select.insertBefore(option,other);else select.appendChild(option);
  }

  function installPermissionOption(){
    const root=document.getElementById('modalRoot')||document;
    const selects=[...root.querySelectorAll('select')];
    for(const select of selects){
      const options=[...select.options];
      const hasTurnOptions=options.some(o=>/encierro/i.test(o.textContent||''))
        &&options.some(o=>/falta\s*\/\s*ausencia/i.test(o.textContent||''));
      if(!hasTurnOptions)continue;
      let option=options.find(o=>o.value==='permiso');
      if(!option){
        option=document.createElement('option');
        option.value='permiso';
        const other=options.find(o=>o.value==='otro')||options.find(o=>/otra novedad/i.test(o.textContent||''));
        if(other)select.insertBefore(option,other);else select.appendChild(option);
      }
      option.textContent='Permiso / ausencia';
    }
  }

  function enhanceModal(){
    const direct=document.getElementById('v1524EventForm');
    const range=document.getElementById('v1524RangeEventForm');
    addOption(direct);addOption(range);
    installPermissionOption();
    [direct,range].forEach(form=>{
      const box=form?.querySelector('.v1524-rule-box');
      if(box&&!box.dataset.teletrabajoR75){
        box.dataset.teletrabajoR75='1';
        box.insertAdjacentHTML('beforeend',' <b>Teletrabajo:</b> registra trabajo fuera de faena y descuenta esas horas del cálculo HP en faena. <b>Permiso / ausencia:</b> registra ausencia durante el turno; el día se excluye de HH en faena y FTE.');
      }
    });
  }

  function wrapModalFunction(name){
    const current=window[name];
    if(typeof current!=='function'||current.__stainherTeleworkR75)return false;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      enhanceModal();
      return out;
    };
    wrapped.__stainherTeleworkR75=true;
    wrapped.__base=current;
    window[name]=wrapped;
    return true;
  }

  function installLabels(){
    const old151=window.v151TurnTypeLabel;
    if(typeof old151!=='function'||!old151.__stainherTeleworkR75){
      const fn=function(type){return String(type||'')===TYPE?LABEL:(typeof old151==='function'?old151(type):String(type||'').replaceAll('_',' '))};
      fn.__stainherTeleworkR75=true;fn.__base=old151;window.v151TurnTypeLabel=fn;
    }

    const old1520=window.v1520TurnTypeLabel;
    if(typeof old1520!=='function'||!old1520.__stainherTeleworkR75){
      const fn=function(type){return String(type||'')===TYPE?LABEL:(typeof old1520==='function'?old1520(type):String(type||'').replaceAll('_',' '))};
      fn.__stainherTeleworkR75=true;fn.__base=old1520;window.v1520TurnTypeLabel=fn;
    }

    const oldCode=window.v1512TurnEventCode;
    if(typeof oldCode!=='function'||!oldCode.__stainherTeleworkR75){
      const fn=function(event){return String(event?.tipo||'')===TYPE?CODE:(typeof oldCode==='function'?oldCode(event):'EV')};
      fn.__stainherTeleworkR75=true;fn.__base=oldCode;window.v1512TurnEventCode=fn;
    }

    const oldShort=window.v1520TurnTypeShort;
    if(typeof oldShort!=='function'||!oldShort.__stainherTeleworkR75){
      const fn=function(type){return String(type||'')===TYPE?CODE:(typeof oldShort==='function'?oldShort(type):'EV')};
      fn.__stainherTeleworkR75=true;fn.__base=oldShort;window.v1520TurnTypeShort=fn;
    }
  }

  function install(){
    installLabels();
    wrapModalFunction('v1512EditTurnCell');
    wrapModalFunction('v15OpenTurnEvent');
    wrapModalFunction('v1520OpenTurnEvent');
    enhanceModal();
    document.addEventListener('focusin',event=>{if(event.target?.tagName==='SELECT')installPermissionOption()},true);
    document.addEventListener('pointerdown',event=>{if(event.target?.tagName==='SELECT')installPermissionOption()},true);
    const root=document.getElementById('modalRoot');
    if(root&&!root.__stainherPermissionObserver){
      root.__stainherPermissionObserver=true;
      const observer=new MutationObserver(()=>installPermissionOption());
      observer.observe(root,{childList:true,subtree:true});
    }
  }

  const style=document.createElement('style');
  style.id='stainher-turnos-teletrabajo-r75-style';
  style.textContent='.v1512-event-badge.TT{background:rgba(56,189,248,.16);color:#7dd3fc}.v1524-report-code.TT{color:#7dd3fc}';
  document.head.appendChild(style);

  install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:profile-ready',install);
  let tries=0;
  const timer=setInterval(()=>{install();if(++tries>=20)clearInterval(timer)},500);
})();