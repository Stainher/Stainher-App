/* R318: verified in-place HTML update, no automatic reload. Never auto-reload or modify auth/cache. */
(()=>{
'use strict';
if(window.__STAINHER_RELEASE_NOTICE_R311__)return;
window.__STAINHER_RELEASE_NOTICE_R311__=true;
const root=new URL('../release.json',document.currentScript?.src||document.baseURI);
const number=v=>Number(String(v||'').match(/^R(\d+)$/)?.[1]||0);
let busy=false,dismissed='';
function show(revision){
 if(dismissed===revision||document.getElementById('stainher-release-notice'))return;
 const bar=document.createElement('div');bar.id='stainher-release-notice';
 bar.setAttribute('role','status');
 bar.style.cssText='position:fixed;right:16px;bottom:16px;z-index:2147483640;max-width:350px;padding:14px;background:#143758;color:#fff;border-radius:12px;box-shadow:0 4px 18px #0004;font:14px system-ui';
 const label=document.createElement('div');
 label.textContent='Nueva versión '+revision+' disponible. Guarda tu trabajo antes de actualizar.';
 const yes=document.createElement('button');yes.type='button';yes.textContent='Actualizar ahora';
 yes.style.cssText='padding:8px;margin:10px 8px 0 0;border:0;border-radius:6px;cursor:pointer';
 yes.onclick=async()=>{
   yes.disabled=true;yes.textContent='Comprobando versión…';
   try{
     const url=new URL('index.html',root);
     url.searchParams.set('verify',String(Date.now()));
     const response=await fetch(url.href,{cache:'no-store',credentials:'same-origin',redirect:'follow'});
     if(!response.ok)throw new Error('HTTP '+response.status);
     const html=await response.text();
     const live=(new DOMParser().parseFromString(html,'text/html').title.match(/R[0-9]{2,4}/)||[])[0]||'';
     if(number(live)<number(revision))throw new Error('El servidor entrega '+(live||'una versión desconocida')+' en lugar de '+revision);
     yes.textContent='Abriendo '+live+'…';
     // Escritura del HTML verificado evita que la navegación reabra index.html cacheado.
     // La sesión sigue en el mismo origen; no se eliminan tokens ni datos locales.
     document.open('text/html','replace');
     document.write(html);
     document.close();
   }catch(error){
     yes.disabled=false;yes.textContent='Reintentar actualización';
     label.textContent='No se pudo cargar la versión nueva: '+String(error.message||error)+'. Se conserva tu pantalla y sesión.';
     console.error('[Stainher update verification]',error);
   }
 };
 const no=document.createElement('button');no.type='button';no.textContent='Más tarde';
 no.style.cssText='padding:8px;border:1px solid white;border-radius:6px;background:transparent;color:white;cursor:pointer';
 no.onclick=()=>{dismissed=revision;bar.remove()};
 bar.append(label,yes,no);document.body.append(bar);
}
async function check(){
 if(busy||!navigator.onLine)return;busy=true;
 try{
  const url=new URL(root);url.searchParams.set('_',String(Date.now()));
  const response=await fetch(url,{cache:'no-store',credentials:'same-origin'});
  if(!response.ok)return;
  const data=await response.json();
  const current=document.title.match(/R\d{2,4}/)?.[0]||'R311';
  if(number(data.revision)>number(current))show(data.revision);
 }catch(e){console.debug('[Stainher version check]',e)}
 finally{busy=false}
}
window.addEventListener('pageshow',check);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
setTimeout(check,1500);
setInterval(check,300000);
})();