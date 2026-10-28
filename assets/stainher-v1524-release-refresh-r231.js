/* Stainher V15.24 R231 · revisión automática al reabrir la app instalada.
 * No modifica datos, credenciales ni programación del usuario. */
(()=>{
  'use strict';
  if(window.__STAINHER_RELEASE_REFRESH_R231__)return;
  window.__STAINHER_RELEASE_REFRESH_R231__=true;
  const CURRENT='R301';
  const BASE=new URL('../release.json',document.currentScript?.src||document.baseURI);
  let lastCheck=0,working=false;
  async function check(){
    const now=Date.now();
    if(working||now-lastCheck<30000||!navigator.onLine)return;
    if(document.querySelector('#modalRoot .modal,#modalRoot .modal-bg'))return;
    working=true;lastCheck=now;
    try{
      const uri=new URL(BASE.href);
      uri.searchParams.set('_',String(now));
      const response=await fetch(uri.href,{cache:'no-store',credentials:'same-origin'});
      if(!response.ok)return;
      const release=await response.json();
      const next=String(release?.revision||'');
      if(!/^R\d{2,4}$/.test(next))return;
      const currentNumber=Number(CURRENT.slice(1)),nextNumber=Number(next.slice(1));
      if(!Number.isFinite(nextNumber)||nextNumber<=currentNumber)return;
      const target=new URL(location.href);
      if(target.searchParams.get('app_rev')===next)return;
      target.searchParams.set('app_rev',next);
      location.replace(target.href);
    }catch(error){console.debug('[Stainher release check]',error)}
    finally{working=false}
  }
  window.addEventListener('pageshow',check);
  document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});
  window.addEventListener('focus',check);
  window.addEventListener('online',check);
  setTimeout(check,0);
  setInterval(check,300000);
})();
