/* Stainher App V15.24 · regla RRHH vacaciones 7x7 · 11-09-2026 */
(()=>{
  'use strict';
  if(globalThis.__STAINHER_VACATION_7X7_RULE__)return;
  globalThis.__STAINHER_VACATION_7X7_RULE__=true;

  const calculate=(start,end,holidayValues=[])=>{
    const holidays=holidayValues instanceof Set?holidayValues:new Set(holidayValues||[]),days=[];
    if(!start||!end||start>end)return {days,totales:0,habiles:0,fines:0,festivos:0,descontar:0,modo:'invalido'};
    for(let d=new Date(start+'T12:00:00'),last=new Date(end+'T12:00:00');d<=last;d.setDate(d.getDate()+1)){
      const iso=`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
      const weekend=[0,6].includes(d.getDay()),holiday=holidays.has(iso),workday=!weekend&&!holiday;
      days.push({iso,weekend,holiday,workday});
    }
    const habiles=days.filter(x=>x.workday).length,fines=days.filter(x=>x.weekend).length,festivos=days.filter(x=>x.holiday).length;
    const descontar=habiles>0?habiles:(fines>0?fines:0);
    const modo=habiles>0?'habiles':fines>0?'fin_semana':'solo_festivos';
    return {days,totales:days.length,habiles,fines,festivos,descontar,modo};
  };
  globalThis.StainherVacation7x7Rule=Object.freeze({calculate});
  if(typeof document==='undefined'||typeof window==='undefined')return;

  const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
  let sequence=0;

  async function contextFor(uid){
    const [profile,dot]=await Promise.all([
      window.sb.from('perfiles').select('rol,saldo_vacaciones').eq('id',uid).maybeSingle(),
      window.sb.from('dotacion_contrato').select('cargo,aplica_turnos').eq('user_id',uid).maybeSingle()
    ]);
    if(profile.error)throw profile.error;if(dot.error)throw dot.error;
    const role=String(profile.data?.rol||''),cargo=normalize(dot.data?.cargo),fixed=/confiabilidad|expert[oa].*prevencion|programacion|planificacion/.test(cargo);
    return {profile:profile.data||{},dot:dot.data||{},seven:!fixed&&(!!dot.data?.aplica_turnos||['tecnico','supervisor','apr'].includes(role))};
  }

  async function applyPreview(form){
    const host=document.getElementById('vacationRequestPreview');
    if(!host||!form?.isConnected)return;
    const type=form.querySelector('[name="tipo"]')?.value,start=form.querySelector('[name="fecha_inicio"]')?.value,end=form.querySelector('[name="fecha_fin"]')?.value;
    if(type!=='vacaciones'||!start||!end||start>end)return;
    const uid=window.state?.session?.user?.id;if(!uid||!window.sb)return;
    const current=++sequence;
    try{
      const ctx=await contextFor(uid);if(current!==sequence||!ctx.seven)return;
      const hol=await window.sb.from('feriados_vacaciones').select('fecha,nombre').gte('fecha',start).lte('fecha',end);if(hol.error)throw hol.error;if(current!==sequence)return;
      let balance=Number(ctx.profile?.saldo_vacaciones??15);
      if(typeof window.stainherReadVacationBalance==='function'){
        const fresh=await window.stainherReadVacationBalance(uid);if(!fresh.error)balance=Number(fresh.data?.saldo_vacaciones??balance);
      }
      if(current!==sequence)return;
      const result=calculate(start,end,new Set((hol.data||[]).map(x=>x.fecha))),projected=balance-result.descontar;
      const explanation=result.modo==='habiles'
        ?'El período contiene días hábiles: solo se descuentan lunes a viernes no festivos. Fines de semana y festivos incluidos en el rango no descuentan.'
        :result.modo==='fin_semana'
          ?'El período no contiene días hábiles: los días de fin de semana solicitados sí se descuentan del saldo.'
          :'El período contiene solo días festivos: no se descuenta saldo.';
      host.classList.remove('hidden');
      host.dataset.vac7x7Signature=`${start}|${end}|${result.descontar}`;
      host.innerHTML=`<div data-vac7x7-rule="1"><div class="row-between"><div><h4>Vista previa de vacaciones</h4><div class="muted">Turno 7×7 · nueva regla RRHH</div></div><span class="status ${projected<0?'bad':'ok'}">${result.descontar} días a descontar</span></div><div class="v15-summary-grid" style="margin-top:10px"><div class="v15-summary-card"><span>Período</span><strong>${result.totales}</strong></div><div class="v15-summary-card"><span>Hábiles</span><strong>${result.habiles}</strong></div><div class="v15-summary-card"><span>Fin de semana</span><strong>${result.fines}</strong></div><div class="v15-summary-card"><span>Festivos</span><strong>${result.festivos}</strong></div><div class="v15-summary-card"><span>Saldo actual</span><strong>${balance.toFixed(2)}</strong></div><div class="v15-summary-card"><span>Saldo proyectado</span><strong>${projected.toFixed(2)}</strong></div></div><div class="notice">${esc(explanation)}</div>${projected<0?'<div class="notice error">Saldo insuficiente: la aprobación final será bloqueada.</div>':''}</div>`;
    }catch(error){console.warn('[vacaciones 7x7] No se pudo aplicar la vista previa actualizada',error)}
  }

  function bind(form){
    if(!form||form.dataset.vac7x7RuleBound==='1')return;
    form.dataset.vac7x7RuleBound='1';
    let timer;
    const schedule=()=>{clearTimeout(timer);timer=setTimeout(()=>applyPreview(form),40)};
    form.addEventListener('change',event=>{if(event.target?.matches?.('[name="tipo"],[name="fecha_inicio"],[name="fecha_fin"]'))schedule()});
    const waitForHost=new MutationObserver(()=>{
      const host=document.getElementById('vacationRequestPreview');
      if(!host)return;
      if(!host.querySelector('[data-vac7x7-rule="1"]'))schedule();
    });
    waitForHost.observe(form,{childList:true,subtree:true});
    schedule();
  }
  const scan=()=>document.querySelectorAll('#v1522ReqForm,#v1517RequestForm').forEach(bind);
  const observer=new MutationObserver(scan);observer.observe(document.body,{childList:true,subtree:true});scan();
})();
