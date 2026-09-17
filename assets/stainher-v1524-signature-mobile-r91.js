/* Stainher V15.24 · R91 · firma móvil ampliable y firma guardada optimizada. */
(()=>{
  'use strict';
  if(window.__STAINHER_SIGNATURE_MOBILE_R91__)return;
  window.__STAINHER_SIGNATURE_MOBILE_R91__=true;

  const STYLE_ID='stainher-signature-mobile-r91-style';
  if(!document.getElementById(STYLE_ID)){
    const style=document.createElement('style');style.id=STYLE_ID;style.textContent=`
      .v1524-profile-signature-preview{min-height:210px!important;overflow:hidden!important}
      .v1524-profile-signature-preview img{width:100%!important;height:188px!important;max-width:none!important;max-height:none!important;object-fit:contain!important;transform:scale(1.12);transform-origin:center}
      .v1591-sign-size-row{display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin-top:8px}
      .v1591-sign-size-row .btn{flex:1 1 210px}
      .v1591-expand-hint{display:none;color:var(--muted);font-size:12px;margin-top:4px}
      .v1591-close-expanded{display:none}
      @media(max-width:900px){
        .v1590-sign-pad canvas{height:210px!important;min-height:210px!important}
        .v1591-expand-hint{display:block}
        .v1590-sign-pad.v1591-expanded{position:fixed!important;inset:0!important;z-index:100000!important;background:var(--bg,#081019)!important;padding:18px!important;margin:0!important;overflow:auto!important;display:flex!important;flex-direction:column!important;justify-content:center!important}
        .v1590-sign-pad.v1591-expanded canvas{height:min(56vh,520px)!important;min-height:340px!important;border-width:2px!important}
        .v1590-sign-pad.v1591-expanded .v1591-expand-hint{display:none}
        .v1590-sign-pad.v1591-expanded .v1591-close-expanded{display:inline-flex}
        body.v1591-signature-open{overflow:hidden!important;touch-action:none!important}
      }
    `;document.head.appendChild(style);
  }

  async function currentUserId(){
    const known=window.state?.session?.user?.id;if(known)return known;
    const r=await window.sb?.auth?.getUser?.();return r?.data?.user?.id||null;
  }

  async function getSaved(){
    if(window.__STAINHER_SAVED_SIGNATURE__)return window.__STAINHER_SAVED_SIGNATURE__;
    const userId=await currentUserId();if(!userId||!window.sb)return null;
    const q=await window.sb.from('firmas_usuario_v1524').select('imagen_png').eq('user_id',userId).maybeSingle();
    if(q.error)throw q.error;
    const data=String(q.data?.imagen_png||'')||null;if(data)window.__STAINHER_SAVED_SIGNATURE__=data;return data;
  }

  function imageFromData(data){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('No se pudo leer la firma guardada.'));img.src=data})}

  function visibleBounds(canvas){
    const ctx=canvas.getContext('2d',{willReadFrequently:true});if(!ctx)return null;
    const {width:w,height:h}=canvas,p=ctx.getImageData(0,0,w,h).data;let l=w,t=h,r=-1,b=-1;
    for(let y=0;y<h;y++)for(let x=0;x<w;x++){
      const i=(y*w+x)*4,a=p[i+3],ink=a>8&&(a<245||p[i]<245||p[i+1]<245||p[i+2]<245);if(!ink)continue;
      if(x<l)l=x;if(x>r)r=x;if(y<t)t=y;if(y>b)b=y;
    }
    return r<l||b<t?null:{x:l,y:t,w:r-l+1,h:b-t+1};
  }

  async function optimizeSaved(){
    const data=await getSaved();if(!data)throw new Error('Aún no tienes una firma guardada.');
    const img=await imageFromData(data),src=document.createElement('canvas');src.width=img.naturalWidth||img.width;src.height=img.naturalHeight||img.height;src.getContext('2d').drawImage(img,0,0);
    const box=visibleBounds(src);if(!box)throw new Error('No se detectó contenido en la firma guardada.');
    const out=document.createElement('canvas');out.width=1400;out.height=360;const ctx=out.getContext('2d');ctx.clearRect(0,0,out.width,out.height);
    const padX=14,padY=10,scale=Math.min((out.width-padX*2)/box.w,(out.height-padY*2)/box.h),dw=box.w*scale,dh=box.h*scale;
    ctx.drawImage(src,box.x,box.y,box.w,box.h,(out.width-dw)/2,(out.height-dh)/2,dw,dh);
    const normalized=out.toDataURL('image/png'),userId=await currentUserId();if(!userId||!window.sb)throw new Error('No se pudo identificar al usuario.');
    const q=await window.sb.from('firmas_usuario_v1524').upsert({user_id:userId,imagen_png:normalized,updated_at:new Date().toISOString()},{onConflict:'user_id'});if(q.error)throw q.error;
    window.__STAINHER_SAVED_SIGNATURE__=normalized;
    document.querySelectorAll('.v1524-profile-signature-preview img').forEach(imgEl=>imgEl.src=normalized);
    window.dispatchEvent(new CustomEvent('stainher:saved-signature-updated',{detail:{userId}}));
    return normalized;
  }

  function closeExpanded(pad){pad?.classList.remove('v1591-expanded');document.body.classList.remove('v1591-signature-open')}
  function expandPad(pad){if(!pad||!matchMedia('(max-width:900px)').matches)return;pad.classList.add('v1591-expanded');document.body.classList.add('v1591-signature-open');setTimeout(()=>pad.querySelector('canvas')?.scrollIntoView({block:'center'}),30)}

  function enhanceAccount(){
    const card=document.getElementById('v1524ProfileSignature');if(!card)return;
    if(!card.querySelector('.v1591-sign-size-row')){
      const actions=card.querySelector('.v1524-profile-signature-actions');if(actions){
        const row=document.createElement('div');row.className='v1591-sign-size-row';row.innerHTML='<button type="button" class="btn" data-v1591-optimize>↗ Aumentar firma guardada</button><small class="muted">Recorta márgenes vacíos y aprovecha mejor el espacio de firma.</small>';actions.insertAdjacentElement('afterend',row);
        row.querySelector('[data-v1591-optimize]').onclick=async()=>{try{const data=await optimizeSaved();const preview=card.querySelector('.v1524-profile-signature-preview');if(preview)preview.innerHTML=`<img alt="Firma personal guardada" src="${data}">`;window.toast?.('Tamaño de firma guardada optimizado.','success')}catch(e){window.toast?.(e.message||String(e),'error')}};
      }
    }
    const pad=card.querySelector('.v1590-sign-pad');if(!pad||pad.dataset.r91==='1')return;pad.dataset.r91='1';
    const canvas=pad.querySelector('canvas');if(!canvas)return;
    const hint=document.createElement('div');hint.className='v1591-expand-hint';hint.textContent='Toca el área de firma para ampliarla en el teléfono.';canvas.insertAdjacentElement('afterend',hint);
    const actions=pad.querySelector('.v1590-sign-actions');if(actions){const close=document.createElement('button');close.type='button';close.className='btn v1591-close-expanded';close.textContent='Cerrar firma ampliada';close.onclick=()=>closeExpanded(pad);actions.appendChild(close)}
    canvas.addEventListener('pointerdown',e=>{if(matchMedia('(max-width:900px)').matches&&!pad.classList.contains('v1591-expanded')){e.preventDefault();e.stopImmediatePropagation();expandPad(pad)}},true);
  }

  function install(){enhanceAccount()}
  install();
  document.addEventListener('click',e=>{if(e.target?.closest?.('[onclick*="v157OpenAccount"]'))setTimeout(install,100)},true);
  const obs=new MutationObserver(records=>{for(const rec of records)for(const n of rec.addedNodes)if(n.nodeType===1&&(n.id==='v1524ProfileSignature'||n.querySelector?.('#v1524ProfileSignature')))setTimeout(install,0)});obs.observe(document.documentElement,{childList:true,subtree:true});
  window.StainherSignatureR91=Object.freeze({install,optimizeSaved,expandPad,closeExpanded});
})();
