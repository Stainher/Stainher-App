/* Dinámicas de oficina del Diario Mural. */
(()=>{
'use strict';
const base=new URL('.',document.currentScript.src);
const TITLES={desafio:'Desafío de sobremesa',aplausos:'Un aplauso para…'};
const CATEGORIES={acertijo:'Acertijo',palabras:'Juego de palabras',trivia:'Trivia'};
const LETTERS=['A','B','C'];
const APPLAUSE_COLUMNS='id,destinatario,mensaje,estado,creado_at';
const APPLAUSE_TABLE='tv_social_aplausos';
const ANSWERS_TABLE='tv_social_respuestas';
const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const client=()=>typeof sb==='undefined'?window.sb:sb;
const profile=()=>typeof state==='undefined'?window.state?.profile:state.profile;
const currentUser=()=>typeof state==='undefined'?window.state?.session?.user:state.session?.user;
const active=()=>!!currentUser()&&!!profile()?.activo;
const admin=()=>active()&&profile().rol==='administrador';
const view=new WeakMap();
let participant=null;

async function request(query){
  const result=await query;
  if(result.error)throw result.error;
  return result.data;
}
async function round(tv=false){
  const data=await request(client().rpc(tv?'tv_social_tv':'tv_social_ronda'));
  return {round:data?.ronda??null,automatic:!!data?.automatico,score:data?.marcador??[],
    serverTime:Date.parse(data?.ahora),received:performance.now()};
}
function timeLeft(snapshot){
  if(!snapshot?.round?.cierre)return 0;
  return Date.parse(snapshot.round.cierre)-snapshot.serverTime-(performance.now()-snapshot.received);
}
function timeLabel(ms){
  const total=Math.max(0,Math.ceil(ms/1000));
  return `${Math.floor(total/60)}:${String(total%60).padStart(2,'0')}`;
}
function isOpen(snapshot){
  return !!snapshot?.round&&!snapshot.round.correcta&&(snapshot.round.esperando||timeLeft(snapshot)>0);
}
function timerText(snapshot){
  if(snapshot?.round?.esperando)return 'Esperando la primera respuesta';
  if(snapshot?.round?.correcta)return 'Ronda finalizada';
  const remaining=timeLeft(snapshot);
  return remaining>0?timeLabel(remaining):'Mostrando solución…';
}
function scoreMarkup(score=[]){
  return `<div class="tv-social-score"><strong>🏆 Marcador acumulado</strong>${score.length
    ?`<ol>${score.map(entry=>`<li><span>${esc(entry.nombre)}</span><b>${esc(entry.puntos)} ${entry.puntos===1?'punto':'puntos'}</b></li>`).join('')}</ol>`
    :'<p>Aún sin puntos.</p>'}</div>`;
}
function qr(type){
  const src=new URL(`tv-qr-${type}-r413.svg`,base).href;
  return `<aside class="tv-social-qr"><img src="${src}" alt="QR para ${type==='desafio'?'responder el desafío':'enviar un aplauso'}"><span>Escanea y participa</span></aside>`;
}
function answerLabel(r){
  return `${LETTERS[r.correcta-1]}. ${r.opciones[r.correcta-1]}`;
}
function roundMarkup(snapshot){
  const r=snapshot?.round;
  if(!r)return '<p class="tv-social-prompt">El próximo desafío aparecerá aquí cuando Administración lo inicie.</p>'+scoreMarkup(snapshot?.score);
  return `<div class="tv-social-top"><span class="tv-social-tag">${esc(CATEGORIES[r.categoria])}</span><strong data-social-countdown></strong></div>
    <p class="tv-social-prompt">${esc(r.pregunta)}</p>
    <ol class="tv-social-options">${r.opciones.map((option,index)=>`<li><b>${LETTERS[index]}</b>${esc(option)}</li>`).join('')}</ol>
    ${r.correcta?`<div class="tv-social-answer"><b>${r.ganador?`🏆 Ganó ${esc(r.ganador)} · +1 punto`:'Ronda sin ganador'}</b>
      <div>Solución · ${esc(answerLabel(r))}</div>${r.explicacion?`<p>${esc(r.explicacion)}</p>`:''}</div>`:''}
    ${scoreMarkup(snapshot.score)}`;
}
function applauseMarkup(message){
  return message?`<div class="tv-social-applause"><span class="tv-social-tag">🙌 Reconocimiento del equipo</span><h3>Para ${esc(message.destinatario)}</h3><blockquote>${esc(message.mensaje)}</blockquote></div>`
    :'<p class="tv-social-prompt">Escanea el QR para agradecerle a alguien del equipo.</p>';
}
function paint(root,state){
  let changed=false;
  for(const node of root.querySelectorAll('[data-tv-social]')){
    const type=node.dataset.tvSocial;
    const isQuiz=type==='desafio';
    const messages=state.applause||[];
    const message=messages[Math.floor(performance.now()/9000)%messages.length];
    const error=state[type]?.error;
    const r=state.quiz?.round;
    const key=error?'error':isQuiz?JSON.stringify([r?.id,r?.correcta,state.quiz?.score]):message?.id||'empty';
    if(node.dataset.content!==key){
      node.dataset.content=key;
      changed=true;
      node.innerHTML=`<div class="tv-social-main">${error?'<p class="tv-empty">No se pudo actualizar esta dinámica. Se reintentará.</p>':isQuiz?roundMarkup(state.quiz):applauseMarkup(message)}</div>${qr(type)}`;
    }
    const clock=node.querySelector('[data-social-countdown]');
    if(clock)clock.textContent=timerText(state.quiz);
  }
  if(changed)state.onLayout?.();
}
function tick(root,onLayout){
  if(!root.querySelector('[data-tv-social]'))return;
  let state=view.get(root);
  if(!state){state={desafio:{},aplausos:{}};view.set(root,state)}
  if(onLayout)state.onLayout=onLayout;
  paint(root,state);
  for(const type of Object.keys(TITLES)){
    const slot=state[type],now=performance.now();
    if(!root.querySelector(`[data-tv-social="${type}"]`)||slot.pending||now<(slot.retryAt||0))continue;
    slot.pending=true;
    const job=type==='desafio'?round(true):request(client().from(APPLAUSE_TABLE).select(APPLAUSE_COLUMNS)
      .eq('estado','publicado').order('creado_at',{ascending:false}).limit(6));
    job.then(data=>{
      if(type==='desafio')state.quiz=data;
      else state.applause=data||[];
      slot.error=false;
    }).catch(()=>{slot.error=true}).finally(()=>{
      slot.pending=false;
      slot.retryAt=performance.now()+(type==='desafio'?2500:10000);
      if(root.isConnected)paint(root,state);
    });
  }
}
function remainingForRotation(root){
  if(!root?.querySelector('[data-tv-social="desafio"]'))return 0;
  const snapshot=view.get(root)?.quiz;
  if(snapshot?.automatic||snapshot?.round?.esperando)return 2500;
  return snapshot?.round?Math.max(0,timeLeft(snapshot)+12000):0;
}
function dialog(container,title,body){
  const node=document.createElement('dialog');
  node.className='tv-social-dialog';
  node.dataset.tvSocialDialog='';
  node.setAttribute('aria-label',title);
  node.innerHTML=`<header><div><small>STAINHER APP · PAUSA DE OFICINA</small><h2>${esc(title)}</h2></div><button type="button" data-social-close aria-label="Cerrar">✕</button></header>${body}`;
  container.append(node);
  node.querySelector('[data-social-close]').onclick=()=>node.close();
  node.addEventListener('close',()=>node.remove(),{once:true});
  node.showModal();
  return node;
}
async function submit(form,action){
  const button=form.querySelector('[type="submit"]'),status=form.querySelector('[data-social-submit-status]')||form.querySelector('[role="status"]');
  if(button.disabled)return;
  button.disabled=true;
  status.textContent='';
  try{await action(new FormData(form),status)}
  catch(error){status.textContent=error.message||'No se pudo completar. Intenta nuevamente.'}
  finally{if(button.isConnected)button.disabled=false}
}
function manage(root,onStart){
  if(!admin()||root.querySelector('[data-tv-social-dialog]'))return;
  const node=dialog(root,'Gestionar dinámicas',`
    <div class="tv-social-manage">
      <form data-social-start><h3>🧩 Desafío de sobremesa</h3>
        <div class="tv-social-actions"><button type="button" data-social-auto disabled>Iniciar juego automático</button></div>
        <p data-social-mode-status role="status">Consultando modo de juego…</p>
        <label>Banco de preguntas<select name="banco" disabled><option value="">Elige una pregunta de prueba</option></select></label>
        <label>Categoría<select name="categoria">${Object.entries(CATEGORIES).map(([key,label])=>`<option value="${key}">${label}</option>`).join('')}</select></label>
        <label>Pregunta<textarea name="pregunta" required maxlength="180" rows="2"></textarea></label>
        ${LETTERS.map((letter,i)=>`<label>Alternativa ${letter}<input name="opcion${i+1}" required maxlength="70"></label>`).join('')}
        <div class="tv-social-fields"><label>Respuesta correcta<select name="correcta">${LETTERS.map((l,i)=>`<option value="${i+1}">${l}</option>`).join('')}</select></label>
        <label>Duración<select name="segundos"><option value="60">1 minuto</option><option value="90" selected>1 minuto y medio</option><option value="120">2 minutos</option></select></label></div>
        <label>Explicación al cierre <span>(opcional)</span><textarea name="explicacion" maxlength="250" rows="2"></textarea></label>
        <div class="tv-social-actions"><button type="button" data-social-example>Cargar un ejemplo</button><button type="submit">Iniciar en la TV</button></div><p data-social-submit-status role="status"></p>
      </form>
      <section aria-label="Moderación de aplausos"><h3>🙌 Moderar aplausos</h3><p>Aprueba los mensajes que pueden aparecer en la TV o retira los que ya estén publicados.</p>
      <button type="button" data-social-refresh>Actualizar bandeja</button><p data-social-review-status role="status"></p><div data-social-review></div></section>
    </div>`);
  const form=node.querySelector('form');
  const modeButton=form.querySelector('[data-social-auto]'),modeStatus=form.querySelector('[data-social-mode-status]');
  const bankSelect=form.elements.banco;
  let bank=[],automatic=false;
  function loadQuestion(question){
    form.elements.categoria.value=question.categoria;
    form.elements.pregunta.value=question.pregunta;
    question.opciones.forEach((option,i)=>form.elements[`opcion${i+1}`].value=option);
    form.elements.correcta.value=String(question.correcta);
    form.elements.explicacion.value=question.explicacion;
  }
  bankSelect.onchange=()=>{
    const question=bank.find(entry=>String(entry.id)===bankSelect.value);
    if(question)loadQuestion(question);
  };
  form.querySelector('[data-social-example]').onclick=()=>loadQuestion({
    categoria:'palabras',pregunta:'¿Qué palabra de cinco letras se lee igual de izquierda a derecha que de derecha a izquierda?',
    opciones:['Radar','Reloj','Radio'],correcta:1,explicacion:'RADAR es un palíndromo. Se lee igual en ambos sentidos.'
  });
  function refreshRound(){
    const state=view.get(root);
    if(state)state.desafio.retryAt=0;
    node.close();
    onStart();
  }
  round().then(snapshot=>{
    automatic=snapshot.automatic;
    modeButton.textContent=automatic?'Detener juego automático':'Iniciar juego automático';
    modeButton.disabled=false;
    modeStatus.textContent=automatic?'Juego automático en curso.':'El cronómetro empieza con la primera respuesta.';
  }).catch(error=>{modeStatus.textContent=error.message||'No se pudo consultar el juego.'});
  request(client().rpc('tv_social_banco')).then(data=>{
    bank=data||[];
    for(const question of bank)bankSelect.add(new Option(`${CATEGORIES[question.categoria]} · ${question.pregunta}`,question.id));
    bankSelect.disabled=!bank.length;
  }).catch(()=>{bankSelect.options[0].textContent='Banco temporalmente no disponible'});
  modeButton.onclick=async()=>{
    modeButton.disabled=true;
    try{
      await request(client().rpc('tv_social_modo',{activar:!automatic,duracion:Number(form.elements.segundos.value)}));
      refreshRound();
    }catch(error){modeStatus.textContent=error.message||'No se pudo cambiar el modo.'}
    finally{modeButton.disabled=false}
  };
  form.onsubmit=event=>{
    event.preventDefault();
    void submit(form,async fields=>{
      const options=LETTERS.map((_,i)=>String(fields.get(`opcion${i+1}`)).trim());
      const question=String(fields.get('pregunta')).trim();
      if(!question||options.some(option=>!option)||new Set(options.map(option=>option.toLowerCase())).size!==3)
        throw new Error('Escribe una pregunta y tres alternativas distintas.');
      await request(client().rpc('tv_social_iniciar',{
        pregunta:question,categoria:fields.get('categoria'),opciones:options,correcta:Number(fields.get('correcta')),
        explicacion:String(fields.get('explicacion')).trim(),segundos:Number(fields.get('segundos'))
      }));
      refreshRound();
    });
  };
  const list=node.querySelector('[data-social-review]'),status=node.querySelector('[data-social-review-status]');
  const refresh=node.querySelector('[data-social-refresh]');
  async function review(){
    refresh.disabled=true;
    try{
      const groups=await Promise.all(['pendiente','publicado'].map(estado=>request(client().from(APPLAUSE_TABLE)
        .select(APPLAUSE_COLUMNS).eq('estado',estado).order('creado_at',{ascending:false}).limit(20))));
      list.innerHTML=groups.map((rows,i)=>`<h4>${i?'Publicados':'Por aprobar'}</h4>`+(rows?.length?rows.map(row=>`
        <article><b>Para ${esc(row.destinatario)}</b><p>${esc(row.mensaje)}</p><div class="tv-social-actions">
        ${i?'':`<button type="button" data-social-decision="publicado" data-id="${esc(row.id)}" data-state="pendiente">Publicar</button>`}
        <button type="button" data-social-decision="retirado" data-id="${esc(row.id)}" data-state="${i?'publicado':'pendiente'}">${i?'Retirar':'Descartar'}</button>
        </div></article>`).join(''):'<p>Sin mensajes.</p>')).join('');
    }catch(error){status.textContent=error.message||'No se pudo cargar la bandeja.'}
    finally{refresh.disabled=false}
  }
  refresh.onclick=()=>void review();
  list.onclick=async event=>{
    const button=event.target.closest('[data-social-decision]');
    if(!button||button.disabled)return;
    button.disabled=true;
    try{
      const rows=await request(client().from(APPLAUSE_TABLE).update({estado:button.dataset.socialDecision})
        .eq('id',button.dataset.id).eq('estado',button.dataset.state).select('id'));
      status.textContent=rows.length?'Bandeja actualizada.':'El mensaje ya fue revisado en otra sesión.';
      const state=view.get(root);
      if(state)state.aplausos.retryAt=0;
      tick(root);
      await review();
    }catch(error){status.textContent=error.message||'No se pudo actualizar el mensaje.'}
    finally{button.disabled=false}
  };
  void review();
}
function participantQuiz(node){
  const content=node.querySelector('[data-social-participant]');
  let snapshot=null,key='',pending=false,answered=null;
  async function load(){
    if(pending||!node.open)return;
    pending=true;
    try{
      const next=await round(),r=next.round;
      if(r&&r.id!==snapshot?.round?.id){
        const vote=await request(client().from(ANSWERS_TABLE).select('opcion').eq('desafio_id',r.id).maybeSingle());
        answered=vote?.opcion??null;
      }
      if(node.open){
        node.querySelector('[data-social-connection]').textContent='';
        snapshot=next;paintQuiz();
      }
    }catch(error){node.querySelector('[data-social-connection]').textContent=error.message||'No se pudo consultar el desafío.'}
    finally{pending=false}
  }
  function paintQuiz(){
    const r=snapshot?.round,open=isOpen(snapshot);
    const nextKey=JSON.stringify([r?.id,r?.correcta,answered,open,snapshot?.score]);
    if(key!==nextKey){
      key=nextKey;
      content.innerHTML=roundMarkup(snapshot);
      if(r&&open&&!answered){
        const options=content.querySelector('.tv-social-options');
        options.outerHTML=`<form data-social-answer><fieldset><legend>Elige una alternativa</legend>${r.opciones.map((option,i)=>`
          <label class="tv-social-choice"><input type="radio" name="opcion" value="${i+1}" required> ${LETTERS[i]}. ${esc(option)}</label>`).join('')}</fieldset>
          <button type="submit">Enviar respuesta</button><p role="status"></p></form>`;
        const form=content.querySelector('form');
        form.onsubmit=event=>{
          event.preventDefault();
          void submit(form,async fields=>{
            if(!isOpen(snapshot)||snapshot.round.id!==r.id)throw new Error('El desafío terminó.');
            const option=Number(fields.get('opcion'));
            try{await request(client().from(ANSWERS_TABLE).insert({desafio_id:r.id,opcion:option}))}
            catch(error){if(error.code!=='23505')throw error}
            if(snapshot.round.id!==r.id)return;
            answered=option;
            paintQuiz();
            void load();
          });
        };
      }else if(answered&&r){
        const note=document.createElement('p');
        note.className='tv-social-tag';
        note.textContent='Tu respuesta quedó registrada.';
        content.append(note);
      }
    }
    const timer=content.querySelector('[data-social-countdown]');
    if(timer)timer.textContent=timerText(snapshot);
  }
  const clock=setInterval(()=>{if(snapshot)paintQuiz()},1000);
  const poll=setInterval(load,3500);
  node.addEventListener('close',()=>{clearInterval(clock);clearInterval(poll)},{once:true});
  void load();
}
function participantApplause(node){
  const content=node.querySelector('[data-social-participant]');
  content.innerHTML=`<p>Un detalle, una buena idea o una ayuda que quieras agradecer. Administración revisará tu mensaje antes de que salga en la TV.</p>
    <form><label>¿A quién va dirigido?<input name="destinatario" maxlength="60" required placeholder="Nombre o equipo"></label>
    <label>Tu agradecimiento<textarea name="mensaje" maxlength="200" rows="4" required></textarea></label>
    <button type="submit">Enviar aplauso</button><p role="status"></p></form>`;
  const form=content.querySelector('form');
  let submitted=null;
  form.onsubmit=event=>{
    event.preventDefault();
    void submit(form,async (fields,status)=>{
      const destinatario=String(fields.get('destinatario')).trim(),mensaje=String(fields.get('mensaje')).trim();
      if(!destinatario||!mensaje)throw new Error('Completa el nombre y el mensaje.');
      if(submitted?.destinatario!==destinatario||submitted?.mensaje!==mensaje)submitted={id:crypto.randomUUID(),destinatario,mensaje};
      try{await request(client().from(APPLAUSE_TABLE).insert(submitted))}
      catch(error){if(error.code!=='23505')throw error}
      submitted=null;
      form.reset();
      status.textContent='Aplauso enviado para revisión.';
    });
  };
}
function installParticipant(){
  const url=new URL(location.href),type=url.searchParams.get('mural');
  if(participant||!Object.hasOwn(TITLES,type)||!active()||profile()?.debe_cambiar_password||document.querySelector('#modalRoot .modal'))return;
  participant=dialog(document.body,TITLES[type],'<p data-social-connection role="status"></p><section data-social-participant>Cargando…</section>');
  participant.addEventListener('close',()=>{
    participant=null;
    const current=new URL(location.href);
    current.searchParams.delete('mural');
    history.replaceState(history.state,'',current);
  },{once:true});
  if(type==='desafio')participantQuiz(participant);
  else participantApplause(participant);
}
window.StainherTVSocial=Object.freeze({tick,remainingForRotation,manage,installParticipant,closeParticipant:()=>participant?.close()});
})();
