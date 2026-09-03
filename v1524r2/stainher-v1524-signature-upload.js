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
      [data-theme="light"] .v1524-signature-upload-label{background:#eef3f8;color:#182230;border-color:#c7d1dd}
    `;
    document.head.appendChild(style);
  }

  function markSigned(canvas){
    const id=canvas.id;
    canvas.dataset.signatureUploaded='1';
    try{if(typeof V12_SIG!=='undefined'&&id)V12_SIG[id]=true}catch(_){ }
    const state=id?document.getElementById(id+'_state'):null;
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

  mountStyle();scan();
  new MutationObserver(records=>records.forEach(record=>record.addedNodes.forEach(node=>{if(node.nodeType===1){if(node.matches?.('canvas.v12-signature,canvas[id*="Sig"],canvas[id*="firma" i]'))enhance(node);scan(node)}}))).observe(document.documentElement,{childList:true,subtree:true});
})();

