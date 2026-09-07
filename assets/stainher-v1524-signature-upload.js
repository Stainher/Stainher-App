/* Stainher App V15.24 · carga de firma desde imagen.
 * Complementa la firma dibujada sin cambiar los flujos de aprobación existentes.
 */
(function installSignatureUpload(){
  if(window.__STAINHER_V1524_SIGNATURE_UPLOAD__)return;
  window.__STAINHER_V1524_SIGNATURE_UPLOAD__=true;

  function mountStyle(){
    if(document.getElementById('stainher-v1524-signature-upload-style'))return;
    const style=document.createElement('style');
    style.id='stainher-v1524-signature-upload-style';
    style.textContent=`
      .v1524-signature-upload{display:flex;flex-wrap:wrap;align-items:center;gap:8px;margin-top:8px}
      .v1524-signature-upload-label{display:inline-flex;align-items:center;justify-content:center;min-height:38px;padding:8px 12px;border:1px solid var(--line);border-radius:9px;background:var(--panel2);color:var(--text);font:inherit;font-weight:400;cursor:pointer}
      .v1524-signature-upload-label:hover{border-color:var(--blue)}
      .v1524-signature-upload input[type="file"]{position:absolute!important;width:1px!important;height:1px!important;opacity:0!important;pointer-events:none!important}
      .v1524-signature-upload-note{color:var(--muted);font-size:10px;font-weight:400}
      .v1524-signature-save{display:inline-flex;align-items:center;gap:6px;color:var(--muted);font-size:10px;font-weight:400}
      .v1524-profile-signature{display:grid;gap:10px;margin:10px 0 0!important}
      .v1524-profile-signature-preview{display:flex;align-items:center;justify-content:center;min-height:112px;border:1px dashed var(--line);border-radius:10px;background-color:#fff;background-image:linear-gradient(45deg,#eef1f4 25%,transparent 25%),linear-gradient(-45deg,#eef1f4 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#eef1f4 75%),linear-gradient(-45deg,transparent 75%,#eef1f4 75%);background-size:20px 20px;background-position:0 0,0 10px,10px -10px,-10px 0}
      .v1524-profile-signature-preview img{display:block;max-width:92%;max-height:96px;object-fit:contain}
      .v1524-profile-signature-actions{display:flex;gap:8px;flex-wrap:wrap}
      .v1524-profile-signature-actions .btn{flex:1 1 160px}
      [data-theme="light"] .v1524-signature-upload-label{background:#eef3f8;color:#182230;border-color:#c7d1dd}
    `;
    document.head.appendChild(style);
  }

  function markSigned(canvas){
    const id=canvas.id;
    canvas.dataset.signatureUploaded='1';
    try{if(typeof V12_SIG!=='undefined'&&id)V12_SIG[id]=true}catch(_){ }
    const state=(id?document.getElementById(id+'_state'):null)||canvas.parentElement?.querySelector?.('.v154-signature-state');
    if(state){state.textContent='Firma cargada';state.classList.add('ok')}
    canvas.dispatchEvent(new CustomEvent('stainher:signature-loaded',{bubbles:true,detail:{canvasId:id}}));
  }

  function drawImage(canvas,image){
    const ctx=canvas.getContext('2d');
    if(!ctx)throw new Error('El área de firma no está disponible.');
    const cw=canvas.width,ch=canvas.height,scale=Math.min((cw-28)/image.width,(ch-22)/image.height);
    const width=image.width*scale,height=image.height*scale,x=(cw-width)/2,y=(ch-height)/2;
    ctx.clearRect(0,0,cw,ch);
    ctx.drawImage(image,x,y,width,height);
    markSigned(canvas);
  }

  function hasTransparency(image){
    const probe=document.createElement('canvas'),limit=420,scale=Math.min(1,limit/Math.max(image.width,image.height));
    probe.width=Math.max(1,Math.round(image.width*scale));probe.height=Math.max(1,Math.round(image.height*scale));
    const ctx=probe.getContext('2d',{willReadFrequently:true});ctx.clearRect(0,0,probe.width,probe.height);ctx.drawImage(image,0,0,probe.width,probe.height);
    const pixels=ctx.getImageData(0,0,probe.width,probe.height).data;
    for(let index=3;index<pixels.length;index+=4)if(pixels[index]<250)return true;
    return false;
  }

  async function currentUserId(){
    const known=window.state?.session?.user?.id;if(known)return known;
    const result=await window.sb?.auth?.getUser?.();return result?.data?.user?.id||null;
  }
  async function savedSignature(){
    const uid=await currentUserId();if(!uid||!window.sb)return null;
    const result=await window.sb.from('firmas_usuario_v1524').select('imagen_png').eq('user_id',uid).maybeSingle();
    if(result.error)return null;
    return String(result.data?.imagen_png||'')||null;
  }
  async function saveSignature(canvas){
    const uid=await currentUserId();if(!uid||!window.sb)throw new Error('No se pudo identificar al usuario.');
    const imagen_png=canvas.toDataURL('image/png');
    const result=await window.sb.from('firmas_usuario_v1524').upsert({user_id:uid,imagen_png,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(result.error)throw result.error;
    window.__STAINHER_SAVED_SIGNATURE__=imagen_png;
    document.querySelectorAll('.v1524-use-saved-signature').forEach(button=>button.disabled=false);
  }

  async function removeSignature(){
    const uid=await currentUserId();if(!uid||!window.sb)throw new Error('No se pudo identificar al usuario.');
    const result=await window.sb.from('firmas_usuario_v1524').delete().eq('user_id',uid);
    if(result.error)throw result.error;
    window.__STAINHER_SAVED_SIGNATURE__=null;
    document.querySelectorAll('.v1524-use-saved-signature').forEach(button=>button.disabled=true);
  }

  function imageFromFile(file){
    return new Promise((resolve,reject)=>{
      if(!file)return reject(new Error('Selecciona una firma.'));
      if(!/^image\/png$/i.test(file.type||'')&&!/\.png$/i.test(file.name||''))return reject(new Error('Selecciona una firma en formato PNG transparente.'));
      if(file.size>5*1024*1024)return reject(new Error('La imagen de firma no debe superar 5 MB.'));
      const reader=new FileReader();reader.onerror=()=>reject(new Error('No se pudo leer la imagen de firma.'));
      reader.onload=()=>{const image=new Image();image.onerror=()=>reject(new Error('La imagen de firma no es válida.'));image.onload=()=>resolve(image);image.src=String(reader.result||'')};reader.readAsDataURL(file);
    });
  }

  async function mountAccountSignature(){
    const modal=document.querySelector('#modalRoot .modal');if(!modal||modal.querySelector('#v1524ProfileSignature'))return;
    if(!/^mi cuenta$/i.test(String(modal.querySelector('h3')?.textContent||'').trim()))return;
    const profile=modal.querySelector('.panel');if(!profile)return;
    const card=document.createElement('section');card.id='v1524ProfileSignature';card.className='panel v1524-profile-signature';
    card.innerHTML='<div><h4 style="margin:0 0 4px">Firma personal</h4><div class="muted">Guarda una firma PNG transparente para utilizarla en solicitudes y aprobaciones.</div></div><div class="v1524-profile-signature-preview"><span class="muted">Buscando firma guardada…</span></div><div class="v1524-profile-signature-actions"><label class="btn primary" style="cursor:pointer;text-align:center">Cargar o reemplazar PNG<input type="file" accept="image/png,.png" hidden></label><button type="button" class="btn danger-btn" data-remove-signature disabled>Eliminar firma</button></div><small class="muted">La imagen debe contener transparencia. Se ajustará automáticamente al espacio de firma.</small>';
    profile.insertAdjacentElement('afterend',card);
    const preview=card.querySelector('.v1524-profile-signature-preview'),input=card.querySelector('input'),remove=card.querySelector('[data-remove-signature]');
    const show=data=>{preview.innerHTML=data?`<img alt="Firma personal guardada" src="${data}">`:'<span class="muted">No tienes una firma guardada.</span>';remove.disabled=!data};
    const saved=window.__STAINHER_SAVED_SIGNATURE__||await savedSignature();if(!card.isConnected)return;if(saved)window.__STAINHER_SAVED_SIGNATURE__=saved;show(saved);
    input.addEventListener('change',async()=>{try{const image=await imageFromFile(input.files?.[0]);if(!hasTransparency(image))throw new Error('El PNG debe tener fondo transparente.');const canvas=document.createElement('canvas');canvas.width=1000;canvas.height=220;drawImage(canvas,image);await saveSignature(canvas);show(window.__STAINHER_SAVED_SIGNATURE__);window.toast?.('Firma guardada en tu perfil.','success')}catch(error){window.toast?.(error.message||String(error),'error')}finally{input.value=''}});
    remove.addEventListener('click',async()=>{if(!confirm('¿Eliminar la firma guardada de tu perfil?'))return;try{await removeSignature();show(null);window.toast?.('Firma eliminada del perfil.','success')}catch(error){window.toast?.(error.message||String(error),'error')}});
  }

  function loadFile(canvas,file,input){
    if(!file)return;
    if(!/^image\/png$/i.test(file.type||'')&&!/\.png$/i.test(file.name||'')){input.value='';return window.toast?.('Selecciona una firma en formato PNG transparente.','error')}
    if(file.size>5*1024*1024){input.value='';return window.toast?.('La imagen de firma no debe superar 5 MB.','error')}
    const reader=new FileReader();
    reader.onerror=()=>window.toast?.('No se pudo leer la imagen de firma.','error');
    reader.onload=()=>{const image=new Image();image.onerror=()=>window.toast?.('La imagen de firma no es válida.','error');image.onload=async()=>{try{if(!hasTransparency(image))throw new Error('El PNG debe tener fondo transparente.');drawImage(canvas,image);const save=input.closest('.v1524-signature-upload')?.querySelector('[data-save-signature]')?.checked;if(save)await saveSignature(canvas);window.toast?.(save?'Firma cargada y guardada en tu perfil.':'Firma cargada correctamente.','success')}catch(error){input.value='';window.toast?.(error.message||String(error),'error')}};image.src=String(reader.result||'')};
    reader.readAsDataURL(file);
  }

  function enhance(canvas){
    if(!canvas||canvas.dataset.signatureUploadReady==='1')return;
    canvas.dataset.signatureUploadReady='1';
    const controls=document.createElement('div');
    controls.className='v1524-signature-upload';
    controls.innerHTML='<button type="button" class="v1524-signature-upload-label v1524-use-saved-signature" disabled>Usar firma guardada</button><label class="v1524-signature-upload-label">Cargar firma PNG<input type="file" accept="image/png,.png" aria-label="Cargar firma PNG transparente"></label><label class="v1524-signature-save"><input type="checkbox" data-save-signature>Guardar en mi perfil</label><span class="v1524-signature-upload-note">PNG transparente · máximo 5 MB</span>';
    const input=controls.querySelector('input');
    input.addEventListener('change',()=>loadFile(canvas,input.files?.[0],input));
    const savedButton=controls.querySelector('.v1524-use-saved-signature');
    savedButton.addEventListener('click',async()=>{try{const data=window.__STAINHER_SAVED_SIGNATURE__||await savedSignature();if(!data)throw new Error('Aún no tienes una firma guardada.');const image=new Image();image.onload=()=>{drawImage(canvas,image);window.toast?.('Firma guardada aplicada.','success')};image.src=data}catch(error){window.toast?.(error.message||String(error),'error')}});
    canvas.insertAdjacentElement('afterend',controls);
    savedSignature().then(data=>{if(data){window.__STAINHER_SAVED_SIGNATURE__=data;savedButton.disabled=false}});
  }

  function scan(root=document){
    root.querySelectorAll?.('canvas.v12-signature,canvas[id*="Sig"],canvas[id*="firma" i]').forEach(enhance);
  }

  function installAccount(){
    const base=window.v157OpenAccount;if(typeof base!=='function'||base.__stainherSignatureProfile)return;
    const wrapped=function(){const result=base.apply(this,arguments);Promise.resolve(result).finally(()=>mountAccountSignature().catch(error=>console.warn('[Firma de perfil]',error)));return result};
    wrapped.__stainherSignatureProfile=true;wrapped.__base=base;window.v157OpenAccount=wrapped;
  }

  mountStyle();scan();installAccount();
  window.addEventListener('stainher:modules-ready',installAccount);
  document.addEventListener('click',event=>{if(event.target?.closest?.('[onclick*="v157OpenAccount"]'))setTimeout(()=>mountAccountSignature().catch(error=>console.warn('[Firma de perfil]',error)),0)},true);
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1){if(node.matches?.('canvas.v12-signature,canvas[id*="Sig"],canvas[id*="firma" i]'))enhance(node);scan(node);if(node.matches?.('#modalRoot,.modal')||node.querySelector?.('#modalRoot .modal,.modal'))mountAccountSignature().catch(error=>console.warn('[Firma de perfil]',error))}}))).observe(document.documentElement,{childList:true,subtree:true});
})();
