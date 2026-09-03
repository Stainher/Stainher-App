/* Stainher App · Turnos y Novedades V15.24 candidate
 * - Registro de novedades directamente desde cada celda de la malla.
 * - Clasificación automática de encierro según turno base A/C/L.
 * - Condición Suspendido por encierro como evento superpuesto.
 * - Informe mensual: resumen cuantitativo por colaborador + detalle agrupado.
 */
(function installTurnosNovedadesV1524(){
  if (window.__STAINHER_TURNOS_V1524__) return;
  window.__STAINHER_TURNOS_V1524__ = true;

  const LABELS = {
    encierro_planificado: 'Encierro dentro de turno',
    encierro_no_planificado: 'Encierro fuera de turno',
    suspendido_encierro: 'Suspendido por encierro',
    dia_adicional: 'Día adicional',
    hora_extra: 'Horas extra',
    feriado: 'Horas feriado',
    vacaciones: 'Vacaciones',
    licencia_medica: 'Licencia médica',
    permiso: 'Permiso / ausencia',
    falta: 'Falta / ausencia',
    capacitacion: 'Capacitación',
    otro: 'Otra novedad'
  };

  const CODES = {
    encierro_planificado: 'ET',
    encierro_no_planificado: 'EF',
    suspendido_encierro: 'SE',
    dia_adicional: 'DA',
    hora_extra: 'HE',
    feriado: 'HF',
    vacaciones: 'V',
    licencia_medica: 'LM',
    permiso: 'P',
    falta: 'F',
    capacitacion: 'CAP',
    otro: 'EV'
  };

  const escHtml = value => typeof window.esc === 'function'
    ? window.esc(value == null ? '' : String(value))
    : String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));

  const fmtDate = value => typeof window.fmtDateCL === 'function' ? window.fmtDateCL(value) : String(value || '');
  const dateIso = d => typeof window.v1512DateIso === 'function' ? window.v1512DateIso(d) : d.toISOString().slice(0,10);
  const roleCanManage = () => typeof window.isAdmin === 'function' && window.isAdmin();

  function labelFor(type){ return LABELS[type] || (typeof window.v151TurnTypeLabel === 'function' ? window.v151TurnTypeLabel(type) : String(type || '').replaceAll('_',' ')); }
  function codeFor(type){ return CODES[type] || 'EV'; }

  function mountStyle(){
    if (document.getElementById('turnos-v1524-style')) return;
    const style = document.createElement('style');
    style.id = 'turnos-v1524-style';
    style.textContent = `
      .v1512-event-badge.ET{background:rgba(52,211,153,.16);color:#6ee7b7}
      .v1512-event-badge.EF{background:rgba(251,146,60,.18);color:#fdba74}
      .v1512-event-badge.SE{background:rgba(244,63,94,.18);color:#fda4af}
      .v1512-event-badge.HF{background:rgba(168,85,247,.18);color:#d8b4fe}
      .v1524-turn-hint{margin:0 0 10px;padding:9px 11px;border:1px solid #2c3d50;border-radius:10px;background:#0f1822;color:#a9bbcd;font-size:11px}
      .v1524-turn-hint b{color:#dbeafe}
      .v1524-day-modal .v1524-day-head{display:grid;grid-template-columns:1fr auto;gap:10px;align-items:start}
      .v1524-day-modal .v1524-base-card,.v1524-day-modal .v1524-event-card{border:1px solid var(--line);border-radius:12px;padding:12px;background:#0e151d;margin-top:12px}
      .v1524-day-modal .v1524-existing-events{display:grid;gap:7px;margin-top:8px}
      .v1524-day-modal .v1524-existing-event{display:grid;grid-template-columns:auto 1fr auto;gap:8px;align-items:center;padding:8px;border:1px solid #253240;border-radius:9px;background:#0b1118}
      .v1524-day-modal .v1524-existing-event small{display:block;color:var(--muted);margin-top:2px}
      .v1524-rule-box{padding:9px 10px;border:1px solid #2e4154;border-radius:9px;background:#111d29;color:#b9c9d9;font-size:11px;line-height:1.45}
      .v1524-report-summary{overflow:auto;margin-top:12px}
      .v1524-report-summary table{min-width:1180px;width:100%;border-collapse:collapse}
      .v1524-report-summary th,.v1524-report-summary td{border:1px solid #2b3642;padding:7px 8px;text-align:center;white-space:nowrap}
      .v1524-report-summary th:first-child,.v1524-report-summary td:first-child{text-align:left;position:sticky;left:0;background:#111923;z-index:2}
      .v1524-report-summary thead th{background:#182330;color:#dbeafe}
      .v1524-report-summary tfoot td{font-weight:800;background:#151f2a}
      .v1524-detail-groups{display:grid;gap:14px;margin-top:18px}
      .v1524-detail-group{border:1px solid var(--line);border-radius:12px;overflow:hidden;background:#0d141c}
      .v1524-detail-group h4{margin:0;padding:10px 12px;background:#151f2a;color:#dbeafe}
      .v1524-detail-scroll{overflow:auto}
      .v1524-detail-table{width:100%;min-width:820px;border-collapse:collapse}
      .v1524-detail-table th,.v1524-detail-table td{padding:7px 9px;border-top:1px solid #26313c;text-align:left;vertical-align:top}
      .v1524-detail-table th{color:#9fb3c8;font-size:10px;text-transform:uppercase;letter-spacing:.04em}
      .v1524-report-user-filter{display:grid;gap:6px;max-width:420px;margin:16px 0}
      .v1524-report-calendars{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,390px),1fr));gap:12px;margin:10px 0 18px}
      .v1524-user-calendar{border:1px solid var(--line);border-radius:12px;padding:10px;background:var(--panel,#0d141c)}
      .v1524-user-calendar h4{margin:0 0 8px}
      .v1524-report-legend{display:grid;grid-template-rows:repeat(3,minmax(26px,auto));grid-auto-flow:column;grid-auto-columns:minmax(145px,1fr);gap:7px 12px;margin:8px 0 16px;padding:10px 12px;border:1px solid var(--line);border-radius:12px;background:var(--panel,#0d141c);overflow-x:auto}
      .v1524-report-legend>span{display:grid;grid-template-columns:34px minmax(0,1fr);align-items:center;gap:7px;min-width:0;font-size:10px}
      .v1524-report-code{display:inline-flex;align-items:center;justify-content:center;min-width:34px;height:24px;padding:0 4px;border:1px solid currentColor;border-radius:7px;font-style:normal;font-weight:600}
      .v1524-calendar-week{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:4px}
      .v1524-calendar-week>b{text-align:center;color:var(--muted);font-size:10px;font-weight:500}
      .v1524-calendar-day{display:grid;grid-template-rows:auto 1fr auto;gap:3px;min-height:68px;padding:5px;border:1px solid var(--line);border-radius:7px;overflow:hidden}
      .v1524-calendar-day-number{font-size:10px;font-weight:500;color:var(--muted)}
      .v1524-calendar-shift{display:flex;align-items:center;justify-content:center;align-self:center;justify-self:center;width:30px;height:25px;border:1px solid currentColor;border-radius:8px;font-style:normal;font-size:12px;font-weight:600}
      .v1524-calendar-shift.base-A{color:#7db8ff;background:rgba(59,130,246,.16)}.v1524-calendar-shift.base-C{color:#70d99c;background:rgba(34,197,94,.14)}.v1524-calendar-shift.base-L{color:#b8c1cc;background:rgba(148,163,184,.14)}
      .v1524-calendar-events{display:block;min-height:13px;padding-top:3px;border-top:1px solid var(--line);font-size:8px;line-height:1.15;color:var(--muted);overflow-wrap:anywhere}
      .v1524-calendar-day.empty-day{visibility:hidden}
      @media(max-width:700px){
        .v1524-day-modal .form-grid{grid-template-columns:1fr!important}
        .v1524-day-modal .form-grid>*{grid-column:1!important}
        .v1524-calendar-day{min-height:48px;padding:3px}.v1524-calendar-day>small{font-size:7px}
      }
    `;
    document.head.appendChild(style);
  }

  function classifyEvent(type, base, date){
    if (type === 'encierro') {
      if (base === 'A' || base === 'C') return { tipo:'encierro_planificado', clasificacion:'Encierro dentro de turno' };
      if (base === 'L') return { tipo:'encierro_no_planificado', clasificacion:'Encierro fuera de turno' };
      throw new Error(`No se puede clasificar el encierro del ${fmtDate(date)}: el día está ${base || 'sin turno base'}.`);
    }
    if (type === 'suspendido_encierro') {
      if (base !== 'A' && base !== 'C') throw new Error(`Suspendido por encierro solo corresponde a un día programado A o C. ${fmtDate(date)} está ${base || 'sin turno base'}.`);
      return { tipo:'suspendido_encierro', clasificacion:'Suspendido por encierro' };
    }
    if (type === 'dia_adicional' && base !== 'L') {
      throw new Error(`El Día adicional solo puede registrarse sobre un día Libre. ${fmtDate(date)} está ${base || 'sin turno base'}.`);
    }
    return { tipo:type, clasificacion:null };
  }

  async function insertEvents({userId, start, end, type, cantidad, motivo, horaInicio, horaFin}){
    if (!window.sb) throw new Error('Supabase no está disponible.');
    const mq = await window.sb.from('turnos_malla_v1512').select('fecha,turno_base').eq('user_id', userId).gte('fecha', start).lte('fecha', end);
    if (mq.error) throw mq.error;
    const byDate = new Map((mq.data || []).map(x => [String(x.fecha), x.turno_base]));
    const rows = [];
    for (let d = new Date(start + 'T00:00:00'), last = new Date(end + 'T00:00:00'); d <= last; d.setDate(d.getDate()+1)) {
      const date = dateIso(d);
      const base = byDate.get(date) || null;
      const c = classifyEvent(type, base, date);
      const dt = new Date(date + 'T12:00:00');
      rows.push({
        user_id:userId,
        tipo:c.tipo,
        fecha_inicio:date,
        fecha_fin:date,
        cantidad:Number(cantidad) || (['hora_extra','feriado'].includes(c.tipo) ? 0 : 1),
        unidad:['hora_extra','feriado'].includes(c.tipo) ? 'horas' : 'días',
        motivo:motivo || null,
        anio:dt.getFullYear(),
        mes:dt.getMonth()+1,
        aprobado_por:window.state?.session?.user?.id || null,
        created_by:window.state?.session?.user?.id || null,
        turno_base:base,
        clasificacion_auto:c.clasificacion,
        hora_inicio:horaInicio || null,
        hora_fin:horaFin || null
      });
    }
    const q = await window.sb.from('turnos_novedades_v15').insert(rows);
    if (q.error) throw q.error;
    if (typeof window.v1512Audit === 'function') window.v1512Audit('turnos','registrar_evento_directo',userId,{tipo:type,desde:start,hasta:end,registros:rows.length});
    return rows;
  }

  function eventOptions(){
    return `
      <option value="encierro">Encierro (clasificación automática)</option>
      <option value="suspendido_encierro">Suspendido por encierro</option>
      <option value="dia_adicional">Día adicional</option>
      <option value="hora_extra">Horas extra</option>
      <option value="feriado">Horas de feriado</option>
      <option value="vacaciones">Vacaciones</option>
      <option value="licencia_medica">Licencia médica</option>
      <option value="falta">Falta / ausencia</option>
      <option value="otro">Otra novedad</option>`;
  }

  function currentPerson(uid){
    const data = window.state?.v1512TurnData;
    return data?.allPeople?.find(x => String(x.user_id) === String(uid)) || data?.people?.find(x => String(x.user_id) === String(uid));
  }

  function currentShift(uid,date){
    const shifts = window.state?.v1512TurnData?.shifts || [];
    return shifts.find(x => String(x.user_id) === String(uid) && String(x.fecha) === String(date));
  }

  function currentEvents(uid,date){
    const events = window.state?.v1512TurnData?.events || [];
    return events.filter(e => String(e.user_id) === String(uid) && date >= String(e.fecha_inicio || '') && date <= String(e.fecha_fin || e.fecha_inicio || ''));
  }

  window.v151TurnTypeLabel = function(type){ return LABELS[type] || String(type || '').replaceAll('_',' '); };
  window.v1512TurnEventCode = function(event){ return codeFor(event?.tipo); };

  window.v1512TurnLegend = function(){
    const base = [['A','Turno A'],['C','Turno C'],['L','Libre']];
    return `<div class="v1512-turn-legend">${base.map(([k,v])=>`<span><i class="v1512-shift ${k}">${k}</i>${v}</span>`).join('')}<span><i class="v1512-event-badge ET">ET</i>Encierro dentro de turno</span><span><i class="v1512-event-badge EF">EF</i>Encierro fuera de turno</span><span><i class="v1512-event-badge SE">SE</i>Suspendido por encierro</span><span><i class="v1512-event-badge DA">DA</i>Día adicional</span><span><i class="v1512-event-badge HE">HE</i>Horas extra</span><span><i class="v1512-event-badge HF">HF</i>Horas feriado</span></div>`;
  };

  window.v1512EditTurnCell = function(uid,date){
    if (!roleCanManage()) return;
    const person = currentPerson(uid);
    const shift = currentShift(uid,date);
    const base = shift?.turno_base || '';
    const events = currentEvents(uid,date);
    const eventRows = events.map(e => {
      const code = codeFor(e.tipo);
      const qty = Number(e.cantidad || 0);
      const extra = qty ? `${qty} ${escHtml(e.unidad || '')}` : '';
      return `<div class="v1524-existing-event"><span class="v1512-event-badge ${code}">${code}</span><div><b>${escHtml(labelFor(e.tipo))}</b><small>${escHtml(e.motivo || 'Sin detalle')}${extra ? ' · ' + escHtml(extra) : ''}</small></div><button class="btn" type="button" onclick="v1524DeleteTurnEvent('${e.id}','${uid}','${date}')">Eliminar</button></div>`;
    }).join('') || '<div class="empty">Sin novedades registradas para este día.</div>';

    const root = document.getElementById('modalRoot');
    if (!root) return;
    root.innerHTML = `<div class="modal-bg"><div class="modal v1524-day-modal" style="width:min(860px,100%)"><div class="v1524-day-head"><div><h3>${escHtml(person?.nombre || 'Colaborador')}</h3><div class="muted">${fmtDate(date)} · Turno base ${escHtml(base || 'sin asignar')}</div></div><button class="btn" onclick="closeModal()">Cerrar</button></div>
      <div class="v1524-base-card"><h4>Turno base</h4><form id="v1524BaseForm" class="form-grid"><label class="full">Planificación A / C / L<select class="field" name="turno_base"><option value="A" ${base==='A'?'selected':''}>A · Turno A</option><option value="C" ${base==='C'?'selected':''}>C · Turno C</option><option value="L" ${base==='L'?'selected':''}>L · Libre</option></select></label><label class="full">Observación<textarea class="field" name="observacion" rows="2">${escHtml(shift?.observacion || '')}</textarea></label><div class="full"><button class="btn">Guardar turno base</button></div></form></div>
      <div class="v1524-event-card"><div class="row-between"><div><h4 style="margin:0">Novedades del día</h4><div class="muted">Se superponen a la malla y no reemplazan A/C/L.</div></div></div><div class="v1524-existing-events">${eventRows}</div></div>
      <div class="v1524-event-card"><h4>Registrar novedad directamente</h4><form id="v1524EventForm" class="form-grid"><label>Tipo<select class="field" name="tipo" required>${eventOptions()}</select></label><label>Cantidad / horas<input class="field" name="cantidad" type="number" min="0" step="0.5" value="1"></label><label>Hora inicio<input class="field" name="hora_inicio" type="time"></label><label>Hora término<input class="field" name="hora_fin" type="time"></label><label class="full">Motivo / detalle<textarea class="field" name="motivo" rows="3" required></textarea></label><div class="full v1524-rule-box"><b>Clasificación automática:</b> A/C + Encierro = <b>Encierro dentro de turno</b>; L + Encierro = <b>Encierro fuera de turno</b>. <b>Suspendido por encierro</b> solo se admite sobre A/C. <b>Día adicional</b> solo se admite sobre L.</div><div class="full"><button class="btn primary">Registrar novedad</button></div></form></div>
    </div></div>`;

    document.getElementById('v1524BaseForm').onsubmit = async e => {
      e.preventDefault();
      const o = Object.fromEntries(new FormData(e.target));
      const payload = {user_id:uid,fecha:date,turno_base:o.turno_base,supervisor_user_id:person?.supervisor_user_id || (/supervisor/i.test(person?.cargo || '') ? uid : null),observacion:o.observacion || null,estado_publicacion:'borrador',created_by:window.state?.session?.user?.id,updated_at:new Date().toISOString()};
      const q = await window.sb.from('turnos_malla_v1512').upsert(payload,{onConflict:'user_id,fecha'});
      if (q.error) return window.toast?.(q.error.message,'error');
      window.v1512Audit?.('turnos','editar_dia',`${uid}|${date}`,payload);
      await window.renderTurnosV15?.();
      window.toast?.('Turno base actualizado','success');
      setTimeout(()=>window.v1512EditTurnCell(uid,date),0);
    };

    document.getElementById('v1524EventForm').onsubmit = async e => {
      e.preventDefault();
      const o = Object.fromEntries(new FormData(e.target));
      try {
        await insertEvents({userId:uid,start:date,end:date,type:o.tipo,cantidad:o.cantidad,motivo:o.motivo,horaInicio:o.hora_inicio,horaFin:o.hora_fin});
        await window.renderTurnosV15?.();
        window.toast?.('Novedad registrada','success');
        setTimeout(()=>window.v1512EditTurnCell(uid,date),0);
      } catch (err) {
        window.toast?.(err.message || String(err),'error');
      }
    };
  };

  window.v1524DeleteTurnEvent = async function(id,uid,date){
    if (!roleCanManage() || !confirm('¿Eliminar esta novedad?')) return;
    const q = await window.sb.from('turnos_novedades_v15').delete().eq('id',id);
    if (q.error) return window.toast?.(q.error.message,'error');
    await window.renderTurnosV15?.();
    window.toast?.('Novedad eliminada','success');
    setTimeout(()=>window.v1512EditTurnCell(uid,date),0);
  };

  window.v15OpenTurnEvent = async function(){
    if (!roleCanManage()) return window.toast?.('Solo el Administrador registra novedades de turno.','error');
    const data = window.state?.v1512TurnData || await window.v1512LoadTurnData();
    const people = (data?.allPeople || []).filter(x => x.estado === 'activo' && x.user_id && (typeof window.v1513TurnEligible !== 'function' || window.v1513TurnEligible(x)));
    const today = dateIso(new Date());
    const root = document.getElementById('modalRoot');
    root.innerHTML = `<div class="modal-bg"><div class="modal" style="width:min(820px,100%)"><div class="row-between"><div><h3>Nueva novedad de turno</h3><div class="muted">La clasificación del encierro se determina desde la malla A/C/L.</div></div><button class="btn" onclick="closeModal()">Cerrar</button></div><form id="v1524RangeEventForm" class="form-grid"><label class="full">Colaborador<select class="field" name="user_id" required><option value="">Seleccionar</option>${people.map(p=>`<option value="${p.user_id}">${escHtml(p.nombre)}</option>`).join('')}</select></label><label>Tipo<select class="field" name="tipo" required>${eventOptions()}</select></label><label>Cantidad / horas<input class="field" name="cantidad" type="number" min="0" step="0.5" value="1"></label><label>Fecha inicio<input class="field" name="fecha_inicio" type="date" value="${today}" required></label><label>Fecha término<input class="field" name="fecha_fin" type="date" value="${today}" required></label><label>Hora inicio<input class="field" name="hora_inicio" type="time"></label><label>Hora término<input class="field" name="hora_fin" type="time"></label><label class="full">Motivo / detalle<textarea class="field" name="motivo" rows="4" required></textarea></label><div class="full v1524-rule-box"><b>Reglas:</b> Encierro sobre A/C = dentro de turno; sobre L = fuera de turno. Suspendido por encierro solo sobre A/C. Día adicional solo sobre L. Los eventos permanecen separados de la planificación base.</div><div class="full"><button class="btn primary">Guardar novedad</button></div></form></div></div>`;
    document.getElementById('v1524RangeEventForm').onsubmit = async e => {
      e.preventDefault();
      const o = Object.fromEntries(new FormData(e.target));
      if (o.fecha_inicio > o.fecha_fin) return window.toast?.('Rango de fechas no válido.','error');
      try {
        const rows = await insertEvents({userId:o.user_id,start:o.fecha_inicio,end:o.fecha_fin,type:o.tipo,cantidad:o.cantidad,motivo:o.motivo,horaInicio:o.hora_inicio,horaFin:o.hora_fin});
        window.closeModal?.();
        await window.renderTurnosV15?.();
        window.toast?.(`${rows.length} novedad(es) registrada(s)`,'success');
      } catch (err) { window.toast?.(err.message || String(err),'error'); }
    };
  };

  function eachDateClipped(start,end,monthStart,monthEnd){
    const out=[];
    const s = start < monthStart ? monthStart : start;
    const e = end > monthEnd ? monthEnd : end;
    if (!s || !e || s > e) return out;
    for(let d=new Date(s+'T00:00:00'), last=new Date(e+'T00:00:00'); d<=last; d.setDate(d.getDate()+1)) out.push(dateIso(d));
    return out;
  }

  async function buildReport(){
    const y = Number(window.state?.turnYearV1512 || new Date().getFullYear());
    const m = Number(window.state?.turnMonthV1512 || new Date().getMonth()+1);
    const range = typeof window.v1512TurnMonthRange === 'function' ? window.v1512TurnMonthRange(y,m) : {start:`${y}-${String(m).padStart(2,'0')}-01`,end:`${y}-${String(m).padStart(2,'0')}-31`};
    const [eq,pq,sq,rq] = await Promise.all([
      window.sb.from('turnos_novedades_v15').select('*').lte('fecha_inicio',range.end).gte('fecha_fin',range.start).order('fecha_inicio',{ascending:true}),
      window.sb.from('perfiles').select('id,nombre,rol'),
      window.sb.from('turnos_malla_v1512').select('user_id,fecha,turno_base').gte('fecha',range.start).lte('fecha',range.end).order('fecha',{ascending:true}),
      window.sb.from('solicitudes_v15').select('id,estado,tipo')
    ]);
    if (eq.error) throw eq.error;
    if (pq.error) throw pq.error;
    if (sq.error) throw sq.error;
    if (rq.error) throw rq.error;
    const activeVacationRequests = new Set((rq.data || [])
      .filter(request => request.tipo === 'vacaciones' && request.estado === 'aprobada')
      .map(request => String(request.id)));
    const reportEvents = (eq.data || []).filter(event => {
      if (event.tipo !== 'vacaciones' || !event.solicitud_id) return true;
      return activeVacationRequests.has(String(event.solicitud_id));
    });
    const names = new Map((pq.data || []).map(x => [String(x.id), x.nombre || x.id]));
    const groups = new Map();
    const ensure = uid => {
      const key = String(uid || '');
      if (!groups.has(key)) groups.set(key,{uid:key,nombre:names.get(key)||'Usuario',encDentro:new Set(),encFuera:new Set(),suspendido:new Set(),diasAdicionales:new Set(),he:0,hf:0,vacaciones:new Set(),licencias:new Set(),faltas:new Set(),otros:0,eventos:[],turnos:new Map()});
      return groups.get(key);
    };

    reportEvents.forEach(ev => {
      const g = ensure(ev.user_id);
      const dates = eachDateClipped(String(ev.fecha_inicio || ''),String(ev.fecha_fin || ev.fecha_inicio || ''),range.start,range.end);
      if (ev.tipo === 'encierro_planificado') dates.forEach(d=>g.encDentro.add(d));
      else if (ev.tipo === 'encierro_no_planificado') dates.forEach(d=>g.encFuera.add(d));
      else if (ev.tipo === 'suspendido_encierro') dates.forEach(d=>g.suspendido.add(d));
      else if (ev.tipo === 'dia_adicional') dates.forEach(d=>g.diasAdicionales.add(d));
      else if (ev.tipo === 'hora_extra') g.he += Number(ev.cantidad) || 0;
      else if (ev.tipo === 'feriado') g.hf += Number(ev.cantidad) || 0;
      else if (ev.tipo === 'vacaciones') dates.forEach(d=>g.vacaciones.add(d));
      else if (ev.tipo === 'licencia_medica') dates.forEach(d=>g.licencias.add(d));
      else if (ev.tipo === 'falta' || ev.tipo === 'permiso') dates.forEach(d=>g.faltas.add(d));
      else g.otros += 1;
      g.eventos.push(ev);
    });
    (sq.data||[]).forEach(shift=>ensure(shift.user_id).turnos.set(String(shift.fecha),String(shift.turno_base||'')));

    const rows = [...groups.values()].map(g=>({
      uid:g.uid,nombre:g.nombre,encDentro:g.encDentro.size,encFuera:g.encFuera.size,suspendido:g.suspendido.size,diasAdicionales:g.diasAdicionales.size,he:g.he,hf:g.hf,vacaciones:g.vacaciones.size,licencias:g.licencias.size,faltas:g.faltas.size,otros:g.otros,
      eventos:g.eventos.sort((a,b)=>String(a.fecha_inicio).localeCompare(String(b.fecha_inicio))),turnos:g.turnos
    })).sort((a,b)=>a.nombre.localeCompare(b.nombre,'es'));
    const total = rows.reduce((a,r)=>({nombre:'TOTAL GENERAL',encDentro:a.encDentro+r.encDentro,encFuera:a.encFuera+r.encFuera,suspendido:a.suspendido+r.suspendido,diasAdicionales:a.diasAdicionales+r.diasAdicionales,he:a.he+r.he,hf:a.hf+r.hf,vacaciones:a.vacaciones+r.vacaciones,licencias:a.licencias+r.licencias,faltas:a.faltas+r.faltas,otros:a.otros+r.otros}),{encDentro:0,encFuera:0,suspendido:0,diasAdicionales:0,he:0,hf:0,vacaciones:0,licencias:0,faltas:0,otros:0});
    return {y,m,range,rows,total};
  }

  function qtyLabel(ev){
    const n = Number(ev.cantidad || 0);
    if (!n) return '—';
    return `${n} ${ev.unidad || ''}`.trim();
  }
  function hoursLabel(ev){
    const a = String(ev.hora_inicio || '').slice(0,5), b = String(ev.hora_fin || '').slice(0,5);
    return a || b ? `${a || '—'} a ${b || '—'}` : '—';
  }
  function dateRangeLabel(ev){
    const a = fmtDate(ev.fecha_inicio), b = fmtDate(ev.fecha_fin || ev.fecha_inicio);
    return String(ev.fecha_fin || '') && ev.fecha_fin !== ev.fecha_inicio ? `${a} al ${b}` : a;
  }

  function reportRows(r){
    const uid=String(window.state?.v1524TurnReportUser||'');
    return uid?r.rows.filter(row=>row.uid===uid):r.rows;
  }
  function eventCodesOn(row,date){
    return row.eventos.filter(ev=>String(ev.fecha_inicio||'')<=date&&String(ev.fecha_fin||ev.fecha_inicio||'')>=date).map(ev=>codeFor(ev.tipo));
  }
  function reportLegendHtml(){
    return `<div class="v1524-report-legend" aria-label="Glosa del informe">${Object.entries(LABELS).map(([type,label])=>`<span><i class="v1524-report-code v1512-event-badge ${escHtml(codeFor(type))}">${escHtml(codeFor(type))}</i>${escHtml(label)}</span>`).join('')}</div>`;
  }
  function calendarHtml(r,row){
    const days=new Date(r.y,r.m,0).getDate(),offset=(new Date(r.y,r.m-1,1).getDay()+6)%7;
    const cells=Array.from({length:offset},()=>'<span class="v1524-calendar-day empty-day"></span>');
    for(let day=1;day<=days;day++){
      const date=`${r.y}-${String(r.m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      const base=row.turnos?.get(date)||'—',events=eventCodesOn(row,date);
      cells.push(`<span class="v1524-calendar-day"><b class="v1524-calendar-day-number">${day}</b><i class="v1524-calendar-shift base-${escHtml(base)}">${escHtml(base)}</i><small class="v1524-calendar-events">${events.length?escHtml([...new Set(events)].join(' · ')):'&nbsp;'}</small></span>`);
    }
    return `<section class="v1524-user-calendar"><h4>${escHtml(row.nombre)}</h4><div class="v1524-calendar-week"><b>Lun</b><b>Mar</b><b>Mié</b><b>Jue</b><b>Vie</b><b>Sáb</b><b>Dom</b>${cells.join('')}</div></section>`;
  }
  function renderReportCalendars(){
    const r=window.state?.v1516TurnReport,host=document.getElementById('v1524ReportCalendars');if(!r||!host)return;
    const rows=reportRows(r);host.innerHTML=rows.map(row=>calendarHtml(r,row)).join('')||'<div class="empty">Sin planificación para el colaborador seleccionado.</div>';
  }
  function rowsTotal(rows){
    return rows.reduce((a,row)=>{for(const key of ['encDentro','encFuera','suspendido','diasAdicionales','he','hf','vacaciones','licencias','faltas','otros'])a[key]+=Number(row[key]||0);return a},{encDentro:0,encFuera:0,suspendido:0,diasAdicionales:0,he:0,hf:0,vacaciones:0,licencias:0,faltas:0,otros:0});
  }
  function calendarExportRows(r,row){
    const days=new Date(r.y,r.m,0).getDate(),out=[];
    for(let day=1;day<=days;day++){
      const date=`${r.y}-${String(r.m).padStart(2,'0')}-${String(day).padStart(2,'0')}`;
      out.push({date,day,base:row.turnos?.get(date)||'—',events:[...new Set(eventCodesOn(row,date))].join(' · ')});
    }
    return out;
  }
  window.v1524FilterTurnReport=function(uid=''){
    window.state.v1524TurnReportUser=String(uid||'');
    document.querySelectorAll('[data-v1524-report-user]').forEach(node=>node.hidden=!!uid&&node.dataset.v1524ReportUser!==uid);
    const r=window.state?.v1516TurnReport,total=r?rowsTotal(reportRows(r)):null,foot=document.querySelector('#v1524ReportSummaryTable tfoot');
    if(foot&&total)foot.innerHTML=`<tr><td>TOTAL SELECCIÓN</td><td>${total.encDentro}</td><td>${total.encFuera}</td><td>${total.suspendido}</td><td>${total.diasAdicionales}</td><td>${total.he.toFixed(1)} h</td><td>${total.hf.toFixed(1)} h</td><td>${total.vacaciones}</td><td>${total.licencias}</td><td>${total.faltas}</td><td>${total.otros}</td></tr>`;
    renderReportCalendars();
  };

  window.v1516TurnMonthlyRows = buildReport;

  window.v1516OpenTurnMonthlyReport = async function(){
    try {
      const r = await buildReport();
      window.state.v1516TurnReport = r;
      const summaryRows = r.rows.map(x=>`<tr data-v1524-report-user="${escHtml(x.uid)}"><td>${escHtml(x.nombre)}</td><td>${x.encDentro}</td><td>${x.encFuera}</td><td>${x.suspendido}</td><td>${x.diasAdicionales}</td><td>${x.he.toFixed(1)} h</td><td>${x.hf.toFixed(1)} h</td><td>${x.vacaciones}</td><td>${x.licencias}</td><td>${x.faltas}</td><td>${x.otros}</td></tr>`).join('') || '<tr><td colspan="11" class="empty">Sin eventos registrados para el período.</td></tr>';
      const detail = r.rows.map(g=>`<section class="v1524-detail-group" data-v1524-report-user="${escHtml(g.uid)}"><h4>${escHtml(g.nombre)} · ${g.eventos.length} evento(s)</h4><div class="v1524-detail-scroll"><table class="v1524-detail-table"><thead><tr><th>Fecha</th><th>Turno base</th><th>Evento</th><th>Cantidad</th><th>Horario</th><th>Detalle / motivo</th></tr></thead><tbody>${g.eventos.map(ev=>`<tr><td>${escHtml(dateRangeLabel(ev))}</td><td>${escHtml(ev.turno_base || '—')}</td><td>${escHtml(labelFor(ev.tipo))}</td><td>${escHtml(qtyLabel(ev))}</td><td>${escHtml(hoursLabel(ev))}</td><td>${escHtml(ev.motivo || ev.observacion || 'Sin detalle')}</td></tr>`).join('')}</tbody></table></div></section>`).join('') || '<div class="empty">Sin detalle de eventos.</div>';
      const monthName = window.MONTHS_ES?.[r.m-1] || String(r.m);
      document.getElementById('modalRoot').innerHTML = `<div class="modal-bg"><div class="modal" style="width:min(1240px,100%);max-height:92vh;overflow:auto"><div class="row-between"><div><h3>Informe mensual · Turnos y Novedades</h3><div class="muted">${escHtml(monthName)} ${r.y}</div></div><button class="btn" onclick="closeModal()">Cerrar</button></div><label class="v1524-report-user-filter">Colaborador<select class="field" onchange="v1524FilterTurnReport(this.value)"><option value="">Todos los colaboradores</option>${r.rows.map(row=>`<option value="${escHtml(row.uid)}">${escHtml(row.nombre)}</option>`).join('')}</select></label><h4>Glosa</h4>${reportLegendHtml()}<h4>Resumen calendario</h4><div id="v1524ReportCalendars" class="v1524-report-calendars"></div><h4>Resumen de eventos por colaborador</h4><div class="muted">El resumen muestra únicamente cantidades por tipo de evento. El detalle se presenta agrupado por colaborador.</div><div class="v1524-report-summary"><table id="v1524ReportSummaryTable"><thead><tr><th>Colaborador</th><th>Enc. dentro turno</th><th>Enc. fuera turno</th><th>Suspendido encierro</th><th>Días adicionales</th><th>Horas extra</th><th>Horas feriado</th><th>Vacaciones</th><th>Lic. médica</th><th>Falta / ausencia</th><th>Otros</th></tr></thead><tbody>${summaryRows}</tbody><tfoot></tfoot></table></div><h4 style="margin-top:18px">Listado de eventos con detalle</h4><div class="v1524-detail-groups">${detail}</div><div class="actions" style="margin-top:18px"><button class="btn" onclick="v1516ExportTurnReportExcel()">Exportar Excel</button><button class="btn primary" onclick="v1516ExportTurnReportPdf()">Generar PDF</button></div></div></div>`;
      window.state.v1524TurnReportUser='';window.v1524FilterTurnReport('');
    } catch (err) { window.toast?.(err.message || String(err),'error'); }
  };

  window.v1516ExportTurnReportExcel = function(){
    const r = window.state?.v1516TurnReport;
    if (!r || !window.XLSX) return;
    const selected=reportRows(r),total=rowsTotal(selected);
    const summary = [...selected.map(x=>({
      'Colaborador':x.nombre,
      'Encierro dentro de turno':x.encDentro,
      'Encierro fuera de turno':x.encFuera,
      'Suspendido por encierro':x.suspendido,
      'Días adicionales':x.diasAdicionales,
      'Horas extra':x.he,
      'Horas feriado':x.hf,
      'Vacaciones':x.vacaciones,
      'Licencia médica':x.licencias,
      'Falta / ausencia':x.faltas,
      'Otros':x.otros
    })),{
      'Colaborador':'TOTAL SELECCIÓN','Encierro dentro de turno':total.encDentro,'Encierro fuera de turno':total.encFuera,'Suspendido por encierro':total.suspendido,'Días adicionales':total.diasAdicionales,'Horas extra':total.he,'Horas feriado':total.hf,'Vacaciones':total.vacaciones,'Licencia médica':total.licencias,'Falta / ausencia':total.faltas,'Otros':total.otros
    }];
    const detail=[],calendar=[];
    selected.forEach(g=>{g.eventos.forEach(ev=>detail.push({'Colaborador':g.nombre,'Fecha / rango':dateRangeLabel(ev),'Turno base':ev.turno_base || '','Tipo de evento':labelFor(ev.tipo),'Cantidad':Number(ev.cantidad || 0),'Unidad':ev.unidad || '','Hora inicio':String(ev.hora_inicio || '').slice(0,5),'Hora término':String(ev.hora_fin || '').slice(0,5),'Detalle / motivo':ev.motivo || ev.observacion || ''}));calendarExportRows(r,g).forEach(day=>calendar.push({'Colaborador':g.nombre,'Fecha':day.date,'Día':day.day,'Turno base':day.base,'Novedades':day.events}))});
    const wb = window.XLSX.utils.book_new();
    window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(summary),'Resumen por colaborador');
    window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(calendar),'Calendario mensual');
    window.XLSX.utils.book_append_sheet(wb,window.XLSX.utils.json_to_sheet(detail),'Detalle agrupado');
    const suffix=selected.length===1?'_'+selected[0].nombre.replace(/[^a-z0-9]+/gi,'_'):'';
    window.XLSX.writeFile(wb,`Turnos_Novedades_${r.y}_${String(r.m).padStart(2,'0')}${suffix}.xlsx`);
  };

  window.v1516ExportTurnReportPdf = function(){
    const r = window.state?.v1516TurnReport;
    const C = typeof window.ensurePdf === 'function' ? window.ensurePdf() : null;
    if (!r || !C) return window.toast?.('No se pudo cargar el generador PDF.','error');
    const selected=reportRows(r),total=rowsTotal(selected),doc = new C({orientation:'landscape',unit:'mm',format:'a4'});
    const monthName = window.MONTHS_ES?.[r.m-1] || String(r.m);
    const selectionLabel=selected.length===1?` · ${selected[0].nombre}`:'';
    window.pdfHeader?.(doc,'Informe Mensual de Turnos y Novedades',`${monthName} ${r.y}${selectionLabel}`);
    doc.setFontSize(10);doc.text('Resumen de eventos por colaborador',14,43);
    doc.autoTable({startY:47,head:[['Colaborador','Enc. dentro','Enc. fuera','Suspendido','Días adic.','H. extra','H. feriado','Vac.','Lic. med.','Faltas','Otros']],body:[...selected.map(x=>[x.nombre,x.encDentro,x.encFuera,x.suspendido,x.diasAdicionales,x.he.toFixed(1),x.hf.toFixed(1),x.vacaciones,x.licencias,x.faltas,x.otros]),['TOTAL SELECCIÓN',total.encDentro,total.encFuera,total.suspendido,total.diasAdicionales,total.he.toFixed(1),total.hf.toFixed(1),total.vacaciones,total.licencias,total.faltas,total.otros]],styles:{fontSize:6.7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]}});
    selected.forEach(row=>{
      doc.addPage();window.pdfHeader?.(doc,'Resumen calendario de turnos',`${row.nombre} · ${monthName} ${r.y}`);
      const legendItems=Object.entries(LABELS).map(([type,label])=>`${codeFor(type)} · ${label}`),legendRows=[];
      for(let index=0;index<legendItems.length;index+=5)legendRows.push(legendItems.slice(index,index+5));
      doc.setFontSize(8);doc.setFont(undefined,'bold');doc.text('Glosa',14,42);doc.setFont(undefined,'normal');
      doc.autoTable({startY:44,body:legendRows,theme:'grid',styles:{fontSize:5.8,cellPadding:1.3,textColor:[52,64,84],fillColor:[246,248,251]},columnStyles:{0:{cellWidth:53},1:{cellWidth:53},2:{cellWidth:53},3:{cellWidth:53},4:{cellWidth:53}}});
      const days=calendarExportRows(r,row),offset=(new Date(r.y,r.m-1,1).getDay()+6)%7,cells=[...Array(offset).fill(null),...days];
      while(cells.length%7)cells.push('');
      const weeks=[];for(let index=0;index<cells.length;index+=7)weeks.push(cells.slice(index,index+7));
      const shiftColors={A:[220,235,255],C:[220,247,231],L:[235,239,244]};
      doc.autoTable({startY:(doc.lastAutoTable?.finalY||57)+4,head:[['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo']],body:weeks.map(week=>week.map(day=>day?{content:'',day,styles:{minCellHeight:25}}:'')),styles:{fontSize:7,cellPadding:2,minCellHeight:25,textColor:[25,31,40],valign:'top'},headStyles:{fillColor:[35,43,54],textColor:[255,255,255]},didDrawCell:data=>{
        if(data.section!=='body'||!data.cell.raw||typeof data.cell.raw!=='object')return;
        const day=data.cell.raw.day,x=data.cell.x,y=data.cell.y,w=data.cell.width,h=data.cell.height,base=String(day.base||'—'),events=String(day.events||'');
        doc.setTextColor(78,91,112);doc.setFontSize(6.5);doc.setFont(undefined,'normal');doc.text(String(day.day),x+2,y+4);
        const fill=shiftColors[base]||[242,244,247];doc.setFillColor(...fill);doc.setDrawColor(170,181,195);doc.roundedRect(x+w/2-5,y+7,10,7,1.5,1.5,'FD');doc.setTextColor(25,31,40);doc.setFontSize(7.5);doc.setFont(undefined,'bold');doc.text(base,x+w/2,y+11.7,{align:'center'});
        doc.setDrawColor(211,218,227);doc.line(x+2,y+h-7,x+w-2,y+h-7);doc.setFont(undefined,'normal');doc.setFontSize(5.5);doc.setTextColor(91,104,120);doc.text(events||' ',x+2,y+h-3,{maxWidth:w-4});
      }});
    });
    doc.addPage();window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${monthName} ${r.y}`);
    let y = 44;
    selected.forEach(g=>{
      if (y > 175) { doc.addPage();window.pdfHeader?.(doc,'Detalle de Turnos y Novedades',`${monthName} ${r.y}`);y=44; }
      doc.setFontSize(9);doc.setFont(undefined,'bold');doc.text(g.nombre,14,y);doc.setFont(undefined,'normal');
      doc.autoTable({startY:y+3,head:[['Fecha','Turno','Evento','Cantidad','Horario','Detalle / motivo']],body:g.eventos.map(ev=>[dateRangeLabel(ev),ev.turno_base || '—',labelFor(ev.tipo),qtyLabel(ev),hoursLabel(ev),ev.motivo || ev.observacion || 'Sin detalle']),styles:{fontSize:7,cellPadding:1.8,textColor:[25,31,40]},headStyles:{fillColor:[49,61,74],textColor:[255,255,255]},columnStyles:{5:{cellWidth:96}}});
      y = (doc.lastAutoTable?.finalY || y+12) + 7;
    });
    const suffix=selected.length===1?'_'+selected[0].nombre.replace(/[^a-z0-9]+/gi,'_'):'';
    doc.save(`Turnos_Novedades_${r.y}_${String(r.m).padStart(2,'0')}${suffix}.pdf`);
  };

  function enhancePage(){
    const page = document.getElementById('page-turnos');
    if (!page) return;
    page.querySelectorAll('.v1512-turn-cell,.v1512-day-mini').forEach(cell=>cell.setAttribute('title','Clic para editar turno base y registrar novedades del día'));
    const legend = page.querySelector('.v1512-turn-legend');
    if (legend && !page.querySelector('.v1524-turn-hint')) {
      const hint = document.createElement('div');
      hint.className = 'v1524-turn-hint';
      hint.innerHTML = '<b>Registro directo:</b> selecciona cualquier día de la malla para agregar Encierro, Suspendido por encierro, Día adicional, Horas extra, Horas feriado u otra novedad.';
      legend.insertAdjacentElement('afterend',hint);
    }
  }

  function install(){
    mountStyle();
    if (typeof window.renderTurnosV15 !== 'function' || !window.sb) return false;
    const previousRender = window.renderTurnosV15;
    if (!previousRender.__v1524wrapped) {
      const wrapped = async function(){ const out = await previousRender.apply(this,arguments); enhancePage(); return out; };
      wrapped.__v1524wrapped = true;
      window.renderTurnosV15 = wrapped;
    }
    enhancePage();
    return true;
  }

  let attempts = 0;
  function boot(){
    if (install()) return;
    if (++attempts < 40) setTimeout(boot,100);
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded',boot,{once:true}); else boot();
})();
