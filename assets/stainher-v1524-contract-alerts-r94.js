/* Stainher V15.24 · R94 · Alertas accionables del contrato DAND.
 * Integración nativa en Inicio: sin interceptores globales ni MutationObserver.
 * Fuente persistente: Supabase public.alertas_contrato_v1524.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_CONTRACT_ALERTS_R94__)return;
  window.__STAINHER_CONTRACT_ALERTS_R94__=true;
  const PANEL='stainherContractAlertsR94';
  const ROLES_MANAGE=new Set(['administrador','gerente','confiabilidad','planificador','prevencion','prevención','rrhh']);
  const esc=v=>typeof window.esc==='function'?window.esc(String(v??'')):String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const role=()=>String(window.state?.profile?.rol||'').trim().toLowerCase();
  const canManage=()=>ROLES_MANAGE.has(role())&&!window.state?.v15PreviewRole;
  const fmt=v=>{try{return new Intl.DateTimeFormat('es-CL',{dateStyle:'medium',timeStyle:'short',timeZone:'America/Santiago'}).format(new Date(v))}catch(_){return String(v||'')}};
  function style(){
    if(document.getElementById('stainher-contract-alerts-r94-style'))return;
    const s=document.createElement('style');s.id='stainher-contract-alerts-r94-style';s.textContent=`
      .stainher-contract-alerts-r94{margin-top:14px}
      .stainher-contract-alerts-r94-head{display:flex;justify-content:space-between;align-items:flex-start;gap:12px;flex-wrap:wrap}
      .stainher-contract-alerts-r94-head h3{margin:0 0 4px}.stainher-contract-alerts-r94-head p{margin:0;color:var(--muted)}
      .stainher-contract-alerts-r94-list{display:grid;gap:10px;margin-top:12px}
      .stainher-contract-alert-r94{border:1px solid var(--line);border-radius:12px;padding:12px;background:var(--panel,#111820)}
      .stainher-contract-alert-r94-top{display:flex;justify-content:space-between;gap:10px;align-items:flex-start}
      .stainher-contract-alert-r94 h4{margin:0 0 4px;font-size:14px}.stainher-contract-alert-r94 p{margin:5px 0;font-size:12px;line-height:1.45}
      .stainher-contract-alert-r94-meta{display:flex;gap:6px;flex-wrap:wrap;margin-top:8px}.stainher-contract-alert-r94-meta span{font-size:10px;border:1px solid var(--line);border-radius:999px;padding:3px 7px}
      .stainher-contract-alert-r94-actions{display:flex;gap:7px;flex-wrap:wrap;margin-top:10px}
      .stainher-contract-alert-r94[data-priority="alta"]{border-left:4px solid #e06b6b}.stainher-contract-alert-r94[data-priority="media"]{border-left:4px solid #d9ad58}
      @media(max-width:600px){.stainher-contract-alert-r94-top{display:block}.stainher-contract-alert-r94-actions .btn{width:100%}}
    `;document.head.appendChild(s);
  }
  async function load(){
    if(!window.sb)return [];
    const q=await window.sb.from('alertas_contrato_v1524').select('*').neq('estado','cerrada').order('detectada_at',{ascending:false}).limit(30);
    if(q.error){console.warn('[R94 alertas contrato]',q.error.message);return []}
    return q.data||[];
  }
  function card(a){
    const deadline=a.fecha_limite?` · Plazo: ${esc(a.fecha_limite)}`:'';
    return `<article class="stainher-contract-alert-r94" data-priority="${esc(a.prioridad||'media')}">
      <div class="stainher-contract-alert-r94-top"><div><h4>${esc(a.titulo)}</h4><small class="muted">${esc(a.categoria||'Contrato')} · ${esc(fmt(a.detectada_at))}</small></div><span class="status ${a.estado==='en_gestion'?'warn':'bad'}">${a.estado==='en_gestion'?'En gestión':'Nueva'}</span></div>
      <p><b>Qué cambió:</b> ${esc(a.cambio||'—')}</p>
      <p><b>Por qué importa:</b> ${esc(a.impacto||'—')}</p>
      <p><b>Próximo paso:</b> ${esc(a.proximo_paso||'—')}</p>
      <div class="stainher-contract-alert-r94-meta"><span>${esc(a.prioridad||'media')}</span>${a.responsable?'<span>Responsable: '+esc(a.responsable)+'</span>':''}${deadline?'<span>'+deadline.slice(3)+'</span>':''}</div>
      ${canManage()?`<div class="stainher-contract-alert-r94-actions"><button class="btn" data-alert-state="en_gestion" data-id="${esc(a.id)}">Marcar en gestión</button><button class="btn" data-alert-state="cerrada" data-id="${esc(a.id)}">Cerrar alerta</button></div>`:''}
    </article>`;
  }
  async function setState(id,estado){
    if(!canManage()||!window.sb)return;
    const payload={estado,updated_at:new Date().toISOString()};
    if(estado==='cerrada')payload.cerrada_at=new Date().toISOString();
    const q=await window.sb.from('alertas_contrato_v1524').update(payload).eq('id',id);
    if(q.error)return window.toast?.('No se pudo actualizar la alerta: '+q.error.message,'error');
    await mount(true);window.toast?.(estado==='cerrada'?'Alerta cerrada.':'Alerta en gestión.','success');
  }
  async function mount(force=false){
    const page=document.getElementById('page-inicio');if(!page)return;
    style();
    let panel=document.getElementById(PANEL);
    if(!panel){panel=document.createElement('section');panel.id=PANEL;panel.className='panel stainher-contract-alerts-r94';page.appendChild(panel)}
    if(panel.dataset.loading==='1'&&!force)return;
    panel.dataset.loading='1';
    const rows=await load();
    panel.innerHTML=`<div class="stainher-contract-alerts-r94-head"><div><h3>Alertas del contrato</h3><p>Cambios nuevos que requieren acción · Codelco División Andina</p></div><span class="status ${rows.length?'warn':'ok'}">${rows.length} abiertas</span></div><div class="stainher-contract-alerts-r94-list">${rows.length?rows.map(card).join(''):'<div class="empty">Sin alertas accionables abiertas.</div>'}</div>`;
    panel.querySelectorAll('[data-alert-state]').forEach(b=>b.addEventListener('click',()=>setState(b.dataset.id,b.dataset.alertState)));
    panel.dataset.loading='0';
  }
  function wrapHome(){
    const base=window.renderInicio;if(typeof base!=='function')return false;
    if(base.__contractAlertsR94)return true;
    const wrapped=async function(){const out=await base.apply(this,arguments);await mount(true);return out};
    wrapped.__contractAlertsR94=true;wrapped.__base=base;window.renderInicio=wrapped;try{renderInicio=wrapped}catch(_){}
    return true;
  }
  function boot(){
    style();
    if(!wrapHome()){let n=0;const t=setInterval(()=>{n++;if(wrapHome()||n>40)clearInterval(t)},125)}
    window.addEventListener('stainher:modules-ready',()=>{wrapHome();mount(true)});
    if(document.getElementById('page-inicio'))mount(true);
  }
  window.stainherRefreshContractAlerts=()=>mount(true);
  window.stainherContractAlertsUpsert=async payload=>{
    if(!window.sb)throw new Error('Supabase no disponible');
    const q=await window.sb.from('alertas_contrato_v1524').upsert(payload,{onConflict:'source_key'}).select().single();
    if(q.error)throw q.error;await mount(true);return q.data;
  };
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',boot,{once:true});else boot();
})();
