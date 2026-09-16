/* Stainher V15.24 · R90 · firma personal ampliada y reutilizable.
 * Complementa signature-upload: cada usuario puede subir PNG o dibujar y guardar.
 * Normaliza/corta márgenes vacíos para que la firma ocupe mejor el área disponible.
 */
(()=>{
  'use strict';
  if(window.__STAINHER_SIGNATURE_PROFILE_R90__)return;
  window.__STAINHER_SIGNATURE_PROFILE_R90__=true;

  const STYLE_ID='stainher-signature-profile-r90-style';
  const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
    .v1524-profile-signature-preview{min-height:170px!important}
    .v1524-profile-signature-preview img{max-width:96%!important;max-height:148px!important}
    canvas.v12-signature,canvas.v11-signature,canvas[id*="Sig"],canvas[id*="firma" i]{min-height:165px!important}
    .v1590-sign-pad{display:grid;gap:9px;margin-top:10px}
    .v1590-sign-pad canvas{display:block;width:100%;height:180px;border:1px solid var(--line);border-radius:10px;background:#fff;touch-action:none;cursor:crosshair}
    .v1590-sign-actions{display:flex;gap:8px;flex-wrap:wrap}
    .v1590-save-current{white-space:nowrap}
  `;document.head.appendChild(style);

  async function uid(){
    const known=window.state?.session?.user?.id;if(known)return known;
    const r=await window.sb?.auth?.getUser?.();return r?.data?.user?.id||null;
  }

  function boundsFromCanvas(source){
    const ctx=source.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
    const {width:w,height:h}=source,data=ctx.getImageData(0,0,w,h).data;
    let l=w,t=h,r=-1,b=-1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=(y*w+x)*4,a=data[i+3],dark=data[i]<245||data[i+1]<245||data[i+2]<245;
      if(a<=8||(!dark&&a>245))continue;
      if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;
    }
    return r<l||b<t?null:{x:l,y:t,w:r-l+1,h:b-t+1};
  }

  function normalizedData(source){
    const box=boundsFromCanvas(source);if(!box)throw new Error('Dibuja tu firma antes de guardarla.');
    const out=document.createElement('canvas');out.width=1200;out.height=320;
    const ctx=out.getContext('2d');ctx.clearRect(0,0,out.width,out.height);
    const padX=36,padY=18,scale=Math.min((out.width-padX*2)/box.w,(out.height-padY*2)/box.h);
    const dw=box.w*scale,dh=box.h*scale,dx=(out.width-dw)/2,dy=(out.height-dh)/2;
    ctx.drawImage(source,box.x,box.y,box.w,box.h,dx,dy,dw,dh);
    return out.toDataURL('image/png');
  }

  async function persistData(data){
    const userId=await uid();if(!userId||!window.sb)throw new Error('No se pudo identificar al usuario.');
    const q=await window.sb.from('firmas_usuario_v1524').upsert({user_id:userId,imagen_png:data,updated_at:new Date().toISOString()},{onConflict:'user_id'});
    if(q.error)throw q.error;
    window.__STAINHER_SAVED_SIGNATURE__=data;
    document.querySelectorAll('.v1524-use-saved-signature').forEach(b=>b.disabled=false);
    window.dispatchEvent(new CustomEvent('stainher:saved-signature-updated',{detail:{userId}}));
    return data;
  }

  async function saveCanvas(canvas){
    const data=normalizedData(canvas);await persistData(data);return data;
  }

  function setupDraw(canvas){
    if(!canvas||canvas.dataset.r90Draw==='1')return;canvas.dataset.r90Draw='1';
    const ctx=canvas.getContext('2d');ctx.strokeStyle='#111827';ctx.lineWidth=Math.max(3,canvas.width/320);ctx.lineCap='round';ctx.lineJoin='round';
    let drawing=false;
    const pos=e=>{const r=canvas.getBoundingClientRect();return{x:(e.clientX-r.left)*canvas.width/r.width,y:(e.clientY-r.top)*canvas.height/r.height}};
    canvas.addEventListener('pointerdown',e=>{drawing=true;canvas.setPointerCapture?.(e.pointerId);const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y);e.preventDefault()});
    canvas.addEventListener('pointermove',e=>{if(!drawing)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke();e.preventDefault()});
    const stop=()=>drawing=false;canvas.addEventListener('pointerup',stop);canvas.addEventListener('pointercancel',stop);canvas.addEventListener('pointerleave',stop);
  }

  function enhanceFormControls(root=document){
    root.querySelectorAll?.('.v1524-signature-upload').forEach(box=>{
      if(box.querySelector('.v1590-save-current'))return;
      const canvas=box.previousElementSibling?.tagName==='CANVAS'?box.previousElementSibling:box.parentElement?.querySelector?.('canvas');if(!canvas)return;
      const b=document.createElement('button');b.type='button';b.className='v1524-signature-upload-label v1590-save-current';b.textContent='Guardar firma actual';
      b.addEventListener('click',async()=>{try{await saveCanvas(canvas);window.toast?.('Firma dibujada guardada en tu perfil.','success')}catch(e){window.toast?.(e.message||String(e),'error')}});
      box.insertBefore(b,box.querySelector('.v1524-signature-upload-note'));
    });
  }

  async function enhanceAccount(){
    const card=document.getElementById('v1524ProfileSignature');if(!card||card.querySelector('.v1590-sign-pad'))return;
    const actions=card.querySelector('.v1524-profile-signature-actions');if(!actions)return;
    const pad=document.createElement('div');pad.className='v1590-sign-pad';pad.innerHTML=`<div><b>O dibuja tu firma</b><div class="muted">Usa mouse, touchpad, dedo o lápiz táctil. La firma se guardará en tu perfil para reutilizarla.</div></div><canvas width="1200" height="320" aria-label="Dibujar firma personal"></canvas><div class="v1590-sign-actions"><button type="button" class="btn" data-clear>Limpiar</button><button type="button" class="btn primary" data-save>Guardar firma dibujada</button></div>`;
    actions.insertAdjacentElement('afterend',pad);const canvas=pad.querySelector('canvas');setupDraw(canvas);
    pad.querySelector('[data-clear]').onclick=()=>canvas.getContext('2d').clearRect(0,0,canvas.width,canvas.height);
    pad.querySelector('[data-save]').onclick=async()=>{try{const data=await saveCanvas(canvas);const preview=card.querySelector('.v1524-profile-signature-preview');if(preview)preview.innerHTML=`<img alt="Firma personal guardada" src="${data}">`;const rm=card.querySelector('[data-remove-signature]');if(rm)rm.disabled=false;window.toast?.('Firma dibujada guardada en tu perfil.','success')}catch(e){window.toast?.(e.message||String(e),'error')}};
  }

  function install(){enhanceFormControls();enhanceAccount().catch(()=>{});}
  install();
  window.addEventListener('stainher:modules-ready',install);
  window.addEventListener('stainher:signature-loaded',e=>enhanceFormControls(e.target?.parentElement||document));
  document.addEventListener('click',e=>{if(e.target?.closest?.('[onclick*="v157OpenAccount"]'))setTimeout(()=>enhanceAccount().catch(()=>{}),80)},true);
  const obs=new MutationObserver(records=>{for(const rec of records)for(const n of rec.addedNodes)if(n.nodeType===1){enhanceFormControls(n);if(n.id==='v1524ProfileSignature'||n.querySelector?.('#v1524ProfileSignature'))enhanceAccount().catch(()=>{})}});
  obs.observe(document.documentElement,{childList:true,subtree:true});
  window.StainherSignatureR90=Object.freeze({install,saveCanvas,normalizedData});
})();
