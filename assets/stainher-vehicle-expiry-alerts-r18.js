/* Stainher App V15.24 r18 · vencimientos vehiculares.
 * - Agrega Control de Gases a la ficha de Vehículos.
 * - Incorpora Seguro, Revisión técnica, Extintor y Control de Gases a Alertas.
 * - No crea recordatorios duplicados: las alertas se calculan directamente desde vehiculos_contrato.
 */
(function installVehicleExpiryAlertsR18(){
  'use strict';
  if(window.__STAINHER_VEHICLE_EXPIRY_ALERTS_R18__)return;
  window.__STAINHER_VEHICLE_EXPIRY_ALERTS_R18__=true;

  const EXPIRIES=[
    ['seguro_vence','Seguro','🛡️'],
    ['revision_tecnica_vence','Revisión técnica','🧾'],
    ['extintor_vence','Extintor','🧯'],
    ['control_gases_vence','Control de gases','💨']
  ];
  let alertSeq=0;

  const esc=value=>String(value==null?'':value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const isAdmin=()=>{try{return !!window.isAdmin?.()}catch(_){return false}};
  const canEditVehicles=()=>{try{return typeof window.v1520CanEdit==='function'?!!window.v1520CanEdit('vehiculos'):isAdmin()}catch(_){return isAdmin()}};
  const fmtDate=value=>{try{return window.fmtDateCL?.(value)||String(value||'')}catch(_){return String(value||'')}};
  const daysUntil=value=>{
    if(!value)return null;
    const now=new Date();now.setHours(12,0,0,0);
    const d=new Date(String(value).slice(0,10)+'T12:00:00');
    if(Number.isNaN(d.getTime()))return null;
    return Math.round((d-now)/86400000);
  };
  const alertLevel=days=>days==null?'info':days<=30?'critical':days<=60?'soon':'info';

  function mountStyle(){
    if(document.getElementById('stainher-vehicle-expiry-r18-style'))return;
    const s=document.createElement('style');
    s.id='stainher-vehicle-expiry-r18-style';
    s.textContent=`
      .vehicle-fields [data-r18-control-gases]{min-width:0}
      .vehicle-fields [data-r18-control-gases] input{width:100%;box-sizing:border-box}
      :is(#homeImpactAlerts,#homeAlertsV95) .r18-vehicle-alert-heading{grid-column:1/-1;display:flex;align-items:center;gap:7px;margin-top:5px;padding:8px 2px 2px;color:var(--muted);font-size:10px;font-weight:800;text-transform:uppercase;letter-spacing:.04em}
      :is(#homeImpactAlerts,#homeAlertsV95) .r18-vehicle-alert-heading:before{content:'🚙';font-size:13px}
      :is(#homeImpactAlerts,#homeAlertsV95) .v152-alert-card.r18-vehicle-expiry{border-style:solid}
      :is(#homeImpactAlerts,#homeAlertsV95) .v152-alert-card.r18-vehicle-expiry[data-overdue="1"]{border-color:rgba(251,113,133,.58)}
    `;
    document.head.appendChild(s);
  }

  async function saveGasExpiry(vehicleId,value){
    if(!canEditVehicles()||!window.sb)return;
    const next=value||null;
    const {error}=await window.sb.from('vehiculos_contrato').update({control_gases_vence:next,updated_at:new Date().toISOString()}).eq('id',vehicleId);
    if(error)return window.toast?.(error.message||String(error),'error');
    const vehicle=(window.state?.contractData?.vehiculos||[]).find(x=>String(x.id)===String(vehicleId));
    if(vehicle)vehicle.control_gases_vence=next;
    window.toast?.('Vencimiento de Control de Gases actualizado','success');
  }

  function decorateVehicleCards(root=document){
    const vehicles=window.state?.contractData?.vehiculos||[];
    root.querySelectorAll?.('.vehicle-card').forEach(card=>{
      const patente=String(card.querySelector('.tag')?.textContent||'').trim();
      const vehicle=vehicles.find(v=>String(v.patente||'').trim()===patente);
      const fields=card.querySelector('.vehicle-fields');
      if(!vehicle||!fields||fields.querySelector('[data-r18-control-gases]'))return;
      const label=document.createElement('label');
      label.dataset.r18ControlGases='1';
      label.innerHTML=`Control de gases vence<input class="inline-input" type="date" value="${esc(vehicle.control_gases_vence||'')}">`;
      const input=label.querySelector('input');
      if(!canEditVehicles()){
        input.disabled=true;
        input.setAttribute('aria-readonly','true');
      }else{
        input.addEventListener('change',()=>saveGasExpiry(vehicle.id,input.value));
      }
      fields.appendChild(label);
    });
  }

  function decorateVehicleModal(vehicleId=''){
    const form=document.getElementById('v1518VehicleForm');
    if(!form||form.elements?.control_gases_vence)return;
    const vehicle=(window.state?.contractData?.vehiculos||[]).find(x=>String(x.id)===String(vehicleId))||{};
    const label=document.createElement('label');
    label.dataset.r18ControlGases='1';
    label.innerHTML=`Control de gases vence<input class="field" type="date" name="control_gases_vence" value="${esc(vehicle.control_gases_vence||'')}">`;
    const stateField=form.elements?.estado?.closest?.('label');
    form.insertBefore(label,stateField||form.querySelector('.full')||null);
  }

  function wrapVehicleRenderer(){
    const current=window.renderStandaloneVehiculos;
    if(typeof current!=='function'||current.__r18VehicleExpiry)return false;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      decorateVehicleCards(document);
      return out;
    };
    wrapped.__r18VehicleExpiry=true;
    wrapped.__base=current;
    window.renderStandaloneVehiculos=wrapped;
    try{renderStandaloneVehiculos=wrapped}catch(_){ }
    return true;
  }

  function wrapVehicleModal(){
    const current=window.v1518VehicleModal;
    if(typeof current!=='function'||current.__r18VehicleExpiry)return false;
    const wrapped=function(id=''){
      const out=current.apply(this,arguments);
      decorateVehicleModal(id);
      return out;
    };
    wrapped.__r18VehicleExpiry=true;
    wrapped.__base=current;
    window.v1518VehicleModal=wrapped;
    try{v1518VehicleModal=wrapped}catch(_){ }
    return true;
  }

  async function loadVehicleAlerts(){
    if(!window.sb)return [];
    let q=await window.sb.from('vehiculos_contrato')
      .select('id,patente,marca_modelo,activo,estado,seguro_vence,revision_tecnica_vence,extintor_vence,control_gases_vence')
      .eq('activo',true).order('patente');
    if(q.error&&/control_gases_vence/i.test(String(q.error.message||''))){
      q=await window.sb.from('vehiculos_contrato')
        .select('id,patente,marca_modelo,activo,estado,seguro_vence,revision_tecnica_vence,extintor_vence')
        .eq('activo',true).order('patente');
    }
    if(q.error){console.warn('[r18 vehículos] no se pudieron cargar vencimientos',q.error);return []}
    const out=[];
    for(const vehicle of q.data||[]){
      for(const [field,label,icon] of EXPIRIES){
        const date=vehicle[field];if(!date)continue;
        const days=daysUntil(date);
        out.push({vehicleExpiry:true,vehicleId:vehicle.id,patente:vehicle.patente,modelo:vehicle.marca_modelo,field,label,icon,date,days});
      }
    }
    return out.sort((a,b)=>(a.days??99999)-(b.days??99999));
  }

  function removeVehicleAlertDom(){
    document.querySelectorAll(':is(#homeImpactAlerts,#homeAlertsV95) [data-r18-vehicle-alert]').forEach(n=>n.remove());
  }

  async function renderVehicleAlerts(){
    const token=++alertSeq;
    removeVehicleAlertDom();
    const filter=String(window.v152AlertFilter||'todas').toLowerCase();
    if(filter!=='todas'&&filter!=='recordatorios')return;
    const root=document.querySelector('#homeImpactAlerts,#homeAlertsV95');
    const list=root?.querySelector('.v152-alert-list');
    if(!list)return;
    const items=await loadVehicleAlerts();if(token!==alertSeq)return;
    const visible=items;
    if(!visible.length)return;

    list.querySelectorAll('.empty').forEach(node=>node.remove());
    const heading=document.createElement('div');
    heading.className='r18-vehicle-alert-heading';
    heading.dataset.r18VehicleAlert='1';
    heading.textContent=`Vencimientos de vehículos · ${visible.length}`;
    list.appendChild(heading);

    for(const item of visible){
      const card=document.createElement('div');
      card.className=`v152-alert-card ${alertLevel(item.days)} r18-vehicle-expiry`;
      card.dataset.r18VehicleAlert='1';
      card.dataset.overdue=item.days!=null&&item.days<0?'1':'0';
      const wd=(()=>{try{return new Date(String(item.date).slice(0,10)+'T12:00:00').toLocaleDateString('es-CL',{weekday:'long'}).toUpperCase()}catch(_){return ''}})();
      const expired=item.days!=null&&item.days<0;
      card.innerHTML=`<div class="v152-alert-icon">${item.icon}</div><div class="v152-alert-main"><b>Vencimiento vehículo · ${esc(item.label)}</b><small>${esc(item.patente||'')} · ${esc(item.modelo||'Vehículo')} · ${expired?'venció':'vence'} ${esc(fmtDate(item.date))}</small></div>${wd?`<div class="v1518-weekday">${esc(wd)}</div>`:''}<div class="v152-alert-days"><b>${item.days==null?'—':Math.abs(item.days)}</b><small>${expired?'días vencido':'días'}</small></div>`;
      list.appendChild(card);
    }
  }

  function wrapHomeAlerts(){
    const current=window.renderHomeAlertsV95;
    if(typeof current!=='function'||current.__r18VehicleExpiry)return false;
    const wrapped=async function(){
      const out=await current.apply(this,arguments);
      await renderVehicleAlerts();
      return out;
    };
    wrapped.__r18VehicleExpiry=true;
    wrapped.__base=current;
    window.renderHomeAlertsV95=wrapped;
    try{renderHomeAlertsV95=wrapped}catch(_){ }
    return true;
  }

  function install(){
    mountStyle();
    wrapVehicleRenderer();
    wrapVehicleModal();
    wrapHomeAlerts();
    decorateVehicleCards(document);
    decorateVehicleModal();
  }

  function boot(){
    install();
    let tries=0;
    const timer=setInterval(()=>{
      tries++;install();
      if(tries>80)clearInterval(timer);
    },125);
    window.addEventListener('stainher:modules-ready',()=>setTimeout(install,0));
    document.addEventListener('click',event=>{
      const page=String(event.target?.closest?.('[data-page]')?.dataset?.page||'');
      if(page==='vehiculos')setTimeout(()=>decorateVehicleCards(document),180);
      if(page==='inicio')setTimeout(()=>renderVehicleAlerts(),220);
    },true);
  }

  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
